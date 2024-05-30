import { guitar } from "../guitar/state";
import { keyboard } from "../keys/state";

import { Instrument } from "./Instrument";
import "./Instruments.css";

export function Instruments() {
  return (
    <div className="com-instruments layout-stack">
      <h2>Instruments</h2>
      <div className="instrument-list">
        <Instrument instrument={guitar} />
        <Instrument instrument={keyboard} />
      </div>
    </div>
  );
}
