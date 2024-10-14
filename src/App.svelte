<script lang="ts">
  import CircleProgress from "lib/ui/CircleProgress.svelte";
  import stHP from "store/stHP";
  import stLVL from "store/stLVL";
  import stSpeed from "store/stSpeed";
  import { onDestroy, onMount } from "svelte";
  import Trainer from "utils/game/Trainer";
  import type { ILangs } from "utils/game/types";
  import RequesAnimation from "utils/RequestAnimation";
  
  let frame: RequesAnimation;
  let canvas: HTMLCanvasElement;
  let circleProgress: CircleProgress;
  let ctx: CanvasRenderingContext2D;
  let trainer: Trainer;
  let isStart = false;
  let HP: number = 100;
  let LVL: number = 0;
  let speed:{ current: number } = {current: 0};
  let qntyPressedKey = 0; 
  let isStop = false;
  let currLang: keyof ILangs;
  let currStepLVL: number = 1;
 
  
  function toKeyPressed(ev:KeyboardEvent) {
    const isCorrectChar = trainer.checkPressedChar(ev.key.toLocaleLowerCase());

    if((qntyPressedKey+1) % 10 === 0) {
      stLVL.increment();
    } else if((qntyPressedKey+1) % 100 === 0) { 
      currStepLVL = (currStepLVL+1) % 20;
    }

    if(isCorrectChar) {
      stSpeed.toSpeedUp(0.05);
      qntyPressedKey++;
    }

    if(isCorrectChar && HP + 0.5 < 100) {
      stHP.increment(0.5);
      circleProgress.changePregression(HP, 'increment')
    }
  }

  function removedChar() {
    if(HP - currStepLVL > 0) { 
      stHP.decrement(currStepLVL);
      stSpeed.toSpeedDown(0.08);
      currStepLVL = (currStepLVL+1) % 10;
      circleProgress.changePregression(HP, 'decrement')
    }
    else {
      gameOver();
      circleProgress.changePregression(0);
    }

  }
  
  stSpeed.subscribe((val) => {
    speed.current = val;
  });
  
  stLVL.subscribe((val) => {
    LVL = val;
  });

  stHP.subscribe((val) => {
    HP = val;
  });

  function targetGame() {
    isStop 
    ? frame.getStart()
    : frame.getStop();

    isStop = !isStop; 
  }
  
  function changeLanguage() {
    resetGame(); 
    currLang = trainer.currLang = currLang === 'rus' ? 'eng' : 'rus';
  }

  function resetGame() {
    frame.getStop();
    frame.cancelFrameAnimation();
    trainer.reset();
    stLVL.reset();
    stSpeed.reset();
    stHP.reset(circleProgress?.changePregression);
    circleProgress?.changePregression(100);
    currStepLVL = 1;
    frame.getStart();
    frame.toStartFrame();
  }
  
  function gameOver() {
    frame.getStop();
    frame.cancelFrameAnimation();
    document.removeEventListener('keyup',toKeyPressed);
    isStart = false;
    const timeID = setInterval(() => {
      stSpeed.reset();
      trainer.reset();
      stLVL.reset();
      trainer.clearCanvas();
      stHP.reset(circleProgress?.changePregression);
      circleProgress?.changePregression(100);
      clearTimeout(timeID);
    },0)
  }

  onDestroy(() => {
    gameOver();
  });

  function toStart() {
    isStart = true;
    frame.getStart();
    frame.toStartFrame();
    document.addEventListener('keyup',toKeyPressed);
  }
  
  onMount(() => {
    ctx = canvas.getContext("2d")!;
    frame = new RequesAnimation();
    trainer = new Trainer(canvas, ctx);
    trainer.init(635, 635);
    
    currLang = trainer.currLang;
    const update_createCell = frame.costomUpdate(speed.current, () => {
      trainer.createCell(removedChar)
    })
    
    frame.init(0.005, 1, (delta) => {
      trainer.draw();
      update_createCell(delta, speed.current);
    })
    
    circleProgress.changePregression(HP);
    document.addEventListener('keyup',toKeyPressed);
  });
</script>

<div class="App">
  <div class="Field">
    <canvas bind:this={canvas}></canvas>
    <CircleProgress bind:this={circleProgress} size={650} strokeWidth={30}/>
  </div>
  <div class="App-panel">
    {#if !isStart}
      <button on:click={toStart}>start</button>
    {:else}
      <button on:click={targetGame}>{isStop ? 'start' : 'stop'}</button>
      <button disabled>{LVL} <br/> <small>LVL</small></button>
      <button on:click={resetGame}>reset</button>
      <button on:click={changeLanguage}>lang:{currLang}</button>
    {/if}
  </div>
</div>

<style lang="scss">
  .App {
    display: flex;
    justify-content: center;
    flex-direction: column;
    gap: 40px 0;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #305f6e;

    &-panel {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 400px;
      padding: 10px 10px;
      background: #28515e;
      
      button[disabled] {
        bottom: 50%;
        position: relative;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        font-size: 1.5rem;
        line-height: 20px;
        text-align: center;
        font-weight: 900;
        background: #3e8399;
        outline: 7px solid #28515e;
        small {
          font-size: 1rem;
        }
      }

      button:not([disabled]) {
        color: #00000036;
        background: #305f6e;
        text-transform: uppercase;
        border-radius: var(--rounded-md);
        &:hover {
          background: #3e8399;
          color: #0000007e;
        }
      }
    }
  }
  
  .Field {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    canvas {
      position: absolute;
      border-radius: 50%;
      background: #28515e;
      box-shadow: inset 0px 4px 85px 4px rgba(0, 0, 0, 0.09);
    }
  }
</style>
