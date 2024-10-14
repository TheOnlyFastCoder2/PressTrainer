<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  export let size:number;
  export let strokeWidth:number = 8;

  let timeID:NodeJS.Timeout;
  let prevPercent:number = 100;
  let refCircle:SVGCircleElement;
  let radius:number,circumference:number;

  export function changePregression (percent: number, mode?: 'increment'|'decrement') {
    clearInterval(timeID);
    let currPercent = prevPercent;
    timeID = setInterval(() => {
      switch (mode) {
        case 'increment': {
          currPercent <= percent &&  (
            currPercent += 0.05
          );
          break;
        };
        case 'decrement': {
          currPercent >= percent &&  (
            currPercent -= 0.05
          );
          break;
        };
      }

      const progress = circumference - currPercent / 100 * circumference;
      refCircle.style.strokeDasharray = `${circumference} ${circumference}`;
      refCircle.style.strokeDashoffset = `${progress}`;
    }, 10)
    
    prevPercent = percent;
  }

  onDestroy(() => {
    clearInterval(timeID);
  });

  onMount(() => {
    radius = refCircle.r.baseVal.value;
    circumference = radius * 2 * Math.PI;
  });
</script>

<svg  class="CircleProgress" width={size+strokeWidth} height={size+strokeWidth}>
  <circle 
    bind:this={refCircle} 
    stroke-linecap="round" 
    class="CircleProgress-circle"
    stroke="#3E8399"
    fill="#28515e" 
    stroke-width={strokeWidth}
    r={size/2} cx={(size+strokeWidth)/2} cy={(size+strokeWidth)/2}/>
</svg>

<style lang="scss">

</style>
