(function(){
  const DATA = window.EvolutionData;
  const M = {};

  M.state = {
    running:true,
    speedIndex:0,
    ui:{
      tab:"actions",
      systemsCategory:"",
      automationCategory:"",
      techCategory:"",
      debug:false,
      compact:false,
      optionsOpen:false,
      betweenRuns:false,
      betweenRunsStep:"review",
      previewAffinity:null,
      inputActive:false,
      focusOverlayMinimized:false,
      focusCategory:"all",
      showLockedContent:false,
      archiveFilter:"all",
      archiveSearch:""
    },
    game:null
  };

  M.emptyResources = function(){
    return Object.fromEntries(DATA.RESOURCES.map(function(item){ return [item.id,0]; }));
  };

  M.emptyCapacities = function(){
    const caps={};
    DATA.RESOURCES.forEach(function(item){ caps[item.id]=25; });
    caps.atp=30;
    caps.happiness=100;
    return caps;
  };

  M.createMeta = function(){
    return {
      evolutionPoints:0,
      galacticWins:0,
      upgrades:Object.fromEntries(DATA.SHOP_UPGRADES.map(function(up){ return [up.id,0]; })),
      autoOrganelleTarget:"humanoid",
      automationSettings:{organellesEnabled:true,infrastructureEnabled:true},
      revealedArchetypes:{},
      unlockedRareArchetypes:{ lithoid:false, necroid:false, toxoid:false, extremophile:false },
      archetypeWins:{},
      seenSpecializations:{},
      seenEvents:{},
      seenContent:{},
      completedContracts:{},
      threatScars:{},
      completedProjects:{},
      transformedScars:{},
      museumRewards:{},
      legacyTier:"standard",
      eraLegacies:{},
      vassals:{},
      cosmeticTheme:"",
      lastRunReview:null,
      rivalEndings:[],
      lineageChronicles:[],
      lastMilestoneWins:0,
      victoryLog:[],
      artifacts:{},
      artifactEvolutions:{},
      rivalDossiers:{},
      stageMastery:{},
      stageLayouts:{},
      completedMasteryChallenges:{},
      archiveFavorites:{},
      evolvedDoctrines:{},
      masteryRelics:{},
      congressSeasons:{},
      wornArtifacts:{},
      restoredArtifacts:{},
      restorationHistory:{},
      activeRelics:{},
      congressInstitutionLevels:{},
      templates:{},
      mapPresets:{}
    };
  };

  M.createRun = function(meta){
    const resources=M.emptyResources();
    const capacities=M.emptyCapacities();
    const warmStart=(meta.upgrades.start||0)*5;
    resources.atp=5+warmStart;
    resources.happiness=75;
    return {
      stageIndex:0,
      time:0,
      population:8,
      resources:resources,
      capacities:capacities,
      ownedSystems:{},
      automation:{},
      technologies:{},
      archive:[],
      lockedArchetype:null,
      secondaryArchetype:null,
      specialization:null,
      lineageEvents:{},
      claimedGoals:{},
      mapSlots:{},
      expandedSlots:{},
      mutatorDrafts:{},
      activeMutators:{},
      lineageLaws:{},
      worldEvents:{},
      worldEventChoices:{},
      congressChoice:"",
      mapWonders:{},
      mapWonderLevels:{},
      wonderMaintenanceTimer:0,
      rivalDefections:{},
      vassalDemands:{},
      specialProject:null,
      pendingProjectChoice:null,
      ascensionPath:"",
      doctrine:"",
      eraModifiers:{},
      eraRerolls:0,
      rivals:null,
      rivalEvents:{},
      threatProjects:{},
      activeContract:"",
      automationPolicy:"balanced",
      resourceFailures:{},
      log:["New run started."],
      strategic:{},
      luxury:{},
      autoTimers:{organelles:0,infrastructure:0,generators:0}
    };
  };

  M.createGame = function(){
    const meta=M.createMeta();
    return { meta:meta, run:M.createRun(meta) };
  };

  M.saveGame = function(){
    localStorage.setItem(DATA.STORAGE_KEY, JSON.stringify(M.state.game));
  };

  function migrateMeta(meta){
    if(!meta.upgrades) meta.upgrades=Object.fromEntries(DATA.SHOP_UPGRADES.map(function(up){ return [up.id,0]; }));
    DATA.SHOP_UPGRADES.forEach(function(up){ if(meta.upgrades[up.id]==null) meta.upgrades[up.id]=0; });
    if(!meta.autoOrganelleTarget) meta.autoOrganelleTarget="humanoid";
    if(!meta.automationSettings) meta.automationSettings={organellesEnabled:true,infrastructureEnabled:true};
    if(meta.automationSettings.organellesEnabled==null) meta.automationSettings.organellesEnabled=true;
    if(meta.automationSettings.infrastructureEnabled==null) meta.automationSettings.infrastructureEnabled=true;
    if(!meta.revealedArchetypes) meta.revealedArchetypes={};
    if(!meta.unlockedRareArchetypes) meta.unlockedRareArchetypes={ lithoid:false, necroid:false, toxoid:false, extremophile:false };
    if(!meta.archetypeWins) meta.archetypeWins={};
    if(!meta.seenSpecializations) meta.seenSpecializations={};
    if(!meta.seenEvents) meta.seenEvents={};
    if(!meta.seenContent) meta.seenContent={};
    if(!meta.completedContracts) meta.completedContracts={};
    if(!meta.threatScars) meta.threatScars={};
    if(!meta.completedProjects) meta.completedProjects={};
    if(!meta.transformedScars) meta.transformedScars={};
    if(!meta.museumRewards) meta.museumRewards={};
    if(!meta.legacyTier) meta.legacyTier="standard";
    if(!meta.eraLegacies) meta.eraLegacies={};
    if(!meta.vassals) meta.vassals={};
    if(!meta.cosmeticTheme) meta.cosmeticTheme="";
    if(!meta.lastRunReview) meta.lastRunReview=null;
    if(!meta.rivalEndings) meta.rivalEndings=[];
    if(!meta.lineageChronicles) meta.lineageChronicles=[];
    if(meta.lastMilestoneWins==null) meta.lastMilestoneWins=0;
    if(!meta.victoryLog) meta.victoryLog=[];
    if(!meta.artifacts) meta.artifacts={};
      if(!meta.artifactEvolutions) meta.artifactEvolutions={};
      if(!meta.rivalDossiers) meta.rivalDossiers={};
      if(!meta.stageMastery) meta.stageMastery={};
      if(!meta.stageLayouts) meta.stageLayouts={};
    if(!meta.completedMasteryChallenges) meta.completedMasteryChallenges={};
    if(!meta.archiveFavorites) meta.archiveFavorites={};
    if(!meta.evolvedDoctrines) meta.evolvedDoctrines={};
    if(!meta.masteryRelics) meta.masteryRelics={};
    if(!meta.congressSeasons) meta.congressSeasons={};
    if(!meta.wornArtifacts) meta.wornArtifacts={};
    if(!meta.restoredArtifacts) meta.restoredArtifacts={};
    if(!meta.restorationHistory) meta.restorationHistory={};
    if(!meta.activeRelics) meta.activeRelics={};
    if(!meta.congressInstitutionLevels) meta.congressInstitutionLevels={};
    if(!meta.templates) meta.templates={};
    if(!meta.mapPresets) meta.mapPresets={};
  }

  function migrateRun(run){
    if(run.stageIndex>=DATA.STAGES.length) run.stageIndex=0;
    if(!run.resources) run.resources=M.emptyResources();
    if(!run.capacities) run.capacities=M.emptyCapacities();
    Object.keys(M.emptyResources()).forEach(function(key){ if(run.resources[key]==null) run.resources[key]=0; });
    Object.entries(M.emptyCapacities()).forEach(function(entry){ if(run.capacities[entry[0]]==null) run.capacities[entry[0]]=entry[1]; });
    if(!run.ownedSystems) run.ownedSystems={};
    if(!run.automation) run.automation={};
    if(!run.technologies) run.technologies={};
    if(!run.archive) run.archive=[];
    if(!run.strategic) run.strategic={};
    if(!run.luxury) run.luxury={};
    if(!run.lineageEvents) run.lineageEvents={};
    if(!run.claimedGoals) run.claimedGoals={};
    if(!run.mapSlots) run.mapSlots={};
    if(!run.expandedSlots) run.expandedSlots={};
    if(!run.mutatorDrafts) run.mutatorDrafts={};
    if(!run.activeMutators) run.activeMutators={};
    if(!run.lineageLaws) run.lineageLaws={};
    if(!run.worldEvents) run.worldEvents={};
    if(!run.worldEventChoices) run.worldEventChoices={};
    if(!run.congressChoice) run.congressChoice="";
    if(!run.mapWonders) run.mapWonders={};
    if(!run.mapWonderLevels) run.mapWonderLevels={};
    if(run.wonderMaintenanceTimer==null) run.wonderMaintenanceTimer=0;
    if(!run.rivalDefections) run.rivalDefections={};
    if(!run.vassalDemands) run.vassalDemands={};
    if(!run.specialProject) run.specialProject=null;
    if(!run.pendingProjectChoice) run.pendingProjectChoice=null;
    if(run.ascensionPath==null) run.ascensionPath="";
    if(!run.doctrine) run.doctrine="";
    if(!run.eraModifiers) run.eraModifiers={};
    if(run.eraRerolls==null) run.eraRerolls=0;
    if(!run.rivalEvents) run.rivalEvents={};
    if(!run.threatProjects) run.threatProjects={};
    if(run.activeContract==null) run.activeContract="";
    if(!run.automationPolicy) run.automationPolicy="balanced";
    if(!run.resourceFailures) run.resourceFailures={};
    if(run.secondaryArchetype==null) run.secondaryArchetype=null;
    if(!run.autoTimers) run.autoTimers={organelles:0,infrastructure:0,generators:0};
    if(run.autoTimers.infrastructure==null) run.autoTimers.infrastructure=run.autoTimers.generators||0;
    if(run.lockedArchetype==null){
      const creatureArchive=run.archive.find(function(entry){ return entry.stageId==="creature"&&entry.archetype; });
      run.lockedArchetype=creatureArchive?creatureArchive.archetype:null;
    }
  }

  M.loadGame = function(){
    try{
      const raw=localStorage.getItem(DATA.STORAGE_KEY);
      M.state.game=raw?JSON.parse(raw):M.createGame();
      if(!M.state.game||!M.state.game.meta||!M.state.game.run) M.state.game=M.createGame();
      migrateMeta(M.state.game.meta);
      migrateRun(M.state.game.run);
      M.state.game.run.archive.forEach(function(entry){
        if(entry.archetype) M.state.game.meta.revealedArchetypes[entry.archetype]=true;
      });
    }catch(e){
      M.state.game=M.createGame();
    }
  };

  M.hardReset = function(){
    localStorage.removeItem(DATA.STORAGE_KEY);
    M.state.game=M.createGame();
    M.state.ui.tab="actions";
    M.state.ui.betweenRuns=false;
    M.state.ui.betweenRunsStep="review";

    UI.render();
  };

  window.EvolutionState = M;
})();
