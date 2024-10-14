import {writable} from 'svelte/store';

export function  LVLStore () {
  const {set, update, subscribe} = writable(1);
  return {
    subscribe, 
    increment: (v = 1) => update((LVL) => LVL + v),
    reset: () => set(1),
  }
}

export default LVLStore();
