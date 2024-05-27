import { Chord } from "../harmony/scales";

const LOWEST_GUITAR_NOTE = 40;

const makeMajorBarre6 = (root: number) => [
  root,
  root + 7,
  root + 12,
  root + 16,
  root + 19,
  root + 24,
];

const makeMajorBarre5 = (root: number) => makeMajorBarre6(root).slice(0, -1);

const makeMajorBarre = (root: number) =>
  root > 45 ? makeMajorBarre6(root) : makeMajorBarre5(root);

const makeMinorBarre6 = (root: number) => [
  root,
  root + 7,
  root + 12,
  root + 15,
  root + 19,
  root + 24,
];

const makeMinorBarre5 = (root: number) => makeMinorBarre6(root).slice(0, -1);

const makeMinorBarre = (root: number) =>
  root > 45 ? makeMinorBarre6(root) : makeMinorBarre5(root);

const makeDiminished = (root: number) => [root, root + 6, root + 10, root + 15];

const openMajorChords: Record<number, number[]> = {
  /* E */ 40: makeMajorBarre6(40),
  /* G */ 43: [43, 47, 50, 55, 62, 67],
  /* A */ 45: [45, 52, 57, 61, 64],
  /* C */ 48: [48, 52, 55, 60, 64],
  /* D */ 50: [50, 57, 62, 66],
};

const openMinorChords: Record<number, number[]> = {
  /* E */ 40: makeMinorBarre6(40),
  /* A */ 45: [45, 52, 57, 60, 64],
  /* D */ 50: [50, 57, 62, 65],
};

const getRoot = (chord: Chord) => {
  let root = chord.notes[0] + 36;
  if (root < LOWEST_GUITAR_NOTE) {
    root += 12;
  }
  return root;
};

export const getChordNotes = (chord: Chord): number[] => {
  let root = getRoot(chord);
  switch (chord.flavour) {
    case "maj":
      return openMajorChords[root] || makeMajorBarre(root);
    case "min":
      return openMinorChords[root] || makeMinorBarre(root);
    case "dim":
      return makeDiminished(root);
    default:
      return [];
  }
};

export const getPowerChordNotes = (chord: Chord): number[] => {
  const root = getRoot(chord);
  return [root, root + 7, root + 12];
};
