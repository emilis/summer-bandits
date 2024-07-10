import clsx from "clsx";

import { ChordNumber } from "../harmony/scales";

import type { PlayerSignal } from "./players";
import "./PlayerRow.css";

function ChordCell({
  cellChordNumber,
  chordNumber,
}: {
  cellChordNumber: ChordNumber;
  chordNumber: ChordNumber;
}) {
  const isActive = chordNumber === cellChordNumber;
  return (
    <td className={clsx("chord", isActive && "chord is-active")}>
      {isActive && chordNumber}
    </td>
  );
}

export function ConductorPlayerRow({ player }: { player: PlayerSignal }) {
  const { chordNumber, name, mode } = player.value;
  return (
    <tr
      className={clsx("com-conductor-player-row", `mode-${mode.toLowerCase()}`)}
    >
      <td className="name">{name}</td>
      <ChordCell chordNumber={chordNumber} cellChordNumber="i" key="i" />
      <ChordCell chordNumber={chordNumber} cellChordNumber="ii" key="ii" />
      <ChordCell chordNumber={chordNumber} cellChordNumber="iii" key="iii" />
      <ChordCell chordNumber={chordNumber} cellChordNumber="iv" key="iv" />
      <ChordCell chordNumber={chordNumber} cellChordNumber="v" key="v" />
      <ChordCell chordNumber={chordNumber} cellChordNumber="vi" key="vi" />
      <ChordCell chordNumber={chordNumber} cellChordNumber="vii" key="vii" />
    </tr>
  );
}
