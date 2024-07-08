import { Instruments } from "../instruments/Instruments";

import "./App.css";
import { Conductor } from "../conductor/Conductor";

export function App() {
  return (
    <div className="com-app layout-stack">
      <Conductor />
      <Instruments />
    </div>
  );
}
