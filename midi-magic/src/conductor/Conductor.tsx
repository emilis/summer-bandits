import {
  type ChordNumber,
  type Flavour,
  type NoteNumber,
  type ScaleType,
  createScale,
  NOTE_NAMES,
} from "../harmony/scales";
import { ChordSelector } from '../chord-selector/ChordSelector';

import { activeScale } from './state';
import { ConductorPlayerRow } from "./PlayerRow";
import { players } from "./players";
import "./Conductor.css";

const CHORD_SUFFIXES: Record<Flavour, string> = {
  maj: "",
  min: "m",
  dim: "dim",
  aug: "aug",
};

const onSelectChords = () => {

  console.log('onSelectChords');
};
const onSelectScale = (rootNote: NoteNumber, type: ScaleType) => {

  activeScale.value = createScale(type, rootNote);
};

export function Conductor() {

  const chordNumbers = Object.keys(
    activeScale.value.chords,
  ) as ChordNumber[];

  return (
    <main className="com-conductor layout-stack">
      <ChordSelector onSelectChords={onSelectChords} onSelectScale={onSelectScale} />
      <table>
        <thead className="chords">
          <tr className="numbers">
            <th />
            { chordNumbers.map(number => <th key={number}>{number}</th> )}
          </tr>
          <tr className="names">
            <th />
            { Object.values(activeScale.value.chords).map(( chord, i ) =>
              <th key={i}>
                {NOTE_NAMES[chord.notes[0]]}
                {CHORD_SUFFIXES[chord.flavour]}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <ConductorPlayerRow key={player.value.name} player={player} />
          ))}
        </tbody>
      </table>
    </main>
  );
}
