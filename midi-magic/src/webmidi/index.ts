import { WebMidi } from 'webmidi';

export { WebMidi };

const enabled = WebMidi.enable();

window.midiEnabled = enabled;

export function onEnable<T>(fn: () => T | PromiseLike<T>): Promise<T> {
  return enabled.then( fn );
}
