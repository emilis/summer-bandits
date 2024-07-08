import { ChordNumber } from "../harmony/scales";

import type { InstrumentSignal } from "./leadership";

import "./InstrumentRow.css"


function ChordCell({ cellChordNumber, chordNumber }: {
  cellChordNumber: ChordNumber,
  chordNumber: ChordNumber,
}){
  const isActive = chordNumber === cellChordNumber;
  return (
    <td className={ isActive ? 'chord is-active' : 'chord' }>{
      isActive && chordNumber
    }</td>
  );
}

export function ConductorInstrumentRow({ instrument }: { instrument: InstrumentSignal }){
  const { chordNumber, name, mode } = instrument.value;
  return (
    <tr className={`com-conductor-instrument-row mode-${ mode.toLowerCase() }`}>
      <td className="name">{name}</td>
      <ChordCell chordNumber={chordNumber} cellChordNumber="i"    key="i" />
      <ChordCell chordNumber={chordNumber} cellChordNumber="ii"   key="ii" />
      <ChordCell chordNumber={chordNumber} cellChordNumber="iii"  key="iii" />
      <ChordCell chordNumber={chordNumber} cellChordNumber="iv"   key="iv" />
      <ChordCell chordNumber={chordNumber} cellChordNumber="v"    key="v" />
      <ChordCell chordNumber={chordNumber} cellChordNumber="vi"   key="vi" />
      <ChordCell chordNumber={chordNumber} cellChordNumber="vii"  key="vii" />
    </tr>
  );
};
