(function(){
  const DATA=window.EvolutionData, State=window.EvolutionState, Logic=window.EvolutionLogic, state=State.state, UI={};

  function byId(id){ return document.getElementById(id); }
  function badge(text,kind){ return '<span class="badge '+kind+'">'+text+'</span>'; }
  function bindPress(el,handler){
    let pointerHandled=false;
    el.onclick=function(event){ if(pointerHandled){ pointerHandled=false; return; } handler(event); };
    el.onpointerdown=function(event){ if(el.disabled) return; if(event.pointerType==="mouse" && event.button!==0) return; pointerHandled=true; event.preventDefault(); handler(event); };
  }
  function cardButton(label,disabled,title,handler){ const btn=document.createElement("button"); btn.textContent=label; btn.disabled=!!disabled; if(title) btn.title=title; bindPress(btn,handler); return btn; }
  function emptyState(text){ const div=document.createElement("div"); div.className="empty-state"; div.textContent=text; return div; }
  function effectText(item){
    const effects=(item&&item.effects)||{}, lines=[];
    if(effects.perSecond) Object.entries(effects.perSecond).forEach(function(entry){ const rate=Logic.rateText(entry[1]); if(rate) lines.push(rate+" "+Logic.resourceName(entry[0])); });
    if(effects.consume) Object.entries(effects.consume).forEach(function(entry){ const rate=Logic.rateText(-entry[1]); if(rate) lines.push(rate+" "+Logic.resourceName(entry[0])); });
    if(effects.allOutput) lines.push("All output +"+Math.round(effects.allOutput*100)+"%");
    if(effects.resourceOutput) Object.entries(effects.resourceOutput).forEach(function(entry){ const pct=Math.round(entry[1]*100); lines.push(Logic.resourceName(entry[0])+" output "+(pct>=0?"+":"")+pct+"%"); });
    if(effects.populationGrowth) lines.push("Population growth +"+Logic.fmt(effects.populationGrowth)+"/s");
    if(effects.manualBonus) lines.push("Manual x"+Logic.fmt(1+effects.manualBonus));
    if(effects.score) lines.push("Score +"+Logic.fmt(effects.score));
    return lines.join(" | ");
  }
  function productionTitle(stageId){
    return {
      cell:"Cell Metabolism",
      creature:"Creature Structures",
      tribal:"Tribal Buildings",
      civilization:"Civic Infrastructure",
      empire:"Imperial Systems",
      solar:"Solar Infrastructure",
      galactic:"Galactic Networks"
    }[stageId]||"Production";
  }
  function applyArchetypeBorder(card,item){
    if(!["cell","creature"].includes(Logic.currentStage().id)) return;
    const affinity=Logic.itemAffinity(item), top=Object.entries(affinity).filter(function(entry){ return Logic.isArchetypeRevealed(entry[0]); }).sort(function(a,b){ return b[1]-a[1]; })[0];
    if(!top) return;
    card.classList.add("archetype-revealed");
    card.style.setProperty("--archetype-color",Logic.archetypeColor(top[0]));
  }
  function bindArchetypePreview(card,item){
    if(!["cell","creature"].includes(Logic.currentStage().id)) return;
    const affinity=Logic.itemAffinity(item);
    if(!Object.keys(affinity).length) return;
    card.onmouseenter=function(){ state.ui.previewAffinity=affinity; card.classList.add("hover-preview"); drawArchetypeRadar(); };
    card.onmouseleave=function(){ state.ui.previewAffinity=null; card.classList.remove("hover-preview"); drawArchetypeRadar(); };
    card.onfocusin=card.onmouseenter;
    card.onfocusout=card.onmouseleave;
  }
  function affinityText(item){
    const affinity=Logic.itemAffinity(item);
    return Object.entries(affinity).sort(function(a,b){ return b[1]-a[1]; }).map(function(entry){ return Logic.displayArchetypeName(entry[0])+" +"+Logic.fmt(entry[1]); }).join(" | ");
  }
  function lineageText(item){ return item.archetypeReq?"Lineage: "+Logic.displayArchetypeName(item.archetypeReq):""; }
  function effectSourceText(source){ return effectText({effects:(source&&source.effects)||{}}); }
  function switchTab(tabId){ state.ui.tab=tabId; UI.render(); }
  function lockedFilterToggle(){
    const label=document.createElement("label"), input=document.createElement("input");
    label.className="filter-toggle";
    input.type="checkbox";
    input.checked=!!state.ui.showLockedContent;
    input.onchange=function(event){ state.ui.showLockedContent=!!event.target.checked; UI.render(); };
    label.appendChild(input);
    label.appendChild(document.createTextNode("Show locked"));
    return label;
  }
  function drawArchetypeRadar(){
    const canvas=byId("archetype-radar");
    if(!canvas || !canvas.getContext) return;
    const ctx=canvas.getContext("2d"), w=canvas.width, h=canvas.height, cx=w/2, cy=h/2+4, radius=Math.min(w,h)*0.33;
    const archetypes=DATA.ARCHETYPES, scores=Object.assign({},Logic.archetypeScores());
    if(state.ui.previewAffinity) Logic.addAffinity(scores,state.ui.previewAffinity);
    const max=Math.max(1,...Object.values(scores));
    ctx.clearRect(0,0,w,h);
    ctx.font="12px system-ui, sans-serif";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.strokeStyle="rgba(163,186,216,.25)";
    ctx.fillStyle="rgba(163,186,216,.62)";
    for(let ring=1;ring<=3;ring++){
      ctx.beginPath();
      archetypes.forEach(function(_,i){
        const angle=-Math.PI/2+i*2*Math.PI/archetypes.length, r=radius*ring/3, x=cx+Math.cos(angle)*r, y=cy+Math.sin(angle)*r;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      });
      ctx.closePath();
      ctx.stroke();
    }
    archetypes.forEach(function(arch,i){
      const angle=-Math.PI/2+i*2*Math.PI/archetypes.length, x=cx+Math.cos(angle)*radius, y=cy+Math.sin(angle)*radius;
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.lineTo(x,y);
      ctx.stroke();
      ctx.fillStyle=Logic.isArchetypeRevealed(arch.id)?Logic.archetypeColor(arch.id):"rgba(163,186,216,.68)";
      ctx.fillText(Logic.displayArchetypeName(arch.id),cx+Math.cos(angle)*(radius+28),cy+Math.sin(angle)*(radius+22));
    });
    const previewTop=state.ui.previewAffinity?Object.entries(state.ui.previewAffinity).sort(function(a,b){ return b[1]-a[1]; })[0]:null;
    const dominant=(previewTop&&previewTop[0])||Logic.dominantArchetype(), fillColor=Logic.isArchetypeRevealed(dominant)?Logic.archetypeColor(dominant):"#8da5c4";
    ctx.beginPath();
    archetypes.forEach(function(arch,i){
      const angle=-Math.PI/2+i*2*Math.PI/archetypes.length, r=radius*((scores[arch.id]||0)/max), x=cx+Math.cos(angle)*r, y=cy+Math.sin(angle)*r;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.fillStyle=fillColor+"33";
    ctx.strokeStyle=fillColor;
    ctx.lineWidth=2;
    ctx.fill();
    ctx.stroke();
    if(previewTop){
      ctx.fillStyle=Logic.isArchetypeRevealed(previewTop[0])?Logic.archetypeColor(previewTop[0]):"rgba(231,240,255,.85)";
      ctx.fillText("Preview "+affinityText({affinity:state.ui.previewAffinity}),cx,18);
    }
    ctx.lineWidth=1;
  }

  UI.bindUI=function(){
    document.querySelectorAll(".tab").forEach(function(btn){ btn.onclick=function(){ state.ui.tab=btn.dataset.tab; UI.render(); }; });
    byId("ascend-btn").onclick=function(){ if(Logic.evolve()) UI.render(); };
    byId("rebirth-btn").onclick=function(){ if(Logic.rebirth()) UI.render(); };
    byId("save-btn").onclick=function(){ State.saveGame(); };
    byId("reset-btn").onclick=function(){ State.hardReset(); UI.render(); };
    byId("options-btn").onclick=function(){ state.ui.optionsOpen=!state.ui.optionsOpen; UI.render(); };

    const debugRow = byId("debug-toggle").closest(".debug-option");
    const debugToggle = byId("debug-toggle");
    
    const unlocked =
    state.ui.debugUnlocked ||
    localStorage.getItem("evolve_debug") === "1";

    if (unlocked) {

      state.ui.debugUnlocked = true;

      debugRow.style.display = "";

      debugToggle.disabled = false;
      debugToggle.checked = !!state.ui.debug;

      debugToggle.onchange = function(e){
        state.ui.debug = !!e.target.checked;
        UI.render();
      };

    } else {

      state.ui.debug = false;

      debugRow.style.display = "none";

      debugToggle.checked = false;
      debugToggle.disabled = true;
      debugToggle.onchange = null;
    }
    
    byId("compact-toggle").onchange=function(e){ state.ui.compact=!!e.target.checked; UI.render(); };
    byId("pause-btn").onclick=function(){ state.running=!state.running; UI.render(); };
    byId("speed-btn").onclick=function(){ state.speedIndex=(state.speedIndex+1)%DATA.SPEEDS.length; UI.render(); };
    byId("focus-minimize-btn").onclick=function(){ state.ui.focusOverlayMinimized=true; UI.render(); };
    byId("focus-restore-btn").onclick=function(){ state.ui.focusOverlayMinimized=false; UI.render(); };
    byId("shop-close-btn").onclick=function(){
      if(state.ui.betweenRunsStep==="review"){ state.ui.betweenRunsStep="shop"; UI.render(); return; }
      if(state.ui.betweenRunsStep==="shop"){ state.ui.betweenRunsStep="setup"; UI.render(); return; }
      state.ui.betweenRuns=false;
      state.ui.betweenRunsStep="review";
      UI.render();
    };
    byId("archive-search").oninput=function(event){ state.ui.archiveSearch=event.target.value||""; UI.renderArchive(); };
  };

  UI.renderArchive=function(){
    const archiveList=byId("archive-list"); archiveList.innerHTML="";
    const archiveFilterBar=byId("archive-filter-bar"); archiveFilterBar.innerHTML="";
    const input = byId("archive-search");
    
    if (document.activeElement !== input) {
      input.value = state.ui.archiveSearch || "";
    }
    
    ["all","timeline","eras","chronicles","museum","rivals","seen"].forEach(function(id){
      const btn=document.createElement("button");
      btn.textContent={all:"All",timeline:"Timeline",eras:"Eras",chronicles:"Chronicles",museum:"Museum",rivals:"Rivals",seen:"Seen"}[id];
      btn.className=state.ui.archiveFilter===id?"tab active":"tab";
      btn.onclick=function(){ state.ui.archiveFilter=id; UI.render(); };
      archiveFilterBar.appendChild(btn);
    });
    const codexForMuseum=Logic.codexSummary();
    const archiveSearch=(state.ui.archiveSearch||"").trim().toLowerCase();
    function archiveMatches(text){
      return !archiveSearch || (text||"").toLowerCase().indexOf(archiveSearch)>=0;
    }
    function pushArchiveCard(title,badgeText,badgeKind,detail,effectsText){
      const haystack=[title,badgeText,detail,effectsText].filter(Boolean).join(" ");
      if(!archiveMatches(haystack)) return;
      const card=document.createElement("div");
      card.className="mini-card";
      const favoriteKey=(title+"|"+badgeText).replace(/"/g,"");
      card.innerHTML='<div class="name-row"><span>'+title+'</span><span>'+badge(badgeText,badgeKind)+(Logic.upgradeLevel("archive_pinning")>0||state.ui.debug?(" "+badge(Logic.isArchiveFavorite("archive",favoriteKey)?"Favorite":"Pin","available")):"")+'</span></div><div class="tiny">'+detail+'</div>'+(effectsText?'<div class="effects">'+effectsText+'</div>':'');
      if(Logic.upgradeLevel("archive_pinning")>0 || state.ui.debug){
        card.appendChild(cardButton(Logic.isArchiveFavorite("archive",favoriteKey)?"Unfavorite":"Favorite",false,"Pin or unpin this archive entry.",function(){ if(Logic.toggleArchiveFavorite("archive",favoriteKey)) UI.render(); }));
      }
      archiveList.appendChild(card);
    }
    if(state.ui.archiveFilter==="timeline"){
      const timelineEntries=[].concat(
        (codexForMuseum.victories||[]).map(function(entry){ return {time:entry.time,title:entry.name,kind:"Victory",detail:"Path "+(entry.ascensionPath||"none")+" | Archetype "+Logic.archetypeName(entry.archetype)}; }),
        (codexForMuseum.chronicles||[]).map(function(entry){ return {time:entry.time,title:entry.name,kind:"Chronicle",detail:entry.text}; }),
        Object.values(state.game.meta.seenContent||{}).map(function(entry){ return {time:entry.time,title:entry.name,kind:entry.kind,detail:"Seen in "+entry.stage}; })
      ).sort(function(a,b){ return (b.time||0)-(a.time||0); });
      timelineEntries.forEach(function(entry){ pushArchiveCard(entry.title,entry.kind,"owned",entry.detail); });
      (codexForMuseum.timelineMilestones||[]).forEach(function(milestone){
        pushArchiveCard(milestone.name,"Timeline Milestone","owned",milestone.desc,effectSourceText(milestone));
      });
    }
    if(state.ui.archiveFilter==="eras"){
      const eras={};
      Object.values(state.game.meta.seenContent||{}).forEach(function(entry){
        if(!eras[entry.stage]) eras[entry.stage]=[];
        eras[entry.stage].push(entry);
      });
      Object.entries(eras).forEach(function(entry){
        pushArchiveCard(entry[0].charAt(0).toUpperCase()+entry[0].slice(1)+" Era","Stage Group","owned",entry[1].length+" discovered records");
      });
    }
    if(state.ui.archiveFilter==="all" || state.ui.archiveFilter==="seen"){
      if(!state.game.run.archive.length && state.ui.archiveFilter==="seen") archiveList.appendChild(emptyState("No retired stages yet."));
      else [...state.game.run.archive].reverse().forEach(function(entry){
        pushArchiveCard(entry.stageName,entry.archetype?Logic.displayArchetypeName(entry.archetype):"-","owned",((entry.systems&&entry.systems.join(", "))||"No systems recorded."));
      });
      Object.values(state.game.meta.seenContent||{}).slice(-80).reverse().forEach(function(entry){
        pushArchiveCard(entry.name,entry.kind,"owned","Seen in "+entry.stage);
      });
    }
    if(state.ui.archiveFilter==="all" || state.ui.archiveFilter==="museum"){
      (codexForMuseum.museum||[]).forEach(function(entry){
        pushArchiveCard(entry.lastName,"Museum","owned",Logic.archetypeName(entry.archetype)+' | Path '+entry.path+' | Wins '+entry.count+' | Best objectives '+entry.bestObjectives);
      });
      (codexForMuseum.museumRewards||[]).forEach(function(reward){
        pushArchiveCard(reward.name,"Museum Perk","owned","Unlocked by repeating an ending row "+reward.count+" times.",effectSourceText(reward));
      });
    }
    if(state.ui.archiveFilter==="all" || state.ui.archiveFilter==="chronicles") (codexForMuseum.chronicles||[]).forEach(function(entry){
      pushArchiveCard(entry.name,Logic.archetypeName(entry.archetype),"owned",entry.text);
    });
    if(state.ui.archiveFilter==="all" || state.ui.archiveFilter==="rivals") (codexForMuseum.rivalEndings||[]).forEach(function(entry){
      pushArchiveCard(entry.name,"Rival","locked","Pressure ending recorded in the archive.");
    });
    if(!archiveList.children.length) archiveList.appendChild(emptyState("No archive entries match this filter."));
  };

  UI.render=function(){
    const stage=Logic.currentStage(), score=Logic.currentScore(), progress=Math.min(1,score/stage.scoreTarget);
    const world=Logic.worldSummary();
    document.body.classList.toggle("compact",!!state.ui.compact);
    document.body.classList.toggle("between-runs-mode",!!state.ui.betweenRuns);
    (DATA.COSMETIC_THEMES||[]).forEach(function(theme){ document.body.classList.toggle("theme-"+theme.archetype,state.game.meta.cosmeticTheme===theme.id); });

    byId("stage-name").textContent=stage.name;
    byId("stage-desc").textContent=stage.description;
    byId("population-value").textContent=Logic.fmt(state.game.run.population);
    byId("population-trend").textContent=Logic.dominantArchetypeLabel();
    byId("score-value").textContent=Logic.fmt(score);
    byId("score-detail").textContent="Target "+Logic.fmt(stage.scoreTarget);
    byId("run-status-value").textContent=state.ui.betweenRuns?"Between runs":"In run";
    byId("run-status-detail").textContent=Logic.canRebirth()?("Rebirth +"+Logic.rebirthGain()+" EP"):"Keep progressing";
    byId("advisor-text").textContent=Logic.stageHint();
    byId("pace-text").textContent=Logic.stagePaceText();
    byId("stage-score-fill").style.width=(progress*100)+"%";
    byId("stage-score-label").textContent=Math.round(progress*100)+"% of "+(Logic.isFinalStage()?"transcend":"evolve")+" target";
    byId("ascend-fill").style.width=(progress*100)+"%";
    const finalStage=Logic.isFinalStage(), evolveWord=finalStage?"Transcend":"Evolve";
    const advanceReq=Logic.stageAdvanceRequirement(stage.id);
    byId("ascend-status").textContent=(Logic.canEvolve()?("Ready to "+evolveWord):"Not ready yet")+(state.ui.debug?" | Debug override":"");
    byId("ascend-requirements").textContent=(advanceReq.met?"Task complete":"Task: "+advanceReq.text)+" | Need "+Math.max(0,stage.scoreTarget-score)+" more score";
    byId("ascend-btn").disabled=!Logic.canEvolve()&&!state.ui.debug;
    byId("ascend-btn").textContent=evolveWord;

    const featureStrip=byId("feature-strip"); featureStrip.innerHTML="";
    [
      {
        label:"Map",
        value:world.slots.filter(function(slot){ return !!slot.systemId; }).length+" / "+world.slots.length,
        sub:(world.mapWonderSources||[]).length?((world.mapWonderSources||[]).length+" wonders anchored"):"Stage placement board",
        state:(world.slots.some(function(slot){ return !slot.systemId; })?"Ready":"Placed"),
        kind:(world.slots.some(function(slot){ return !slot.systemId; })?"available":"owned"),
        action:"Open Stage Map",
        tab:"systems"
      },
      {
        label:"Artifacts",
        value:String(world.artifacts.length),
        sub:(world.artifactEvolutions||[]).length?((world.artifactEvolutions||[]).length+" reassemblies ready"):((world.restoredArtifacts||[]).length?"Restorations active":"Inherited relic archive"),
        state:(world.artifactEvolutions||[]).length?"Ready":(world.artifacts.length?"Known":"Hidden"),
        kind:(world.artifactEvolutions||[]).length?"available":(world.artifacts.length?"owned":"locked"),
        action:"Open Artifacts",
        tab:"world"
      },
      {
        label:"Laws",
        value:String((Object.values(state.game.run.lineageLaws||{}).filter(Boolean).length)+(world.activeDoctrine?1:0)),
        sub:(world.lineageLaws||[]).length?((world.lineageLaws||[]).length+" laws to choose"):((world.activeDoctrine||world.doctrineEvolutions.length)?"Doctrine active":"Lineage policies"),
        state:(world.lineageLaws||[]).length?"Ready":((Object.values(state.game.run.lineageLaws||{}).filter(Boolean).length||world.activeDoctrine)?"Adopted":"Dormant"),
        kind:(world.lineageLaws||[]).length?"available":((Object.values(state.game.run.lineageLaws||{}).filter(Boolean).length||world.activeDoctrine)?"owned":"locked"),
        action:"Open Lineage",
        tab:"lineage"
      },
      {
        label:"Projects",
        value:world.pendingProject?world.pendingProject.name:(world.specialProject?"Active":String((world.allSpecialProjects||[]).length)),
        sub:world.pendingProject?"Choose a completion branch":(world.specialProject?"Long project underway":((world.allSpecialProjects||[]).length+" projects available")),
        state:world.pendingProject?"Resolve":(world.specialProject?"Running":((world.allSpecialProjects||[]).length?"Ready":"Quiet")),
        kind:world.pendingProject?"available":(world.specialProject?"owned":((world.allSpecialProjects||[]).length?"available":"locked")),
        action:"Open Projects",
        tab:"world"
      }
    ].forEach(function(item){
      const card=document.createElement("div");
      card.className="summary-box feature-card";
      card.innerHTML='<div class="label">'+item.label+'</div><div class="value">'+item.value+'</div><div class="tiny">'+item.sub+'</div><div class="name-row"><span></span>'+badge(item.state,item.kind)+'</div>';
      card.appendChild(cardButton(item.action,false,"Jump to "+item.label.toLowerCase()+".",function(){ switchTab(item.tab); }));
      featureStrip.appendChild(card);
    });

    const focusList=byId("focus-list"); focusList.innerHTML="";
    const focusItems=[];
    function pushFocus(group,priority,build){ focusItems.push({group:group,priority:priority,build:build}); }
    const unresolvedLineageEvents=(Logic.hasLockedLineage()?Logic.availableLineageEvents().filter(function(event){ return !(state.game.run.lineageEvents||{})[event.id]; }):[]);
    unresolvedLineageEvents.forEach(function(event){
      pushFocus("lineage",3,function(){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+event.name+'</span>'+badge("Lineage choice","available")+'</div><div class="tiny">'+event.desc+'</div>';
        (event.choices||[]).forEach(function(choice){
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge("Option","available")+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
          row.appendChild(cardButton("Choose",false,"Resolve this lineage event.",function(){ if(Logic.chooseLineageEvent(event.id,choice.id)) UI.render(); }));
          card.appendChild(row);
        });
        return card;
      });
    });
    Object.entries(world.worldEvents||{}).forEach(function(entry){
      const event=Logic.worldEventDef(entry[1]), chosen=world.worldEventChoices[entry[0]], slot=world.slots.find(function(item){ return item.id===entry[0].replace(":chain",""); });
      if(!event || chosen) return;
      pushFocus("world",2,function(){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+event.name+'</span>'+badge(slot?slot.name:"World event","available")+'</div><div class="tiny">'+event.desc+'</div>';
        (event.choices||[]).forEach(function(choice){
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge("Response","available")+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
          row.appendChild(cardButton("Choose",false,"Resolve this world event.",function(){ if(Logic.chooseWorldEventResponse(entry[0],choice.id)) UI.render(); }));
          card.appendChild(row);
        });
        return card;
      });
    });
    (world.vassalDemands||[]).forEach(function(row){
      pushFocus("world",2,function(){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+row.demand.name+'</span>'+badge("Vassal demand","available")+'</div><div class="tiny">'+row.demand.desc+'</div><div class="effects">'+effectSourceText(row.demand)+'</div>';
        card.appendChild(cardButton("Resolve",false,"Answer this vassal demand.",function(){ if(Logic.chooseVassalDemand(row.archetype,row.demand.id)) UI.render(); }));
        return card;
      });
    });
    (world.rivalDefections||[]).forEach(function(row){
      pushFocus("world",2,function(){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+row.defection.name+'</span>'+badge("Rival opening","available")+'</div><div class="tiny">'+row.defection.desc+'</div><div class="effects">'+effectSourceText(row.defection)+'</div>';
        card.appendChild(cardButton("Use",false,"Use this rival defection opportunity.",function(){ if(Logic.chooseRivalDefection(row.rival.archetype,row.defection.id)) UI.render(); }));
        return card;
      });
    });
    if(world.congressCrisis && !world.congressCrisisChoice){
      pushFocus("crisis",4,function(){
        const crisis=world.congressCrisis, card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+crisis.name+'</span>'+badge("Congress crisis","locked")+'</div><div class="tiny">'+crisis.desc+'</div><div class="effects">'+effectSourceText(crisis)+'</div>';
        (crisis.choices||[]).forEach(function(choice){
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge("Response","available")+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
          row.appendChild(cardButton("Choose",false,"Resolve this congress crisis.",function(){ if(Logic.chooseCongressCrisisResponse(choice.id)) UI.render(); }));
          card.appendChild(row);
        });
        return card;
      });
    }
    if(world.institutionCrisis && !world.institutionCrisisChoice){
      pushFocus("crisis",4,function(){
        const crisis=world.institutionCrisis, card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+crisis.name+'</span>'+badge("Institution crisis","locked")+'</div><div class="tiny">'+crisis.desc+'</div><div class="effects">'+effectSourceText(crisis)+'</div>';
        (crisis.choices||[]).forEach(function(choice){
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge("Response","available")+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
          row.appendChild(cardButton("Choose",false,"Resolve this institutional crisis.",function(){ if(Logic.chooseInstitutionCrisisResponse(choice.id)) UI.render(); }));
          card.appendChild(row);
        });
        return card;
      });
    }
    if(world.pendingProject){
      pushFocus("projects",3,function(){
        const pending=world.pendingProject, card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+pending.name+'</span>'+badge("Project complete","available")+'</div><div class="tiny">Choose the outcome for this finished project.</div>';
        if(pending.scarRecovery){
          Object.keys(state.game.meta.threatScars||{}).filter(function(id){ return !state.game.meta.transformedScars[id]; }).forEach(function(id){
            const transform=(DATA.SCAR_TRANSFORMS||{})[id];
            if(!transform) return;
            const row=document.createElement("div");
            row.className="choice-row";
            row.innerHTML='<div class="name-row"><span>'+transform.name+'</span>'+badge("Transform","available")+'</div><div class="effects">'+effectSourceText(transform)+'</div>';
            row.appendChild(cardButton("Choose",false,"Choose this scar recovery outcome.",function(){ if(Logic.chooseProjectCompletion(id)) UI.render(); }));
            card.appendChild(row);
          });
        } else (pending.choices||[]).forEach(function(choice){
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge("Branch","available")+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
          row.appendChild(cardButton("Choose",false,"Choose this project completion branch.",function(){ if(Logic.chooseProjectCompletion(choice.id)) UI.render(); }));
          card.appendChild(row);
        });
        return card;
      });
    }
    const availableLaws=Logic.availableLineageLaws();
    if(!((state.game.run.lineageLaws||{})[stage.id]) && availableLaws.length){
      pushFocus("lineage",1,function(){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>Stage Law Available</span>'+badge("Policy","available")+'</div><div class="tiny">This stage has an unchosen lineage law.</div>';
        card.appendChild(cardButton("Open Laws",false,"Open the lineage law panel.",function(){ switchTab("lineage"); }));
        return card;
      });
    }
    if((world.artifactEvolutions||[]).length){
      pushFocus("relics",1,function(){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>Artifact Reassembly</span>'+badge((world.artifactEvolutions||[]).length+" ready","available")+'</div><div class="tiny">Inherited relics can be upgraded between eras.</div>';
        card.appendChild(cardButton("Open Artifacts",false,"Jump to artifact management.",function(){ switchTab("world"); }));
        return card;
      });
    }
    const focusGroups=[
      {id:"all",label:"All"},
      {id:"crisis",label:"Crises"},
      {id:"projects",label:"Projects"},
      {id:"lineage",label:"Lineage"},
      {id:"world",label:"World"},
      {id:"relics",label:"Relics"}
    ];
    const focusFilterBar=byId("focus-filter-bar"); focusFilterBar.innerHTML="";
    const availableFocusGroups=focusGroups.filter(function(group){
      return group.id==="all" || focusItems.some(function(item){ return item.group===group.id; });
    });
    if(!availableFocusGroups.some(function(group){ return group.id===state.ui.focusCategory; })) state.ui.focusCategory="all";
    availableFocusGroups.forEach(function(group){
      const btn=document.createElement("button");
      const count=group.id==="all"?focusItems.length:focusItems.filter(function(item){ return item.group===group.id; }).length;
      btn.textContent=group.label+(count?(" "+count):"");
      btn.className=state.ui.focusCategory===group.id?"tab active":"tab";
      btn.onclick=function(){ state.ui.focusCategory=group.id; UI.render(); };
      focusFilterBar.appendChild(btn);
    });
    const visibleFocusItems=focusItems
      .filter(function(item){ return state.ui.focusCategory==="all" || item.group===state.ui.focusCategory; })
      .sort(function(a,b){ return b.priority-a.priority; })
      .slice(0,6);
    visibleFocusItems.forEach(function(item){ focusList.appendChild(item.build()); });
    const focusOverlay=byId("focus-overlay"), focusRestore=byId("focus-restore-btn");
    byId("focus-title").textContent=focusItems.length?"Attention Required":"Attention";
    const topPriority=focusItems.length?Math.max.apply(null,focusItems.map(function(item){ return item.priority; })):0;
    byId("focus-subtitle").textContent=focusItems.length?(focusItems.length+" unresolved choices are available while the run continues. Priority "+topPriority+" items are surfaced first."):"No urgent decisions right now.";
    focusOverlay.classList.toggle("hidden",state.ui.focusOverlayMinimized || !focusItems.length || state.ui.betweenRuns);
    focusRestore.classList.toggle("hidden",!state.ui.focusOverlayMinimized || !focusItems.length || state.ui.betweenRuns);
    focusRestore.textContent="Open Attention ("+focusItems.length+")";

    const resourceWrap=byId("resource-topbar"); resourceWrap.innerHTML="";
    Logic.resourceSummary().forEach(function(row){
      const chip=document.createElement("div"), def=Logic.resourceDef(row.id)||{};
      chip.className="resource-chip";
      if(def.category==="strategic_aggregate") chip.title="Aggregate placeholder for strategic resource breakdown.";
      if(def.category==="luxury_aggregate") chip.title="Aggregate placeholder for luxury resource breakdown.";
      chip.innerHTML='<div class="label">'+row.name+'</div><div class="value">'+Logic.fmt(row.value)+' / '+Logic.fmt(row.capacity)+'</div><div class="tiny">'+(Logic.rateText(row.perSecond)||"steady")+'</div>';
      resourceWrap.appendChild(chip);
    });

    const actionGrid=byId("action-grid"); actionGrid.innerHTML="";
    Logic.stageActions().forEach(function(action){
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+action.name+'</span>'+badge("Available","available")+'</div><div class="effects">'+Logic.bundleText(action.gain)+'</div>';
      card.appendChild(cardButton("Gather",state.ui.betweenRuns,"Perform a manual action.",function(){ if(Logic.performAction(action.id)) UI.render(); }));
      actionGrid.appendChild(card);
    });
    if(!actionGrid.children.length) actionGrid.appendChild(emptyState("No manual actions are active in this layer."));

    byId("systems-title").textContent=stage.name+" Systems";
    byId("systems-hint").textContent="Systems unlock actions, increase capacities, add production, and shape archetype drift.";
    const ownedWrap=byId("systems-overview-list"); ownedWrap.innerHTML="";
    const owned=Logic.ownedSystemsForStage();
    if(!owned.length) ownedWrap.appendChild(emptyState("No systems unlocked yet."));
    else owned.forEach(function(item){
      const card=document.createElement("div");
      card.className="mini-card";
      applyArchetypeBorder(card,item);
      bindArchetypePreview(card,item);
      card.innerHTML='<div class="name-row"><span>'+item.name+(item.ownedCount>1?(" x"+item.ownedCount):"")+'</span>'+badge("Owned","owned")+'</div><div class="tiny">'+Logic.systemCategory(item)+(item.ownedCount>1?(" | eff. x"+Logic.fmt(item.effectiveCount||item.ownedCount)):"")+'</div>';
      ownedWrap.appendChild(card);
    });

    const systemsMapBoard=byId("systems-map-board"); systemsMapBoard.innerHTML="";
    if(!world.slots.length) systemsMapBoard.appendChild(emptyState("This stage has no placement board yet."));
    else {
      const layoutTile=document.createElement("div");
      layoutTile.className="map-tile map-tile-meta";
      layoutTile.innerHTML='<div class="label">Layout</div><div class="value">'+((world.activeStageLayout&&world.activeStageLayout.name)||"Standard")+'</div><div class="tiny">'+((world.activeStageLayout&&world.activeStageLayout.desc)||"Default stage slot arrangement")+'</div>';
      const layoutSelect=document.createElement("select");
      (world.stageLayouts||[]).forEach(function(layout){
        const option=document.createElement("option");
        option.value=layout.id;
        option.textContent=layout.name+(layout.wins?(" - "+layout.wins+" clears"):"");
        layoutSelect.appendChild(option);
      });
      layoutSelect.value=(world.activeStageLayout&&world.activeStageLayout.id)||"standard";
      layoutSelect.onchange=function(event){ if(Logic.chooseStageLayout(stage.id,event.target.value)) UI.render(); };
      layoutTile.appendChild(layoutSelect);
      systemsMapBoard.appendChild(layoutTile);

      const expandTile=document.createElement("div");
      const expanded=state.game.run.expandedSlots[stage.id]||0, expandCost=2+expanded*2;
      expandTile.className="map-tile map-tile-meta";
      expandTile.innerHTML='<div class="label">Expand Map</div><div class="value">'+(expanded>=3?"Maxed":"+"+expanded+" slots")+'</div><div class="tiny">More territory for stage systems and wonders.</div><div class="cost">Cost: '+expandCost+' EP</div>';
      expandTile.appendChild(cardButton(expanded>=3?"Maxed":"Expand",expanded>=3 || (state.game.meta.evolutionPoints<expandCost&&!state.ui.debug),"Spend EP to add a new slot.",function(){ if(Logic.expandMap()) UI.render(); }));
      systemsMapBoard.appendChild(expandTile);

      world.slots.forEach(function(slot){
        const tile=document.createElement("div"), system=slot.systemId?(stage.systems||[]).find(function(item){ return item.id===slot.systemId; }):null;
        const trait=(DATA.SLOT_TRAITS||[]).find(function(item){ return item.id===slot.traitId; });
        const builtId=(world.mapWonders||{})[slot.id], built=builtId?(DATA.MAP_WONDERS||[]).find(function(item){ return item.id===builtId; }):null;
        const adjacency=world.adjacency.find(function(item){ return item.slot===slot.id; });
        const tagSynergy=world.tagSynergies.find(function(item){ return item.slotName===slot.name; });
        const select=document.createElement("select");
        const empty=document.createElement("option");
        empty.value="";
        empty.textContent="Empty";
        select.appendChild(empty);
        Logic.ownedSystemsForStage().forEach(function(item){
          const option=document.createElement("option");
          option.value=item.id;
          option.textContent=item.name+(item.ownedCount>1?(" x"+item.ownedCount):"");
          select.appendChild(option);
        });
        select.value=slot.systemId||"";
        select.onpointerdown=function(event){ event.stopPropagation(); state.ui.inputActive=true; };
        select.onfocus=function(){ state.ui.inputActive=true; };
        select.onblur=function(){ state.ui.inputActive=false; UI.render(); };
        select.onchange=function(event){ Logic.placeSystemInSlot(event.target.value,slot.id); UI.render(); };
        tile.className="map-tile"+(slot.systemId?" map-tile-filled":"");
        tile.innerHTML='<div class="name-row"><span>'+slot.name+'</span>'+badge(slot.type,"available")+'</div><div class="tiny">'+(trait?trait.name:"Neutral terrain")+(built?(" | "+built.name):"")+'</div><div class="value">'+(system?system.name:"Unassigned")+'</div>'+(slot.effects?'<div class="effects">'+effectSourceText(slot)+'</div>':'')+(adjacency?'<div class="effects">Adjacency: '+adjacency.name+'</div>':'')+(tagSynergy?'<div class="effects">Synergy: '+tagSynergy.name+'</div>':'');
        tile.appendChild(select);
        const actions=document.createElement("div");
        actions.className="inline-actions";
        if(built){
          const level=(state.game.run.mapWonderLevels||{})[slot.id]||1, maxLevel=Logic.maxMapWonderLevel(), canUpgrade=level<maxLevel && Logic.canAfford(Logic.mapWonderUpgradeCost(slot.id));
          actions.appendChild(cardButton(level>=maxLevel?"Wonder Maxed":"Upgrade Wonder",level>=maxLevel||!canUpgrade,canUpgrade?"Upgrade this wonder.":"Needs resources or max level.",function(){ if(Logic.upgradeMapWonder(slot.id)) UI.render(); }));
        } else if(Logic.availableMapWonders(slot.id).length){
          actions.appendChild(cardButton("See Wonders",false,"Open world wonders for this slot.",function(){ switchTab("world"); }));
        }
        if(actions.children.length) tile.appendChild(actions);
        systemsMapBoard.appendChild(tile);
      });
    }

    const sysCats=Logic.visibleSystemCategories();
    if(!sysCats.includes(state.ui.systemsCategory)) state.ui.systemsCategory=sysCats[0]||"";
    const systemsSubbar=byId("systems-subbar"); systemsSubbar.innerHTML="";
    if(sysCats.length>1){
      sysCats.forEach(function(category){
        const btn=document.createElement("button");
        btn.textContent=category;
        btn.className=state.ui.systemsCategory===category?"tab active":"tab";
        bindPress(btn,function(){ state.ui.systemsCategory=category; UI.render(); });
        systemsSubbar.appendChild(btn);
      });
    }
    systemsSubbar.appendChild(lockedFilterToggle());

    const systemsList=byId("systems-list"); systemsList.innerHTML="";
    const systemCards=(stage.systems||[]).filter(function(item){
      if(!Logic.contentVisible(item,state.ui.showLockedContent)) return false;
      if(state.ui.systemsCategory==="All organelles") return stage.id==="cell" && item.category!=="Starter organelles" && !state.game.run.ownedSystems[item.id];
      if(Logic.systemCategory(item)!==state.ui.systemsCategory) return false;
      if(!state.game.run.ownedSystems[item.id]) return true;
      return Logic.repeatableSystem(item);
    }).map(function(item){
      const reason=Logic.lockReasonForSystem(item), canBuy=!reason||state.ui.debug, effects=effectText(item), ownedCount=Logic.systemOwnedCount(item.id);
      const affinity=affinityText(item);
      const card=document.createElement("div");
      card.className="buy-card";
      applyArchetypeBorder(card,item);
      bindArchetypePreview(card,item);
      const lineage=lineageText(item);
      const nextCost=Logic.repeatableSystem(item)?Logic.scaledCost(item.cost,ownedCount):Logic.discountedCost(item.cost);
      card.innerHTML='<div class="name-row"><span>'+item.name+(ownedCount?(" x"+ownedCount):"")+'</span>'+badge(canBuy?"Available":"Locked",canBuy?"available":"locked")+'</div><div class="tiny">'+item.description+'</div><div class="tiny">'+Logic.systemCategory(item)+(Logic.repeatableSystem(item)?" | Repeatable building":"")+'</div>'+(lineage?'<div class="effects">'+lineage+'</div>':'')+(effects?'<div class="effects">'+effects+'</div>':'')+(affinity&&["cell","creature"].includes(stage.id)?'<div class="effects">Affinity: '+affinity+'</div>':'')+'<div class="cost">Cost: '+Logic.bundleText(nextCost)+'</div>'+(reason?'<div class="lock-reason">'+reason+'</div>':'');
      card.appendChild(cardButton(canBuy?(ownedCount&&Logic.repeatableSystem(item)?"Build Another":"Build"):"Locked",!canBuy,reason||"Build this system.",function(){ if(Logic.buySystem(item.id)) UI.render(); }));
      card.dataset.costWeight=String(Logic.purchaseWeight(nextCost));
      card.dataset.canBuy=canBuy?"1":"0";
      return card;
    }).sort(function(a,b){
      const aBuy=a.dataset.canBuy==="1", bBuy=b.dataset.canBuy==="1";
      if(aBuy!==bBuy) return aBuy?-1:1;
      return Number(a.dataset.costWeight)-Number(b.dataset.costWeight);
    });
    systemCards.forEach(function(card){ systemsList.appendChild(card); });
    if(!systemsList.children.length) systemsList.appendChild(emptyState("No available systems in this category right now."));

    byId("automation-title").textContent=productionTitle(stage.id);
    byId("automation-hint").textContent=stage.id==="cell"?"Organelles are the production layer here. Evo automation can eventually steer organelle purchases from the shop.":"Buildings, units, and infrastructure are the production layer. Evo automation can auto-build affordable production systems.";
    const autoSummary=Logic.automationSummary(), autoStrip=byId("automation-summary-strip"); autoStrip.innerHTML="";
    [
      {label:"Sources",value:Logic.fmt(autoSummary.sources.length),sub:"Owned producers and upkeep"},
      {label:"Outputs",value:Logic.fmt(autoSummary.positive),sub:"Resources being produced"},
      {label:"Upkeep",value:Logic.fmt(autoSummary.drains),sub:"Resources being consumed"},
      {label:"Evo Automation",value:"O"+autoSummary.autoLevels.organelles+" / I"+autoSummary.autoLevels.infrastructure,sub:"Organelles / infrastructure"}
    ].forEach(function(row){
      const card=document.createElement("div");
      card.className="automation-stat";
      card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
      autoStrip.appendChild(card);
    });

    const defs=autoSummary.sources, autoCats=["All"].concat([...new Set(defs.map(function(item){ return item.category||item.path||"Other"; }))]);
    if(!autoCats.includes(state.ui.automationCategory)) state.ui.automationCategory=autoCats[0]||"";
    const autoSubbar=byId("automation-subbar"); autoSubbar.innerHTML="";
    autoCats.forEach(function(category){
      const btn=document.createElement("button");
      btn.textContent=category==="All"?"All":category;
      btn.className=state.ui.automationCategory===category?"tab active":"tab";
      bindPress(btn,function(){ state.ui.automationCategory=category; UI.render(); });
      autoSubbar.appendChild(btn);
    });

    const autoList=byId("automation-list"); autoList.innerHTML="";
    defs.filter(function(item){ return state.ui.automationCategory==="All" || item.category===state.ui.automationCategory || item.path===state.ui.automationCategory; }).forEach(function(item){
      const effects=effectText(item);
      const card=document.createElement("div");
      card.className="buy-card";
      applyArchetypeBorder(card,item);
      bindArchetypePreview(card,item);
      card.innerHTML='<div class="name-row"><span>'+item.name+'</span>'+badge("Owned","owned")+'</div><div class="tiny">'+(item.category||item.path||"Production")+'</div>'+(effects?'<div class="effects">'+effects+'</div>':'');
      autoList.appendChild(card);
    });
    if(!autoList.children.length) autoList.appendChild(emptyState("No owned production sources yet."));

    byId("tech-title").textContent=stage.name+" Tech";
    byId("tech-hint").textContent=stage.id==="cell"?"Cell has no separate tech tree. Organelles are this stage's tech layer.":"Tech paths are stage-specific and use the same cost/effect schema as systems.";
    const techPaths=Logic.visibleTechPaths();
    if(!techPaths.some(function(path){ return path.id===state.ui.techCategory; })) state.ui.techCategory=(techPaths[0]&&techPaths[0].id)||"";
    const techSubbar=byId("tech-subbar"); techSubbar.innerHTML="";
    techPaths.forEach(function(path){
      const btn=document.createElement("button");
      btn.textContent=path.name;
      btn.className=state.ui.techCategory===path.id?"tab active":"tab";
      bindPress(btn,function(){ state.ui.techCategory=path.id; UI.render(); });
      techSubbar.appendChild(btn);
    });
    techSubbar.appendChild(lockedFilterToggle());

    const techList=byId("tech-list"); techList.innerHTML="";
    const techCards=(stage.technologies||[]).filter(function(item){
      const ownedTech=!!state.game.run.technologies[item.id];
      return !ownedTech && item.path===state.ui.techCategory && Logic.contentVisible(item,state.ui.showLockedContent);
    }).map(function(item){
      const reason=Logic.lockReasonForTech(item), canBuy=!reason||state.ui.debug, effects=effectText(item);
      const card=document.createElement("div");
      card.className="buy-card";
      const lineage=lineageText(item);
      card.innerHTML='<div class="name-row"><span>'+item.name+'</span>'+badge(canBuy?"Available":"Locked", canBuy?"available":"locked")+'</div>'+(lineage?'<div class="effects">'+lineage+'</div>':'')+(effects?'<div class="effects">'+effects+'</div>':'')+'<div class="cost">Cost: '+Logic.bundleText(Logic.discountedCost(item.cost))+'</div>'+(reason?'<div class="lock-reason">'+reason+'</div>':'');
      card.appendChild(cardButton("Research",!canBuy,reason||"Research this technology.",function(){ if(Logic.buyTech(item.id)) UI.render(); }));
      card.dataset.costWeight=String(Logic.purchaseWeight(Logic.discountedCost(item.cost)));
      card.dataset.canBuy=canBuy?"1":"0";
      return card;
    }).sort(function(a,b){
      const aBuy=a.dataset.canBuy==="1", bBuy=b.dataset.canBuy==="1";
      if(aBuy!==bBuy) return aBuy?-1:1;
      return Number(a.dataset.costWeight)-Number(b.dataset.costWeight);
    });
    techCards.forEach(function(card){ techList.appendChild(card); });
    if(!techList.children.length) techList.appendChild(emptyState(stage.id==="cell"?"No Cell techs. Use Stage Systems to buy organelles.":"No technologies in this path yet."));

    const autoControlList=byId("auto-control-list"); autoControlList.innerHTML="";
    const settings=state.game.meta.automationSettings||(state.game.meta.automationSettings={organellesEnabled:true,infrastructureEnabled:true});
    if(Logic.upgradeLevel("auto_organelles")>0){
      const card=document.createElement("div");
      card.className="buy-card";
      const targetSelect=document.createElement("select");
      DATA.ARCHETYPES.forEach(function(arch){
        const option=document.createElement("option");
        option.value=arch.id;
        option.textContent=Logic.displayArchetypeName(arch.id);
        targetSelect.appendChild(option);
      });
      targetSelect.value=state.game.meta.autoOrganelleTarget||"humanoid";
      targetSelect.onpointerdown=function(event){ event.stopPropagation(); state.ui.inputActive=true; };
      targetSelect.onfocus=function(){ state.ui.inputActive=true; };
      targetSelect.onblur=function(){ state.ui.inputActive=false; UI.render(); };
      targetSelect.onchange=function(event){ state.game.meta.autoOrganelleTarget=event.target.value; State.saveGame(); };
      const toggle=document.createElement("input");
      toggle.type="checkbox";
      toggle.checked=settings.organellesEnabled!==false;
      toggle.onchange=function(event){ settings.organellesEnabled=!!event.target.checked; State.saveGame(); UI.render(); };
      const row=document.createElement("label");
      row.className="control-row";
      row.innerHTML='<span>Enabled</span>';
      row.appendChild(toggle);
      card.innerHTML='<div class="name-row"><span>Organelle Instinct</span>'+badge("Lv "+Logic.upgradeLevel("auto_organelles"),"available")+'</div><div class="tiny">Auto-buys affordable Cell organelles. Targeting stays hidden until a lineage has been discovered.</div>';
      card.appendChild(row);
      const targetRow=document.createElement("div");
      targetRow.className="control-row";
      targetRow.innerHTML='<span>Target lineage</span>';
      targetRow.appendChild(targetSelect);
      card.appendChild(targetRow);
      autoControlList.appendChild(card);
    }
    if(Logic.upgradeLevel("auto_generators")>0){
      const card=document.createElement("div");
      card.className="buy-card";
      const policySelect=document.createElement("select");
      [
        ["balanced","Balanced"],
        ["food","Food and water"],
        ["science","Rush science"],
        ["low_pollution","Avoid pollution"],
        ["lineage","Favor lineage"]
      ].forEach(function(row){
        const option=document.createElement("option");
        option.value=row[0];
        option.textContent=row[1];
        policySelect.appendChild(option);
      });
      policySelect.value=state.game.run.automationPolicy||"balanced";
      policySelect.onpointerdown=function(event){ event.stopPropagation(); state.ui.inputActive=true; };
      policySelect.onfocus=function(){ state.ui.inputActive=true; };
      policySelect.onblur=function(){ state.ui.inputActive=false; UI.render(); };
      policySelect.onchange=function(event){ Logic.setAutomationPolicy(event.target.value); State.saveGame(); };
      const toggle=document.createElement("input");
      toggle.type="checkbox";
      toggle.checked=settings.infrastructureEnabled!==false;
      toggle.onchange=function(event){ settings.infrastructureEnabled=!!event.target.checked; State.saveGame(); UI.render(); };
      const row=document.createElement("label");
      row.className="control-row";
      row.innerHTML='<span>Enabled</span>';
      row.appendChild(toggle);
      card.innerHTML='<div class="name-row"><span>Infrastructure Foreman</span>'+badge("Lv "+Logic.upgradeLevel("auto_generators"),"available")+'</div><div class="tiny">Auto-builds affordable production systems after the Cell stage using a simple priority.</div>';
      card.appendChild(row);
      const policyRow=document.createElement("div");
      policyRow.className="control-row";
      policyRow.innerHTML='<span>Priority</span>';
      policyRow.appendChild(policySelect);
      card.appendChild(policyRow);
      autoControlList.appendChild(card);
    }
    if(!autoControlList.children.length) autoControlList.appendChild(emptyState("Buy an autobuyer in the Evolution Shop to unlock automation controls."));

    const lineageIdentity=byId("lineage-identity-list"); lineageIdentity.innerHTML="";
    const lineagePolicySummary=byId("lineage-policy-summary"); lineagePolicySummary.innerHTML="";
    const lineageStorySummary=byId("lineage-story-summary"); lineageStorySummary.innerHTML="";
    const lineagePressureSummary=byId("lineage-pressure-summary"); lineagePressureSummary.innerHTML="";
    const lineageUnlocked=Logic.hasLockedLineage();
    const activeSpec=Logic.specializationDef(), eventChoices=Logic.chosenLineageEvents();
    [
      {label:"Lineage",value:lineageUnlocked?Logic.archetypeName(state.game.run.lockedArchetype):"Unformed",sub:lineageUnlocked?"Locked after Creature":"Evolve beyond Creature to lock this run."},
      {label:"Specialization",value:lineageUnlocked?(activeSpec?activeSpec.name:"Open"):"Dormant",sub:lineageUnlocked?(activeSpec?activeSpec.desc:"Choose one permanent fork for this run."):"Specialization begins after lineage lock-in."},
      {label:"Events",value:lineageUnlocked?Logic.fmt(eventChoices.length):"0",sub:lineageUnlocked?"Lineage event choices active":"No lineage story before lock-in."},
      {label:"Victory Path",value:lineageUnlocked?(DATA.VICTORY_VARIANTS[state.game.run.lockedArchetype]||"Galactic Transcendence"):"Unknown",sub:lineageUnlocked?"Galactic ending variant":"Hidden until a lineage forms."}
    ].forEach(function(row){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
      lineageIdentity.appendChild(card);
    });

    const specList=byId("specialization-list"); specList.innerHTML="";
    if(!lineageUnlocked) specList.appendChild(emptyState("Specialization unlocks after the Creature stage locks a lineage."));
    else Logic.availableSpecializations().forEach(function(spec){
      const picked=state.game.run.specialization===spec.id, disabled=!!state.game.run.specialization&&!picked;
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+spec.name+'</span>'+badge(picked?"Chosen":(disabled?"Closed":"Fork"),picked?"owned":(disabled?"locked":"available"))+'</div><div class="tiny">'+spec.desc+'</div><div class="effects">'+effectSourceText(spec)+'</div>';
      card.appendChild(cardButton(picked?"Chosen":"Choose",picked||disabled,disabled?"Another specialization is already active.":"Choose this specialization for the run.",function(){ if(Logic.chooseSpecialization(spec.id)) UI.render(); }));
      specList.appendChild(card);
    });

    const eventList=byId("lineage-event-list"); eventList.innerHTML="";
    if(!lineageUnlocked) eventList.appendChild(emptyState("Lineage events begin after a lineage is locked."));
    else {
      const events=Logic.availableLineageEvents();
      if(!events.length) eventList.appendChild(emptyState("No lineage events are available in this stage yet."));
      events.forEach(function(event){
        const chosen=(state.game.run.lineageEvents||{})[event.id];
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+event.name+'</span>'+badge(chosen?"Resolved":"Choice",chosen?"owned":"available")+'</div><div class="tiny">'+event.desc+'</div>';
        (event.choices||[]).forEach(function(choice){
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge(chosen===choice.id?"Chosen":(chosen?"Closed":"Option"),chosen===choice.id?"owned":(chosen?"locked":"available"))+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
          row.appendChild(cardButton(chosen===choice.id?"Chosen":"Choose",!!chosen,chosen?"This event has already been resolved.":"Resolve this lineage event.",function(){ if(Logic.chooseLineageEvent(event.id,choice.id)) UI.render(); }));
          card.appendChild(row);
        });
        eventList.appendChild(card);
      });
    }

    const lawList=byId("lineage-law-list"); lawList.innerHTML="";
    const activeDoctrineId=world.activeDoctrine;
    if(activeDoctrineId){
      const doctrine=((DATA.LINEAGE_DOCTRINES||{})[state.game.run.lockedArchetype]||[]).find(function(item){ return item.id===activeDoctrineId; });
      if(doctrine){
        const card=document.createElement("div");
        card.className="mini-card";
        card.innerHTML='<div class="name-row"><span>'+doctrine.name+'</span>'+badge("Doctrine","owned")+'</div><div class="tiny">'+doctrine.desc+'</div><div class="effects">'+effectSourceText(doctrine)+'</div>';
        lawList.appendChild(card);
      }
      (world.doctrineEvolutions||[]).forEach(function(evo){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+evo.name+'</span>'+badge("Evolve","available")+'</div><div class="tiny">'+evo.desc+'</div><div class="effects">'+effectSourceText(evo)+'</div>';
        card.appendChild(cardButton("Evolve Doctrine",false,"Upgrade this doctrine into its advanced form.",function(){ if(Logic.evolveDoctrine(evo.baseDoctrine)) UI.render(); }));
        lawList.appendChild(card);
      });
    } else if((world.doctrines||[]).length){
      (world.doctrines||[]).forEach(function(doctrine){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+doctrine.name+'</span>'+badge("Doctrine","available")+'</div><div class="tiny">'+doctrine.desc+'</div><div class="effects">'+effectSourceText(doctrine)+'</div>';
        card.appendChild(cardButton("Choose",false,"Choose this repeat-win doctrine for the run.",function(){ if(Logic.chooseDoctrine(doctrine.id)) UI.render(); }));
        lawList.appendChild(card);
      });
    }
    const lawOptions=Logic.availableLineageLaws();
    const adoptedLawId=(state.game.run.lineageLaws||{})[stage.id];
    if(adoptedLawId){
      const law=((DATA.LINEAGE_LAWS||{})[stage.id]||[]).find(function(item){ return item.id===adoptedLawId; });
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+law.name+'</span>'+badge("Adopted","owned")+'</div><div class="tiny">'+law.desc+'</div><div class="effects">'+effectSourceText(law)+'</div>';
      lawList.appendChild(card);
    } else if(!lawOptions.length) lawList.appendChild(emptyState("Lineage laws unlock after Civilization for Empire, Solar, and Galactic stages."));
    else lawOptions.forEach(function(law){
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+law.name+'</span>'+badge("Law","available")+'</div><div class="tiny">'+law.desc+'</div><div class="effects">'+effectSourceText(law)+'</div>';
      card.appendChild(cardButton("Adopt",false,"Adopt this permanent stage law.",function(){ if(Logic.chooseLineageLaw(law.id)) UI.render(); }));
      lawList.appendChild(card);
    });
    const currentLawSets=Logic.worldSummary().lawSets;
    (DATA.LAW_SETS||[]).forEach(function(set){
      const active=currentLawSets.some(function(item){ return item.id===set.id; }), chosen=Object.values(state.game.run.lineageLaws||{}), card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+set.name+'</span>'+badge(active?"Set active":"Law set",active?"owned":"locked")+'</div><div class="tiny">Needs '+set.requires.filter(function(id){ return !chosen.includes(id); }).length+' more matching laws</div><div class="effects">'+effectSourceText(set)+'</div>';
      lawList.appendChild(card);
    });
    (Logic.worldSummary().lawCongress||[]).forEach(function(item){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+item.name+'</span>'+badge("Congress","owned")+'</div><div class="tiny">'+item.desc+'</div><div class="effects">'+effectSourceText(item)+'</div>';
      lawList.appendChild(card);
    });

    const goalList=byId("stage-goal-list"); goalList.innerHTML="";
    Logic.stageGoals().forEach(function(goal){
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+goal.name+'</span>'+badge(goal.claimed?"Claimed":(goal.done?"Ready":"Goal"),goal.claimed?"owned":(goal.done?"available":"locked"))+'</div><div class="tiny">'+goal.desc+'</div><div class="effects">'+goal.detail+'</div><div class="cost">Reward: '+goal.reward+' EP</div>';
      card.appendChild(cardButton(goal.claimed?"Claimed":"Claim",goal.claimed||!goal.done,goal.done?"Claim this optional objective.":"Goal not complete.",function(){ if(Logic.claimStageGoal(goal.id)) UI.render(); }));
      goalList.appendChild(card);
    });

    const threatList=byId("threat-list"); threatList.innerHTML="";
    const threats=Logic.threats();
    const scars=Logic.worldSummary().threatScars;
    if(!threats.length && !scars.length) threatList.appendChild(emptyState("No major threats detected."));
    else threats.forEach(function(threat){
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+threat.title+'</span>'+badge("Severity "+threat.severity,"locked")+'</div><div class="tiny">'+threat.detail+'</div>';
      Logic.availableThreatProjects().filter(function(project){ return project.threat===threat.id; }).forEach(function(project){
        const done=!!state.game.run.threatProjects[project.id], canResolve=done?false:Logic.canAfford(project.cost);
        const row=document.createElement("div");
        row.className="choice-row";
        row.innerHTML='<div class="name-row"><span>'+project.name+'</span>'+badge(done?"Resolved":(canResolve?"Project":"Needs resources"),done?"owned":(canResolve?"available":"locked"))+'</div><div class="effects">'+effectSourceText(project)+'</div><div class="cost">Cost: '+Logic.bundleText(project.cost)+'</div>';
        row.appendChild(cardButton(done?"Resolved":"Resolve",done||!canResolve,canResolve?"Complete this project.":"Need resources for this project.",function(){ if(Logic.resolveThreatProject(project.id)) UI.render(); }));
        card.appendChild(row);
      });
      threatList.appendChild(card);
    });
    scars.forEach(function(scar){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+scar.name+'</span>'+badge(scar.mutated?"Mutated":"Scar","locked")+'</div><div class="tiny">Persistent consequence from ignored threats.</div><div class="effects">'+effectSourceText(scar)+'</div>';
      threatList.appendChild(card);
    });
    Logic.worldSummary().transformedScars.forEach(function(scar){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+scar.name+'</span>'+badge("Transformed","owned")+'</div><div class="tiny">A recovered scar now works for the lineage.</div><div class="effects">'+effectSourceText(scar)+'</div>';
      threatList.appendChild(card);
    });

    const routeList=byId("route-list"); routeList.innerHTML="";
    const routes=Logic.resourceRoutes();
    if(!routes.length) routeList.appendChild(emptyState("No active production routes yet."));
    else routes.slice(0,8).forEach(function(route){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+route.name+'</span>'+badge(route.from?"Route":"Output","available")+'</div><div class="tiny">'+(route.from||"No input")+' -> '+(route.to||"No output")+'</div>';
      routeList.appendChild(card);
    });

    const pressureList=byId("pressure-alert-list"); pressureList.innerHTML="";
    const alerts=Logic.pressureAlerts();
    if(!alerts.length) pressureList.appendChild(emptyState("No urgent resource pressure detected."));
    else alerts.forEach(function(alert){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+alert.title+'</span>'+badge(alert.kind,"locked")+'</div><div class="tiny">'+alert.detail+'</div>';
      pressureList.appendChild(card);
    });

    [
      {label:"Doctrine",value:lineageUnlocked?(world.activeDoctrine?(((DATA.LINEAGE_DOCTRINES||{})[state.game.run.lockedArchetype]||[]).find(function(item){ return item.id===world.activeDoctrine; })||{name:"Active Doctrine"}).name:((world.doctrines||[]).length?"Available":"Dormant")):"Dormant",sub:lineageUnlocked?(world.activeDoctrine?"Current repeat-win doctrine":((world.doctrines||[]).length?"A doctrine can be chosen this run":"No doctrine unlocked yet")):"Policies begin after lineage lock-in."},
      {label:"Stage Law",value:lineageUnlocked?(adoptedLawId?(((DATA.LINEAGE_LAWS||{})[stage.id]||[]).find(function(item){ return item.id===adoptedLawId; })||{name:"Adopted"}).name:((lawOptions||[]).length?"Available":"Dormant")):"Dormant",sub:lineageUnlocked?(adoptedLawId?"Permanent law for this stage":((lawOptions||[]).length?"A law choice is waiting":"No law in this stage yet")):"No lineage law before lock-in."},
      {label:"Law Sets",value:lineageUnlocked?Logic.fmt((currentLawSets||[]).length):"0",sub:lineageUnlocked?((currentLawSets||[]).length?"Active policy combinations":"No matching law sets active"):"Policy sets are hidden until lineage matters."},
      {label:"Congress Links",value:lineageUnlocked?Logic.fmt((Logic.worldSummary().lawCongress||[]).length):"0",sub:lineageUnlocked?"Policy synergies with congress blocs":"No lineage congress ties yet."}
    ].forEach(function(row){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
      lineagePolicySummary.appendChild(card);
    });

    [
      {label:"Event Choices",value:lineageUnlocked?Logic.fmt(unresolvedLineageEvents.length):"0",sub:lineageUnlocked?(unresolvedLineageEvents.length?"Unresolved lineage decisions":"No unresolved lineage events"):"Lineage story starts after lock-in."},
      {label:"Resolved Events",value:lineageUnlocked?Logic.fmt(eventChoices.length):"0",sub:lineageUnlocked?"Choices already committed this run":"No lineage story has begun."},
      {label:"Archive Weight",value:lineageUnlocked?Logic.fmt((state.game.run.archive||[]).length):"0",sub:lineageUnlocked?"Retired stages feeding lineage memory":"Archive memory is not lineage-specific yet."},
      {label:"Focus",value:lineageUnlocked?"Lineage Story":"Stage Story",sub:lineageUnlocked?"This panel now tracks lineage-specific narrative.":"Generic objectives live in Actions until lock-in."}
    ].forEach(function(row){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
      lineageStorySummary.appendChild(card);
    });

    [
      {label:"Threats",value:lineageUnlocked?Logic.fmt(threats.length):"0",sub:lineageUnlocked?(threats.length?"Major issues demanding action":"No major threats detected"):"Threat history starts after lineage lock-in."},
      {label:"Scars",value:lineageUnlocked?Logic.fmt(scars.length):"0",sub:lineageUnlocked?(scars.length?"Persistent consequences are active":"No active lineage scars"):"No lineage scars before lock-in."},
      {label:"Alerts",value:Logic.fmt(alerts.length),sub:alerts.length?"Urgent pressure warnings":"No urgent pressure alerts"},
      {label:"Routes",value:Logic.fmt(routes.length),sub:routes.length?"Active resource routes this stage":"No route network yet"}
    ].forEach(function(row){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
      lineagePressureSummary.appendChild(card);
    });

    const worldSummary=byId("world-summary-list"); worldSummary.innerHTML="";
    [
      {label:"Era",value:world.era?world.era.name:(state.game.meta.galacticWins>0?"Stable":"Locked"),sub:world.era?effectSourceText(world.era):"Era modifiers unlock after first Galactic win."},
      {label:"Slots",value:world.slots.filter(function(s){ return !!s.systemId; }).length+" / "+world.slots.length,sub:"Occupied map locations"},
      {label:"Artifacts",value:world.artifacts.length,sub:"Inherited relics active"},
      {label:"Rivals",value:world.rivals.filter(function(r){ return r.victory; }).length+" / "+world.rivals.length,sub:"Rivals at victory pressure"},
      {label:"Legacy",value:world.legacyTier?world.legacyTier.name:"Standard",sub:(world.legacyTier&&world.legacyTier.epMult!==1)?("EP x"+world.legacyTier.epMult):"Baseline universe"},
      {label:"Tension",value:world.ascensionTension||0,sub:stage.id==="galactic"?"Ascension instability":"Galactic-only pressure"},
      {label:"Archive Boost",value:"+"+Math.round(Logic.archiveBoostValue()*1000)/10+"%",sub:Object.keys(state.game.meta.seenContent||{}).length+" seen entries"}
    ].forEach(function(row){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
      worldSummary.appendChild(card);
    });
    if(world.era && Logic.upgradeLevel("era_control")>0){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">Forecast</div><div class="value">'+(world.forecast?world.forecast.name:"Stable")+'</div><div class="tiny">'+(world.forecast?effectSourceText(world.forecast):"No next era to forecast.")+'</div>';
      card.appendChild(cardButton("Reroll Era",false,"Shift the current era to the next available condition.",function(){ if(Logic.rerollEra()) UI.render(); }));
      worldSummary.appendChild(card);
    }
    const maintenanceCost=Logic.wonderMaintenanceCost();
    if(maintenanceCost){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">Wonder Upkeep</div><div class="value">Every 90s</div><div class="tiny">'+Logic.bundleText(maintenanceCost)+'</div>';
      worldSummary.appendChild(card);
    }

    const milestoneList=byId("milestone-list"); milestoneList.innerHTML="";
    world.unlocks.forEach(function(unlock){
      const active=Logic.hasMetaUnlock(unlock.id), card=document.createElement("div");
      card.className="mini-card";
      const justUnlocked=active && state.game.meta.lastMilestoneWins===unlock.wins;
      card.innerHTML='<div class="name-row"><span>'+unlock.name+'</span>'+badge(justUnlocked?"New":(active?"Unlocked":unlock.wins+" wins"),justUnlocked||active?"owned":"locked")+'</div><div class="tiny">'+unlock.desc+'</div>';
      milestoneList.appendChild(card);
    });

    const mutatorList=byId("mutator-list"); mutatorList.innerHTML="";
    if(!Logic.hasMetaUnlock("run_mutators")) mutatorList.appendChild(emptyState(Logic.unlockText("run_mutators")));
    else if(world.activeMutator!==null){
      const mut=(DATA.RUN_MUTATORS||[]).find(function(item){ return item.id===world.activeMutator; });
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+(mut?mut.name:"Skipped")+'</span>'+badge("Chosen","owned")+'</div><div class="tiny">'+(mut?mut.desc:"No mutator for this stage.")+'</div>'+(mut?'<div class="effects">'+effectSourceText(mut)+'</div>':'');
      mutatorList.appendChild(card);
    } else {
      world.mutatorDraft.forEach(function(mutator){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+mutator.name+'</span>'+badge("Draft","available")+'</div><div class="tiny">'+mutator.desc+'</div><div class="effects">'+effectSourceText(mutator)+'</div>';
        card.appendChild(cardButton("Choose",false,"Choose this mutator for the stage.",function(){ if(Logic.chooseMutator(mutator.id)) UI.render(); }));
        mutatorList.appendChild(card);
      });
      const skip=document.createElement("div");
      skip.className="buy-card";
      skip.innerHTML='<div class="name-row"><span>No Mutator</span>'+badge("Safe","available")+'</div><div class="tiny">Skip this stage draft.</div>';
      skip.appendChild(cardButton("Skip",false,"Skip the stage mutator.",function(){ if(Logic.chooseMutator("")) UI.render(); }));
      mutatorList.appendChild(skip);
    }

    const mapList=byId("map-slot-list"); mapList.innerHTML="";
    const layoutCard=document.createElement("div");
    layoutCard.className="buy-card";
    layoutCard.innerHTML='<div class="name-row"><span>Stage Layout</span>'+badge("Mastery "+world.stageMastery,"available")+'</div><div class="tiny">'+(world.activeStageLayout?world.activeStageLayout.desc:"Default stage layout")+'</div>';
    const layoutSelect=document.createElement("select");
    (world.stageLayouts||[]).forEach(function(layout){
      const option=document.createElement("option");
      option.value=layout.id;
      option.textContent=layout.name+(layout.wins?(" - "+layout.wins+" clears"):"");
      layoutSelect.appendChild(option);
    });
    layoutSelect.value=(world.activeStageLayout&&world.activeStageLayout.id)||"standard";
    layoutSelect.onchange=function(event){ if(Logic.chooseStageLayout(stage.id,event.target.value)) UI.render(); };
    layoutCard.appendChild(layoutSelect);
    mapList.appendChild(layoutCard);
    const expandCard=document.createElement("div");
    const expanded=state.game.run.expandedSlots[stage.id]||0, expandCost=2+expanded*2;
    expandCard.className="buy-card";
    expandCard.innerHTML='<div class="name-row"><span>Expand '+stage.name+' Map</span>'+badge(expanded>=3?"Max":"+"+expanded,"available")+'</div><div class="tiny">Adds archetype-leaning slots for buildings and stage systems.</div><div class="cost">Cost: '+expandCost+' EP</div>';
    expandCard.appendChild(cardButton(expanded>=3?"Maxed":"Expand",expanded>=3 || (state.game.meta.evolutionPoints<expandCost&&!state.ui.debug),"Spend EP to add a new slot.",function(){ if(Logic.expandMap()) UI.render(); }));
    mapList.appendChild(expandCard);
    const mapLinkCard=document.createElement("div");
    mapLinkCard.className="buy-card";
    mapLinkCard.innerHTML='<div class="name-row"><span>Placement Board</span>'+badge(world.slots.filter(function(slot){ return !!slot.systemId; }).length+" / "+world.slots.length,"owned")+'</div><div class="tiny">The interactive map now lives in Stage Systems so building placement stays near the systems it affects.</div>';
    mapLinkCard.appendChild(cardButton("Open Stage Map",false,"Jump to the systems map board.",function(){ switchTab("systems"); }));
    mapList.appendChild(mapLinkCard);

    const wonderList=byId("map-wonder-list"); wonderList.innerHTML="";
    world.slots.forEach(function(slot){
      const builtId=(world.mapWonders||{})[slot.id], built=builtId?(DATA.MAP_WONDERS||[]).find(function(item){ return item.id===builtId; }):null;
      if(built){
        const level=(state.game.run.mapWonderLevels||{})[slot.id]||1, maxLevel=Logic.maxMapWonderLevel(), canUpgrade=level<maxLevel && Logic.canAfford(Logic.mapWonderUpgradeCost(slot.id));
        const card=document.createElement("div");
        card.className="mini-card";
        card.innerHTML='<div class="name-row"><span>'+built.name+'</span>'+badge("Lv "+level+"/"+maxLevel,"owned")+'</div><div class="tiny">'+slot.name+' landmark.</div><div class="effects">'+effectSourceText(Logic.mapWonderSources().find(function(item){ return item.id===built.id; })||built)+'</div><div class="cost">Upgrade: '+Logic.bundleText(Logic.mapWonderUpgradeCost(slot.id))+'</div>';
        card.appendChild(cardButton(level>=maxLevel?"Maxed":"Upgrade",level>=maxLevel||!canUpgrade,canUpgrade?"Upgrade this wonder.":"Needs resources or max level.",function(){ if(Logic.upgradeMapWonder(slot.id)) UI.render(); }));
        wonderList.appendChild(card);
        return;
      }
      Logic.availableMapWonders(slot.id).forEach(function(wonder){
        const canBuy=Logic.canAfford(wonder.cost), card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+wonder.name+'</span>'+badge(slot.name,canBuy?"available":"locked")+'</div><div class="tiny">Fits '+slot.name+' terrain.</div><div class="effects">'+effectSourceText(wonder)+'</div><div class="cost">Cost: '+Logic.bundleText(wonder.cost)+'</div>';
        card.appendChild(cardButton("Build",!canBuy,canBuy?"Build this wonder in the slot.":"Not enough resources.",function(){ if(Logic.buildMapWonder(wonder.id,slot.id)) UI.render(); }));
        wonderList.appendChild(card);
      });
    });
    (world.wonderSets||[]).forEach(function(set){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+set.name+'</span>'+badge("Set","owned")+'</div><div class="tiny">'+set.desc+'</div><div class="effects">'+effectSourceText(set)+'</div>';
      wonderList.appendChild(card);
    });
    (world.artifactFusions||[]).forEach(function(set){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+set.name+'</span>'+badge("Fusion","owned")+'</div><div class="tiny">'+set.desc+'</div><div class="effects">'+effectSourceText(set)+'</div>';
      wonderList.appendChild(card);
    });
    (world.timelineMilestones||[]).forEach(function(milestone){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+milestone.name+'</span>'+badge("Timeline","owned")+'</div><div class="tiny">'+milestone.desc+'</div><div class="effects">'+effectSourceText(milestone)+'</div>';
      wonderList.appendChild(card);
    });
    (world.timelineAnchors||[]).forEach(function(anchor){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+anchor.name+'</span>'+badge("Anchor","owned")+'</div><div class="tiny">'+anchor.desc+'</div><div class="effects">'+effectSourceText(anchor)+'</div>';
      wonderList.appendChild(card);
    });
    (world.masteryRelics||[]).forEach(function(relic){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+relic.name+'</span>'+badge("Relic","owned")+'</div><div class="tiny">'+relic.desc+'</div><div class="effects">'+effectSourceText(relic)+'</div>';
      card.appendChild(cardButton(state.game.meta.activeRelics[Object.keys(DATA.MASTERY_RELICS).find(function(id){ return DATA.MASTERY_RELICS[id].name===relic.name; })]===false?"Enable":"Disable",false,"Toggle this mastery relic for future runs.",function(){
        const stageId=Object.keys(DATA.MASTERY_RELICS).find(function(id){ return DATA.MASTERY_RELICS[id].name===relic.name; });
        if(stageId && Logic.toggleMasteryRelic(stageId)) UI.render();
      }));
      wonderList.appendChild(card);
    });
    if(!wonderList.children.length) wonderList.appendChild(emptyState("No wonder fits the current slots yet."));

    const congressList=byId("congress-list"); congressList.innerHTML="";
    if(!world.congressProposals.length) congressList.appendChild(emptyState("Congress proposals begin in Empire."));
    else world.congressProposals.forEach(function(proposal){
      const picked=world.congressChoice===proposal.id, closed=!!world.congressChoice&&!picked, card=document.createElement("div");
      const bloc=(DATA.CONGRESS_BLOCS||{})[proposal.bloc];
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+proposal.name+'</span>'+badge(picked?"Passed":(closed?"Closed":"Proposal"),picked?"owned":(closed?"locked":"available"))+'</div><div class="tiny">'+proposal.desc+'</div><div class="effects">'+(bloc?("Bloc: "+bloc.name+" | "):"")+effectSourceText(proposal)+'</div>';
      card.appendChild(cardButton(picked?"Passed":"Pass",picked||closed,closed?"A congress proposal is already active.":"Pass this proposal for the run.",function(){ if(Logic.chooseCongressProposal(proposal.id)) UI.render(); }));
      congressList.appendChild(card);
    });
    if(world.currentCongress && world.nextCongressSeason){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>Congress Season</span>'+badge("Next: "+world.nextCongressSeason.name,"available")+'</div><div class="tiny">Current proposal: '+world.currentCongress.name+'</div>';
      card.appendChild(cardButton("Rotate Season",false,"Rotate congress to the next seasonal proposal.",function(){ if(Logic.rotateCongressSeason()) UI.render(); }));
      congressList.appendChild(card);
    }
    (world.institutionTraits||[]).forEach(function(trait){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+trait.name+'</span>'+badge("Trait","owned")+'</div><div class="tiny">'+trait.desc+'</div><div class="effects">'+effectSourceText(trait)+'</div>';
      congressList.appendChild(card);
    });
    if(world.congressCrisis){
      const crisis=world.congressCrisis;
      const crisisCard=document.createElement("div");
      crisisCard.className="buy-card";
      crisisCard.innerHTML='<div class="name-row"><span>'+crisis.name+'</span>'+badge(world.congressCrisisChoice?"Resolved":"Crisis",world.congressCrisisChoice?"owned":"locked")+'</div><div class="tiny">'+crisis.desc+'</div><div class="effects">'+effectSourceText(crisis)+'</div>';
      (crisis.choices||[]).forEach(function(choice){
        const row=document.createElement("div");
        row.className="choice-row";
        row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge(world.congressCrisisChoice===choice.id?"Chosen":(world.congressCrisisChoice?"Closed":"Response"),world.congressCrisisChoice===choice.id?"owned":(world.congressCrisisChoice?"locked":"available"))+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
        row.appendChild(cardButton(world.congressCrisisChoice===choice.id?"Chosen":"Choose",!!world.congressCrisisChoice,world.congressCrisisChoice?"This crisis has already been resolved.":"Choose a congress crisis response.",function(){ if(Logic.chooseCongressCrisisResponse(choice.id)) UI.render(); }));
        crisisCard.appendChild(row);
      });
      congressList.appendChild(crisisCard);
    }
    if(world.institutionCrisis){
      const crisis=world.institutionCrisis;
      const crisisCard=document.createElement("div");
      crisisCard.className="buy-card";
      crisisCard.innerHTML='<div class="name-row"><span>'+crisis.name+'</span>'+badge(world.institutionCrisisChoice?"Resolved":"Institution Crisis",world.institutionCrisisChoice?"owned":"locked")+'</div><div class="tiny">'+crisis.desc+'</div><div class="effects">'+effectSourceText(crisis)+'</div>';
      (crisis.choices||[]).forEach(function(choice){
        const row=document.createElement("div");
        row.className="choice-row";
        row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge(world.institutionCrisisChoice===choice.id?"Chosen":(world.institutionCrisisChoice?"Closed":"Response"),world.institutionCrisisChoice===choice.id?"owned":(world.institutionCrisisChoice?"locked":"available"))+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
        row.appendChild(cardButton(world.institutionCrisisChoice===choice.id?"Chosen":"Choose",!!world.institutionCrisisChoice,world.institutionCrisisChoice?"This crisis has already been resolved.":"Choose an institution crisis response.",function(){ if(Logic.chooseInstitutionCrisisResponse(choice.id)) UI.render(); }));
        crisisCard.appendChild(row);
      });
      congressList.appendChild(crisisCard);
    }

    const worldEventList=byId("world-event-list"); worldEventList.innerHTML="";
    if(!Logic.hasMetaUnlock("world_events")) worldEventList.appendChild(emptyState(Logic.unlockText("world_events")));
    else {
      Object.entries(world.worldEvents).forEach(function(entry){
        const slot=world.slots.find(function(item){ return item.id===entry[0].replace(":chain",""); }), event=Logic.worldEventDef(entry[1]);
        if(!event) return;
        const chosen=world.worldEventChoices[entry[0]];
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+event.name+'</span>'+badge(slot?slot.name:"Slot","available")+'</div><div class="tiny">'+event.desc+'</div>';
        (event.choices||[]).forEach(function(choice){
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge(chosen===choice.id?"Chosen":(chosen?"Closed":"Response"),chosen===choice.id?"owned":(chosen?"locked":"available"))+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
          row.appendChild(cardButton(chosen===choice.id?"Chosen":"Choose",!!chosen,chosen?"This event has already been resolved.":"Choose this event response.",function(){ if(Logic.chooseWorldEventResponse(entry[0],choice.id)) UI.render(); }));
          card.appendChild(row);
        });
        worldEventList.appendChild(card);
      });
      if(!worldEventList.children.length) worldEventList.appendChild(emptyState("No slot events on the current map."));
    }

    const artifactList=byId("artifact-list"); artifactList.innerHTML="";
    DATA.ARTIFACTS.forEach(function(artifact){
      const owned=!!state.game.meta.artifacts[artifact.id], card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+(owned?artifact.name:"???")+'</span>'+badge(owned?"Inherited":artifact.stage,owned?"owned":"locked")+'</div><div class="tiny">'+(owned?artifact.desc:"Complete strong stage goals to inherit this relic.")+'</div>'+(owned?'<div class="effects">'+effectSourceText(artifact)+'</div>':'');
      artifactList.appendChild(card);
    });
    (DATA.ARTIFACT_SETS||[]).forEach(function(set){
      const owned=(set.requires||[]).every(function(id){ return !!state.game.meta.artifacts[id]; }), card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+(owned?set.name:"Artifact Set")+'</span>'+badge(owned?"Active":"Collection",owned?"owned":"locked")+'</div><div class="tiny">'+(owned?"Set complete.":"Requires "+(set.requires||[]).length+" relics.")+'</div>'+(owned?'<div class="effects">'+effectSourceText(set)+'</div>':'');
      artifactList.appendChild(card);
    });
    (world.artifactEvolutions||[]).forEach(function(evo){
      const canBuy=Logic.canAfford(evo.cost), card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+evo.name+'</span>'+badge("Reassembly",canBuy?"available":"locked")+'</div><div class="tiny">'+evo.desc+'</div><div class="effects">'+effectSourceText(evo)+'</div><div class="cost">Cost: '+Logic.bundleText(evo.cost)+' | '+evo.wins+' wins</div>';
      card.appendChild(cardButton("Reassemble",!canBuy,canBuy?"Evolve this artifact into a stronger inherited relic.":"Need resources for this reassembly.",function(){ if(Logic.evolveArtifact(evo.id)) UI.render(); }));
      artifactList.appendChild(card);
    });
    (world.restoredArtifacts||[]).forEach(function(item){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+item.name+'</span>'+badge("Restored","owned")+'</div><div class="tiny">'+item.desc+'</div><div class="effects">'+effectSourceText(item)+'</div>';
      artifactList.appendChild(card);
    });
    (world.restorationChains||[]).forEach(function(item){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+item.name+'</span>'+badge("Chain","owned")+'</div><div class="tiny">'+item.desc+'</div><div class="effects">'+effectSourceText(item)+'</div>';
      artifactList.appendChild(card);
    });
    Object.keys(world.wornArtifacts||{}).forEach(function(id){
      const artifact=(DATA.ARTIFACTS||[]).find(function(item){ return item.id===id; });
      if(!artifact) return;
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+artifact.name+'</span>'+badge("Worn","locked")+'</div><div class="tiny">This relic degraded in a harsh universe and can be restored through a project.</div>';
      artifactList.appendChild(card);
    });

    const contractList=byId("contract-list"); contractList.innerHTML="";
    if(state.game.meta.galacticWins<=0 && !state.ui.debug) contractList.appendChild(emptyState("Stage contracts unlock after a Galactic victory."));
    else world.contracts.forEach(function(contract){
      const picked=world.activeContract===contract.id, closed=!!world.activeContract&&!picked, canPick=!world.activeContract && (Logic.ownedSystemsForStage().length===0 || state.ui.debug);
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+contract.name+'</span>'+badge(picked?"Active":(closed?"Closed":"Challenge"),picked?"owned":(closed?"locked":"available"))+'</div><div class="tiny">'+contract.desc+'</div><div class="effects">'+effectSourceText(contract)+'</div><div class="cost">Reward: '+contract.reward+' EP on evolve</div>';
      if(contract.after) card.innerHTML+='<div class="effects">Chain tier '+contract.tier+' | Requires '+contract.after+'</div>';
      card.appendChild(cardButton(picked?"Active":"Accept",picked||closed||!canPick,canPick?"Accept this stage contract before building.":"Contracts must be chosen at stage start.",function(){ if(Logic.chooseContract(contract.id)) UI.render(); }));
      contractList.appendChild(card);
    });
    if(!contractList.children.length) contractList.appendChild(emptyState("No contracts available."));

    const rivalList=byId("rival-list"); rivalList.innerHTML="";
    (world.vassalDemands||[]).forEach(function(row){
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+row.demand.name+'</span>'+badge(Logic.displayArchetypeName(row.archetype),"available")+'</div><div class="tiny">'+row.demand.desc+'</div><div class="effects">'+effectSourceText(row.demand)+'</div>';
      card.appendChild(cardButton("Choose",false,"Resolve this vassal demand.",function(){ if(Logic.chooseVassalDemand(row.archetype,row.demand.id)) UI.render(); }));
      rivalList.appendChild(card);
    });
    (world.rivalDefections||[]).forEach(function(row){
      const rival=row.rival, defection=row.defection, card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+defection.name+'</span>'+badge(Logic.displayArchetypeName(rival.archetype),"available")+'</div><div class="tiny">'+defection.desc+'</div><div class="effects">'+effectSourceText(defection)+'</div>';
      card.appendChild(cardButton("Resolve",false,"Use this response against a pressured rival.",function(){ if(Logic.chooseRivalDefection(rival.archetype,defection.id)) UI.render(); }));
      rivalList.appendChild(card);
    });
    world.rivalInteractions.forEach(function(event){
      const chosen=Object.values(state.game.run.rivalEvents||{}).includes(event.id), stageChosen=!!(state.game.run.rivalEvents||{})[stage.id];
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+event.name+'</span>'+badge(chosen?"Active":(stageChosen?"Closed":"Interaction"),chosen?"owned":(stageChosen?"locked":"available"))+'</div><div class="tiny">'+event.desc+'</div><div class="effects">'+effectSourceText(event)+'</div>';
      card.appendChild(cardButton(chosen?"Chosen":"Choose",stageChosen,stageChosen?"This stage already has a rival interaction.":"Choose one rival interaction for this stage.",function(){ if(Logic.chooseRivalInteraction(event.id)) UI.render(); }));
      rivalList.appendChild(card);
    });
    world.rivals.forEach(function(rival){
      const card=document.createElement("div");
      card.className="mini-card";
      applyArchetypeBorder(card,{archetype:rival.archetype});
      const personality=(DATA.RIVAL_PERSONALITIES||[]).find(function(item){ return item.id===rival.personality; });
      const path=(DATA.RIVAL_ASCENSION||{})[rival.path];
      card.innerHTML='<div class="name-row"><span>'+Logic.displayArchetypeName(rival.archetype)+'</span>'+badge(rival.victory?"Victory":Logic.fmt(rival.score),rival.victory?"locked":"available")+'</div><div class="bar"><div class="fill" style="width:'+Math.min(100,rival.score)+'%"></div></div><div class="tiny">'+(personality?(personality.name+" | "+personality.desc):"Unknown personality")+'</div><div class="tiny">'+(path?path.name:"No ascension bid")+' | Trend +'+Logic.fmt(rival.trend*60)+'/min</div>';
      rivalList.appendChild(card);
    });
    Object.entries(world.vassals||{}).forEach(function(entry){
      const card=document.createElement("div"), row=entry[1]||{};
      const personality=(DATA.VASSAL_PERSONALITIES||[]).find(function(item){ return item.id===row.personality; });
      card.className="mini-card";
      applyArchetypeBorder(card,{archetype:entry[0]});
      card.innerHTML='<div class="name-row"><span>'+Logic.displayArchetypeName(entry[0])+' Vassal</span>'+badge(row.mode||"bound","owned")+'</div><div class="tiny">Persistent support gained from rival resolution. Strength '+(row.count||1)+(personality?(' | '+personality.name):'')+'.</div>';
      rivalList.appendChild(card);
    });
    if(!rivalList.children.length) rivalList.appendChild(emptyState("No rival lineages are active."));

    const hybridList=byId("hybrid-list"); hybridList.innerHTML="";
    if(!Logic.hasMetaUnlock("hybridization")) hybridList.appendChild(emptyState(Logic.unlockText("hybridization")));
    else if(Logic.upgradeLevel("hybridization")<=0 && !state.ui.debug) hybridList.appendChild(emptyState("Buy Hybrid Lineage in the Evolution Shop to choose a secondary influence."));
    else DATA.ARCHETYPES.filter(function(arch){ return arch.id!==state.game.run.lockedArchetype; }).forEach(function(arch){
      const picked=state.game.run.secondaryArchetype===arch.id, disabled=!!state.game.run.secondaryArchetype&&!picked;
      const card=document.createElement("div");
      card.className="mini-card";
      applyArchetypeBorder(card,{archetype:arch.id});
      card.innerHTML='<div class="name-row"><span>'+Logic.displayArchetypeName(arch.id)+'</span>'+badge(picked?"Hybrid":(disabled?"Closed":"Available"),picked?"owned":(disabled?"locked":"available"))+'</div><div class="tiny">Adds a smaller second influence to this run.</div>';
      card.appendChild(cardButton(picked?"Chosen":"Choose",picked||disabled,disabled?"A secondary lineage is already selected.":"Choose this secondary lineage.",function(){ if(Logic.chooseSecondaryArchetype(arch.id)) UI.render(); }));
      hybridList.appendChild(card);
    });

    const projectList=byId("project-list"); projectList.innerHTML="";
    const activeProject=Logic.specialProjectDef();
    if(world.pendingProject){
      const pending=world.pendingProject, card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+pending.name+'</span>'+badge("Complete","available")+'</div><div class="tiny">Choose how this project resolves.</div>';
      if(pending.scarRecovery){
        Object.keys(state.game.meta.threatScars||{}).filter(function(id){ return !state.game.meta.transformedScars[id]; }).forEach(function(id){
          const transform=(DATA.SCAR_TRANSFORMS||{})[id];
          if(!transform) return;
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+transform.name+'</span>'+badge("Transform","available")+'</div><div class="effects">'+effectSourceText(transform)+'</div>';
          row.appendChild(cardButton("Transform",false,"Transform this scar.",function(){ if(Logic.chooseProjectCompletion(id)) UI.render(); }));
          card.appendChild(row);
        });
      } else (pending.choices||[]).forEach(function(choice){
        const row=document.createElement("div");
        row.className="choice-row";
        row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge("Branch","available")+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
        row.appendChild(cardButton("Choose",false,"Choose this completion branch.",function(){ if(Logic.chooseProjectCompletion(choice.id)) UI.render(); }));
        card.appendChild(row);
      });
      projectList.appendChild(card);
    } else if(activeProject && state.game.run.specialProject){
      const pct=Math.min(100,Math.round((state.game.run.specialProject.progress/activeProject.duration)*100));
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+activeProject.name+'</span>'+badge(pct+"%","available")+'</div><div class="tiny">'+activeProject.desc+'</div><div class="bar"><div class="fill" style="width:'+pct+'%"></div></div>';
      projectList.appendChild(card);
    } else {
      world.allSpecialProjects.forEach(function(project){
        const reason=Logic.projectLockReason(project), canBuy=!reason, card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+project.name+'</span>'+badge(canBuy?"Project":"Locked",canBuy?"available":"locked")+'</div><div class="tiny">'+project.desc+'</div><div class="effects">'+effectSourceText(project)+'</div><div class="cost">Cost: '+Logic.bundleText(Logic.discountedProjectCost(project.cost))+' | Time '+project.duration+'s</div>'+(project.targetArchetype?'<div class="effects">Counter-project vs '+Logic.displayArchetypeName(project.targetArchetype)+'</div>':'')+(reason?'<div class="lock-reason">'+reason+'</div>':'');
        card.appendChild(cardButton("Start",!canBuy,canBuy?"Start this long project.":reason,function(){ if(Logic.startSpecialProject(project.id)) UI.render(); }));
        projectList.appendChild(card);
      });
      if(!projectList.children.length) projectList.appendChild(emptyState("No special project is available in this stage."));
    }

    const ascensionPathList=byId("ascension-path-list"); ascensionPathList.innerHTML="";
    if(stage.id!=="galactic") ascensionPathList.appendChild(emptyState("Ascension paths unlock in Galactic."));
    else if(state.game.run.ascensionPath){
      const path=(DATA.ASCENSION_PATHS||[]).find(function(item){ return item.id===state.game.run.ascensionPath; });
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+path.name+'</span>'+badge("Committed","owned")+'</div><div class="tiny">'+path.desc+'</div><div class="effects">'+effectSourceText(path)+'</div>';
      ascensionPathList.appendChild(card);
      world.ascensionObjectives.forEach(function(obj){
        const row=document.createElement("div");
        row.className="mini-card";
        row.innerHTML='<div class="name-row"><span>'+obj.name+'</span>'+badge(obj.done?("+"+obj.reward+" EP"):"Objective",obj.done?"owned":"locked")+'</div><div class="tiny">'+obj.detail+'</div>';
        ascensionPathList.appendChild(row);
      });
    } else (DATA.ASCENSION_PATHS||[]).forEach(function(path){
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+path.name+'</span>'+badge("Path","available")+'</div><div class="tiny">'+path.desc+'</div><div class="effects">'+effectSourceText(path)+'</div>';
      card.appendChild(cardButton("Commit",false,"Commit to this Galactic victory build.",function(){ if(Logic.chooseAscensionPath(path.id)) UI.render(); }));
      ascensionPathList.appendChild(card);
    });

    const templateList=byId("template-list"); templateList.innerHTML="";
    const saveCard=document.createElement("div");
    saveCard.className="buy-card";
    saveCard.innerHTML='<div class="name-row"><span>Current Build</span>'+badge("Template","available")+'</div><div class="tiny">Stores autobuyer settings and the current specialization for later runs.</div>';
    saveCard.appendChild(cardButton("Save Template",false,"Save current settings.",function(){ if(Logic.saveBuildTemplate("Default")) UI.render(); }));
    templateList.appendChild(saveCard);
    const seedCard=document.createElement("div");
    seedCard.className="buy-card";
    seedCard.innerHTML='<div class="name-row"><span>Favorite Loadout</span>'+badge("Archive","available")+'</div><div class="tiny">Seed a template from pinned archive memory.</div>';
    seedCard.appendChild(cardButton("Seed Template",false,"Create a template from archive favorites.",function(){ if(Logic.seedTemplateFromFavorite()) UI.render(); }));
    templateList.appendChild(seedCard);
    const mapPresetCard=document.createElement("div");
    mapPresetCard.className="buy-card";
    mapPresetCard.innerHTML='<div class="name-row"><span>Current World Layout</span>'+badge("Preset","available")+'</div><div class="tiny">Stores this stage map slot assignments separately from automation templates.</div>';
    mapPresetCard.appendChild(cardButton("Save Layout",false,"Save current slot assignments.",function(){ if(Logic.saveMapPreset(stage.id+" Layout")) UI.render(); }));
    templateList.appendChild(mapPresetCard);
    Object.entries(world.templates).forEach(function(entry){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+entry[0]+'</span>'+badge("Saved","owned")+'</div><div class="tiny">Target '+(entry[1].autoOrganelleTarget||"-")+' | Spec '+(entry[1].specialization||"none")+' | Doctrine '+(entry[1].doctrine||"none")+(entry[1].favoriteSource?(" | "+entry[1].favoriteSource):"")+'</div>';
      card.appendChild(cardButton("Apply",false,"Apply this template.",function(){ if(Logic.applyBuildTemplate(entry[0])) UI.render(); }));
      templateList.appendChild(card);
    });
    Object.entries(world.mapPresets).forEach(function(entry){
      const card=document.createElement("div");
      const usable=entry[1].stageId===stage.id;
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+entry[0]+'</span>'+badge(usable?"Layout":"Other stage",usable?"owned":"locked")+'</div><div class="tiny">Stage '+entry[1].stageId+' | '+(entry[1].slots||[]).filter(function(row){ return !!row.systemId; }).length+' placements</div>';
      card.appendChild(cardButton("Apply",!usable,usable?"Apply this map layout.":"This preset belongs to another stage.",function(){ if(Logic.applyMapPreset(entry[0])) UI.render(); }));
      templateList.appendChild(card);
    });

    const codex=Logic.codexSummary(), codexSummary=byId("codex-summary-list"); codexSummary.innerHTML="";
    [
      {label:"Revealed",value:Logic.fmt(codex.archetypesRevealed),sub:"Known archetypes"},
      {label:"Wins",value:Logic.fmt(state.game.meta.galacticWins),sub:"Galactic victories"},
      {label:"Specializations",value:Logic.fmt(codex.specializations),sub:"Discovered forks"},
      {label:"Events",value:Logic.fmt(codex.events),sub:"Resolved choices"},
      {label:"Timeline",value:Logic.fmt(codex.timelineRecords||0),sub:"Historical records"},
      {label:"Dossiers",value:Logic.fmt(Object.keys(codex.dossiers||{}).length),sub:"Studied rival lineages"},
      {label:"Anchors",value:Logic.fmt((codex.timelineAnchors||[]).length),sub:"Pinned history bonuses"},
      {label:"Museum Perks",value:Logic.fmt((codex.museumRewards||[]).length),sub:"Repeat endings completed"},
      {label:"Seen Content",value:Logic.fmt(codex.content),sub:"Archive generation +"+Math.round(codex.archiveBoost*1000)/10+"%"}
    ].forEach(function(row){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
      codexSummary.appendChild(card);
    });
    const codexArch=byId("codex-archetype-list"); codexArch.innerHTML="";
    DATA.ARCHETYPES.forEach(function(arch){
      const revealed=Logic.isArchetypeRevealed(arch.id), wins=(codex.archetypeWins||{})[arch.id]||0;
      const dossier=(codex.dossiers||{})[arch.id]||{};
      const card=document.createElement("div");
      card.className="mini-card";
      if(revealed) applyArchetypeBorder(card,{archetype:arch.id});
      card.innerHTML='<div class="name-row"><span>'+Logic.displayArchetypeName(arch.id)+'</span>'+badge(wins?("Wins "+wins):(revealed?"Known":"Hidden"),wins||revealed?"owned":"locked")+'</div><div class="tiny">'+(revealed?(arch.rarity+" | "+(DATA.VICTORY_VARIANTS[arch.id]||"Galactic Transcendence")):"Discover by evolving into this lineage.")+'</div>'+(dossier.studied?'<div class="effects">Dossier: pressure '+(dossier.studied||0)+' | victories '+(dossier.victories||0)+' | defections '+(dossier.defections||0)+'</div>':'');
      codexArch.appendChild(card);
    });
    Object.entries(codex.stageMastery||{}).forEach(function(entry){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+entry[0]+' Mastery</span>'+badge("Clears "+entry[1],"owned")+'</div><div class="tiny">Repeated clears unlock alternate stage layouts.</div>';
      codexArch.appendChild(card);
    });
    Object.keys(codex.masteryRelics||{}).forEach(function(stageId){
      const relic=(DATA.MASTERY_RELICS||{})[stageId];
      if(!relic) return;
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+relic.name+'</span>'+badge("Mastery Relic","owned")+'</div><div class="tiny">'+relic.desc+'</div><div class="effects">'+effectSourceText(relic)+'</div><div class="tiny">Currently '+(state.game.meta.activeRelics[stageId]===false?"disabled":"active")+'</div>';
      codexArch.appendChild(card);
    });
    Object.entries(DATA.MASTERY_CHALLENGES||{}).forEach(function(entry){
      entry[1].forEach(function(challenge){
        const key=entry[0]+":"+challenge.id, done=!!(codex.masteryChallenges||{})[key], card=document.createElement("div");
        card.className="mini-card";
        card.innerHTML='<div class="name-row"><span>'+(done?challenge.name:"???")+'</span>'+badge(done?"Mastery":"Locked",done?"owned":"locked")+'</div><div class="tiny">'+(done?challenge.desc:("Complete a "+entry[0]+" mastery challenge to reveal this."))+'</div>';
        codexArch.appendChild(card);
      });
    });
    Object.keys(codex.artifactEvolutions||{}).forEach(function(id){
      const evo=(DATA.ARTIFACT_EVOLUTIONS||[]).find(function(item){ return item.id===id; });
      if(!evo) return;
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+evo.name+'</span>'+badge("Artifact Evo","owned")+'</div><div class="tiny">'+evo.desc+'</div><div class="effects">'+effectSourceText(evo)+'</div>';
      codexArch.appendChild(card);
    });
    (DATA.ARCHIVE_MILESTONES||[]).forEach(function(milestone){
      const active=(state.game.meta.seenContent&&Object.keys(state.game.meta.seenContent).length>=milestone.count), card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+milestone.name+'</span>'+badge(active?"Active":milestone.count+" seen",active?"owned":"locked")+'</div><div class="tiny">Archive milestone</div><div class="effects">'+effectSourceText(milestone)+'</div>';
      codexArch.appendChild(card);
    });
    (DATA.TIMELINE_MILESTONES||[]).forEach(function(milestone){
      const active=(codex.timelineRecords||0)>=milestone.count, card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+milestone.name+'</span>'+badge(active?"Active":milestone.count+" records",active?"owned":"locked")+'</div><div class="tiny">'+milestone.desc+'</div><div class="effects">'+effectSourceText(milestone)+'</div>';
      codexArch.appendChild(card);
    });
    (codex.timelineAnchors||[]).forEach(function(anchor){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+anchor.name+'</span>'+badge("Anchor","owned")+'</div><div class="tiny">'+anchor.desc+'</div><div class="effects">'+effectSourceText(anchor)+'</div>';
      codexArch.appendChild(card);
    });
    const codexSpec=byId("codex-specialization-list"); codexSpec.innerHTML="";
    Object.entries(DATA.SPECIALIZATIONS).forEach(function(entry){
      entry[1].forEach(function(spec){
        const key=entry[0]+":"+spec.id, seen=!!state.game.meta.seenSpecializations[key];
        const card=document.createElement("div");
        card.className="mini-card";
        card.innerHTML='<div class="name-row"><span>'+(seen?spec.name:"???")+'</span>'+badge(seen?Logic.archetypeName(entry[0]):"Hidden",seen?"owned":"locked")+'</div><div class="tiny">'+(seen?spec.desc:"Choose this fork in a run to record it.")+'</div>';
        codexSpec.appendChild(card);
      });
    });
    const codexEvents=byId("codex-event-list"); codexEvents.innerHTML="";
    DATA.LINEAGE_EVENTS.forEach(function(event){
      const seenChoices=(event.choices||[]).filter(function(choice){ return !!state.game.meta.seenEvents[event.id+":"+choice.id]; });
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+(seenChoices.length?event.name:"???")+'</span>'+badge(seenChoices.length?Logic.archetypeName(event.archetype):"Hidden",seenChoices.length?"owned":"locked")+'</div><div class="tiny">'+(seenChoices.length?("Choices: "+seenChoices.map(function(choice){ return choice.name; }).join(", ")):"Resolve this event in a run to record it.")+'</div>';
      codexEvents.appendChild(card);
    });
    (codex.victories||[]).forEach(function(victory){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+victory.name+'</span>'+badge(Logic.archetypeName(victory.archetype),"owned")+'</div><div class="tiny">Path: '+(victory.ascensionPath||"None")+' | Specialization: '+(victory.specialization||"None")+' | Objectives: '+((victory.objectives||[]).length)+'</div>';
      codexEvents.appendChild(card);
    });
    (codex.rivalEndings||[]).forEach(function(ending){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+ending.name+'</span>'+badge("Rival Ending","locked")+'</div><div class="tiny">A rival reached victory pressure before transcendence.</div>';
      codexEvents.appendChild(card);
    });
    Object.entries(codex.dossiers||{}).forEach(function(entry){
      const topPath=Object.entries(entry[1].paths||{}).sort(function(a,b){ return b[1]-a[1]; })[0];
      const topEra=Object.entries(entry[1].eras||{}).sort(function(a,b){ return b[1]-a[1]; })[0];
      const tree=Object.entries(entry[1].paths||{}).sort(function(a,b){ return b[1]-a[1]; }).slice(0,3).map(function(path){ return path[0]+" x"+path[1]; }).join(" -> ");
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+Logic.displayArchetypeName(entry[0])+' Dossier</span>'+badge("Dossier","owned")+'</div><div class="tiny">Pressure '+(entry[1].studied||0)+' | victories '+(entry[1].victories||0)+' | defections '+(entry[1].defections||0)+' | collapses '+(entry[1].collapses||0)+'</div><div class="tiny">Most common path: '+(topPath?topPath[0]:"unknown")+' | most common era: '+(topEra?topEra[0]:"unknown")+' | last path '+(entry[1].lastPath||"unknown")+'</div>'+(tree?'<div class="effects">Genealogy: '+tree+'</div>':'');
      codexEvents.appendChild(card);
    });
    Object.keys(codex.evolvedDoctrines||{}).forEach(function(id){
      const evo=(DATA.DOCTRINE_EVOLUTIONS||{})[id];
      if(!evo) return;
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+evo.name+'</span>'+badge("Doctrine Evo","owned")+'</div><div class="tiny">'+evo.desc+'</div><div class="effects">'+effectSourceText(evo)+'</div>';
      codexEvents.appendChild(card);
    });
    Object.keys(codex.congressInstitutions||{}).forEach(function(bloc){
      const level=codex.congressInstitutions[bloc];
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+bloc.charAt(0).toUpperCase()+bloc.slice(1)+' Institution</span>'+badge("Lv "+level,"owned")+'</div><div class="tiny">Built by carrying a bloc through multiple congress seasons.</div>';
      codexEvents.appendChild(card);
    });
    (codex.institutionTraits||[]).forEach(function(trait){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+trait.name+'</span>'+badge("Institution Trait","owned")+'</div><div class="tiny">'+trait.desc+'</div><div class="effects">'+effectSourceText(trait)+'</div>';
      codexEvents.appendChild(card);
    });
    Object.keys(codex.wornArtifacts||{}).forEach(function(id){
      const artifact=(DATA.ARTIFACTS||[]).find(function(item){ return item.id===id; });
      if(!artifact) return;
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+artifact.name+'</span>'+badge("Worn","locked")+'</div><div class="tiny">A harsh-universe relic waiting for recovery.</div>';
      codexEvents.appendChild(card);
    });
    Object.keys(codex.restoredArtifacts||{}).forEach(function(id){
      const artifact=(DATA.ARTIFACTS||[]).find(function(item){ return item.id===id; });
      const branch=(DATA.ARTIFACT_RESTORATION_BRANCHES||[]).find(function(item){ return item.id===codex.restoredArtifacts[id]; });
      if(!artifact || !branch) return;
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+artifact.name+'</span>'+badge("Restored","owned")+'</div><div class="tiny">'+branch.name+' | '+branch.desc+'</div><div class="effects">'+effectSourceText(branch)+'</div>';
      codexEvents.appendChild(card);
    });

    const archetypeList=byId("archetype-list"); archetypeList.innerHTML="";
    drawArchetypeRadar();
    const dominant=Logic.dominantArchetype(), dominantCard=document.createElement("div");
    dominantCard.className="mini-card";
    applyArchetypeBorder(dominantCard,{archetype:dominant});
    const dominantDetail=Logic.isArchetypeRevealed(dominant)?((Logic.archetypeDef(dominant)||{}).rarity||"basic"):"Evolve to identify this lineage";
    dominantCard.innerHTML='<div class="name-row"><span>'+Logic.dominantArchetypeLabel()+'</span>'+badge("Dominant","owned")+'</div><div class="tiny">'+dominantDetail+'</div>';
    archetypeList.appendChild(dominantCard);
    const scores=Logic.archetypeScores();
    DATA.ARCHETYPES.filter(function(arch){ return (scores[arch.id]||0)>0; }).sort(function(a,b){ return (scores[b.id]||0)-(scores[a.id]||0); }).slice(0,5).forEach(function(arch){
      const card=document.createElement("div");
      card.className="mini-card";
      applyArchetypeBorder(card,{archetype:arch.id});
      card.innerHTML='<div class="name-row"><span>'+Logic.displayArchetypeName(arch.id)+'</span>'+badge(Logic.fmt(scores[arch.id]),"available")+'</div><div class="tiny">Affinity weight</div>';
      archetypeList.appendChild(card);
    });

    const traitList=byId("trait-list"); traitList.innerHTML="";
    const traits=Logic.inheritedTraits();
    if(!traits.length) traitList.appendChild(emptyState("No inherited traits yet."));
    else traits.forEach(function(trait){ const card=document.createElement("div"); card.className="mini-card"; card.textContent=trait; traitList.appendChild(card); });
    
    const log=byId("log"); log.innerHTML="";
    [...state.game.run.log].reverse().slice(0,60).forEach(function(line){ const entry=document.createElement("div"); entry.className="log-entry"; entry.textContent=line; log.appendChild(entry); });
    if(!log.children.length) log.appendChild(emptyState("No log entries."));

    byId("between-runs-panel").classList.toggle("hidden",!state.ui.betweenRuns);
    const reviewList=byId("run-review-list"); reviewList.innerHTML="";
    const review=state.game.meta.lastRunReview;
    if(!review) reviewList.appendChild(emptyState("No completed run review yet."));
    else {
      [
        {label:review.kind||"Run",value:review.victoryName||review.stage,sub:"Score "+Logic.fmt(review.score)+" / "+Logic.fmt(review.target)+" | EP +"+Logic.fmt(review.epAward)},
        {label:"Lineage",value:Logic.displayArchetypeName(review.archetype),sub:"Path "+(review.ascensionPath||"none")+" | Spec "+(review.specialization||"none")},
        {label:"Pacing",value:Logic.fmt(review.time)+"s",sub:"Population "+Logic.fmt(review.population)+" | Legacy "+(review.legacyTier||"standard")},
        {label:"Rivals",value:review.rivalWins+" pressure",sub:review.rivalsBeaten+" held back"},
        {label:"Map",value:review.wonders+" wonders",sub:"Congress "+(review.congress||"none")},
        {label:"Alerts",value:(review.alerts||[]).length,sub:(review.alerts||[]).slice(0,3).join(", ")||"No major warnings"},
        {label:"Mastery",value:Object.keys((review.stageMastery||{})).length,sub:"Stage mastery tracks advanced"}
      ].forEach(function(row){
        const card=document.createElement("div");
        card.className="summary-box";
        card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
        reviewList.appendChild(card);
      });
      const systems=document.createElement("div");
      systems.className="summary-box";
      systems.innerHTML='<div class="label">Top Systems</div><div class="tiny">'+((review.topSystems||[]).join(", ")||"No systems recorded")+'</div>';
      reviewList.appendChild(systems);
      const resources=document.createElement("div");
      resources.className="summary-box";
      resources.innerHTML='<div class="label">Best Nets</div><div class="tiny">'+((review.topResources||[]).map(function(row){ return Logic.resourceName(row.id)+" "+(row.net>=0?"+":"")+Logic.fmt(row.net)+"/s"; }).join(", ")||"No resource trend recorded")+'</div>';
      reviewList.appendChild(resources);
      const medals=document.createElement("div");
      medals.className="summary-box";
      medals.innerHTML='<div class="label">Run Medals</div><div class="tiny">'+((review.medals||[]).map(function(id){ const medal=(DATA.RUN_MEDALS||[]).find(function(item){ return item.id===id; }); return medal?medal.name:id; }).join(", ")||"No medals earned")+'</div>';
      reviewList.appendChild(medals);
      if((review.rivalEndings||[]).length){
        const endings=document.createElement("div");
        endings.className="summary-box";
        endings.innerHTML='<div class="label">Rival Endings</div><div class="tiny">'+review.rivalEndings.map(function(item){ return item.name; }).join(", ")+'</div>';
        reviewList.appendChild(endings);
      }
    }
    byId("evo-value").textContent=Logic.fmt(state.game.meta.evolutionPoints)+" EP";
    byId("evo-detail").textContent="Galactic wins "+Logic.fmt(state.game.meta.galacticWins)+" | Rebirths speed future runs up";
    byId("evo-fill").style.width=Math.min(100,state.game.meta.evolutionPoints%100)+"%";
    const reviewBlock=reviewList.closest(".compact-details");
    const legacyBlock=byId("legacy-tier-list").closest(".compact-details");
    const cosmeticBlock=byId("cosmetic-theme-list").closest(".compact-details");
    const evoCard=byId("evo-value").closest(".mini-card");
    const prestigeList=byId("prestige-list"); prestigeList.innerHTML="";
    const legacyList=byId("legacy-tier-list"); legacyList.innerHTML="";
    (DATA.LEGACY_TIERS||[]).forEach(function(tier){
      const unlocked=world.legacyTiers.some(function(item){ return item.id===tier.id; }), picked=state.game.meta.legacyTier===tier.id, card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+tier.name+'</span>'+badge(picked?"Selected":(unlocked?"Unlocked":tier.wins+" wins"),picked?"owned":(unlocked?"available":"locked"))+'</div><div class="tiny">'+tier.desc+'</div><div class="effects">EP x'+tier.epMult+(effectSourceText(tier)?' | '+effectSourceText(tier):'')+'</div>';
      card.appendChild(cardButton(picked?"Selected":"Select",picked||!unlocked,unlocked?"Use this legacy universe for future victories.":"Requires "+tier.wins+" Galactic wins.",function(){ if(Logic.chooseLegacyTier(tier.id)) UI.render(); }));
      legacyList.appendChild(card);
    });
    const cosmeticList=byId("cosmetic-theme-list"); cosmeticList.innerHTML="";
    const availableThemes=world.cosmeticThemes||[];
    const clearCard=document.createElement("div");
    clearCard.className="buy-card";
    clearCard.innerHTML='<div class="name-row"><span>Default Banner</span>'+badge(world.activeCosmeticTheme?"Available":"Selected",world.activeCosmeticTheme?"available":"owned")+'</div><div class="tiny">Use the standard Evolution Shop presentation.</div>';
    clearCard.appendChild(cardButton(world.activeCosmeticTheme?"Select":"Selected",!world.activeCosmeticTheme,"Use the default banner.",function(){ if(Logic.chooseCosmeticTheme("")) UI.render(); }));
    cosmeticList.appendChild(clearCard);
    (DATA.COSMETIC_THEMES||[]).forEach(function(theme){
      const unlocked=availableThemes.some(function(item){ return item.id===theme.id; }), picked=world.activeCosmeticTheme===theme.id, card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+theme.name+'</span>'+badge(picked?"Selected":(unlocked?"Unlocked":theme.wins+" wins"),picked?"owned":(unlocked?"available":"locked"))+'</div><div class="tiny">'+theme.desc+'</div>';
      card.appendChild(cardButton(picked?"Selected":"Select",picked||!unlocked,unlocked?"Use this run banner.":"Earn repeat victories with this archetype.",function(){ if(Logic.chooseCosmeticTheme(theme.id)) UI.render(); }));
      cosmeticList.appendChild(card);
    });
    const upgradeGroups={
      automation:["auto_organelles","auto_generators"],
      bonuses:["manual","auto","cost","start"],
      meta:["rival_scan","counterintel","archive_pinning","era_control","hybridization"]
    };
    [["Automation",upgradeGroups.automation],["Bonuses",upgradeGroups.bonuses],["Meta",upgradeGroups.meta]].forEach(function(group){
      const head=document.createElement("div");
      head.className="mini-card";
      head.innerHTML='<div class="name-row"><span>'+group[0]+'</span>'+badge("Section","owned")+'</div><div class="tiny">Evolution Shop upgrades</div>';
      prestigeList.appendChild(head);
      DATA.SHOP_UPGRADES.filter(function(upgrade){ return group[1].includes(upgrade.id); }).forEach(function(upgrade){
      const minWins=upgrade.minWins||1, level=state.game.meta.upgrades[upgrade.id]||0, cost=upgrade.base+level*upgrade.base, winLocked=upgrade.requiresWin&&state.game.meta.galacticWins<minWins&&!state.ui.debug, canBuy=!winLocked&&((state.game.meta.evolutionPoints>=cost)||state.ui.debug);
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+upgrade.name+'</span>'+badge(winLocked?"Post-win":(level>=upgrade.max?"Max":"Lv "+level), winLocked?"locked":(level>=upgrade.max?"owned":"available"))+'</div><div class="tiny">'+upgrade.desc(level)+'</div><div class="cost">Cost: '+cost+' EP</div>';
      card.appendChild(cardButton(level>=upgrade.max?"Maxed":"Buy",level>=upgrade.max||!canBuy,winLocked?"Requires "+minWins+" Galactic wins.":(canBuy?"Buy this permanent upgrade.":"Not enough Evolution Points."),function(){ if(Logic.buyUpgrade(upgrade.id)) UI.render(); }));
      prestigeList.appendChild(card);
      });
    });

    if(reviewBlock) reviewBlock.classList.toggle("hidden",state.ui.betweenRunsStep!=="review");
    if(evoCard) evoCard.classList.toggle("hidden",state.ui.betweenRunsStep==="review");
    prestigeList.classList.toggle("hidden",state.ui.betweenRunsStep!=="shop");
    if(legacyBlock) legacyBlock.classList.toggle("hidden",state.ui.betweenRunsStep==="review");
    if(cosmeticBlock) cosmeticBlock.classList.toggle("hidden",state.ui.betweenRunsStep==="review");
    byId("shop-close-btn").textContent=state.ui.betweenRunsStep==="review"?"Open Shop":(state.ui.betweenRunsStep==="shop"?"Choose Run Setup":"Seed Life");

    byId("debug-tab-btn").classList.toggle("hidden",!state.ui.debug);
    byId("auto-tab-btn").classList.toggle("hidden",!Logic.hasAutomationControls());
    byId("lineage-tab-btn").classList.toggle("hidden",!Logic.hasLockedLineage());
    if(!Logic.hasAutomationControls() && state.ui.tab==="auto-control") state.ui.tab="actions";
    if(!Logic.hasLockedLineage() && state.ui.tab==="lineage") state.ui.tab="actions";
    if(!state.ui.debug && state.ui.tab==="debug") state.ui.tab="actions";
    const summaryList=byId("summary-list"); summaryList.innerHTML="";
    ["Stage: "+Logic.currentStage().name,"Population: "+Logic.fmt(state.game.run.population),"Stage score: "+Logic.fmt(Logic.currentScore())+"/"+Logic.fmt(Logic.currentStage().scoreTarget),"Production sources: "+Logic.automationSummary().sources.length,"Owned systems: "+Logic.ownedSystemsForStage().length,"Owned techs: "+Logic.ownedTechForStage().length].forEach(function(line){ const card=document.createElement("div"); card.className="mini-card"; card.textContent=line; summaryList.appendChild(card); });

    document.querySelectorAll(".tab").forEach(function(btn){ btn.classList.toggle("active",btn.dataset.tab===state.ui.tab); });
    const stageSystems=stage.systems||[], stageTechs=stage.technologies||[];
    const buyableSystems=stageSystems.some(function(item){ return Logic.contentVisible(item,state.ui.showLockedContent) && (!state.game.run.ownedSystems[item.id] || Logic.repeatableSystem(item)) && !Logic.lockReasonForSystem(item); });
    const buyableTechs=stageTechs.some(function(item){ return !state.game.run.technologies[item.id] && Logic.contentVisible(item,state.ui.showLockedContent) && !Logic.lockReasonForTech(item); });
    const lineageReady=unresolvedLineageEvents.length || (!((state.game.run.lineageLaws||{})[stage.id]) && availableLaws.length);
    const worldReady=Object.keys(world.worldEvents||{}).some(function(id){ return !world.worldEventChoices[id]; }) || (world.vassalDemands||[]).length || (world.rivalDefections||[]).length || !!world.pendingProject || !!world.congressCrisis && !world.congressCrisisChoice || !!world.institutionCrisis && !world.institutionCrisisChoice || (world.artifactEvolutions||[]).length;
    const unseenSystems=stageSystems.some(function(item){ return Logic.contentVisible(item,true) && !state.game.meta.seenContent["system:"+item.id]; });
    const unseenTechs=stageTechs.some(function(item){ return Logic.contentVisible(item,true) && !state.game.meta.seenContent["tech:"+item.id]; });
    document.querySelectorAll(".tab[data-tab='systems'], .tab[data-tab='tech'], .tab[data-tab='lineage'], .tab[data-tab='world']").forEach(function(btn){
      btn.classList.remove("tab-ready","tab-new");
      if(btn.dataset.tab==="systems" && buyableSystems) btn.classList.add("tab-ready");
      if(btn.dataset.tab==="tech" && buyableTechs) btn.classList.add("tab-ready");
      if(btn.dataset.tab==="lineage" && lineageReady) btn.classList.add("tab-ready");
      if(btn.dataset.tab==="world" && worldReady) btn.classList.add("tab-ready");
      if(btn.dataset.tab==="systems" && unseenSystems) btn.classList.add("tab-new");
      if(btn.dataset.tab==="tech" && unseenTechs) btn.classList.add("tab-new");
    });
    document.querySelectorAll(".tab-panel").forEach(function(panel){ panel.classList.toggle("active",panel.id===("tab-"+state.ui.tab)); });

    byId("options-panel").classList.toggle("hidden",!state.ui.optionsOpen);
    byId("debug-toggle").checked=!!state.ui.debug;
    byId("compact-toggle").checked=!!state.ui.compact;
    byId("pause-btn").textContent=state.running?"Pause":"Resume";
    byId("speed-btn").textContent="Speed x"+DATA.SPEEDS[state.speedIndex];
    byId("rebirth-btn").disabled=!Logic.canRebirth();
    byId("rebirth-btn").textContent=Logic.canRebirth()?("Rebirth +"+Logic.rebirthGain()+" EP"):("Rebirth Needs "+Logic.rebirthScoreTarget()+" Score");
  };

  window.EvolutionUI=UI;
})();
