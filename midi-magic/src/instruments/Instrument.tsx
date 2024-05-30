import { SelectInputChannel } from "../webmidi/SelectInputChannel";
import { SelectOutputChannel } from "../webmidi/SelectOutputChannel";

import { type Instrument } from "./types";
import "./Instrument.css";

export function Instrument({ instrument }: { instrument: Instrument }) {
  return (
    <div className="com-instruments-instrument">
      <h3>{instrument.label}</h3>
      {Object.entries(instrument.inputs).map(([inputName, input]) => (
        <div key={inputName}>
          <span>{inputName}:</span>
          <SelectInputChannel forSignal={input} />
        </div>
      ))}
      {Object.entries(instrument.outputs).map(([outputName, output]) => (
        <div key={outputName}>
          <span>{outputName}:</span>
          <SelectOutputChannel forSignal={output} />
        </div>
      ))}
      <div>
        <button onClick={instrument.midiPanic}>MIDI panic</button>
      </div>
    </div>
  );
}
