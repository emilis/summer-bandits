export type NoteNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type Chord = {
  flavour: Flavour;
  label?: string;
  notes: NoteNumber[];
  levels: NoteNumber[][];
};
export type ChordNumber =
  | "i"
  | "ii"
  | "iii"
  | "iv"
  | "v"
  | "vi"
  | "vii"
  | "viii"
  | "ix"
  | "x";
export type Flavour = "maj" | "min" | "dim" | "aug" | "unknown";

type ScaleChords = Partial<Record<ChordNumber, Chord>>;
export type Scale = {
  type: ScaleType;
  label: string;
  notes: NoteNumber[];
  chords: ScaleChords;
  root: NoteNumber;
};
export type ScaleType = "chords" | "major" | "minor" | "harmonic_minor";

export const CHORD_NUMBERS: ChordNumber[] = [
  "i",
  "ii",
  "iii",
  "iv",
  "v",
  "vi",
  "vii",
  "viii",
  "ix",
  "x",
];
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
    chords: {
      i: {
        flavour: "maj",
        notes: [0, 7, 4],
        levels: [
          [0, 7, 4, 2],
          [0, 7, 4, 2, 9],
          [0, 7, 4, 11],
          [0, 7, 4, 11, 2],
        ],
      },
      ii: {
        flavour: "min",
        notes: [2, 9, 5],
        levels: [
          [2, 9, 5, 0],
          [2, 9, 5, 0, 7],
          [2, 9, 5, 0],
          [2, 9, 5, 0, 4],
        ],
      },
      iii: {
        flavour: "min",
        notes: [4, 11, 7],
        levels: [
          [4, 11, 7, 2],
          [4, 11, 7, 2, 9],
          [4, 11, 7, 2],
          [4, 11, 7, 2, 5],
        ],
      },
      iv: {
        flavour: "maj",
        notes: [5, 0, 9],
        levels: [
          [5, 0, 9, 7],
          [5, 0, 9, 7, 2],
          [5, 0, 9, 4],
          [5, 0, 9, 4, 7],
        ],
      },
      v: {
        flavour: "maj",
        notes: [7, 2, 11, 5],
        levels: [
          [7, 2, 11, 9],
          [7, 2, 11, 9, 4],
          [7, 2, 11, 5],
          [7, 2, 11, 5, 9],
        ],
      },
      vi: {
        flavour: "min",
        notes: [9, 4, 0],
        levels: [
          [9, 4, 0, 7],
          [9, 4, 0, 7, 2],
          [9, 4, 0, 7],
          [9, 4, 0, 7, 11],
        ],
      },
      vii: {
        flavour: "dim",
        notes: [11, 2, 5],
        levels: [
          [11, 2, 9],
          [11, 2, 9, 4],
          [11, 2, 5, 9],
          [11, 2, 5, 9, 4],
        ],
      },
    },
  },
  minor: {
    label: "Minor",
    type: "minor",
    notes: [0, 2, 3, 5, 7, 8, 10],
    chords: {
      i: {
        flavour: "min",
        notes: [0, 7, 3],
        levels: [
          [0, 7, 3, 10],
          [0, 7, 3, 10, 5],
          [0, 7, 3, 10],
          [0, 7, 3, 10, 2],
        ],
      },
      ii: {
        flavour: "dim",
        notes: [2, 5, 8],
        levels: [
          [2, 5, 0],
          [2, 5, 0, 7],
          [2, 5, 8, 0],
          [2, 5, 8, 0, 7],
        ],
      },
      iii: {
        flavour: "maj",
        notes: [3, 10, 7],
        levels: [
          [3, 10, 7, 5],
          [3, 10, 7, 5, 0],
          [3, 10, 7, 2],
          [3, 10, 7, 2, 5],
        ],
      },
      iv: {
        flavour: "min",
        notes: [5, 0, 8],
        levels: [
          [5, 0, 8, 3],
          [5, 0, 8, 3, 10],
          [5, 0, 8, 3],
          [5, 0, 8, 3, 7],
        ],
      },
      v: {
        flavour: "min",
        notes: [7, 2, 10],
        levels: [
          [7, 2, 10, 5],
          [7, 2, 10, 5, 0],
          [7, 2, 10, 5],
          [7, 2, 10, 5, 8],
        ],
      },
      vi: {
        flavour: "maj",
        notes: [8, 3, 0],
        levels: [
          [8, 3, 0, 10],
          [8, 3, 0, 10, 5],
          [8, 3, 0, 7],
          [8, 3, 0, 7, 10],
        ],
      },
      vii: {
        flavour: "maj",
        notes: [10, 5, 2],
        levels: [
          [10, 5, 2, 0],
          [10, 5, 2, 0, 7],
          [10, 5, 2, 8],
          [10, 5, 2, 8, 0],
        ],
      },
    },
  },
  harmonic_minor: {
    label: "Harmonic minor",
    type: "harmonic_minor",
    notes: [0, 2, 3, 5, 7, 8, 11],
    chords: {
      i: {
        flavour: "min",
        notes: [0, 7, 3],
        levels: [
          [0, 7, 3, 5],
          [0, 7, 3, 5],
          [0, 7, 3, 2],
          [0, 7, 3, 2, 11],
        ],
      },
      ii: {
        flavour: "dim",
        notes: [2, 5, 8],
        levels: [
          [2, 5, 0],
          [2, 5, 0, 7],
          [2, 5, 8, 11],
          [2, 5, 8, 0],
        ],
      },
      iii: {
        flavour: "aug",
        notes: [3, 11, 7],
        levels: [
          [3, 7, 5],
          [3, 7, 5, 0],
          [3, 7, 11, 2],
          [3, 7, 2, 5],
        ],
      },
      iv: {
        flavour: "min",
        notes: [5, 0, 8],
        levels: [
          [5, 0, 8, 3],
          [5, 0, 8, 3],
          [5, 0, 8, 3],
          [5, 0, 8, 3, 7],
        ],
      },
      v: {
        flavour: "maj",
        notes: [7, 2, 11, 5],
        levels: [
          [7, 2, 5],
          [7, 2, 5, 0],
          [7, 2, 11, 5],
          [7, 11, 3, 5],
        ],
      },
      vi: {
        flavour: "maj",
        notes: [8, 3, 0],
        levels: [
          [8, 3, 0],
          [8, 3, 0, 5],
          [8, 3, 0, 7],
          [8, 0, 7, 2],
        ],
      },
      vii: {
        flavour: "dim",
        notes: [11, 5, 2],
        levels: [
          [11, 3, 7],
          [11, 3, 7],
          [11, 2, 5, 8],
          [11, 2, 5, 8],
        ],
      },
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

  if (!scale) {
    throw `Unable to create the scale of type "${scaleType}".`;
  }

  return {
    label: `${noteName} ${scale.label}`,
    root: rootNote,
    type: scale.type,
    notes: scale.notes.map(getRootedNote(rootNote)),
    chords: Object.fromEntries(
      Object.entries(scale.chords).map(([chordNum, chord]) => {
        const notes = chord.notes.map(getRootedNote(rootNote));

        return [
          chordNum,
          {
            flavour: chord.flavour,
            label: `${NOTE_NAMES[notes[0]]}${CHORD_SUFFIXES[chord.flavour] || ""}`,
            notes,
            levels: chord.levels.map((level) =>
              level.map(getRootedNote(rootNote)),
            ),
          },
        ];
      }),
    ) as ScaleChords,
  };
};

export const createScaleFromChords = (chords: Chord[]): Scale => ({
  label: "Chords",
  root: 0,
  type: "chords",
  notes: [
    ...new Set<NoteNumber>(chords.flatMap((chord) => chord.notes)),
  ].sort(),
  chords: Object.fromEntries(
    chords.map((chord, i) => [CHORD_NUMBERS[i], chord]),
  ),
});
