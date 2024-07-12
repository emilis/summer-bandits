import clsx from "clsx";

import type { PlayerSignal } from "./players";
import { ROMAN_NUMERALS } from "./constants";
import "./PlayerRow.css";

type Props = {
  chordNumbers: string[];
  player: PlayerSignal;
};

function ChordCell({
  chordNumber,
  isActive,
}: {
  chordNumber: string;
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
      <td className="name">
        {name}
        {` (${
          mode === "FOLLOW"
            ? "follower"
            : mode === "FREE_PLAY"
              ? "free"
              : "leader"
        })`}
      </td>
      {chordNumbers.map((cellChordNumber: string, i: number) => (
        <ChordCell
          chordNumber={ROMAN_NUMERALS[chordNumber]}
          isActive={chordNumber === i}
          key={cellChordNumber}
        />
      ))}
    </tr>
  );
}
