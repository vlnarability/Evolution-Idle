(function(){
  const DATA=window.EvolutionData, State=window.EvolutionState, state=State.state, L={};

  L.fmt=function(v){
    const n=Math.abs(v||0);
    const digits=n>=100?0:(n>=10?1:(n>=1?2:3));
    return new Intl.NumberFormat("en-US",{maximumFractionDigits:digits,minimumFractionDigits:n>0&&n<10?Math.min(2,digits):0}).format(v||0);
  };
  L.rateText=function(v){
    const value=v||0;
    if(Math.abs(value)<0.005) return "";
    return (value>=0?"+":"")+L.fmt(value)+"/s";
  };
  L.resourceDef=function(id){ return DATA.RESOURCES.find(function(item){ return item.id===id; }); };
  L.resourceName=function(id){ const f=L.resourceDef(id); return f?f.name:id; };
  L.archetypeDef=function(id){ return DATA.ARCHETYPES.find(function(item){ return item.id===id; }); };
  L.archetypeName=function(id){ const f=L.archetypeDef(id); return f?f.name:id; };
  L.archetypeColor=function(id){ const f=L.archetypeDef(id); return f&&f.color?f.color:"#8da5c4"; };
  L.isArchetypeRevealed=function(id){ return !!(id&&state.game.meta.revealedArchetypes&&state.game.meta.revealedArchetypes[id]); };
  L.displayArchetypeName=function(id){ return L.isArchetypeRevealed(id)?L.archetypeName(id):"???"; };
  L.currentStage=function(){ return DATA.STAGES[state.game.run.stageIndex]||DATA.STAGES[0]; };
  L.stageIndexById=function(id){ return DATA.STAGES.findIndex(function(stage){ return stage.id===id; }); };
  L.isFinalStage=function(){ return state.game.run.stageIndex>=DATA.STAGES.length-1; };
  L.unlockDef=function(id){ return (DATA.META_UNLOCKS||[]).find(function(item){ return item.id===id; })||null; };
  L.unlockWins=function(id){ const def=L.unlockDef(id); return def?def.wins:0; };
  L.hasMetaUnlock=function(id){ return state.ui.debug || state.game.meta.galacticWins>=L.unlockWins(id); };
  L.unlockText=function(id){ const def=L.unlockDef(id); return def?("Unlocks after "+def.wins+" Galactic wins: "+def.name):"Locked"; };
  L.systemOwnedCount=function(id){ return ((state.game.run.ownedSystems[id]||{}).count)||0; };
  L.repeatableSystem=function(item){
    const stageId=((state.game.run.ownedSystems[item.id]||{}).stageId)||L.currentStage().id;
    if(["cell","creature"].includes(stageId)) return false;
    const blocked=["Village core","Cities","Administration","Colonies","Galactic core","Victory paths","Megastructures"];
    return blocked.indexOf(item.category)<0;
  };
  L.systemEffectiveCount=function(id){
    const count=L.systemOwnedCount(id);
    if(count<=0) return 0;
    return count*L.generatorMultiplier(count);
  };
  L.decorateOwnedSystem=function(item,owned){
    const count=(owned&&owned.count)||1;
    return Object.assign({},item,{ownedCount:count,effectiveCount:L.repeatableSystem(item)?L.systemEffectiveCount(item.id):count,stageId:owned.stageId||L.currentStage().id});
  };
  L.ownedSystemsForStage=function(){ const stageId=L.currentStage().id; return (L.currentStage().systems||[]).filter(function(item){ return state.game.run.ownedSystems[item.id]&&state.game.run.ownedSystems[item.id].stageId===stageId; }).map(function(item){ return L.decorateOwnedSystem(item,state.game.run.ownedSystems[item.id]); }); };
  L.ownedSystemsAll=function(){
    return Object.keys(state.game.run.ownedSystems||{}).map(function(id){
      const owned=state.game.run.ownedSystems[id]||{};
      const stage=(DATA.STAGES||[]).find(function(row){ return (row.systems||[]).some(function(item){ return item.id===id; }); });
      const item=stage&&(stage.systems||[]).find(function(row){ return row.id===id; });
      return item?L.decorateOwnedSystem(item,owned):null;
    }).filter(Boolean);
  };
  L.ownedTechForStage=function(){ return (L.currentStage().technologies||[]).filter(function(item){ return !!state.game.run.technologies[item.id]; }); };
  L.ownedTechAll=function(){
    return Object.keys(state.game.run.technologies||{}).map(function(id){
      return (DATA.STAGES||[]).flatMap(function(stage){ return stage.technologies||[]; }).find(function(item){ return item.id===id; })||null;
    }).filter(Boolean);
  };
  L.specializationDef=function(){
    const arch=state.game.run.lockedArchetype, id=state.game.run.specialization;
    return ((DATA.SPECIALIZATIONS[arch]||[]).find(function(item){ return item.id===id; }))||null;
  };
  L.chosenLineageEvents=function(){
    const chosen=state.game.run.lineageEvents||{};
    return DATA.LINEAGE_EVENTS.map(function(event){
      const choiceId=chosen[event.id], choice=(event.choices||[]).find(function(item){ return item.id===choiceId; });
      return choice?{id:event.id+":"+choice.id,name:event.name+": "+choice.name,path:"Lineage Event",effects:choice.effects||{}}:null;
    }).filter(Boolean);
  };
  L.artifactSources=function(){ return DATA.ARTIFACTS.filter(function(item){ return !!state.game.meta.artifacts[item.id]; }); };
  L.artifactSetSources=function(){
    return (DATA.ARTIFACT_SETS||[]).filter(function(set){
      return (set.requires||[]).every(function(id){ return !!state.game.meta.artifacts[id]; });
    }).map(function(set){ return Object.assign({path:"Artifact Set"},set); });
  };
  L.artifactEvolutionSources=function(){
    return Object.keys(state.game.meta.artifactEvolutions||{}).map(function(id){
      const evo=(DATA.ARTIFACT_EVOLUTIONS||[]).find(function(item){ return item.id===id; });
      return evo?Object.assign({path:"Artifact Evolution"},evo):null;
    }).filter(Boolean);
  };
  L.artifactFusionSources=function(){
    return (DATA.ARTIFACT_FUSIONS||[]).filter(function(fusion){
      return (fusion.requires||[]).every(function(id){ return !!state.game.meta.artifactEvolutions[id]; });
    }).map(function(fusion){ return Object.assign({path:"Artifact Fusion"},fusion); });
  };
  L.restoredArtifactSources=function(){
    return Object.entries(state.game.meta.restoredArtifacts||{}).map(function(entry){
      const artifact=(DATA.ARTIFACTS||[]).find(function(item){ return item.id===entry[0]; });
      const branch=(DATA.ARTIFACT_RESTORATION_BRANCHES||[]).find(function(item){ return item.id===entry[1]; });
      if(!artifact || !branch) return null;
      return {id:"restored_artifact:"+entry[0],name:artifact.name+" - "+branch.name,path:"Artifact Restoration",effects:branch.effects||{},desc:branch.desc||""};
    }).filter(Boolean);
  };
  L.restorationChainSources=function(){
    return Object.entries(state.game.meta.restorationHistory||{}).map(function(entry){
      const artifact=(DATA.ARTIFACTS||[]).find(function(item){ return item.id===entry[0]; });
      const history=Array.from(new Set(entry[1]||[]));
      if(!artifact || history.length<2) return null;
      return {id:"restoration_chain:"+entry[0],name:artifact.name+" Synthesis",path:"Restoration Chain",desc:"Repeated restorations have produced a blended lineage memory.",effects:{resourceOutput:{science:0.02,unity:0.02,data:0.02}}};
    }).filter(Boolean);
  };
  L.masteryRelicSources=function(){
    return Object.keys(state.game.meta.masteryRelics||{}).filter(function(stageId){
      return state.game.meta.activeRelics[stageId]!==false;
    }).map(function(stageId){
      const relic=(DATA.MASTERY_RELICS||{})[stageId];
      return relic?Object.assign({id:"mastery_relic:"+stageId,path:"Mastery Relic"},relic):null;
    }).filter(Boolean);
  };
  L.toggleMasteryRelic=function(stageId){
    if(!state.game.meta.masteryRelics[stageId]) return false;
    state.game.meta.activeRelics[stageId]=state.game.meta.activeRelics[stageId]===false?true:false;
    return true;
  };
  L.archiveBoostValue=function(){
    const count=Object.keys(state.game.meta.seenContent||{}).length;
    return Math.min(0.35,count*0.0006);
  };
  L.archiveBoostSource=function(){
    const boost=L.archiveBoostValue();
    return boost>0?[{id:"archive_memory",name:"Archive Memory",path:"Codex",effects:{allOutput:boost}}]:[];
  };
  L.archiveMilestoneSources=function(){
    const count=Object.keys(state.game.meta.seenContent||{}).length;
    return (DATA.ARCHIVE_MILESTONES||[]).filter(function(item){ return count>=item.count; }).map(function(item){ return Object.assign({path:"Archive Milestone"},item); });
  };
  L.timelineRecordCount=function(){
    return (state.game.meta.victoryLog||[]).length + (state.game.meta.lineageChronicles||[]).length + Object.keys(state.game.meta.seenContent||{}).length;
  };
  L.timelineMilestoneSources=function(){
    const count=L.timelineRecordCount();
    return (DATA.TIMELINE_MILESTONES||[]).filter(function(item){ return count>=item.count; }).map(function(item){ return Object.assign({path:"Timeline Milestone"},item); });
  };
  L.timelineAnchorSources=function(){
    const favorites=Object.entries(state.game.meta.archiveFavorites||{}).filter(function(entry){ return entry[0].indexOf("archive|")===0; });
    if(!favorites.length) return [];
    return [{id:"timeline_anchor",name:"Timeline Anchors",path:"Archive Anchors",desc:"Pinned archive entries feed future continuity.",effects:{resourceOutput:{cohesion:0.01*favorites.length,data:0.01*Math.min(3,favorites.length)}}}];
  };
  L.threatScarSources=function(){
    return Object.entries(state.game.meta.threatScars||{}).map(function(entry){
      if((state.game.meta.transformedScars||{})[entry[0]]) return null;
      const def=(DATA.THREAT_SCARS||{})[entry[0]];
      if(!def) return null;
      const scale=Math.min(5,entry[1]||1), effects={resourceOutput:{}};
      Object.entries((def.effects||{}).resourceOutput||{}).forEach(function(effect){ effects.resourceOutput[effect[0]]=effect[1]*scale; });
      return {id:"scar:"+entry[0],name:def.name+" x"+scale+(entry[1]>=3?" (Mutated)":""),path:entry[1]>=3?"Mutated Scar":"Threat Scar",mutated:entry[1]>=3,effects:effects};
    }).filter(Boolean);
  };
  L.transformedScarSources=function(){
    return Object.keys(state.game.meta.transformedScars||{}).map(function(id){
      const def=(DATA.SCAR_TRANSFORMS||{})[id];
      return def?Object.assign({path:"Transformed Scar"},def):null;
    }).filter(Boolean);
  };
  L.rivalPersonalitySources=function(){
    return (state.game.run.rivals||[]).map(function(rival){
      const def=(DATA.RIVAL_PERSONALITIES||[]).find(function(item){ return item.id===rival.personality; });
      return def?Object.assign({id:"rival_personality:"+rival.archetype,name:L.displayArchetypeName(rival.archetype)+" "+def.name,path:"Rival Pressure"},def):null;
    }).filter(Boolean);
  };
  L.rivalAscensionSources=function(){
    return (state.game.run.rivals||[]).map(function(rival){
      const def=(DATA.RIVAL_ASCENSION||{})[rival.path];
      return def?Object.assign({id:"rival_path:"+rival.archetype,name:L.displayArchetypeName(rival.archetype)+" "+def.name,path:"Rival Ascension"},def):null;
    }).filter(Boolean);
  };
  L.mutatorSources=function(){
    const stageId=L.currentStage().id, id=(state.game.run.activeMutators||{})[stageId];
    const mutator=(DATA.RUN_MUTATORS||[]).find(function(item){ return item.id===id; });
    return mutator?[Object.assign({path:"Run Mutator"},mutator)]:[];
  };
  L.lineageLawSources=function(){
    return Object.entries(state.game.run.lineageLaws||{}).map(function(entry){
      const law=((DATA.LINEAGE_LAWS||{})[entry[0]]||[]).find(function(item){ return item.id===entry[1]; });
      return law?Object.assign({path:"Lineage Law"},law):null;
    }).filter(Boolean);
  };
  L.doctrineSources=function(){
    const arch=state.game.run.lockedArchetype, id=state.game.run.doctrine;
    const doctrine=((DATA.LINEAGE_DOCTRINES||{})[arch]||[]).find(function(item){ return item.id===id; });
    if(!doctrine) return [];
    const evolved=(state.game.meta.evolvedDoctrines||{})[id], evo=(DATA.DOCTRINE_EVOLUTIONS||{})[id];
    if(evolved && evo){
      const effects={resourceOutput:Object.assign({},(doctrine.effects||{}).resourceOutput||{},(evo.effects||{}).resourceOutput||{})};
      Object.keys(doctrine.effects||{}).forEach(function(key){ if(key!=="resourceOutput") effects[key]=(effects[key]||0)+(doctrine.effects[key]||0); });
      Object.keys(evo.effects||{}).forEach(function(key){ if(key!=="resourceOutput") effects[key]=(effects[key]||0)+(evo.effects[key]||0); });
      return [Object.assign({path:"Doctrine Evolution"},doctrine,{name:evo.name,desc:evo.desc,effects:effects})];
    }
    return [Object.assign({path:"Lineage Doctrine"},doctrine)];
  };
  L.doctrineConflictSources=function(){
    const proposal=(DATA.CONGRESS_PROPOSALS||[]).find(function(item){ return item.id===state.game.run.congressChoice; });
    const doctrine=state.game.run.doctrine;
    if(!proposal || !doctrine) return [];
    return (DATA.DOCTRINE_CONFLICTS||[]).filter(function(item){
      return item.doctrine===doctrine && item.bloc===proposal.bloc;
    }).map(function(item){ return Object.assign({path:"Doctrine and Congress"},item); });
  };
  L.lawCongressSources=function(){
    const chosen=Object.values(state.game.run.lineageLaws||{}), proposal=(DATA.CONGRESS_PROPOSALS||[]).find(function(item){ return item.id===state.game.run.congressChoice; });
    if(!proposal) return [];
    return (DATA.LAW_CONGRESS_RELATIONS||[]).filter(function(item){
      return chosen.includes(item.law) && item.bloc===proposal.bloc;
    }).map(function(item){ return Object.assign({path:"Law and Congress"},item); });
  };
  L.lawSetSources=function(){
    const chosen=Object.values(state.game.run.lineageLaws||{});
    return (DATA.LAW_SETS||[]).filter(function(set){ return (set.requires||[]).every(function(id){ return chosen.includes(id); }); }).map(function(set){ return Object.assign({path:"Law Set"},set); });
  };
  L.worldEventSources=function(){
    const stageId=L.currentStage().id, events=state.game.run.worldEvents[stageId]||{}, choices=state.game.run.worldEventChoices[stageId]||{};
    return Object.entries(events).map(function(entry){
      const slotId=entry[0], id=entry[1], choiceId=choices[slotId];
      const event=L.worldEventDef(id);
      if(!event) return null;
      const choice=(event.choices||[]).find(function(item){ return item.id===choiceId; });
      return choice?Object.assign({id:event.id+":"+choice.id,name:event.name+": "+choice.name,path:"World Event",effects:choice.effects||{}}):null;
    }).filter(Boolean);
  };
  L.worldEventDef=function(id){
    const base=(DATA.WORLD_SLOT_EVENTS||[]).find(function(item){ return item.id===id; });
    if(base) return base;
    let found=null;
    Object.values(DATA.WORLD_EVENT_CHAINS||{}).forEach(function(branches){
      Object.values(branches||{}).forEach(function(event){ if(event.id===id) found=event; });
    });
    return found;
  };
  L.hasEventChoice=function(key){
    return Object.entries(state.game.run.worldEventChoices||{}).some(function(stageEntry){
      const stageId=stageEntry[0], stageChoices=stageEntry[1]||{}, events=state.game.run.worldEvents[stageId]||{};
      return Object.entries(stageChoices).some(function(choiceEntry){
        const slotId=choiceEntry[0], choiceId=choiceEntry[1];
        return events[slotId]+":"+choiceId===key;
      });
    });
  };
  L.completedProjectSources=function(){
    return Object.keys(state.game.meta.completedProjects||{}).map(function(id){
      const project=(DATA.SPECIAL_PROJECTS||[]).find(function(item){ return item.id===id; });
      if(!project) return null;
      const choiceId=state.game.meta.completedProjects[id]===true?"":state.game.meta.completedProjects[id];
      const choice=(project.choices||[]).find(function(item){ return item.id===choiceId; });
      const effects=Object.assign({},project.effects||{});
      if(choice){
        effects.resourceOutput=Object.assign({},(effects.resourceOutput||{}),((choice.effects||{}).resourceOutput||{}));
        Object.keys(choice.effects||{}).forEach(function(key){ if(key!=="resourceOutput") effects[key]=(effects[key]||0)+choice.effects[key]; });
      }
      return Object.assign({path:"Special Project",effects:effects,choiceName:choice?choice.name:""},project);
    }).filter(Boolean);
  };
  L.ascensionPathSource=function(){
    const path=(DATA.ASCENSION_PATHS||[]).find(function(item){ return item.id===state.game.run.ascensionPath; });
    return path?[Object.assign({path:"Ascension Path"},path)]:[];
  };
  L.legacyTierDef=function(){
    return (DATA.LEGACY_TIERS||[]).find(function(item){ return item.id===state.game.meta.legacyTier; }) || (DATA.LEGACY_TIERS||[])[0] || null;
  };
  L.legacyTierSource=function(){
    const tier=L.legacyTierDef();
    return tier&&tier.effects&&Object.keys(tier.effects).length?[Object.assign({path:"Legacy Universe"},tier)]:[];
  };
  L.eraLegacySources=function(){
    return Object.keys(state.game.meta.eraLegacies||{}).map(function(id){
      const def=(DATA.ERA_LEGACIES||{})[id];
      return def?Object.assign({id:"era_legacy:"+id,path:"Era Legacy"},def):null;
    }).filter(Boolean);
  };
  L.congressSource=function(){
    const proposal=(DATA.CONGRESS_PROPOSALS||[]).find(function(item){ return item.id===state.game.run.congressChoice; });
    return proposal?[Object.assign({path:"Diplomatic Congress"},proposal)]:[];
  };
  L.congressBlocSource=function(){
    const proposal=(DATA.CONGRESS_PROPOSALS||[]).find(function(item){ return item.id===state.game.run.congressChoice; });
    const bloc=proposal&&(DATA.CONGRESS_BLOCS||{})[proposal.bloc];
    if(!proposal || !bloc || proposal.bloc!==state.game.run.ascensionPath) return [];
    return [Object.assign({id:"congress_bloc:"+proposal.bloc,path:"Congress Bloc"},bloc)];
  };
  L.congressCrisisSource=function(){
    const crisis=L.activeCongressCrisis(), picked=(state.game.run.rivalEvents||{}).congressCrisis;
    if(!crisis) return [];
    const choice=(crisis.choices||[]).find(function(item){ return item.id===picked; });
    return [Object.assign({path:"Congress Crisis"},crisis,{effects:choice?choice.effects:(crisis.effects||{})})];
  };
  L.scaleEffects=function(effects,scale){
    const out={};
    Object.entries(effects||{}).forEach(function(entry){
      if(entry[1] && typeof entry[1]==="object"){
        out[entry[0]]={};
        Object.entries(entry[1]).forEach(function(inner){ out[entry[0]][inner[0]]=inner[1]*scale; });
      } else out[entry[0]]=entry[1]*scale;
    });
    return out;
  };
  L.mapWonderSources=function(){
    const slots=L.mapSlotsForStage();
    return Object.entries(state.game.run.mapWonders||{}).map(function(entry){
      const slot=slots.find(function(item){ return item.id===entry[0]; });
      const wonder=(DATA.MAP_WONDERS||[]).find(function(item){ return item.id===entry[1]; });
      const level=(state.game.run.mapWonderLevels||{})[entry[0]]||1;
      return wonder?Object.assign({},wonder,{path:"Map Wonder",slotName:slot?slot.name:entry[0],level:level,effects:L.scaleEffects(wonder.effects||{},1+(level-1)*0.5)}):null;
    }).filter(Boolean);
  };
  L.wonderSetSources=function(){
    const built=Object.values(state.game.run.mapWonders||{});
    return (DATA.WONDER_SETS||[]).filter(function(set){
      return (set.requires||[]).every(function(id){ return built.includes(id); });
    }).map(function(set){ return Object.assign({path:"Wonder Set"},set); });
  };
  L.rivalDefectionSources=function(){
    return Object.entries(state.game.run.rivalDefections||{}).map(function(entry){
      const def=(DATA.RIVAL_DEFECTIONS||[]).find(function(item){ return item.id===entry[1]; });
      return def?Object.assign({id:"defection:"+entry[0],name:L.displayArchetypeName(entry[0])+": "+def.name,path:"Rival Defection"},def):null;
    }).filter(Boolean);
  };
  L.museumRewardSources=function(){
    const rows=L.codexSummary().museum||[];
    const best=rows.reduce(function(max,row){ return Math.max(max,row.count||0); },0);
    return (DATA.MUSEUM_REWARDS||[]).filter(function(reward){ return best>=reward.count; }).map(function(reward){ return Object.assign({path:"Victory Museum"},reward); });
  };
  L.vassalSources=function(){
    return Object.entries(state.game.meta.vassals||{}).map(function(entry){
      const arch=entry[0], row=entry[1]||{}, resourceMap={
        humanoid:{science:0.02,influence:0.02}, mammalian:{food:0.02,happiness:0.02}, reptilian:{military_power:0.025,command:0.015},
        avian:{culture:0.02,logistics:0.02}, arthropoid:{production:0.025,materials:0.015}, molluscoid:{gold:0.02,diplomacy:0.02},
        fungoid:{medicine:0.02,organic_matter:0.02}, plantoid:{food:0.02,terraforming:0.02}, aquatic:{water:0.02,diplomacy:0.015},
        lithoid:{stone:0.02,alloys:0.02}, necroid:{faith:0.02,unity:0.02}, toxoid:{science:0.015,pollution:0.02}, extremophile:{energy:0.02,rare_matter:0.02}
      };
      const personality=(DATA.VASSAL_PERSONALITIES||[]).find(function(item){ return item.id===row.personality; });
      const effects={resourceOutput:resourceMap[arch]||{culture:0.015},score:Math.min(30,(row.count||1)*8)};
      if(personality && personality.effects){
        effects.resourceOutput=Object.assign({},effects.resourceOutput,personality.effects.resourceOutput||{});
      }
      return {id:"vassal:"+arch,name:L.displayArchetypeName(arch)+" Vassal Lineage"+(personality?(" - "+personality.name):""),path:"Vassal",effects:effects,personality:personality?personality.name:""};
    });
  };
  L.vassalDemandSources=function(){
    return Object.entries(state.game.run.vassalDemands||{}).map(function(entry){
      const demand=(DATA.VASSAL_DEMANDS||[]).find(function(item){ return item.id===entry[1]; });
      return demand?Object.assign({id:"vassal_demand:"+entry[0],name:L.displayArchetypeName(entry[0])+": "+demand.name,path:"Vassal Demand"},demand):null;
    }).filter(Boolean);
  };
  L.rivalDossierSources=function(){
    return Object.entries(state.game.meta.rivalDossiers||{}).map(function(entry){
      const row=entry[1]||{}, scale=1+(L.upgradeLevel("rival_scan")||0)*0.1, effects={resourceOutput:{}};
      if(row.studied>=2) effects.resourceOutput.diplomacy=0.01*scale;
      if(row.defections>=1) effects.resourceOutput.influence=0.01*scale;
      if(row.victories>=1) effects.resourceOutput.military_power=0.01*scale;
      if((row.collapses||0)>=1) effects.resourceOutput.cohesion=0.01*scale;
      return Object.keys(effects.resourceOutput).length?{id:"dossier:"+entry[0],name:L.displayArchetypeName(entry[0])+" Dossier",path:"Rival Dossier",effects:effects}:null;
    }).filter(Boolean);
  };
  L.rivalCounterDoctrineSources=function(){
    return Object.entries(state.game.meta.rivalDossiers||{}).map(function(entry){
      const row=entry[1]||{}, effects={resourceOutput:{}};
      if((row.victories||0)>=2){
        effects.resourceOutput.military_power=-0.01;
        effects.resourceOutput.diplomacy=-0.01;
      }
      if((row.victories||0)>=3){
        effects.resourceOutput.cohesion=-0.01;
      }
      return Object.keys(effects.resourceOutput).length?{id:"rival_counter_doctrine:"+entry[0],name:L.displayArchetypeName(entry[0])+" Counter-Doctrine",path:"Rival Legacy",effects:effects}:null;
    }).filter(Boolean);
  };
  L.congressInstitutionSources=function(){
    return Object.entries(state.game.meta.congressInstitutionLevels||{}).map(function(entry){
      const level=entry[1]||0;
      if(level<=0) return null;
      const effects={resourceOutput:{}};
      if(entry[0]==="harmony"){ effects.resourceOutput.diplomacy=0.01*level; effects.resourceOutput.cohesion=0.01*level; }
      if(entry[0]==="dominion"){ effects.resourceOutput.command=0.01*level; effects.resourceOutput.military_power=0.01*level; }
      if(entry[0]==="archive"){ effects.resourceOutput.science=0.01*level; effects.resourceOutput.data=0.01*level; }
      if(entry[0]==="bloom"){ effects.resourceOutput.food=0.01*level; effects.resourceOutput.terraforming=0.01*level; }
      if(entry[0]==="singularity"){ effects.resourceOutput.energy=0.01*level; effects.resourceOutput.ascension=0.01*level; }
      return {id:"congress_institution:"+entry[0],name:(entry[0].charAt(0).toUpperCase()+entry[0].slice(1))+" Institution Lv "+level,path:"Congress Institution",effects:effects};
    }).filter(Boolean);
  };
  L.institutionTraitSources=function(){
    const levels=state.game.meta.congressInstitutionLevels||{};
    return Object.entries(levels).map(function(entry){
      if((entry[1]||0)<2) return null;
      const trait=(DATA.INSTITUTION_TRAITS||{})[entry[0]];
      return trait?Object.assign({id:"institution_trait:"+entry[0],path:"Institution Trait"},trait):null;
    }).filter(Boolean);
  };
  L.activeInstitutionCrisis=function(){
    const levels=state.game.meta.congressInstitutionLevels||{}, total=Object.values(levels).reduce(function(sum,value){ return sum+(value||0); },0);
    if(total<4 || !state.game.run.congressChoice) return null;
    if(L.doctrineConflictSources().length){
      return (DATA.INSTITUTION_CRISES||[]).find(function(item){ return item.id==="institution_dogma"; })||null;
    }
    if(Object.values(levels).some(function(value){ return (value||0)>=3; })){
      return (DATA.INSTITUTION_CRISES||[]).find(function(item){ return item.id==="institution_overreach"; })||null;
    }
    return null;
  };
  L.chooseInstitutionCrisisResponse=function(choiceId){
    const crisis=L.activeInstitutionCrisis();
    if(!crisis || state.game.run.rivalEvents.institutionCrisis) return false;
    const choice=(crisis.choices||[]).find(function(item){ return item.id===choiceId; });
    if(!choice) return false;
    state.game.run.rivalEvents.institutionCrisis=choice.id;
    L.pushLog("Institution crisis resolved: "+crisis.name+" - "+choice.name);
    return true;
  };
  L.institutionCrisisSource=function(){
    const crisis=L.activeInstitutionCrisis(), picked=(state.game.run.rivalEvents||{}).institutionCrisis;
    if(!crisis) return [];
    const choice=(crisis.choices||[]).find(function(item){ return item.id===picked; });
    return [Object.assign({path:"Institution Crisis"},crisis,{effects:choice?choice.effects:(crisis.effects||{})})];
  };
  L.resourceFailureSources=function(){
    const timers=state.game.run.resourceFailures||{}, out=[];
    if((timers.wood||0)>=60){
      out.push({id:"wood_shortage",name:"Wood Shortage",path:"Resource Failure",effects:{resourceOutput:{production:-0.18,lumber:-0.25}}});
    }
    return out;
  };
  L.ascensionTension=function(){
    if(L.currentStage().id!=="galactic" || !state.game.run.ascensionPath) return 0;
    const rivalWins=(state.game.run.rivals||[]).filter(function(rival){ return rival.victory; }).length;
    const scars=Object.values(state.game.meta.threatScars||{}).reduce(function(sum,value){ return sum+(value||0); },0);
    const cohesion=state.game.run.resources.cohesion||0, happiness=state.game.run.resources.happiness||0;
    let tension=20+rivalWins*16+scars*3-Math.min(20,cohesion*0.12)-Math.min(12,happiness*0.08);
    if(state.game.run.congressChoice==="ascension_accord") tension-=14;
    return Math.max(0,Math.round(tension));
  };
  L.ascensionTensionSource=function(){
    const tension=L.ascensionTension();
    if(tension<45) return [];
    const scale=Math.min(0.12,(tension-40)/500);
    return [{id:"ascension_tension",name:"Ascension Tension",path:"Endgame Pressure",effects:{resourceOutput:{ascension:-scale,cohesion:-scale*0.8,happiness:-scale*0.6}}}];
  };
  L.currentEra=function(){
    const stageId=L.currentStage().id, id=state.game.run.eraModifiers[stageId];
    return ((DATA.ERA_MODIFIERS[stageId]||[]).find(function(item){ return item.id===id; }))||null;
  };
  L.nextEraForecast=function(){
    if(!L.hasMetaUnlock("era_control") || L.upgradeLevel("era_control")<=0) return null;
    const next=DATA.STAGES[Math.min(DATA.STAGES.length-1,state.game.run.stageIndex+1)];
    const eras=(DATA.ERA_MODIFIERS[next.id]||[]);
    return eras.length?eras[(state.game.run.stageIndex+1+state.game.meta.galacticWins+state.game.run.eraRerolls)%eras.length]:null;
  };
  L.mapSlotsForStage=function(){ return state.game.run.mapSlots[L.currentStage().id]||[]; };
  L.mapEffectSources=function(){
    const placed=L.mapSlotsForStage().filter(function(slot){ return !!slot.systemId; }).map(function(slot){
      return {id:"map:"+slot.id,name:slot.name,path:"Map Slot",effects:slot.effects||{}};
    });
    const traits=L.mapSlotsForStage().filter(function(slot){ return !!slot.traitId; }).map(function(slot){
      const trait=(DATA.SLOT_TRAITS||[]).find(function(item){ return item.id===slot.traitId; });
      return trait?{id:"trait:"+slot.id,name:slot.name+" - "+trait.name,path:"Slot Trait",effects:trait.effects||{}}:null;
    }).filter(Boolean);
    return placed.concat(traits);
  };
  L.adjacencySources=function(){
    const stageSystems=L.currentStage().systems||[];
    return L.mapSlotsForStage().map(function(slot){
      const system=stageSystems.find(function(item){ return item.id===slot.systemId; });
      if(!system) return null;
      const bonus=(DATA.ADJACENCY_BONUSES||[]).find(function(item){
        return item.slot===slot.id && (item.category===system.category || system.name.indexOf(item.category)>=0);
      });
      return bonus?Object.assign({path:"Adjacency",slotName:slot.name,systemName:system.name},bonus):null;
    }).filter(Boolean);
  };
  L.tokenTags=function(text){
    const haystack=(" "+(text||"").toLowerCase()+" "), tags=[];
    [
      ["market",["market","trade","gold","merchant","commerce","guild"]],
      ["trade",["trade","diplomacy","embassy","contract"]],
      ["water",["river","water","aquatic","irrigation","hydraulic","delta","tide","ice"]],
      ["sacred",["sacred","shrine","temple","faith","ritual","totem"]],
      ["faith",["faith","temple","shrine","ritual","totem"]],
      ["mineral",["stone","mineral","alloy","asteroid","ore","crystal","lithoid"]],
      ["industry",["industry","factory","foundry","forge","workshop","production","mill","plant"]],
      ["mining",["mine","mining","pit","asteroid","lifter"]],
      ["high",["high","sky","avian","orbit","strato","roost"]],
      ["orbit",["orbit","orbital","solar","planet","station","fleet","shipyard"]],
      ["fleet",["fleet","shipyard","command","sentry","gateway"]],
      ["toxic",["toxic","pollution","hazard","reactor","waste"]],
      ["irradiated",["irradiated","radiation","reactor","nuclear","solar"]],
      ["science",["science","research","university","archive","laboratory","data"]],
      ["medicine",["medicine","hospital","clinic","healer","infirmary"]],
      ["fertile",["fertile","food","farm","grove","garden","plantoid","growth"]],
      ["growth",["growth","population","nest","nursery","habitat","food"]],
      ["memory",["memory","archive","bone","ancestor","necroid","ossuary","crypt"]],
      ["necroid",["necroid","death","bone","ossuary","crypt","necropolis"]],
      ["plantoid",["plantoid","plant","grove","garden","photosynthetic"]],
      ["avian",["avian","sky","roost","flock","chorus"]]
    ].forEach(function(rule){
      if(rule[1].some(function(word){ return haystack.indexOf(word)>=0; })) tags.push(rule[0]);
    });
    return [...new Set(tags)];
  };
  L.slotTags=function(slot){
    const trait=(DATA.SLOT_TRAITS||[]).find(function(item){ return item.id===slot.traitId; });
    return L.tokenTags([slot.id,slot.name,slot.type,trait&&trait.name].filter(Boolean).join(" "));
  };
  L.systemTags=function(system){
    return L.tokenTags([system.id,system.name,system.category,system.description,system.archetype,(system.traits||[]).join(" ")].filter(Boolean).join(" "));
  };
  L.tagSynergySources=function(){
    const systems=L.currentStage().systems||[];
    return L.mapSlotsForStage().map(function(slot){
      const system=systems.find(function(item){ return item.id===slot.systemId; });
      if(!system) return null;
      const slotTags=L.slotTags(slot), systemTags=L.systemTags(system);
      const synergy=(DATA.TAG_SYNERGIES||[]).find(function(item){
        return (item.slotTags||[]).some(function(tag){ return slotTags.includes(tag); }) && (item.systemTags||[]).some(function(tag){ return systemTags.includes(tag); });
      });
      return synergy?Object.assign({path:"Tag Synergy",slotName:slot.name,systemName:system.name},synergy):null;
    }).filter(Boolean);
  };
  L.contractSource=function(){
    const id=state.game.run.activeContract;
    const contract=(DATA.STAGE_CONTRACTS||[]).find(function(item){ return item.id===id; });
    return contract?[Object.assign({path:"Stage Contract"},contract)]:[];
  };
  L.threatProjectSources=function(){
    return Object.keys(state.game.run.threatProjects||{}).map(function(id){
      const project=(DATA.THREAT_PROJECTS||[]).find(function(item){ return item.id===id; });
      return project?Object.assign({path:"Threat Project"},project):null;
    }).filter(Boolean);
  };
  L.rivalEventSources=function(){
    return Object.keys(state.game.run.rivalEvents||{}).map(function(key){
      const id=state.game.run.rivalEvents[key], event=(DATA.RIVAL_EVENTS||[]).find(function(item){ return item.id===id; });
      return event?Object.assign({path:"Rival Accord"},event):null;
    }).filter(Boolean);
  };
  L.hybridSource=function(){
    const id=state.game.run.secondaryArchetype, level=L.upgradeLevel("hybridization");
    if(!id || level<=0) return [];
    const resourceMap={
      aquatic:{water:0.04,food:0.03}, lithoid:{stone:0.04,alloys:0.03}, avian:{diplomacy:0.03,energy:0.03},
      plantoid:{food:0.04,biomass:0.03}, necroid:{medicine:0.03,cohesion:0.03}, toxoid:{science:0.03,pollution:0.03},
      humanoid:{science:0.03,influence:0.03}, mammalian:{happiness:0.03,food:0.03}, reptilian:{military_power:0.03,production:0.03},
      arthropoid:{materials:0.03,production:0.03}, molluscoid:{culture:0.03,water:0.03}, fungoid:{organic_matter:0.03,medicine:0.03},
      extremophile:{energy:0.03,rare_matter:0.03}
    };
    const effects={allOutput:level*0.01,resourceOutput:{}};
    Object.entries(resourceMap[id]||{}).forEach(function(entry){ effects.resourceOutput[entry[0]]=entry[1]*level; });
    return [{id:"hybrid:"+id,name:"Hybrid Influence: "+L.archetypeName(id),path:"Hybrid Lineage",effects:effects}];
  };
  L.markSeenContent=function(kind,item){
    if(!item) return;
    const seen=state.game.meta.seenContent||(state.game.meta.seenContent={});
    seen[kind+":"+item.id]={kind:kind,id:item.id,name:item.name,stage:L.currentStage().id,time:Date.now()};
  };
  L.goalKey=function(goal){ return (goal.stage || L.currentStage().id) + ":" + goal.id; };
  L.activeEffectSources=function(){
    const spec=L.specializationDef();
    const specSource=spec?[{id:"specialization:"+spec.id,name:spec.name,path:"Specialization",effects:spec.effects||{}}]:[];
    const era=L.currentEra(), eraSource=era?[{id:"era:"+era.id,name:era.name,path:"Era",effects:era.effects||{}}]:[];
    return L.ownedSystemsAll().concat(
      L.ownedTechAll(),
      specSource,
      L.chosenLineageEvents(),
      L.mutatorSources(),
      L.lineageLawSources(),
      L.doctrineSources(),
      L.doctrineConflictSources(),
      L.lawCongressSources(),
      L.lawSetSources(),
      L.artifactSources(),
      L.artifactSetSources(),
      L.artifactEvolutionSources(),
      L.artifactFusionSources(),
      L.restoredArtifactSources(),
      L.restorationChainSources(),
      L.masteryRelicSources(),
      L.archiveMilestoneSources(),
      L.timelineMilestoneSources(),
      L.timelineAnchorSources(),
      eraSource,
      L.mapEffectSources(),
      L.adjacencySources(),
      L.tagSynergySources(),
      L.worldEventSources(),
      L.completedProjectSources(),
      L.ascensionPathSource(),
      L.contractSource(),
      L.threatProjectSources(),
      L.rivalEventSources(),
      L.rivalPersonalitySources(),
      L.rivalAscensionSources(),
      L.rivalDefectionSources(),
      L.congressSource(),
      L.congressBlocSource(),
      L.congressCrisisSource(),
      L.institutionCrisisSource(),
      L.resourceFailureSources(),
      L.mapWonderSources(),
      L.wonderSetSources(),
      L.hybridSource(),
      L.vassalSources(),
      L.vassalDemandSources(),
      L.rivalDossierSources(),
      L.rivalCounterDoctrineSources(),
      L.legacyTierSource(),
      L.eraLegacySources(),
      L.museumRewardSources(),
      L.congressInstitutionSources(),
      L.institutionTraitSources(),
      L.ascensionTensionSource(),
      L.threatScarSources(),
      L.transformedScarSources(),
      L.archiveBoostSource()
    );
  };
  L.sumScalarEffect=function(effectKey){ return L.activeEffectSources().reduce(function(sum,item){ return sum+(((item.effects||{})[effectKey]||0)*(item.effectiveCount||1)); },0); };

  L.inheritedTraits=function(){ const traits=[]; state.game.run.archive.forEach(function(entry){ (entry.traits||[]).forEach(function(t){ if(!traits.includes(t)) traits.push(t); }); }); return traits; };
  L.lineageStages=function(){ return ["cell","creature"]; };
  L.itemAffinity=function(item){ return Object.assign({},(item&&item.affinity)||((item&&item.archetype)?{[item.archetype]:1}:{})); };
  L.addAffinity=function(target,source,mult){
    const scale=mult==null?1:mult;
    Object.entries(source||{}).forEach(function(entry){ target[entry[0]]=(target[entry[0]]||0)+entry[1]*scale; });
  };
  L.archetypeScores=function(){
    const counts={};
    state.game.run.archive.forEach(function(entry){ if(L.lineageStages().includes(entry.stageId)) L.addAffinity(counts,entry.affinity||((entry.archetype)?{[entry.archetype]:1}:{})); });
    if(L.lineageStages().includes(L.currentStage().id)) L.ownedSystemsForStage().forEach(function(item){ L.addAffinity(counts,L.itemAffinity(item)); });
    DATA.ARCHETYPES.forEach(function(arch){ if(counts[arch.id]==null) counts[arch.id]=0; });
    return counts;
  };
  L.dominantArchetype=function(){
    if(state.game.run.lockedArchetype) return state.game.run.lockedArchetype;
    const counts=L.archetypeScores();
    const best=Object.entries(counts).sort(function(a,b){ return b[1]-a[1]; })[0];
    return best&&best[1]>0?best[0]:L.currentStage().dominantArchetype;
  };
  L.dominantArchetypeLabel=function(){ const id=L.dominantArchetype(); return L.isArchetypeRevealed(id)?L.archetypeName(id):"Unknown Lineage Emerging"; };
  L.lineageRequirementMet=function(item){ return !item.archetypeReq || L.dominantArchetype()===item.archetypeReq; };
  L.lineageRequirementText=function(item){ return item.archetypeReq?("Requires "+L.displayArchetypeName(item.archetypeReq)+" lineage"):""; };
  L.lineageContentVisible=function(item){ return !item.archetypeReq || L.lineageRequirementMet(item); };
  L.hasLockedLineage=function(){ return !!state.game.run.lockedArchetype; };

  L.upgradeLevel=function(id){ return state.game.meta.upgrades[id]||0; };
  L.manualMultiplier=function(){ return 1+L.upgradeLevel("manual")*0.2+L.sumScalarEffect("manualBonus"); };
  L.automationMultiplier=function(){ return 1+L.upgradeLevel("auto")*0.15; };
  L.resourceOutputMultiplier=function(resourceId){
    return 1+L.activeEffectSources().reduce(function(sum,item){
      const effects=item.effects||{}, resourceOutput=effects.resourceOutput||{};
      const quantity=item.effectiveCount||1;
      return sum+((effects.allOutput||0)+(resourceOutput[resourceId]||0))*quantity;
    },0);
  };
  L.costMultiplier=function(){ return Math.max(0.4,1-L.upgradeLevel("cost")*0.04); };
  L.discountedCost=function(cost){ const mult=L.costMultiplier(), out={}; Object.entries(cost||{}).forEach(function(entry){ out[entry[0]]=Math.max(1,Math.round(entry[1]*mult)); }); return out; };
  L.populationScaleMultiplier=function(){ const base=L.currentStage().id==="cell"?0.012:0.006; return 1+Math.max(0,state.game.run.population-8)*(base+L.sumScalarEffect("populationScale")); };
  L.bundleText=function(bundle){ return Object.entries(bundle||{}).map(function(entry){ return L.resourceName(entry[0])+" "+L.fmt(entry[1]); }).join(" | "); };
  L.stageActions=function(){ return (L.currentStage().actions||[]).filter(function(action){ return !action.unlock || action.unlock.every(function(req){ return !!state.game.run.ownedSystems[req] || !!state.game.run.technologies[req]; }); }); };
  L.cellStarterComplete=function(){ const stage=L.currentStage(); return stage.id!=="cell" || ["membrane_pump","ribosome","vacuole"].every(function(id){ return !!state.game.run.ownedSystems[id]; }); };
  L.systemCategory=function(item){
    if(item.category!=="Lineage variants") return item.category;
    const stage=L.currentStage();
    const parent=(stage.systems||[]).find(function(row){ return (item.prereq||[]).includes(row.id); });
    return parent?parent.category:"Buildings";
  };
  L.visibleSystemCategories=function(){
    const stage=L.currentStage(), cats=[...new Set((stage.systems||[]).map(function(item){ return L.systemCategory(item); }))];
    if(stage.id!=="cell") return cats;
    if(!L.cellStarterComplete()) return ["Starter organelles"];
    return ["All organelles"].concat(cats.filter(function(cat){ return cat!=="Starter organelles"; }));
  };
  L.visibleTechPaths=function(){ return L.currentStage().techPaths||[]; };

  L.automationDefsForStage=function(){ return []; };

  L.automationCount=function(id){ return state.game.run.automation[id]||0; };
  L.generatorMultiplier=function(count){ return Math.pow(2,Math.floor(count/10)); };
  L.scaledCost=function(cost,owned){ const mult=L.costMultiplier(), growth=Math.pow(1.14,owned), out={}; Object.entries(cost||{}).forEach(function(entry){ out[entry[0]]=Math.max(1,Math.round(entry[1]*growth*mult)); }); return out; };
  L.capacityFor=function(id){ return state.game.run.capacities[id]||25; };
  L.canAfford=function(cost){ if(state.ui.debug) return true; return Object.entries(cost||{}).every(function(entry){ return (state.game.run.resources[entry[0]]||0)>=entry[1]; }); };
  L.spend=function(cost){ if(state.ui.debug) return; Object.entries(cost||{}).forEach(function(entry){ state.game.run.resources[entry[0]]=Math.max(0,(state.game.run.resources[entry[0]]||0)-entry[1]); }); };
  L.addCapacity=function(bundle){ Object.entries(bundle||{}).forEach(function(entry){ state.game.run.capacities[entry[0]]=(state.game.run.capacities[entry[0]]||0)+entry[1]; }); };
  L.gain=function(bundle,mult){
    const useMult=mult==null?1:mult;
    Object.entries(bundle||{}).forEach(function(entry){
      const key=entry[0], value=entry[1]*useMult, cap=L.capacityFor(key);
      state.game.run.resources[key]=Math.max(0,Math.min(cap,(state.game.run.resources[key]||0)+value));
    });
  };
  L.pushLog=function(text){ state.game.run.log.push(text); if(state.game.run.log.length>120) state.game.run.log=state.game.run.log.slice(-120); };
  L.seedIndex=function(list,salt){ return list.length?Math.abs(Math.floor((state.game.run.time*997+state.game.run.stageIndex*37+salt)%list.length)):0; };
  L.extraSlotForStage=function(stageId,index){
    const arch=state.game.run.secondaryArchetype||state.game.run.lockedArchetype||L.dominantArchetype();
    const prefs={
      aquatic:{name:"Tidal Annex",type:"Water territory",effects:{resourceOutput:{water:0.08,food:0.03}}},
      lithoid:{name:"Mineral Annex",type:"Stone territory",effects:{resourceOutput:{stone:0.08,alloys:0.03}}},
      avian:{name:"Highland Annex",type:"High territory",effects:{resourceOutput:{diplomacy:0.04,energy:0.04}}},
      plantoid:{name:"Fertile Annex",type:"Growth territory",effects:{resourceOutput:{food:0.08,biomass:0.03}}},
      necroid:{name:"Ossuary Annex",type:"Memory territory",effects:{resourceOutput:{medicine:0.04,cohesion:0.04}}},
      toxoid:{name:"Toxic Annex",type:"Hazard territory",effects:{resourceOutput:{science:0.05,pollution:0.04}}},
      reptilian:{name:"Basking Annex",type:"War territory",effects:{resourceOutput:{military_power:0.05,production:0.04}}},
      humanoid:{name:"Civic Annex",type:"Planning territory",effects:{resourceOutput:{science:0.04,influence:0.04}}}
    };
    const pref=prefs[arch]||{name:"Frontier Annex",type:"Open territory",effects:{resourceOutput:{production:0.04,culture:0.03}}};
    return Object.assign({id:"expanded_"+stageId+"_"+index,systemId:""},pref);
  };
  L.stageMasteryCount=function(stageId){ return (state.game.meta.stageMastery||{})[stageId]||0; };
  L.availableStageLayouts=function(stageId){
    return ((DATA.STAGE_MASTERY_LAYOUTS||{})[stageId]||[]).filter(function(item){
      return state.ui.debug || L.stageMasteryCount(stageId)>=item.wins;
    });
  };
  L.activeStageLayout=function(stageId){
    const chosen=(state.game.meta.stageLayouts||{})[stageId]||"standard";
    return L.availableStageLayouts(stageId).find(function(item){ return item.id===chosen; }) || (((DATA.STAGE_MASTERY_LAYOUTS||{})[stageId]||[])[0]) || null;
  };
  L.chooseStageLayout=function(stageId,id){
    const layout=L.availableStageLayouts(stageId).find(function(item){ return item.id===id; });
    if(!layout) return false;
    state.game.meta.stageLayouts[stageId]=id;
    delete state.game.run.mapSlots[stageId];
    L.ensureWorldState();
    L.pushLog("Stage layout selected: "+layout.name);
    return true;
  };
  L.ensureWorldState=function(){
    const stage=L.currentStage(), stageId=stage.id;
    if(!state.game.run.mapSlots[stageId]) state.game.run.mapSlots[stageId]=(DATA.MAP_SLOTS[stageId]||[]).map(function(slot){ return Object.assign({systemId:""},slot); });
    const desiredExtra=state.game.run.expandedSlots[stageId]||0, slots=state.game.run.mapSlots[stageId];
    for(let i=0;i<desiredExtra;i++){
      const id="expanded_"+stageId+"_"+i;
      if(!slots.some(function(slot){ return slot.id===id; })) slots.push(L.extraSlotForStage(stageId,i));
    }
    const layout=L.activeStageLayout(stageId);
    if(layout && layout.slot && !slots.some(function(slot){ return slot.id===layout.slot.id; })){
      slots.push(Object.assign({systemId:""},layout.slot));
    }
    if(L.hasMetaUnlock("biome_traits")){
      const traits=DATA.SLOT_TRAITS||[];
      slots.forEach(function(slot,i){
        if(traits.length && !slot.traitId) slot.traitId=traits[(state.game.run.stageIndex+i+state.game.meta.galacticWins)%traits.length].id;
      });
    }
    if(L.hasMetaUnlock("eras") && !state.game.run.eraModifiers[stageId]){
      const eras=DATA.ERA_MODIFIERS[stageId]||[];
      if(eras.length) state.game.run.eraModifiers[stageId]=eras[(state.game.run.stageIndex+state.game.meta.galacticWins)%eras.length].id;
    }
    if(!state.game.run.rivals){
      const personalities=DATA.RIVAL_PERSONALITIES||[];
      const paths=DATA.ASCENSION_PATHS||[];
      state.game.run.rivals=DATA.ARCHETYPES.filter(function(arch){ return arch.id!==state.game.run.lockedArchetype; }).slice(0,3).map(function(arch,i){
        const personality=personalities.length?personalities[(i+state.game.run.stageIndex+state.game.meta.galacticWins)%personalities.length]:null;
        const path=paths.length?paths[(i+state.game.meta.galacticWins)%paths.length].id:"";
        const pathDef=(DATA.RIVAL_ASCENSION||{})[path];
        return {archetype:arch.id,score:30+i*12,trend:(0.018+i*0.007)*(personality?personality.trend:1)*(pathDef?pathDef.trend:1),personality:personality?personality.id:"",path:path};
      });
    } else {
      const personalities=DATA.RIVAL_PERSONALITIES||[];
      const paths=DATA.ASCENSION_PATHS||[];
      state.game.run.rivals.forEach(function(rival,i){
        if(!rival.personality && personalities.length){
          const personality=personalities[(i+state.game.run.stageIndex+state.game.meta.galacticWins)%personalities.length];
          rival.personality=personality.id;
          rival.trend=(rival.trend||0.018)*(personality.trend||1);
        }
        if(!rival.path && paths.length){
          const path=paths[(i+state.game.meta.galacticWins)%paths.length].id, pathDef=(DATA.RIVAL_ASCENSION||{})[path];
          rival.path=path;
          rival.trend=(rival.trend||0.018)*(pathDef?pathDef.trend:1);
        }
      });
    }
    L.ensureMutatorDraft();
    L.ensureWorldEvents();
  };

  L.performAction=function(actionId){
    if(state.ui.betweenRuns) return false;
    const action=L.stageActions().find(function(item){ return item.id===actionId; });
    if(!action) return false;
    L.gain(action.gain,L.manualMultiplier());
    if(L.currentStage().id==="cell") state.game.run.population+=0.025;
    L.pushLog("Action: "+action.name);
    return true;
  };

  L.requirementMet=function(id){ return !!state.game.run.ownedSystems[id] || !!state.game.run.technologies[id]; };
  L.prereqsMet=function(item){ return (item.prereq||[]).every(function(id){ return L.requirementMet(id); }); };
  L.contentVisible=function(item,showLocked){ return L.lineageContentVisible(item) && (showLocked || L.prereqsMet(item)); };
  L.lockReasonForSystem=function(item){
    if(!L.lineageRequirementMet(item)) return L.lineageRequirementText(item);
    const missing=(item.prereq||[]).filter(function(id){ return !L.requirementMet(id); });
    if(missing.length){
      const names=missing.map(function(id){ const found=(L.currentStage().systems||[]).find(function(sys){ return sys.id===id; })||(L.currentStage().technologies||[]).find(function(tech){ return tech.id===id; }); return found?found.name:id; });
      return "Needs "+names.join(", ");
    }
    const cost=L.repeatableSystem(item)?L.scaledCost(item.cost,L.systemOwnedCount(item.id)):L.discountedCost(item.cost);
    if(!L.canAfford(cost)) return "Need "+L.bundleText(cost);
    return "";
  };
  L.buySystem=function(systemId){
    if(state.ui.betweenRuns) return false;
    const item=(L.currentStage().systems||[]).find(function(system){ return system.id===systemId; });
    const owned=state.game.run.ownedSystems[item.id];
    if(!item || (owned && !L.repeatableSystem(item))) return false;
    if(!L.lineageRequirementMet(item) && !state.ui.debug) return false;
    if(!L.prereqsMet(item) && !state.ui.debug) return false;
    const cost=L.repeatableSystem(item)?L.scaledCost(item.cost,L.systemOwnedCount(item.id)):L.discountedCost(item.cost);
    if(!L.canAfford(cost)) return false;
    L.spend(cost);
    if(!owned) state.game.run.ownedSystems[item.id]={stageId:L.currentStage().id,boughtAt:state.game.run.time,count:0};
    state.game.run.ownedSystems[item.id].count=(state.game.run.ownedSystems[item.id].count||0)+1;
    L.markSeenContent("system",item);
    if((state.game.run.ownedSystems[item.id].count||0)===1) L.autoPlaceSystem(item.id);
    L.addCapacity(item.capacity);
    L.pushLog("Built system: "+item.name+(L.repeatableSystem(item)?" x"+state.game.run.ownedSystems[item.id].count:""));
    return true;
  };
  L.autoPlaceSystem=function(systemId){
    L.ensureWorldState();
    const slot=L.mapSlotsForStage().find(function(item){ return !item.systemId; });
    if(slot) slot.systemId=systemId;
  };
  L.placeSystemInSlot=function(systemId,slotId){
    L.ensureWorldState();
    const owned=state.game.run.ownedSystems[systemId];
    if(systemId && (!owned || owned.stageId!==L.currentStage().id)) return false;
    const slots=L.mapSlotsForStage(), slot=slots.find(function(item){ return item.id===slotId; });
    if(!slot) return false;
    if(systemId) slots.forEach(function(item){ if(item.systemId===systemId) item.systemId=""; });
    slot.systemId=systemId;
    return true;
  };
  L.ensureMutatorDraft=function(){
    if(!L.hasMetaUnlock("run_mutators")) return;
    const stageId=L.currentStage().id;
    if((state.game.run.mutatorDrafts||{})[stageId]) return;
    const list=DATA.RUN_MUTATORS||[];
    state.game.run.mutatorDrafts[stageId]=[0,1,2].map(function(offset){ return list[(state.game.run.stageIndex+state.game.meta.galacticWins+offset)%list.length].id; });
  };
  L.mutatorDraft=function(){ L.ensureMutatorDraft(); return ((state.game.run.mutatorDrafts||{})[L.currentStage().id]||[]).map(function(id){ return (DATA.RUN_MUTATORS||[]).find(function(item){ return item.id===id; }); }).filter(Boolean); };
  L.chooseMutator=function(id){
    if(!L.hasMetaUnlock("run_mutators")) return false;
    const stageId=L.currentStage().id;
    if(Object.prototype.hasOwnProperty.call(state.game.run.activeMutators||{},stageId)) return false;
    if(id && !L.mutatorDraft().some(function(item){ return item.id===id; })) return false;
    if(id) state.game.run.activeMutators[stageId]=id;
    else state.game.run.activeMutators[stageId]="";
    L.pushLog(id?("Run mutator chosen: "+((DATA.RUN_MUTATORS||[]).find(function(item){ return item.id===id; })||{}).name):"Run mutator skipped.");
    return true;
  };
  L.expandMap=function(){
    L.ensureWorldState();
    if(!L.hasMetaUnlock("map_expansion")) return false;
    const stageId=L.currentStage().id, count=state.game.run.expandedSlots[stageId]||0, max=3;
    if(count>=max) return false;
    const cost=2+count*2;
    if(state.game.meta.evolutionPoints<cost && !state.ui.debug) return false;
    if(!state.ui.debug) state.game.meta.evolutionPoints-=cost;
    state.game.run.expandedSlots[stageId]=count+1;
    state.game.run.mapSlots[stageId].push(L.extraSlotForStage(stageId,count));
    L.pushLog("Map expanded: "+L.currentStage().name+" gained a new slot.");
    return true;
  };
  L.availableContracts=function(){
    if(!L.hasMetaUnlock("contracts")) return [];
    return (DATA.STAGE_CONTRACTS||[]).filter(function(contract){
      const winOk=!contract.requiresWin || state.game.meta.galacticWins>0 || state.ui.debug;
      const chainOk=!contract.after || !!(state.game.meta.completedContracts||{})[contract.after] || state.ui.debug;
      return winOk && chainOk;
    });
  };
  L.chooseContract=function(id){
    if(state.game.run.activeContract) return false;
    if(L.ownedSystemsForStage().length>0 && !state.ui.debug) return false;
    const contract=L.availableContracts().find(function(item){ return item.id===id; });
    if(!contract) return false;
    state.game.run.activeContract=id;
    L.pushLog("Stage contract accepted: "+contract.name);
    return true;
  };
  L.availableThreatProjects=function(){
    const activeThreats=L.threats().map(function(threat){ return threat.id; });
    return (DATA.THREAT_PROJECTS||[]).filter(function(project){
      return activeThreats.includes(project.threat) || state.game.run.threatProjects[project.id];
    });
  };
  L.resolveThreatProject=function(id){
    const project=(DATA.THREAT_PROJECTS||[]).find(function(item){ return item.id===id; });
    if(!project || state.game.run.threatProjects[id]) return false;
    if(!L.canAfford(project.cost)) return false;
    L.spend(project.cost);
    state.game.run.threatProjects[id]=true;
    L.pushLog("Threat project completed: "+project.name);
    return true;
  };
  L.availableRivalInteractions=function(){
    if(!state.game.run.rivals || !state.game.run.rivals.length) return [];
    const key=L.currentStage().id, used=state.game.run.rivalEvents||{};
    return (DATA.RIVAL_EVENTS||[]).map(function(event){ return Object.assign({chosen:!!used[key],available:!used[key]},event); });
  };
  L.chooseRivalInteraction=function(id){
    L.ensureWorldState();
    const key=L.currentStage().id;
    if(state.game.run.rivalEvents[key]) return false;
    const event=(DATA.RIVAL_EVENTS||[]).find(function(item){ return item.id===id; });
    if(!event) return false;
    state.game.run.rivalEvents[key]=id;
    if(id==="espionage"){
      const rival=(state.game.run.rivals||[]).sort(function(a,b){ return b.score-a.score; })[0];
      if(rival){ rival.score=Math.max(0,rival.score-12-(L.upgradeLevel("rival_scan")||0)*2); L.noteRivalStudy(rival.archetype); }
    }
    if(id==="trade_pact"){
      const rival=(state.game.run.rivals||[]).sort(function(a,b){ return b.score-a.score; })[0];
      if(rival){ rival.trend*=0.9; L.noteRivalStudy(rival.archetype); }
    }
    L.pushLog("Rival interaction chosen: "+event.name);
    return true;
  };
  L.availableCongressProposals=function(){
    const currentIndex=state.game.run.stageIndex;
    return (DATA.CONGRESS_PROPOSALS||[]).filter(function(item){
      const min=L.stageIndexById(item.stageMin);
      return min>=0 && currentIndex>=min;
    });
  };
  L.chooseCongressProposal=function(id){
    if(state.game.run.congressChoice) return false;
    const proposal=L.availableCongressProposals().find(function(item){ return item.id===id; });
    if(!proposal) return false;
    state.game.run.congressChoice=id;
    L.pushLog("Congress proposal passed: "+proposal.name);
    return true;
  };
  L.activeCongressCrisis=function(){
    if(!state.game.run.congressChoice) return null;
    const threats=L.threats(), rivalPressure=(state.game.run.rivals||[]).some(function(rival){ return rival.score>=90 || rival.victory; });
    const severe=threats.some(function(item){ return item.severity>=3; });
    if(!rivalPressure && !severe) return null;
    const list=DATA.CONGRESS_CRISES||[];
    return list.length?list[(state.game.run.stageIndex+(state.game.meta.galacticWins||0))%list.length]:null;
  };
  L.currentCongressProposal=function(){
    return (DATA.CONGRESS_PROPOSALS||[]).find(function(item){ return item.id===state.game.run.congressChoice; })||null;
  };
  L.nextCongressSeason=function(){
    const proposal=L.currentCongressProposal();
    if(!proposal) return null;
    const proposals=L.availableCongressProposals().filter(function(item){ return item.id!==proposal.id; });
    if(!proposals.length) return null;
    const season=((state.game.meta.congressSeasons||{})[L.currentStage().id]||0)+1;
    return proposals[season%proposals.length];
  };
  L.rotateCongressSeason=function(){
    if(!state.game.run.congressChoice) return false;
    const current=L.currentCongressProposal();
    const next=L.nextCongressSeason();
    if(!next) return false;
    state.game.meta.congressSeasons[L.currentStage().id]=((state.game.meta.congressSeasons||{})[L.currentStage().id]||0)+1;
    if(current && current.bloc){
      state.game.meta.congressInstitutionLevels[current.bloc]=(state.game.meta.congressInstitutionLevels[current.bloc]||0)+1;
    }
    state.game.run.congressChoice=next.id;
    delete state.game.run.rivalEvents.congressCrisis;
    L.pushLog("Congress season rotated to "+next.name+".");
    return true;
  };
  L.chooseCongressCrisisResponse=function(id){
    const crisis=L.activeCongressCrisis();
    if(!crisis || state.game.run.rivalEvents.congressCrisis) return false;
    const choice=(crisis.choices||[]).find(function(item){ return item.id===id; });
    if(!choice) return false;
    state.game.run.rivalEvents.congressCrisis=id;
    L.pushLog("Congress crisis resolved: "+crisis.name+" - "+choice.name);
    return true;
  };
  L.availableArtifactEvolutions=function(){
    return (DATA.ARTIFACT_EVOLUTIONS||[]).filter(function(item){
      return !!state.game.meta.artifacts[item.artifactId] && !state.game.meta.artifactEvolutions[item.id] && (state.game.meta.galacticWins>=item.wins || state.ui.debug);
    });
  };
  L.evolveArtifact=function(id){
    const evo=L.availableArtifactEvolutions().find(function(item){ return item.id===id; });
    if(!evo || !L.canAfford(evo.cost)) return false;
    L.spend(evo.cost);
    state.game.meta.artifactEvolutions[id]=true;
    L.pushLog("Artifact reassembled: "+evo.name);
    return true;
  };
  L.applyArtifactWear=function(){
    const tier=L.legacyTierDef();
    if(!tier || !["hostile_cosmos","thin_reality"].includes(tier.id)) return;
    const bases=Object.keys(state.game.meta.artifacts||{}), evolved=state.game.meta.artifactEvolutions||{};
    const vulnerable=bases.filter(function(id){ return !Object.values(DATA.ARTIFACT_EVOLUTIONS||[]).some(function(item){ return item.artifactId===id && evolved[item.id]; }); });
    if(!vulnerable.length) return;
    const worn=vulnerable[0];
    state.game.meta.wornArtifacts[worn]=true;
    delete state.game.meta.artifacts[worn];
    L.pushLog("Artifact wear: "+(((DATA.ARTIFACTS||[]).find(function(item){ return item.id===worn; })||{}).name||worn)+" degraded in the harsh universe.");
  };
  L.archiveFavoriteKey=function(kind,id){ return kind+":"+id; };
  L.toggleArchiveFavorite=function(kind,id){
    if(L.upgradeLevel("archive_pinning")<=0 && !state.ui.debug) return false;
    const key=L.archiveFavoriteKey(kind,id), favs=state.game.meta.archiveFavorites||(state.game.meta.archiveFavorites={});
    favs[key]=!favs[key];
    if(!favs[key]) delete favs[key];
    return true;
  };
  L.isArchiveFavorite=function(kind,id){
    return !!((state.game.meta.archiveFavorites||{})[L.archiveFavoriteKey(kind,id)]);
  };
  L.availableMapWonders=function(slotId){
    L.ensureWorldState();
    const slot=L.mapSlotsForStage().find(function(item){ return item.id===slotId; });
    if(!slot || state.game.run.mapWonders[slotId]) return [];
    const tags=L.slotTags(slot);
    return (DATA.MAP_WONDERS||[]).filter(function(wonder){
      const unused=!Object.values(state.game.run.mapWonders||{}).includes(wonder.id);
      const tagOk=!(wonder.slotTags||[]).length || (wonder.slotTags||[]).some(function(tag){ return tags.includes(tag); });
      return unused && tagOk;
    });
  };
  L.buildMapWonder=function(wonderId,slotId){
    const wonder=L.availableMapWonders(slotId).find(function(item){ return item.id===wonderId; });
    if(!wonder || !L.canAfford(wonder.cost)) return false;
    L.spend(wonder.cost);
    state.game.run.mapWonders[slotId]=wonder.id;
    state.game.run.mapWonderLevels[slotId]=1;
    L.markSeenContent("wonder",wonder);
    L.pushLog("Map wonder built: "+wonder.name);
    return true;
  };
  L.mapWonderUpgradeCost=function(slotId){
    const wonder=(DATA.MAP_WONDERS||[]).find(function(item){ return item.id===(state.game.run.mapWonders||{})[slotId]; });
    const level=(state.game.run.mapWonderLevels||{})[slotId]||1, out={};
    Object.entries((wonder&&wonder.cost)||{}).forEach(function(entry){ out[entry[0]]=Math.max(1,Math.round(entry[1]*(0.45+level*0.35))); });
    return out;
  };
  L.maxMapWonderLevel=function(){ return 3+Math.min(3,Math.floor((state.game.meta.galacticWins||0)/4)); };
  L.upgradeMapWonder=function(slotId){
    const wonderId=(state.game.run.mapWonders||{})[slotId], wonder=(DATA.MAP_WONDERS||[]).find(function(item){ return item.id===wonderId; });
    if(!wonder) return false;
    const level=(state.game.run.mapWonderLevels||{})[slotId]||1;
    if(level>=L.maxMapWonderLevel()) return false;
    const cost=L.mapWonderUpgradeCost(slotId);
    if(!L.canAfford(cost)) return false;
    L.spend(cost);
    state.game.run.mapWonderLevels[slotId]=level+1;
    L.pushLog("Map wonder upgraded: "+wonder.name+" level "+(level+1));
    return true;
  };
  L.availableLegacyTiers=function(){
    return (DATA.LEGACY_TIERS||[]).filter(function(tier){ return state.game.meta.galacticWins>=tier.wins || state.ui.debug; });
  };
  L.chooseLegacyTier=function(id){
    const tier=L.availableLegacyTiers().find(function(item){ return item.id===id; });
    if(!tier) return false;
    state.game.meta.legacyTier=id;
    L.pushLog("Legacy universe selected: "+tier.name);
    return true;
  };
  L.availableRivalDefections=function(){
    L.ensureWorldState();
    if(!["empire","solar","galactic"].includes(L.currentStage().id)) return [];
    const used=state.game.run.rivalDefections||{};
    const pressured=(state.game.run.rivals||[]).filter(function(rival){ return rival.score>=70 && !used[rival.archetype]; });
    return pressured.flatMap(function(rival){
      return (DATA.RIVAL_DEFECTIONS||[]).map(function(defection){ return {rival:rival,defection:defection}; });
    });
  };
  L.assignVassalPersonality=function(archetype){
    const list=DATA.VASSAL_PERSONALITIES||[];
    if(!list.length) return "";
    const idx=Math.abs((state.game.meta.galacticWins||0)+L.stageIndexById(L.currentStage().id)+archetype.length)%list.length;
    return list[idx].id;
  };
  L.rivalDossier=function(archetype){
    const dossiers=state.game.meta.rivalDossiers||(state.game.meta.rivalDossiers={});
    if(!dossiers[archetype]) dossiers[archetype]={studied:0,victories:0,defections:0,vassals:0,lastPath:"",paths:{},eras:{},collapses:0};
    if(!dossiers[archetype].paths) dossiers[archetype].paths={};
    if(!dossiers[archetype].eras) dossiers[archetype].eras={};
    if(dossiers[archetype].collapses==null) dossiers[archetype].collapses=0;
    return dossiers[archetype];
  };
  L.noteRivalStudy=function(archetype){
    const row=L.rivalDossier(archetype);
    row.studied=(row.studied||0)+1;
  };
  L.noteRivalVictory=function(rival){
    const row=L.rivalDossier(rival.archetype);
    row.victories=(row.victories||0)+1;
    row.lastPath=rival.path||row.lastPath||"";
    if(rival.path) row.paths[rival.path]=(row.paths[rival.path]||0)+1;
    const era=L.currentEra();
    if(era) row.eras[era.id]=(row.eras[era.id]||0)+1;
  };
  L.noteRivalDefection=function(archetype,vassalized){
    const row=L.rivalDossier(archetype);
    row.defections=(row.defections||0)+1;
    if(vassalized) row.vassals=(row.vassals||0)+1;
    row.collapses=(row.collapses||0)+1;
  };
  L.availableVassalDemands=function(){
    if(!["empire","solar","galactic"].includes(L.currentStage().id)) return [];
    return Object.entries(state.game.meta.vassals||{}).flatMap(function(entry){
      const arch=entry[0];
      if((state.game.run.vassalDemands||{})[arch]) return [];
      return (DATA.VASSAL_DEMANDS||[]).map(function(demand){ return {archetype:arch,vassal:entry[1],demand:demand}; });
    });
  };
  L.chooseVassalDemand=function(archetype,id){
    const demand=(DATA.VASSAL_DEMANDS||[]).find(function(item){ return item.id===id; });
    if(!demand || !state.game.meta.vassals[archetype] || state.game.run.vassalDemands[archetype]) return false;
    state.game.run.vassalDemands[archetype]=id;
    L.pushLog("Vassal demand resolved: "+L.displayArchetypeName(archetype)+" - "+demand.name);
    return true;
  };
  L.chooseRivalDefection=function(archetype,id){
    const rival=(state.game.run.rivals||[]).find(function(item){ return item.archetype===archetype; });
    const defection=(DATA.RIVAL_DEFECTIONS||[]).find(function(item){ return item.id===id; });
    if(!rival || !defection || rival.score<70 || state.game.run.rivalDefections[archetype]) return false;
    state.game.run.rivalDefections[archetype]=id;
    if(id==="fragment"){ rival.score=Math.max(0,rival.score-22); rival.trend*=0.82; }
    if(id==="asylum"){ rival.score=Math.max(0,rival.score-12); rival.trend*=0.92; }
    if(id==="forced_merger"){ rival.score=Math.max(0,rival.score-30); rival.trend*=0.75; }
    if(id==="asylum" || id==="forced_merger"){
      const vassal=state.game.meta.vassals[archetype]||{mode:id,count:0,personality:L.assignVassalPersonality(archetype)};
      vassal.mode=id;
      vassal.count=(vassal.count||0)+1;
      if(!vassal.personality) vassal.personality=L.assignVassalPersonality(archetype);
      state.game.meta.vassals[archetype]=vassal;
    }
    L.noteRivalDefection(archetype,id==="asylum" || id==="forced_merger");
    L.pushLog("Rival defection resolved: "+L.displayArchetypeName(archetype)+" - "+defection.name);
    return true;
  };
  L.availableCosmeticThemes=function(){
    return (DATA.COSMETIC_THEMES||[]).filter(function(theme){ return (state.game.meta.archetypeWins[theme.archetype]||0)>=theme.wins || state.ui.debug; });
  };
  L.chooseCosmeticTheme=function(id){
    if(id && !L.availableCosmeticThemes().some(function(theme){ return theme.id===id; })) return false;
    state.game.meta.cosmeticTheme=id||"";
    return true;
  };
  L.rivalEndingName=function(rival){
    const path=(DATA.RIVAL_ASCENSION||{})[rival.path];
    return L.displayArchetypeName(rival.archetype)+" "+(path?path.name:"Ascension Bid");
  };
  L.wonderMaintenanceCost=function(){
    const tier=L.legacyTierDef();
    if(!tier || !["hostile_cosmos","thin_reality"].includes(tier.id)) return null;
    const wonders=Object.keys(state.game.run.mapWonders||{}).length;
    if(!wonders) return null;
    const scale=tier.id==="thin_reality"?1.4:1;
    const resources=L.currentStage().resources||[];
    return Object.fromEntries([
      [resources[0]||"production",Math.round(30*wonders*scale)],
      [resources[Math.min(1,resources.length-1)]||"gold",Math.round(22*wonders*scale)],
      [resources[Math.min(2,resources.length-1)]||"science",Math.round(18*wonders*scale)]
    ]);
  };
  L.maintainWonders=function(){
    const cost=L.wonderMaintenanceCost();
    if(!cost) return false;
    if(L.canAfford(cost)){ L.spend(cost); L.pushLog("Wonder maintenance completed."); return true; }
    const highest=Object.entries(state.game.run.mapWonderLevels||{}).sort(function(a,b){ return b[1]-a[1]; })[0];
    if(!highest) return false;
    state.game.run.mapWonderLevels[highest[0]]=Math.max(1,(state.game.run.mapWonderLevels[highest[0]]||1)-1);
    L.pushLog("Wonder maintenance failed; a landmark lost one level.");
    return true;
  };
  L.rivalCounterProjectDefs=function(){
    if(!["solar","galactic"].includes(L.currentStage().id)) return [];
    return (state.game.run.rivals||[]).filter(function(rival){ return rival.score>=85 && !rival.victory; }).flatMap(function(rival){
      return (DATA.RIVAL_COUNTER_PROJECTS||[]).map(function(project){
        return Object.assign({},project,{stage:L.currentStage().id,id:project.id+":"+rival.archetype,targetArchetype:rival.archetype,name:project.name+" - "+L.displayArchetypeName(rival.archetype)});
      });
    });
  };
  L.dossierOperationDefs=function(){
    if(!["solar","galactic"].includes(L.currentStage().id)) return [];
    return Object.entries(state.game.meta.rivalDossiers||{}).flatMap(function(entry){
      const arch=entry[0], row=entry[1]||{}, rival=(state.game.run.rivals||[]).find(function(item){ return item.archetype===arch && !item.victory; });
      if(!rival || (row.studied||0)<2) return [];
      return (DATA.DOSSIER_OPERATIONS||[]).map(function(project){
        return Object.assign({},project,{stage:L.currentStage().id,id:project.id+":"+arch,targetArchetype:arch,name:project.name+" - "+L.displayArchetypeName(arch)});
      });
    });
  };
  L.artifactRecoveryProjectDefs=function(){
    return Object.keys(state.game.meta.wornArtifacts||{}).map(function(id){
      const artifact=(DATA.ARTIFACTS||[]).find(function(item){ return item.id===id; });
      if(!artifact) return null;
      return {id:"recover_artifact:"+id,stage:L.currentStage().id,name:"Recover "+artifact.name,desc:"Restore a worn inherited relic through careful reconstruction.",duration:90,cost:{science:90,data:70,unity:50},recoverArtifact:id,effects:{resourceOutput:{science:0.02,unity:0.02}},choices:DATA.ARTIFACT_RESTORATION_BRANCHES||[]};
    }).filter(Boolean);
  };
  L.projectDefById=function(id){
    return (DATA.SPECIAL_PROJECTS||[]).find(function(item){ return item.id===id; }) || L.rivalCounterProjectDefs().find(function(item){ return item.id===id; }) || L.dossierOperationDefs().find(function(item){ return item.id===id; }) || L.artifactRecoveryProjectDefs().find(function(item){ return item.id===id; }) || null;
  };
  L.discountedProjectCost=function(cost){
    const scale=Math.max(0.55,1-(L.upgradeLevel("counterintel")||0)*0.08), out={};
    Object.entries(cost||{}).forEach(function(entry){ out[entry[0]]=Math.max(1,Math.round(entry[1]*scale)); });
    return out;
  };
  L.completeRivalCounterProject=function(project){
    const rival=(state.game.run.rivals||[]).find(function(item){ return item.archetype===project.targetArchetype; });
    if(!rival) return;
    if(project.id.indexOf("rival_sabotage:")===0){ rival.score=Math.max(0,rival.score-18); rival.trend*=0.86; }
    if(project.id.indexOf("rival_detente:")===0){ rival.score=Math.max(0,rival.score-10); rival.trend*=0.9; }
    if(project.id.indexOf("rival_integration:")===0){
      rival.score=Math.max(0,rival.score-25); rival.trend*=0.72;
      const vassal=state.game.meta.vassals[project.targetArchetype]||{mode:"integration",count:0,personality:L.assignVassalPersonality(project.targetArchetype)};
      vassal.mode="integration";
      vassal.count=(vassal.count||0)+1;
      state.game.meta.vassals[project.targetArchetype]=vassal;
    }
    if(project.id.indexOf("dossier_exploit:")===0){ rival.score=Math.max(0,rival.score-16); rival.trend*=0.88; }
    if(project.id.indexOf("dossier_discredit:")===0){ rival.score=Math.max(0,rival.score-12); rival.trend*=0.9; }
  };
  L.rerollEra=function(){
    if(!L.hasMetaUnlock("era_control") || (L.upgradeLevel("era_control")<=0 && !state.ui.debug)) return false;
    const stageId=L.currentStage().id, eras=DATA.ERA_MODIFIERS[stageId]||[];
    if(!eras.length) return false;
    const current=state.game.run.eraModifiers[stageId], index=Math.max(0,eras.findIndex(function(item){ return item.id===current; }));
    state.game.run.eraModifiers[stageId]=eras[(index+1)%eras.length].id;
    state.game.run.eraRerolls+=1;
    L.pushLog("Era shifted to "+L.currentEra().name+".");
    return true;
  };
  L.chooseSecondaryArchetype=function(id){
    if(!L.hasMetaUnlock("hybridization") || (L.upgradeLevel("hybridization")<=0 && !state.ui.debug)) return false;
    if(state.game.run.secondaryArchetype) return false;
    if(id===state.game.run.lockedArchetype) return false;
    if(!DATA.ARCHETYPES.some(function(item){ return item.id===id; })) return false;
    state.game.run.secondaryArchetype=id;
    L.pushLog("Hybrid influence selected: "+L.archetypeName(id));
    return true;
  };
  L.setAutomationPolicy=function(id){
    const policies=["balanced","food","science","low_pollution","lineage"];
    if(!policies.includes(id)) return false;
    state.game.run.automationPolicy=id;
    return true;
  };
  L.ensureWorldEvents=function(){
    if(!L.hasMetaUnlock("world_events")) return;
    const stageId=L.currentStage().id;
    if(state.game.run.worldEvents[stageId]) return;
    const events={};
    L.mapSlotsForStage().forEach(function(slot,i){
      const slotTags=L.slotTags(slot), event=(DATA.WORLD_SLOT_EVENTS||[]).find(function(item){ return (item.slotTags||[]).some(function(tag){ return slotTags.includes(tag); }); });
      if(event && i%2===0) events[slot.id]=event.id;
    });
    state.game.run.worldEvents[stageId]=events;
  };
  L.chooseWorldEventResponse=function(slotId,choiceId){
    const stageId=L.currentStage().id, eventId=(state.game.run.worldEvents[stageId]||{})[slotId];
    if(!eventId) return false;
    if(!state.game.run.worldEventChoices[stageId]) state.game.run.worldEventChoices[stageId]={};
    if(state.game.run.worldEventChoices[stageId][slotId]) return false;
    const event=L.worldEventDef(eventId);
    const choice=event&&(event.choices||[]).find(function(item){ return item.id===choiceId; });
    if(!choice) return false;
    state.game.run.worldEventChoices[stageId][slotId]=choiceId;
    const follow=((DATA.WORLD_EVENT_CHAINS||{})[event.id]||{})[choice.id];
    if(follow){
      const chainSlot=slotId+":chain";
      state.game.run.worldEvents[stageId][chainSlot]=follow.id;
    }
    L.pushLog("World event response: "+event.name+" - "+choice.name);
    return true;
  };
  L.availableLineageLaws=function(){
    const stageId=L.currentStage().id;
    if(!L.hasLockedLineage() || !["empire","solar","galactic"].includes(stageId)) return [];
    if(state.game.run.lineageLaws[stageId]) return [];
    return (DATA.LINEAGE_LAWS||{})[stageId]||[];
  };
  L.availableDoctrines=function(){
    const arch=state.game.run.lockedArchetype;
    if(!arch || state.game.run.doctrine) return [];
    if((state.game.meta.archetypeWins[arch]||0)<3 && !state.ui.debug) return [];
    return (DATA.LINEAGE_DOCTRINES||{})[arch]||[];
  };
  L.availableDoctrineEvolutions=function(){
    const id=state.game.run.doctrine, arch=state.game.run.lockedArchetype;
    if(!id || (state.game.meta.evolvedDoctrines||{})[id]) return [];
    if((state.game.meta.archetypeWins[arch]||0)<5 && !state.ui.debug) return [];
    const evo=(DATA.DOCTRINE_EVOLUTIONS||{})[id];
    return evo?[Object.assign({id:id,baseDoctrine:id},evo)]:[];
  };
  L.evolveDoctrine=function(id){
    const evo=L.availableDoctrineEvolutions().find(function(item){ return item.baseDoctrine===id; });
    if(!evo) return false;
    state.game.meta.evolvedDoctrines[id]=true;
    L.pushLog("Doctrine evolved: "+evo.name);
    return true;
  };
  L.chooseDoctrine=function(id){
    const doctrine=L.availableDoctrines().find(function(item){ return item.id===id; });
    if(!doctrine) return false;
    state.game.run.doctrine=id;
    L.pushLog("Doctrine chosen: "+doctrine.name);
    return true;
  };
  L.chooseLineageLaw=function(id){
    const stageId=L.currentStage().id, law=L.availableLineageLaws().find(function(item){ return item.id===id; });
    if(!law) return false;
    state.game.run.lineageLaws[stageId]=id;
    L.pushLog("Lineage law adopted: "+law.name);
    return true;
  };
  L.availableSpecialProjects=function(){
    return (DATA.SPECIAL_PROJECTS||[]).concat(L.rivalCounterProjectDefs(),L.dossierOperationDefs(),L.artifactRecoveryProjectDefs()).filter(function(item){
      if(item.stage!==L.currentStage().id) return false;
      if(item.scarRecovery) return Object.keys(state.game.meta.threatScars||{}).some(function(id){ return !state.game.meta.transformedScars[id]; });
      if(item.requiresLaw && !Object.values(state.game.run.lineageLaws||{}).includes(item.requiresLaw)) return false;
      if(item.requiresPath && state.game.run.ascensionPath!==item.requiresPath) return false;
      if(item.requiresEventChoice && !L.hasEventChoice(item.requiresEventChoice)) return false;
      if(item.requiresArtifactSet && !L.artifactSetSources().some(function(set){ return set.id===item.requiresArtifactSet; })) return false;
      if(item.recoverArtifact && !state.game.meta.wornArtifacts[item.recoverArtifact]) return false;
      return !state.game.meta.completedProjects[item.id];
    });
  };
  L.projectLockReason=function(project){
    if(project.scarRecovery && !Object.keys(state.game.meta.threatScars||{}).some(function(id){ return !state.game.meta.transformedScars[id]; })) return "Needs a recoverable scar.";
    if(project.requiresLaw && !Object.values(state.game.run.lineageLaws||{}).includes(project.requiresLaw)) return "Needs law "+project.requiresLaw+".";
    if(project.requiresPath && state.game.run.ascensionPath!==project.requiresPath) return "Needs "+project.requiresPath+" ascension path.";
    if(project.requiresEventChoice && !L.hasEventChoice(project.requiresEventChoice)) return "Needs event choice "+project.requiresEventChoice+".";
    if(project.requiresArtifactSet && !L.artifactSetSources().some(function(set){ return set.id===project.requiresArtifactSet; })) return "Needs artifact set "+project.requiresArtifactSet+".";
    if(state.game.meta.completedProjects[project.id] && !project.scarRecovery) return "Already complete.";
    if(!L.canAfford(L.discountedProjectCost(project.cost))) return "Need "+L.bundleText(L.discountedProjectCost(project.cost));
    return "";
  };
  L.startSpecialProject=function(id){
    if(state.game.run.specialProject) return false;
    const project=L.availableSpecialProjects().find(function(item){ return item.id===id; });
    const cost=L.discountedProjectCost((project||{}).cost);
    if(!project || !L.canAfford(cost)) return false;
    L.spend(cost);
    state.game.run.specialProject={id:id,progress:0};
    L.pushLog("Special project started: "+project.name);
    return true;
  };
  L.specialProjectDef=function(){ return state.game.run.specialProject?L.projectDefById(state.game.run.specialProject.id):null; };
  L.pendingProjectDef=function(){ return state.game.run.pendingProjectChoice?L.projectDefById(state.game.run.pendingProjectChoice.id):null; };
  L.chooseProjectCompletion=function(choiceId){
    const pending=state.game.run.pendingProjectChoice, project=L.pendingProjectDef();
    if(!pending || !project) return false;
    if(project.scarRecovery){
      const scarId=choiceId;
      if(!state.game.meta.threatScars[scarId] || (state.game.meta.transformedScars||{})[scarId]) return false;
      state.game.meta.transformedScars[scarId]=true;
      state.game.meta.completedProjects[project.id]=(state.game.meta.completedProjects[project.id]||0)+1;
      L.pushLog("Scar transformed: "+((DATA.SCAR_TRANSFORMS||{})[scarId]||{}).name);
    } else if(project.recoverArtifact){
      const branch=(DATA.ARTIFACT_RESTORATION_BRANCHES||[]).find(function(item){ return item.id===choiceId; });
      if(!branch || !state.game.meta.wornArtifacts[project.recoverArtifact]) return false;
      state.game.meta.restoredArtifacts[project.recoverArtifact]=branch.id;
      if(!state.game.meta.restorationHistory[project.recoverArtifact]) state.game.meta.restorationHistory[project.recoverArtifact]=[];
      state.game.meta.restorationHistory[project.recoverArtifact].push(branch.id);
      state.game.meta.artifacts[project.recoverArtifact]=true;
      delete state.game.meta.wornArtifacts[project.recoverArtifact];
      state.game.meta.completedProjects[project.id]=branch.id;
      L.pushLog("Artifact restored: "+(((DATA.ARTIFACTS||[]).find(function(item){ return item.id===project.recoverArtifact; })||{}).name||project.recoverArtifact)+" - "+branch.name);
    } else {
      const choice=(project.choices||[]).find(function(item){ return item.id===choiceId; });
      if(!choice) return false;
      state.game.meta.completedProjects[project.id]=choice.id;
      L.pushLog("Project completion chosen: "+project.name+" - "+choice.name);
    }
    state.game.run.pendingProjectChoice=null;
    return true;
  };
  L.chooseAscensionPath=function(id){
    if(L.currentStage().id!=="galactic" || state.game.run.ascensionPath) return false;
    const path=(DATA.ASCENSION_PATHS||[]).find(function(item){ return item.id===id; });
    if(!path) return false;
    state.game.run.ascensionPath=id;
    L.pushLog("Ascension path committed: "+path.name);
    return true;
  };
  L.ascensionObjectives=function(){
    const path=state.game.run.ascensionPath;
    return ((DATA.ASCENSION_OBJECTIVES||{})[path]||[]).map(function(obj){
      let done=false, detail="";
      if(obj.resource){ done=(state.game.run.resources[obj.resource]||0)>=obj.target; detail=L.resourceName(obj.resource)+" "+L.fmt(state.game.run.resources[obj.resource]||0)+" / "+L.fmt(obj.target); }
      if(obj.project){ done=!!state.game.meta.completedProjects[obj.project]; detail=done?"Project complete":"Needs "+obj.project; }
      if(obj.kind==="rivals"){ const wins=(state.game.run.rivals||[]).filter(function(r){ return r.victory; }).length; done=wins<=obj.target; detail=wins+" rival victories / max "+obj.target; }
      if(obj.kind==="rivalsMax"){ const wins=(state.game.run.rivals||[]).filter(function(r){ return r.victory; }).length; done=wins<=obj.target; detail=wins+" rival victories / max "+obj.target; }
      return Object.assign({done:done,detail:detail},obj);
    });
  };

  L.lockReasonForAutomation=function(){ return "Generic generators have been replaced by stage production."; };
  L.buyAutomation=function(){ return false; };

  L.sourceCanRun=function(item){
    const consume=((item.effects||{}).consume)||{};
    return Object.entries(consume).every(function(entry){ return (state.game.run.resources[entry[0]]||0)>0 || state.ui.debug; });
  };

  L.lockReasonForTech=function(item){
    if(!L.lineageRequirementMet(item)) return L.lineageRequirementText(item);
    const missing=(item.prereq||[]).filter(function(id){ return !L.requirementMet(id); });
    if(missing.length) return "Needs "+missing.join(", ");
    if(!L.canAfford(L.discountedCost(item.cost))) return "Need "+L.bundleText(L.discountedCost(item.cost));
    return "";
  };
  L.buyTech=function(techId){
    const item=(L.currentStage().technologies||[]).find(function(tech){ return tech.id===techId; });
    if(!item || state.game.run.technologies[item.id]) return false;
    if(!L.lineageRequirementMet(item) && !state.ui.debug) return false;
    if(!L.prereqsMet(item) && !state.ui.debug) return false;
    const cost=L.discountedCost(item.cost);
    if(!L.canAfford(cost)) return false;
    L.spend(cost);
    state.game.run.technologies[item.id]=true;
    L.markSeenContent("tech",item);
    L.addCapacity((item.effects||{}).capacity);
    L.pushLog("Researched "+item.name);
    return true;
  };
  L.purchaseWeight=function(cost){
    return Object.values(cost||{}).reduce(function(sum,value){ return sum+(value||0); },0);
  };
  L.stageAdvanceRequirement=function(stageId){
    const ownedStage=L.ownedSystemsForStage();
    const techStage=L.ownedTechForStage();
    if(stageId==="cell") return {met:!!state.game.run.ownedSystems.nucleus && ownedStage.reduce(function(sum,item){ return sum+(item.ownedCount||1); },0)>=8,text:"Need Nucleus and 8 organelles"};
    if(stageId==="creature") return {met:!!state.game.run.ownedSystems.den_network && ownedStage.reduce(function(sum,item){ return sum+(item.ownedCount||1); },0)>=6,text:"Need Den Network and a stable species body plan"};
    if(stageId==="tribal") return {met:!!state.game.run.ownedSystems.village_center && ownedStage.reduce(function(sum,item){ return sum+(item.ownedCount||1); },0)>=10,text:"Need Village Center and multiple tribal structures"};
    if(stageId==="civilization") return {met:!!state.game.run.technologies.code_of_laws && techStage.length>=4,text:"Need Code of Laws and a civic framework"};
    if(stageId==="empire") return {met:!!state.game.run.ownedSystems.provincial_admin && ownedStage.reduce(function(sum,item){ return sum+(item.ownedCount||1); },0)>=6,text:"Need Provincial Administration and imperial infrastructure"};
    if(stageId==="solar") return {met:!!state.game.meta.completedProjects.ftl_research || (!!state.game.run.technologies.fusion_drives && !!state.game.run.technologies.orbital_construction && !!state.game.run.ownedSystems.shipyard_ring),text:"Need a tested FTL path or equivalent orbital preparation"};
    if(stageId==="galactic") return {met:!!state.game.run.ascensionPath && !!state.game.run.technologies.ascension_protocols,text:"Need a committed ascension and completed ascension protocols"};
    return {met:true,text:""};
  };

  L.availableSpecializations=function(){ return L.hasLockedLineage()?DATA.SPECIALIZATIONS[state.game.run.lockedArchetype]||[]:[]; };
  L.chooseSpecialization=function(id){
    if(!L.hasLockedLineage() || state.game.run.specialization) return false;
    const found=L.availableSpecializations().find(function(item){ return item.id===id; });
    if(!found) return false;
    state.game.run.specialization=id;
    state.game.meta.seenSpecializations[state.game.run.lockedArchetype+":"+id]=true;
    L.pushLog("Specialization chosen: "+found.name);
    return true;
  };
  L.availableLineageEvents=function(){
    const arch=state.game.run.lockedArchetype, stageIndex=state.game.run.stageIndex;
    if(!arch) return [];
    return DATA.LINEAGE_EVENTS.filter(function(event){
      const eventStage=DATA.STAGES.findIndex(function(stage){ return stage.id===event.stage; });
      const chainOk=!event.afterEvent || state.game.run.lineageEvents[event.afterEvent]===event.afterChoice;
      return event.archetype===arch && eventStage>=0 && stageIndex>=eventStage && chainOk;
    });
  };
  L.chooseLineageEvent=function(eventId,choiceId){
    const events=state.game.run.lineageEvents||(state.game.run.lineageEvents={});
    if(events[eventId]) return false;
    const event=L.availableLineageEvents().find(function(item){ return item.id===eventId; });
    if(!event) return false;
    const choice=(event.choices||[]).find(function(item){ return item.id===choiceId; });
    if(!choice) return false;
    events[eventId]=choiceId;
    state.game.meta.seenEvents[eventId+":"+choiceId]=true;
    L.pushLog("Lineage event: "+event.name+" - "+choice.name);
    return true;
  };

  L.stageGoals=function(){
    const stage=L.currentStage(), output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond();
    return DATA.STAGE_GOALS.map(function(goal){
      let done=false, detail="";
      if(goal.id==="score_half"){ done=L.currentScore()>=stage.scoreTarget*0.5; detail=L.fmt(L.currentScore())+" / "+L.fmt(stage.scoreTarget*0.5); }
      if(goal.id==="systems_depth"){ done=L.ownedSystemsForStage().length>=8; detail=L.ownedSystemsForStage().length+" / 8 systems"; }
      if(goal.id==="tech_depth"){ done=stage.id==="cell" || L.ownedTechForStage().length>=4; detail=stage.id==="cell"?"Cell uses organelles":L.ownedTechForStage().length+" / 4 techs"; }
      if(goal.id==="stable_growth"){
        const foodNet=(output.food||0)-(upkeep.food||0), waterNet=(output.water||0)-(upkeep.water||0);
        done=stage.id==="cell" || (state.game.run.population>=25 && foodNet>=0 && waterNet>=0);
        detail=stage.id==="cell"?"Cell goal auto-complete":("Pop "+L.fmt(state.game.run.population)+" | Food "+L.fmt(foodNet)+"/s | Water "+L.fmt(waterNet)+"/s");
      }
      return Object.assign({},goal,{done:done,detail:detail,claimed:!!state.game.run.claimedGoals[L.goalKey(goal)]});
    });
  };
  L.claimStageGoal=function(goalId){
    const goal=L.stageGoals().find(function(item){ return item.id===goalId; });
    if(!goal || !goal.done || goal.claimed) return false;
    state.game.run.claimedGoals[L.goalKey(goal)]=true;
    state.game.meta.evolutionPoints+=goal.reward;
    L.pushLog("Stage goal claimed: "+goal.name+" +"+goal.reward+" EP");
    return true;
  };

  L.automationOutputPerSecond=function(){
    const out=State.emptyResources(), popScale=L.populationScaleMultiplier();
    L.activeEffectSources().forEach(function(item){
      if(!L.sourceCanRun(item)) return;
      const quantity=item.effectiveCount||1;
      Object.entries((item.effects||{}).perSecond||{}).forEach(function(entry){ out[entry[0]]=(out[entry[0]]||0)+entry[1]*quantity*L.automationMultiplier()*popScale*L.resourceOutputMultiplier(entry[0]); });
    });
    return out;
  };

  L.resourceUpkeepPerSecond=function(){
    const upkeep=State.emptyResources(), stage=L.currentStage(), pop=Math.max(0,state.game.run.population);
    L.activeEffectSources().forEach(function(item){
      const hasOutput=Object.keys((item.effects||{}).perSecond||{}).length>0;
      if(hasOutput && !L.sourceCanRun(item)) return;
      const quantity=item.effectiveCount||1;
      Object.entries((item.effects||{}).consume||{}).forEach(function(entry){ upkeep[entry[0]]=(upkeep[entry[0]]||0)+entry[1]*quantity; });
    });
    if(stage.id==="cell"){
      const systemCount=L.ownedSystemsForStage().length;
      upkeep.atp += Math.max(0,systemCount*(0.055+L.sumScalarEffect("upkeepBonus")));
    }
    if(stage.id!=="cell"){
      upkeep.food += pop*0.006;
      upkeep.water += pop*0.004;
    }
    if(["tribal","civilization","empire","solar","galactic"].includes(stage.id)){
      upkeep.happiness += Math.max(0,pop-20)*0.0015;
    }
    return upkeep;
  };

  L.tick=function(dt){
    if(state.ui.betweenRuns || !state.running) return;
    L.ensureWorldState();
    state.game.run.time += dt;
    (state.game.run.rivals||[]).forEach(function(rival){
      if(rival.victory) return;
      if(rival.score>=(85-(L.upgradeLevel("rival_scan")||0)*2) && !rival.pressureNoted){
        rival.pressureNoted=true;
        L.noteRivalStudy(rival.archetype);
      }
      rival.score+=rival.trend*dt*(1+state.game.run.stageIndex*0.2);
      if(rival.score>=100){
        rival.score=100;
        rival.victory=true;
        L.noteRivalVictory(rival);
        L.pushLog("A rival lineage has reached victory pressure: "+L.displayArchetypeName(rival.archetype)+".");
      }
    });
    const project=L.specialProjectDef();
    if(project && state.game.run.specialProject){
      state.game.run.specialProject.progress=Math.min(project.duration,state.game.run.specialProject.progress+dt);
      if(state.game.run.specialProject.progress>=project.duration){
        if(project.choices || project.scarRecovery || project.recoverArtifact){
          state.game.run.pendingProjectChoice={id:project.id};
          L.pushLog("Special project awaits completion choice: "+project.name);
        } else {
          state.game.meta.completedProjects[project.id]=true;
          if(project.targetArchetype) L.completeRivalCounterProject(project);
          L.pushLog("Special project completed: "+project.name);
        }
        state.game.run.specialProject=null;
      }
    }
    const maintenance=L.wonderMaintenanceCost();
    if(maintenance){
      state.game.run.wonderMaintenanceTimer+=dt;
      if(state.game.run.wonderMaintenanceTimer>=90){
        state.game.run.wonderMaintenanceTimer=0;
        L.maintainWonders();
      }
    } else state.game.run.wonderMaintenanceTimer=0;
    L.runMetaAutomation(dt);
    L.gain(L.automationOutputPerSecond(),dt);
    const upkeep=L.resourceUpkeepPerSecond();
    Object.entries(upkeep).forEach(function(entry){ state.game.run.resources[entry[0]]=Math.max(0,(state.game.run.resources[entry[0]]||0)-entry[1]*dt); });
    if(L.currentStage().id!=="cell"){
      ["food","water"].forEach(function(key){
        const empty=(state.game.run.resources[key]||0)<=0;
        state.game.run.resourceFailures[key]=empty?((state.game.run.resourceFailures[key]||0)+dt):0;
      });
      const woodDry=((upkeep.wood||0)>(L.automationOutputPerSecond().wood||0)) && (state.game.run.resources.wood||0)<=0;
      state.game.run.resourceFailures.wood=woodDry?((state.game.run.resourceFailures.wood||0)+dt):0;
      if((state.game.run.resourceFailures.food||0)>=60 || (state.game.run.resourceFailures.water||0)>=60){
        state.game.meta.lastRunReview=L.buildRunReview("Collapse",0,{failure:"Starvation",failureResource:(state.game.run.resourceFailures.food||0)>=60?"food":"water"});
        state.ui.betweenRuns=true;
        state.ui.betweenRunsStep="review";
        state.game.run=State.createRun(state.game.meta);
        state.game.run.log.push("Run collapsed due to prolonged shortage.");
        return;
      }
    }
    const popGain=L.sumScalarEffect("populationGrowth")*dt;
    if(popGain>0 && (state.game.run.resources.food||0)>0 && (state.game.run.resources.water||0)>0) state.game.run.population+=popGain;
    if(L.currentStage().id==="cell") state.game.run.population+=0.001*dt*L.ownedSystemsForStage().length;
  };

  L.autoBuyOrganelles=function(){
    if(L.currentStage().id!=="cell") return false;
    if(state.game.meta.automationSettings && state.game.meta.automationSettings.organellesEnabled===false) return false;
    const target=state.game.meta.autoOrganelleTarget;
    const choices=(L.currentStage().systems||[]).filter(function(item){ return !state.game.run.ownedSystems[item.id] && !L.lockReasonForSystem(item); });
    const picked=choices.sort(function(a,b){ return (L.itemAffinity(b)[target]||0)-(L.itemAffinity(a)[target]||0); })[0]||choices[0];
    return picked?L.buySystem(picked.id):false;
  };
  L.autoBuyInfrastructure=function(){
    if(L.currentStage().id==="cell") return false;
    if(state.game.meta.automationSettings && state.game.meta.automationSettings.infrastructureEnabled===false) return false;
    const choices=(L.currentStage().systems||[]).filter(function(item){
      return !state.game.run.ownedSystems[item.id] && Object.keys((item.effects||{}).perSecond||{}).length>0 && !L.lockReasonForSystem(item);
    });
    if(!choices.length) return false;
    const resources=L.currentStage().resources;
    const policy=state.game.run.automationPolicy||"balanced", lineage=state.game.run.lockedArchetype;
    function policyScore(item){
      const effects=item.effects||{}, per=effects.perSecond||{}, output=effects.resourceOutput||{};
      if(policy==="food") return (per.food||0)*4+(per.water||0)*3+(output.food||0)+(output.water||0);
      if(policy==="science") return (per.science||0)*4+(per.data||0)*3+(output.science||0)+(output.data||0);
      if(policy==="low_pollution") return -((per.pollution||0)*6+((effects.consume||{}).pollution||0)*4+(output.pollution||0)*2);
      if(policy==="lineage") return (item.archetypeReq===lineage?8:0)+((L.itemAffinity(item)[lineage]||0)*2);
      return 0;
    }
    const picked=choices.sort(function(a,b){
      const score=policyScore(b)-policyScore(a);
      if(score) return score;
      const aOut=Object.keys((a.effects||{}).perSecond||{})[0]||resources[0];
      const bOut=Object.keys((b.effects||{}).perSecond||{})[0]||resources[0];
      const aRatio=(state.game.run.resources[aOut]||0)/Math.max(1,L.capacityFor(aOut));
      const bRatio=(state.game.run.resources[bOut]||0)/Math.max(1,L.capacityFor(bOut));
      return aRatio-bRatio || resources.indexOf(aOut)-resources.indexOf(bOut);
    })[0];
    return picked?L.buySystem(picked.id):false;
  };
  L.runMetaAutomation=function(dt){
    const timers=state.game.run.autoTimers||(state.game.run.autoTimers={organelles:0,infrastructure:0,generators:0});
    if(timers.infrastructure==null) timers.infrastructure=timers.generators||0;
    const organelleLevel=L.upgradeLevel("auto_organelles"), generatorLevel=L.upgradeLevel("auto_generators");
    if(organelleLevel>0 && L.currentStage().id==="cell" && (!state.game.meta.automationSettings || state.game.meta.automationSettings.organellesEnabled!==false)){
      timers.organelles += dt;
      const interval=Math.max(2,11-organelleLevel);
      if(timers.organelles>=interval){ timers.organelles=0; L.autoBuyOrganelles(); }
    }
    if(generatorLevel>0 && (!state.game.meta.automationSettings || state.game.meta.automationSettings.infrastructureEnabled!==false)){
      timers.infrastructure += dt;
      const interval=Math.max(2,12-generatorLevel);
      if(timers.infrastructure>=interval){ timers.infrastructure=0; L.autoBuyInfrastructure(); }
    }
  };

  L.currentScore=function(){
    const stage=L.currentStage();
    let score=0;
    stage.resources.forEach(function(key){ score+=Math.sqrt(Math.max(0,state.game.run.resources[key]||0))*7; });
    score+=Math.sqrt(Math.max(1,state.game.run.population))*8;
    score+=L.ownedSystemsForStage().reduce(function(sum,item){ return sum+(item.ownedCount||1); },0)*10;
    score+=L.ownedTechForStage().length*12;
    score+=L.sumScalarEffect("score");
    return Math.round(score);
  };
  L.canEvolve=function(){
    if(state.ui.debug) return true;
    if(state.ui.betweenRuns || L.currentScore()<L.currentStage().scoreTarget) return false;
    if(!L.stageAdvanceRequirement(L.currentStage().id).met) return false;
    if(L.currentStage().id==="galactic" && !state.game.run.ascensionPath) return false;
    return true;
  };
  L.buildRunReview=function(kind,epAward,extra){
    const stage=L.currentStage(), output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond();
    const topResources=stage.resources.map(function(id){ return {id:id,net:(output[id]||0)-(upkeep[id]||0),value:state.game.run.resources[id]||0}; }).sort(function(a,b){ return b.net-a.net; }).slice(0,4);
    const topSystems=L.ownedSystemsForStage().slice().sort(function(a,b){
      const aPer=Object.values((a.effects||{}).perSecond||{}).reduce(function(sum,value){ return sum+value; },0);
      const bPer=Object.values((b.effects||{}).perSecond||{}).reduce(function(sum,value){ return sum+value; },0);
      return bPer-aPer;
    }).slice(0,5).map(function(item){ return item.name; });
    const rivalWins=(state.game.run.rivals||[]).filter(function(rival){ return rival.victory; }).length;
    const alerts=L.pressureAlerts().map(function(alert){ return alert.title; });
    const medals=(DATA.RUN_MEDALS||[]).filter(function(medal){
      if(medal.condition==="fast") return state.game.run.time<180;
      if(medal.condition==="no_rivals") return rivalWins===0 && stage.id==="galactic";
      if(medal.condition==="tension") return L.ascensionTension()>=55;
      if(medal.condition==="wonders") return Object.keys(state.game.run.mapWonders||{}).length>=2;
      if(medal.condition==="clean") return alerts.length===0;
      return false;
    }).map(function(medal){ return medal.id; });
    return Object.assign({
      kind:kind,
      stage:stage.name,
      score:L.currentScore(),
      target:stage.scoreTarget,
      epAward:epAward||0,
      time:state.game.run.time,
      population:state.game.run.population,
      archetype:state.game.run.lockedArchetype||L.dominantArchetype(),
      specialization:state.game.run.specialization||"",
      ascensionPath:state.game.run.ascensionPath||"",
      legacyTier:state.game.meta.legacyTier,
      topResources:topResources,
      topSystems:topSystems,
      rivalWins:rivalWins,
      rivalsBeaten:(state.game.run.rivals||[]).filter(function(rival){ return !rival.victory; }).length,
      congress:state.game.run.congressChoice,
      wonders:Object.keys(state.game.run.mapWonders||{}).length,
      alerts:alerts,
      medals:medals,
      stageMastery:Object.assign({},state.game.meta.stageMastery||{}),
      date:Date.now()
    },extra||{});
  };
  L.createLineageChronicle=function(victoryName,review){
    const arch=review.archetype||"unknown", path=review.ascensionPath||"none";
    const count=(state.game.meta.archetypeWins[arch]||0);
    const openings=["The "+L.archetypeName(arch)+" lineage carried", "Archivists recorded", "Later descendants remembered", "The museum names"];
    const focus=review.rivalWins>0?"contested ascension":((review.medals||[]).includes("no_rival_victories")?"quiet supremacy":"deep continuity");
    const title=DATA.PATH_ENDING_TITLES[path]||"Transcendent";
    return {id:Date.now()+":"+arch+":"+path,name:title+" Chronicle "+count,text:openings[count%openings.length]+" "+victoryName+" as a "+focus+" shaped by "+(review.wonders||0)+" wonders and "+(review.rivalsBeaten||0)+" contained rivals.",archetype:arch,path:path,time:Date.now()};
  };
  L.recordEraLegacy=function(){
    const era=L.currentEra();
    if(!era) return false;
    const legacy=(DATA.ERA_LEGACIES||{})[era.id];
    if(!legacy || state.game.meta.eraLegacies[era.id]) return false;
    state.game.meta.eraLegacies[era.id]=true;
    L.pushLog("Era legacy recorded: "+legacy.name);
    return true;
  };
  L.evolve=function(){
    if(!L.canEvolve()) return false;
    const stage=L.currentStage(), archivedSystems=L.ownedSystemsForStage(), archivedAffinity={};
    archivedSystems.forEach(function(item){ L.addAffinity(archivedAffinity,L.itemAffinity(item)); });
    const evolvedArchetype=L.dominantArchetype();
    if(stage.id==="creature"){
      state.game.meta.revealedArchetypes[evolvedArchetype]=true;
      state.game.run.lockedArchetype=evolvedArchetype;
    }
    state.game.run.archive.push({stageId:stage.id,stageName:stage.name,systems:archivedSystems.map(function(item){ return item.name; }),traits:archivedSystems.flatMap(function(item){ return item.traits||[]; }),archetype:evolvedArchetype,affinity:archivedAffinity});
    state.game.meta.stageMastery[stage.id]=(state.game.meta.stageMastery[stage.id]||0)+1;
    const contract=(DATA.STAGE_CONTRACTS||[]).find(function(item){ return item.id===state.game.run.activeContract; });
    if(contract){
      state.game.meta.evolutionPoints+=contract.reward;
      state.game.meta.completedContracts[contract.id]=(state.game.meta.completedContracts[contract.id]||0)+1;
      L.pushLog("Stage contract completed: "+contract.name+" +"+contract.reward+" EP");
      state.game.run.activeContract="";
    }
    L.recordEraLegacy();
    L.recordThreatScars();
    L.tryAwardArtifact(stage.id);
    if(state.game.run.stageIndex>=DATA.STAGES.length-1){
      const baseVictoryName=DATA.VICTORY_VARIANTS[state.game.run.lockedArchetype]||"Galactic Transcendence";
      const pathTitle=(DATA.PATH_ENDING_TITLES||{})[state.game.run.ascensionPath]||"Transcendent";
      const victoryName=pathTitle+" "+baseVictoryName;
      const arch=state.game.run.lockedArchetype||"unknown";
      const rivalWins=(state.game.run.rivals||[]).filter(function(rival){ return rival.victory; }).length;
      const objectiveAward=L.ascensionObjectives().filter(function(obj){ return obj.done; }).reduce(function(sum,obj){ return sum+(obj.reward||0); },0);
      const oldWins=state.game.meta.galacticWins, newWins=oldWins+1;
      const newlyUnlocked=(DATA.META_UNLOCKS||[]).filter(function(unlock){ return unlock.wins>oldWins && unlock.wins<=newWins; });
      const legacy=L.legacyTierDef(), baseEp=Math.max(10,25-rivalWins*3)+objectiveAward;
      const epAward=Math.max(1,Math.round(baseEp*(legacy?legacy.epMult||1:1)));
      const rivalEndings=(state.game.run.rivals||[]).filter(function(rival){ return rival.victory; }).map(function(rival){ return {archetype:rival.archetype,path:rival.path,name:L.rivalEndingName(rival),time:Date.now()}; });
      state.game.meta.galacticWins+=1;
      state.game.meta.lastMilestoneWins=newWins;
      state.game.meta.archetypeWins[arch]=(state.game.meta.archetypeWins[arch]||0)+1;
      state.game.meta.lastRunReview=L.buildRunReview("Victory",epAward,{victoryName:victoryName,objectiveAward:objectiveAward,unlocks:newlyUnlocked.map(function(item){ return item.name; })});
      L.completeMasteryChallenges(stage.id,state.game.meta.lastRunReview);
      state.game.meta.lastRunReview.rivalEndings=rivalEndings;
      if(rivalEndings.length) state.game.meta.rivalEndings=rivalEndings.concat(state.game.meta.rivalEndings||[]).slice(0,30);
      state.game.meta.lineageChronicles.unshift(L.createLineageChronicle(victoryName,state.game.meta.lastRunReview));
      state.game.meta.lineageChronicles=state.game.meta.lineageChronicles.slice(0,40);
      state.game.meta.victoryLog.unshift({archetype:arch,name:victoryName,specialization:state.game.run.specialization||"",ascensionPath:state.game.run.ascensionPath||"",legacyTier:state.game.meta.legacyTier,objectives:L.ascensionObjectives().filter(function(obj){ return obj.done; }).map(function(obj){ return obj.id; }),rivalsBeaten:(state.game.run.rivals||[]).filter(function(rival){ return !rival.victory; }).length,rivalPressure:rivalWins,artifacts:Object.keys(state.game.meta.artifacts||{}),projects:Object.keys(state.game.meta.completedProjects||{}),unlocks:newlyUnlocked.map(function(item){ return item.name; }),time:Date.now()});
      state.game.meta.victoryLog=state.game.meta.victoryLog.slice(0,20);
      state.game.meta.evolutionPoints+=epAward;
      L.applyArtifactWear();
      ["lithoid","necroid","toxoid","extremophile"].forEach(function(id){ state.game.meta.unlockedRareArchetypes[id]=true; });
      state.game.run=State.createRun(state.game.meta);
      state.ui.betweenRuns=true;
      state.ui.betweenRunsStep="review";
      state.game.run.log.push(victoryName+" achieved. "+epAward+" Evolution Points awarded"+(legacy&&legacy.epMult!==1?(" with "+legacy.name+" x"+legacy.epMult):"")+(objectiveAward?(" including "+objectiveAward+" from path objectives"):"")+(newlyUnlocked.length?(". New unlocks: "+newlyUnlocked.map(function(item){ return item.name; }).join(", ")):"")+".");
      return true;
    }
    const nextStage=DATA.STAGES[state.game.run.stageIndex+1], carryResources={}, carryCaps={};
    (nextStage.carryResources||[]).forEach(function(resourceId){ carryResources[resourceId]=state.game.run.resources[resourceId]||0; carryCaps[resourceId]=state.game.run.capacities[resourceId]||25; });
    const carryPopulation=nextStage.carryPopulation?state.game.run.population:8, archive=state.game.run.archive.slice(), lockedArchetype=state.game.run.lockedArchetype;
    state.game.run.stageIndex+=1;
    state.game.run.resources=State.emptyResources();
    state.game.run.capacities=State.emptyCapacities();
    Object.entries(carryResources).forEach(function(entry){ state.game.run.resources[entry[0]]=entry[1]; });
    Object.entries(carryCaps).forEach(function(entry){ state.game.run.capacities[entry[0]]=entry[1]; });
    if(nextStage.id==="creature"){
      state.game.run.resources.food=Math.max(state.game.run.resources.food||0,18);
      state.game.run.resources.water=Math.max(state.game.run.resources.water||0,18);
      state.game.run.resources.materials=Math.max(state.game.run.resources.materials||0,12);
    }
    if(nextStage.resources.includes("happiness") && !state.game.run.resources.happiness) state.game.run.resources.happiness=70;
    state.game.run.activeContract="";
    state.game.run.specialProject=null;
    state.game.run.archive=archive;
    state.game.run.lockedArchetype=lockedArchetype;
    state.game.run.population=Math.max(carryPopulation,10);
    L.pushLog("Evolved into "+L.currentStage().name+".");
    L.ensureWorldState();
    return true;
  };
  L.recordThreatScars=function(){
    const projects=DATA.THREAT_PROJECTS||[], active=L.threats();
    active.forEach(function(threat){
      const solved=projects.some(function(project){ return project.threat===threat.id && state.game.run.threatProjects[project.id]; });
      if(solved) return;
      state.game.meta.threatScars[threat.id]=(state.game.meta.threatScars[threat.id]||0)+1;
      if(state.game.meta.threatScars[threat.id]>=3 && !state.game.meta.transformedScars[threat.id]){
        L.pushLog("Threat scar mutated: "+(((DATA.THREAT_SCARS||{})[threat.id]||{}).name||threat.title)+" has deepened.");
      }
      const scar=(DATA.THREAT_SCARS||{})[threat.id];
      L.pushLog("Threat scar recorded: "+(scar?scar.name:threat.title)+".");
    });
  };
  L.tryAwardArtifact=function(stageId){
    const claimed=Object.keys(state.game.run.claimedGoals||{}).filter(function(key){ return key.startsWith(stageId+":"); }).length;
    if(claimed<2 && L.currentScore()<L.currentStage().scoreTarget*0.9) return false;
    const artifact=DATA.ARTIFACTS.find(function(item){ return item.stage===stageId && !state.game.meta.artifacts[item.id]; });
    if(!artifact) return false;
    state.game.meta.artifacts[artifact.id]=true;
    L.pushLog("Artifact inherited: "+artifact.name);
    return true;
  };
  L.masteryChallengesForStage=function(stageId){
    return (DATA.MASTERY_CHALLENGES[stageId]||[]).map(function(challenge){
      return Object.assign({completed:!!state.game.meta.completedMasteryChallenges[L.archiveFavoriteKey(stageId,challenge.id)]},challenge);
    });
  };
  L.evaluateMasteryChallenge=function(stageId,challenge,review){
    if(challenge.condition==="no_atp_drain") return !(review.alerts||[]).some(function(item){ return item.indexOf("ATP drain")>=0; });
    if(challenge.condition==="fast120") return review.time<120;
    if(challenge.condition==="no_instability") return !(review.alerts||[]).some(function(item){ return item.indexOf("Instability")>=0; });
    if(challenge.condition==="wonders1") return (review.wonders||0)>=1;
    if(challenge.condition==="no_rivals") return (review.rivalWins||0)===0;
    if(challenge.condition==="fast220") return review.time<220;
    if(challenge.condition==="artifact_depth") return Object.keys(state.game.meta.artifactEvolutions||{}).length + L.artifactFusionSources().length >= 3;
    return false;
  };
  L.completeMasteryChallenges=function(stageId,review){
    L.masteryChallengesForStage(stageId).forEach(function(challenge){
      const key=L.archiveFavoriteKey(stageId,challenge.id);
      if(state.game.meta.completedMasteryChallenges[key]) return;
      if(L.evaluateMasteryChallenge(stageId,challenge,review)){
        state.game.meta.completedMasteryChallenges[key]=true;
        state.game.meta.evolutionPoints += challenge.reward||0;
        L.pushLog("Mastery challenge completed: "+challenge.name+" +"+(challenge.reward||0)+" EP");
      }
    });
    const allDone=L.masteryChallengesForStage(stageId).length && L.masteryChallengesForStage(stageId).every(function(challenge){
      return !!state.game.meta.completedMasteryChallenges[L.archiveFavoriteKey(stageId,challenge.id)];
    });
    if(allDone && !state.game.meta.masteryRelics[stageId] && (DATA.MASTERY_RELICS||{})[stageId]){
      state.game.meta.masteryRelics[stageId]=true;
      L.pushLog("Mastery relic unlocked: "+DATA.MASTERY_RELICS[stageId].name);
    }
  };

  L.rebirthScoreTarget=function(){ return Math.ceil(L.currentStage().scoreTarget*0.25); };
  L.canRebirth=function(){
    if(state.ui.betweenRuns) return false;
    if(L.currentScore()<L.rebirthScoreTarget()) return false;
    return state.ui.debug || state.game.run.time>=45 || state.game.run.stageIndex>=1;
  };
  L.rebirthGain=function(){ if(!L.canRebirth()) return 0; const scorePart=L.currentScore()/Math.max(1,L.currentStage().scoreTarget); return Math.max(1,Math.floor(state.game.run.stageIndex*3+scorePart*4+Math.log10(1+state.game.run.population))); };
  L.rebirth=function(){ if(!L.canRebirth()) return false; const gainValue=L.rebirthGain(); state.game.meta.lastRunReview=L.buildRunReview("Rebirth",gainValue); L.completeMasteryChallenges(L.currentStage().id,state.game.meta.lastRunReview); state.game.meta.evolutionPoints+=gainValue; state.game.run=State.createRun(state.game.meta); state.ui.betweenRuns=true; state.ui.betweenRunsStep="review"; state.game.run.log.push("Rebirth awarded "+gainValue+" Evolution Points."); return true; };
  L.buyUpgrade=function(id){ const def=DATA.SHOP_UPGRADES.find(function(item){ return item.id===id; }); if(!def) return false; if(def.requiresWin && state.game.meta.galacticWins<(def.minWins||1) && !state.ui.debug) return false; const level=L.upgradeLevel(id); if(level>=def.max) return false; const cost=def.base+level*def.base; if(state.game.meta.evolutionPoints<cost && !state.ui.debug) return false; if(!state.ui.debug) state.game.meta.evolutionPoints-=cost; state.game.meta.upgrades[id]=level+1; return true; };
  L.hasAutomationControls=function(){ return L.upgradeLevel("auto_organelles")>0 || L.upgradeLevel("auto_generators")>0; };

  L.stageHint=function(){
    const stage=L.currentStage();
    if(state.ui.betweenRuns) return "Spend Evolution Points, then start the next run.";
    if(stage.id==="cell") return "Click ATP first, build starter organelles, then stabilize ATP upkeep with metabolism and advanced organelles.";
    if(stage.id==="creature") return "Secure food and water, build a Nest, then unlock Thinking for knowledge and culture.";
    if(stage.id==="tribal") return "Build the Village Center, then shift into buildings, science, culture, happiness, and military power.";
    if(stage.id==="civilization") return "Cities convert the loop into production, gold, science, institutions, and formal military growth.";
    if(stage.id==="empire") return "Regions and administration scale production, logistics, influence, and military organization.";
    if(stage.id==="solar") return "Start from one colony, build energy, alloys, habitats, and orbital infrastructure.";
    return "Bind systems into a galactic network and commit to an ascension path.";
  };
  L.stagePaceText=function(){
    const output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond(), primary=L.currentStage().resources[0], advance=L.stageAdvanceRequirement(L.currentStage().id);
    const shortage=((state.game.run.resourceFailures||{}).food||0)>0||((state.game.run.resourceFailures||{}).water||0)>0?(" | Collapse in "+L.fmt(60-Math.max((state.game.run.resourceFailures||{}).food||0,(state.game.run.resourceFailures||{}).water||0))+"s"):"";
    return L.resourceName(primary)+" "+(L.rateText((output[primary]||0)-(upkeep[primary]||0))||"steady")+" | "+advance.text+shortage;
  };
  L.resourceSummary=function(){
    const output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond();
    return L.currentStage().resources.map(function(key){ return {id:key,name:L.resourceName(key),value:state.game.run.resources[key]||0,perSecond:(output[key]||0)-(upkeep[key]||0),capacity:L.capacityFor(key)}; }).filter(function(row,index){
      return index<4 || row.value>0 || Math.abs(row.perSecond)>=0.01 || ["food","water","energy","production","science","atp"].includes(row.id);
    }).sort(function(a,b){
      const aHot=(Math.abs(a.perSecond)>=0.01||a.value>0)?0:1;
      const bHot=(Math.abs(b.perSecond)>=0.01||b.value>0)?0:1;
      return aHot-bHot || L.currentStage().resources.indexOf(a.id)-L.currentStage().resources.indexOf(b.id);
    }).slice(0,8);
  };
  L.automationSummary=function(){
    const sources=L.activeEffectSources().filter(function(item){ return Object.keys((item.effects||{}).perSecond||{}).length>0 || Object.keys((item.effects||{}).consume||{}).length>0; });
    const output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond();
    const positive=Object.entries(output).filter(function(entry){ return entry[1]>0; }).length;
    const drains=Object.entries(upkeep).filter(function(entry){ return entry[1]>0; }).length;
    const autoLevels={organelles:L.upgradeLevel("auto_organelles"),infrastructure:L.upgradeLevel("auto_generators")};
    return {sources:sources,positive:positive,drains:drains,autoLevels:autoLevels};
  };
  L.pressureAlerts=function(){
    const output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond(), alerts=[];
    L.currentStage().resources.forEach(function(key){
      const value=state.game.run.resources[key]||0, cap=L.capacityFor(key), net=(output[key]||0)-(upkeep[key]||0);
      if((upkeep[key]||0)>0 && net<0) alerts.push({kind:"drain",resource:key,title:L.resourceName(key)+" drain",detail:"Net "+L.fmt(net)+"/s. Upkeep is outpacing production."});
      else if(cap>0 && value/cap>0.92 && (output[key]||0)>0) alerts.push({kind:"cap",resource:key,title:L.resourceName(key)+" capped",detail:"Storage is nearly full. Buy capacity or spend it."});
      else if(cap>0 && value/cap<0.12 && (output[key]||0)<=0 && (upkeep[key]||0)>0) alerts.push({kind:"shortage",resource:key,title:L.resourceName(key)+" shortage",detail:"Low reserves and no positive production."});
    });
    return alerts.slice(0,8);
  };
  L.resourceRoutes=function(){
    return L.activeEffectSources().map(function(item){
      const consume=(item.effects||{}).consume||{}, produce=(item.effects||{}).perSecond||{};
      if(!Object.keys(consume).length && !Object.keys(produce).length) return null;
      return {name:item.name,from:Object.keys(consume).map(function(id){ return L.resourceName(id)+" "+L.fmt(consume[id])+"/s"; }).join(", "),to:Object.keys(produce).map(function(id){ return L.resourceName(id)+" "+L.fmt(produce[id])+"/s"; }).join(", ")};
    }).filter(Boolean);
  };
  L.threats=function(){
    const alerts=L.pressureAlerts(), output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond(), stage=L.currentStage(), threats=[];
    function push(id,title,detail,severity){ threats.push({id:id,title:title,detail:detail,severity:severity}); }
    if(alerts.some(function(a){ return ["food","water"].includes(a.resource) && a.kind==="drain"; })) push("famine","Famine Pressure","Food or water is trending negative.",2);
    if((state.game.run.resources.happiness||100)<25 || ((output.happiness||0)-(upkeep.happiness||0))<0) push("instability","Instability","Happiness is low or declining.",1);
    if((state.game.run.resources.pollution||0)>L.capacityFor("pollution")*0.6) push("ecology","Ecological Strain","Pollution reserves are high.",2);
    if(["empire","solar","galactic"].includes(stage.id) && (state.game.run.resources.military_power||0)<20) push("security","Security Gap","Military reserves are thin for this stage.",1);
    if(stage.id==="galactic" && ((state.game.run.resources.cohesion||0)<20 || (state.game.run.resources.ascension||0)<10)) push("crisis","Cosmic Crisis","Cohesion or ascension readiness is dangerously low.",3);
    if((state.game.run.rivals||[]).some(function(rival){ return rival.victory || rival.score>=85; })) push("rival","Rival Victory Pressure","A competing lineage is close to forcing a crisis or reducing final EP.",3);
    return threats;
  };
  L.codexSummary=function(){
    const meta=state.game.meta;
    const museum={};
    (meta.victoryLog||[]).forEach(function(victory){
      const arch=victory.archetype||"unknown", path=victory.ascensionPath||"none", key=arch+":"+path;
      if(!museum[key]) museum[key]={archetype:arch,path:path,count:0,bestObjectives:0,lastName:victory.name};
      museum[key].count+=1;
      museum[key].bestObjectives=Math.max(museum[key].bestObjectives,(victory.objectives||[]).length);
      museum[key].lastName=victory.name;
    });
    const rewards=(DATA.MUSEUM_REWARDS||[]).filter(function(reward){
      return Object.values(museum).some(function(row){ return row.count>=reward.count; });
    });
    return {
      archetypesRevealed:Object.keys(meta.revealedArchetypes||{}).length,
      archetypeWins:meta.archetypeWins||{},
      specializations:Object.keys(meta.seenSpecializations||{}).length,
      events:Object.keys(meta.seenEvents||{}).length,
      content:Object.keys(meta.seenContent||{}).length,
      archiveBoost:L.archiveBoostValue(),
      timelineRecords:L.timelineRecordCount(),
      victories:meta.victoryLog||[],
      rivalEndings:meta.rivalEndings||[],
      chronicles:meta.lineageChronicles||[],
      dossiers:meta.rivalDossiers||{},
      stageMastery:meta.stageMastery||{},
      artifactEvolutions:meta.artifactEvolutions||{},
      favorites:meta.archiveFavorites||{},
      masteryChallenges:meta.completedMasteryChallenges||{},
      evolvedDoctrines:meta.evolvedDoctrines||{},
      masteryRelics:meta.masteryRelics||{},
      wornArtifacts:meta.wornArtifacts||{},
      restoredArtifacts:meta.restoredArtifacts||{},
      congressInstitutions:meta.congressInstitutionLevels||{},
      timelineMilestones:L.timelineMilestoneSources(),
      institutionTraits:L.institutionTraitSources(),
      timelineAnchors:L.timelineAnchorSources(),
      museum:Object.values(museum).sort(function(a,b){ return b.count-a.count || b.bestObjectives-a.bestObjectives; }),
      museumRewards:rewards
    };
  };
  L.worldSummary=function(){
    L.ensureWorldState();
    const era=L.currentEra(), artifacts=DATA.ARTIFACTS.filter(function(item){ return !!state.game.meta.artifacts[item.id]; });
    const stageMutators=state.game.run.activeMutators||{}, stageId=L.currentStage().id;
    return {era:era,forecast:L.nextEraForecast(),slots:L.mapSlotsForStage(),artifacts:artifacts,artifactSets:L.artifactSetSources(),artifactEvolutions:L.availableArtifactEvolutions(),artifactFusions:L.artifactFusionSources(),restoredArtifacts:L.restoredArtifactSources(),restorationChains:L.restorationChainSources(),masteryRelics:L.masteryRelicSources(),rivals:state.game.run.rivals||[],vassals:state.game.meta.vassals||{},vassalDemands:L.availableVassalDemands(),templates:state.game.meta.templates||{},mapPresets:state.game.meta.mapPresets||{},stageLayouts:L.availableStageLayouts(stageId),activeStageLayout:L.activeStageLayout(stageId),stageMastery:L.stageMasteryCount(stageId),masteryChallenges:L.masteryChallengesForStage(stageId),adjacency:L.adjacencySources(),tagSynergies:L.tagSynergySources(),contracts:L.availableContracts(),rivalInteractions:L.availableRivalInteractions(),rivalDefections:L.availableRivalDefections(),threatProjects:L.availableThreatProjects(),activeContract:state.game.run.activeContract,secondaryArchetype:state.game.run.secondaryArchetype,automationPolicy:state.game.run.automationPolicy||"balanced",archiveMilestones:L.archiveMilestoneSources(),timelineMilestones:L.timelineMilestoneSources(),timelineAnchors:L.timelineAnchorSources(),threatScars:L.threatScarSources(),transformedScars:L.transformedScarSources(),wornArtifacts:state.game.meta.wornArtifacts||{},mutatorDraft:L.mutatorDraft(),activeMutator:Object.prototype.hasOwnProperty.call(stageMutators,stageId)?stageMutators[stageId]:null,lineageLaws:L.availableLineageLaws(),doctrines:L.availableDoctrines(),doctrineEvolutions:L.availableDoctrineEvolutions(),activeDoctrine:state.game.run.doctrine,lawSets:L.lawSetSources(),lawCongress:L.lawCongressSources(),worldEvents:state.game.run.worldEvents[L.currentStage().id]||{},worldEventChoices:state.game.run.worldEventChoices[L.currentStage().id]||{},congressProposals:L.availableCongressProposals(),congressChoice:state.game.run.congressChoice,currentCongress:L.currentCongressProposal(),nextCongressSeason:L.nextCongressSeason(),congressInstitutionLevels:state.game.meta.congressInstitutionLevels||{},institutionTraits:L.institutionTraitSources(),congressCrisis:L.activeCongressCrisis(),congressCrisisChoice:state.game.run.rivalEvents.congressCrisis||"",institutionCrisis:L.activeInstitutionCrisis(),institutionCrisisChoice:state.game.run.rivalEvents.institutionCrisis||"",mapWonders:state.game.run.mapWonders||{},mapWonderSources:L.mapWonderSources(),wonderSets:L.wonderSetSources(),legacyTier:L.legacyTierDef(),legacyTiers:L.availableLegacyTiers(),cosmeticThemes:L.availableCosmeticThemes(),activeCosmeticTheme:state.game.meta.cosmeticTheme||"",ascensionTension:L.ascensionTension(),museumRewards:L.museumRewardSources(),specialProjects:L.availableSpecialProjects(),allSpecialProjects:(DATA.SPECIAL_PROJECTS||[]).concat(L.rivalCounterProjectDefs(),L.dossierOperationDefs(),L.artifactRecoveryProjectDefs()).filter(function(item){ return item.stage===L.currentStage().id; }),specialProject:state.game.run.specialProject,pendingProject:L.pendingProjectDef(),ascensionPath:state.game.run.ascensionPath,ascensionObjectives:L.ascensionObjectives(),unlocks:DATA.META_UNLOCKS||[]};
  };
  L.saveBuildTemplate=function(name){
    const key=(name||"Default").trim()||"Default";
    state.game.meta.templates[key]={autoOrganelleTarget:state.game.meta.autoOrganelleTarget,specialization:state.game.run.specialization||"",automationPolicy:state.game.run.automationPolicy||"balanced",automationSettings:Object.assign({},state.game.meta.automationSettings||{}),doctrine:state.game.run.doctrine||""};
    L.pushLog("Build template saved: "+key);
    return true;
  };
  L.applyBuildTemplate=function(name){
    const template=(state.game.meta.templates||{})[name];
    if(!template) return false;
    if(template.autoOrganelleTarget) state.game.meta.autoOrganelleTarget=template.autoOrganelleTarget;
    if(template.automationSettings) state.game.meta.automationSettings=Object.assign({},template.automationSettings);
    if(template.automationPolicy) state.game.run.automationPolicy=template.automationPolicy;
    if(template.specialization && !state.game.run.specialization && L.hasLockedLineage()) L.chooseSpecialization(template.specialization);
    if(template.doctrine && !state.game.run.doctrine && L.availableDoctrines().some(function(item){ return item.id===template.doctrine; })) L.chooseDoctrine(template.doctrine);
    L.pushLog("Build template applied: "+name);
    return true;
  };
  L.seedTemplateFromFavorite=function(){
    if(L.upgradeLevel("archive_pinning")<=0 && !state.ui.debug) return false;
    const keys=Object.keys(state.game.meta.archiveFavorites||{});
    if(!keys.length) return false;
    const lineageFav=keys.find(function(key){ return key.indexOf("archive:")===0 && key.indexOf("Chronicle")>=0; })||keys[0];
    const templateName="Favorite Seed";
    state.game.meta.templates[templateName]={autoOrganelleTarget:state.game.meta.autoOrganelleTarget,specialization:state.game.run.specialization||"",automationPolicy:state.game.run.automationPolicy||"balanced",automationSettings:Object.assign({},state.game.meta.automationSettings||{}),favoriteSource:lineageFav};
    L.pushLog("Favorite loadout seeded from archive memory.");
    return true;
  };
  L.saveMapPreset=function(name){
    L.ensureWorldState();
    const key=(name||"Default").trim()||"Default";
    const stageId=L.currentStage().id;
    state.game.meta.mapPresets[key]={stageId:stageId,slots:L.mapSlotsForStage().map(function(slot){ return {slotId:slot.id,systemId:slot.systemId||""}; })};
    L.pushLog("World layout preset saved: "+key);
    return true;
  };
  L.applyMapPreset=function(name){
    L.ensureWorldState();
    const preset=(state.game.meta.mapPresets||{})[name];
    if(!preset || preset.stageId!==L.currentStage().id) return false;
    preset.slots.forEach(function(row){
      if(row.systemId) L.placeSystemInSlot(row.systemId,row.slotId);
      else {
        const slot=L.mapSlotsForStage().find(function(item){ return item.id===row.slotId; });
        if(slot) slot.systemId="";
      }
    });
    L.pushLog("World layout preset applied: "+name);
    return true;
  };

  window.EvolutionLogic=L;
})();
