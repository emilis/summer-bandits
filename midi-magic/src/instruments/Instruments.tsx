import { guitar } from "../guitar/state";
import { keyboard } from "../keys/state";
import { bass } from "../bass/state";
import { save, load } from "../storage";

import { Instrument } from "./Instrument";
import "./Instruments.css";

export function Instruments() {
  return (
    <section className="com-instruments layout-stack">
      <header>
        <h2>Instruments</h2>
        <button onClick={save}>Save</button>
        <button onClick={load}>Load</button>
      </header>
      <div className="instrument-list">
        <Instrument instrument={guitar} />
        <Instrument instrument={bass} />
        <Instrument instrument={keyboard} />
      </div>
    </section>
  );
}
