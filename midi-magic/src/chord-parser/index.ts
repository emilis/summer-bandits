import { chordParserFactory } from "chord-symbol";

import { Flavour, type Chord, type NoteNumber } from "../harmony/scales";

/// Constants ------------------------------------------------------------------

const NOTE_NUMBERS: Record<string, NoteNumber> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

const noteNameToNumber = (str: string): NoteNumber => NOTE_NUMBERS[str];

const qualityToFlavour = (quality: string): Flavour =>
  quality.match(/^major/)
    ? "maj"
    : quality.match(/^minor/)
      ? "min"
      : quality.match(/^aug/)
        ? "aug"
        : quality.match(/^dim/)
          ? "dim"
          : "unknown";

/// State ----------------------------------------------------------------------

const chordParser = chordParserFactory();

/// Exports --------------------------------------------------------------------

export const parseChord = (str: string): Chord => {
  const cpChord = chordParser(str);

  if ("error" in cpChord) {
    throw `Error parsing chord "${str}"`;
  }

  const notes = cpChord.normalized.notes.map(noteNameToNumber);
  ///console.log("cpChord", notes, cpChord);

  return {
    flavour: qualityToFlavour(cpChord.normalized.quality),
    label: cpChord.input.symbol,
    notes,
    levels: [notes, notes, notes, notes],
  };
};
