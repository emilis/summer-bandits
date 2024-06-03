export type NoteNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type Chord = {
  flavour: Flavour;
  notes: NoteNumber[];
};
export type ChordNumber = "i" | "ii" | "iii" | "iv" | "v" | "vi" | "vii";
export type Flavour = "maj" | "min" | "dim";

export type ScaleChords = Record<ChordNumber, Chord>;
export type Scale = {
  label: string;
  root: NoteNumber;
  type: ScaleType;
  notes: NoteNumber[];
  chords: ScaleChords;
};
export type ScaleType = "major" | "minor";

export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const SCALE_TYPES: Record<ScaleType, Omit<Scale, "root">> = {
  major: {
    label: "Major",
    type: "major",
    notes: [0, 2, 4, 5, 7, 9, 11],
    chords: {
      i: { flavour: "maj", notes: [0, 7, 4, 2, 9, 11, 5] },
      ii: { flavour: "min", notes: [2, 9, 5, 0, 7, 4, 11] },
      iii: { flavour: "min", notes: [4, 11, 7, 2, 9, 0, 5] },
      iv: { flavour: "maj", notes: [5, 0, 9, 7, 2, 4, 11] },
      v: { flavour: "maj", notes: [7, 2, 11, 9, 4, 0, 5] },
      vi: { flavour: "min", notes: [9, 4, 0, 7, 2, 11, 5] },
      vii: { flavour: "dim", notes: [11, 2, 9, 5, 7, 4, 0] },
    },
  },
  minor: {
    label: "Minor",
    type: "minor",
    notes: [0, 2, 3, 5, 7, 8, 10],
    chords: {
      i: { flavour: "min", notes: [0, 7, 3, 11, 5, 8, 2] },
      ii: { flavour: "dim", notes: [2, 9, 5, 0, 7, 10, 4] },
      iii: { flavour: "maj", notes: [3, 10, 7, 5, 0, 8, 2] },
      iv: { flavour: "min", notes: [5, 0, 8, 3, 10, 7, 2] },
      v: { flavour: "min", notes: [7, 2, 10, 5, 0, 3, 8] },
      vi: { flavour: "maj", notes: [8, 3, 0, 10, 5, 2, 7] },
      vii: { flavour: "maj", notes: [10, 5, 2, 0, 7, 8, 3] },
    },
  },
};

const getRootedNote =
  (root: NoteNumber) =>
  (note: NoteNumber): NoteNumber =>
    ((root + note) % 12) as NoteNumber;

export const getNoteName = (num: NoteNumber) => NOTE_NAMES[num % 12];

export const createScale = (
  scaleType: ScaleType,
  rootNote: NoteNumber,
): Scale => {
  const noteName = getNoteName(rootNote);
  const scale = SCALE_TYPES[scaleType];

  return {
    label: `${noteName} ${scale.label}`,
    root: rootNote,
    type: scale.type,
    notes: scale.notes.map(getRootedNote(rootNote)),
    chords: Object.fromEntries(
      Object.entries(scale.chords).map(([chordNum, chord]) => [
        chordNum,
        {
          flavour: chord.flavour,
          notes: chord.notes.map(getRootedNote(rootNote)),
        },
      ]),
    ) as ScaleChords,
  };
};
