import {
  type Chord,
  type ChordNumber,
  type NoteNumber,
  type ScaleType,
  createScale,
  createScaleFromChords,
} from "../harmony/scales";
import { ChordSelector } from "../chord-selector/ChordSelector";

import { activeScale } from "./state";
import { ConductorPlayerRow } from "./PlayerRow";
import { players } from "./players";
import "./Conductor.css";

const onSelectChords = (chords: Chord[]) => {
  activeScale.value = createScaleFromChords(chords);
};

const onSelectScale = (rootNote: NoteNumber, type: ScaleType) => {
  activeScale.value = createScale(type, rootNote);
};

export function Conductor() {
  const chordNumbers = Object.keys(activeScale.value.chords) as ChordNumber[];

  return (
    <main className="com-conductor layout-stack">
      <ChordSelector
        onSelectChords={onSelectChords}
        onSelectScale={onSelectScale}
      />
      <table>
        <thead className="chords">
          <tr className="numbers">
            <th />
            {chordNumbers.map((number) => (
              <th key={number}>{number}</th>
            ))}
          </tr>
          <tr className="names">
            <th>{activeScale.value.label}</th>
            {Object.values(activeScale.value.chords).map((chord, i) => (
              <th key={i}>{chord.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <ConductorPlayerRow
              chordNumbers={chordNumbers}
              key={player.value.name}
              player={player}
            />
          ))}
        </tbody>
      </table>
    </main>
  );
}
