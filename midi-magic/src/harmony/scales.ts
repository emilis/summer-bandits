export type NoteNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type Chord = {
  flavour: Flavour;
  label?: string;
  notes: NoteNumber[];
  levels: NoteNumber[][];
};
export type Flavour = "maj" | "min" | "dim" | "aug" | "unknown";

type ScaleChords = Chord[];
export type Scale = {
  type: ScaleType;
  label: string;
  notes: NoteNumber[];
  chords: ScaleChords;
  root: NoteNumber;
};
export type ScaleType = "chords" | "major" | "minor" | "harmonic_minor";

const CHORD_SUFFIXES: Record<Flavour, string> = {
  aug: "aug",
  dim: "dim",
  maj: "",
  min: "m",
  unknown: "",
};

export const MAX_CHORDS_COUNT = 10;

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

export const SCALE_TYPES: Partial<Record<ScaleType, Omit<Scale, "root">>> = {
  major: {
    label: "Major",
    type: "major",
    notes: [0, 2, 4, 5, 7, 9, 11],
    chords: [
      {
        // I
        flavour: "maj",
        notes: [0, 4, 7],
        levels: [
          [0, 4, 7, 2],
          [0, 4, 7, 9, 2],
          [0, 4, 7, 11],
          [0, 4, 7, 11, 2],
        ],
      },
      {
        // II
        flavour: "min",
        notes: [2, 5, 9],
        levels: [
          [2, 5, 9, 0],
          [2, 5, 9, 0, 7],
          [2, 5, 9, 0],
          [2, 5, 9, 0, 4],
        ],
      },
      {
        // III
        flavour: "min",
        notes: [4, 7, 11],
        levels: [
          [4, 7, 11, 2],
          [4, 7, 11, 2, 9],
          [4, 7, 11, 2],
          [4, 7, 11, 2, 5],
        ],
      },
      {
        // IV
        flavour: "maj",
        notes: [5, 9, 0],
        levels: [
          [5, 9, 0, 7],
          [5, 9, 0, 2, 7],
          [5, 9, 0, 4],
          [5, 9, 0, 4, 7],
        ],
      },
      {
        // V
        flavour: "maj",
        notes: [7, 11, 2],
        levels: [
          [7, 11, 2, 9],
          [7, 11, 2, 4, 9],
          [7, 11, 2, 5],
          [7, 11, 2, 5, 9],
        ],
      },
      {
        // VI
        flavour: "min",
        notes: [9, 0, 4],
        levels: [
          [9, 0, 4, 7],
          [9, 0, 4, 7, 2],
          [9, 0, 4, 7],
          [9, 0, 4, 7, 11],
        ],
      },
      {
        // VII
        flavour: "dim",
        notes: [11, 2, 5],
        levels: [
          [11, 2, 9],
          [11, 2, 9, 4],
          [11, 2, 5, 9],
          [11, 2, 5, 9, 4],
        ],
      },
    ],
  },
  minor: {
    label: "Minor",
    type: "minor",
    notes: [0, 2, 3, 5, 7, 8, 10],
    chords: [
      {
        // I
        flavour: "min",
        notes: [0, 3, 7],
        levels: [
          [0, 3, 7, 10],
          [0, 3, 7, 10, 5],
          [0, 3, 7, 10],
          [0, 3, 7, 10, 2],
        ],
      },
      {
        // II
        flavour: "dim",
        notes: [2, 5, 8],
        levels: [
          [2, 5, 0],
          [2, 5, 0, 7],
          [2, 5, 8, 0],
          [2, 5, 8, 0, 7],
        ],
      },
      {
        // III
        flavour: "maj",
        notes: [3, 7, 10],
        levels: [
          [3, 7, 10, 5],
          [3, 7, 10, 0, 5],
          [3, 7, 10, 2],
          [3, 7, 10, 2, 5],
        ],
      },
      {
        // IV
        flavour: "min",
        notes: [5, 8, 0],
        levels: [
          [5, 8, 0, 3],
          [5, 8, 0, 3, 10],
          [5, 8, 0, 3],
          [5, 8, 0, 3, 7],
        ],
      },
      {
        // V
        flavour: "min",
        notes: [7, 10, 2],
        levels: [
          [7, 10, 2, 5],
          [7, 10, 2, 5, 0],
          [7, 10, 2, 5],
          [7, 10, 2, 5, 8],
        ],
      },
      {
        // VI
        flavour: "maj",
        notes: [8, 0, 3],
        levels: [
          [8, 0, 3, 10],
          [8, 0, 3, 5, 10],
          [8, 0, 3, 7],
          [8, 0, 3, 7, 10],
        ],
      },
      {
        // VII
        flavour: "maj",
        notes: [10, 2, 5],
        levels: [
          [10, 2, 5, 0],
          [10, 2, 5, 7, 0],
          [10, 2, 5, 8],
          [10, 2, 5, 8, 0],
        ],
      },
    ],
  },
  harmonic_minor: {
    label: "Harmonic minor",
    type: "harmonic_minor",
    notes: [0, 2, 3, 5, 7, 8, 11],
    chords: [
      {
        // I
        flavour: "min",
        notes: [0, 3, 7],
        levels: [
          [0, 3, 7, 5],
          [0, 3, 7, 5],
          [0, 3, 7, 2],
          [0, 3, 7, 11, 2],
        ],
      },
      {
        // II
        flavour: "dim",
        notes: [2, 5, 8],
        levels: [
          [2, 5, 0],
          [2, 5, 0, 7],
          [2, 5, 8, 11],
          [2, 5, 8, 0],
        ],
      },
      {
        // III
        flavour: "aug",
        notes: [3, 7, 11],
        levels: [
          [3, 5, 7],
          [3, 5, 7, 0],
          [3, 7, 11, 2],
          [3, 7, 2, 5],
        ],
      },
      {
        // IV
        flavour: "min",
        notes: [5, 8, 0],
        levels: [
          [5, 8, 0, 3],
          [5, 8, 0, 3],
          [5, 8, 0, 3],
          [5, 8, 0, 3, 7],
        ],
      },
      {
        // V
        flavour: "maj",
        notes: [7, 11, 2, 5],
        levels: [
          [7, 2, 5],
          [7, 0, 2, 5],
          [7, 11, 2, 5],
          [7, 11, 2, 5],
        ],
      },
      {
        // VI
        flavour: "maj",
        notes: [8, 0, 3],
        levels: [
          [8, 0, 3],
          [8, 0, 3, 5],
          [8, 0, 3, 7],
          [8, 0, 2, 7],
        ],
      },
      {
        // VII
        flavour: "dim",
        notes: [11, 2, 5],
        levels: [
          [11, 3, 7],
          [11, 3, 7],
          [11, 2, 5, 8],
          [11, 2, 5, 8],
        ],
      },
    ],
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

  if (!scale) {
    throw `Unable to create the scale of type "${scaleType}".`;
  }

  return {
    label: `${noteName} ${scale.label}`,
    root: rootNote,
    type: scale.type,
    notes: scale.notes.map(getRootedNote(rootNote)),
    chords: scale.chords.map((chord) => {
      const notes = chord.notes.map(getRootedNote(rootNote));

      return {
        flavour: chord.flavour,
        label: `${NOTE_NAMES[notes[0]]}${CHORD_SUFFIXES[chord.flavour] || ""}`,
        notes,
        levels: chord.levels.map((level) => level.map(getRootedNote(rootNote))),
      };
    }),
  };
};

export const createScaleFromChords = (chords: Chord[]): Scale => ({
  label: "Chords",
  root: 0,
  type: "chords",
  notes: [
    ...new Set<NoteNumber>(chords.flatMap((chord) => chord.notes)),
  ].sort(),
  chords,
});
