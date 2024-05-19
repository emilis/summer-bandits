import { WebMidi } from 'webmidi';

export { WebMidi };

const enabled = WebMidi.enable();

window.midiEnabled = enabled;

export const onEnable = fn =>
  enabled.then( fn );
