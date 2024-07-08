import { Instruments } from "../instruments/Instruments";

import "./App.css";
import { Scale } from "../conductor/Scale";

export function App() {
  return (
    <div className="com-app layout-stack">
      <h1>MIDI Magic</h1>
      <Scale />
      <Instruments />
    </div>
  );
}
