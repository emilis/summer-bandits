import { signal }           from '@preact/signals';
import SoundFont, { type Player }            from 'soundfont-player';

const context =             new AudioContext;

const instrument =          signal<Player|null>(null);

instrument.value = await SoundFont.instrument(
     context,
     'electric_guitar_clean',
);

type Play = (
  note: string,
  { duration }?: { duration?: number },
) => void;
  

export const play: Play = ( note, { duration } = {}) => {

     if( ! instrument.value ){
         return;
     }

     if( duration ){
         instrument.value.play( note, context.currentTime, {
             duration: duration / 1e3,
         });
     } else {
         instrument.value.play( note );
     }
};

export const stop = () =>

     instrument.value?.stop();

