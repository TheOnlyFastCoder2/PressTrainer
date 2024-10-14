import {writable} from 'svelte/store';

export function  speedStore () {
  const {set, update, subscribe} = writable(2);
  return {
    subscribe, 
    toSpeedUp: (v = 0.001) =>  update((speed) => speed - v > 0.4 ? speed - v : speed),
    toSpeedDown: (v = 0.2) => update((speed) => speed + v),
    reset: () => set(2),
  }
}

export default speedStore();
