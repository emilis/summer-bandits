import { WebMidi } from 'webmidi';

declare global {
    interface Window {
      midiEnabled?: Promise<WebMidi>
      webmidi?: WebMidi
    }
  }