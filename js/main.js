(function(){
  const DATA = window.EvolutionData,
        State = window.EvolutionState,
        Logic = window.EvolutionLogic,
        UI = window.EvolutionUI;

  let state = State.state;

  let last = performance.now();
  let lastRender = 0;

  function frame(now){
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;

    if (!state.ui.betweenRuns && state.running) {
      Logic.tick(dt * DATA.SPEEDS[state.speedIndex]);
    }

    if (now - lastRender >= 250 && !state.ui.inputActive) {
      lastRender = now;
      UI.render();
    }

    requestAnimationFrame(frame);
  }

  function start(){
    State.loadGame();

    // refresh state reference AFTER load
    state = State.state;

    // attach debug API
    window.DEBUG = {
      unlock(){
        state.ui.debugUnlocked = true;
        localStorage.setItem("evolve_debug", "1");
        UI.render();
        console.log("Debug unlocked");
      },

      lock(){
        state.ui.debugUnlocked = false;
        localStorage.removeItem("evolve_debug");
        UI.render();
        console.log("Debug locked");
      }
    };

    UI.bindUI();

    window.addEventListener("beforeunload", function(){
      State.saveGame();
    });

    document.addEventListener("visibilitychange", function(){
      if (document.hidden) State.saveGame();
    });

    UI.render();

    setInterval(function(){
      State.saveGame();
    }, 5000);

    requestAnimationFrame(frame);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
