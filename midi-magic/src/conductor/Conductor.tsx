import { Scale } from "./Scale";

import { players } from "./players";
import { ConductorPlayerRow } from "./PlayerRow";
import "./Conductor.css";


export function Conductor() {
  return (
    <section className="com-conductor layout-stack">
      <Scale />
      <table>
        <tbody>
          { players.map( player =>
            <ConductorPlayerRow key={player.value.name} player={player} />
          )}
        </tbody>
      </table>
    </section>
  );
}
