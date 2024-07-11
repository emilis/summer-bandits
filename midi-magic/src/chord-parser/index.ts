import { type Chord as CpChord, chordParserFactory } from "chord-symbol";

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

const getFlavour = (cpChord: CpChord): Flavour => {
  const {
    normalized: { adds, alterations, extensions, isSuspended, omits, quality },
  } = cpChord;

  const isCustom =
    adds.length ||
    alterations.length ||
    extensions.length ||
    isSuspended ||
    omits.length;

  return isCustom
    ? "other"
    : quality === "augmented"
      ? "aug"
      : quality.startsWith("diminished")
        ? "dim"
        : quality.startsWith("major7")
          ? "maj7"
          : quality.startsWith("major")
            ? "maj"
            : quality.startsWith("minor7")
              ? "min7"
              : quality.startsWith("minor")
                ? "min"
                : "other";
};

/// State ----------------------------------------------------------------------

const chordParser = chordParserFactory();

/// Exports --------------------------------------------------------------------

export const parseChord = (str: string): Chord => {
  const cpChord = chordParser(str);

  if ("error" in cpChord) {
    throw `Error parsing chord "${str}"`;
  }

  const notes = cpChord.normalized.notes.map(noteNameToNumber);
  /// console.debug("cpChord", getFlavour(cpChord), notes, cpChord);

  return {
    flavour: getFlavour(cpChord),
    label: cpChord.input.symbol,
    levels: [notes, notes, notes, notes],
    notes,
  };
};
