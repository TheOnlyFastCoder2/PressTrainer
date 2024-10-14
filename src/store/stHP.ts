import {writable} from 'svelte/store';

export function  HPStore () {
  const {set, update, subscribe} = writable(100);
  return {
    subscribe, 
    increment: (v = 1) => update((HP) => HP + v),
    decrement: (v = 1) => update((HP) => HP - v),
    reset: (cb?:Function) => {
      set(100);
      cb && cb(100);
    },
  }
}

export default HPStore();
