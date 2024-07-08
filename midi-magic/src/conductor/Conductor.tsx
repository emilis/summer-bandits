import { Scale } from "./Scale";

import { instruments } from "./leadership";
import { ConductorInstrumentRow } from "./InstrumentRow";
import "./Conductor.css";


export function Conductor() {
  return (
    <section className="com-conductor layout-stack">
      <Scale />
      <table>
        <tbody>
          { instruments.map( instrument => 
            <ConductorInstrumentRow key={instrument.value.name} instrument={instrument} />
          )}
        </tbody>
      </table>
    </section>
  );
}
