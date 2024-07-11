///import { EventEmitter } from "djipevents";
import { signal } from "@preact/signals";
import { WebMidi } from "webmidi";

window.webmidi = WebMidi;

export const midiInputs = signal(WebMidi.inputs);
export const midiOutputs = signal(WebMidi.outputs);
export { WebMidi };

/// WebMidi.addListener(EventEmitter.ANY_EVENT, console.debug);

WebMidi.addListener("portschanged", () => {
  midiInputs.value = WebMidi.inputs.filter(
    (input) => !input.name.match(/WebMIDI output:Output connection/),
  );
  midiOutputs.value = WebMidi.outputs.filter(
    (output) => !output.name.match(/WebMIDI input:Input connection/),
  );
});

WebMidi.enable();
