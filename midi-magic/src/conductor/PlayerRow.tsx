import clsx from "clsx";

import { type ChordNumber } from "../harmony/scales";

import type { PlayerSignal } from "./players";
import "./PlayerRow.css";

type Props = {
  chordNumbers: ChordNumber[];
  player: PlayerSignal;
};

function ChordCell({
  chordNumber,
  isActive,
}: {
  chordNumber: ChordNumber;
  isActive: boolean;
}) {
  return (
    <td className={clsx("chord", isActive && "is-active")}>
      {isActive && chordNumber}
    </td>
  );
}

export function ConductorPlayerRow({ chordNumbers, player }: Props) {
  const { chordNumber, name, mode } = player.value;
  return (
    <tr
      className={clsx("com-conductor-player-row", `mode-${mode.toLowerCase()}`)}
    >
      <td className="name">{name}</td>
      {chordNumbers.map((cellChordNumber: ChordNumber) => (
        <ChordCell
          chordNumber={chordNumber}
          isActive={chordNumber === cellChordNumber}
          key={cellChordNumber}
        />
      ))}
    </tr>
  );
}
