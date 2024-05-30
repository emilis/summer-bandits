import { midiInputs, midiOutputs } from "../webmidi/state";

import { Instruments } from "../instruments/Instruments";

import "./App.css";
import { save, load } from "../storage";

export function App() {
  return (
    <div className="com-app layout-stack">
      <h1>MIDI Magic</h1>
      <button onClick={save}>Save</button>
      <button onClick={load}>Load</button>
      <Instruments />
      <h2>I / O</h2>
      <dl>
        <dt>Inputs</dt>
        <dd>
          <ol>
            {midiInputs.value.map((input) => (
              <li key={input.id}>{input.name}</li>
            ))}
          </ol>
        </dd>
        <dt>Outputs</dt>
        <dd>
          <ol>
            {midiOutputs.value.map((output) => (
              <li key={output.id}>{output.name}</li>
            ))}
          </ol>
        </dd>
      </dl>
    </div>
  );
}
