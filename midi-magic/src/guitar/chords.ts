import { Chord } from "../harmony/scales";

const E = 40;
const A = 45;
const D = 50;
const G = 55;
const B = 59;
const Ehigh = 64;

const LOWEST_GUITAR_NOTE = E;

const x: "x" = "x";

type Fret =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19;

type FingerPosition = "x" | Fret;

const literalChord = (
  s6: FingerPosition,
  s5: FingerPosition,
  s4: FingerPosition,
  s3: FingerPosition,
  s2: FingerPosition,
  s1: FingerPosition,
): number[] => {
  const notes: number[] = [];
  if (s6 != "x") notes.push(E + s6);
  if (s5 != "x") notes.push(A + s5);
  if (s4 != "x") notes.push(D + s4);
  if (s3 != "x") notes.push(G + s3);
  if (s2 != "x") notes.push(B + s2);
  if (s1 != "x") notes.push(Ehigh + s1);
  return notes;
};

const calculatedChord = (
  fret: Fret,
  s6: FingerPosition,
  s5: FingerPosition,
  s4: FingerPosition,
  s3: FingerPosition,
  s2: FingerPosition,
  s1: FingerPosition,
): number[] => literalChord(s6, s5, s4, s3, s2, s1).map((note) => note + fret);

const makeMajorBarreOnE = (root: number) =>
  calculatedChord((root - E) as Fret, 0, 2, 2, 1, 0, 0);

const makeMajorBarreOnA = (root: number) =>
  calculatedChord((root - A) as Fret, x, 0, 2, 2, 2, 0);

const makeMajorBarre = (root: number) =>
  root > A ? makeMajorBarreOnE(root) : makeMajorBarreOnA(root);

const makeMinorBarreOnE = (root: number) =>
  calculatedChord((root - E) as Fret, 0, 2, 2, 0, 0, 0);

const makeMinorBarreOnA = (root: number) =>
  calculatedChord((root - A) as Fret, x, 0, 2, 2, 1, 0);

const makeMinorBarre = (root: number) =>
  root > A ? makeMinorBarreOnE(root) : makeMinorBarreOnA(root);

const makeDiminished = (root: number) =>
  calculatedChord((root - E) as Fret, 0, 1, 0, 0, x, x);

const makeAugmented = (root: number) =>
  calculatedChord((root - E) as Fret, 0, 3, 2, 1, x, x);

const openMajorChords: Record<number, number[]> = {
  /* E */ 40: makeMajorBarreOnE(E),
  /* G */ 43: literalChord(3, 2, 0, 0, 3, 3),
  /* A */ 45: makeMajorBarreOnA(A),
  /* C */ 48: literalChord(x, 3, 2, 0, 1, 0),
  /* D */ 50: literalChord(x, x, 0, 3, 2, 3),
};

const openMinorChords: Record<number, number[]> = {
  /* E */ 40: makeMinorBarreOnE(E),
  /* A */ 45: makeMinorBarreOnA(A),
  /* D */ 50: literalChord(x, x, 0, 2, 3, 1),
};

const makeMajor7BarreOnE = (root: number) =>
  calculatedChord((root - E) as Fret, 0, 2, 1, 1, 0, 0);

const makeMajor7BarreOnA = (root: number) =>
  calculatedChord((root - A) as Fret, x, 0, 2, 1, 2, 0);

const makeMajor7Barre = (root: number) =>
  root > A ? makeMajor7BarreOnE(root) : makeMajor7BarreOnA(root);

const openMajor7Chords: Record<number, number[]> = {
  /* E */ 40: literalChord(0, 2, 1, 1, 0, 0),
  /* F */ 41: literalChord(x, x, 3, 2, 1, 0),
  /* G */ 43: literalChord(3, 2, 0, 0, 0, 2),
  /* A */ 45: literalChord(x, 0, 2, 1, 2, 0),
  /* B */ 47: literalChord(x, 2, 1, 3, 0, x),
  /* C */ 48: literalChord(x, 3, 2, 0, 0, 0),
  /* D */ 50: literalChord(x, x, 0, 2, 2, 2),
};

const makeMinor7BarreOnE = (root: number) =>
  calculatedChord((root - E) as Fret, 0, 2, 0, 0, 0, 0);

const makeMinor7BarreOnA = (root: number) =>
  calculatedChord((root - A) as Fret, x, 0, 2, 0, 1, 0);

const makeMinor7Barre = (root: number) =>
  root > A ? makeMinor7BarreOnE(root) : makeMinor7BarreOnA(root);

const openMinor7Chords: Record<number, number[]> = {
  /* E */ 40: literalChord(0, 2, 2, 0, 3, 0),
  /* A */ 45: literalChord(x, 0, 2, 0, 1, 0),
  /* B */ 47: literalChord(x, 2, 0, 2, 0, 2),
  /* C */ 48: literalChord(x, 3, x, 3, 4, 3),
  /* D */ 50: literalChord(x, x, 0, 2, 1, 1),
};

const getRoot = (chord: Chord) => {
  let root = chord.notes[0] + 36;
  if (root < LOWEST_GUITAR_NOTE) {
    root += 12;
  }
  return root;
};

const getChordNotes = (chord: Chord): number[] => {
  const root = getRoot(chord);
  switch (chord.flavour) {
    case "maj":
      return openMajorChords[root] || makeMajorBarre(root);
    case "min":
      return openMinorChords[root] || makeMinorBarre(root);
    case "dim":
      return makeDiminished(root);
    case "aug":
      return makeAugmented(root);
    default:
      return [];
  }
};

const getSpicyChordNotes = (chord: Chord): number[] => {
  const root = getRoot(chord);
  switch (chord.flavour) {
    case "maj":
      return openMajor7Chords[root] || makeMajor7Barre(root);
    case "min":
      return openMinor7Chords[root] || makeMinor7Barre(root);
    case "dim":
      return makeDiminished(root);
    case "aug":
      return makeAugmented(root);
    default:
      return [];
  }
};

export type GuitarChord = {
  chord: Chord;
  spicy: boolean;
};

export const getGuitarChordNotes = (chord: GuitarChord) =>
  chord.spicy ? getSpicyChordNotes(chord.chord) : getChordNotes(chord.chord);

export const getPowerChordNotes = (chord: GuitarChord): number[] =>
  calculatedChord((getRoot(chord.chord) - E) as Fret, 0, 2, 2, x, x, x);
