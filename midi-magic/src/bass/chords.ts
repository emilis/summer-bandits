import { Chord } from "../harmony/scales";

const LOWEST_BASS_NOTE = 28;

const makeMajor = (root: number) => [root, root + 4, root + 7, root + 12];

const makeMinor = (root: number) => [root, root + 3, root + 7, root + 12];

const makeDiminished = (root: number) => [root, root + 3, root + 6, root + 12];

const getRoot = (chord: Chord) => {
  let root = chord.notes[0] + 24;
  if (root < LOWEST_BASS_NOTE) {
    root += 12;
  }
  return root;
};

export const getChordNotes = (chord: Chord): number[] => {
  let root = getRoot(chord);
  switch (chord.flavour) {
    case "maj":
      return makeMajor(root);
    case "min":
      return makeMinor(root);
    case "dim":
      return makeDiminished(root);
    default:
      return [];
  }
};
