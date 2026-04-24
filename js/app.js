
const STORAGE_KEY="evolution_idle_v51";
const SPEEDS=[1,2,4,8];
const fmt=new Intl.NumberFormat("en-US",{maximumFractionDigits:1});

const RESOURCES=[["glucose","Glucose"],["proteins","Proteins"],["lipids","Lipids"],["elements","Elements"],["evolution","Evolution"],["food","Food"],["material","Material"],["knowledge","Knowledge"],["culture","Culture"],["faith","Faith"],["influence","Influence"],["energy","Energy"]];
const ARCHETYPES=[["terrestrial","Terrestrial"],["aquatic","Aquatic"],["amphibious","Amphibious"],["fungal","Fungal"],["arboreal","Arboreal"],["subterranean","Subterranean"],["aerial","Aerial"]];
const PATHS=[["balanced","Balanced"],["economic","Economic"],["scientific","Scientific"],["cultural","Cultural"],["spiritual","Spiritual"],["expansionist","Expansionist"],["survivalist","Survivalist"]];
const PRESTIGE=[
  {id:"manual",name:"Quickened Hands",base:3,max:20,desc:l=>`Manual gain +${l*20}%`},
  {id:"auto",name:"Inherited Efficiency",base:4,max:20,desc:l=>`Automation gain +${l*15}%`},
  {id:"cost",name:"Frugality",base:5,max:15,desc:l=>`Costs -${l*4}%`},
  {id:"carry",name:"Species Memory",base:6,max:15,desc:l=>`Carryover +${l*6}%`},
  {id:"start",name:"Warm Start",base:7,max:10,desc:l=>`Start resources +${l*5}`},
];
const STAGES=[{"id":"cell","name":"Cell Stage","scope":"Single-cell survival","theme":"Gather molecules, build organelles, and specialize before the first Evolve.","scoreTarget":150,"actions":[{"id":"glucose","label":"Absorb Glucose","gain":{"glucose":1.5,"evolution":0.2}},{"id":"proteins","label":"Scavenge Proteins","gain":{"proteins":1.2,"evolution":0.12}},{"id":"lipids","label":"Collect Lipids","gain":{"lipids":1.1,"evolution":0.1}},{"id":"elements","label":"Extract Elements","gain":{"elements":1.0,"evolution":0.08}}],"automation":[{"id":"pump","name":"Membrane Pump","cost":{"glucose":8,"elements":4},"effects":{"glucose":0.75}},{"id":"ribosome","name":"Ribosome Cluster","cost":{"glucose":10,"proteins":6},"effects":{"proteins":0.65,"evolution":0.12}},{"id":"mitochondria","name":"Mitochondria Line","cost":{"glucose":18,"lipids":8,"elements":6},"effects":{"glucose":0.9,"evolution":0.28}}],"resources":["glucose","proteins","lipids","elements","evolution"]},{"id":"creature","name":"Creature Stage","scope":"Organism survival","theme":"Evolve a body plan, stabilize food, and turn biology into a species loop.","scoreTarget":420,"actions":[{"id":"forage","label":"Forage Food","gain":{"food":2.2,"evolution":0.08}},{"id":"survey","label":"Survey Habitat","gain":{"knowledge":1.1}},{"id":"nest","label":"Improve Nest","gain":{"culture":0.8}}],"automation":[{"id":"pack","name":"Foraging Pack","cost":{"food":20,"knowledge":6},"effects":{"food":1.4}},{"id":"senses","name":"Sensory Organs","cost":{"food":14,"knowledge":14},"effects":{"knowledge":1.0}},{"id":"nesting","name":"Nesting Ground","cost":{"food":18,"material":12},"effects":{"culture":0.6,"food":0.6}}],"resources":["food","knowledge","culture","material","evolution"]},{"id":"tribal","name":"Tribal Stage","scope":"Early society","theme":"Choose leaders, tech, units, and luxuries while stabilizing the tribe.","scoreTarget":900,"actions":[{"id":"hunt","label":"Organize Hunt","gain":{"food":4}},{"id":"gather","label":"Gather Material","gain":{"material":3}},{"id":"council","label":"Call Council","gain":{"influence":2}}],"automation":[{"id":"hut","name":"Gathering Hut","cost":{"material":24},"effects":{"food":2.0}},{"id":"workshop","name":"Workshop","cost":{"material":30,"food":10},"effects":{"material":1.8,"knowledge":0.5}},{"id":"tradition","name":"Oral Tradition","cost":{"food":25,"knowledge":10},"effects":{"culture":1.0,"influence":0.7}}],"resources":["food","material","knowledge","culture","faith","influence","happiness"]},{"id":"civilization","name":"Civilization Stage","scope":"City-state growth","theme":"Civics, religion, tech, and urban automation define the state.","scoreTarget":1800,"actions":[{"id":"tax","label":"Tax Trade","gain":{"material":5}},{"id":"research","label":"Direct Research","gain":{"knowledge":3}},{"id":"festival","label":"Host Festival","gain":{"culture":2,"influence":1}}],"automation":[{"id":"farm","name":"Farm","cost":{"material":40},"effects":{"food":3.0}},{"id":"library","name":"Library","cost":{"material":50,"culture":15},"effects":{"knowledge":2.2}},{"id":"market","name":"Market","cost":{"material":56},"effects":{"material":2.1,"influence":1.1}},{"id":"shrine","name":"Shrine","cost":{"material":38,"faith":10},"effects":{"faith":1.8,"culture":0.9}}],"resources":["food","material","knowledge","culture","faith","influence","happiness"]},{"id":"empire","name":"Empire Stage","scope":"Regional power","theme":"Doctrines, edicts, tech, units, and luxuries now shape imperial stability.","scoreTarget":3400,"actions":[{"id":"edict","label":"Issue Edict","gain":{"influence":6}},{"id":"survey_region","label":"Survey Region","gain":{"knowledge":5,"material":4}},{"id":"bonds","label":"Issue Bonds","gain":{"material":8,"influence":2}}],"automation":[{"id":"rail","name":"Rail Hub","cost":{"material":110},"effects":{"material":3.2,"influence":1.5}},{"id":"university","name":"University","cost":{"material":120,"culture":30},"effects":{"knowledge":4.0,"culture":1.0}},{"id":"plant","name":"Power Plant","cost":{"material":150},"effects":{"energy":3.0}},{"id":"factory","name":"Factory Complex","cost":{"material":220,"energy":60},"effects":{"material":6.2,"influence":1.2}}],"resources":["material","knowledge","culture","faith","influence","energy","happiness"]},{"id":"solar","name":"Solar Stage","scope":"System-scale colonies","theme":"Policies, tech, megastructures, units, luxuries, and FTL define the next leap.","scoreTarget":7000,"actions":[{"id":"probe","label":"Launch Probe","gain":{"knowledge":8}},{"id":"fund_colony","label":"Fund Colony","gain":{"influence":5,"material":5}},{"id":"route","label":"Route Cargo","gain":{"energy":5,"material":3}}],"automation":[{"id":"array","name":"Orbital Solar Array","cost":{"material":260,"knowledge":100},"effects":{"energy":8.0}},{"id":"habitat","name":"Colony Habitat","cost":{"material":320,"energy":120},"effects":{"food":5.0,"influence":2.0}},{"id":"station","name":"Research Station","cost":{"material":280,"energy":90},"effects":{"knowledge":7.0}},{"id":"dockyard","name":"Shipyard Ring","cost":{"material":420,"energy":200},"effects":{"material":7.5,"influence":3.0}}],"resources":["food","material","knowledge","culture","influence","energy","happiness"]},{"id":"galactic","name":"Galactic Stage","scope":"Interstellar civilization","theme":"Form alignments, build megastructures, choose a victory path, and win the run.","scoreTarget":14000,"actions":[{"id":"treaty","label":"Negotiate Treaty","gain":{"influence":10}},{"id":"archive","label":"Archive Knowledge","gain":{"knowledge":12}},{"id":"broadcast","label":"Broadcast Culture","gain":{"culture":10}}],"automation":[{"id":"dyson","name":"Dyson Swarm","cost":{"material":1200,"energy":800,"knowledge":400},"effects":{"energy":20.0}},{"id":"archive_core","name":"Galactic Archive","cost":{"material":900,"knowledge":600},"effects":{"knowledge":15.0,"culture":4.0}},{"id":"nexus","name":"Transit Nexus","cost":{"material":1000,"energy":300},"effects":{"material":10.0,"influence":3.0}},{"id":"beacon","name":"Cultural Beacon","cost":{"culture":420,"influence":180},"effects":{"culture":12.0,"faith":3.0}}],"resources":["material","knowledge","culture","faith","influence","energy","evolution","happiness"]}];
const STAGE_CONTENT={"cell":[{"id":"ribosomes","name":"Ribosomes","stage":"cell","category":"organelle","description":"Protein synthesis backbone for almost every viable cell plan.","cost":{"evolution":6,"glucose":3,"proteins":4,"lipids":1,"elements":1},"bonus":{"manual":0.020000000000000004,"auto":0.020000000000000004,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0075,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0.5,"lipids":0,"elements":0,"evolution":0.08,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"terrestrial":1,"fungal":1},"traits":[],"exclusive":[],"prereq":""},{"id":"mitochondria","name":"Mitochondria","stage":"cell","category":"organelle","description":"High-output ATP conversion for active and mobile cell builds.","cost":{"evolution":8,"glucose":6,"proteins":3,"lipids":2,"elements":1},"bonus":{"manual":0.06,"auto":0.06,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0225,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.375,"proteins":0,"lipids":0,"elements":0,"evolution":0.1,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"terrestrial":2,"amphibious":1},"traits":[],"exclusive":[],"prereq":""},{"id":"nucleus","name":"Nucleus","stage":"cell","category":"organelle","description":"Central regulation core required for the most advanced cell plans.","cost":{"evolution":14,"glucose":8,"proteins":7,"lipids":5,"elements":4},"bonus":{"manual":0.04000000000000001,"auto":0.04000000000000001,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.015,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.35,"food":0,"material":0,"knowledge":0.2,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"terrestrial":1,"fungal":1,"arboreal":1},"traits":[],"exclusive":[],"prereq":""},{"id":"nucleolus","name":"Nucleolus","stage":"cell","category":"organelle","description":"Amplifies organized protein assembly inside a mature nucleus.","cost":{"evolution":10,"glucose":5,"proteins":6,"lipids":3,"elements":2},"bonus":{"manual":0.032,"auto":0.032,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.012,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0.45,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0.2,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"terrestrial":1,"fungal":1,"aerial":1},"traits":[],"exclusive":[],"prereq":""},{"id":"rough_er","name":"Rough ER","stage":"cell","category":"organelle","description":"Industrial protein-folding network that rewards organized interiors.","cost":{"evolution":9,"glucose":4,"proteins":5,"lipids":2,"elements":2},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0.4,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0.12,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"terrestrial":1,"fungal":1},"traits":[],"exclusive":[],"prereq":""},{"id":"smooth_er","name":"Smooth ER","stage":"cell","category":"organelle","description":"Lipid-processing interior that improves membrane stability and detox.","cost":{"evolution":10,"glucose":4,"proteins":4,"lipids":4,"elements":2},"bonus":{"manual":0.032,"auto":0.032,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.012,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0.45,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"terrestrial":1,"subterranean":1,"amphibious":1},"traits":[],"exclusive":[],"prereq":""},{"id":"golgi_apparatus","name":"Golgi Apparatus","stage":"cell","category":"organelle","description":"Packages advanced outputs and improves organelle coordination.","cost":{"evolution":10,"glucose":5,"proteins":5,"lipids":3,"elements":2},"bonus":{"manual":0.032,"auto":0.032,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.012,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.12,"food":0,"material":0,"knowledge":0.18,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"terrestrial":1,"aerial":1},"traits":[],"exclusive":[],"prereq":""},{"id":"endosome_system","name":"Endosome System","stage":"cell","category":"organelle","description":"Recycling network that extracts more value from gathered material.","cost":{"evolution":10,"glucose":4,"proteins":5,"lipids":3,"elements":2},"bonus":{"manual":0.198,"auto":0.048,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.018,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.05,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"amphibious":1,"terrestrial":1},"traits":[],"exclusive":[],"prereq":""},{"id":"vacuole","name":"Vacuole","stage":"cell","category":"organelle","description":"Expands storage and buffers sudden environmental stress.","cost":{"evolution":7,"glucose":4,"proteins":2,"lipids":3,"elements":1},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"arboreal":1,"fungal":1,"aquatic":1},"traits":[],"exclusive":[],"prereq":""},{"id":"central_vacuole","name":"Central Vacuole","stage":"cell","category":"organelle","description":"Massive internal reservoir suited to slower but resilient cell bodies.","cost":{"evolution":11,"glucose":5,"proteins":4,"lipids":4,"elements":2},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"arboreal":2,"fungal":1},"traits":[],"exclusive":[],"prereq":""},{"id":"contractile_vacuole","name":"Contractile Vacuole","stage":"cell","category":"organelle","description":"Osmoregulation specialist for unstable currents and deep waters.","cost":{"evolution":9,"glucose":4,"proteins":4,"lipids":3,"elements":2},"bonus":{"manual":0.032,"auto":0.032,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.012,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.05,"proteins":0,"lipids":0,"elements":0,"evolution":0.08,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"aquatic":2,"amphibious":1},"traits":[],"exclusive":[],"prereq":""},{"id":"chloroplast","name":"Chloroplast","stage":"cell","category":"organelle","description":"Photosynthetic energy source that scales with daylight.","cost":{"evolution":10,"glucose":4,"proteins":4,"lipids":3,"elements":2},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":1.8,"proteins":0,"lipids":0,"elements":0,"evolution":0.2,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"arboreal":3,"terrestrial":1},"traits":[{"id":"photosynthetic_lineage","label":"Photosynthetic lineage","bonus":{"resAdd":{"food":0.8},"auto":0.03}}],"exclusive":[],"prereq":""},{"id":"chromoplast","name":"Chromoplast","stage":"cell","category":"organelle","description":"Pigment-rich sensory organelle that helps track bright regions and resources.","cost":{"evolution":9,"glucose":4,"proteins":3,"lipids":3,"elements":2},"bonus":{"manual":0.032,"auto":0.032,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.012,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.35,"proteins":0,"lipids":0,"elements":0,"evolution":0.08,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"arboreal":2,"aerial":1},"traits":[],"exclusive":[],"prereq":""},{"id":"amyloplast","name":"Amyloplast","stage":"cell","category":"organelle","description":"Energy storage organelle that steadies long-resource droughts.","cost":{"evolution":10,"glucose":5,"proteins":3,"lipids":3,"elements":2},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.325,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"arboreal":2,"terrestrial":1},"traits":[],"exclusive":[],"prereq":""},{"id":"peroxisomes","name":"Peroxisomes","stage":"cell","category":"organelle","description":"Detoxification structures for toxic clouds and corrosive biomes.","cost":{"evolution":8,"glucose":4,"proteins":4,"lipids":2,"elements":3},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.075,"proteins":0,"lipids":0,"elements":0,"evolution":0.1,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"subterranean":1,"fungal":1},"traits":[],"exclusive":[],"prereq":""},{"id":"chemoplast","name":"Chemoplast","stage":"cell","category":"organelle","description":"Chemical energy harvesting for dark or vent-heavy environments.","cost":{"evolution":11,"glucose":4,"proteins":4,"lipids":3,"elements":4},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.25,"proteins":0,"lipids":0,"elements":0.35,"evolution":0.15,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"subterranean":3,"fungal":1},"traits":[],"exclusive":[],"prereq":""},{"id":"thermoplast","name":"Thermoplast","stage":"cell","category":"organelle","description":"Extracts useful energy from high-temperature and vent pressure zones.","cost":{"evolution":12,"glucose":5,"proteins":5,"lipids":4,"elements":4},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.225,"proteins":0,"lipids":0,"elements":0,"evolution":0.18,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"subterranean":2,"aquatic":1},"traits":[],"exclusive":[],"prereq":""},{"id":"hydrogenosome","name":"Hydrogenosome","stage":"cell","category":"organelle","description":"Anaerobic ATP engine tuned for low-oxygen or murky biomes.","cost":{"evolution":11,"glucose":5,"proteins":4,"lipids":3,"elements":3},"bonus":{"manual":0.032,"auto":0.032,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.012,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.275,"proteins":0,"lipids":0,"elements":0,"evolution":0.12,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"subterranean":2,"aquatic":1,"fungal":1},"traits":[],"exclusive":[],"prereq":""},{"id":"flagellum","name":"Flagellum","stage":"cell","category":"organelle","description":"High-speed propulsion for hunting runs and current surfing.","cost":{"evolution":8,"glucose":5,"proteins":3,"lipids":2,"elements":1},"bonus":{"manual":0.3,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.1,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"aquatic":2,"aerial":1,"amphibious":1},"traits":[{"id":"mobility_lineage","label":"Mobility lineage","bonus":{"manual":0.04,"resMult":{"influence":0.05}}}],"exclusive":[],"prereq":""},{"id":"cilia","name":"Cilia","stage":"cell","category":"organelle","description":"Fine movement control for fluid navigation and evasive micro-turns.","cost":{"evolution":9,"glucose":4,"proteins":5,"lipids":2,"elements":1},"bonus":{"manual":0.232,"auto":0.032,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.012,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"aquatic":2,"amphibious":1},"traits":[],"exclusive":[],"prereq":""},{"id":"pseudopod","name":"Pseudopod","stage":"cell","category":"organelle","description":"Engulfment-oriented extension for hunting, dragging, and scavenging.","cost":{"evolution":9,"glucose":5,"proteins":5,"lipids":2,"elements":2},"bonus":{"manual":0.4,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"amphibious":2,"terrestrial":1},"traits":[],"exclusive":[],"prereq":""},{"id":"cytoskeleton_actin","name":"Actin Network","stage":"cell","category":"organelle","description":"Flexible internal fibers that improve bursts, turns, and engulfment control.","cost":{"evolution":10,"glucose":4,"proteins":5,"lipids":2,"elements":2},"bonus":{"manual":0.020000000000000004,"auto":0.020000000000000004,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0075,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"terrestrial":1,"amphibious":2},"traits":[],"exclusive":[],"prereq":""},{"id":"cytoskeleton_mt","name":"Microtubule Scaffold","stage":"cell","category":"organelle","description":"Rigid transport lattice that improves placement efficiency and division order.","cost":{"evolution":11,"glucose":5,"proteins":6,"lipids":2,"elements":3},"bonus":{"manual":0.048,"auto":0.048,"carry":0.013999999999999999,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.018,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.027999999999999997,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"terrestrial":1,"aerial":1},"traits":[],"exclusive":[],"prereq":""},{"id":"lysosome","name":"Lysosome","stage":"cell","category":"organelle","description":"Predatory digestion and aggressive internal breakdown chemistry.","cost":{"evolution":10,"glucose":4,"proteins":6,"lipids":2,"elements":2},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0.25,"lipids":0,"elements":0,"evolution":0.1,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"aquatic":1,"terrestrial":1,"subterranean":1},"traits":[],"exclusive":[],"prereq":""},{"id":"toxin_vacuole","name":"Toxin Vacuole","stage":"cell","category":"organelle","description":"Stores caustic payloads that turn melee contact into lingering area denial.","cost":{"evolution":12,"glucose":4,"proteins":6,"lipids":3,"elements":4},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.12,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"subterranean":2,"aquatic":1},"traits":[{"id":"poison_lineage","label":"Poison lineage","bonus":{"resAdd":{"evolution":0.2},"manual":0.04}}],"exclusive":[],"prereq":""},{"id":"trichocysts","name":"Trichocysts","stage":"cell","category":"organelle","description":"Defensive micro-darts that punish nearby attackers.","cost":{"evolution":11,"glucose":4,"proteins":5,"lipids":3,"elements":3},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.08,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"aquatic":2,"amphibious":1},"traits":[],"exclusive":[],"prereq":""},{"id":"pilus","name":"Pilus","stage":"cell","category":"organelle","description":"Hooking appendage that extends contact range and stabilizes against drift.","cost":{"evolution":10,"glucose":4,"proteins":5,"lipids":2,"elements":2},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"amphibious":2,"aquatic":1},"traits":[],"exclusive":[],"prereq":""},{"id":"cell_wall","name":"Cell Wall","stage":"cell","category":"organelle","description":"Rigid outer protection for hostile currents, predators, and toxins.","cost":{"evolution":7,"glucose":3,"proteins":3,"lipids":2,"elements":2},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"fungal":2,"arboreal":1,"subterranean":1},"traits":[{"id":"fortified_lineage","label":"Fortified lineage","bonus":{"happiness":2,"resMult":{"material":0.05}}}],"exclusive":[],"prereq":""},{"id":"plasma_membrane","name":"Plasma Membrane","stage":"cell","category":"organelle","description":"Refined outer boundary that improves control under environmental pressure.","cost":{"evolution":9,"glucose":3,"proteins":4,"lipids":4,"elements":2},"bonus":{"manual":0.032,"auto":0.032,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.012,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"terrestrial":1,"arboreal":1,"amphibious":1},"traits":[],"exclusive":[],"prereq":""},{"id":"secretory_vesicles","name":"Secretory Vesicles","stage":"cell","category":"organelle","description":"Micro-payload carriers that support toxin release and combat recovery.","cost":{"evolution":10,"glucose":4,"proteins":5,"lipids":4,"elements":2},"bonus":{"manual":0.020000000000000004,"auto":0.020000000000000004,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0075,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.05,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"terrestrial":1,"subterranean":1},"traits":[],"exclusive":[],"prereq":""},{"id":"eyespot","name":"Eyespot","stage":"cell","category":"organelle","description":"Primitive light sensing that improves daylight exploitation and navigation.","cost":{"evolution":7,"glucose":3,"proteins":3,"lipids":2,"elements":1},"bonus":{"manual":0.032,"auto":0.032,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.012,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.3,"proteins":0,"lipids":0,"elements":0,"evolution":0.06,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"arboreal":1,"aerial":1,"aquatic":1},"traits":[],"exclusive":[],"prereq":""},{"id":"bioluminescence","name":"Bioluminescence","stage":"cell","category":"organelle","description":"Light-emitting chemistry that helps lure prey and reveal murky threats.","cost":{"evolution":9,"glucose":4,"proteins":4,"lipids":3,"elements":2},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0375,"proteins":0,"lipids":0,"elements":0,"evolution":0.12,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"aquatic":2,"subterranean":1,"aerial":1},"traits":[],"exclusive":[],"prereq":""},{"id":"mycelium_lattice","name":"Mycelium Lattice","stage":"cell","category":"organelle","description":"Decomposer-style nutrient web with strong research and conversion output.","cost":{"evolution":11,"glucose":4,"proteins":5,"lipids":3,"elements":3},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0.35,"lipids":0,"elements":0,"evolution":0.2,"food":0,"material":0,"knowledge":0.35,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"fungal":3,"subterranean":1},"traits":[],"exclusive":[],"prereq":""},{"id":"woronin_bodies","name":"Woronin Bodies","stage":"cell","category":"organelle","description":"Damage-sealing fungal structures that reduce catastrophe from sudden hits.","cost":{"evolution":10,"glucose":4,"proteins":5,"lipids":3,"elements":2},"bonus":{"manual":0.020000000000000004,"auto":0.020000000000000004,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0075,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"fungal":2,"subterranean":1},"traits":[],"exclusive":[],"prereq":""},{"id":"spitzenkorper","name":"Spitzenkorper","stage":"cell","category":"organelle","description":"Growth-directing fungal apex that accelerates organized expansion.","cost":{"evolution":11,"glucose":5,"proteins":5,"lipids":3,"elements":2},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.18,"food":0,"material":0,"knowledge":0.18,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"fungal":3},"traits":[],"exclusive":[],"prereq":""},{"id":"centrioles","name":"Centrioles","stage":"cell","category":"organelle","description":"Speeds division and pushes the cell toward multicellular readiness.","cost":{"evolution":12,"glucose":6,"proteins":6,"lipids":3,"elements":3},"bonus":{"manual":0.0,"auto":0.0,"carry":0.027999999999999997,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.256,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"terrestrial":2,"aerial":1,"amphibious":1},"traits":[],"exclusive":[],"prereq":""},{"id":"centrosome","name":"Centrosome","stage":"cell","category":"organelle","description":"Division organizer that stabilizes complex internal geometry.","cost":{"evolution":11,"glucose":5,"proteins":6,"lipids":3,"elements":3},"bonus":{"manual":0.032,"auto":0.032,"carry":0.018000000000000002,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.012,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.156,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"terrestrial":2,"aerial":1},"traits":[],"exclusive":[],"prereq":""},{"id":"acrosome","name":"Acrosome","stage":"cell","category":"organelle","description":"Penetration specialist that improves burst damage against prey.","cost":{"evolution":10,"glucose":4,"proteins":5,"lipids":3,"elements":2},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.08,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"terrestrial":1,"aquatic":1,"aerial":1},"traits":[],"exclusive":[],"prereq":""},{"id":"magnetosome","name":"Magnetosome","stage":"cell","category":"organelle","description":"Orientation organelle that steadies navigation through currents and drifting biomes.","cost":{"evolution":10,"glucose":4,"proteins":4,"lipids":2,"elements":4},"bonus":{"manual":0.048,"auto":0.048,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.018,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0,"proteins":0,"lipids":0,"elements":0,"evolution":0.1,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"aquatic":2,"subterranean":1},"traits":[],"exclusive":[],"prereq":""},{"id":"mucocyst","name":"Mucocyst","stage":"cell","category":"organelle","description":"Protective secretion sac that softens impacts and improves engulfment recovery.","cost":{"evolution":10,"glucose":4,"proteins":5,"lipids":4,"elements":2},"bonus":{"manual":0.18,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0.0375,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{"aquatic":1,"amphibious":2,"fungal":1},"traits":[],"exclusive":[],"prereq":""}],"creature":[{"id":"limb_precursor","name":"Limb Precursors","stage":"creature","category":"physical","description":"Pushes the body plan toward decisive terrestrial movement and stronger strikes.","cost":{"food":32,"knowledge":20,"evolution":12},"bonus":{"manual":0.046,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0.0,"material":0,"knowledge":0.0125,"culture":0.0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"keen_senses","label":"Keen senses","bonus":{"resMult":{"knowledge":0.05}}}],"exclusive":[],"prereq":""},{"id":"pack_instinct","name":"Pack Instinct","stage":"creature","category":"combat","description":"Builds hunting rhythm and accelerates adaptation gains from successful kills.","cost":{"food":44,"knowledge":25,"evolution":15},"bonus":{"manual":0.0,"auto":0.03,"carry":0.02,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.175,"food":0.0,"material":0,"knowledge":0.105,"culture":0.0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"gill_arch","name":"Gill Arch","stage":"creature","category":"survival","description":"Reduces thirst pressure and turns water access into a stronger recovery source.","cost":{"food":32,"knowledge":22,"evolution":12},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":1,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0.0,"material":0,"knowledge":0.0,"culture":0.0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"burrow_claws","name":"Burrow Claws","stage":"creature","category":"physical","description":"Improves material harvesting and nest expansion through digging behavior.","cost":{"food":40,"knowledge":25,"evolution":15},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0.0,"material":0.8,"knowledge":0.0,"culture":0.135,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"keen_eyes","name":"Keen Eyes","stage":"creature","category":"survival","description":"Extends prey detection and helps evade roaming threats.","cost":{"food":32,"knowledge":22,"evolution":12},"bonus":{"manual":0.086,"auto":0.0,"carry":0.0,"happiness":1,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0.0,"material":0,"knowledge":0.0875,"culture":0.0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"keen_senses","label":"Keen senses","bonus":{"resMult":{"knowledge":0.05}}}],"exclusive":[],"prereq":""},{"id":"spore_cloud","name":"Spore Cloud","stage":"creature","category":"survival","description":"Fungal defense that repels attackers and recycles kills into organic stockpiles.","cost":{"food":48,"knowledge":32,"evolution":18},"bonus":{"manual":0.0,"auto":0.020000000000000004,"carry":0.0,"happiness":1,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0.5,"material":0,"knowledge":0.06999999999999999,"culture":0.0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"leaping_tendons","name":"Leaping Tendons","stage":"creature","category":"physical","description":"Turns bursts of movement into real chase potential across open ground.","cost":{"food":40,"knowledge":25,"evolution":15},"bonus":{"manual":0.060000000000000005,"auto":0.0,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0.0,"material":0,"knowledge":0.02,"culture":0.0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"keen_senses","label":"Keen senses","bonus":{"resMult":{"knowledge":0.05}}}],"exclusive":[],"prereq":""},{"id":"crusher_jaw","name":"Crusher Jaw","stage":"creature","category":"combat","description":"Converts close contact into decisive takedowns against prey and lesser threats.","cost":{"food":52,"knowledge":30,"evolution":18},"bonus":{"manual":0.0,"auto":0.0,"carry":0.012,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.105,"food":0.3,"material":0,"knowledge":0.0,"culture":0.0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"warning_calls","name":"Warning Calls","stage":"creature","category":"combat","description":"Primitive communication improves cohesion and makes pack responses faster.","cost":{"food":44,"knowledge":25,"evolution":15},"bonus":{"manual":0.024,"auto":0.036,"carry":0.0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0.0,"material":0,"knowledge":0.156,"culture":0.0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"keen_senses","label":"Keen senses","bonus":{"resMult":{"knowledge":0.05}}}],"exclusive":[],"prereq":""},{"id":"thick_hide","name":"Thick Hide","stage":"creature","category":"survival","description":"Absorbs punishment from predators and harsh terrain while improving den endurance.","cost":{"food":40,"knowledge":27,"evolution":15},"bonus":{"manual":0.0,"auto":0.0,"carry":0.0,"happiness":1,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.0,"food":0.0,"material":0,"knowledge":0.0,"culture":0.06,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""}],"tribal":[{"id":"leader_ritual_keeper","name":"Ritual Keeper","stage":"tribal","category":"leader","description":"spiritual leadership path","cost":{"influence":37,"culture":28,"faith":16},"bonus":{"manual":0,"auto":0.03,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.0,"material":0.0,"knowledge":0,"culture":0,"faith":0.12,"influence":0.05,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"leader_trail_speaker","name":"Trail Speaker","stage":"tribal","category":"leader","description":"trade leadership path","cost":{"influence":34,"culture":16,"faith":8},"bonus":{"manual":0,"auto":0.03,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.0,"material":0.12,"knowledge":0,"culture":0,"faith":0.0,"influence":0.14800000000000002,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"leader_war_chief","name":"War Chief","stage":"tribal","category":"leader","description":"war leadership path","cost":{"influence":34,"culture":19,"faith":10},"bonus":{"manual":0,"auto":0.03,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.03,"material":0.0,"knowledge":0,"culture":0,"faith":0.03,"influence":0.0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"stone_tools","name":"Stone Tools","stage":"tribal","category":"tech","description":"crafting tribal technology","cost":{"knowledge":50,"material":22,"culture":10},"bonus":{"manual":0.08,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.18,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"campfire","name":"Campfire","stage":"tribal","category":"tech","description":"crafting tribal technology","cost":{"knowledge":60,"material":27,"culture":12},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.16,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"clan_rituals","name":"Clan Rituals","stage":"tribal","category":"tech","description":"spirituality tribal technology","cost":{"knowledge":55,"material":25,"culture":11},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.12,"faith":0.2,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""}],"civilization":[{"id":"civic_civic_records","name":"Civic Records","stage":"civilization","category":"civic","description":"identity civic","cost":{"culture":34,"material":60,"influence":36},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.16,"faith":0,"influence":0.06,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"civic_merchant_courts","name":"Merchant Courts","stage":"civilization","category":"civic","description":"wealth civic","cost":{"culture":34,"material":80,"influence":30},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.18,"knowledge":0,"culture":0,"faith":0,"influence":0.08,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"civic_temple_calendars","name":"Temple Calendars","stage":"civilization","category":"civic","description":"faith civic","cost":{"culture":34,"material":60,"influence":30},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.08,"faith":0.18,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"civic_scholar_census","name":"Scholar Census","stage":"civilization","category":"civic","description":"literacy civic","cost":{"culture":34,"material":60,"influence":30},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0.08,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"civic_frontier_codes","name":"Frontier Codes","stage":"civilization","category":"civic","description":"expansion civic","cost":{"culture":34,"material":60,"influence":30},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0.08,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"civic_harbor_charters","name":"Harbor Charters","stage":"civilization","category":"civic","description":"trade civic","cost":{"culture":34,"material":60,"influence":30},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0.08,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"civic_guild_registry","name":"Guild Registry","stage":"civilization","category":"civic","description":"industry civic","cost":{"culture":34,"material":60,"influence":30},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0.08,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"civic_assembly_oaths","name":"Assembly Oaths","stage":"civilization","category":"civic","description":"diplomacy civic","cost":{"culture":34,"material":60,"influence":30},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0.08,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"civic_embassy_protocols","name":"Embassy Protocols","stage":"civilization","category":"civic","description":"stability civic","cost":{"culture":34,"material":60,"influence":30},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0.08,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"civic_public_bath_codes","name":"Public Bath Codes","stage":"civilization","category":"civic","description":"tourism civic","cost":{"culture":34,"material":60,"influence":30},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0.08,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"civic_archive_mandates","name":"Archive Mandates","stage":"civilization","category":"civic","description":"law civic","cost":{"culture":34,"material":60,"influence":30},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0.08,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"civic_provincial_ledgers","name":"Provincial Ledgers","stage":"civilization","category":"civic","description":"science civic","cost":{"culture":34,"material":60,"influence":30},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0.08,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"religion_ancestor_cult","name":"Ancestor Cult","stage":"civilization","category":"religion","description":"ancestry religion","cost":{"faith":54,"culture":36,"influence":23},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.1,"faith":0.14,"influence":0.05,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":["religion_sun_covenant","religion_river_hymn","religion_sky_procession","religion_ember_rite","religion_harvest_communion","religion_sea_testament","religion_oath_tables","religion_celestial_measure","religion_ancestral_scriptures"],"prereq":""},{"id":"religion_sun_covenant","name":"Sun Covenant","stage":"civilization","category":"religion","description":"sun religion","cost":{"faith":56,"culture":34,"influence":24},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.08,"faith":0.16,"influence":0.06,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":["religion_ancestor_cult","religion_river_hymn","religion_sky_procession","religion_ember_rite","religion_harvest_communion","religion_sea_testament","religion_oath_tables","religion_celestial_measure","religion_ancestral_scriptures"],"prereq":""},{"id":"religion_river_hymn","name":"River Hymn","stage":"civilization","category":"religion","description":"river religion","cost":{"faith":51,"culture":35,"influence":26},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.09,"faith":0.11,"influence":0.08,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":["religion_ancestor_cult","religion_sun_covenant","religion_sky_procession","religion_ember_rite","religion_harvest_communion","religion_sea_testament","religion_oath_tables","religion_celestial_measure","religion_ancestral_scriptures"],"prereq":""},{"id":"religion_sky_procession","name":"Sky Procession","stage":"civilization","category":"religion","description":"sky religion","cost":{"faith":52,"culture":37,"influence":25},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.11,"faith":0.12,"influence":0.07,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":["religion_ancestor_cult","religion_sun_covenant","religion_river_hymn","religion_ember_rite","religion_harvest_communion","religion_sea_testament","religion_oath_tables","religion_celestial_measure","religion_ancestral_scriptures"],"prereq":""},{"id":"religion_ember_rite","name":"Ember Rite","stage":"civilization","category":"religion","description":"fire religion","cost":{"faith":53,"culture":33,"influence":27},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.07,"faith":0.13,"influence":0.09,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":["religion_ancestor_cult","religion_sun_covenant","religion_river_hymn","religion_sky_procession","religion_harvest_communion","religion_sea_testament","religion_oath_tables","religion_celestial_measure","religion_ancestral_scriptures"],"prereq":""},{"id":"religion_harvest_communion","name":"Harvest Communion","stage":"civilization","category":"religion","description":"harvest religion","cost":{"faith":50,"culture":38,"influence":23},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.12,"faith":0.1,"influence":0.05,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":["religion_ancestor_cult","religion_sun_covenant","religion_river_hymn","religion_sky_procession","religion_ember_rite","religion_sea_testament","religion_oath_tables","religion_celestial_measure","religion_ancestral_scriptures"],"prereq":""},{"id":"religion_sea_testament","name":"Sea Testament","stage":"civilization","category":"religion","description":"sea religion","cost":{"faith":51,"culture":34,"influence":28},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.08,"faith":0.11,"influence":0.1,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":["religion_ancestor_cult","religion_sun_covenant","religion_river_hymn","religion_sky_procession","religion_ember_rite","religion_harvest_communion","religion_oath_tables","religion_celestial_measure","religion_ancestral_scriptures"],"prereq":""},{"id":"religion_oath_tables","name":"Tables of Oath","stage":"civilization","category":"religion","description":"law religion","cost":{"faith":49,"culture":33,"influence":26},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.07,"faith":0.09,"influence":0.08,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":["religion_ancestor_cult","religion_sun_covenant","religion_river_hymn","religion_sky_procession","religion_ember_rite","religion_harvest_communion","religion_sea_testament","religion_celestial_measure","religion_ancestral_scriptures"],"prereq":""},{"id":"religion_celestial_measure","name":"Celestial Measure","stage":"civilization","category":"religion","description":"stars religion","cost":{"faith":52,"culture":35,"influence":28},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.09,"faith":0.12,"influence":0.1,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":["religion_ancestor_cult","religion_sun_covenant","religion_river_hymn","religion_sky_procession","religion_ember_rite","religion_harvest_communion","religion_sea_testament","religion_oath_tables","religion_ancestral_scriptures"],"prereq":""},{"id":"religion_ancestral_scriptures","name":"Ancestral Scriptures","stage":"civilization","category":"religion","description":"memory religion","cost":{"faith":50,"culture":39,"influence":24},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.13,"faith":0.1,"influence":0.06,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":["religion_ancestor_cult","religion_sun_covenant","religion_river_hymn","religion_sky_procession","religion_ember_rite","religion_harvest_communion","religion_sea_testament","religion_oath_tables","religion_celestial_measure"],"prereq":""},{"id":"irrigation","name":"Irrigation","stage":"civilization","category":"tech","description":"agriculture civilization technology","cost":{"knowledge":120,"material":60,"influence":22},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.22,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"roads","name":"Roads","stage":"civilization","category":"tech","description":"industry civilization technology","cost":{"knowledge":150,"material":75,"influence":27},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.14,"knowledge":0,"culture":0,"faith":0,"influence":0.12,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"writing","name":"Writing","stage":"civilization","category":"tech","description":"science civilization technology","cost":{"knowledge":140,"material":70,"influence":25},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.24,"culture":0.06,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""}],"empire":[{"id":"imperial_bureaucracy","name":"Imperial Bureaucracy","stage":"empire","category":"doctrine","description":"Favor census, administration, and orderly provincial integration.","cost":{"knowledge":180,"influence":70,"culture":45},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0.039,"culture":0,"faith":0,"influence":0.14500000000000002,"energy":0.0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"merchant_hegemony","name":"Merchant Hegemony","stage":"empire","category":"doctrine","description":"Anchor the empire in corridors, markets, and compliant trade partners.","cost":{"knowledge":180,"influence":70,"culture":45},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.11199999999999999,"knowledge":0.0,"culture":0,"faith":0,"influence":0.04,"energy":0.064},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"martial_ascendancy","name":"Martial Ascendancy","stage":"empire","category":"doctrine","description":"Build the empire around campaigns, legions, and frontier coercion.","cost":{"knowledge":180,"influence":70,"culture":45},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":-0.027999999999999997,"knowledge":0.0,"culture":0,"faith":0,"influence":0.06,"energy":0.0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"cosmic_patronage","name":"Cosmic Patronage","stage":"empire","category":"doctrine","description":"Direct surplus legitimacy and knowledge toward astronomical infrastructure.","cost":{"knowledge":180,"influence":70,"culture":45},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0.021,"culture":0,"faith":0,"influence":0.135,"energy":0.04000000000000001},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"sacred_imperium","name":"Sacred Imperium","stage":"empire","category":"doctrine","description":"Unify the realm through priesthood, ritual, and reverence for imperial authority.","cost":{"knowledge":180,"influence":70,"culture":45},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0.015,"culture":0,"faith":0,"influence":0.145,"energy":0.0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"frontier_fortress","name":"Frontier Fortress","stage":"empire","category":"doctrine","description":"Accept a harsher imperial posture in exchange for resilient borders and faster provincial militarization.","cost":{"knowledge":180,"influence":70,"culture":45},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":-1,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0.0,"culture":0,"faith":0,"influence":0.0,"energy":0.048},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"mercantile_charter","name":"Mercantile Charter","stage":"empire","category":"doctrine","description":"Expand chartered commerce, treasury capture, and corridor privilege across the empire.","cost":{"knowledge":180,"influence":70,"culture":45},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.098,"knowledge":0.018,"culture":0,"faith":0,"influence":0.09,"energy":0.0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"scholastic_administration","name":"Scholastic Administration","stage":"empire","category":"doctrine","description":"Favor archival record-keeping, trained officials, and knowledge-driven provincial integration.","cost":{"knowledge":180,"influence":70,"culture":45},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.027999999999999997,"knowledge":0.045,"culture":0,"faith":0,"influence":0.11499999999999999,"energy":0.0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"road_charter","name":"Road Charter","stage":"empire","category":"edict","description":"Favor corridor maintenance and internal supply stability.","cost":{"influence":80,"material":160,"energy":35},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.054,"knowledge":0,"culture":0.0,"faith":0,"influence":0.03,"energy":0.077},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"frontier_march","name":"Frontier March","stage":"empire","category":"edict","description":"Strengthen provincial garrisons and support active campaigns.","cost":{"influence":80,"material":160,"energy":35},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":1,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0,"culture":0.012,"faith":0,"influence":0.0,"energy":0.0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"grain_dole","name":"Grain Dole","stage":"empire","category":"edict","description":"Spend treasury to reduce unrest and ease provincial demand.","cost":{"influence":80,"material":160,"energy":35},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":1,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0,"culture":0.020000000000000004,"faith":0,"influence":0.0,"energy":0.063},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"imperial_census","name":"Imperial Census","stage":"empire","category":"edict","description":"Improve administration and tax capture across the provinces.","cost":{"influence":80,"material":160,"energy":35},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":1,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.024,"knowledge":0,"culture":0.012,"faith":0,"influence":0.06,"energy":0.0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"war_levy","name":"War Levy","stage":"empire","category":"edict","description":"Convert authority into campaign pressure at the cost of internal calm.","cost":{"influence":80,"material":160,"energy":35},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":-0.018,"knowledge":0,"culture":0.0,"faith":0,"influence":0.0,"energy":0.0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"provincial_amnesty","name":"Provincial Amnesty","stage":"empire","category":"edict","description":"Reduce rebellion risk by loosening taxes and restoring local trust.","cost":{"influence":80,"material":160,"energy":35},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":1,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0,"culture":0.016,"faith":0,"influence":0.0,"energy":0.041999999999999996},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"scholar_expedition","name":"Scholar Expedition","stage":"empire","category":"edict","description":"Direct imperial attention toward astronomy, archives, and long-range planning.","cost":{"influence":80,"material":160,"energy":35},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":1,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.018,"knowledge":0,"culture":0.012,"faith":0,"influence":0.05,"energy":0.0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"fortress_garrisons","name":"Fortress Garrisons","stage":"empire","category":"edict","description":"Invest in permanent garrison structures to suppress rebellion and reinforce campaign staging grounds.","cost":{"influence":80,"material":160,"energy":35},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0,"culture":0.0,"faith":0,"influence":0.0,"energy":0.034999999999999996},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"merchant_immunity","name":"Merchant Immunity","stage":"empire","category":"edict","description":"Grant corridor privileges and protected exchange to increase treasury flow at the cost of tighter central control.","cost":{"influence":80,"material":160,"energy":35},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":1,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.06,"knowledge":0,"culture":0.008,"faith":0,"influence":-0.01,"energy":0.0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"provincial_resettlement","name":"Provincial Resettlement","stage":"empire","category":"edict","description":"Rebalance stressed provinces through organized resettlement and emergency grain support.","cost":{"influence":80,"material":160,"energy":35},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":1,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0,"culture":0.012,"faith":0,"influence":0.0,"energy":0.06999999999999999},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"mass_production","name":"Mass Production","stage":"empire","category":"tech","description":"industry empire technology","cost":{"knowledge":220,"material":121,"influence":44},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.18,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"telegraph_network","name":"Telegraph Network","stage":"empire","category":"tech","description":"communications empire technology","cost":{"knowledge":210,"material":116,"influence":42},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.08,"culture":0,"faith":0,"influence":0.15,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"combustion","name":"Combustion","stage":"empire","category":"tech","description":"energy empire technology","cost":{"knowledge":240,"material":132,"influence":48},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.1,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""}],"solar":[{"id":"expansion_initiative","name":"Expansion Initiative","stage":"solar","category":"policy","description":"Favor rapid colonization and route growth.","cost":{"energy":180,"material":220,"influence":90,"knowledge":110},"bonus":{"manual":0,"auto":0.06,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.06,"knowledge":0.04,"culture":0,"faith":0,"influence":0.0,"energy":0.08},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"scientific_compact","name":"Scientific Compact","stage":"solar","category":"policy","description":"Prioritize data, automation, and orbital research.","cost":{"energy":180,"material":220,"influence":90,"knowledge":110},"bonus":{"manual":0,"auto":0.06,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.02,"knowledge":0.16,"culture":0,"faith":0,"influence":0.0,"energy":0.04},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"defense_protocols","name":"Defense Protocols","stage":"solar","category":"policy","description":"Harden the network against piracy and route disruption.","cost":{"energy":180,"material":220,"influence":90,"knowledge":110},"bonus":{"manual":0,"auto":0.06,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.04,"knowledge":0.02,"culture":0,"faith":0,"influence":0.054,"energy":0.02},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"terraforming_mandate","name":"Terraforming Mandate","stage":"solar","category":"policy","description":"Push hostile bodies toward long-term stability.","cost":{"energy":180,"material":220,"influence":90,"knowledge":110},"bonus":{"manual":0,"auto":0.06,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.02,"knowledge":0.08,"culture":0,"faith":0,"influence":0.0,"energy":0.02},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"mercantile_ring","name":"Mercantile Ring","stage":"solar","category":"policy","description":"Push credit generation and interplanetary commercial traffic.","cost":{"energy":180,"material":220,"influence":90,"knowledge":110},"bonus":{"manual":0,"auto":0.06,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.04,"knowledge":0.04,"culture":0,"faith":0,"influence":0.0,"energy":0.06},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"deep_space_survey","name":"Deep Space Survey","stage":"solar","category":"policy","description":"Convert science output into long-range discovery momentum.","cost":{"energy":180,"material":220,"influence":90,"knowledge":110},"bonus":{"manual":0,"auto":0.06,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.02,"knowledge":0.18,"culture":0,"faith":0,"influence":0.0,"energy":0.02},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"convoy_command","name":"Convoy Command","stage":"solar","category":"policy","description":"Organize escorted route traffic and reduce piracy drag.","cost":{"energy":180,"material":220,"influence":90,"knowledge":110},"bonus":{"manual":0,"auto":0.06,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.04,"knowledge":0.04,"culture":0,"faith":0,"influence":0.03,"energy":0.04},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"habitat_compact","name":"Habitat Compact","stage":"solar","category":"policy","description":"Invest in dense, resilient colony life support and civic order.","cost":{"energy":180,"material":220,"influence":90,"knowledge":110},"bonus":{"manual":0,"auto":0.06,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.03,"knowledge":0.08,"culture":0,"faith":0,"influence":0.006,"energy":0.03},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"fusion_drives","name":"Fusion Drives","stage":"solar","category":"tech","description":"propulsion solar technology","cost":{"knowledge":320,"energy":144,"material":176},"bonus":{"manual":0,"auto":0.07,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0.12,"energy":0.08},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"orbital_habitats","name":"Orbital Habitats","stage":"solar","category":"tech","description":"orbital_construction solar technology","cost":{"knowledge":340,"energy":153,"material":187},"bonus":{"manual":0,"auto":0.07,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.08,"material":0.15,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"closed_loop_life_support","name":"Closed Loop Life Support","stage":"solar","category":"tech","description":"life_support solar technology","cost":{"knowledge":300,"energy":135,"material":165},"bonus":{"manual":0,"auto":0.07,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.12,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"solar_lens_array","name":"Solar Lens Array","stage":"solar","category":"megastructure","description":"Solar megastructure","cost":{"material":700,"energy":400,"knowledge":280},"bonus":{"manual":0,"auto":0.08,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.0,"material":0,"knowledge":0.0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0.0,"culture":0,"faith":0,"influence":0,"energy":22.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"archival_ring","name":"Archival Ring","stage":"solar","category":"megastructure","description":"Solar megastructure","cost":{"material":700,"energy":400,"knowledge":280},"bonus":{"manual":0,"auto":0.08,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.0,"material":0,"knowledge":0.25,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":20.0,"culture":0,"faith":0,"influence":0,"energy":0.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"shipyard_spine","name":"Shipyard Spine","stage":"solar","category":"megastructure","description":"Solar megastructure","cost":{"material":700,"energy":400,"knowledge":280},"bonus":{"manual":0,"auto":0.08,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.0,"material":0,"knowledge":0.0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":18.0,"knowledge":0.0,"culture":0,"faith":0,"influence":0,"energy":0.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"biosphere_braid","name":"Biosphere Braid","stage":"solar","category":"megastructure","description":"Solar megastructure","cost":{"material":700,"energy":400,"knowledge":280},"bonus":{"manual":0,"auto":0.08,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.016,"material":0,"knowledge":0.0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0.0,"culture":0,"faith":0,"influence":0,"energy":0.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"heliopause_bastion","name":"Heliopause Bastion","stage":"solar","category":"megastructure","description":"Solar megastructure","cost":{"material":700,"energy":400,"knowledge":280},"bonus":{"manual":0,"auto":0.08,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.004,"material":0,"knowledge":0.0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":8.0,"knowledge":0.0,"culture":0,"faith":0,"influence":0,"energy":10.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"voidseed_nursery","name":"Voidseed Nursery","stage":"solar","category":"megastructure","description":"Solar megastructure","cost":{"material":700,"energy":400,"knowledge":280},"bonus":{"manual":0,"auto":0.08,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.022000000000000002,"material":0,"knowledge":0.1,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":8.0,"culture":0,"faith":0,"influence":0,"energy":0.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"mercury_forge_chain","name":"Mercury Forge Chain","stage":"solar","category":"megastructure","description":"Solar megastructure","cost":{"material":700,"energy":400,"knowledge":280},"bonus":{"manual":0,"auto":0.08,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.0,"material":0,"knowledge":0.0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":22.0,"knowledge":0.0,"culture":0,"faith":0,"influence":0,"energy":6.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"gravitic_relay_crown","name":"Gravitic Relay Crown","stage":"solar","category":"megastructure","description":"Solar megastructure","cost":{"material":700,"energy":400,"knowledge":280},"bonus":{"manual":0,"auto":0.08,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.004,"material":0,"knowledge":0.22,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":14.0,"culture":0,"faith":0,"influence":0,"energy":8.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"ftl_hyperlanes","name":"Hyperlanes","stage":"solar","category":"ftl","description":"Fixed system-to-system paths. Reliable and efficient, but route-bound.","cost":{"knowledge":260,"energy":220,"influence":110},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.08,"culture":0,"faith":0,"influence":0.08,"energy":0.05},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"ftl_hyperlanes","label":"Hyperlanes","bonus":{"resMult":{"influence":0.03,"knowledge":0.03}}}],"exclusive":[],"prereq":""},{"id":"ftl_warp","name":"Warp","stage":"solar","category":"ftl","description":"Short-range free movement. Flexible but less efficient.","cost":{"knowledge":260,"energy":220,"influence":110},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.08,"culture":0,"faith":0,"influence":0.08,"energy":0.05},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"ftl_warp","label":"Warp","bonus":{"resMult":{"influence":0.03,"knowledge":0.03}}}],"exclusive":[],"prereq":""},{"id":"ftl_wormholes","name":"Wormholes","stage":"solar","category":"ftl","description":"Station-based instant long-range movement. Expensive but powerful.","cost":{"knowledge":260,"energy":220,"influence":110},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.08,"culture":0,"faith":0,"influence":0.08,"energy":0.05},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"ftl_wormholes","label":"Wormholes","bonus":{"resMult":{"influence":0.03,"knowledge":0.03}}}],"exclusive":[],"prereq":""}],"galactic":[{"id":"align_lyra_compact","name":"Lyra Compact","stage":"galactic","category":"alignment","description":"Alignment: exchange","cost":{"influence":180,"knowledge":220,"culture":140,"energy":120},"bonus":{"manual":0,"auto":0.07,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.18,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0.14},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"align_vesper_combine","name":"Vesper Combine","stage":"galactic","category":"alignment","description":"Alignment: dominion","cost":{"influence":180,"knowledge":220,"culture":140,"energy":120},"bonus":{"manual":0,"auto":0.07,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0.2,"energy":0.08},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"align_orion_synod","name":"Orion Synod","stage":"galactic","category":"alignment","description":"Alignment: archive","cost":{"influence":180,"knowledge":220,"culture":140,"energy":120},"bonus":{"manual":0,"auto":0.07,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.18,"culture":0.12,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"align_sable_march","name":"Sable March","stage":"galactic","category":"alignment","description":"Alignment: convergence","cost":{"influence":180,"knowledge":220,"culture":140,"energy":120},"bonus":{"manual":0,"auto":0.07,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.18,"culture":0.12,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"align_thalen_accord","name":"Thalen Accord","stage":"galactic","category":"alignment","description":"Alignment: pilgrimage","cost":{"influence":180,"knowledge":220,"culture":140,"energy":120},"bonus":{"manual":0,"auto":0.07,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.18,"culture":0.12,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"align_nacre_assembly","name":"Nacre Assembly","stage":"galactic","category":"alignment","description":"Alignment: optimization","cost":{"influence":180,"knowledge":220,"culture":140,"energy":120},"bonus":{"manual":0,"auto":0.07,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.18,"culture":0.12,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"align_auric_mandate","name":"Auric Mandate","stage":"galactic","category":"alignment","description":"Alignment: custodianship","cost":{"influence":180,"knowledge":220,"culture":140,"energy":120},"bonus":{"manual":0,"auto":0.07,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.18,"culture":0.12,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"align_penumbral_choir","name":"Penumbral Choir","stage":"galactic","category":"alignment","description":"Alignment: migration","cost":{"influence":180,"knowledge":220,"culture":140,"energy":120},"bonus":{"manual":0,"auto":0.07,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.18,"culture":0.12,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"align_helix_union","name":"Helix Union","stage":"galactic","category":"alignment","description":"Alignment: symbiosis","cost":{"influence":180,"knowledge":220,"culture":140,"energy":120},"bonus":{"manual":0,"auto":0.07,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.18,"culture":0.12,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"dyson_swarm_coordination","name":"Dyson Swarm Coordination","stage":"galactic","category":"tech","description":"stellar_engineering galactic technology","cost":{"knowledge":700,"energy":350,"material":280,"influence":126},"bonus":{"manual":0,"auto":0.08,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.1,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0.18},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"wormhole_corridors","name":"Wormhole Corridors","stage":"galactic","category":"tech","description":"advanced_propulsion galactic technology","cost":{"knowledge":760,"energy":380,"material":304,"influence":137},"bonus":{"manual":0,"auto":0.08,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.12,"culture":0,"faith":0,"influence":0.12,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"ascension_protocols","name":"Ascension Protocols","stage":"galactic","category":"tech","description":"consciousness_engineering galactic technology","cost":{"knowledge":800,"energy":400,"material":320,"influence":144},"bonus":{"manual":0,"auto":0.08,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.1,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0.18},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"dyson_swarm","name":"Dyson Swarm","stage":"galactic","category":"megastructure","description":"Galactic megastructure","cost":{"material":1200,"energy":900,"knowledge":700,"influence":250},"bonus":{"manual":0,"auto":0.1,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.0,"faith":0,"influence":0.0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":60.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"quantum_archive","name":"Quantum Archive","stage":"galactic","category":"megastructure","description":"Galactic megastructure","cost":{"material":1200,"energy":900,"knowledge":700,"influence":250},"bonus":{"manual":0,"auto":0.1,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.0,"faith":0,"influence":0.0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"gateway_spine","name":"Gateway Spine","stage":"galactic","category":"megastructure","description":"Galactic megastructure","cost":{"material":1200,"energy":900,"knowledge":700,"influence":250},"bonus":{"manual":0,"auto":0.1,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.0,"faith":0,"influence":0.25,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"living_mandala","name":"Living Mandala","stage":"galactic","category":"megastructure","description":"Galactic megastructure","cost":{"material":1200,"energy":900,"knowledge":700,"influence":250},"bonus":{"manual":0,"auto":0.1,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.18,"faith":0,"influence":0.0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"hyperforge_matrix","name":"Hyperforge Matrix","stage":"galactic","category":"megastructure","description":"Galactic megastructure","cost":{"material":1200,"energy":900,"knowledge":700,"influence":250},"bonus":{"manual":0,"auto":0.1,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.0,"faith":0,"influence":0.0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":55.0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"matrioshka_orbit","name":"Matrioshka Orbit","stage":"galactic","category":"megastructure","description":"Galactic megastructure","cost":{"material":1200,"energy":900,"knowledge":700,"influence":250},"bonus":{"manual":0,"auto":0.1,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.0,"faith":0,"influence":0.0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":32.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"celestial_forum","name":"Celestial Forum","stage":"galactic","category":"megastructure","description":"Galactic megastructure","cost":{"material":1200,"energy":900,"knowledge":700,"influence":250},"bonus":{"manual":0,"auto":0.1,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.1,"faith":0,"influence":0.2,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"armada_anvil","name":"Armada Anvil","stage":"galactic","category":"megastructure","description":"Galactic megastructure","cost":{"material":1200,"energy":900,"knowledge":700,"influence":250},"bonus":{"manual":0,"auto":0.1,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.0,"faith":0,"influence":0.0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":34.0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"worldloom_lattice","name":"Worldloom Lattice","stage":"galactic","category":"megastructure","description":"Galactic megastructure","cost":{"material":1200,"energy":900,"knowledge":700,"influence":250},"bonus":{"manual":0,"auto":0.1,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.16,"faith":0,"influence":0.1,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":10.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"null_barrier","name":"Null Barrier","stage":"galactic","category":"megastructure","description":"Galactic megastructure","cost":{"material":1200,"energy":900,"knowledge":700,"influence":250},"bonus":{"manual":0,"auto":0.1,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.0,"faith":0,"influence":0.08,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":14.0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":18.0}},"affinity":{},"traits":[],"exclusive":[],"prereq":""},{"id":"victory_federation","name":"Federation","stage":"galactic","category":"victory","description":"Secure peace through treaties and stable factions.","cost":{"knowledge":900,"energy":500,"culture":280,"influence":280},"bonus":{"manual":0,"auto":0.08,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":["victory_domination","victory_megastructure","victory_transcendence","victory_trade_hegemony"],"prereq":""},{"id":"victory_domination","name":"Domination","stage":"galactic","category":"victory","description":"Win through fleet supremacy and conquered rivals.","cost":{"knowledge":900,"energy":500,"culture":280,"influence":280},"bonus":{"manual":0,"auto":0.08,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":["victory_federation","victory_megastructure","victory_transcendence","victory_trade_hegemony"],"prereq":""},{"id":"victory_megastructure","name":"Megastructure","stage":"galactic","category":"victory","description":"Triumph through colossal stellar construction.","cost":{"knowledge":900,"energy":500,"culture":280,"influence":280},"bonus":{"manual":0,"auto":0.08,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":["victory_federation","victory_domination","victory_transcendence","victory_trade_hegemony"],"prereq":""},{"id":"victory_transcendence","name":"Transcendence","stage":"galactic","category":"victory","description":"Ascend beyond conventional civilization through endgame transformation.","cost":{"knowledge":900,"energy":500,"culture":280,"influence":280},"bonus":{"manual":0,"auto":0.08,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":["victory_federation","victory_domination","victory_megastructure","victory_trade_hegemony"],"prereq":""},{"id":"victory_trade_hegemony","name":"Trade Hegemony","stage":"galactic","category":"victory","description":"Rule the network through interstellar commerce and logistics.","cost":{"knowledge":900,"energy":500,"culture":280,"influence":280},"bonus":{"manual":0,"auto":0.08,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":["victory_federation","victory_domination","victory_megastructure","victory_transcendence"],"prereq":""}]};
const STAGE_UNITS={"tribal":[{"id":"gatherer","name":"Gatherer","stage":"tribal","class":"support","required_unlock":"unit:gatherer","description":"Collects food and materials for the first settlement."},{"id":"builder","name":"Builder","stage":"tribal","class":"support","required_unlock":"unit:builder","description":"Constructs buildings and anchors tribal infrastructure."},{"id":"scout","name":"Scout","stage":"tribal","class":"recon","required_unlock":"","description":"Baseline tribal scout and pathfinder."},{"id":"guard","name":"Guard","stage":"tribal","class":"melee","required_unlock":"","description":"Baseline tribal defender for local clashes."},{"id":"trade","name":"Trade Runner","stage":"tribal","class":"trade","required_unlock":"","description":"Baseline tribal trader for early exchanges and supply runs."},{"id":"emissary","name":"Emissary","stage":"tribal","class":"diplomatic","required_unlock":"","description":"Baseline tribal envoy for alliance-building and contact."},{"id":"recon_scout","name":"Recon Scout","stage":"tribal","class":"recon","required_unlock":"unit:recon_scout","description":"Fast pathfinder for scouting, escort, and patrol."},{"id":"melee_warrior","name":"Melee Warrior","stage":"tribal","class":"melee","required_unlock":"unit:melee_warrior","description":"Core close-combat tribal fighter."},{"id":"ranged_skirmisher","name":"Ranged Skirmisher","stage":"tribal","class":"ranged","required_unlock":"unit:ranged_skirmisher","description":"Harasses enemies from range and screens the settlement."},{"id":"trade_convoy","name":"Trade Convoy","stage":"tribal","class":"trade","required_unlock":"unit:trade_convoy","description":"Carries goods between the tribal center and foreign contacts."},{"id":"pack_train","name":"Pack Train","stage":"tribal","class":"logistics","required_unlock":"unit:pack_train","description":"Supports supply movement and early war logistics."},{"id":"shaman","name":"Shaman","stage":"tribal","class":"religious","required_unlock":"unit:shaman","description":"Spreads belief, reads omens, and strengthens rites."},{"id":"ritual_keeper","name":"Ritual Keeper","stage":"tribal","class":"religious","required_unlock":"unit:ritual_keeper","description":"Maintains holy spaces and stabilizes belief traditions."},{"id":"holy_warrior","name":"Holy Warrior","stage":"tribal","class":"religious_military","required_unlock":"unit:holy_warrior","description":"Turns spiritual zeal into martial pressure."}],"civilization":[{"id":"settler","name":"Settler","stage":"civilization","class":"settler","required_unlock":"unit:settler","description":"Founds new cities and expands the civilization."},{"id":"recon_rider","name":"Recon Rider","stage":"civilization","class":"recon","required_unlock":"unit:recon_rider","description":"Fast land recon for border visibility and response."},{"id":"melee_company","name":"Melee Company","stage":"civilization","class":"melee","required_unlock":"unit:melee_company","description":"Front-line heavy infantry."},{"id":"ranged_company","name":"Ranged Company","stage":"civilization","class":"ranged","required_unlock":"unit:ranged_company","description":"Dedicated ranged battlefield support."},{"id":"heavy_cavalry","name":"Heavy Cavalry","stage":"civilization","class":"heavy_cavalry","required_unlock":"unit:heavy_cavalry","description":"Shock cavalry for breakthroughs and raids."},{"id":"siege_train","name":"Siege Train","stage":"civilization","class":"siege","required_unlock":"unit:siege_train","description":"Supports city assault and fortified warfare."},{"id":"military_engineer","name":"Military Engineer","stage":"civilization","class":"military_engineer","required_unlock":"unit:military_engineer","description":"Builds roads, fortifications, and war infrastructure."},{"id":"field_medic","name":"Field Medic","stage":"civilization","class":"support","required_unlock":"unit:field_medic","description":"Supports civil and military recovery by reducing losses and stabilizing frontline cities."},{"id":"trade_caravan","name":"Trade Caravan","stage":"civilization","class":"trade","required_unlock":"unit:trade_caravan","description":"Moves wealth and commerce between cities."},{"id":"supply_wagon","name":"Supply Wagon","stage":"civilization","class":"logistics","required_unlock":"unit:supply_wagon","description":"Feeds long-distance campaigns and urban supply chains."},{"id":"river_fleet","name":"River Fleet","stage":"civilization","class":"naval","required_unlock":"unit:river_fleet","description":"Projects trade and military force along coasts and inland waterways."},{"id":"envoy_unit","name":"Envoy","stage":"civilization","class":"diplomatic","required_unlock":"unit:envoy_unit","description":"Formal diplomatic envoy for treaties, influence, and civic outreach."},{"id":"missionary","name":"Missionary","stage":"civilization","class":"religious","required_unlock":"unit:missionary","description":"Spreads the state religion abroad."},{"id":"inquisitor","name":"Inquisitor","stage":"civilization","class":"religious","required_unlock":"unit:inquisitor","description":"Breaks rival resistance and protects religious unity."},{"id":"prophet","name":"Prophet","stage":"civilization","class":"religious","required_unlock":"unit:prophet","description":"Launches a powerful conversion push."},{"id":"temple_guard","name":"Temple Guard","stage":"civilization","class":"religious_military","required_unlock":"unit:temple_guard","description":"Defends holy cities and sacred sites."},{"id":"terrestrial_phalanx","name":"Terrestrial Phalanx","stage":"civilization","class":"archetype_special","required_unlock":"unit:terrestrial_phalanx","archetype":"terrestrial","description":"Archetype-special land formation emphasizing discipline and line strength."},{"id":"aquatic_wave_riders","name":"Aquatic Wave Riders","stage":"civilization","class":"archetype_special","required_unlock":"unit:aquatic_wave_riders","archetype":"aquatic","description":"Aquatic-special mobility force for riverine and coastal projection."},{"id":"amphibious_marsh_guard","name":"Amphibious Marsh Guard","stage":"civilization","class":"archetype_special","required_unlock":"unit:amphibious_marsh_guard","archetype":"amphibious","description":"Amphibious-special adaptable frontier unit."},{"id":"fungal_spore_guard","name":"Fungal Spore Guard","stage":"civilization","class":"archetype_special","required_unlock":"unit:fungal_spore_guard","archetype":"fungal","description":"Fungal-special resilient religious-warrior hybrid."},{"id":"arboreal_canopy_watch","name":"Arboreal Canopy Watch","stage":"civilization","class":"archetype_special","required_unlock":"unit:arboreal_canopy_watch","archetype":"arboreal","description":"Arboreal-special elevated recon and defense unit."},{"id":"subterranean_burrow_sappers","name":"Subterranean Burrow Sappers","stage":"civilization","class":"archetype_special","required_unlock":"unit:subterranean_burrow_sappers","archetype":"subterranean","description":"Subterranean-special siege and infiltration corps."},{"id":"aerial_sky_lancers","name":"Aerial Sky Lancers","stage":"civilization","class":"archetype_special","required_unlock":"unit:aerial_sky_lancers","archetype":"aerial","description":"Aerial-special elite fast-strike formation."}],"empire":[{"id":"recon_cavalry","name":"Recon Cavalry","stage":"empire","class":"recon","required_unlock":"unit:recon_cavalry","description":"Fast border reconnaissance for imperial fronts."},{"id":"line_infantry","name":"Line Infantry","stage":"empire","class":"ranged","required_unlock":"unit:line_infantry","description":"Massed firearm infantry for imperial battles."},{"id":"legionary_cohort","name":"Legionary Cohort","stage":"empire","class":"melee","required_unlock":"unit:legionary_cohort","description":"Core imperial land force."},{"id":"heavy_armor","name":"Heavy Armor","stage":"empire","class":"heavy_cavalry","required_unlock":"unit:heavy_armor","description":"Armored breakthrough formation."},{"id":"siege_artillery","name":"Siege Artillery","stage":"empire","class":"siege","required_unlock":"unit:siege_artillery","description":"Long-range siege and bombardment arm."},{"id":"anti_air_battery","name":"Anti-Air Battery","stage":"empire","class":"anti_air","required_unlock":"unit:anti_air_battery","description":"Protects armies and cities from air attack."},{"id":"military_engineer_corps","name":"Military Engineer Corps","stage":"empire","class":"military_engineer","required_unlock":"unit:military_engineer_corps","description":"Builds roads, forts, and strategic infrastructure at scale."},{"id":"truck_convoy","name":"Truck Convoy","stage":"empire","class":"trade","required_unlock":"unit:truck_convoy","description":"Moves trade and industrial goods through the empire."},{"id":"supply_train","name":"Supply Train","stage":"empire","class":"logistics","required_unlock":"unit:supply_train","description":"Feeds battalions, provinces, and frontier operations."},{"id":"hospital_train","name":"Hospital Train","stage":"empire","class":"support","required_unlock":"unit:hospital_train","description":"Moves medical capacity through the empire and reduces wartime collapse."},{"id":"signal_corps","name":"Signal Corps","stage":"empire","class":"support","required_unlock":"unit:signal_corps","description":"Improves communications, command coordination, and intelligence relay speed."},{"id":"empire_frigate","name":"Frigate","stage":"empire","class":"naval","required_unlock":"unit:frigate","description":"Blue-water naval projection vessel."},{"id":"carrier_barge","name":"Carrier Barge","stage":"empire","class":"naval_support","required_unlock":"unit:carrier_barge","description":"Floating logistics and air-support platform."},{"id":"air_wing","name":"Air Wing","stage":"empire","class":"air","required_unlock":"unit:air_wing","description":"Imperial aerospace strike and patrol unit."},{"id":"televangelist","name":"Televangelist","stage":"empire","class":"religious","required_unlock":"unit:televangelist","description":"Mass-communication religious spread unit."},{"id":"terrestrial_iron_legion","name":"Terrestrial Iron Legion","stage":"empire","class":"archetype_special","required_unlock":"unit:terrestrial_iron_legion","archetype":"terrestrial","description":"Terrestrial-special imperial heavy cohort."},{"id":"aquatic_flood_fleet","name":"Aquatic Flood Fleet","stage":"empire","class":"archetype_special","required_unlock":"unit:aquatic_flood_fleet","archetype":"aquatic","description":"Aquatic-special maritime projection arm."},{"id":"amphibious_delta_lancers","name":"Amphibious Delta Lancers","stage":"empire","class":"archetype_special","required_unlock":"unit:amphibious_delta_lancers","archetype":"amphibious","description":"Amphibious-special flexible strike unit."},{"id":"fungal_bloom_host","name":"Fungal Bloom Host","stage":"empire","class":"archetype_special","required_unlock":"unit:fungal_bloom_host","archetype":"fungal","description":"Fungal-special attrition and resilience corps."},{"id":"arboreal_greenwardens","name":"Arboreal Greenwardens","stage":"empire","class":"archetype_special","required_unlock":"unit:arboreal_greenwardens","archetype":"arboreal","description":"Arboreal-special defensive and cohesion force."},{"id":"subterranean_deep_battery","name":"Subterranean Deep Battery","stage":"empire","class":"archetype_special","required_unlock":"unit:subterranean_deep_battery","archetype":"subterranean","description":"Subterranean-special entrenched artillery branch."},{"id":"aerial_thunder_wing","name":"Aerial Thunder Wing","stage":"empire","class":"archetype_special","required_unlock":"unit:aerial_thunder_wing","archetype":"aerial","description":"Aerial-special rapid aerospace force."}],"solar":[{"id":"solar_explorer","name":"Explorer","stage":"solar","class":"explorer","required_unlock":"unit:explorer","description":"Surveys distant bodies and navigational routes."},{"id":"solar_transport","name":"Transport","stage":"solar","class":"transport","required_unlock":"unit:transport","description":"Moves cargo and personnel across the system."},{"id":"solar_colony_ship","name":"Colony Ship","stage":"solar","class":"colony_ship","required_unlock":"unit:colony_ship","description":"Carries a new off-world settlement."},{"id":"solar_construction_ship","name":"Construction Ship","stage":"solar","class":"construction_ship","required_unlock":"unit:construction_ship","description":"Builds stations and orbital projects."},{"id":"orbital_convoy","name":"Orbital Convoy","stage":"solar","class":"logistics","required_unlock":"unit:orbital_convoy","description":"Secures interplanetary supply and trade chains."},{"id":"heavy_freighter","name":"Heavy Freighter","stage":"solar","class":"trade","required_unlock":"unit:heavy_freighter","description":"Late-system logistics hauler that dramatically improves route throughput and credits."},{"id":"science_vessel","name":"Science Vessel","stage":"solar","class":"explorer","required_unlock":"unit:science_vessel","description":"Dedicated science craft for scans, anomalies, and deep-space research support."},{"id":"fleet_tender","name":"Fleet Tender","stage":"solar","class":"space_support","required_unlock":"unit:fleet_tender","description":"Refits and sustains combat fleets far from core stations."},{"id":"solar_corvette","name":"Corvette","stage":"solar","class":"space_military","required_unlock":"unit:corvette","description":"Fast escort and interception craft."},{"id":"solar_frigate","name":"Frigate","stage":"solar","class":"space_military","required_unlock":"unit:frigate","description":"General-purpose combat ship."},{"id":"solar_destroyer","name":"Destroyer","stage":"solar","class":"space_military","required_unlock":"unit:destroyer","description":"Heavier escort and strike vessel."},{"id":"solar_cruiser","name":"Cruiser","stage":"solar","class":"space_military","required_unlock":"unit:cruiser","description":"Mainline combat hull for system warfare."},{"id":"solar_battlecruiser","name":"Battlecruiser","stage":"solar","class":"space_military","required_unlock":"unit:battlecruiser","description":"High-end offensive warship."},{"id":"solar_battleship","name":"Battleship","stage":"solar","class":"space_military","required_unlock":"unit:battleship","description":"Capital ship for system dominance."},{"id":"solar_carrier","name":"Carrier","stage":"solar","class":"space_support","required_unlock":"unit:carrier","description":"Launch and support platform for distributed fleets."},{"id":"digital_missionary","name":"Digital Missionary","stage":"solar","class":"religious","required_unlock":"unit:digital_missionary","description":"Spreads belief through networked habitats and media systems."},{"id":"terrestrial_bastion_cruiser","name":"Terrestrial Bastion Cruiser","stage":"solar","class":"archetype_special","required_unlock":"unit:terrestrial_bastion_cruiser","archetype":"terrestrial","description":"Terrestrial-special armored orbital warship."},{"id":"aquatic_tidal_harvester","name":"Aquatic Tidal Harvester","stage":"solar","class":"archetype_special","required_unlock":"unit:aquatic_tidal_harvester","archetype":"aquatic","description":"Aquatic-special logistics and extraction ship."},{"id":"amphibious_habitat_lander","name":"Amphibious Habitat Lander","stage":"solar","class":"archetype_special","required_unlock":"unit:amphibious_habitat_lander","archetype":"amphibious","description":"Amphibious-special colonization and support ship."},{"id":"fungal_spore_ark","name":"Fungal Spore Ark","stage":"solar","class":"archetype_special","required_unlock":"unit:fungal_spore_ark","archetype":"fungal","description":"Fungal-special biosphere and adaptation vessel."},{"id":"arboreal_garden_ship","name":"Arboreal Garden Ship","stage":"solar","class":"archetype_special","required_unlock":"unit:arboreal_garden_ship","archetype":"arboreal","description":"Arboreal-special life-support and terraforming ship."},{"id":"subterranean_mantle_borer","name":"Subterranean Mantle Borer","stage":"solar","class":"archetype_special","required_unlock":"unit:subterranean_mantle_borer","archetype":"subterranean","description":"Subterranean-special mining and siege platform."},{"id":"aerial_void_lancer","name":"Aerial Void Lancer","stage":"solar","class":"archetype_special","required_unlock":"unit:aerial_void_lancer","archetype":"aerial","description":"Aerial-special high-speed strike craft."}],"galactic":[{"id":"galactic_explorer","name":"Explorer","stage":"galactic","class":"explorer","required_unlock":"unit:explorer","description":"Charts sectors and discovers interstellar opportunities."},{"id":"galactic_transport","name":"Transport","stage":"galactic","class":"transport","required_unlock":"unit:transport","description":"Moves populations and strategic goods between sectors."},{"id":"galactic_colony_ship","name":"Colony Ship","stage":"galactic","class":"colony_ship","required_unlock":"unit:colony_ship","description":"Seeds a new interstellar foothold."},{"id":"galactic_construction_ship","name":"Construction Ship","stage":"galactic","class":"construction_ship","required_unlock":"unit:construction_ship","description":"Builds lanes, hubs, and megastructure scaffolds."},{"id":"trade_freighter","name":"Trade Freighter","stage":"galactic","class":"trade","required_unlock":"unit:trade_freighter","description":"Carries high-value interstellar goods and underpins late-game economic dominance."},{"id":"supply_convoy","name":"Supply Convoy","stage":"galactic","class":"logistics","required_unlock":"unit:supply_convoy","description":"Sustains interstellar campaigns and frontier stability with strategic supply flow."},{"id":"science_vessel_galactic","name":"Science Vessel","stage":"galactic","class":"explorer","required_unlock":"unit:science_vessel","description":"Deep-space research craft that accelerates stellar insight and ascension discovery."},{"id":"diplomatic_courier","name":"Diplomatic Courier","stage":"galactic","class":"diplomatic","required_unlock":"unit:diplomatic_courier","description":"Fast diplomatic vessel for treaties, trust, and bloc coordination."},{"id":"galactic_frigate","name":"Frigate","stage":"galactic","class":"space_military","required_unlock":"unit:frigate","description":"Fast interstellar escort used to screen lanes and hunt raiders."},{"id":"galactic_destroyer","name":"Destroyer","stage":"galactic","class":"space_military","required_unlock":"unit:destroyer","description":"Hunter-killer warship for threat response across sectors."},{"id":"galactic_cruiser","name":"Cruiser","stage":"galactic","class":"space_military","required_unlock":"unit:cruiser","description":"Flexible line ship that anchors mid-tier interstellar task forces."},{"id":"galactic_battlecruiser","name":"Battlecruiser","stage":"galactic","class":"space_military","required_unlock":"unit:battlecruiser","description":"Fast capital ship for aggressive frontier escalation."},{"id":"galactic_carrier","name":"Carrier","stage":"galactic","class":"space_military","required_unlock":"unit:carrier","description":"Supports distributed interstellar fleets."},{"id":"galactic_battleship","name":"Battleship","stage":"galactic","class":"space_military","required_unlock":"unit:battleship","description":"Heavy line ship for fleet battles."},{"id":"titan","name":"Titan","stage":"galactic","class":"space_military","required_unlock":"unit:titan","description":"Super-heavy command ship."},{"id":"colossus","name":"Colossus","stage":"galactic","class":"space_military","required_unlock":"unit:colossus","description":"Extreme endgame force-projection vessel."},{"id":"juggernaut","name":"Juggernaut","stage":"galactic","class":"space_military","required_unlock":"unit:juggernaut","description":"Mobile fleet anchor and strategic weapons platform."},{"id":"psionic_emissary","name":"Psionic Emissary","stage":"galactic","class":"religious","required_unlock":"unit:psionic_emissary","description":"Late-game ascendant religious influence unit."},{"id":"terrestrial_worldbreaker_guard","name":"Terrestrial Worldbreaker Guard","stage":"galactic","class":"archetype_special","required_unlock":"unit:terrestrial_worldbreaker_guard","archetype":"terrestrial","description":"Terrestrial-special fortress-armada unit."},{"id":"aquatic_galewake_hosts","name":"Aquatic Galewake Hosts","stage":"galactic","class":"archetype_special","required_unlock":"unit:aquatic_galewake_hosts","archetype":"aquatic","description":"Aquatic-special trade and flow-control flotilla."},{"id":"amphibious_horizon_hosts","name":"Amphibious Horizon Hosts","stage":"galactic","class":"archetype_special","required_unlock":"unit:amphibious_horizon_hosts","archetype":"amphibious","description":"Amphibious-special flexible interstellar expeditionary arm."},{"id":"fungal_mycoweb_nexus","name":"Fungal Mycoweb Nexus","stage":"galactic","class":"archetype_special","required_unlock":"unit:fungal_mycoweb_nexus","archetype":"fungal","description":"Fungal-special distributed bio-network fleet core."},{"id":"arboreal_worldtree_envoys","name":"Arboreal Worldtree Envoys","stage":"galactic","class":"archetype_special","required_unlock":"unit:arboreal_worldtree_envoys","archetype":"arboreal","description":"Arboreal-special cultural integration armada."},{"id":"subterranean_singularity_drills","name":"Subterranean Singularity Drills","stage":"galactic","class":"archetype_special","required_unlock":"unit:subterranean_singularity_drills","archetype":"subterranean","description":"Subterranean-special megastructure assault fleet."},{"id":"aerial_starlance_hosts","name":"Aerial Starlance Hosts","stage":"galactic","class":"archetype_special","required_unlock":"unit:aerial_starlance_hosts","archetype":"aerial","description":"Aerial-special ultra-mobile deep-space strike armada."}]};
const LUXURY_DEFS={"tribal":[{"id":"furs","name":"Furs","cost":{"food":24,"material":18},"gain":{"happiness":3}},{"id":"dyes","name":"Dyes","cost":{"material":22,"knowledge":10},"gain":{"happiness":2,"culture":0.4}},{"id":"spices","name":"Spices","cost":{"food":30,"knowledge":8},"gain":{"happiness":4}}],"civilization":[{"id":"wine","name":"Wine","cost":{"food":40,"material":30},"gain":{"happiness":4,"culture":0.5}},{"id":"silk","name":"Silk","cost":{"material":46,"culture":18},"gain":{"happiness":5,"influence":0.4}},{"id":"gems","name":"Gems","cost":{"material":52,"knowledge":20},"gain":{"happiness":6}}],"empire":[{"id":"coffee","name":"Coffee","cost":{"food":60,"material":55},"gain":{"happiness":4,"knowledge":0.4}},{"id":"tobacco","name":"Tobacco","cost":{"food":48,"material":62},"gain":{"happiness":5,"influence":0.4}},{"id":"perfume","name":"Perfume","cost":{"material":72,"culture":30},"gain":{"happiness":6,"culture":0.5}}],"solar":[{"id":"holo_art","name":"Holo Art","cost":{"energy":90,"knowledge":70,"material":80},"gain":{"happiness":6,"culture":0.7}},{"id":"rare_crystals","name":"Rare Crystals","cost":{"energy":110,"material":95},"gain":{"happiness":7}},{"id":"leisure_bioforms","name":"Leisure Bioforms","cost":{"knowledge":90,"food":85},"gain":{"happiness":5,"food":0.8}}],"galactic":[{"id":"stellar_pearls","name":"Stellar Pearls","cost":{"energy":160,"material":140,"influence":60},"gain":{"happiness":8,"culture":0.8}},{"id":"dream_resin","name":"Dream Resin","cost":{"knowledge":170,"culture":90},"gain":{"happiness":9,"knowledge":0.9}},{"id":"psionic_relics","name":"Psionic Relics","cost":{"knowledge":150,"energy":130,"influence":80},"gain":{"happiness":10,"influence":0.8}}]};
const ARCHETYPE_SYSTEMS={"tribal":[{"id":"tribal_grounded_forge","name":"Grounded Forge Camps","stage":"tribal","category":"tech","description":"A terrestrial lineage turns stone and ore into reliable early infrastructure.","cost":{"material":28,"food":18,"knowledge":12},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.16,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.4,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["grounded"]},{"id":"tribal_tide_nets","name":"Tide Net Collectives","stage":"tribal","category":"tech","description":"Aquatic lineage creates tidal food routes and exchange webs.","cost":{"food":22,"material":16,"knowledge":10},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.18,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0.05,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.5,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aquatic"]},{"id":"tribal_marsh_paths","name":"Marsh Path Confederacy","stage":"tribal","category":"tech","description":"Amphibious lineage thrives on split-land logistics and wetland trade.","cost":{"food":20,"material":18,"influence":12},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.1,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0.12,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0.35,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["amphibious"]},{"id":"tribal_spore_circle","name":"Spore Circle","stage":"tribal","category":"tech","description":"Fungal lineage shares memory and knowledge through communal mycelial rites.","cost":{"knowledge":18,"food":18,"culture":10},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.18,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.35,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["fungal"]},{"id":"tribal_canopy_clans","name":"Canopy Clans","stage":"tribal","category":"tech","description":"Arboreal lineage establishes elevated settlements with stable food and culture.","cost":{"food":24,"culture":12,"material":14},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.1,"material":0,"knowledge":0,"culture":0.14,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.3,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["arboreal"]},{"id":"tribal_burrow_works","name":"Burrow Works","stage":"tribal","category":"tech","description":"Subterranean lineage digs protected storehouses and extraction tunnels.","cost":{"material":26,"food":16,"knowledge":10},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.18,"knowledge":0.06,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.45,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["subterranean"]},{"id":"tribal_sky_totems","name":"Sky Totems","stage":"tribal","category":"tech","description":"Aerial lineage uses signals, sightlines, and messenger routes to coordinate faster.","cost":{"culture":14,"influence":14,"knowledge":12},"bonus":{"manual":0.03,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.08,"culture":0,"faith":0,"influence":0.14,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aerial"]}],"civilization":[{"id":"civ_sun_gardens","name":"Sun Gardens","stage":"civilization","category":"tech","description":"Photosynthetic lineage supports cities with passive food and public beauty.","cost":{"food":60,"culture":28,"material":34},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.18,"material":0,"knowledge":0,"culture":0.1,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":1.0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["photosynthetic_lineage"]},{"id":"civ_venom_guild","name":"Venom Guild","stage":"civilization","category":"tech","description":"Poison lineage industrializes toxins into deterrence, medicine, and coercion.","cost":{"knowledge":52,"material":38,"influence":24},"bonus":{"manual":0.04,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0.12,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.5,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["poison_lineage"]},{"id":"civ_courier_roads","name":"Courier Roads","stage":"civilization","category":"tech","description":"Mobility lineage builds a faster internal transport and response network.","cost":{"material":46,"knowledge":32,"influence":20},"bonus":{"manual":0,"auto":0.04,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0,"culture":0,"faith":0,"influence":0.12,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["mobility_lineage"]},{"id":"civ_bastion_planning","name":"Bastion Planning","stage":"civilization","category":"civic","description":"Fortified lineage turns city layout into order, safety, and durable works.","cost":{"material":54,"culture":24,"influence":24},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":5,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.14,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["fortified_lineage"]},{"id":"civ_observatory_network","name":"Observatory Network","stage":"civilization","category":"tech","description":"Keen senses lineage builds observation towers and early warning systems.","cost":{"knowledge":60,"material":30,"influence":22},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.18,"culture":0,"faith":0,"influence":0.06,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["keen_senses"]}],"empire":[{"id":"empire_grounded_arsenals","name":"Grounded Arsenals","stage":"empire","category":"doctrine","description":"Terrestrial lineage favors fortified production zones and heavy logistics.","cost":{"material":120,"knowledge":48,"influence":30},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.16,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0.05},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["grounded"]},{"id":"empire_bluewater_convoys","name":"Bluewater Convoys","stage":"empire","category":"doctrine","description":"Aquatic lineage scales trade and food security across river and coastal corridors.","cost":{"food":90,"material":80,"influence":34},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.16,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0.08,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":1.2,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aquatic"]},{"id":"empire_estuary_administration","name":"Estuary Administration","stage":"empire","category":"doctrine","description":"Amphibious lineage turns mixed terrain into administrative flexibility.","cost":{"influence":42,"knowledge":55,"material":70},"bonus":{"manual":0,"auto":0.05,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.08,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0.14,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["amphibious"]},{"id":"empire_mycelial_archives","name":"Mycelial Archives","stage":"empire","category":"tech","description":"Fungal lineage creates resilient memory webs and distributed knowledge centers.","cost":{"knowledge":90,"material":65,"culture":35},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.18,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":1.0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["fungal"]},{"id":"empire_skywood_sanctuaries","name":"Skywood Sanctuaries","stage":"empire","category":"doctrine","description":"Arboreal lineage emphasizes social harmony, symbolic architecture, and food security.","cost":{"culture":42,"food":80,"material":58},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":6,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.1,"material":0,"knowledge":0,"culture":0.14,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["arboreal"]},{"id":"empire_deep_foundries","name":"Deep Foundries","stage":"empire","category":"tech","description":"Subterranean lineage industrializes underground extraction and heat use.","cost":{"material":110,"energy":36,"knowledge":44},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.18,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0.12},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["subterranean"]},{"id":"empire_aerostat_relays","name":"Aerostat Relays","stage":"empire","category":"tech","description":"Aerial lineage coordinates the empire through layered signal and courier networks.","cost":{"influence":40,"knowledge":56,"energy":28},"bonus":{"manual":0.03,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.1,"culture":0,"faith":0,"influence":0.14,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aerial"]}]};
const ARCHETYPE_UNITS={"tribal":[{"id":"tribal_phalanx","name":"Phalanx Guardians","stage":"tribal","class":"melee","description":"Disciplined shield line from a grounded lineage.","requireTraits":["grounded"],"strength":12,"bonus":{"resAdd":{"material":0.2},"happiness":1}},{"id":"tribal_reed_raiders","name":"Reed Canoe Raiders","stage":"tribal","class":"ranged","description":"Aquatic skirmishers with food-route raiding instincts.","requireTraits":["aquatic"],"strength":10,"bonus":{"resAdd":{"food":0.3,"influence":0.1}}},{"id":"tribal_marsh_wardens","name":"Marsh Wardens","stage":"tribal","class":"melee","description":"Amphibious defenders comfortable across land and water.","requireTraits":["amphibious"],"strength":11,"bonus":{"resAdd":{"food":0.2,"influence":0.2}}},{"id":"tribal_spore_druids","name":"Spore Druids","stage":"tribal","class":"religious","description":"Fungal ritual specialists who turn casualties into lessons.","requireTraits":["fungal"],"strength":7,"bonus":{"resAdd":{"knowledge":0.3},"happiness":2}},{"id":"tribal_canopy_hunters","name":"Canopy Hunters","stage":"tribal","class":"ranged","description":"Arboreal hunters using elevation and patience.","requireTraits":["arboreal"],"strength":10,"bonus":{"resAdd":{"culture":0.2,"food":0.2}}},{"id":"tribal_tunnel_sappers","name":"Tunnel Sappers","stage":"tribal","class":"melee","description":"Subterranean fighters that undermine enemy positions.","requireTraits":["subterranean"],"strength":13,"bonus":{"resAdd":{"material":0.3}}},{"id":"tribal_glider_scouts","name":"Glider Scouts","stage":"tribal","class":"recon","description":"Aerial messengers and scouts with superior route vision.","requireTraits":["aerial"],"strength":8,"bonus":{"resAdd":{"knowledge":0.2,"influence":0.2}}}],"civilization":[{"id":"civ_stone_legion","name":"Stone Legion","stage":"civilization","class":"melee","description":"Terrestrial heavy infantry suited for long campaigns.","requireTraits":["grounded"],"strength":20,"bonus":{"resAdd":{"material":0.4},"happiness":1}},{"id":"civ_tide_fleet","name":"Tide Fleet","stage":"civilization","class":"naval_ranged","description":"Aquatic naval projection and coastal enforcement.","requireTraits":["aquatic"],"strength":18,"bonus":{"resAdd":{"food":0.4,"influence":0.2}}},{"id":"civ_marsh_lancers","name":"Marsh Lancers","stage":"civilization","class":"heavy_cavalry","description":"Amphibious shock force built for wetlands and broken terrain.","requireTraits":["amphibious"],"strength":18,"bonus":{"resAdd":{"food":0.2,"influence":0.3}}},{"id":"civ_myco_savants","name":"Myco Savants","stage":"civilization","class":"support","description":"Fungal administrators converting conflict into learning.","requireTraits":["fungal"],"strength":9,"bonus":{"resAdd":{"knowledge":0.5},"happiness":2}},{"id":"civ_skywood_rangers","name":"Skywood Rangers","stage":"civilization","class":"ranged","description":"Arboreal rangers with deep forest logistics.","requireTraits":["arboreal"],"strength":17,"bonus":{"resAdd":{"culture":0.3,"food":0.2}}},{"id":"civ_burrow_artillery","name":"Burrow Artillery","stage":"civilization","class":"siege","description":"Subterranean siege crews specializing in collapse warfare.","requireTraits":["subterranean"],"strength":22,"bonus":{"resAdd":{"material":0.5}}},{"id":"civ_wind_knights","name":"Wind Knights","stage":"civilization","class":"heavy_cavalry","description":"Aerial cavalry doctrine built around speed and morale shock.","requireTraits":["aerial"],"strength":18,"bonus":{"resAdd":{"influence":0.3,"knowledge":0.2}}}]};
const SOCIETAL_SYSTEMS={"tribal":[{"id":"tribal_militarist_compact","name":"War Band Compact","stage":"tribal","category":"society","description":"The tribe organizes around raiding, martial prestige, and military readiness.","cost":{"food":22,"material":20,"influence":14},"bonus":{"manual":0,"auto":0,"carry":0.02,"happiness":-4,"resMult":{"food":0,"material":0.05,"knowledge":0,"culture":0,"faith":0,"influence":0.06,"energy":0,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0},"resAdd":{"material":0.4,"influence":0.2,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"knowledge":0,"culture":0,"faith":0,"energy":0}},"affinity":{},"traits":[{"id":"militarist_society","label":"Militarist society","bonus":{"military":0.12}}],"exclusive":["galactic_militarist_compact","galactic_mercantile_compact","galactic_isolationist_compact","galactic_developmental_compact"],"prereq":""},{"id":"tribal_mercantile_compact","name":"River Exchange Compact","stage":"tribal","category":"society","description":"The tribe favors trade routes, bargaining, and peaceful exchange.","cost":{"food":20,"material":16,"influence":12,"knowledge":10},"bonus":{"manual":0,"auto":0,"carry":0.02,"happiness":3,"resMult":{"food":0.08,"material":0.08,"knowledge":0.04,"culture":0,"faith":0,"influence":0.05,"energy":0,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0},"resAdd":{"food":0.3,"material":0.3,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"mercantile_society","label":"Mercantile society","bonus":{"trade":0.12}}],"exclusive":["galactic_militarist_compact","galactic_mercantile_compact","galactic_isolationist_compact","galactic_developmental_compact"],"prereq":""},{"id":"tribal_isolationist_compact","name":"Sacred Boundary Compact","stage":"tribal","category":"society","description":"The tribe turns inward, defending territory and minimizing risky external contact.","cost":{"food":20,"material":18,"faith":12,"culture":10},"bonus":{"manual":0,"auto":0,"carry":0.03,"happiness":6,"resMult":{"food":0.04,"material":0.06,"knowledge":0,"culture":0.05,"faith":0.08,"influence":-0.02,"energy":0,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0},"resAdd":{"food":0.2,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"isolationist_society","label":"Isolationist society","bonus":{"stability":0.12}}],"exclusive":["galactic_militarist_compact","galactic_mercantile_compact","galactic_isolationist_compact","galactic_developmental_compact"],"prereq":""},{"id":"tribal_developmental_compact","name":"Settlement Growth Compact","stage":"tribal","category":"society","description":"The tribe prioritizes stable growth, craft improvement, and material development.","cost":{"food":24,"material":22,"knowledge":12},"bonus":{"manual":0,"auto":0,"carry":0.03,"happiness":2,"resMult":{"food":0.08,"material":0.12,"knowledge":0.05,"culture":0.03,"faith":0,"influence":0,"energy":0,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0},"resAdd":{"material":0.4,"knowledge":0.2,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"developmental_society","label":"Developmental society","bonus":{"growth":0.12}}],"exclusive":["galactic_militarist_compact","galactic_mercantile_compact","galactic_isolationist_compact","galactic_developmental_compact"],"prereq":""}],"civilization":[{"id":"civilization_militarist_compact","name":"Militarist State Charter","stage":"civilization","category":"society","description":"Society bends institutions toward force projection, discipline, and deterrence.","cost":{"material":48,"influence":22,"knowledge":18},"bonus":{"manual":0,"auto":0.02,"carry":0.02,"happiness":-6,"resMult":{"material":0.06,"influence":0.1,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"knowledge":0,"culture":0,"faith":0,"energy":0},"resAdd":{"influence":0.4,"material":0.5,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"knowledge":0,"culture":0,"faith":0,"energy":0}},"affinity":{},"traits":[{"id":"militarist_society","label":"Militarist society","bonus":{"military":0.15}}],"exclusive":["civilization_mercantile_compact","civilization_isolationist_compact","civilization_developmental_compact"],"prereq":""},{"id":"civilization_mercantile_compact","name":"Mercantile Exchange Charter","stage":"civilization","category":"society","description":"Society bends institutions toward exchange, logistics, and wealth generation.","cost":{"material":44,"influence":18,"culture":18,"knowledge":16},"bonus":{"manual":0,"auto":0.03,"carry":0.02,"happiness":4,"resMult":{"food":0.04,"material":0.12,"knowledge":0.06,"culture":0.02,"faith":0,"influence":0.08,"energy":0,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0},"resAdd":{"material":0.6,"influence":0.25,"knowledge":0.2,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"culture":0,"faith":0,"energy":0}},"affinity":{},"traits":[{"id":"mercantile_society","label":"Mercantile society","bonus":{"trade":0.15}}],"exclusive":["civilization_militarist_compact","civilization_isolationist_compact","civilization_developmental_compact"],"prereq":""},{"id":"civilization_isolationist_compact","name":"Isolationist Security Charter","stage":"civilization","category":"society","description":"Society hardens inward, favoring stability, borders, and domestic cohesion.","cost":{"material":42,"faith":18,"culture":20,"influence":14},"bonus":{"manual":0,"auto":0.02,"carry":0.03,"happiness":8,"resMult":{"food":0.03,"material":0.05,"knowledge":0.02,"culture":0.08,"faith":0.08,"influence":-0.03,"energy":0,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0},"resAdd":{"culture":0.25,"faith":0.25,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"isolationist_society","label":"Isolationist society","bonus":{"stability":0.15}}],"exclusive":["civilization_militarist_compact","civilization_mercantile_compact","civilization_developmental_compact"],"prereq":""},{"id":"civilization_developmental_compact","name":"Development Charter","stage":"civilization","category":"society","description":"Society prioritizes productive growth, infrastructure, and long-term compounding.","cost":{"material":52,"knowledge":22,"culture":14},"bonus":{"manual":0,"auto":0.03,"carry":0.04,"happiness":3,"resMult":{"food":0.06,"material":0.12,"knowledge":0.08,"culture":0.03,"faith":0,"influence":0.03,"energy":0,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0},"resAdd":{"material":0.7,"knowledge":0.35,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"developmental_society","label":"Developmental society","bonus":{"growth":0.15}}],"exclusive":["civilization_militarist_compact","civilization_mercantile_compact","civilization_isolationist_compact"],"prereq":""}],"empire":[{"id":"empire_militarist_compact","name":"Militarist State Charter","stage":"empire","category":"society","description":"Society bends institutions toward force projection, discipline, and deterrence.","cost":{"material":80,"influence":34,"energy":18},"bonus":{"manual":0,"auto":0.02,"carry":0.02,"happiness":-6,"resMult":{"material":0.06,"influence":0.1,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"knowledge":0,"culture":0,"faith":0,"energy":0},"resAdd":{"influence":0.4,"material":0.5,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"knowledge":0,"culture":0,"faith":0,"energy":0}},"affinity":{},"traits":[{"id":"militarist_society","label":"Militarist society","bonus":{"military":0.15}}],"exclusive":["empire_mercantile_compact","empire_isolationist_compact","empire_developmental_compact"],"prereq":""},{"id":"empire_mercantile_compact","name":"Mercantile Exchange Charter","stage":"empire","category":"society","description":"Society bends institutions toward exchange, logistics, and wealth generation.","cost":{"material":70,"influence":22,"knowledge":28,"energy":12},"bonus":{"manual":0,"auto":0.03,"carry":0.02,"happiness":4,"resMult":{"food":0.04,"material":0.12,"knowledge":0.06,"culture":0.02,"faith":0,"influence":0.08,"energy":0,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0},"resAdd":{"material":0.6,"influence":0.25,"knowledge":0.2,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"culture":0,"faith":0,"energy":0}},"affinity":{},"traits":[{"id":"mercantile_society","label":"Mercantile society","bonus":{"trade":0.15}}],"exclusive":["empire_militarist_compact","empire_isolationist_compact","empire_developmental_compact"],"prereq":""},{"id":"empire_isolationist_compact","name":"Isolationist Security Charter","stage":"empire","category":"society","description":"Society hardens inward, favoring stability, borders, and domestic cohesion.","cost":{"material":68,"faith":22,"culture":24,"influence":18},"bonus":{"manual":0,"auto":0.02,"carry":0.03,"happiness":8,"resMult":{"food":0.03,"material":0.05,"knowledge":0.02,"culture":0.08,"faith":0.08,"influence":-0.03,"energy":0,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0},"resAdd":{"culture":0.25,"faith":0.25,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"isolationist_society","label":"Isolationist society","bonus":{"stability":0.15}}],"exclusive":["empire_militarist_compact","empire_mercantile_compact","empire_developmental_compact"],"prereq":""},{"id":"empire_developmental_compact","name":"Development Charter","stage":"empire","category":"society","description":"Society prioritizes productive growth, infrastructure, and long-term compounding.","cost":{"material":86,"knowledge":34,"energy":18},"bonus":{"manual":0,"auto":0.03,"carry":0.04,"happiness":3,"resMult":{"food":0.06,"material":0.12,"knowledge":0.08,"culture":0.03,"faith":0,"influence":0.03,"energy":0,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0},"resAdd":{"material":0.7,"knowledge":0.35,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"developmental_society","label":"Developmental society","bonus":{"growth":0.15}}],"exclusive":["empire_militarist_compact","empire_mercantile_compact","empire_isolationist_compact"],"prereq":""}],"solar":[{"id":"solar_militarist_compact","name":"Militarist State Charter","stage":"solar","category":"society","description":"Society bends institutions toward force projection, discipline, and deterrence.","cost":{"material":130,"influence":55,"energy":70},"bonus":{"manual":0,"auto":0.02,"carry":0.02,"happiness":-6,"resMult":{"material":0.06,"influence":0.1,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"knowledge":0,"culture":0,"faith":0,"energy":0},"resAdd":{"influence":0.4,"material":0.5,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"knowledge":0,"culture":0,"faith":0,"energy":0}},"affinity":{},"traits":[{"id":"militarist_society","label":"Militarist society","bonus":{"military":0.15}}],"exclusive":["solar_mercantile_compact","solar_isolationist_compact","solar_developmental_compact"],"prereq":""},{"id":"solar_mercantile_compact","name":"Mercantile Exchange Charter","stage":"solar","category":"society","description":"Society bends institutions toward exchange, logistics, and wealth generation.","cost":{"material":120,"knowledge":60,"energy":65,"influence":35},"bonus":{"manual":0,"auto":0.03,"carry":0.02,"happiness":4,"resMult":{"food":0.04,"material":0.12,"knowledge":0.06,"culture":0.02,"faith":0,"influence":0.08,"energy":0.05,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0},"resAdd":{"material":0.6,"influence":0.25,"knowledge":0.2,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"culture":0,"faith":0,"energy":0}},"affinity":{},"traits":[{"id":"mercantile_society","label":"Mercantile society","bonus":{"trade":0.15}}],"exclusive":["solar_militarist_compact","solar_isolationist_compact","solar_developmental_compact"],"prereq":""},{"id":"solar_isolationist_compact","name":"Isolationist Security Charter","stage":"solar","category":"society","description":"Society hardens inward, favoring stability, borders, and domestic cohesion.","cost":{"material":110,"culture":55,"knowledge":40,"energy":60},"bonus":{"manual":0,"auto":0.02,"carry":0.03,"happiness":8,"resMult":{"food":0.03,"material":0.05,"knowledge":0.02,"culture":0.08,"faith":0.08,"influence":-0.03,"energy":0.04,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0},"resAdd":{"culture":0.25,"faith":0.25,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"isolationist_society","label":"Isolationist society","bonus":{"stability":0.15}}],"exclusive":["solar_militarist_compact","solar_mercantile_compact","solar_developmental_compact"],"prereq":""},{"id":"solar_developmental_compact","name":"Development Charter","stage":"solar","category":"society","description":"Society prioritizes productive growth, infrastructure, and long-term compounding.","cost":{"material":140,"knowledge":70,"energy":75},"bonus":{"manual":0,"auto":0.03,"carry":0.04,"happiness":3,"resMult":{"food":0.06,"material":0.12,"knowledge":0.08,"culture":0.03,"faith":0,"influence":0.03,"energy":0.08,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0},"resAdd":{"material":0.7,"knowledge":0.35,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"developmental_society","label":"Developmental society","bonus":{"growth":0.15}}],"exclusive":["solar_militarist_compact","solar_mercantile_compact","solar_isolationist_compact"],"prereq":""}],"galactic":[{"id":"galactic_militarist_compact","name":"Militarist State Charter","stage":"galactic","category":"society","description":"Society bends institutions toward force projection, discipline, and deterrence.","cost":{"material":220,"influence":90,"energy":120,"knowledge":80},"bonus":{"manual":0,"auto":0.02,"carry":0.02,"happiness":-6,"resMult":{"material":0.06,"influence":0.1,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"knowledge":0,"culture":0,"faith":0,"energy":0},"resAdd":{"influence":0.4,"material":0.5,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"knowledge":0,"culture":0,"faith":0,"energy":0}},"affinity":{},"traits":[{"id":"militarist_society","label":"Militarist society","bonus":{"military":0.15}}],"exclusive":["galactic_mercantile_compact","galactic_isolationist_compact","galactic_developmental_compact"],"prereq":""},{"id":"galactic_mercantile_compact","name":"Mercantile Exchange Charter","stage":"galactic","category":"society","description":"Society bends institutions toward exchange, logistics, and wealth generation.","cost":{"material":180,"knowledge":120,"energy":100,"influence":70},"bonus":{"manual":0,"auto":0.03,"carry":0.02,"happiness":4,"resMult":{"food":0.04,"material":0.12,"knowledge":0.06,"culture":0.02,"faith":0,"influence":0.08,"energy":0.05,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0},"resAdd":{"material":0.6,"influence":0.25,"knowledge":0.2,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"culture":0,"faith":0,"energy":0}},"affinity":{},"traits":[{"id":"mercantile_society","label":"Mercantile society","bonus":{"trade":0.15}}],"exclusive":["galactic_militarist_compact","galactic_isolationist_compact","galactic_developmental_compact"],"prereq":""},{"id":"galactic_isolationist_compact","name":"Isolationist Security Charter","stage":"galactic","category":"society","description":"Society hardens inward, favoring stability, borders, and domestic cohesion.","cost":{"material":170,"culture":100,"knowledge":90,"energy":90},"bonus":{"manual":0,"auto":0.02,"carry":0.03,"happiness":8,"resMult":{"food":0.03,"material":0.05,"knowledge":0.02,"culture":0.08,"faith":0.08,"influence":-0.03,"energy":0.04,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0},"resAdd":{"culture":0.25,"faith":0.25,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"isolationist_society","label":"Isolationist society","bonus":{"stability":0.15}}],"exclusive":["galactic_militarist_compact","galactic_mercantile_compact","galactic_developmental_compact"],"prereq":""},{"id":"galactic_developmental_compact","name":"Development Charter","stage":"galactic","category":"society","description":"Society prioritizes productive growth, infrastructure, and long-term compounding.","cost":{"material":230,"knowledge":130,"energy":110,"culture":70},"bonus":{"manual":0,"auto":0.03,"carry":0.04,"happiness":3,"resMult":{"food":0.06,"material":0.12,"knowledge":0.08,"culture":0.03,"faith":0,"influence":0.03,"energy":0.08,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0},"resAdd":{"material":0.7,"knowledge":0.35,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[{"id":"developmental_society","label":"Developmental society","bonus":{"growth":0.15}}],"exclusive":["galactic_militarist_compact","galactic_mercantile_compact","galactic_isolationist_compact"],"prereq":""}]};
const SOCIETAL_UNITS={"tribal":[{"id":"tribal_warband","name":"Warband Cohort","stage":"tribal","class":"melee","description":"Militarist tribes form organized warbands with strong rival deterrence.","cost":{"food":18,"material":20,"influence":12},"strength":8,"requireTraits":["militarist_society"],"bonus":{"happiness":-0.4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"influence":0.1,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"energy":0}}},{"id":"tribal_caravan","name":"River Caravan","stage":"tribal","class":"trade","description":"Mercantile tribes field caravans that turn peace into throughput.","cost":{"food":14,"material":16,"knowledge":10},"strength":2,"requireTraits":["mercantile_society"],"bonus":{"happiness":0.2,"resMult":{"material":0.03,"food":0.02,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"tribal_wardens","name":"Boundary Wardens","stage":"tribal","class":"ranged","description":"Isolationist tribes rely on local wardens and defensive patrols.","cost":{"food":16,"material":18,"faith":10},"strength":6,"requireTraits":["isolationist_society"],"bonus":{"happiness":0.1,"resMult":{"food":0.02,"material":0.02,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"tribal_builders","name":"Settlement Builders","stage":"tribal","class":"support","description":"Developmental tribes mobilize labor into compounding settlement growth.","cost":{"food":16,"material":16,"knowledge":10},"strength":1,"requireTraits":["developmental_society"],"bonus":{"happiness":0.2,"resMult":{"material":0.04,"knowledge":0.02,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}}],"civilization":[{"id":"civ_legions","name":"Legion Columns","stage":"civilization","class":"melee","description":"Militarist states maintain disciplined infantry and border force.","cost":{"material":28,"knowledge":14,"influence":18},"strength":12,"requireTraits":["militarist_society"],"bonus":{"happiness":-0.5,"resMult":{"influence":0.03,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"civ_merchants","name":"Merchant Fleets","stage":"civilization","class":"trade","description":"Mercantile states use trade fleets and broker guilds.","cost":{"material":26,"knowledge":16,"culture":12},"strength":2,"requireTraits":["mercantile_society"],"bonus":{"happiness":0.3,"resMult":{"material":0.04,"influence":0.03,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"knowledge":0,"culture":0,"faith":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"civ_guards","name":"Wall Guards","stage":"civilization","class":"ranged","description":"Isolationist states invest in reliable defensive garrisons.","cost":{"material":24,"faith":12,"culture":12},"strength":9,"requireTraits":["isolationist_society"],"bonus":{"happiness":0.1,"resMult":{"culture":0.02,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"civ_engineers","name":"Civic Engineers","stage":"civilization","class":"support","description":"Developmental states convert labor into roads, storage, and planning.","cost":{"material":30,"knowledge":18,"influence":10},"strength":1,"requireTraits":["developmental_society"],"bonus":{"happiness":0.2,"resMult":{"material":0.05,"knowledge":0.03,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}}],"empire":[{"id":"empire_armies","name":"Field Armies","stage":"empire","class":"heavy_cavalry","description":"Militarist empires sustain expeditionary armies and coercive power.","cost":{"material":40,"energy":16,"influence":22},"strength":16,"requireTraits":["militarist_society"],"bonus":{"happiness":-0.6,"resMult":{"influence":0.04,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"empire_consortium","name":"Trade Consortium","stage":"empire","class":"trade","description":"Mercantile empires dominate long-distance trade corridors.","cost":{"material":34,"knowledge":24,"influence":16},"strength":3,"requireTraits":["mercantile_society"],"bonus":{"happiness":0.3,"resMult":{"material":0.05,"energy":0.03,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"knowledge":0,"culture":0,"faith":0,"influence":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"empire_watch","name":"Imperial Watch","stage":"empire","class":"ranged","description":"Isolationist empires rely on strong interior security and frontier patrols.","cost":{"material":36,"faith":18,"culture":16},"strength":12,"requireTraits":["isolationist_society"],"bonus":{"happiness":0.2,"resMult":{"culture":0.03,"faith":0.03,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"empire_corps","name":"Development Corps","stage":"empire","class":"support","description":"Developmental empires expand through roads, utilities, and planned growth.","cost":{"material":42,"knowledge":24,"energy":12},"strength":2,"requireTraits":["developmental_society"],"bonus":{"happiness":0.2,"resMult":{"material":0.05,"knowledge":0.04,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}}],"solar":[{"id":"solar_battlefleet","name":"Battlefleet","stage":"solar","class":"destroyer","description":"Militarist solar civilizations field power-projection fleets.","cost":{"material":90,"energy":70,"knowledge":40,"influence":30},"strength":20,"requireTraits":["militarist_society"],"bonus":{"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"solar_trade_web","name":"Trade Web Convoys","stage":"solar","class":"trade","description":"Mercantile solar civilizations prioritize convoy security and exchange.","cost":{"material":82,"energy":62,"knowledge":44},"strength":4,"requireTraits":["mercantile_society"],"bonus":{"happiness":0.3,"resMult":{"material":0.05,"energy":0.04,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"knowledge":0,"culture":0,"faith":0,"influence":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"solar_shield_net","name":"Shield Net Patrols","stage":"solar","class":"escort","description":"Isolationist solar civilizations invest in defensive screens.","cost":{"material":84,"energy":68,"culture":28},"strength":16,"requireTraits":["isolationist_society"],"bonus":{"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"solar_engineers","name":"Orbital Engineering Corps","stage":"solar","class":"construction_ship","description":"Developmental solar civilizations scale infrastructure aggressively.","cost":{"material":88,"energy":72,"knowledge":52},"strength":2,"requireTraits":["developmental_society"],"bonus":{"happiness":0.2,"resMult":{"material":0.04,"knowledge":0.03,"energy":0.03,"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"culture":0,"faith":0,"influence":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}}]};
const SPECIAL_AUTOMATION={"tribal":[{"id":"tribal_war_drums","name":"War Drum Circles","stage":"tribal","bucket":"culture","cost":{"material":20,"food":16,"influence":12},"effects":{"influence":1.2,"food":0.4},"unlockAt":{"influence":10},"requireTraits":["militarist_society"],"description":"Militarist tribes centralize warriors and prestige rituals."},{"id":"tribal_trade_bazaars","name":"Exchange Bazaars","stage":"tribal","bucket":"craft","cost":{"material":18,"food":14,"knowledge":10},"effects":{"material":1.0,"food":0.8,"influence":0.6},"unlockAt":{"knowledge":8},"requireTraits":["mercantile_society"],"description":"Mercantile tribes turn barter into stable throughput."},{"id":"tribal_sanctuaries","name":"Boundary Sanctuaries","stage":"tribal","bucket":"culture","cost":{"material":16,"faith":10,"culture":10},"effects":{"faith":1.0,"culture":0.8,"food":0.3},"unlockAt":{"faith":6},"requireTraits":["isolationist_society"],"description":"Isolationist tribes reinforce identity and inner cohesion."},{"id":"tribal_granaries","name":"Communal Granaries","stage":"tribal","bucket":"food","cost":{"material":22,"food":12,"knowledge":8},"effects":{"food":1.6,"material":0.4},"unlockAt":{"material":10},"requireTraits":["developmental_society"],"description":"Developmental tribes invest in predictable settlement growth."},{"id":"tribal_canopy_roosts","name":"Canopy Roosts","stage":"tribal","bucket":"culture","cost":{"food":16,"material":14},"effects":{"culture":0.8,"knowledge":0.4},"unlockAt":{"food":10},"requireTraits":["arboreal"],"description":"Arboreal lineages build upward for safety and culture."},{"id":"tribal_tide_pens","name":"Tide Pens","stage":"tribal","bucket":"food","cost":{"food":14,"material":12},"effects":{"food":1.4,"influence":0.3},"unlockAt":{"food":8},"requireTraits":["aquatic"],"description":"Aquatic lineages stabilize food through controlled water systems."},{"id":"tribal_burrow_storehouses","name":"Burrow Storehouses","stage":"tribal","bucket":"craft","cost":{"material":18,"food":10},"effects":{"material":1.3,"food":0.4},"unlockAt":{"material":8},"requireTraits":["subterranean"],"description":"Subterranean lineages excel at protected storage and extraction."},{"id":"tribal_raider_nests","name":"Raider Nests","stage":"tribal","bucket":"culture","cost":{"food":18,"material":16,"influence":12},"effects":{"influence":1.4,"material":0.5},"unlockAt":{"influence":10},"requireTraits":["aerial","militarist_society"],"description":"Aerial militarists weaponize mobility into fast pressure."}],"civilization":[{"id":"civ_barracks_network","name":"Barracks Network","stage":"civilization","bucket":"culture","cost":{"material":40,"influence":18},"effects":{"influence":1.8,"material":0.6},"unlockAt":{"influence":16},"requireTraits":["militarist_society"],"description":"Militarist states centralize training and force projection."},{"id":"civ_merchant_halls","name":"Merchant Halls","stage":"civilization","bucket":"economy","cost":{"material":42,"knowledge":14},"effects":{"material":1.8,"influence":1.0},"unlockAt":{"material":24},"requireTraits":["mercantile_society"],"description":"Mercantile states compound trade and civic wealth."},{"id":"civ_inner_walls","name":"Inner Wall Districts","stage":"civilization","bucket":"culture","cost":{"material":36,"culture":16,"faith":12},"effects":{"culture":1.2,"faith":1.0},"unlockAt":{"culture":12},"requireTraits":["isolationist_society"],"description":"Isolationist states harden their urban core and public order."},{"id":"civ_civic_works","name":"Civic Works Bureau","stage":"civilization","bucket":"knowledge","cost":{"material":48,"knowledge":18},"effects":{"knowledge":1.6,"material":0.8},"unlockAt":{"knowledge":18},"requireTraits":["developmental_society"],"description":"Developmental states scale by administration and infrastructure."},{"id":"civ_canopy_markets","name":"Canopy Markets","stage":"civilization","bucket":"economy","cost":{"material":36,"culture":14},"effects":{"material":1.1,"culture":0.9,"food":0.5},"unlockAt":{"culture":10},"requireTraits":["arboreal","mercantile_society"],"description":"Arboreal merchants turn vertical settlements into trade hubs."},{"id":"civ_delta_ports","name":"Delta Ports","stage":"civilization","bucket":"economy","cost":{"material":38,"food":18},"effects":{"food":1.0,"material":1.2,"influence":0.8},"unlockAt":{"food":18},"requireTraits":["aquatic","mercantile_society"],"description":"Aquatic merchants dominate river mouths and harbor exchange."},{"id":"civ_deep_foundries","name":"Deep Foundries","stage":"civilization","bucket":"knowledge","cost":{"material":44,"knowledge":16},"effects":{"material":1.5,"knowledge":0.7},"unlockAt":{"knowledge":14},"requireTraits":["subterranean","developmental_society"],"description":"Subterranean developmental states industrialize from below."},{"id":"civ_spore_cloisters","name":"Spore Cloisters","stage":"civilization","bucket":"culture","cost":{"material":34,"faith":16},"effects":{"knowledge":1.0,"faith":1.0,"culture":0.5},"unlockAt":{"faith":10},"requireTraits":["fungal","isolationist_society"],"description":"Fungal isolationists grow inward through cloistered knowledge."},{"id":"civ_sky_yards","name":"Sky Yards","stage":"civilization","bucket":"culture","cost":{"material":40,"influence":18},"effects":{"influence":1.4,"knowledge":0.6},"unlockAt":{"influence":14},"requireTraits":["aerial","militarist_society"],"description":"Aerial militarists organize altitude, scouting, and raid pressure."},{"id":"civ_marsh_canals","name":"Marsh Canals","stage":"civilization","bucket":"food","cost":{"material":34,"food":16},"effects":{"food":1.3,"material":0.8},"unlockAt":{"food":16},"requireTraits":["amphibious","developmental_society"],"description":"Amphibious developmental states reshape wetlands into productive canals."}],"empire":[{"id":"empire_war_ministry","name":"War Ministry","stage":"empire","bucket":"identity","cost":{"material":70,"influence":30,"energy":12},"effects":{"influence":2.2,"material":0.8},"unlockAt":{"influence":24},"requireTraits":["militarist_society"],"description":"Militarist empires institutionalize command and coercion."},{"id":"empire_exchange_ledger","name":"Interstate Exchange Ledger","stage":"empire","bucket":"infrastructure","cost":{"material":68,"knowledge":26,"influence":18},"effects":{"material":2.0,"knowledge":0.8,"energy":0.4},"unlockAt":{"knowledge":24},"requireTraits":["mercantile_society"],"description":"Mercantile empires optimize logistics across long-distance exchange."},{"id":"empire_frontier_bastions","name":"Frontier Bastions","stage":"empire","bucket":"identity","cost":{"material":66,"faith":20,"culture":18},"effects":{"faith":1.4,"culture":1.2,"influence":0.8},"unlockAt":{"culture":14},"requireTraits":["isolationist_society"],"description":"Isolationist empires concentrate on secure frontiers and internal cohesion."},{"id":"empire_planning_commission","name":"Planning Commission","stage":"empire","bucket":"knowledge","cost":{"material":74,"knowledge":30,"energy":12},"effects":{"knowledge":1.8,"material":1.2},"unlockAt":{"knowledge":28},"requireTraits":["developmental_society"],"description":"Developmental empires expand by planned compounding."},{"id":"empire_canopy_convoys","name":"Canopy Convoys","stage":"empire","bucket":"infrastructure","cost":{"material":64,"culture":18,"influence":18},"effects":{"material":1.4,"culture":0.8,"influence":0.9},"unlockAt":{"influence":18},"requireTraits":["arboreal","mercantile_society"],"description":"Arboreal merchants build trade webs across layered routes."},{"id":"empire_reef_arsenals","name":"Reef Arsenals","stage":"empire","bucket":"energy","cost":{"material":70,"energy":20,"influence":20},"effects":{"material":1.5,"energy":1.0,"influence":1.0},"unlockAt":{"energy":14},"requireTraits":["aquatic","militarist_society"],"description":"Aquatic militarists convert naval geography into power."},{"id":"empire_deep_relay_grid","name":"Deep Relay Grid","stage":"empire","bucket":"infrastructure","cost":{"material":72,"knowledge":24},"effects":{"material":1.6,"knowledge":0.8,"energy":0.5},"unlockAt":{"material":30},"requireTraits":["subterranean","developmental_society"],"description":"Subterranean developmental empires build resilient deep networks."},{"id":"empire_spore_archives","name":"Spore Archives","stage":"empire","bucket":"knowledge","cost":{"material":60,"faith":18,"knowledge":24},"effects":{"knowledge":1.5,"faith":0.8,"culture":0.6},"unlockAt":{"knowledge":20},"requireTraits":["fungal","isolationist_society"],"description":"Fungal isolationists preserve inward depth and memory."},{"id":"empire_aerie_signal_towers","name":"Aerie Signal Towers","stage":"empire","bucket":"identity","cost":{"material":62,"influence":24,"energy":10},"effects":{"influence":1.6,"knowledge":0.7},"unlockAt":{"influence":20},"requireTraits":["aerial","militarist_society"],"description":"Aerial militarists turn height into imperial coordination."},{"id":"empire_marsh_works","name":"Marsh Works Bureau","stage":"empire","bucket":"infrastructure","cost":{"material":66,"food":18,"knowledge":20},"effects":{"food":1.0,"material":1.2,"knowledge":0.6},"unlockAt":{"food":18},"requireTraits":["amphibious","mercantile_society"],"description":"Amphibious merchants organize marsh industry and trade arteries."}]};
const TRAIT_CHAIN_SYSTEMS={"creature":[{"id":"creature_photoskin","name":"Photoskin Membranes","stage":"creature","category":"survival","description":"Photosynthetic lineages shift toward passive food and stability loops.","cost":{"food":28,"knowledge":18,"evolution":12},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.12,"material":0,"knowledge":0,"culture":0.04,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.4,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["photosynthetic_lineage"]},{"id":"creature_venom_sacs","name":"Venom Sacs","stage":"creature","category":"combat","description":"Poison lineages weaponize biochemistry into predation and rival pressure.","cost":{"food":24,"knowledge":20,"evolution":14},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.08,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0.06,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0.25,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["poison_lineage"]},{"id":"creature_shell_forts","name":"Shell Fortifications","stage":"creature","category":"survival","description":"Fortified lineages reduce environmental losses and stabilize nesting.","cost":{"food":30,"material":18,"knowledge":12},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.06,"material":0,"knowledge":0,"culture":0.05,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["fortified_lineage"]},{"id":"creature_sense_network","name":"Sense Network","stage":"creature","category":"physical","description":"Keen-sense lineages map terrain and prey more efficiently.","cost":{"food":22,"knowledge":24,"evolution":10},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.14,"culture":0,"faith":0,"influence":0.04,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.35,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["keen_senses"]}],"civilization":[{"id":"civ_sun_gardens","name":"Sun Gardens","stage":"civilization","category":"tech","description":"Photosynthetic lineage builds living agricultural districts with cultural spillover.","cost":{"material":60,"knowledge":30,"culture":22},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.14,"material":0,"knowledge":0,"culture":0.08,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.7,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["photosynthetic_lineage"]},{"id":"civ_poison_guilds","name":"Poison Guilds","stage":"civilization","category":"tech","description":"Poison lineages cultivate controlled biochemical deterrence and espionage.","cost":{"material":58,"knowledge":36,"influence":24},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.06,"culture":0,"faith":0,"influence":0.1,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.3,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["poison_lineage"]},{"id":"civ_bastion_codes","name":"Bastion Codes","stage":"civilization","category":"civic","description":"Fortified lineages organize urban defense and civic order around hard security.","cost":{"material":64,"culture":24,"influence":26},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0,"culture":0.06,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["fortified_lineage"]},{"id":"civ_observer_colleges","name":"Observer Colleges","stage":"civilization","category":"tech","description":"Keen-sense lineages formalize surveying, astronomy, and long-range intelligence.","cost":{"material":54,"knowledge":40,"culture":18},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.16,"culture":0,"faith":0,"influence":0.05,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.6,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["keen_senses"]},{"id":"civ_rapid_roads","name":"Rapid Roads","stage":"civilization","category":"tech","description":"Mobile lineages integrate fast courier and maneuver networks.","cost":{"material":62,"knowledge":28,"influence":22},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0,"culture":0,"faith":0,"influence":0.08,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.2,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["mobility_lineage"]}],"empire":[{"id":"empire_solar_biospheres","name":"Solar Biospheres","stage":"empire","category":"tech","description":"Photosynthetic lineages scale biomass and morale through engineered green infrastructure.","cost":{"material":110,"knowledge":58,"energy":26},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.16,"material":0,"knowledge":0,"culture":0.08,"faith":0,"influence":0,"energy":0.04},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["photosynthetic_lineage"]},{"id":"empire_toxin_bureaus","name":"Toxin Bureaus","stage":"empire","category":"edict","description":"Poison lineages formalize deterrence, covert policing, and denial capabilities.","cost":{"material":96,"knowledge":64,"influence":34},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.07,"culture":0,"faith":0,"influence":0.12,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.5,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["poison_lineage"]},{"id":"empire_fortress_grid","name":"Fortress Grid","stage":"empire","category":"doctrine","description":"Fortified lineages create depth defense and resilient frontier administration.","cost":{"material":118,"culture":38,"influence":42},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.1,"knowledge":0,"culture":0.07,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["fortified_lineage"]},{"id":"empire_sensor_net","name":"Sensor Net","stage":"empire","category":"tech","description":"Keen-sense lineages connect long-range warning and intelligence systems across the state.","cost":{"material":102,"knowledge":72,"energy":24},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.18,"culture":0,"faith":0,"influence":0.06,"energy":0.04},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.8,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["keen_senses"]},{"id":"empire_rapid_response","name":"Rapid Response Commands","stage":"empire","category":"edict","description":"Mobile lineages structure empire logistics around speed and redeployment.","cost":{"material":104,"energy":34,"influence":38},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0,"culture":0,"faith":0,"influence":0.08,"energy":0.04},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0.4,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["mobility_lineage"]}],"solar":[{"id":"solar_heliostat_ecologies","name":"Heliostat Ecologies","stage":"solar","category":"policy","description":"Photosynthetic lineage uses stellar-scale light management to support colonies.","cost":{"material":155,"energy":120,"knowledge":90},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.18,"material":0,"knowledge":0,"culture":0.06,"faith":0,"influence":0,"energy":0.06},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.9,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["photosynthetic_lineage"]},{"id":"solar_venom_security","name":"Venom Security Webs","stage":"solar","category":"policy","description":"Poison lineage turns covert bioweapon doctrine into inter-colony deterrence.","cost":{"material":145,"energy":130,"knowledge":95,"influence":50},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.08,"culture":0,"faith":0,"influence":0.12,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0.3}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["poison_lineage"]},{"id":"solar_bulwark_shells","name":"Bulwark Shells","stage":"solar","category":"policy","description":"Fortified lineage encloses colonies in resilient defensive shellworks.","cost":{"material":165,"energy":140,"culture":80},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":5,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0,"culture":0.08,"faith":0,"influence":0,"energy":0.05},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["fortified_lineage"]},{"id":"solar_survey_mesh","name":"Survey Mesh","stage":"solar","category":"tech","description":"Keen-sense lineage automates exploration and orbital forecasting.","cost":{"material":150,"energy":135,"knowledge":110},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.2,"culture":0,"faith":0,"influence":0.06,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":1.0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["keen_senses"]}],"galactic":[{"id":"galactic_starlight_ecumene","name":"Starlight Ecumene","stage":"galactic","category":"alignment","description":"Photosynthetic lineage turns light-rich settlement into a civilizational advantage.","cost":{"material":260,"energy":210,"knowledge":140,"culture":120},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":6,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.2,"material":0,"knowledge":0,"culture":0.1,"faith":0,"influence":0,"energy":0.06},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["photosynthetic_lineage"]},{"id":"galactic_deterrence_spires","name":"Deterrence Spires","stage":"galactic","category":"alignment","description":"Poison lineage builds a feared deterrence regime against rivals.","cost":{"material":250,"energy":220,"knowledge":150,"influence":130},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.08,"culture":0,"faith":0,"influence":0.14,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.8,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["poison_lineage"]},{"id":"galactic_bulwark_network","name":"Bulwark Network","stage":"galactic","category":"megastructure","description":"Fortified lineage hardens infrastructure against fragmentation and raids.","cost":{"material":280,"energy":230,"culture":140,"influence":100},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":6,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.1,"knowledge":0,"culture":0.08,"faith":0,"influence":0,"energy":0.06},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["fortified_lineage"]},{"id":"galactic_prediction_lattice","name":"Prediction Lattice","stage":"galactic","category":"tech","description":"Keen-sense lineage scales prediction and response across the whole polity.","cost":{"material":240,"energy":210,"knowledge":190,"influence":90},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.22,"culture":0,"faith":0,"influence":0.08,"energy":0.04},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":1.2,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["keen_senses"]},{"id":"galactic_mobility_corridor","name":"Mobility Corridor","stage":"galactic","category":"ascension","description":"Mobile lineage integrates fast strategic corridors into galactic governance.","cost":{"material":250,"energy":240,"knowledge":150,"influence":120},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.06,"knowledge":0,"culture":0,"faith":0,"influence":0.1,"energy":0.08},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0.7,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["mobility_lineage"]}]};
const TRAIT_CHAIN_UNITS={"empire":[{"id":"empire_venom_legion","name":"Venom Legion","stage":"empire","class":"ranged","description":"Poison lineages field disciplined toxic warfare units for coercive pressure.","cost":{"material":54,"energy":18,"knowledge":20,"influence":18},"strength":16,"requireTraits":["poison_lineage","militarist_society"],"bonus":{"happiness":-0.4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0.03,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"empire_bulwark_guard","name":"Bulwark Guard","stage":"empire","class":"melee","description":"Fortified lineages excel at hard defensive formations.","cost":{"material":50,"culture":16,"influence":18},"strength":15,"requireTraits":["fortified_lineage","isolationist_society"],"bonus":{"happiness":0.2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.02,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"empire_pathfinders","name":"Pathfinder Service","stage":"empire","class":"recon","description":"Keen-sense lineages turn scouting and intelligence into state power.","cost":{"material":44,"knowledge":26,"influence":16},"strength":9,"requireTraits":["keen_senses"],"bonus":{"happiness":0.1,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.03,"culture":0,"faith":0,"influence":0.02,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}}],"solar":[{"id":"solar_sunward_colonists","name":"Sunward Colonists","stage":"solar","class":"colony_ship","description":"Photosynthetic lineages colonize efficiently in light-rich environments.","cost":{"material":95,"energy":75,"knowledge":48},"strength":2,"requireTraits":["photosynthetic_lineage","developmental_society"],"bonus":{"happiness":0.3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.03,"material":0,"knowledge":0,"culture":0.02,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"solar_venom_raiders","name":"Venom Raiders","stage":"solar","class":"frigate","description":"Poison lineages and militarist doctrine produce feared fast raiders.","cost":{"material":102,"energy":82,"knowledge":54,"influence":32},"strength":20,"requireTraits":["poison_lineage","militarist_society","mobility_lineage"],"bonus":{"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"solar_bulwark_screen","name":"Bulwark Screen","stage":"solar","class":"defense_platform","description":"Fortified lineages anchor solar defenses around defensive doctrine.","cost":{"material":108,"energy":90,"culture":34},"strength":18,"requireTraits":["fortified_lineage","isolationist_society"],"bonus":{"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"solar_survey_wings","name":"Survey Wings","stage":"solar","class":"survey","description":"Keen-sense lineages automate exploration and route control.","cost":{"material":92,"energy":80,"knowledge":66},"strength":6,"requireTraits":["keen_senses"],"bonus":{"happiness":0.1,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.03,"culture":0,"faith":0,"influence":0.02,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}}],"galactic":[{"id":"galactic_starlight_convoys","name":"Starlight Convoys","stage":"galactic","class":"trade","description":"Photosynthetic mercantile lineages excel at abundant soft-power trade.","cost":{"material":180,"energy":140,"knowledge":100,"culture":90},"strength":4,"requireTraits":["photosynthetic_lineage","mercantile_society"],"bonus":{"happiness":0.3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.04,"knowledge":0,"culture":0.03,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"galactic_deterrence_fleet","name":"Deterrence Fleet","stage":"galactic","class":"battleship","description":"Poison militarist lineages project fear and hard military power.","cost":{"material":220,"energy":180,"knowledge":120,"influence":80},"strength":28,"requireTraits":["poison_lineage","militarist_society"],"bonus":{"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"galactic_bastion_ring","name":"Bastion Ring","stage":"galactic","class":"defense_platform","description":"Fortified isolationist lineages create nearly unbreakable perimeter defense.","cost":{"material":210,"energy":170,"culture":110},"strength":24,"requireTraits":["fortified_lineage","isolationist_society"],"bonus":{"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"galactic_oracle_corps","name":"Oracle Corps","stage":"galactic","class":"science","description":"Keen-sense lineages scale foresight and analysis into galactic command.","cost":{"material":170,"energy":150,"knowledge":150,"influence":70},"strength":9,"requireTraits":["keen_senses"],"bonus":{"happiness":0.1,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.04,"culture":0,"faith":0,"influence":0.02,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}}]};
const COMBO_CHAIN_SYSTEMS={"tribal":[{"id":"tribal_canopy_caravans","name":"Canopy Caravan Routes","stage":"tribal","category":"society","description":"Arboreal mercantile tribes create elevated exchange routes that are hard to raid.","cost":{"food":22,"material":18,"knowledge":12,"influence":10},"bonus":{"manual":0,"auto":0,"carry":0.02,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.08,"material":0.08,"knowledge":0,"culture":0,"faith":0,"influence":0.08,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.3,"material":0.3,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["arboreal","mercantile_society"]},{"id":"tribal_raider_nests","name":"Raider Nest Network","stage":"tribal","category":"society","description":"Aerial militarist tribes use speed and shock to dominate rival movement.","cost":{"food":24,"material":20,"influence":14},"bonus":{"manual":0,"auto":0.02,"carry":0,"happiness":-2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.04,"culture":0,"faith":0,"influence":0.1,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.2,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aerial","militarist_society"]},{"id":"tribal_burrow_communes","name":"Burrow Commune Stores","stage":"tribal","category":"society","description":"Subterranean developmental tribes turn secure storage into compounding growth.","cost":{"food":24,"material":22,"knowledge":14},"bonus":{"manual":0,"auto":0,"carry":0.03,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.12,"knowledge":0.06,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.4,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["subterranean","developmental_society"]},{"id":"tribal_spore_sanctums","name":"Spore Sanctums","stage":"tribal","category":"society","description":"Fungal isolationist tribes build inward-facing sanctums of memory and resilience.","cost":{"food":20,"material":16,"faith":14,"culture":12},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.08,"culture":0.08,"faith":0.08,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.25,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["fungal","isolationist_society"]}],"civilization":[{"id":"civ_canopy_exchange","name":"Canopy Exchange Districts","stage":"civilization","category":"civic","description":"Arboreal mercantile cities hang markets, warehousing, and food chains above the crowd.","cost":{"material":70,"culture":24,"influence":24,"knowledge":18},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.1,"material":0.1,"knowledge":0,"culture":0.05,"faith":0,"influence":0.06,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.4,"material":0.5,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["arboreal","mercantile_society"]},{"id":"civ_sky_marches","name":"Sky Marches","stage":"civilization","category":"civic","description":"Aerial militarist societies turn mobility into pressure, signaling, and projection.","cost":{"material":76,"influence":30,"knowledge":18},"bonus":{"manual":0,"auto":0.03,"carry":0,"happiness":-3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.05,"culture":0,"faith":0,"influence":0.12,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.3,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aerial","militarist_society"]},{"id":"civ_deep_foundries","name":"Deep Foundry League","stage":"civilization","category":"tech","description":"Subterranean developmental civilizations dominate heavy material compounding.","cost":{"material":82,"knowledge":28,"culture":18},"bonus":{"manual":0,"auto":0,"carry":0.03,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.16,"knowledge":0.06,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.7,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["subterranean","developmental_society"]},{"id":"civ_spore_cloisters","name":"Spore Cloister Orders","stage":"civilization","category":"religion","description":"Fungal isolationist civilizations blend doctrine, memory, and inward cultural strength.","cost":{"material":62,"faith":26,"culture":30},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.06,"culture":0.1,"faith":0.12,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.4,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["fungal","isolationist_society"]},{"id":"civ_delta_brokers","name":"Delta Broker Houses","stage":"civilization","category":"tech","description":"Amphibious mercantile civilizations profit from mixed-route logistics and adaptable trade.","cost":{"material":74,"knowledge":24,"influence":26},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.06,"material":0.08,"knowledge":0,"culture":0,"faith":0,"influence":0.08,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.4,"knowledge":0,"culture":0,"faith":0,"influence":0.2,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["amphibious","mercantile_society"]}],"empire":[{"id":"empire_canopy_convoys","name":"Canopy Convoy Bureau","stage":"empire","category":"edict","description":"Arboreal mercantile empires scale soft-power through protected trade corridors.","cost":{"material":120,"energy":26,"influence":42,"knowledge":28},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.1,"knowledge":0,"culture":0.06,"faith":0,"influence":0.1,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.8,"knowledge":0,"culture":0,"faith":0,"influence":0.4,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["arboreal","mercantile_society"]},{"id":"empire_aerie_command","name":"Aerie Command","stage":"empire","category":"doctrine","description":"Aerial militarist empires coordinate high-speed force projection and command relays.","cost":{"material":126,"energy":30,"influence":52,"knowledge":22},"bonus":{"manual":0,"auto":0.03,"carry":0,"happiness":-4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.06,"culture":0,"faith":0,"influence":0.14,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0.4}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aerial","militarist_society"]},{"id":"empire_deep_planning","name":"Deep Planning Office","stage":"empire","category":"tech","description":"Subterranean developmental empires dominate planning, extraction, and secure logistics.","cost":{"material":138,"knowledge":42,"energy":20},"bonus":{"manual":0,"auto":0,"carry":0.03,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.16,"knowledge":0.08,"culture":0,"faith":0,"influence":0,"energy":0.04},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":1.0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["subterranean","developmental_society"]},{"id":"empire_spore_concord","name":"Spore Concord","stage":"empire","category":"doctrine","description":"Fungal isolationist empires stabilize internally and resist fragmentation.","cost":{"material":112,"faith":28,"culture":34,"influence":30},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":5,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.08,"culture":0.1,"faith":0.1,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.5,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["fungal","isolationist_society"]},{"id":"empire_tide_compacts","name":"Tide Compact Ports","stage":"empire","category":"edict","description":"Aquatic mercantile empires leverage exchange, food abundance, and naval logistics.","cost":{"material":118,"energy":24,"food":40,"influence":36},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.12,"material":0.08,"knowledge":0,"culture":0,"faith":0,"influence":0.08,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.8,"material":0.4,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aquatic","mercantile_society"]}],"solar":[{"id":"solar_canopy_exchanges","name":"Canopy Exchange Ring","stage":"solar","category":"policy","description":"Arboreal mercantile solar societies turn habitat layering into trade and culture.","cost":{"material":170,"energy":135,"culture":80,"influence":70},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.08,"material":0.08,"knowledge":0,"culture":0.08,"faith":0,"influence":0.1,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.6,"material":0.8,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["arboreal","mercantile_society"]},{"id":"solar_raider_command","name":"Raider Command Ring","stage":"solar","category":"policy","description":"Aerial militarist solar societies dominate rapid interception and routing.","cost":{"material":182,"energy":150,"influence":85,"knowledge":70},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":-4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.04,"culture":0,"faith":0,"influence":0.14,"energy":0.06},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0.6}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aerial","militarist_society"]},{"id":"solar_deep_bureaus","name":"Deep Extraction Bureau","stage":"solar","category":"tech","description":"Subterranean developmental solar societies convert planets into planned industrial engines.","cost":{"material":190,"energy":145,"knowledge":95},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.16,"knowledge":0.08,"culture":0,"faith":0,"influence":0,"energy":0.06},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":1.1,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["subterranean","developmental_society"]},{"id":"solar_spore_quietude","name":"Spore Quietude","stage":"solar","category":"policy","description":"Fungal isolationist solar societies prioritize internal resilience over outward reach.","cost":{"material":160,"energy":138,"culture":88,"faith":46},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":5,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.08,"culture":0.1,"faith":0.08,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.6,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["fungal","isolationist_society"]}],"galactic":[{"id":"galactic_living_exchanges","name":"Living Exchange Continuum","stage":"galactic","category":"alignment","description":"Arboreal mercantile galactic societies blend abundance, trade, and prestige.","cost":{"material":280,"energy":220,"culture":150,"influence":130},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":5,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.1,"material":0.08,"knowledge":0,"culture":0.1,"faith":0,"influence":0.12,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.8,"material":1.0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["arboreal","mercantile_society"]},{"id":"galactic_raider_hegemony","name":"Raider Hegemony","stage":"galactic","category":"alignment","description":"Aerial militarist galactic societies define strategy through mobility and fear.","cost":{"material":300,"energy":240,"influence":160,"knowledge":110},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":-5,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.04,"culture":0,"faith":0,"influence":0.16,"energy":0.08},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0.8}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aerial","militarist_society"]},{"id":"galactic_deep_directorate","name":"Deep Directorate","stage":"galactic","category":"ascension","description":"Subterranean developmental galactic societies turn secure growth into total scale.","cost":{"material":310,"energy":235,"knowledge":170,"culture":90},"bonus":{"manual":0,"auto":0,"carry":0.04,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.18,"knowledge":0.1,"culture":0,"faith":0,"influence":0,"energy":0.06},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":1.3,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["subterranean","developmental_society"]},{"id":"galactic_spore_silence","name":"Spore Silence","stage":"galactic","category":"alignment","description":"Fungal isolationist galactic societies trade outward ambition for unbreakable cohesion.","cost":{"material":270,"energy":220,"culture":160,"faith":90},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":6,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.08,"culture":0.12,"faith":0.1,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.8,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["fungal","isolationist_society"]}]};
const COMBO_CHAIN_UNITS={"civilization":[{"id":"civ_canopy_brokers","name":"Canopy Brokers","stage":"civilization","class":"trade","description":"Arboreal mercantile cities field brokers who scale food and exchange.","cost":{"material":34,"culture":14,"influence":14},"strength":3,"requireTraits":["arboreal","mercantile_society"],"bonus":{"happiness":0.3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.02,"material":0.03,"knowledge":0,"culture":0.02,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"civ_sky_raiders","name":"Sky Raiders","stage":"civilization","class":"ranged","description":"Aerial militarist societies weaponize speed and signaling.","cost":{"material":36,"influence":18,"knowledge":12},"strength":14,"requireTraits":["aerial","militarist_society"],"bonus":{"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"civ_deep_engineers","name":"Deep Engineers","stage":"civilization","class":"support","description":"Subterranean developmental societies mobilize builders into compounding works.","cost":{"material":38,"knowledge":20,"culture":10},"strength":2,"requireTraits":["subterranean","developmental_society"],"bonus":{"happiness":0.2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.04,"knowledge":0.02,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"civ_spore_keepers","name":"Spore Keepers","stage":"civilization","class":"religious","description":"Fungal isolationist societies elevate internal memory and cohesion.","cost":{"material":30,"faith":18,"culture":16},"strength":5,"requireTraits":["fungal","isolationist_society"],"bonus":{"happiness":0.4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.03,"faith":0.02,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}}],"empire":[{"id":"empire_canopy_merchants","name":"Canopy Merchant Convoys","stage":"empire","class":"trade","description":"Arboreal mercantile empires protect profitable long routes.","cost":{"material":50,"energy":16,"influence":18},"strength":4,"requireTraits":["arboreal","mercantile_society"],"bonus":{"happiness":0.2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.04,"knowledge":0,"culture":0,"faith":0,"influence":0.03,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"empire_aerie_lancers","name":"Aerie Lancers","stage":"empire","class":"heavy_cavalry","description":"Aerial militarist empires turn maneuver into battlefield control.","cost":{"material":58,"energy":18,"influence":22},"strength":18,"requireTraits":["aerial","militarist_society"],"bonus":{"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"empire_deep_cadres","name":"Deep Cadres","stage":"empire","class":"support","description":"Subterranean developmental empires field disciplined logistics and engineering corps.","cost":{"material":54,"knowledge":24,"energy":12},"strength":3,"requireTraits":["subterranean","developmental_society"],"bonus":{"happiness":0.2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.04,"knowledge":0.03,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"empire_spore_wardens","name":"Spore Wardens","stage":"empire","class":"ranged","description":"Fungal isolationist empires field resilient border security.","cost":{"material":48,"faith":18,"culture":18},"strength":14,"requireTraits":["fungal","isolationist_society"],"bonus":{"happiness":0.2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.03,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}}],"solar":[{"id":"solar_canopy_tradefleets","name":"Canopy Tradefleets","stage":"solar","class":"trade","description":"Arboreal mercantile solar societies scale prosperous orbital trade.","cost":{"material":108,"energy":82,"culture":44,"influence":34},"strength":5,"requireTraits":["arboreal","mercantile_society"],"bonus":{"happiness":0.3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.04,"knowledge":0,"culture":0.03,"faith":0,"influence":0.02,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"solar_raider_wings","name":"Raider Wings","stage":"solar","class":"destroyer","description":"Aerial militarist solar societies dominate fast pressure routes.","cost":{"material":118,"energy":90,"knowledge":50,"influence":38},"strength":22,"requireTraits":["aerial","militarist_society"],"bonus":{"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"solar_deep_contractors","name":"Deep Contractors","stage":"solar","class":"construction_ship","description":"Subterranean developmental solar societies industrialize expansion itself.","cost":{"material":112,"energy":88,"knowledge":62},"strength":3,"requireTraits":["subterranean","developmental_society"],"bonus":{"happiness":0.2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.05,"knowledge":0.03,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"solar_spore_anchors","name":"Spore Anchors","stage":"solar","class":"escort","description":"Fungal isolationist solar societies favor defensive orbital cohesion.","cost":{"material":104,"energy":86,"culture":46},"strength":18,"requireTraits":["fungal","isolationist_society"],"bonus":{"happiness":0.3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.03,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}}],"galactic":[{"id":"galactic_canopy_league","name":"Canopy League Convoys","stage":"galactic","class":"trade","description":"Arboreal mercantile galactic societies turn abundance into prestige and throughput.","cost":{"material":210,"energy":160,"culture":110,"influence":90},"strength":6,"requireTraits":["arboreal","mercantile_society"],"bonus":{"happiness":0.3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.05,"knowledge":0,"culture":0.03,"faith":0,"influence":0.03,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"galactic_raider_hosts","name":"Raider Hosts","stage":"galactic","class":"cruiser","description":"Aerial militarist galactic societies project coordinated fast war.","cost":{"material":230,"energy":180,"knowledge":120,"influence":95},"strength":30,"requireTraits":["aerial","militarist_society"],"bonus":{"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"galactic_deep_arcologies","name":"Deep Arcology Corps","stage":"galactic","class":"construction_ship","description":"Subterranean developmental galactic societies scale infrastructure at impossible speed.","cost":{"material":220,"energy":170,"knowledge":140},"strength":4,"requireTraits":["subterranean","developmental_society"],"bonus":{"happiness":0.2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.05,"knowledge":0.04,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"galactic_spore_sentinels","name":"Spore Sentinels","stage":"galactic","class":"defense_platform","description":"Fungal isolationist galactic societies value secure internal continuity.","cost":{"material":215,"energy":165,"culture":120},"strength":26,"requireTraits":["fungal","isolationist_society"],"bonus":{"happiness":0.4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.04,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}}]};
const EXTRA_COMBO_CHAIN_SYSTEMS={"civilization":[{"id":"civ_aquatic_legions","name":"Tide Legion Harbors","stage":"civilization","category":"civic","description":"Aquatic militarist civilizations turn ports into military projection hubs.","cost":{"material":78,"influence":30,"food":28,"knowledge":18},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":-1,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.08,"material":0.06,"knowledge":0,"culture":0,"faith":0,"influence":0.08,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.4,"knowledge":0,"culture":0,"faith":0,"influence":0.3,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aquatic","militarist_society"]},{"id":"civ_arboreal_commons","name":"Canopy Commons","stage":"civilization","category":"civic","description":"Arboreal developmental civilizations scale population and learning through living urban planning.","cost":{"material":76,"knowledge":28,"culture":22},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.08,"material":0,"knowledge":0.08,"culture":0.06,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.4,"material":0,"knowledge":0.3,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["arboreal","developmental_society"]},{"id":"civ_aerial_exchanges","name":"Sky Exchange Towers","stage":"civilization","category":"tech","description":"Aerial mercantile civilizations turn mobility into communication and trade supremacy.","cost":{"material":72,"knowledge":26,"influence":28},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0.04,"culture":0,"faith":0,"influence":0.1,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.3,"knowledge":0,"culture":0,"faith":0,"influence":0.3,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aerial","mercantile_society"]},{"id":"civ_marsh_sanctuaries","name":"Marsh Sanctuaries","stage":"civilization","category":"religion","description":"Amphibious isolationist civilizations favor protected wetland enclaves and self-sufficient cohesion.","cost":{"material":68,"faith":24,"culture":26},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.06,"material":0,"knowledge":0,"culture":0.08,"faith":0.08,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.3,"material":0,"knowledge":0,"culture":0.3,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["amphibious","isolationist_society"]},{"id":"civ_fungal_brokers","name":"Spore Broker Guilds","stage":"civilization","category":"tech","description":"Fungal mercantile civilizations turn memory networks into trusted exchange systems.","cost":{"material":70,"knowledge":30,"influence":24},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0.08,"culture":0,"faith":0,"influence":0.06,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.3,"knowledge":0.3,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["fungal","mercantile_society"]},{"id":"civ_deep_legions","name":"Underway Muster","stage":"civilization","category":"tech","description":"Subterranean militarist civilizations use hardened corridors for disciplined force concentration.","cost":{"material":82,"knowledge":24,"influence":28},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":-2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.1,"knowledge":0,"culture":0,"faith":0,"influence":0.08,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.5,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["subterranean","militarist_society"]}],"empire":[{"id":"empire_tide_dreadnocks","name":"Tide Dreaddocks","stage":"empire","category":"edict","description":"Aquatic militarist empires build naval-industrial force around heavy dockyards.","cost":{"material":130,"energy":26,"food":40,"influence":40},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":-2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.06,"material":0.08,"knowledge":0,"culture":0,"faith":0,"influence":0.1,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.8,"knowledge":0,"culture":0,"faith":0,"influence":0.4,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aquatic","militarist_society"]},{"id":"empire_canopy_plans","name":"Canopy Planning Ministry","stage":"empire","category":"tech","description":"Arboreal developmental empires compound growth through layered civic planning.","cost":{"material":132,"knowledge":40,"culture":28},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.1,"material":0,"knowledge":0.08,"culture":0.06,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.6,"material":0,"knowledge":0.4,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["arboreal","developmental_society"]},{"id":"empire_sky_bazaars","name":"Sky Bazaar Charter","stage":"empire","category":"edict","description":"Aerial mercantile empires dominate fast exchange and prestige logistics.","cost":{"material":124,"energy":24,"influence":46,"knowledge":26},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0,"culture":0,"faith":0,"influence":0.1,"energy":0.04},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.4,"knowledge":0,"culture":0,"faith":0,"influence":0.5,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aerial","mercantile_society"]},{"id":"empire_reed_innerworks","name":"Reed Innerworks","stage":"empire","category":"doctrine","description":"Amphibious isolationist empires secure interior routes and quiet self-sufficiency.","cost":{"material":118,"culture":32,"faith":24,"influence":30},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.08,"material":0,"knowledge":0,"culture":0.08,"faith":0.08,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.5,"material":0,"knowledge":0,"culture":0.4,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["amphibious","isolationist_society"]},{"id":"empire_spore_exchange","name":"Spore Exchange Office","stage":"empire","category":"edict","description":"Fungal mercantile empires turn trust and memory into soft-power economics.","cost":{"material":120,"knowledge":42,"influence":36},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.06,"knowledge":0.08,"culture":0,"faith":0,"influence":0.08,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0.5,"culture":0,"faith":0,"influence":0.4,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["fungal","mercantile_society"]},{"id":"empire_deep_war_ministry","name":"Deep War Ministry","stage":"empire","category":"doctrine","description":"Subterranean militarist empires scale siege, supply, and internal hardness.","cost":{"material":138,"energy":22,"influence":48},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":-3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.12,"knowledge":0,"culture":0,"faith":0,"influence":0.1,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.9,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["subterranean","militarist_society"]}],"solar":[{"id":"solar_tide_battleweb","name":"Tide Battleweb","stage":"solar","category":"policy","description":"Aquatic militarist solar societies project force through fluid dock networks.","cost":{"material":180,"energy":150,"food":90,"influence":70},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":-2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.06,"material":0.08,"knowledge":0,"culture":0,"faith":0,"influence":0.12,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.8,"knowledge":0,"culture":0,"faith":0,"influence":0.6,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aquatic","militarist_society"]},{"id":"solar_canopy_growth_grid","name":"Canopy Growth Grid","stage":"solar","category":"tech","description":"Arboreal developmental solar societies turn habitats into self-compounding ecologies.","cost":{"material":176,"energy":142,"knowledge":100,"culture":72},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.1,"material":0,"knowledge":0.08,"culture":0.08,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.8,"material":0,"knowledge":0.4,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["arboreal","developmental_society"]},{"id":"solar_sky_exchange_web","name":"Sky Exchange Web","stage":"solar","category":"policy","description":"Aerial mercantile solar societies dominate speed, prestige, and route arbitrage.","cost":{"material":170,"energy":148,"influence":82,"knowledge":76},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0,"culture":0,"faith":0,"influence":0.12,"energy":0.04},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.5,"knowledge":0,"culture":0,"faith":0,"influence":0.6,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aerial","mercantile_society"]},{"id":"solar_reed_enclaves","name":"Reed Enclave Arrays","stage":"solar","category":"policy","description":"Amphibious isolationist solar societies build stable, protected edge colonies.","cost":{"material":166,"energy":138,"culture":84,"faith":42},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.08,"material":0,"knowledge":0,"culture":0.08,"faith":0.08,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.6,"material":0,"knowledge":0,"culture":0.5,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["amphibious","isolationist_society"]}],"galactic":[{"id":"galactic_tide_hegemony","name":"Tide Hegemony","stage":"galactic","category":"alignment","description":"Aquatic militarist galactic societies combine abundance with naval-strategic coercion.","cost":{"material":300,"energy":240,"food":170,"influence":150},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":-2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.08,"material":0.08,"knowledge":0,"culture":0,"faith":0,"influence":0.12,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":1.0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0.8,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aquatic","militarist_society"]},{"id":"galactic_canopy_directive","name":"Canopy Directive","stage":"galactic","category":"ascension","description":"Arboreal developmental galactic societies turn growth and cohesion into civilizational scale.","cost":{"material":290,"energy":220,"knowledge":180,"culture":140},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":5,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.1,"material":0,"knowledge":0.08,"culture":0.08,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":1.0,"material":0,"knowledge":0.6,"culture":0,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["arboreal","developmental_society"]},{"id":"galactic_sky_exchange_bloc","name":"Sky Exchange Bloc","stage":"galactic","category":"alignment","description":"Aerial mercantile galactic societies dominate prestige routing and high-speed exchange.","cost":{"material":285,"energy":230,"influence":160,"knowledge":140},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.08,"knowledge":0,"culture":0,"faith":0,"influence":0.12,"energy":0.04},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.6,"knowledge":0,"culture":0,"faith":0,"influence":0.8,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["aerial","mercantile_society"]},{"id":"galactic_reed_quietude","name":"Reed Quietude","stage":"galactic","category":"alignment","description":"Amphibious isolationist galactic societies prioritize secure internal continuity over outward reach.","cost":{"material":275,"energy":220,"culture":160,"faith":95},"bonus":{"manual":0,"auto":0,"carry":0,"happiness":5,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.08,"material":0,"knowledge":0,"culture":0.1,"faith":0.08,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.8,"material":0,"knowledge":0,"culture":0.7,"faith":0,"influence":0,"energy":0}},"affinity":{},"traits":[],"exclusive":[],"prereq":"","requireTraits":["amphibious","isolationist_society"]}]};
const EXTRA_COMBO_CHAIN_UNITS={"civilization":[{"id":"civ_tide_raiders","name":"Tide Raiders","stage":"civilization","class":"naval_melee","description":"Aquatic militarist cities project force through rivers and littoral routes.","cost":{"material":38,"food":18,"influence":18},"strength":16,"requireTraits":["aquatic","militarist_society"],"bonus":{"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"civ_canopy_planners","name":"Canopy Planners","stage":"civilization","class":"support","description":"Arboreal developmental cities convert growth into reliable compounding.","cost":{"material":36,"knowledge":20,"culture":12},"strength":3,"requireTraits":["arboreal","developmental_society"],"bonus":{"happiness":0.3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.03,"material":0,"knowledge":0.02,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"civ_sky_factors","name":"Sky Factors","stage":"civilization","class":"trade","description":"Aerial mercantile cities dominate information-rich trade.","cost":{"material":34,"influence":18,"knowledge":16},"strength":4,"requireTraits":["aerial","mercantile_society"],"bonus":{"happiness":0.2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.03,"knowledge":0,"culture":0,"faith":0,"influence":0.02,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"civ_reed_wardens","name":"Reed Wardens","stage":"civilization","class":"ranged","description":"Amphibious isolationist cities secure marsh borders and quiet zones.","cost":{"material":32,"faith":16,"culture":16},"strength":12,"requireTraits":["amphibious","isolationist_society"],"bonus":{"happiness":0.3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.02,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}}],"empire":[{"id":"empire_tide_marines","name":"Tide Marines","stage":"empire","class":"naval_ranged","description":"Aquatic militarist empires project disciplined force through aquatic logistics.","cost":{"material":60,"energy":20,"food":24,"influence":24},"strength":20,"requireTraits":["aquatic","militarist_society"],"bonus":{"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"empire_canopy_engineers","name":"Canopy Engineers","stage":"empire","class":"support","description":"Arboreal developmental empires scale growth through living infrastructure.","cost":{"material":56,"knowledge":26,"culture":14},"strength":4,"requireTraits":["arboreal","developmental_society"],"bonus":{"happiness":0.2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.03,"material":0,"knowledge":0.03,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"empire_sky_freighters","name":"Sky Freighters","stage":"empire","class":"trade","description":"Aerial mercantile empires profit from speed and reach.","cost":{"material":54,"energy":18,"influence":22},"strength":5,"requireTraits":["aerial","mercantile_society"],"bonus":{"happiness":0.2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.04,"knowledge":0,"culture":0,"faith":0,"influence":0.03,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"empire_reed_guards","name":"Reed Guards","stage":"empire","class":"ranged","description":"Amphibious isolationist empires field stable internal security.","cost":{"material":50,"faith":18,"culture":18},"strength":15,"requireTraits":["amphibious","isolationist_society"],"bonus":{"happiness":0.2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.02,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}}],"solar":[{"id":"solar_tide_carriers","name":"Tide Carriers","stage":"solar","class":"carrier","description":"Aquatic militarist solar societies turn dock webs into heavy force projection.","cost":{"material":122,"energy":96,"food":52,"influence":42},"strength":24,"requireTraits":["aquatic","militarist_society"],"bonus":{"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"solar_canopy_growth_fleets","name":"Canopy Growth Fleets","stage":"solar","class":"colony_ship","description":"Arboreal developmental solar societies colonize efficiently through habitat ecology.","cost":{"material":114,"energy":88,"knowledge":66,"culture":36},"strength":4,"requireTraits":["arboreal","developmental_society"],"bonus":{"happiness":0.3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.03,"material":0,"knowledge":0.02,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"solar_sky_brokers","name":"Sky Brokers","stage":"solar","class":"trade","description":"Aerial mercantile solar societies dominate prestige logistics.","cost":{"material":110,"energy":86,"influence":46,"knowledge":44},"strength":6,"requireTraits":["aerial","mercantile_society"],"bonus":{"happiness":0.2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.04,"knowledge":0,"culture":0,"faith":0,"influence":0.03,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"solar_reed_shields","name":"Reed Shields","stage":"solar","class":"escort","description":"Amphibious isolationist solar societies favor protected frontier screens.","cost":{"material":106,"energy":84,"culture":48},"strength":18,"requireTraits":["amphibious","isolationist_society"],"bonus":{"happiness":0.3,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.03,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}}],"galactic":[{"id":"galactic_tide_hosts","name":"Tide Hosts","stage":"galactic","class":"battleship","description":"Aquatic militarist galactic societies project disciplined fleet violence.","cost":{"material":235,"energy":185,"food":110,"influence":100},"strength":30,"requireTraits":["aquatic","militarist_society"],"bonus":{"happiness":0,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"galactic_canopy_founders","name":"Canopy Founders","stage":"galactic","class":"construction_ship","description":"Arboreal developmental galactic societies build at civilizational scale.","cost":{"material":220,"energy":172,"knowledge":150,"culture":88},"strength":5,"requireTraits":["arboreal","developmental_society"],"bonus":{"happiness":0.2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0.03,"material":0,"knowledge":0.03,"culture":0,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"galactic_sky_exchangers","name":"Sky Exchangers","stage":"galactic","class":"trade","description":"Aerial mercantile galactic societies turn speed into hegemony through exchange.","cost":{"material":215,"energy":170,"influence":115,"knowledge":105},"strength":7,"requireTraits":["aerial","mercantile_society"],"bonus":{"happiness":0.2,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0.04,"knowledge":0,"culture":0,"faith":0,"influence":0.03,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}},{"id":"galactic_reed_bastions","name":"Reed Bastions","stage":"galactic","class":"defense_platform","description":"Amphibious isolationist galactic societies maintain secure perimeter continuity.","cost":{"material":220,"energy":168,"culture":126,"faith":70},"strength":26,"requireTraits":["amphibious","isolationist_society"],"bonus":{"happiness":0.4,"resMult":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0.03,"faith":0,"influence":0,"energy":0},"resAdd":{"glucose":0,"proteins":0,"lipids":0,"elements":0,"evolution":0,"food":0,"material":0,"knowledge":0,"culture":0,"faith":0,"influence":0,"energy":0}}}]};
const WORLD_TYPES=[{"id":"terrestrial","name":"Terrestrial","habitability":1.0,"best_fit_archetypes":["terrestrial","amphibious"]},{"id":"ocean_world","name":"Ocean World","habitability":0.95,"best_fit_archetypes":["aquatic","amphibious"]},{"id":"desert_world","name":"Desert World","habitability":0.65,"best_fit_archetypes":["terrestrial","subterranean"]},{"id":"ice_world","name":"Ice World","habitability":0.6,"best_fit_archetypes":["terrestrial","fungal"]},{"id":"volcanic_world","name":"Volcanic World","habitability":0.45,"best_fit_archetypes":["subterranean","fungal"]},{"id":"jungle_world","name":"Jungle World","habitability":0.9,"best_fit_archetypes":["arboreal","amphibious"]},{"id":"fungal_world","name":"Fungal World","habitability":0.8,"best_fit_archetypes":["fungal","subterranean"]},{"id":"underground_world","name":"Underground World","habitability":0.7,"best_fit_archetypes":["subterranean","fungal"]},{"id":"aerial_world","name":"Aerial World","habitability":0.55,"best_fit_archetypes":["aerial","arboreal"]},{"id":"gaia_world","name":"Gaia World","habitability":1.3,"best_fit_archetypes":["terrestrial","arboreal","aquatic"]}];

const CHALLENGE_EVENTS=[{"id":"none","name":"No Event Pressure","stage":"any","description":"No extra event pressure.","difficulty":0,"effects":{}},{"id":"solar_storm","name":"Solar Storm","stage":"solar","description":"Radiation spikes are destabilizing orbital infrastructure around this body.","difficulty":2,"effects":{"energy":-0.22,"knowledge":-0.08}},{"id":"tectonic_surge","name":"Tectonic Surge","stage":"solar","description":"Subsurface upheaval is damaging colony supports and extraction networks.","difficulty":2,"effects":{"material":-0.18,"food":-0.1}},{"id":"pirate_raid","name":"Pirate Raid","stage":"solar","description":"Raiders are disrupting routes and threatening colony morale.","difficulty":2,"effects":{"influence":-0.16,"material":-0.08,"happiness":-8}},{"id":"colony_crisis","name":"Colony Crisis","stage":"solar","description":"Local systems are failing under planetary stress and need intervention.","difficulty":2,"effects":{"energy":-0.1,"knowledge":-0.1,"happiness":-10}},{"id":"predator_bloom","name":"Predator Bloom","stage":"creature","description":"Predator populations surge and pressure survival loops.","difficulty":1,"effects":{"food":-0.12,"evolution":0.05}},{"id":"migration_season","name":"Migration Season","stage":"tribal","description":"Communities must move and reorganize under pressure.","difficulty":1,"effects":{"food":-0.08,"influence":-0.08,"culture":0.05}},{"id":"court_intrigue","name":"Court Intrigue","stage":"civilization","description":"Internal maneuvering slows state efficiency.","difficulty":2,"effects":{"influence":-0.14,"knowledge":-0.06}},{"id":"border_skirmishes","name":"Border Skirmishes","stage":"empire","description":"Border conflicts tax cohesion and logistics.","difficulty":2,"effects":{"material":-0.08,"influence":-0.12,"happiness":-10}},{"id":"faction_deadlock","name":"Faction Deadlock","stage":"galactic","description":"Bloc politics stall interstellar initiatives.","difficulty":3,"effects":{"influence":-0.18,"knowledge":-0.1,"culture":-0.08}}];
const CHALLENGE_DISASTERS=[{"id":"none","name":"No Disaster Modifier","stage":"any","description":"No disaster modifier active.","difficulty":0,"effects":{}},{"id":"storms","name":"Storms","stage":"tribal","description":"Weather and turbulence degrade movement and trade stability.","difficulty":1,"effects":{"food":-0.08,"material":-0.08}},{"id":"drought","name":"Drought","stage":"tribal","description":"Food and water pressure rise in survival and terrestrial stages.","difficulty":1,"effects":{"food":-0.2,"happiness":-10}},{"id":"plague","name":"Plague","stage":"civilization","description":"Population confidence and state stability are undermined.","difficulty":1,"effects":{"happiness":-15,"knowledge":-0.08}},{"id":"solar_flares","name":"Solar Flares","stage":"solar","description":"Data and compute systems suffer periodic disruption.","difficulty":2,"effects":{"energy":-0.2,"knowledge":-0.1}},{"id":"wormhole_instability","name":"Wormhole Instability","stage":"galactic","description":"Wormhole-based galactic networks accumulate extra crisis pressure.","difficulty":2,"effects":{"energy":-0.14,"influence":-0.08}},{"id":"blight","name":"Blight","stage":"tribal","description":"Crop disease and ecological rot spread food pressure through settled worlds.","difficulty":1,"effects":{"food":-0.12}},{"id":"earthquakes","name":"Earthquakes","stage":"tribal","description":"Ground instability damages infrastructure, morale, and industrial reliability.","difficulty":1,"effects":{"food":-0.12}},{"id":"wildfires","name":"Wildfires","stage":"tribal","description":"Regional fires consume materials, cultural assets, and fragile ecosystems.","difficulty":1,"effects":{"food":-0.12}},{"id":"meteor_showers","name":"Meteor Showers","stage":"tribal","description":"Orbital debris and impact events damage space infrastructure and material stockpiles.","difficulty":1,"effects":{"food":-0.12}},{"id":"radiation_bursts","name":"Radiation Bursts","stage":"tribal","description":"Energetic surges destabilize habitats, crews, and deep-space cohesion.","difficulty":1,"effects":{"food":-0.12}}];
const CHALLENGE_CRISES=[{"id":"none","name":"No Crisis Pressure","stage":"any","description":"No crisis modifier active.","difficulty":0,"effects":{}},{"id":"biosphere_collapse","name":"Biosphere Collapse","stage":"creature","description":"Habitats fail and the species must adapt faster than extinction spreads.","difficulty":2,"effects":{"food":-0.18,"evolution":0.08,"happiness":-8}},{"id":"tribal_revolt","name":"Tribal Revolt","stage":"tribal","description":"Clan unrest threatens cohesion unless luxury and leadership are strong.","difficulty":2,"effects":{"happiness":-18,"influence":-0.12}},{"id":"civil_war","name":"Civil War","stage":"civilization","description":"Factional conflict breaks the state unless it is stabilized.","difficulty":3,"effects":{"happiness":-22,"material":-0.14,"influence":-0.18}},{"id":"imperial_overstretch","name":"Imperial Overstretch","stage":"empire","description":"Far-flung rule collapses into inefficiency and unrest.","difficulty":3,"effects":{"material":-0.16,"energy":-0.1,"happiness":-18}},{"id":"colony_cascade","name":"Colony Cascade Failure","stage":"solar","description":"Interplanetary support chains fail in sequence.","difficulty":3,"effects":{"energy":-0.16,"material":-0.14,"happiness":-18}},{"id":"galactic_schism","name":"Galactic Schism","stage":"galactic","description":"The interstellar order fractures into open bloc conflict.","difficulty":4,"effects":{"influence":-0.22,"culture":-0.14,"knowledge":-0.12,"happiness":-20}}];
const GALACTIC_PATHS=[{"id":"federation","name":"Federation","description":"Secure peace through treaties and stable factions.","achieved_name":"Federated Peace"},{"id":"domination","name":"Domination","description":"Win through fleet supremacy and conquered rivals.","achieved_name":"Imperial Supremacy"},{"id":"megastructure","name":"Megastructure","description":"Triumph through colossal stellar construction.","achieved_name":"Megastructure Ascendancy"},{"id":"transcendence","name":"Transcendence","description":"Ascend beyond conventional civilization through endgame transformation.","achieved_name":"Transcendent Ascension"},{"id":"trade_hegemony","name":"Trade Hegemony","description":"Rule the network through interstellar commerce and logistics.","achieved_name":"Interstellar Trade Hegemony"}];

const state={running:true,speedIndex:0,ui:{tab:"actions",systemsSub:"",automationSub:"",unitSub:"",debug:true,optionsOpen:false,betweenRuns:false,shopOpen:true},game:null};

function resourceName(id){return RESOURCES.find(x=>x[0]===id)?.[1]||id;}
function archetypeName(id){return ARCHETYPES.find(x=>x[0]===id)?.[1]||id;}
function pathName(id){return PATHS.find(x=>x[0]===id)?.[1]||id;}

function pathDescription(id){
  return {
    balanced:"No strong bias.",
    economic:"Boosts food and material automation.",
    scientific:"Boosts knowledge and evolution automation.",
    cultural:"Boosts culture automation.",
    spiritual:"Boosts faith automation.",
    expansionist:"Boosts influence automation.",
    survivalist:"Boosts food and evolution automation."
  }[id] || "No strong bias.";
}
function emptyResources(){return Object.fromEntries(RESOURCES.map(([id])=>[id,0]));}
function emptyArchetypes(){return Object.fromEntries(ARCHETYPES.map(([id])=>[id,10]));}
function currentStage(){return STAGES[state.game.run.stageIndex];}
function prestigeLevel(id, metaOverride=null){
  const meta = metaOverride || state.game?.meta;
  return meta?.prestige?.[id] || 0;
}
function costMult(){return Math.max(0.45,1-prestigeLevel("cost")*0.04);}
function manualMult(){return 1+prestigeLevel("manual")*0.2 + totalBonuses().manual;}
function autoMult(){return 1+prestigeLevel("auto")*0.15 + totalBonuses().auto;}
function carryMult(){return 0.35 + prestigeLevel("carry")*0.06 + totalBonuses().carry;}

function currentEvent(){ return CHALLENGE_EVENTS.find(x=>x.id===state.game.meta.selectedEvent) || CHALLENGE_EVENTS[0]; }
function currentDisaster(){ return CHALLENGE_DISASTERS.find(x=>x.id===state.game.meta.selectedDisaster) || CHALLENGE_DISASTERS[0]; }
function currentCrisis(){ return CHALLENGE_CRISES.find(x=>x.id===state.game.meta.selectedCrisis) || CHALLENGE_CRISES[0]; }
function challengeUnlocked(){ return state.game.meta.galacticWins > 0; }
function challengeApplies(def){ return def && def.id!=="none" && (def.stage==="any" || def.stage===currentStage().id); }


function stageMechanicDefaults(){
  return {
    metabolism: 55,
    homeostasis: 55,
    adaptationPressure: 45,
    habitatFit: 45,
    cohesion: 50,
    supply: 50,
    urbanization: 20,
    civicOrder: 60,
    bureaucracy: 35,
    logistics: 35,
    synchronization: 40,
    routeIntegrity: 40,
    hegemony: 30,
    integration: 35
  };
}

function ensureStageMechanics(){
  state.game.run.stageMechanics = state.game.run.stageMechanics || stageMechanicDefaults();
  for(const [k,v] of Object.entries(stageMechanicDefaults())){
    if(typeof state.game.run.stageMechanics[k] !== "number") state.game.run.stageMechanics[k] = v;
  }
}

function updateStageMechanics(dt){
  ensureStageMechanics();
  const r = state.game.run.resources;
  const m = state.game.run.stageMechanics;
  const stage = currentStage().id;

  if(stage === "cell"){
    const glucoseSupport = Math.min(0.18, (r.glucose || 0) * 0.006);
    const proteinSupport = Math.min(0.14, (r.proteins || 0) * 0.004);
    const lipidSupport = Math.min(0.12, (r.lipids || 0) * 0.0035);
    const membraneStrain = Math.max(0, (Object.values(state.game.run.automation || {}).reduce((s,v)=>s+v,0) - 6) * 0.01);
    m.metabolism = Math.max(0, Math.min(100, m.metabolism + (glucoseSupport + proteinSupport - membraneStrain - 0.03) * dt * 10));

    const elementSupport = Math.min(0.14, (r.elements || 0) * 0.004);
    const evolutionFlux = Math.min(0.12, (r.evolution || 0) * 0.0025);
    m.homeostasis = Math.max(0, Math.min(100, m.homeostasis + (lipidSupport + elementSupport + evolutionFlux - 0.025) * dt * 10));
  }

  if(stage === "creature"){
    const knowledgeDrive = Math.min(0.16, (r.knowledge || 0) * 0.0012);
    const evolutionDrive = Math.min(0.14, (r.evolution || 0) * 0.0018);
    const foodStress = (r.food || 0) > 70 ? 0.08 : -0.12;
    m.adaptationPressure = Math.max(0, Math.min(100, m.adaptationPressure + (knowledgeDrive + evolutionDrive + foodStress - 0.01) * dt * 10));

    const foodSupport = Math.min(0.16, (r.food || 0) * 0.0015);
    const cultureSupport = Math.min(0.12, (r.culture || 0) * 0.001);
    const predatorStress = Math.max(0, rivalGap() * 0.002);
    m.habitatFit = Math.max(0, Math.min(100, m.habitatFit + (foodSupport + cultureSupport - predatorStress - 0.015) * dt * 10));
  }

  if(stage === "tribal"){
    const foodPressure = (r.food || 0) > 60 ? 0.15 : -0.18;
    const materialPressure = (r.material || 0) > 45 ? 0.10 : -0.10;
    const cultureSupport = Math.min(0.16, (r.culture || 0) * 0.0012);
    const influenceSupport = Math.min(0.16, (r.influence || 0) * 0.001);
    m.cohesion = Math.max(0, Math.min(100, m.cohesion + (foodPressure + materialPressure + cultureSupport + influenceSupport) * dt * 10));
    const supplyBase = (r.food || 0) > 70 ? 0.18 : -0.16;
    const craftSupport = Math.min(0.14, (r.material || 0) * 0.0015);
    const militaryDrain = Math.min(0.18, Object.values(state.game.run.currentUnitsOwned || {}).reduce((s,v)=>s+v,0) * 0.0025);
    m.supply = Math.max(0, Math.min(100, m.supply + (supplyBase + craftSupport - militaryDrain) * dt * 10));
  }

  if(stage === "civilization"){
    const growthBase = (r.material || 0) > 120 ? 0.16 : 0.04;
    const foodSupport = Math.min(0.14, (r.food || 0) * 0.0008);
    const knowledgeSupport = Math.min(0.10, (r.knowledge || 0) * 0.0005);
    m.urbanization = Math.max(0, Math.min(100, m.urbanization + (growthBase + foodSupport + knowledgeSupport) * dt * 10));
    const orderSupport = Math.min(0.12, (r.culture || 0) * 0.0008) + Math.min(0.12, (r.influence || 0) * 0.0008) + Math.min(0.08, (r.faith || 0) * 0.0007);
    const urbanStrain = Math.max(0, (m.urbanization - 45) * 0.0025);
    m.civicOrder = Math.max(0, Math.min(100, m.civicOrder + (orderSupport - urbanStrain - 0.02) * dt * 10));
  }

  if(stage === "empire"){
    const adminSupport = Math.min(0.14, (r.influence || 0) * 0.0007) + Math.min(0.14, (r.knowledge || 0) * 0.0006);
    const scaleStrain = Math.max(0, (Object.values(state.game.run.automation || {}).reduce((s,v)=>s+v,0) - 12) * 0.002);
    m.bureaucracy = Math.max(0, Math.min(100, m.bureaucracy + (adminSupport - scaleStrain - 0.02) * dt * 10));
    const logisticsSupport = Math.min(0.14, (r.energy || 0) * 0.0008) + Math.min(0.12, (r.material || 0) * 0.0005);
    const rivalStrain = Math.max(0, rivalGap() * 0.0035);
    m.logistics = Math.max(0, Math.min(100, m.logistics + (logisticsSupport - rivalStrain - 0.015) * dt * 10));
  }
}

function stageMechanicBundle(){
  ensureStageMechanics();
  const m = state.game.run.stageMechanics;
  const stage = currentStage().id;
  const out = {resMult: emptyResources(), happiness: 0, militaryThreat: 0, scoreBonus: 0};

  if(stage === "cell"){
    const metabolismEdge = (m.metabolism - 50) / 50;
    const homeostasisEdge = (m.homeostasis - 50) / 50;
    out.resMult.glucose += metabolismEdge * 0.14;
    out.resMult.proteins += metabolismEdge * 0.1;
    out.resMult.evolution += homeostasisEdge * 0.12;
    out.resMult.elements += homeostasisEdge * 0.08;
    out.happiness += 0;
    out.militaryThreat += 0;
    out.scoreBonus += Math.max(0, m.metabolism - 55) * 0.35 + Math.max(0, m.homeostasis - 55) * 0.35;
  }

  if(stage === "creature"){
    const adaptEdge = (m.adaptationPressure - 45) / 55;
    const habitatEdge = (m.habitatFit - 45) / 55;
    out.resMult.evolution += adaptEdge * 0.12;
    out.resMult.knowledge += adaptEdge * 0.08;
    out.resMult.food += habitatEdge * 0.12;
    out.resMult.culture += habitatEdge * 0.06;
    out.happiness += (m.habitatFit - 50) * 0.04;
    out.militaryThreat += Math.max(0, 40 - m.habitatFit) * 0.10;
    out.scoreBonus += Math.max(0, m.adaptationPressure - 50) * 0.4 + Math.max(0, m.habitatFit - 50) * 0.35;
  }

  if(stage === "tribal"){
    const cohesionEdge = (m.cohesion - 50) / 50;
    const supplyEdge = (m.supply - 50) / 50;
    out.resMult.food += supplyEdge * 0.12;
    out.resMult.material += supplyEdge * 0.10;
    out.resMult.influence += cohesionEdge * 0.10;
    out.resMult.culture += cohesionEdge * 0.08;
    out.happiness += (m.cohesion - 50) * 0.08 + (m.supply - 50) * 0.05;
    out.militaryThreat += Math.max(0, 45 - m.supply) * 0.12;
    out.scoreBonus += Math.max(0, m.cohesion - 55) * 0.4;
  }

  if(stage === "civilization"){
    const urbanEdge = (m.urbanization - 35) / 65;
    const orderEdge = (m.civicOrder - 50) / 50;
    out.resMult.material += urbanEdge * 0.12;
    out.resMult.knowledge += urbanEdge * 0.10;
    out.resMult.culture += orderEdge * 0.08;
    out.resMult.influence += orderEdge * 0.08;
    out.happiness += (m.civicOrder - 50) * 0.10 - Math.max(0, m.urbanization - 75) * 0.06;
    out.militaryThreat += Math.max(0, 45 - m.civicOrder) * 0.14;
    out.scoreBonus += Math.max(0, m.urbanization - 45) * 0.35 + Math.max(0, m.civicOrder - 55) * 0.35;
  }

  if(stage === "empire"){
    const adminEdge = (m.bureaucracy - 40) / 60;
    const logisticsEdge = (m.logistics - 40) / 60;
    out.resMult.material += logisticsEdge * 0.10;
    out.resMult.energy += logisticsEdge * 0.10;
    out.resMult.influence += adminEdge * 0.10;
    out.resMult.knowledge += adminEdge * 0.08;
    out.happiness += (m.bureaucracy - 50) * 0.07 + (m.logistics - 50) * 0.06;
    out.militaryThreat += Math.max(0, 45 - m.logistics) * 0.16;
    out.scoreBonus += Math.max(0, m.bureaucracy - 50) * 0.4 + Math.max(0, m.logistics - 50) * 0.4;
  }

  if(stage === "solar"){
    const syncEdge = (m.synchronization - 40) / 60;
    const routeEdge = (m.routeIntegrity - 40) / 60;
    out.resMult.knowledge += syncEdge * 0.10;
    out.resMult.influence += syncEdge * 0.08;
    out.resMult.energy += routeEdge * 0.10;
    out.resMult.material += routeEdge * 0.08;
    out.happiness += (m.synchronization - 50) * 0.06 + (m.routeIntegrity - 50) * 0.06;
    out.militaryThreat += Math.max(0, 45 - m.routeIntegrity) * 0.16;
    out.scoreBonus += Math.max(0, m.synchronization - 50) * 0.45 + Math.max(0, m.routeIntegrity - 50) * 0.45;
  }

  if(stage === "galactic"){
    const hegEdge = (m.hegemony - 35) / 65;
    const intEdge = (m.integration - 35) / 65;
    out.resMult.influence += hegEdge * 0.12;
    out.resMult.culture += hegEdge * 0.08;
    out.resMult.knowledge += intEdge * 0.10;
    out.resMult.energy += intEdge * 0.08;
    out.happiness += (m.hegemony - 50) * 0.06 + (m.integration - 50) * 0.06;
    out.militaryThreat += Math.max(0, 45 - m.hegemony) * 0.12 + Math.max(0, 45 - m.integration) * 0.12;
    out.scoreBonus += Math.max(0, m.hegemony - 45) * 0.5 + Math.max(0, m.integration - 45) * 0.5;
  }

  return out;
}

function stageMechanicInfo(){
  ensureStageMechanics();
  const stage = currentStage().id;
  const m = state.game.run.stageMechanics;
  if(stage === "cell"){
    return {
      title: "Metabolism and Homeostasis",
      detail: "Cell play is about feeding growth without losing internal stability as the organism becomes more complex.",
      rows: [
        {label: "Metabolism", value: `${Math.round(m.metabolism)}`, sub: "Built from glucose and proteins. Higher metabolism accelerates core cellular output."},
        {label: "Homeostasis", value: `${Math.round(m.homeostasis)}`, sub: "Built from lipids, elements, and evolution. Stable cells scale evolution more safely."}
      ]
    };
  }
  if(stage === "creature"){
    return {
      title: "Adaptation Pressure and Habitat Fit",
      detail: "Creature play rewards converting ecological stress into adaptation without falling out of sync with the habitat.",
      rows: [
        {label: "Adaptation Pressure", value: `${Math.round(m.adaptationPressure)}`, sub: "Built from knowledge, evolution, and food pressure. Drives body-plan growth."},
        {label: "Habitat Fit", value: `${Math.round(m.habitatFit)}`, sub: "Built from food and culture. Low habitat fit makes survival and growth less stable."}
      ]
    };
  }
  if(stage === "tribal"){
    return {
      title: "Cohesion and Supply",
      detail: "Tribal runs depend on holding the tribe together while keeping stores full enough to sustain growth and units.",
      rows: [
        {label: "Cohesion", value: `${Math.round(m.cohesion)}`, sub: "Raised by culture and influence. Low cohesion hurts happiness and influence output."},
        {label: "Supply", value: `${Math.round(m.supply)}`, sub: "Raised by food and material. Low supply raises rival pressure and weakens production."}
      ]
    };
  }
  if(stage === "civilization"){
    return {
      title: "Urbanization and Civic Order",
      detail: "Cities scale faster when urban growth is matched by civic stability.",
      rows: [
        {label: "Urbanization", value: `${Math.round(m.urbanization)}`, sub: "Drives material and knowledge scaling when sustained."},
        {label: "Civic Order", value: `${Math.round(m.civicOrder)}`, sub: "Prevents unrest from overwhelming a larger city-state."}
      ]
    };
  }
  if(stage === "empire"){
    return {
      title: "Bureaucracy and Logistics",
      detail: "Empire play is about turning scale into control instead of letting scale become drag.",
      rows: [
        {label: "Bureaucracy", value: `${Math.round(m.bureaucracy)}`, sub: "Built from influence and knowledge. Supports governance and long-range output."},
        {label: "Logistics", value: `${Math.round(m.logistics)}`, sub: "Built from energy and material. Prevents rival pressure from overwhelming the empire."}
      ]
    };
  }
  if(stage === "solar"){
    return {
      title: "Synchronization and Route Integrity",
      detail: "Solar play is about keeping colonies synchronized and transport routes intact while FTL stress rises.",
      rows: [
        {label: "Synchronization", value: `${Math.round(m.synchronization)}`, sub: "Built from knowledge and influence. Keeps the solar layer coordinated."},
        {label: "Route Integrity", value: `${Math.round(m.routeIntegrity)}`, sub: "Built from energy and material. Weak routes raise pressure and slow the economy."}
      ]
    };
  }
  if(stage === "galactic"){
    return {
      title: "Hegemony and Integration",
      detail: "Galactic play is about holding blocs together while integrating a civilization too large to manage casually.",
      rows: [
        {label: "Hegemony", value: `${Math.round(m.hegemony)}`, sub: "Built from influence and culture. Low hegemony accelerates fragmentation pressure."},
        {label: "Integration", value: `${Math.round(m.integration)}`, sub: "Built from knowledge and energy. Keeps the late game from collapsing under its own scale."}
      ]
    };
  }
  return null;
}

function scenarioRule(title, detail, mods){
  return {
    title,
    detail,
    mods: Object.assign({resMult: emptyResources(), happiness: 0, militaryThreat: 0, scoreBonus: 0}, mods || {})
  };
}

function activeScenarioRules(){
  const stage = currentStage().id;
  const traits = inheritedTraitIds();
  const rules = [];
  const world = currentWorld();
  const event = currentEvent();
  const disaster = currentDisaster();
  const crisis = currentCrisis();

  if(world.id === "volcanic"){
    if(traits.has("subterranean") || traits.has("fortified_lineage")){
      rules.push(scenarioRule("Volcanic Extraction", "Resilient lineages convert harsh ground into stronger material throughput.", {resMult: {...emptyResources(), material: 0.06}, militaryThreat: 2}));
    } else {
      rules.push(scenarioRule("Volcanic Instability", "The terrain slows food stability and raises local pressure.", {resMult: {...emptyResources(), food: -0.08}, happiness: -4, militaryThreat: 3}));
    }
  }
  if(world.id === "irradiated"){
    if(traits.has("photosynthetic_lineage") || currentFTLChoice() === "warp"){
      rules.push(scenarioRule("Radiant Adaptation", "Your build partially exploits high-radiation conditions.", {resMult: {...emptyResources(), energy: 0.05, knowledge: 0.03}}));
    } else {
      rules.push(scenarioRule("Radiation Drag", "Radiation disrupts energy and research scaling.", {resMult: {...emptyResources(), energy: -0.06, knowledge: -0.04}, happiness: -3}));
    }
  }
  if(world.id === "voidscar"){
    if(currentFTLChoice() === "wormholes" || traits.has("keen_senses")){
      rules.push(scenarioRule("Void Navigation Edge", "Your build reads unstable routes better than most rivals.", {resMult: {...emptyResources(), influence: 0.04, knowledge: 0.04}}));
    } else {
      rules.push(scenarioRule("Void Distance Tax", "Coordination becomes harder across fractured void corridors.", {resMult: {...emptyResources(), influence: -0.05, energy: -0.04}, militaryThreat: 4}));
    }
  }

  if(stage === "tribal" && event.id === "migration_season"){
    if(traits.has("mercantile_society") || traits.has("mobility_lineage")){
      rules.push(scenarioRule("Adaptive Migrations", "Movement pressure becomes an exchange opportunity.", {resMult: {...emptyResources(), influence: 0.05, culture: 0.04}, scoreBonus: 12}));
    } else {
      rules.push(scenarioRule("Disrupted Settlements", "Migration pressure strains food and cohesion.", {resMult: {...emptyResources(), food: -0.06, influence: -0.04}, happiness: -4}));
    }
    if(traits.has("arboreal") && traits.has("mercantile_society")){
      rules.push(scenarioRule("Brokered Migrations", "Canopy trade routes turn migration into market growth.", {resMult: {...emptyResources(), material: 0.04, influence: 0.04}, scoreBonus: 8}));
    }
  }
  if(stage === "creature" && event.id === "predator_bloom"){
    if(traits.has("poison_lineage") || traits.has("keen_senses")){
      rules.push(scenarioRule("Predator Counter-Adaptation", "You turn predator pressure into evolutionary learning.", {resMult: {...emptyResources(), evolution: 0.06, knowledge: 0.03}, scoreBonus: 10}));
    } else {
      rules.push(scenarioRule("Predator Pressure", "Food loops are less stable under heavy predation.", {resMult: {...emptyResources(), food: -0.08}, happiness: -2}));
    }
  }
  if(stage === "civilization" && event.id === "court_intrigue"){
    if(traits.has("mercantile_society") || traits.has("keen_senses")){
      rules.push(scenarioRule("Intrigue Exploitation", "Your state turns intrigue into information and leverage.", {resMult: {...emptyResources(), influence: 0.04, knowledge: 0.04}}));
    } else {
      rules.push(scenarioRule("Court Gridlock", "Administrative infighting slows progress.", {resMult: {...emptyResources(), influence: -0.08, knowledge: -0.04}, happiness: -3}));
    }
  }
  if(stage === "solar" && event.id === "solar_storm"){
    if(traits.has("photosynthetic_lineage") || currentFTLChoice() === "hyperlanes"){
      rules.push(scenarioRule("Storm Routing Discipline", "Known routes and radiant adaptation reduce storm losses.", {resMult: {...emptyResources(), energy: 0.03, influence: 0.03}}));
    } else {
      rules.push(scenarioRule("Storm Disruption", "Orbital systems suffer under repeated stellar spikes.", {resMult: {...emptyResources(), energy: -0.08, knowledge: -0.04}, militaryThreat: 3}));
    }
    if(traits.has("aerial") && traits.has("mercantile_society")){
      rules.push(scenarioRule("Sky Arbitrage", "Fast exchange networks profit from disrupted competitors.", {resMult: {...emptyResources(), influence: 0.04, material: 0.04}, scoreBonus: 10}));
    }
  }

  if(stage === "tribal" && disaster.id === "drought"){
    if(traits.has("aquatic") || traits.has("amphibious") || traits.has("photosynthetic_lineage")){
      rules.push(scenarioRule("Drought Adaptation", "Your lineage softens the worst food losses.", {resMult: {...emptyResources(), food: 0.04}, happiness: 2}));
    } else {
      rules.push(scenarioRule("Drought Scarcity", "Food and happiness suffer until stability improves.", {resMult: {...emptyResources(), food: -0.12}, happiness: -6}));
    }
  }
  if(stage === "civilization" && disaster.id === "plague"){
    if(traits.has("fungal") || traits.has("poison_lineage")){
      rules.push(scenarioRule("Plague Laboratories", "Your civilization extracts knowledge from crisis conditions.", {resMult: {...emptyResources(), knowledge: 0.05}, happiness: -2}));
    } else {
      rules.push(scenarioRule("Epidemic Fear", "Confidence and research both decline.", {resMult: {...emptyResources(), knowledge: -0.06}, happiness: -8}));
    }
  }
  if(stage === "solar" && disaster.id === "solar_flares"){
    if(currentFTLChoice() === "hyperlanes" || traits.has("keen_senses")){
      rules.push(scenarioRule("Flare Forecasting", "Route discipline and prediction reduce flare losses.", {resMult: {...emptyResources(), knowledge: 0.04, energy: 0.02}}));
    } else {
      rules.push(scenarioRule("Flare Blackouts", "Data and power infrastructure remain exposed.", {resMult: {...emptyResources(), energy: -0.1, knowledge: -0.06}, militaryThreat: 4}));
    }
  }
  if(stage === "galactic" && disaster.id === "wormhole_instability"){
    if(currentFTLChoice() === "wormholes"){
      rules.push(scenarioRule("Terminal Maintenance Crisis", "Your gate-based civilization faces direct strategic instability.", {resMult: {...emptyResources(), energy: -0.08, influence: -0.06}, militaryThreat: 6}));
    } else {
      rules.push(scenarioRule("Foreign Gate Shock", "Instability hurts trade and diplomacy more than movement.", {resMult: {...emptyResources(), influence: -0.04, knowledge: -0.02}, militaryThreat: 2}));
    }
  }

  if(stage === "tribal" && crisis.id === "tribal_revolt"){
    if(traits.has("isolationist_society") || traits.has("fortified_lineage")){
      rules.push(scenarioRule("Contained Revolt", "Strong internal cohesion contains most of the damage.", {happiness: 3, militaryThreat: -3, scoreBonus: 10}));
    } else {
      rules.push(scenarioRule("Open Revolt", "Unrest becomes a direct production and influence problem.", {resMult: {...emptyResources(), influence: -0.1, material: -0.04}, happiness: -8, militaryThreat: 4}));
    }
  }
  if(stage === "civilization" && crisis.id === "civil_war"){
    if(traits.has("militarist_society") || traits.has("fortified_lineage")){
      rules.push(scenarioRule("Martial Containment", "A harder state contains the split at significant cost.", {resMult: {...emptyResources(), material: -0.04, influence: -0.03}, happiness: -4, militaryThreat: 1}));
    } else {
      rules.push(scenarioRule("Fragmented Polity", "Civil conflict breaks material and influence loops.", {resMult: {...emptyResources(), material: -0.1, influence: -0.12}, happiness: -10, militaryThreat: 5}));
    }
  }
  if(stage === "empire" && crisis.id === "imperial_overstretch"){
    if(traits.has("developmental_society") || traits.has("mobility_lineage")){
      rules.push(scenarioRule("Managed Overstretch", "Strong logistics keep the empire from collapsing outright.", {resMult: {...emptyResources(), knowledge: 0.04, material: -0.04}, militaryThreat: 1}));
    } else {
      rules.push(scenarioRule("Logistics Breakdown", "Distance and scale punish material and energy output.", {resMult: {...emptyResources(), material: -0.1, energy: -0.06}, happiness: -6, militaryThreat: 5}));
    }
  }
  if(stage === "solar" && crisis.id === "colony_cascade"){
    if(traits.has("developmental_society") || currentFTLChoice() === "wormholes"){
      rules.push(scenarioRule("Emergency Stabilization", "Your institutions and transport recover colonies faster than expected.", {resMult: {...emptyResources(), energy: -0.04, material: -0.03, knowledge: 0.03}, militaryThreat: 2}));
    } else {
      rules.push(scenarioRule("Cascade Failure", "Support breakdowns ripple across the whole layer.", {resMult: {...emptyResources(), energy: -0.1, material: -0.08}, happiness: -8, militaryThreat: 6}));
    }
  }
  if(stage === "galactic" && crisis.id === "galactic_schism"){
    if(traits.has("mercantile_society") || currentFTLChoice() === "hyperlanes"){
      rules.push(scenarioRule("Bloc Bargaining", "Network leverage softens the worst of the schism.", {resMult: {...emptyResources(), influence: -0.04, culture: -0.03, material: 0.03}, militaryThreat: 2}));
    } else {
      rules.push(scenarioRule("Interstellar Fracture", "The schism breaks influence, culture, and strategic trust.", {resMult: {...emptyResources(), influence: -0.12, culture: -0.08, knowledge: -0.05}, happiness: -10, militaryThreat: 8}));
    }
    if(traits.has("subterranean") && traits.has("developmental_society")){
      rules.push(scenarioRule("Deep Continuity", "Layered internal planning limits the worst fragmentation costs.", {resMult: {...emptyResources(), material: 0.05, knowledge: 0.04}, scoreBonus: 14}));
    }
    if(traits.has("fungal") && traits.has("mercantile_society")){
      rules.push(scenarioRule("Memory Markets", "Fungal broker networks preserve trade trust through the schism.", {resMult: {...emptyResources(), influence: 0.04, knowledge: 0.04}, scoreBonus: 10}));
    }
  }

  return rules;
}

function scenarioRuleBundle(){
  const out = {resMult: emptyResources(), happiness: 0, militaryThreat: 0, scoreBonus: 0};
  for(const rule of activeScenarioRules()){
    const mods = rule.mods || {};
    out.happiness += mods.happiness || 0;
    out.militaryThreat += mods.militaryThreat || 0;
    out.scoreBonus += mods.scoreBonus || 0;
    for(const [k,v] of Object.entries(mods.resMult || {})) out.resMult[k] += v;
  }
  return out;
}

function challengeEffectsBundle(){
  const total={manual:0,auto:0,happiness:0,resMult:emptyResources(),resAdd:emptyResources()};
  for(const def of [currentEvent(), currentDisaster(), currentCrisis()]){
    if(!challengeApplies(def)) continue;
    const eff=def.effects||{};
    total.manual += eff.manual||0;
    total.auto += eff.auto||0;
    total.happiness += eff.happiness||0;
    for(const [k,v] of Object.entries(eff)){
      if(["manual","auto","happiness"].includes(k)) continue;
      if(k in total.resMult) total.resMult[k] += v;
    }
  }
  return total;
}
function totalChallengeDifficulty(){
  const world = 1 + Math.max(0, 1-(currentWorld().habitability||1))*2.2;
  const event = currentEvent().difficulty||0;
  const disaster = currentDisaster().difficulty||0;
  const crisis = currentCrisis().difficulty||0;
  return { world, event, disaster, crisis, total: world + event + disaster + crisis };
}
function totalPrestigeMultiplier(){
  const diff = totalChallengeDifficulty();
  return worldPrestigeMult() * (1 + (diff.event+diff.disaster+diff.crisis)*0.35);
}
function setEventChallenge(id){
  if(!challengeUnlocked() && id!=="none") return;
  const def = CHALLENGE_EVENTS.find(x=>x.id===id); if(!def) return;
  state.game.meta.selectedEvent=id; render();
}
function setDisasterChallenge(id){
  if(!challengeUnlocked() && id!=="none") return;
  const def = CHALLENGE_DISASTERS.find(x=>x.id===id); if(!def) return;
  state.game.meta.selectedDisaster=id; render();
}
function setCrisisChallenge(id){
  if(!challengeUnlocked() && id!=="none") return;
  const def = CHALLENGE_CRISES.find(x=>x.id===id); if(!def) return;
  state.game.meta.selectedCrisis=id; render();
}

function stageUsesHappiness(stageId=currentStage().id){return ["tribal","civilization","empire","solar","galactic"].includes(stageId);}
function currentWorld(){return WORLD_TYPES.find(w=>w.id===state.game.meta.selectedWorldType)||WORLD_TYPES[0];}


function markRunStarted(){
  state.ui.betweenRuns = false;
}
function shouldShowMetaPanel(){
  return state.ui.betweenRuns || challengeUnlocked();
}
function createMeta(){
  return {
    evoPoints:0,
    galacticWins:0,
    bestStage:0,
    prestige:Object.fromEntries(PRESTIGE.map(p=>[p.id,0])),
    archive:[],
    selectedWorldType:"terrestrial",
    selectedEvent:"none",
    selectedDisaster:"none",
    selectedCrisis:"none"
  };
}
function createRun(meta){
  const run={
    time:0,
    stageIndex:0,
    selectedPath:"balanced",
    population:8,
    resources:emptyResources(),
    automation:{},
    currentContentOwned:{},
    currentUnitsOwned:{},
    currentLuxuriesOwned:{},
    stageMechanics:stageMechanicDefaults(),
    archetype:emptyArchetypes(),
    inheritedTraits:[],
    happiness:100,
    rebellion:0,
    logs:["New run started at the Cell Stage."],
  };
  const start=prestigeLevel("start", meta)*5;
  for(const key of ["glucose","proteins","lipids","elements","food","material","knowledge"]) run.resources[key]+=start;
  return run;
}
function createGame(){const meta=createMeta(); return {meta,run:createRun(meta)};}
function hydrateGame(raw){
  const game=createGame();
  if(raw?.meta) Object.assign(game.meta, raw.meta);
  if(raw?.run) Object.assign(game.run, raw.run);
  for(const [id] of RESOURCES){ if(typeof game.run.resources[id]!=="number") game.run.resources[id]=0; }
  if(!game.run.automation) game.run.automation={};
  if(!game.run.currentContentOwned) game.run.currentContentOwned={};
  if(!game.run.currentUnitsOwned) game.run.currentUnitsOwned={};
  if(!game.run.currentLuxuriesOwned) game.run.currentLuxuriesOwned={};
  game.run.stageMechanics = game.run.stageMechanics || stageMechanicDefaults();
  for(const [k,v] of Object.entries(stageMechanicDefaults())) if(typeof game.run.stageMechanics[k] !== "number") game.run.stageMechanics[k]=v;
  if(!game.run.inheritedTraits) game.run.inheritedTraits=[];
  if(!Array.isArray(game.run.logs)) game.run.logs=[];
  return game;
}
function loadGame(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    state.game=raw?hydrateGame(JSON.parse(raw)):createGame();
  }catch{ state.game=createGame(); }
  state.ui.betweenRuns = state.game.run.time < 1 && state.game.run.stageIndex === 0 && !Object.keys(state.game.run.currentContentOwned||{}).length && !Object.values(state.game.run.automation||{}).reduce((a,b)=>a+b,0);
}
function saveGame(silent=false){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.game));
  if(!silent) pushLog("Saved.");
}
function resetAll(){
  localStorage.removeItem(STORAGE_KEY);
  state.game=createGame();
  state.ui.betweenRuns = false;
  render();
}
function pushLog(msg){
  state.game.run.logs.unshift(`t=${Math.round(state.game.run.time)}s • ${msg}`);
  state.game.run.logs=state.game.run.logs.slice(0,160);
}
function affordable(cost){return Object.entries(cost||{}).every(([k,v])=>(state.game.run.resources[k]||0)>=v);}
function spend(cost){for(const [k,v] of Object.entries(cost||{})) state.game.run.resources[k]-=v;}
function bundleText(bundle,suffix=""){return Object.entries(bundle||{}).map(([k,v])=>`${resourceName(k)} ${fmt.format(v)}${suffix}`).join(" • ");}

function scaledCost(cost, owned){
  const factor=Math.pow(1.16,owned)*costMult();
  const out={}; for(const [k,v] of Object.entries(cost)) out[k]=Math.max(1,Math.round(v*factor*10)/10); return out;
}
function applyBundle(bundle,m=1){for(const [k,v] of Object.entries(bundle||{})) state.game.run.resources[k]=(state.game.run.resources[k]||0)+v*m;}


function inheritedTraitIds(){ const ids=new Set((state.game.run.inheritedTraits||[]).map(t=>t.id)); for(const item of stageSystemDefs()){ if(!hasCurrentContent(item.id)) continue; for(const t of (item.traits||[])) ids.add(t.id); } return ids; }
function hasRequiredTraits(item){
  const req=item.requireTraits||[];
  if(!req.length) return true;
  const owned=inheritedTraitIds();
  return req.every(id=>owned.has(id));
}
function availableTraitLockedName(item){
  return (item.requireTraits||[]).map(id=>{
    const trait=state.game.run.inheritedTraits.find(t=>t.id===id);
    return trait?.label || id;
  }).join(" • ");
}
function stageSystemDefs(stageId=currentStage().id){
  return [
    ...(STAGE_CONTENT[stageId]||[]),
    ...(ARCHETYPE_SYSTEMS[stageId]||[]),
    ...(SOCIETAL_SYSTEMS[stageId]||[]),
    ...(TRAIT_CHAIN_SYSTEMS[stageId]||[]),
    ...(COMBO_CHAIN_SYSTEMS[stageId]||[]),
    ...(EXTRA_COMBO_CHAIN_SYSTEMS[stageId]||[])
  ];
}

function allCurrentAutomation(){
  return [
    ...currentStage().automation,
    ...((SPECIAL_AUTOMATION[currentStage().id]||[]).filter(item=>hasRequiredTraits(item))),
    ...((typeof FTL_CHAIN_AUTOMATION !== "undefined" ? (FTL_CHAIN_AUTOMATION[currentStage().id]||[]) : []).filter(item=>hasRequiredTraits(item)))
  ];
}


function unitClassBucket(unitClass){
  if(["melee","ranged","heavy_cavalry","siege","naval_melee","naval_ranged","escort","frigate","destroyer","cruiser","carrier","battleship","titan","juggernaut","defense_platform","religious_military"].includes(unitClass)) return "military";
  if(["trade","transport","logistics","settler","colony_ship","construction_ship"].includes(unitClass)) return "trade";
  if(["support","religious","diplomatic"].includes(unitClass)) return "support";
  return "special";
}

function playerUnitComposition(){
  const comp = { military: 0, trade: 0, support: 0, special: 0 };
  for (const unit of currentUnits()) {
    const count = state.game.run.currentUnitsOwned[unit.id] || 0;
    if (!count) continue;
    comp[unitClassBucket(unit.class)] += count;
  }
  return comp;
}

function rivalFactionIdentity(){
  const rival = currentRivalFocus();
  const comp = rivalCompositionForStage();
  if (!rival) {
    return { name: "No active rivals", doctrine: "none", archetype: "mixed", favoredUnits: [], economicPressure: [], counterplay: "none" };
  }
  const favoredUnits = [];
  if (rival.focus === "military") favoredUnits.push("frontline fleets", "raiders", "shock units");
  if (rival.focus === "trade") favoredUnits.push("convoys", "merchant hulls", "escort screens");
  if (rival.focus === "stability") favoredUnits.push("garrisons", "fortresses", "defense platforms");
  if (rival.focus === "growth") favoredUnits.push("builders", "support corps", "expansion cadres");
  const economicPressure = Object.keys(rival.penalty || {}).map(key => resourceName(key));
  return { name: rival.name, doctrine: rival.focus, archetype: comp.archetype, favoredUnits, economicPressure, counterplay: (rival.counter || "none").replace("_society", "") };
}

function rivalCounterMismatch(){
  const rival = currentRivalFocus();
  if (!rival) return 0;
  const comp = playerUnitComposition();
  let score = 0;
  if (rival.focus === "military") score = comp.military + comp.support * 0.5;
  else if (rival.focus === "trade") score = comp.trade + comp.military * 0.3;
  else if (rival.focus === "stability") score = comp.support + comp.military * 0.4;
  else if (rival.focus === "growth") score = comp.special + comp.support * 0.5;

  if (inheritedTraitIds().has(rival.counter)) score += 3;
  if (score >= 8) return 0;
  if (score >= 4) return 0.05;
  return 0.1;
}
function rivalCompositionForStage(){
  const rival = currentRivalFocus();
  const traits = inheritedTraitIds();
  if(!rival) return {military:0,trade:0,defense:0,special:0,archetype:"mixed"};
  let archetype = "mixed";
  if(traits.has("arboreal")) archetype = "arboreal";
  else if(traits.has("aerial")) archetype = "aerial";
  else if(traits.has("subterranean")) archetype = "subterranean";
  else if(traits.has("fungal")) archetype = "fungal";
  else if(traits.has("aquatic")) archetype = "aquatic";
  else if(traits.has("amphibious")) archetype = "amphibious";

  const base = {
    military: rival.focus === "military" ? 0.55 : 0.25,
    trade: rival.focus === "trade" ? 0.5 : 0.2,
    defense: rival.focus === "stability" ? 0.5 : 0.2,
    special: rival.focus === "growth" ? 0.45 : 0.2
  };
  if(archetype === "aerial"){ base.military += 0.08; base.special += 0.04; }
  if(archetype === "subterranean"){ base.defense += 0.1; }
  if(archetype === "fungal"){ base.special += 0.08; base.defense += 0.04; }
  if(archetype === "arboreal"){ base.trade += 0.08; }
  if(archetype === "aquatic"){ base.trade += 0.06; base.special += 0.04; }
  if(archetype === "amphibious"){ base.trade += 0.04; base.defense += 0.04; }
  return { ...base, archetype };
}

function rivalDoctrineForStage(stageId){
  const stageRivals = {
    tribal: [
      {name:"Raiders", focus:"military", threat:22, counter:"militarist_society", penalty:{food:0.12,material:0.08}},
      {name:"Traders", focus:"trade", threat:18, counter:"mercantile_society", penalty:{material:0.1,influence:0.08}},
      {name:"Hermits", focus:"stability", threat:16, counter:"isolationist_society", penalty:{culture:0.08,faith:0.08}},
      {name:"Settlers", focus:"growth", threat:18, counter:"developmental_society", penalty:{food:0.08,knowledge:0.08}},
    ],
    civilization: [
      {name:"Border Kingdoms", focus:"military", threat:34, counter:"militarist_society", penalty:{material:0.12,influence:0.12}},
      {name:"Merchant Leagues", focus:"trade", threat:28, counter:"mercantile_society", penalty:{material:0.14,knowledge:0.08}},
      {name:"Closed Theocracies", focus:"stability", threat:26, counter:"isolationist_society", penalty:{culture:0.12,faith:0.12}},
      {name:"Builder Republics", focus:"growth", threat:30, counter:"developmental_society", penalty:{material:0.1,knowledge:0.12}},
    ],
    empire: [
      {name:"War Powers", focus:"military", threat:54, counter:"militarist_society", penalty:{material:0.14,influence:0.16,energy:0.08}},
      {name:"Cartel Blocs", focus:"trade", threat:46, counter:"mercantile_society", penalty:{material:0.16,energy:0.08}},
      {name:"Fortress States", focus:"stability", threat:42, counter:"isolationist_society", penalty:{culture:0.14,faith:0.1}},
      {name:"Growth Federations", focus:"growth", threat:48, counter:"developmental_society", penalty:{material:0.12,knowledge:0.14}},
    ],
    solar: [
      {name:"Battle Fleets", focus:"military", threat:88, counter:"militarist_society", penalty:{material:0.16,influence:0.18,energy:0.1}},
      {name:"Trade Syndicates", focus:"trade", threat:80, counter:"mercantile_society", penalty:{material:0.18,energy:0.12,influence:0.08}},
      {name:"Shield Collectives", focus:"stability", threat:72, counter:"isolationist_society", penalty:{culture:0.16,faith:0.12}},
      {name:"Expansion Directorates", focus:"growth", threat:82, counter:"developmental_society", penalty:{material:0.14,knowledge:0.16,energy:0.08}},
    ],
    galactic: [
      {name:"Hegemon Legions", focus:"military", threat:132, counter:"militarist_society", penalty:{material:0.18,influence:0.2,energy:0.12}},
      {name:"Commerce Webs", focus:"trade", threat:122, counter:"mercantile_society", penalty:{material:0.18,energy:0.14,knowledge:0.08}},
      {name:"Silent Spheres", focus:"stability", threat:112, counter:"isolationist_society", penalty:{culture:0.18,faith:0.14}},
      {name:"Growth Hives", focus:"growth", threat:126, counter:"developmental_society", penalty:{material:0.14,knowledge:0.18,energy:0.1}},
    ]
  };
  return stageRivals[stageId] || [];
}
function currentRivalFocus(){
  const rivals = rivalDoctrineForStage(currentStage().id);
  if(!rivals.length) return null;
  const owned = inheritedTraitIds();
  const ftl = typeof currentFTLChoice === "function" ? currentFTLChoice() : "";
  if(currentStage().id==="solar"){
    if(ftl==="warp") return {name:"Warp Interceptors", focus:"military", threat:102, counter:"militarist_society", penalty:{energy:0.1,influence:0.08,material:0.06}};
    if(ftl==="wormholes") return {name:"Gate Brokers", focus:"trade", threat:98, counter:"mercantile_society", penalty:{knowledge:0.08,influence:0.1,energy:0.06}};
  }
  if(currentStage().id==="galactic"){
    if(ftl==="hyperlanes") return {name:"Gate Blockers", focus:"stability", threat:142, counter:"isolationist_society", penalty:{culture:0.14,influence:0.12,material:0.08}};
    if(ftl==="warp") return {name:"Outrider Swarms", focus:"military", threat:146, counter:"militarist_society", penalty:{influence:0.16,energy:0.12,material:0.08}};
    if(ftl==="wormholes") return {name:"Terminal Cartels", focus:"trade", threat:144, counter:"mercantile_society", penalty:{knowledge:0.12,influence:0.14,energy:0.1}};
  }
  const matched = rivals.find(r => owned.has(r.counter));
  return matched || rivals[0];
}
function rivalPressurePenaltyBundle(){
  const rival = currentRivalFocus();
  if(!rival || currentMilitaryBundle().militaryStrength >= rival.threat) return emptyResources();
  const gapRatio = Math.min(1, (rival.threat - currentMilitaryBundle().militaryStrength) / rival.threat);
  const out = emptyResources();
  for(const [k,v] of Object.entries(rival.penalty||{})) out[k] = v * gapRatio;
  return out;
}


function generatorMultiplierForCount(count){
  return Math.pow(2, Math.floor((count||0)/10));
}
function generatorStageScale(stageId){
  return {cell:0.22,creature:0.28,tribal:0.34,civilization:0.42,empire:0.56,solar:0.78,galactic:1.05}[stageId] || 0.3;
}
function resourceGeneratorDefs(stageId=currentStage().id){
  const stage = STAGES.find(s=>s.id===stageId);
  if(!stage) return [];
  const roots = stage.resources;
  const payA = roots[0];
  const payB = roots[1] || roots[0];
  return roots.flatMap((res, idx) => {
    const base = generatorStageScale(stageId) * (1 + idx*0.08);
    return [1,2,3].map(tier => ({
      id:`${stageId}_${res}_gen_t${tier}`,
      name:`${resourceName(res)} Generator T${tier}`,
      description:`Tier ${tier} generator for ${resourceName(res)}. Output doubles every 10 owned.`,
      bucket: classifyGeneratorBucket(stageId, res),
      cost: {[payA]: Math.max(1, Math.round((6 + idx*2) * tier)), [payB]: Math.max(1, Math.round((4 + idx*2) * tier))},
      effects: {[res]: +(base * Math.pow(2, tier-1)).toFixed(2)},
      unlockAt: tier===1 ? {} : {[res]: Math.max(4, 10*tier)},
      generatorTier:tier,
      lowerTierId:tier>1 ? `${stageId}_${res}_gen_t${tier-1}` : "",
      lowerTierCost:tier>1 ? 10 : 0
    }));
  });
}
function classifyGeneratorBucket(stageId, res){
  const map = {
    cell:{glucose:"core",proteins:"core",lipids:"core",elements:"core",evolution:"core"},
    creature:{food:"survival",knowledge:"survival",culture:"survival",evolution:"survival",material:"survival"},
    tribal:{food:"food",material:"craft",knowledge:"craft",culture:"culture",faith:"culture",influence:"culture"},
    civilization:{food:"food",material:"economy",knowledge:"knowledge",culture:"culture",faith:"culture",influence:"economy"},
    empire:{material:"infrastructure",knowledge:"knowledge",culture:"identity",faith:"identity",influence:"identity",energy:"energy"},
    solar:{food:"colonies",material:"industry",knowledge:"science",culture:"colonies",influence:"industry",energy:"energy"},
    galactic:{food:"culture",material:"material",knowledge:"knowledge",culture:"culture",influence:"culture",energy:"energy"}
  };
  return map[stageId]?.[res] || "core";
}
function generatorRequirementMet(item){
  if(!item.lowerTierId) return true;
  return (state.game.run.automation[item.lowerTierId]||0) >= (item.lowerTierCost||0);
}
function generatorRequirementText(item){
  if(!item.lowerTierId) return "";
  const lowerName = currentAutomationItems().find(x=>x.id===item.lowerTierId)?.name || item.lowerTierId;
  return `${item.lowerTierCost} ${lowerName}`;
}
function currentUnits(){
  return [
    ...(STAGE_UNITS[currentStage().id]||[]),
    ...(ARCHETYPE_UNITS[currentStage().id]||[]),
    ...(SOCIETAL_UNITS[currentStage().id]||[]),
    ...(TRAIT_CHAIN_UNITS[currentStage().id]||[]),
    ...(COMBO_CHAIN_UNITS[currentStage().id]||[]),
    ...(EXTRA_COMBO_CHAIN_UNITS[currentStage().id]||[]),
    ...((typeof FTL_CHAIN_UNITS !== "undefined" ? (FTL_CHAIN_UNITS[currentStage().id]||[]) : []))
  ];
}
function currentAutomationItems(stageId=currentStage().id){
  return [
    ...(STAGES.find(s=>s.id===stageId)?.automation||[]),
    ...resourceGeneratorDefs(stageId),
    ...((SPECIAL_AUTOMATION[stageId]||[]).filter(item=>hasRequiredTraits(item))),
    ...((typeof FTL_CHAIN_AUTOMATION !== "undefined" ? (FTL_CHAIN_AUTOMATION[stageId]||[]) : []).filter(item=>hasRequiredTraits(item)))
  ];
}
function unitStrengthValue(unit){
  const baseMap={support:2,trade:1,transport:1,logistics:1,settler:0,colony_ship:0,construction_ship:0,recon:4,religious:3,diplomatic:2,melee:8,ranged:7,heavy_cavalry:10,siege:11,naval_melee:9,naval_ranged:9,escort:8,frigate:10,destroyer:12,cruiser:14,carrier:16,battleship:18,titan:24,juggernaut:30,defense_platform:14,religious_military:8};
  return (unit.strength||0) + (baseMap[unit.class]||4);
}
function unitBonusBundle(){
  const total={happiness:0,resMult:emptyResources(),resAdd:emptyResources(),militaryStrength:0};
  for(const unit of currentUnits()){
    const count=state.game.run.currentUnitsOwned[unit.id]||0;
    if(!count) continue;
    total.militaryStrength += unitStrengthValue(unit)*count;
    const bonus=unit.bonus||{};
    total.happiness += (bonus.happiness||0)*count;
    for(const [k,v] of Object.entries(bonus.resMult||{})) total.resMult[k]+=v*count;
    for(const [k,v] of Object.entries(bonus.resAdd||{})) total.resAdd[k]+=v*count;
    if(unitRole(unit.class)==='civil'){
      total.resAdd.material += 0.08*count;
      total.resAdd.food += 0.06*count;
    } else if(unitRole(unit.class)==='special'){
      total.resAdd.knowledge += 0.08*count;
      total.resAdd.influence += 0.05*count;
    }
  }
  return total;
}
function rivalThreatBase(){
  const stage=currentStage().id;
  return {cell:0,creature:0,tribal:22,civilization:40,empire:62,solar:92,galactic:135}[stage]||0;
}
function rivalThreatValue(){
  const base=rivalThreatBase();
  if(!base) return 0;
  const diff=totalChallengeDifficulty();
  const mod=(diff.event+diff.disaster+diff.crisis)*12 + Math.max(0,(1-currentWorld().habitability))*20;
  return Math.round(base+mod);
}
function militaryStrength(){
  let strength = unitBonusBundle().militaryStrength + Object.values(state.game.run.automation).reduce((s,v)=>s+v,0)*0.6 + Object.keys(state.game.run.currentContentOwned).length*1.5;
  const mismatch = rivalCounterMismatch();
  if (mismatch <= 0) strength *= 1.06;
  else if (mismatch < 0.1) strength *= 1.02;
  return Math.round(strength);
}
function rivalGap(){ return Math.max(0, rivalThreatValue()-militaryStrength()); }
function rivalOutputMultiplier(){
  if(!stageUsesHappiness()) return 1;
  const gap=rivalGap();
  let out = 1;
  if(gap<=0) out = 1;
  else if(gap<15) out = 0.94;
  else if(gap<35) out = 0.86;
  else out = 0.75;
  out -= rivalCounterMismatch();
  return Math.max(0.6, out);
}

function currentLuxuries(){return LUXURY_DEFS[currentStage().id]||[];}
function hasCurrentContent(id){return !!state.game.run.currentContentOwned[id];}
function hasCurrentLuxury(id){return !!state.game.run.currentLuxuriesOwned[id];}

function totalBonuses(){
  const total={manual:0,auto:0,carry:0,happiness:0,resMult:emptyResources(),resAdd:emptyResources()};
  const defs=stageSystemDefs();
  for(const item of defs){
    if(!hasCurrentContent(item.id)) continue;
    total.manual += item.bonus.manual||0;
    total.auto += item.bonus.auto||0;
    total.carry += item.bonus.carry||0;
    total.happiness += item.bonus.happiness||0;
    for(const [k,v] of Object.entries(item.bonus.resMult||{})) total.resMult[k]+=v;
    for(const [k,v] of Object.entries(item.bonus.resAdd||{})) total.resAdd[k]+=v;
  }
  for(const trait of state.game.run.inheritedTraits){
    const b=trait.bonus||{};
    total.manual += b.manual||0;
    total.auto += b.auto||0;
    total.carry += b.carry||0;
    total.happiness += b.happiness||0;
    for(const [k,v] of Object.entries(b.resMult||{})) total.resMult[k]+=v;
    for(const [k,v] of Object.entries(b.resAdd||{})) total.resAdd[k]+=v;
  }
  for(const lux of currentLuxuries()){
    if(!hasCurrentLuxury(lux.id)) continue;
    total.happiness += lux.gain.happiness||0;
    for(const [k,v] of Object.entries(lux.gain)){ if(k!=="happiness") total.resAdd[k]+=v; }
  }
  const unitBonuses=unitBonusBundle();
  total.happiness += unitBonuses.happiness||0;
  for(const [k,v] of Object.entries(unitBonuses.resMult||{})) total.resMult[k]+=v;
  for(const [k,v] of Object.entries(unitBonuses.resAdd||{})) total.resAdd[k]+=v;
  return total;
}

function worldMultiplier(){
  const world=currentWorld();
  const dom=dominantArchetype()[0];
  let mult=world.habitability||1;
  if((world.best_fit_archetypes||[]).includes(dom)) mult += 0.08;
  return mult;
}
function worldPrestigeMult(){
  const h=currentWorld().habitability||1;
  return 1 + Math.max(0, 1-h)*2.2;
}
function currentStageScore(){
  const stage=currentStage();
  const r=state.game.run.resources;
  let score=0;
  for(const key of stage.resources){
    const value = Math.max(0, r[key]||0);
    score += Math.sqrt(value) * 6;
  }
  score += Math.sqrt(Math.max(1,state.game.run.population))*12;
  score += Object.keys(state.game.run.currentContentOwned).length*10;
  score += Object.values(state.game.run.automation).reduce((s,v)=>s+Math.sqrt(v||0),0)*6;
  score += Object.values(state.game.run.currentUnitsOwned).reduce((s,v)=>s+Math.sqrt(v||0),0)*5;
  score += Object.keys(state.game.run.currentLuxuriesOwned).length*10;
  if(stageUsesHappiness()) score += Math.max(0,state.game.run.happiness-50)*1.5 - state.game.run.rebellion*3;
  score += scenarioRuleBundle().scoreBonus || 0;
  score += stageMechanicBundle().scoreBonus || 0;
  return Math.max(0, Math.round(score));
}
function evolveStatus(){
  const stage=currentStage();
  const score=currentStageScore();
  let detail=`Score ${Math.round(score)} / ${stage.scoreTarget}`;
  let gateReady=true;
  if(stage.id==="cell"){
    const ok=hasCurrentContent("nucleus");
    gateReady=ok;
    detail += ok ? " • Nucleus acquired" : " • Nucleus required";
  }
  if(stage.id==="solar"){
    const ok=stageSystemDefs("solar").some(x=>x.category==="ftl" && hasCurrentContent(x.id));
    gateReady=ok;
    detail += ok ? " • FTL tested" : " • FTL required";
  }
  if(stage.id==="galactic"){
    const ok=stageSystemDefs("galactic").some(x=>x.category==="victory" && hasCurrentContent(x.id));
    gateReady=ok;
    detail += ok ? " • Victory path chosen" : " • Victory path required";
  }
  return {
    ready: score>=stage.scoreTarget && gateReady,
    percent: Math.min(1, score/stage.scoreTarget),
    detail
  };
}
function visibleResources(){
  return currentStage().resources.filter(x=>x!=="happiness");
}
function dominantArchetype(){
  return Object.entries(state.game.run.archetype).sort((a,b)=>b[1]-a[1])[0];
}

function stageHintText(){
  const stage=currentStage().id;
  if(stage==="cell") return "Cell is about organelle choices. Build toward Nucleus, then Evolve. Old cell generators retire completely afterward.";
  if(stage==="creature") return "Adaptations are the main lever here. The body plan you choose should shape later stages.";
  if(stage==="tribal") return "Tribal introduces multi-system play: leaders, tech, units, luxuries, and rebellion management.";
  if(stage==="civilization") return "Civics, religion, and tech should come before brute-forcing more city structures.";
  if(stage==="empire") return "Use doctrines and edicts as macro multipliers, then let infrastructure cash them in.";
  if(stage==="solar") return "Pick an FTL method before Galactic. Policies and megastructures should shape the whole layer.";
  return "Choose a victory path, stack galactic systems, and win the run to unlock harsher worlds.";
}
function stageRetirementText(){
  return `When you Evolve, ${currentStage().name} resources, automation, units, and luxuries retire. Only archetypes, inherited traits, archive history, and meta bonuses continue.`;
}
function stageTargetTime(){ return [300,420,660,900,1200,1500,1800][state.game.run.stageIndex] || 1800; }
function paceLabel(){
  const ratio=state.game.run.time/stageTargetTime();
  if(ratio<0.75) return "Ahead of target pace";
  if(ratio<1.2) return "On target pace";
  return "Behind target pace";
}
function advisorState(){
  const stage=currentStage();
  if(stage.id==="cell" && !hasCurrentContent("nucleus")) return {text:"You are blocked by the nucleus gate. Build organelles toward Nucleus first.", pace:`${paceLabel()} • Target ${Math.round(stageTargetTime()/60)} min`};
  if(["tribal","civilization","empire","solar","galactic"].includes(stage.id) && !stageSystemDefs(stage.id).some(x=>x.category==="society" && hasCurrentContent(x.id))) return {text:"Choose a society doctrine. Lineage sets tendencies, but doctrine decides whether this run becomes militarist, mercantile, isolationist, or developmental.", pace:`${paceLabel()} • Target ${Math.round(stageTargetTime()/60)} min`};
  if(stage.id==="solar" && !stageSystemDefs("solar").some(x=>x.category==="ftl" && hasCurrentContent(x.id))) return {text:"Solar cannot Evolve until you choose one FTL method. Open the FTL subsystem.", pace:`${paceLabel()} • Target ${Math.round(stageTargetTime()/60)} min`};
  if(stageUsesHappiness() && state.game.run.happiness<55) return {text:"Happiness is too low. Secure luxury resources or rebellion will cut output.", pace:`${paceLabel()} • Happiness ${Math.round(state.game.run.happiness)} • Rebellion ${Math.round(state.game.run.rebellion)}`};
  const rival=currentRivalFocus(); const military=currentMilitaryBundle();
  if(rival && military.rivalGap>0 && ["tribal","civilization","empire","solar","galactic"].includes(stage.id)) return {text:`Your rivals are leaning ${rival.focus}. Matching them with the right doctrine, lineage combo, and unit mix will reduce pressure.`, pace:`${paceLabel()} • Military gap ${Math.round(military.rivalGap)}`};
  const mutRows=activeMutatorRows();
  if(mutRows.length){
    const traits=inheritedTraitIds();
    if(traits.has("photosynthetic_lineage") || traits.has("poison_lineage") || traits.has("fortified_lineage") || traits.has("keen_senses") || traits.has("mobility_lineage")) {
      return {text:"Your mutators are interacting with lineage and doctrine. Check whether this run setup helps or hurts your inherited traits.", pace:`${paceLabel()} • Score ${Math.round(currentStageScore())}/${currentStage().scoreTarget}`};
    }
  }
  if(stageMechanicInfo()) return {text:`This stage now has its own internal pressure model: ${stageMechanicInfo().title}. Keep those values healthy or the layer will slow down.`, pace:`${paceLabel()} • Score ${Math.round(currentStageScore())}/${currentStage().scoreTarget}`};
  return {text:stageHintText(), pace:`${paceLabel()} • Score ${Math.round(currentStageScore())}/${currentStage().scoreTarget}`};
}


function effectiveSystemPrereq(item){
  if(item.prereq) return item.prereq;
  if(currentStage().id !== "cell") return "";
  const map = {
    cell_wall:"nucleus",
    centrioles:"nucleus",
    mycelium_lattice:"nucleus",
    chloroplast:"cell_wall",
    chemoreceptors:"centrioles",
    toxin_vacuoles:"centrioles"
  };
  return map[item.id] || "";
}
function visibleSystemItem(item){
  const prereq = effectiveSystemPrereq(item);
  return !prereq || hasCurrentContent(prereq) || state.ui.debug;
}

function lockReasonForSystem(item){
  const prereq = effectiveSystemPrereq(item);
  if(prereq && !hasCurrentContent(prereq)) return `Needs ${stageSystemDefs().find(x=>x.id===prereq)?.name || prereq}`;
  const blocked = contentBlockedBy(item);
  if(blocked) return `Blocked by ${stageSystemDefs().find(x=>x.id===blocked)?.name || blocked}`;
  if(item.requireTraits?.length && !hasRequiredTraits(item)) return `Requires ${availableTraitLockedName(item)}`;
  if(!affordable(item.cost)) return `Need ${bundleText(item.cost)}`;
  return "";
}
function lockReasonForAutomation(item, cost, unlocked){
  if(item.requireTraits?.length && !hasRequiredTraits(item)) return `Requires ${availableTraitLockedName(item)}`;
  if(!unlocked && item.unlockAt && Object.keys(item.unlockAt).length) return `Unlock at ${bundleText(item.unlockAt)}`;
  if(item.lowerTierId && !generatorRequirementMet(item)) return `Needs ${generatorRequirementText(item)}`;
  if(!affordable(cost)) return `Need ${bundleText(cost)}`;
  return "";
}
function lockReasonForUnit(unit, cost){
  if(unit.requireTraits?.length && !hasRequiredTraits(unit)) return `Requires ${availableTraitLockedName(unit)}`;
  if(!affordable(cost)) return `Need ${bundleText(cost)}`;
  return "";
}
function automationSummaryData(){
  const items=currentAutomationItems();
  const owned=items.map(item=>({item,count:state.game.run.automation[item.id]||0})).filter(x=>x.count>0);
  const total=owned.reduce((s,x)=>s+x.count,0);
  const gens=owned.filter(x=>x.item.generatorTier).reduce((s,x)=>s+x.count,0);
  const tier2=owned.filter(x=>x.item.generatorTier===2).reduce((s,x)=>s+x.count,0);
  const tier3=owned.filter(x=>x.item.generatorTier===3).reduce((s,x)=>s+x.count,0);
  const top=owned.sort((a,b)=>b.count-a.count)[0];
  return {total,gens,tier2,tier3,top:top?`${top.item.name} ×${top.count}`:"None"};
}
function ownedSystemsForCurrentStage(){
  return stageSystemDefs().filter(item => hasCurrentContent(item.id));
}
function systemsSubsystems(stageId){
  return {
    cell:[{id:"organelle",label:"Organelles",category:"organelle",hint:"Choose permanent cell specializations before the layer retires."}],
    creature:[{id:"physical",label:"Physical",category:"physical",hint:"Body-plan and physical adaptations."},{id:"combat",label:"Combat",category:"combat",hint:"Aggressive and weaponized evolution."},{id:"survival",label:"Survival",category:"survival",hint:"Stability, resilience, and ecological survival."}],
    tribal:[{id:"leader",label:"Leaders",category:"leader",hint:"Leadership shapes the tribe."},{id:"tech",label:"Tech",category:"tech",hint:"Foundational technologies."},{id:"society",label:"Society",category:"society",hint:"Choose what kind of tribe this lineage becomes: war, trade, isolation, or development."}],
    civilization:[{id:"civic",label:"Civics",category:"civic",hint:"State structure and identity."},{id:"religion",label:"Religion",category:"religion",hint:"One founding religion per stage."},{id:"tech",label:"Tech",category:"tech",hint:"Formal knowledge systems."},{id:"society",label:"Society",category:"society",hint:"Pick a social doctrine independent of lineage."}],
    empire:[{id:"doctrine",label:"Doctrines",category:"doctrine",hint:"Empire-wide ideology."},{id:"edict",label:"Edicts",category:"edict",hint:"Imperial governance levers."},{id:"tech",label:"Tech",category:"tech",hint:"Industrial and administrative depth."},{id:"society",label:"Society",category:"society",hint:"Your empire can still be militarist, mercantile, isolationist, or developmental."}],
    solar:[{id:"policy",label:"Policies",category:"policy",hint:"Colony-scale policy choices."},{id:"tech",label:"Tech",category:"tech",hint:"Orbital and interplanetary research."},{id:"megastructure",label:"Megastructures",category:"megastructure",hint:"Massive stellar investments."},{id:"ftl",label:"FTL",category:"ftl",hint:"Choose one FTL method before Galactic."},{id:"society",label:"Society",category:"society",hint:"Interstellar doctrine stays independent of biological lineage."}],
    galactic:[{id:"alignment",label:"Alignments",category:"alignment",hint:"Late-game bloc identity."},{id:"tech",label:"Tech",category:"tech",hint:"Interstellar research."},{id:"megastructure",label:"Megastructures",category:"megastructure",hint:"Cosmic-scale construction."},{id:"victory",label:"Victory",category:"victory",hint:"Pick a win path before finishing the run."},{id:"society",label:"Society",category:"society",hint:"Late society doctrine determines how the galactic state behaves."}],
  }[stageId] || [];
}
function applySystemsPreset(){
  const subs=systemsSubsystems(currentStage().id);
  if(!subs.some(s=>s.id===state.ui.systemsSub)) state.ui.systemsSub=subs[0]?.id||"";
}
function filteredSystemsItems(){
  const sub=systemsSubsystems(currentStage().id).find(s=>s.id===state.ui.systemsSub);
  return stageSystemDefs().filter(x=>x.category===sub?.category && !hasCurrentContent(x.id) && visibleSystemItem(x));
}

function automationBuckets(stageId){
  return {
    cell:[{id:"core",label:"Core",hint:"Core cell growth generators."}],
    creature:[{id:"survival",label:"Survival",hint:"Food, knowledge, and nesting loops."}],
    tribal:[{id:"food",label:"Food",hint:"Food structures."},{id:"craft",label:"Craft",hint:"Material loops."},{id:"culture",label:"Culture",hint:"Traditions and social output."},{id:"units",label:"Units",hint:"Civil, military, and special tribal units."},{id:"luxury",label:"Luxury",hint:"Happiness and rebellion control."}],
    civilization:[{id:"economy",label:"Economy",hint:"Markets and trade."},{id:"food",label:"Food",hint:"Farms and stability."},{id:"knowledge",label:"Knowledge",hint:"Libraries and research."},{id:"culture",label:"Culture",hint:"Faith and cultural output."},{id:"units",label:"Units",hint:"City military and civil units."},{id:"luxury",label:"Luxury",hint:"Happiness and rebellion control."}],
    empire:[{id:"infrastructure",label:"Infrastructure",hint:"Material throughput."},{id:"energy",label:"Energy",hint:"Power systems."},{id:"identity",label:"Identity",hint:"Faith and cohesion."},{id:"knowledge",label:"Knowledge",hint:"Universities and tech."},{id:"units",label:"Units",hint:"Imperial civil and military units."},{id:"luxury",label:"Luxury",hint:"Happiness and rebellion control."}],
    solar:[{id:"energy",label:"Energy",hint:"Power-heavy systems."},{id:"colonies",label:"Colonies",hint:"Habitats and support."},{id:"science",label:"Science",hint:"Research stations and labs."},{id:"industry",label:"Industry",hint:"Dockyards and material output."},{id:"units",label:"Units",hint:"Ships and support craft."},{id:"luxury",label:"Luxury",hint:"Happiness and rebellion control."}],
    galactic:[{id:"energy",label:"Energy",hint:"Stellar power."},{id:"knowledge",label:"Knowledge",hint:"Archive-scale research."},{id:"material",label:"Material",hint:"Transit and production."},{id:"culture",label:"Culture",hint:"Species identity."},{id:"units",label:"Units",hint:"Fleets and special assets."},{id:"luxury",label:"Luxury",hint:"Happiness and rebellion control."}],
  }[stageId] || [];
}
function classifyAutomation(stageId,item){
  if(item.bucket) return item.bucket;
  const id=item.id;
  if(stageId==="cell") return "core";
  if(stageId==="creature") return "survival";
  if(stageId==="tribal"){ if(["hut"].includes(id)) return "food"; if(["workshop"].includes(id)) return "craft"; return "culture"; }
  if(stageId==="civilization"){ if(["market"].includes(id)) return "economy"; if(["farm"].includes(id)) return "food"; if(["library"].includes(id)) return "knowledge"; return "culture"; }
  if(stageId==="empire"){ if(["rail","factory"].includes(id)) return "infrastructure"; if(["plant"].includes(id)) return "energy"; if(["university"].includes(id)) return "knowledge"; return "identity"; }
  if(stageId==="solar"){ if(["array"].includes(id)) return "energy"; if(["habitat"].includes(id)) return "colonies"; if(["station"].includes(id)) return "science"; return "industry"; }
  if(stageId==="galactic"){ if(["dyson"].includes(id)) return "energy"; if(["archive_core"].includes(id)) return "knowledge"; if(["nexus"].includes(id)) return "material"; return "culture"; }
  return "core";
}
function applyAutomationPreset(){
  const subs=automationBuckets(currentStage().id);
  if(!subs.some(s=>s.id===state.ui.automationSub)) state.ui.automationSub=subs[0]?.id||"";
  if(state.ui.automationSub==="units" && !["civil","military","special"].includes(state.ui.unitSub)) state.ui.unitSub="civil";
}
function unitRole(unitClass){
  if(["support","trade","transport","logistics","settler","colony_ship","construction_ship"].includes(unitClass)) return "civil";
  if(["melee","ranged","heavy_cavalry","siege","naval_melee","naval_ranged","escort","frigate","destroyer","carrier","battleship","titan","juggernaut","defense_platform","religious_military"].includes(unitClass)) return "military";
  return "special";
}
function unitCost(unit){
  const base={tribal:{food:16,material:14,influence:6},civilization:{material:26,knowledge:14,influence:10},empire:{material:40,energy:14,influence:14},solar:{material:90,energy:60,knowledge:40},galactic:{material:150,energy:110,knowledge:70,influence:30}}[unit.stage]||{material:10};
  const cost={...base};
  if(unitRole(unit.class)==="military") cost.influence=(cost.influence||0)+8;
  return cost;
}
function filteredAutomationItems(){ return currentAutomationItems().filter(i=>classifyAutomation(currentStage().id,i)===state.ui.automationSub); }
function filteredUnits(){ return currentUnits().filter(u=>unitRole(u.class)===state.ui.unitSub); }

function contentBlockedBy(item){
  if(!item.exclusive?.length) return "";
  for(const id of item.exclusive){ if(hasCurrentContent(id)) return id; }
  return "";
}
function canBuySystem(item){
  const prereq = effectiveSystemPrereq(item);
  if(hasCurrentContent(item.id)) return false;
  if(prereq && !hasCurrentContent(prereq)) return false;
  if(contentBlockedBy(item)) return false;
  if(!hasRequiredTraits(item)) return false;
  return affordable(item.cost);
}
function buySystem(id){
  const item=stageSystemDefs().find(x=>x.id===id); if(!item||!canBuySystem(item)) return;
  markRunStarted();
  spend(item.cost);
  state.game.run.currentContentOwned[id]=true;
  for(const [a,v] of Object.entries(item.affinity||{})) state.game.run.archetype[a]+=v*4;
  pushLog(`${item.category}: ${item.name}.`);
  render();
}
function buyAutomation(id){
  const item=currentAutomationItems().find(x=>x.id===id); if(!item || !hasRequiredTraits(item)) return;
  const owned=state.game.run.automation[id]||0; const cost=scaledCost(item.cost,owned);
  if(!affordable(cost) || !generatorRequirementMet(item)) return;
  markRunStarted();
  spend(cost);
  if(item.lowerTierId){
    state.game.run.automation[item.lowerTierId] = Math.max(0,(state.game.run.automation[item.lowerTierId]||0) - (item.lowerTierCost||0));
  }
  state.game.run.automation[id]=owned+1;
  pushLog(`Built ${item.name}.`);
  render();
}
function buyUnit(id){
  const unit=currentUnits().find(x=>x.id===id); if(!unit) return;
  if(!hasRequiredTraits(unit)) return;
  const cost=unitCost(unit); if(!affordable(cost)) return;
  markRunStarted();
  spend(cost); state.game.run.currentUnitsOwned[id]=(state.game.run.currentUnitsOwned[id]||0)+1;
  if(unitRole(unit.class)==="military") state.game.run.happiness=Math.max(0,state.game.run.happiness-0.4);
  else if(unitRole(unit.class)==="civil") state.game.run.happiness=Math.min(150,state.game.run.happiness+0.2);
  pushLog(`Recruited ${unit.name}.`); render();
}
function buyLuxury(id){
  const lux=currentLuxuries().find(x=>x.id===id); if(!lux||hasCurrentLuxury(id)||!affordable(lux.cost)) return;
  markRunStarted();
  spend(lux.cost); state.game.run.currentLuxuriesOwned[id]=true; state.game.run.happiness=Math.min(150,state.game.run.happiness+(lux.gain.happiness||0)*2);
  pushLog(`Secured luxury resource: ${lux.name}.`); render();
}
function performAction(id){
  const action=currentStage().actions.find(x=>x.id===id); if(!action) return;
  markRunStarted();
  applyBundle(action.gain,manualMult());
  state.game.run.population += [0.03,0.08,0.08,0.1,0.14,0.2,0.24][state.game.run.stageIndex] || 0.05;
  pushLog(`Manual action: ${action.label}.`);
  render();
}

function automationOutput(){
  const out=emptyResources();
  for(const item of currentAutomationItems()){
    const count=state.game.run.automation[item.id]||0;
    const genMult = item.generatorTier ? generatorMultiplierForCount(count) : 1;
    for(const [k,v] of Object.entries(item.effects||{})) out[k]+=v*count*genMult;
  }
  const p=state.game.run.selectedPath;
  if(p==="economic"){ out.food*=1.08; out.material*=1.1; }
  if(p==="scientific"){ out.knowledge*=1.1; out.evolution*=1.08; }
  if(p==="cultural"){ out.culture*=1.1; }
  if(p==="spiritual"){ out.faith*=1.1; }
  if(p==="expansionist"){ out.influence*=1.08; }
  if(p==="survivalist"){ out.food*=1.08; out.evolution*=1.06; }
  const bonus=totalBonuses();
  for(const [k,v] of Object.entries(bonus.resMult)) out[k]*=(1+v);
  for(const [k,v] of Object.entries(bonus.resAdd)) out[k]+=v;
  const rebel=rebelMult();
  const world=worldMultiplier();
  for(const [k,v] of Object.entries(out)) out[k]=v*autoMult()*rebel*world;
  return out;
}
function passiveIncome(dt){
  const s=currentStage().id, r=state.game.run.resources;
  if(s==="cell") r.evolution += (r.glucose*0.0012 + r.proteins*0.001)*dt;
  else if(s==="creature") r.knowledge += state.game.run.population*0.01*dt;
  else if(s==="tribal") r.influence += state.game.run.population*0.005*dt;
  else if(s==="civilization") r.culture += state.game.run.population*0.008*dt;
  else if(s==="empire") r.energy += Math.max(0,state.game.run.population*0.0055-.3)*dt;
  else if(s==="solar") r.influence += state.game.run.population*0.0055*dt;
  else if(s==="galactic"){ r.knowledge += state.game.run.population*0.011*dt; r.influence += state.game.run.population*0.011*dt; }
}
function updatePopulation(dt){
  const s=currentStage().id, r=state.game.run.resources;
  let growth=0;
  if(s==="cell") growth=.06 + (r.evolution||0)*0.003;
  if(s==="creature") growth=.06 + (r.food||0)*0.001;
  if(s==="tribal") growth=.1 + (r.food||0)*0.0008;
  if(s==="civilization") growth=.14 + (r.food||0)*0.0006;
  if(s==="empire") growth=.18 + (r.food||0)*0.0005;
  if(s==="solar") growth=.24 + (r.energy||0)*0.0005;
  if(s==="galactic") growth=.3 + (r.influence||0)*0.0004;
  growth*=worldMultiplier();
  const upkeep=Math.max(.1,state.game.run.population)*0.02*dt;
  if((r.food||0)>=upkeep){ r.food-=upkeep; state.game.run.population=Math.max(1,state.game.run.population+growth*dt); }
  else state.game.run.population=Math.max(1,state.game.run.population-0.08*dt);
}
function updateHappiness(dt){
  if(!stageUsesHappiness()) return;
  const militaryUnits=Object.entries(state.game.run.currentUnitsOwned).reduce((s,[id,count])=>{
    const unit=currentUnits().find(u=>u.id===id); return s + (unit && unitRole(unit.class)==="military" ? count : 0);
  },0);
  const bonus=totalBonuses();
  let drift=-0.03 - militaryUnits*0.002 + bonus.happiness*0.005;
  if(["cultural","spiritual"].includes(state.game.run.selectedPath)) drift+=0.01;
  drift += (worldMultiplier()-1)*0.02;
  state.game.run.happiness=Math.max(0,Math.min(150,state.game.run.happiness+drift*dt*10));
  if(state.game.run.happiness<55) state.game.run.rebellion=Math.min(100,state.game.run.rebellion+(55-state.game.run.happiness)*0.01*dt*10);
  else state.game.run.rebellion=Math.max(0,state.game.run.rebellion-0.15*dt*10);
}
function rebelMult(){
  if(!stageUsesHappiness()) return 1;
  if(state.game.run.rebellion>=80) return 0.75;
  if(state.game.run.rebellion>=50) return 0.88;
  if(state.game.run.happiness<40) return 0.93;
  return 1;
}
function maybeAutoBuy(){
  if(Math.random()>0.18) return;
  const candidates=currentAutomationItems().map(item=>{
    const owned=state.game.run.automation[item.id]||0; const cost=scaledCost(item.cost,owned);
    let score=(affordable(cost) && generatorRequirementMet(item))?1:-999;
    score += (item.effects.food||0)*1.2 + (item.effects.material||0)*1.2 + (item.effects.knowledge||0)*1.4 + (item.effects.culture||0)*1.1 + (item.effects.influence||0)*1.1 + (item.effects.energy||0)*1.1 + (item.effects.evolution||0)*1.3;
    score -= owned*0.15;
    return {item,score};
  }).sort((a,b)=>b.score-a.score);
  if(candidates[0]?.score>0) buyAutomation(candidates[0].item.id);
}

function extractStageTraits(){
  const traits=[];
  for(const item of stageSystemDefs()){
    if(!hasCurrentContent(item.id)) continue;
    for(const t of item.traits||[]) traits.push(t);
  }
  // dominant archetype trait
  const dom=dominantArchetype()[0];
  const traitMap={
    terrestrial:{id:"grounded",label:"Grounded lineage",bonus:{resMult:{material:0.05}}},
    aquatic:{id:"aquatic",label:"Aquatic lineage",bonus:{resMult:{food:0.06}}},
    amphibious:{id:"amphibious",label:"Amphibious lineage",bonus:{resMult:{influence:0.04,food:0.04}}},
    fungal:{id:"fungal",label:"Fungal lineage",bonus:{resMult:{knowledge:0.06}}},
    arboreal:{id:"arboreal",label:"Arboreal lineage",bonus:{resMult:{culture:0.05,food:0.04}}},
    subterranean:{id:"subterranean",label:"Subterranean lineage",bonus:{resMult:{material:0.06}}},
    aerial:{id:"aerial",label:"Aerial lineage",bonus:{resMult:{influence:0.05,knowledge:0.03}}},
  };
  traits.push(traitMap[dom]);
  // dedupe
  const seen=new Set(); return traits.filter(t=>t && !seen.has(t.id) && seen.add(t.id));
}
function archiveCurrentStage(){
  const stage=currentStage();
  const snapshot={
    stage:stage.name,
    stageId:stage.id,
    dominantArchetype:dominantArchetype()[0],
    score:Math.round(currentStageScore()),
    content:stageSystemDefs().filter(i=>hasCurrentContent(i.id)).map(i=>i.name),
    units:currentUnits().filter(i=>state.game.run.currentUnitsOwned[i.id]).map(i=>`${i.name} ×${state.game.run.currentUnitsOwned[i.id]}`),
    luxuries:currentLuxuries().filter(i=>state.game.run.currentLuxuriesOwned[i.id]).map(i=>i.name),
    traits:extractStageTraits().map(t=>t.label)
  };
  state.game.meta.archive.unshift(snapshot);
  state.game.meta.archive=state.game.meta.archive.slice(0,40);
}
function resetStageLayerForNext(){
  state.game.run.automation={};
  state.game.run.currentContentOwned={};
  state.game.run.currentUnitsOwned={};
  state.game.run.currentLuxuriesOwned={};
  state.game.run.resources=emptyResources();
  state.game.run.happiness=100;
  state.game.run.rebellion=0;
  const bonus=prestigeLevel("start")*4;
  for(const k of ["food","material","knowledge","culture","influence","energy","evolution"]) state.game.run.resources[k]+=bonus;
}
function carryIntoNextStage(){
  const score=currentStageScore();
  const base=score*carryMult()*0.04;
  const r=emptyResources();
  const next=STAGES[state.game.run.stageIndex+1]?.id;
  if(next==="creature"){ r.food=base*0.7; r.material=base*0.4; r.knowledge=base*0.35; }
  else if(next==="tribal"){ r.food=base*0.6; r.material=base*0.55; r.knowledge=base*0.45; r.culture=base*0.2; }
  else if(next==="civilization"){ r.food=base*0.55; r.material=base*0.65; r.knowledge=base*0.55; r.culture=base*0.35; r.faith=base*0.2; r.influence=base*0.25; }
  else if(next==="empire"){ r.material=base*0.75; r.knowledge=base*0.65; r.influence=base*0.45; r.energy=base*0.3; r.culture=base*0.3; }
  else if(next==="solar"){ r.material=base*0.85; r.knowledge=base*0.8; r.influence=base*0.6; r.energy=base*0.65; r.culture=base*0.35; }
  else if(next==="galactic"){ r.material=base*1.0; r.knowledge=base*1.0; r.influence=base*0.9; r.energy=base*0.95; r.culture=base*0.55; }
  return r;
}
function evolve(){
  markRunStarted();
  const status=evolveStatus(); if(!status.ready) return;
  if(currentStage().id==="galactic"){ return winRun(); }
  archiveCurrentStage();
  const traits=extractStageTraits();
  for(const t of traits){ if(!state.game.run.inheritedTraits.some(x=>x.id===t.id)) state.game.run.inheritedTraits.push(t); }
  const carry=carryIntoNextStage();
  const old=currentStage().name;
  state.game.run.stageIndex += 1;
  state.game.meta.bestStage=Math.max(state.game.meta.bestStage, state.game.run.stageIndex);
  resetStageLayerForNext();
  applyBundle(carry,1);
  state.game.run.population=Math.max(12,state.game.run.population*0.4);
  pushLog(`Evolved from ${old} to ${currentStage().name}. Previous-stage systems retired by design.`);
  applySystemsPreset(); applyAutomationPreset(); render();
}
function canRebirth(){
  const scoreReady = currentStageScore() >= currentStage().scoreTarget * 0.45;
  const stageReady = state.game.run.stageIndex >= 1;
  const timeReady = state.game.run.time >= 45;
  return timeReady && (scoreReady || stageReady);
}
function calcEvolutionPointGain(extra=1){
  if(!canRebirth()) return 0;
  const stagePart = state.game.run.stageIndex * 3;
  const scorePart = Math.min(4, currentStageScore() / Math.max(1,currentStage().scoreTarget) * 4);
  const popPart = Math.log10(1+state.game.run.population);
  const gain=Math.max(1, Math.floor(stagePart + scorePart + popPart));
  return Math.max(1, Math.floor(gain*totalPrestigeMultiplier()*extra));
}
function rebirth(){
  if(!canRebirth()) return;
  const gain=calcEvolutionPointGain(1);
  state.game.meta.evoPoints += gain;
  state.game.meta.bestStage=Math.max(state.game.meta.bestStage, state.game.run.stageIndex);
  state.game.run=createRun(state.game.meta);
  state.ui.betweenRuns = true;
  state.ui.shopOpen = true;
  pushLog(`Rebirth awarded ${gain} Evolution Points.`);
  render();
}
function winRun(){
  const victory=stageSystemDefs("galactic").find(x=>x.category==="victory" && hasCurrentContent(x.id));
  const gain=calcEvolutionPointGain(3);
  state.game.meta.evoPoints += gain;
  state.game.meta.galacticWins += 1;
  state.game.meta.bestStage=Math.max(state.game.meta.bestStage, 6);
  archiveCurrentStage();
  state.game.meta.archive.unshift({stage:"Galactic Victory",stageId:"victory",dominantArchetype:dominantArchetype()[0],score:Math.round(currentStageScore()),content:[victory?.name||"Victory"],units:[],luxuries:[],traits:state.game.run.inheritedTraits.map(t=>t.label)});
  state.game.run=createRun(state.game.meta);
  state.ui.betweenRuns = true;
  pushLog(`Galactic victory achieved. Gained ${gain} Evolution Points and unlocked challenge worlds.`);
  render();
}

function prestigeCost(p){return Math.ceil(p.base*Math.pow(1.55,prestigeLevel(p.id)));}
function buyPrestige(id){
  const p=PRESTIGE.find(x=>x.id===id); if(!p) return;
  const cost=prestigeCost(p), lvl=prestigeLevel(id);
  if(lvl>=p.max || state.game.meta.evoPoints<cost) return;
  state.game.meta.evoPoints-=cost; state.game.meta.prestige[id]+=1;
  pushLog(`Prestige purchased: ${p.name}.`); render();
}
function setWorld(id){
  const world=WORLD_TYPES.find(w=>w.id===id); if(!world) return;
  const unlocked=challengeUnlocked() || id==="terrestrial";
  if(!unlocked) return;
  state.game.meta.selectedWorldType=id; render();
}

function harnessStep(){
  const stage=currentStage();
  if(stage.id==="cell"){
    if((state.game.run.resources.glucose||0)<20) performAction("glucose");
    else if((state.game.run.resources.proteins||0)<16) performAction("proteins");
    else if((state.game.run.resources.lipids||0)<16) performAction("lipids");
    else performAction("elements");
  } else if(stage.id==="creature"){
    if((state.game.run.resources.food||0)<80) performAction("forage"); else if((state.game.run.resources.knowledge||0)<60) performAction("survey"); else performAction("nest");
  } else if(stage.id==="tribal"){
    if((state.game.run.resources.food||0)<160) performAction("hunt"); else if((state.game.run.resources.material||0)<140) performAction("gather"); else performAction("council");
  } else if(stage.id==="civilization"){
    if((state.game.run.resources.material||0)<300) performAction("tax"); else if((state.game.run.resources.knowledge||0)<250) performAction("research"); else performAction("festival");
  } else if(stage.id==="empire"){
    if((state.game.run.resources.material||0)<500) performAction("bonds"); else if((state.game.run.resources.knowledge||0)<500) performAction("survey_region"); else performAction("edict");
  } else if(stage.id==="solar"){
    if((state.game.run.resources.energy||0)<500) performAction("route"); else if((state.game.run.resources.knowledge||0)<700) performAction("probe"); else performAction("fund_colony");
  } else {
    if((state.game.run.resources.knowledge||0)<3000) performAction("archive"); else if((state.game.run.resources.influence||0)<2000) performAction("treaty"); else performAction("broadcast");
  }
  for(const item of filteredSystemsItems()){ if(canBuySystem(item)) buySystem(item.id); }
  for(const item of currentAutomationItems()){
    const cost=scaledCost(item.cost, state.game.run.automation[item.id]||0);
    if(affordable(cost)) buyAutomation(item.id);
  }
  const out=automationOutput(); applyBundle(out,1); passiveIncome(1); updatePopulation(1); updateHappiness(1);
  if(evolveStatus().ready && currentStage().id!=="galactic") evolve();
}
function runPacingHarness(seconds){
  const backup=JSON.parse(JSON.stringify(state.game));
  state.game={meta:JSON.parse(JSON.stringify(state.game.meta)), run:createRun(state.game.meta)};
  state.game.meta.selectedWorldType="terrestrial";
  for(let i=0;i<seconds;i++){ state.game.run.time += 1; harnessStep(); }
  const result={stage:currentStage().name,population:Math.round(state.game.run.population),score:Math.round(currentStageScore()),content:Object.keys(state.game.run.currentContentOwned).length,units:Object.values(state.game.run.currentUnitsOwned).reduce((a,b)=>a+b,0)};
  state.game=backup; render(); return result;
}
function formatHarness(r){return `Deepest stage: ${r.stage}\nPopulation: ${r.population}\nScore: ${r.score}\nStage systems unlocked: ${r.content}\nUnits owned: ${r.units}`;}


function automationSummaryData(){
  const items = currentAutomationItems();
  const ownedEntries = items.map(item => ({item, count: state.game.run.automation[item.id]||0})).filter(x => x.count > 0);
  const total = ownedEntries.reduce((s,x)=>s+x.count,0);
  const generatorOwned = ownedEntries.filter(x=>x.item.generatorTier).reduce((s,x)=>s+x.count,0);
  const tier2 = ownedEntries.filter(x=>x.item.generatorTier===2).reduce((s,x)=>s+x.count,0);
  const tier3 = ownedEntries.filter(x=>x.item.generatorTier===3).reduce((s,x)=>s+x.count,0);
  const top = ownedEntries.sort((a,b)=>b.count-a.count)[0];
  return {
    total,
    generatorOwned,
    tier2,
    tier3,
    top: top ? `${top.item.name} ×${top.count}` : "None"
  };
}

function makeEmptyStateCard(text){
  const c=document.createElement("div");
  c.className="mini-card empty-state";
  c.textContent=text;
  return c;
}
function render(){
  applySystemsPreset(); applyAutomationPreset();
  const stage=currentStage(); const score=currentStageScore(); const evo=evolveStatus(); const adv=advisorState(); const out=automationOutput(); const world=currentWorld();

  document.getElementById("stage-name").textContent=stage.name;
  const stageDescEl=document.getElementById("stage-desc"); if(stageDescEl) stageDescEl.textContent=stage.scope || stage.description || "";
  document.getElementById("stage-scope").textContent=`${stage.scope} • ${stage.theme}`;
  document.getElementById("population-value").textContent=fmt.format(state.game.run.population);
  document.getElementById("population-trend").textContent=`${archetypeName(dominantArchetype()[0])} dominant`;
  document.getElementById("path-name").textContent=pathName(state.game.run.selectedPath);
  const pathDescEl=document.getElementById("path-desc"); if(pathDescEl) pathDescEl.textContent=pathDescription(state.game.run.selectedPath);
  document.getElementById("time-value").textContent=pathDescription(state.game.run.selectedPath);
  document.getElementById("world-name").textContent=world.name;
  document.getElementById("world-detail").textContent=`Habitability ${Math.round((world.habitability||1)*100)}% • Evolution Point ×${fmt.format(totalPrestigeMultiplier())}`;

  document.getElementById("summary-population").textContent = fmt.format(state.game.run.population);
  const summaryPopulation2=document.getElementById("summary-population2"); if(summaryPopulation2) summaryPopulation2.textContent = fmt.format(state.game.run.population);
  document.getElementById("summary-score").textContent = fmt.format(score);
  document.getElementById("summary-score-target").textContent = `Target ${fmt.format(stage.scoreTarget)}`;
  document.getElementById("summary-progress").textContent = `${Math.min(100, Math.round(score/stage.scoreTarget*100))}%`;
  document.getElementById("summary-status").textContent = state.ui.betweenRuns ? "Between runs" : "In run";
  document.getElementById("summary-status-detail").textContent = canRebirth() ? `Rebirth +${calcEvolutionPointGain()} EP` : `Keep progressing`;

  const resourceTopbar=document.getElementById("resource-topbar");
  if(resourceTopbar){
    resourceTopbar.innerHTML="";
    for(const key of stage.resources){
      const chip=document.createElement("div");
      chip.className="resource-chip";
      const ps = out[key] || 0;
      chip.innerHTML=`<div class="label">${resourceName(key)}</div><div><strong>${fmt.format(state.game.run.resources[key]||0)}</strong></div><div class="tiny">${ps>=0?"+":""}${fmt.format(ps)}/s</div>`;
      resourceTopbar.appendChild(chip);
    }
  }

  const debugTab=document.getElementById("debug-tab-btn");
  if(debugTab) debugTab.style.display = state.ui.debug ? "" : "none";
  if(!state.ui.debug && state.ui.tab==="debug") state.ui.tab="actions";

  const scenarioRules = activeScenarioRules();
  const scenarioList = document.getElementById("scenario-rules-list");
  if (scenarioList) {
    scenarioList.innerHTML = "";
    if (!scenarioRules.length) {
      const empty = document.createElement("div");
      empty.className = "mini-card";
      empty.textContent = challengeUnlocked() ? "No special scenario rules from the current selection." : "Scenario rules unlock after your first Galactic victory.";
      scenarioList.appendChild(empty);
    } else {
      for (const rule of scenarioRules) {
        const card = document.createElement("div");
        card.className = "mini-card";
        card.innerHTML = `<strong>${rule.title}</strong><div class="tiny" style="margin-top:4px;">${rule.detail}</div>`;
        scenarioList.appendChild(card);
      }
    }
  }


  const stageMechanicsCard = document.getElementById("stage-mechanics-card");
  const stageMechanicsInfoData = stageMechanicInfo();
  if (stageMechanicsCard) {
    stageMechanicsCard.style.display = stageMechanicsInfoData ? "block" : "none";
    if (stageMechanicsInfoData) {
      document.getElementById("stage-mechanics-title").textContent = stageMechanicsInfoData.title;
      document.getElementById("stage-mechanics-detail").textContent = stageMechanicsInfoData.detail;
      const stageMechanicsList = document.getElementById("stage-mechanics-list");
      stageMechanicsList.innerHTML = "";
      for (const row of stageMechanicsInfoData.rows) {
        const card = document.createElement("div");
        card.className = "mini-card";
        card.innerHTML = `<strong>${row.label}</strong><div class="tiny" style="margin-top:4px;">${row.value}</div><div class="tiny" style="margin-top:4px;">${row.sub}</div>`;
        stageMechanicsList.appendChild(card);
      }
    }
  }

  const activeScenarioCard = document.getElementById("active-scenario-card");
  const activeScenarioTitle = document.getElementById("active-scenario-title");
  const activeScenarioDetail = document.getElementById("active-scenario-detail");
  const activeScenarioList = document.getElementById("active-scenario-list");
  if (activeScenarioCard) {
    activeScenarioCard.style.display = scenarioRules.length ? "block" : "none";
    if (scenarioRules.length) {
      activeScenarioTitle.textContent = `${scenarioRules.length} active rule${scenarioRules.length === 1 ? "" : "s"}`;
      activeScenarioDetail.textContent = `World ${currentWorld().name} • ${[currentEvent(), currentDisaster(), currentCrisis()].filter(x => x.id !== "none").map(x => x.name).join(" • ") || "No extra pressure"}`;
      activeScenarioList.innerHTML = "";
      for (const rule of scenarioRules) {
        const card = document.createElement("div");
        card.className = "mini-card";
        card.innerHTML = `<strong>${rule.title}</strong><div class="tiny" style="margin-top:4px;">${rule.detail}</div>`;
        activeScenarioList.appendChild(card);
      }
    }
  }



  document.getElementById("advisor-text").textContent=adv.text;
  document.getElementById("pace-text").textContent=adv.pace;

  document.getElementById("score-value").textContent=`${Math.round(score)} score`;
  document.getElementById("score-detail").textContent=`Target ${stage.scoreTarget}`;
  document.getElementById("score-fill").style.width=`${Math.min(100,score/stage.scoreTarget*100)}%`;

  document.getElementById("ascend-status").textContent=stage.id==="galactic" ? "Ready to win the run" : (evo.ready ? "Ready to Evolve" : "Building toward next stage");
  document.getElementById("ascend-requirements").textContent=evo.detail;
  document.getElementById("ascend-fill").style.width=`${Math.round(evo.percent*100)}%`;
  document.getElementById("ascend-btn").disabled=!evo.ready;
  document.getElementById("stage-retirement-text").textContent=stageRetirementText();

  const happinessCard=document.getElementById("happiness-card");
  if(stageUsesHappiness()){
    happinessCard.style.display="block";
    happinessCard.classList.toggle("bad", state.game.run.happiness<55 || state.game.run.rebellion>=50);
    document.getElementById("happiness-value").textContent=`${Math.round(state.game.run.happiness)} Happiness`;
    document.getElementById("happiness-detail").textContent=`Rebellion ${Math.round(state.game.run.rebellion)} • Luxuries ${Object.keys(state.game.run.currentLuxuriesOwned).length}/${currentLuxuries().length}`;
    document.getElementById("happiness-fill").style.width=`${Math.max(0,Math.min(100,state.game.run.happiness))}%`;
  } else happinessCard.style.display="none";
  const militaryCard=document.getElementById("military-card");
  if(stageUsesHappiness()){
    militaryCard.style.display="block";
    militaryCard.classList.toggle("bad", rivalGap()>0);
    document.getElementById("military-value").textContent=`${militaryStrength()} strength vs ${rivalThreatValue()} threat`;
    document.getElementById("military-detail").textContent=`Gap ${rivalGap()} • Output ×${fmt.format(rivalOutputMultiplier())}`;
    document.getElementById("military-fill").style.width=`${Math.max(0,Math.min(100, militaryStrength()/Math.max(1,rivalThreatValue())*100))}%`;
  } else militaryCard.style.display="none";

  const resourceGrid=document.getElementById("resource-grid"); resourceGrid.innerHTML="";
  for(const id of visibleResources()){
    const card=document.createElement("div"); card.className="resource-card";
    card.innerHTML=`<div class="label">${resourceName(id)}</div><div class="value">${fmt.format(state.game.run.resources[id]||0)}</div><div class="subvalue">+${fmt.format(out[id]||0)}/s automated</div>`;
    resourceGrid.appendChild(card);
  }

  const arch=document.getElementById("archetype-list"); arch.innerHTML="";
  const totalArch=Object.values(state.game.run.archetype).reduce((a,b)=>a+b,0);
  Object.entries(state.game.run.archetype).sort((a,b)=>b[1]-a[1]).forEach(([id,val])=>{
    const card=document.createElement("div"); card.className="mini-card";
    card.innerHTML=`<div class="name-row"><strong>${archetypeName(id)}</strong><span class="tiny">${fmt.format(val)}</span></div><div class="bar"><div class="fill" style="width:${val/totalArch*100}%"></div></div>`;
    arch.appendChild(card);
  });

  const traitList=document.getElementById("trait-list"); traitList.innerHTML="";
  if(!state.game.run.inheritedTraits.length){
    const card=document.createElement("div"); card.className="mini-card"; card.textContent="No inherited traits yet. Evolve out of a stage to archive it and keep its lineage.";
    traitList.appendChild(card);
  } else {
    for(const trait of state.game.run.inheritedTraits){
      const card=document.createElement("div"); card.className="mini-card"; card.textContent=trait.label;
      traitList.appendChild(card);
    }
  }

  const actionGrid=document.getElementById("action-grid"); actionGrid.innerHTML="";
  for(const action of stage.actions){
    const btn=document.createElement("button");
    btn.className="primary";
    btn.innerHTML=`<strong>${action.label}</strong><br><span class="tiny">${bundleText(action.gain)}</span>`;
    btn.onclick=()=>performAction(action.id); actionGrid.appendChild(btn);
  }

  const systemsTitle=document.getElementById("systems-title");
  systemsTitle.textContent=`${stage.name} Systems`;
  const systemsOverview=document.getElementById("systems-overview-list");
  if(systemsOverview){
    systemsOverview.innerHTML="";
    const ownedSystems = ownedSystemsForCurrentStage();
    if(!ownedSystems.length){
      const c=makeEmptyStateCard("No permanent systems unlocked yet.");
      systemsOverview.appendChild(c);
    } else {
      for(const item of ownedSystems.slice(0,12)){
        const c=document.createElement("div"); c.className="mini-card";
        c.innerHTML=`<strong>${item.name}</strong><div class="tiny" style="margin-top:4px;">${item.category}</div>`;
        systemsOverview.appendChild(c);
      }
    }
  }
  const systemsBar=document.getElementById("systems-subbar"); systemsBar.innerHTML="";
  for(const sub of systemsSubsystems(stage.id)){
    const btn=document.createElement("button"); btn.className=`subchip${state.ui.systemsSub===sub.id?" active":""}`; btn.textContent=sub.label;
    btn.onclick=()=>{state.ui.systemsSub=sub.id; render();}; systemsBar.appendChild(btn);
  }
  document.getElementById("systems-hint").textContent=systemsSubsystems(stage.id).find(s=>s.id===state.ui.systemsSub)?.hint||"Choose one category to keep the shop focused.";
  const systemsList=document.getElementById("systems-list"); systemsList.innerHTML="";
  const sysItems=filteredSystemsItems();
  if(!sysItems.length){ systemsList.appendChild(makeEmptyStateCard("No stage systems available in this category right now.")); }
  else for(const item of sysItems){
    const owned=hasCurrentContent(item.id); const blocked=contentBlockedBy(item);
    const card=document.createElement("div"); card.className=`buy-card ${owned?"owned-card":(blocked||!hasRequiredTraits(item)|| (effectiveSystemPrereq(item) && !hasCurrentContent(effectiveSystemPrereq(item))) ?"locked-card":"")}`;
    const bonusLines=[];
    if(item.bonus.manual) bonusLines.push(`manual +${Math.round(item.bonus.manual*100)}%`);
    if(item.bonus.auto) bonusLines.push(`auto +${Math.round(item.bonus.auto*100)}%`);
    if(item.bonus.carry) bonusLines.push(`carry +${Math.round(item.bonus.carry*100)}%`);
    if(item.bonus.happiness) bonusLines.push(`happiness ${item.bonus.happiness>0?"+":""}${item.bonus.happiness}`);
    for(const [k,v] of Object.entries(item.bonus.resMult||{})) if(v) bonusLines.push(`${resourceName(k)} +${Math.round(v*100)}%`);
    for(const [k,v] of Object.entries(item.bonus.resAdd||{})) if(v) bonusLines.push(`${resourceName(k)} +${fmt.format(v)}/s`);
    const prereq = effectiveSystemPrereq(item);
    const systemLocked = blocked||!hasRequiredTraits(item)||(prereq&&!hasCurrentContent(prereq));
    const reason = !owned ? lockReasonForSystem(item) : "";
    card.innerHTML=`<div class="name-row"><div><strong>${item.name}</strong><div class="tiny">${item.category}</div></div><div class="status-pill ${owned?"status-owned":(systemLocked?"status-locked":"status-available")}">${owned?"Owned":(systemLocked?"Locked":"Available")}</div></div><div class="tiny">${item.description}</div><div class="cost">Cost: ${bundleText(item.cost)}</div><div class="effects">Bonuses: ${bonusLines.join(" • ")||"—"}</div>${reason?`<div class="lock-reason">${reason}</div>`:""}`;
    const btn=document.createElement("button");
    btn.textContent=owned?"Owned":(systemLocked?"Locked":"Unlock");
    btn.className = owned?"owned-btn":(systemLocked?"locked-btn":"primary");
    btn.disabled=owned || !canBuySystem(item);
    btn.onclick=()=>buySystem(item.id);
    card.appendChild(btn); systemsList.appendChild(card);
  }

  document.getElementById("automation-title").textContent=`${stage.name} Automation`;
  const autoSummary=document.getElementById("automation-summary-strip");
  if(autoSummary){
    const s=automationSummaryData();
    autoSummary.innerHTML="";
    [
      {label:"Automation", value:fmt.format(s.total), sub:"All owned"},
      {label:"Generators", value:fmt.format(s.gens), sub:"Resource lines"},
      {label:"Tier 2 / 3", value:`${fmt.format(s.tier2)} / ${fmt.format(s.tier3)}`, sub:"Higher tiers"},
      {label:"Top line", value:s.top, sub:"Most-owned"}
    ].forEach(row=>{
      const c=document.createElement("div"); c.className="automation-stat";
      c.innerHTML=`<div class="label">${row.label}</div><div class="value">${row.value}</div><div class="tiny">${row.sub}</div>`;
      autoSummary.appendChild(c);
    });
  }
  const autoBar=document.getElementById("automation-subbar"); autoBar.innerHTML="";
  for(const sub of automationBuckets(stage.id)){
    const btn=document.createElement("button"); btn.className=`subchip${state.ui.automationSub===sub.id?" active":""}`; btn.textContent=sub.label;
    btn.onclick=()=>{state.ui.automationSub=sub.id; render();}; autoBar.appendChild(btn);
  }
  document.getElementById("automation-hint").textContent=automationBuckets(stage.id).find(s=>s.id===state.ui.automationSub)?.hint||"Automation is grouped by role to reduce clutter.";
  const autoList=document.getElementById("automation-list"); autoList.innerHTML="";
  if(state.ui.automationSub==="units"){
    const unitTabs=document.createElement("div"); unitTabs.className="subsystembar";
    for(const key of ["civil","military","special"]){
      const btn=document.createElement("button"); btn.className=`subchip${state.ui.unitSub===key?" active":""}`; btn.textContent=key[0].toUpperCase()+key.slice(1);
      btn.onclick=()=>{state.ui.unitSub=key; render();}; unitTabs.appendChild(btn);
    }
    autoList.appendChild(unitTabs);
    const units=filteredUnits();
    if(!units.length){ autoList.appendChild(makeEmptyStateCard("No units available in this category right now.")); }
    else for(const unit of units){
      const owned=state.game.run.currentUnitsOwned[unit.id]||0; const cost=unitCost(unit);
      const card=document.createElement("div"); card.className=`buy-card ${owned>0?"owned-card":(!hasRequiredTraits(unit)?"locked-card":"")}`;
      const unitBonusLines=[];
      for(const [k,v] of Object.entries(unit.bonus?.resAdd||{})) if(v) unitBonusLines.push(`${resourceName(k)} +${fmt.format(v)}/s`);
      for(const [k,v] of Object.entries(unit.bonus?.resMult||{})) if(v) unitBonusLines.push(`${resourceName(k)} +${Math.round(v*100)}%`);
      if(unit.bonus?.happiness) unitBonusLines.push(`Happiness +${unit.bonus.happiness}`);
      const unitLocked = !hasRequiredTraits(unit) || !affordable(cost);
      const reason = lockReasonForUnit(unit, cost);
      card.innerHTML=`<div class="name-row"><div><strong>${unit.name}</strong><div class="tiny">${unit.class}</div></div><div class="status-pill ${owned>0?"status-owned":(unitLocked?"status-locked":"status-available")}">${owned>0?`Owned ${owned}`:(unitLocked?"Locked":"Available")}</div></div><div class="tiny">${unit.description}</div><div class="tiny">Strength ${unitStrengthValue(unit)}</div><div class="cost">Cost: ${bundleText(cost)}</div><div class="effects">${unitBonusLines.length?`Bonuses: ${unitBonusLines.join(" • ")}`:""}</div>${reason?`<div class="lock-reason">${reason}</div>`:""}`;
      const btn=document.createElement("button"); btn.textContent=unitLocked?"Locked":"Recruit"; btn.className=unitLocked?"locked-btn":"primary"; btn.disabled=!affordable(cost) || !hasRequiredTraits(unit); btn.onclick=()=>buyUnit(unit.id);
      card.appendChild(btn); autoList.appendChild(card);
    }
  } else if(state.ui.automationSub==="luxury"){
    if(!currentLuxuries().length){ const c=document.createElement("div"); c.className="mini-card"; c.textContent="Luxury resources begin in the Tribal stage."; autoList.appendChild(c); }
    else for(const lux of currentLuxuries()){
      const owned=hasCurrentLuxury(lux.id); const card=document.createElement("div"); card.className=`buy-card ${owned?"owned-card":""}`;
      const luxLocked = !owned && !affordable(lux.cost);
      card.innerHTML=`<div class="name-row"><div><strong>${lux.name}</strong><div class="tiny">Luxury resource</div></div><div class="status-pill ${owned?"status-owned":(luxLocked?"status-locked":"status-available")}">${owned?"Owned":(luxLocked?"Locked":"Available")}</div></div><div class="effects">Bonuses: ${Object.entries(lux.gain).map(([k,v])=>k==="happiness"?`Happiness +${v}`:`${resourceName(k)} +${v}/s`).join(" • ")}</div><div class="cost">Cost: ${bundleText(lux.cost)}</div>${luxLocked?`<div class="lock-reason">Need ${bundleText(lux.cost)}</div>`:""}`;
      const btn=document.createElement("button"); btn.textContent=owned?"Owned":(luxLocked?"Locked":"Secure"); btn.className=owned?"owned-btn":(luxLocked?"locked-btn":"primary"); btn.disabled=owned || !affordable(lux.cost); btn.onclick=()=>buyLuxury(lux.id);
      card.appendChild(btn); autoList.appendChild(card);
    }
  } else {
    const items=filteredAutomationItems();
    if(!items.length){ autoList.appendChild(makeEmptyStateCard("No automation available in this category right now.")); }
    else {
      let currentGroup="";
      for(const item of items.sort((a,b)=>{
        const ga=automationGroupLabel(a), gb=automationGroupLabel(b);
        if(ga!==gb) return ga.localeCompare(gb);
        return (a.generatorTier||0)-(b.generatorTier||0) || a.name.localeCompare(b.name);
      })){
        const group=automationGroupLabel(item);
        if(group!==currentGroup){
          currentGroup=group;
          const head=document.createElement("div");
          head.className="generator-section";
          head.innerHTML=`<div class="generator-header"><strong>${group}</strong><div class="generator-meta"><span class="generator-tag">${state.ui.automationSub}</span></div></div>`;
          autoList.appendChild(head);
        }
        const owned=state.game.run.automation[item.id]||0; const cost=scaledCost(item.cost,owned);
        const unlocked=!item.unlockAt || Object.entries(item.unlockAt).every(([k,v])=>(state.game.run.resources[k]||0)>=v);
        const locked = !hasRequiredTraits(item) || !unlocked || !generatorRequirementMet(item);
        const card=document.createElement("div"); card.className=`buy-card ${owned>0?"owned-card":(locked?"locked-card":"")}`;
        const genInfo = item.generatorTier ? `<div class="tiny generator-tier">Tier ${item.generatorTier} • Multiplier ×${fmt.format(generatorMultiplierForCount(owned))} • Doubles every 10</div>` : "";
        const lowerReq = item.lowerTierId ? `<div class="tiny">Consumes ${generatorRequirementText(item)} to build</div>` : "";
        const reason = lockReasonForAutomation(item, cost, unlocked);
        card.innerHTML=`<div class="name-row"><div><strong>${item.name}</strong><div class="tiny">${item.description||""}</div></div><div class="status-pill ${owned>0?"status-owned":(locked?"status-locked":"status-available")}">${owned>0?`Owned ${owned}`:(locked?"Locked":"Available")}</div></div>${genInfo}${lowerReq}<div class="cost">Cost: ${bundleText(cost)}</div><div class="effects">Effects: ${bundleText(item.effects,"/s")}</div>${reason?`<div class="lock-reason">${reason}</div>`:""}`;
        const btn=document.createElement("button"); btn.textContent=locked?"Locked":"Build"; btn.className=locked?"locked-btn":"primary"; btn.disabled=!affordable(cost) || !hasRequiredTraits(item) || !unlocked || !generatorRequirementMet(item); btn.onclick=()=>buyAutomation(item.id);
        card.appendChild(btn); autoList.appendChild(card);
      }
    }
  }

  const archive=document.getElementById("archive-list"); archive.innerHTML="";
  if(!state.game.meta.archive.length){ const c=document.createElement("div"); c.className="mini-card"; c.textContent="No retired layers yet."; archive.appendChild(c); }
  else for(const entry of state.game.meta.archive){
    const card=document.createElement("div"); card.className="buy-card";
    card.innerHTML=`<div class="name-row"><div><strong>${entry.stage}</strong><div class="tiny">Dominant archetype: ${archetypeName(entry.dominantArchetype)}</div></div><div class="pill">Score ${entry.score}</div></div><div class="tiny">Traits: ${entry.traits?.join(" • ") || "None"}</div><div class="tiny">Choices: ${(entry.content||[]).slice(0,6).join(" • ") || "None"}</div><div class="tiny">Units: ${(entry.units||[]).slice(0,4).join(" • ") || "None"}</div><div class="tiny">Luxuries: ${(entry.luxuries||[]).join(" • ") || "None"}</div>`;
    archive.appendChild(card);
  }

  const log=document.getElementById("log"); log.innerHTML="";
  for(const line of state.game.run.logs){ const row=document.createElement("div"); row.className="log-entry"; row.textContent=line; log.appendChild(row); }

  document.getElementById("evo-value").textContent=`${fmt.format(state.game.meta.evoPoints)} EP`;
  document.getElementById("evo-detail").textContent=canRebirth() ? `Rebirth now for ${calcEvolutionPointGain()} EP • Galactic wins ${state.game.meta.galacticWins}` : `Rebirth locked until you make real progress in the current run.`;
  document.getElementById("evo-fill").style.width=`${Math.min(100,state.game.meta.evoPoints%100)}%`;
  document.getElementById("rebirth-btn").disabled = !canRebirth();
  document.getElementById("rebirth-btn").textContent = canRebirth() ? `Rebirth +${calcEvolutionPointGain()} EP` : "Rebirth Locked";

  const prestigeSectionVisible = state.ui.betweenRuns;
  const prestigeList=document.getElementById("prestige-list"); prestigeList.innerHTML="";
  const prestigeHead = document.getElementById("prestige-head");
  if (prestigeHead) prestigeHead.style.display = prestigeSectionVisible ? "flex" : "none";
  prestigeList.style.display = prestigeSectionVisible ? "grid" : "none";
  for(const p of PRESTIGE){
    const lvl=prestigeLevel(p.id); const cost=prestigeCost(p);
    const card=document.createElement("div"); card.className="buy-card";
    card.innerHTML=`<div class="name-row"><div><strong>${p.name}</strong><div class="tiny">${p.desc(lvl)}</div></div><div class="pill">Lv ${lvl}/${p.max}</div></div><div class="cost">Cost: ${cost} EP</div>`;
    const btn=document.createElement("button"); btn.textContent=lvl>=p.max?"Maxed":"Purchase"; btn.disabled=lvl>=p.max || state.game.meta.evoPoints<cost; btn.onclick=()=>buyPrestige(p.id);
    card.appendChild(btn); prestigeList.appendChild(card);
  }

  const worldSel=document.getElementById("world-select"); worldSel.innerHTML="";
  for(const w of WORLD_TYPES){
    const unlocked=challengeUnlocked() || w.id==="terrestrial";
    const opt=document.createElement("option"); opt.value=w.id; opt.textContent=`${w.name}${unlocked?"":" (locked)"}`; opt.disabled=!unlocked;
    worldSel.appendChild(opt);
  }
  worldSel.value=state.game.meta.selectedWorldType;

  const eventSel=document.getElementById("event-select"); eventSel.innerHTML="";
  for(const ev of CHALLENGE_EVENTS){
    const unlocked=!challengeUnlocked() ? ev.id==="none" : true;
    const opt=document.createElement("option"); opt.value=ev.id; opt.textContent=`${ev.name}${ev.id==="none"?"":` • ${ev.stage} • +${Math.round((ev.difficulty||0)*35)}%`}${unlocked?"":" (locked)"}`; opt.disabled=!unlocked;
    eventSel.appendChild(opt);
  }
  eventSel.value=state.game.meta.selectedEvent;

  const disasterSel=document.getElementById("disaster-select"); disasterSel.innerHTML="";
  for(const d of CHALLENGE_DISASTERS){
    const unlocked=!challengeUnlocked() ? d.id==="none" : true;
    const opt=document.createElement("option"); opt.value=d.id; opt.textContent=`${d.name}${d.id==="none"?"":` • ${d.stage} • +${Math.round((d.difficulty||0)*35)}%`}${unlocked?"":" (locked)"}`; opt.disabled=!unlocked;
    disasterSel.appendChild(opt);
  }
  disasterSel.value=state.game.meta.selectedDisaster;

  const crisisSel=document.getElementById("crisis-select"); crisisSel.innerHTML="";
  for(const c of CHALLENGE_CRISES){
    const unlocked=!challengeUnlocked() ? c.id==="none" : true;
    const opt=document.createElement("option"); opt.value=c.id; opt.textContent=`${c.name}${c.id==="none"?"":` • ${c.stage} • +${Math.round((c.difficulty||0)*35)}%`}${unlocked?"":" (locked)"}`; opt.disabled=!unlocked;
    crisisSel.appendChild(opt);
  }
  crisisSel.value=state.game.meta.selectedCrisis;

  document.getElementById("world-select-hint").textContent=challengeUnlocked() ? `${world.name} • Habitability ${Math.round(world.habitability*100)}% • Best fit: ${(world.best_fit_archetypes||[]).map(archetypeName).join(", ")} • Base EP ×${fmt.format(worldPrestigeMult())}` : "Beat Galactic once to unlock harsher worlds, stage events, disasters, and crises.";
  const activeChallenge = [currentEvent(), currentDisaster(), currentCrisis()].filter(x=>x.id!=="none").map(x=>`${x.name} (${x.stage})`).join(" • ");
  document.getElementById("challenge-select-hint").textContent = challengeUnlocked() ? `Selected pressure: ${activeChallenge || "none"} • Total Evolution Point ×${fmt.format(totalPrestigeMultiplier())}` : "Challenge modifiers are disabled until your first Galactic victory.";
  document.getElementById("world-select").closest(".mini-card").style.display = challengeUnlocked() ? "block" : "none";

  const summary=document.getElementById("summary-list"); summary.innerHTML="";
  [
    `Current stage: ${stage.name}`,
    `Stage score: ${Math.round(score)} / ${stage.scoreTarget}`,
    `Automation owned: ${Object.values(state.game.run.automation).reduce((a,b)=>a+b,0)}`,
    `Units owned: ${Object.values(state.game.run.currentUnitsOwned).reduce((a,b)=>a+b,0)}`,
    `Dominant archetype: ${archetypeName(dominantArchetype()[0])}`,
    `Stage mechanic: ${stageMechanicInfo()?.title || "None"}`,
    `Focus: ${pathName(state.game.run.selectedPath)}`
  ].forEach(line=>{const c=document.createElement("div"); c.className="mini-card"; c.textContent=line; summary.appendChild(c);});

  document.querySelectorAll(".tab").forEach(btn=>btn.classList.toggle("active", btn.dataset.tab===state.ui.tab));
  document.querySelectorAll(".tab-panel").forEach(panel=>panel.classList.toggle("active", panel.id===`tab-${state.ui.tab}`));
  document.getElementById("pause-btn").textContent=state.running?"Pause":"Resume";
  document.getElementById("speed-btn").textContent=`Speed ×${SPEEDS[state.speedIndex]}`;
  document.getElementById("options-panel").style.display = state.ui.optionsOpen ? "block" : "none";
  document.getElementById("debug-toggle").checked = !!state.ui.debug;
  const debugActions = document.querySelector(".debug-actions");
  if(debugActions) debugActions.style.display = state.ui.debug ? "flex" : "none";
  const harnessHead = document.getElementById("harness-head");
  const harnessCard = document.getElementById("harness-output")?.parentElement;
  if(harnessHead) harnessHead.style.display = state.ui.debug ? "flex" : "none";
  if(harnessCard) harnessCard.style.display = state.ui.debug ? "block" : "none";
  const summaryHead = document.getElementById("summary-head");
  const summaryCard = document.getElementById("summary-list");
  if(summaryHead) summaryHead.style.display = state.ui.debug || state.ui.betweenRuns ? "flex" : "none";
  if(summaryCard) summaryCard.style.display = state.ui.debug || state.ui.betweenRuns ? "grid" : "none";
  const challengesHead = document.getElementById("challenges-head");
  const challengeControls = document.getElementById("world-select")?.closest(".mini-card");
  if(challengesHead) challengesHead.style.display = challengeUnlocked() ? "flex" : "none";
  if(challengeControls) challengeControls.style.display = challengeUnlocked() ? "block" : "none";
}

  const optionsPanel=document.getElementById("options-panel");
  if(optionsPanel) optionsPanel.style.display = state.ui.optionsOpen ? "block" : "none";
  const debugToggle=document.getElementById("debug-toggle");
  if(debugToggle) debugToggle.checked = !!state.ui.debug;
  const debugOnly=document.querySelector(".debug-only");
  if(debugOnly) debugOnly.style.display = state.ui.debug ? "flex" : "none";
  const pauseBtn=document.getElementById("pause-btn");
  const speedBtn=document.getElementById("speed-btn");
  if(pauseBtn) pauseBtn.textContent = state.running ? "Pause" : "Resume";
  if(speedBtn) speedBtn.textContent = `Speed ×${SPEEDS[state.speedIndex]}`;

  const betweenPanel=document.getElementById("between-runs-panel");
  if(betweenPanel) betweenPanel.style.display = state.ui.betweenRuns ? "block" : "none";
  const challengePanel=document.getElementById("challenge-panel");
  if(challengePanel) challengePanel.style.display = state.ui.betweenRuns && !state.ui.shopOpen && challengeUnlocked() ? "block" : "none";
  const prestigeHead=document.getElementById("prestige-head");
  const prestigeList=document.getElementById("prestige-list");
  const evoPointsLabel=document.getElementById("evo-points-label");
  const shopCloseBtn=document.getElementById("shop-close-btn");
  if(prestigeHead) prestigeHead.style.display = state.ui.betweenRuns && state.ui.shopOpen ? "flex" : "none";
  if(prestigeList) prestigeList.style.display = state.ui.betweenRuns && state.ui.shopOpen ? "grid" : "none";
  if(evoPointsLabel){
    evoPointsLabel.style.display = state.ui.betweenRuns && state.ui.shopOpen ? "block" : "none";
    evoPointsLabel.textContent = `Evolution Points: ${fmt.format(state.game.meta.evoPoints)}`;
  }
  if(shopCloseBtn){
    shopCloseBtn.style.display = state.ui.betweenRuns && state.ui.shopOpen ? "inline-flex" : "none";
    shopCloseBtn.textContent = challengeUnlocked() ? "Close Evolution Shop" : "Start Next Run";
  }
function tick(dt){
  if(!state.running) return;
  state.game.run.time += dt;
  applyBundle(automationOutput(),dt); passiveIncome(dt); updatePopulation(dt); updateStageMechanics(dt); updateHappiness(dt); maybeAutoBuy();
  render();
}

function bind(){
  document.querySelectorAll(".tab").forEach(btn=>btn.onclick=()=>{state.ui.tab=btn.dataset.tab; render();});
  document.getElementById("save-btn").onclick=()=>saveGame(false);
  document.getElementById("reset-btn").onclick=()=>resetAll();
  document.getElementById("rebirth-btn").onclick=()=>rebirth();
  document.getElementById("options-btn").onclick=()=>{state.ui.optionsOpen=!state.ui.optionsOpen; render();};
  document.getElementById("debug-toggle").onchange=e=>{
    state.ui.debug=!!e.target.checked;
    if(!state.ui.debug && state.ui.tab==="debug") state.ui.tab="actions";
    render();
  };
  document.getElementById("pause-btn").onclick=()=>{state.running=!state.running; render();};
  document.getElementById("speed-btn").onclick=()=>{state.speedIndex=(state.speedIndex+1)%SPEEDS.length; render();};
  document.getElementById("ascend-btn").onclick=()=>evolve();
  document.getElementById("rebirth-btn").title="Reset the current run for Evolution Points once you have made enough progress.";
  document.getElementById("world-select").onchange=e=>setWorld(e.target.value);
  document.getElementById("event-select").onchange=e=>setWorldEvent(e.target.value);
  document.getElementById("disaster-select").onchange=e=>setDisaster(e.target.value);
  document.getElementById("crisis-select").onchange=e=>setCrisis(e.target.value);
  document.getElementById("harness-5-btn").onclick=()=>runHarness(5);
  document.getElementById("harness-15-btn").onclick=()=>runHarness(15);
  document.getElementById("harness-30-btn").onclick=()=>runHarness(30);
  document.getElementById("harness-reset-btn").onclick=()=>{state.game.run.harness=[]; render();};
  document.getElementById("shop-close-btn").onclick=()=>{state.ui.shopOpen=false; state.ui.betweenRuns=false; render();};
}

