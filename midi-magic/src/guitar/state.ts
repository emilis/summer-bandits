import { type InputChannel, Note, type OutputChannel } from "webmidi";
import { effect, signal } from "@preact/signals";

import { type ChordNumber } from "../harmony/scales";
import { type Instrument } from "../instruments/types";
import { activeChord, setActiveChord } from "../conductor/state";

/// Types ----------------------------------------------------------------------

type Options = {
  localChords: boolean;
};

/// Constant values ------------------------------------------------------------

const OPEN_CHORD_NOTE = 47;

// This mapping is not final, but here just for testing the playback of all chords
const CHORDS: Record<number, ChordNumber> = {
  [OPEN_CHORD_NOTE]: "i",
  48: "ii",
  49: "iii",
  50: "iv",
  51: "v",
  52: "vi",
  53: "vii",
};
const LOWEST_GUITAR_NOTE = 40;

/// Chord shapes ---------------------------------------------------------------

const makeMajorBarre = (root: number) => [
  root,
  root + 7,
  root + 12,
  root + 16,
  root + 19,
  root + 24,
];

const makeMinorBarre = (root: number) => [
  root,
  root + 7,
  root + 12,
  root + 15,
  root + 19,
  root + 24,
];

const makeDiminished = (root: number) => [root, root + 6, root + 10, root + 15];

const openMajorChords: Record<number, number[]> = {
  /* E */ 40: makeMajorBarre(40),
  /* G */ 43: [43, 47, 50, 55, 62, 67],
  /* A */ 45: [45, 52, 57, 61, 64],
  /* C */ 48: [48, 52, 55, 60, 64],
  /* D */ 50: [50, 57, 62, 66],
};

const openMinorChords: Record<number, number[]> = {
  /* E */ 40: makeMinorBarre(40),
  /* A */ 45: [45, 52, 57, 60, 64],
  /* D */ 50: [50, 57, 62, 65],
};

/// State ----------------------------------------------------------------------

const guitarIn = signal<InputChannel | null>(null);
const notesOut = signal<OutputChannel | null>(null);
const options = signal<Options>({
  localChords: false,
});

let activeNote = OPEN_CHORD_NOTE;
const notesDown = new Set<number>();

/// Private functions ----------------------------------------------------------

const isDownNote = (note: Note) => note.number === 58;

const isUpNote = (note: Note) => note.number === 59;

const midiPanic = () => {
  notesOut.value?.sendAllNotesOff();
  notesOut.value?.sendAllSoundOff();
};

const maybeApplyChordChange = () => {
  const maxNote =
    notesDown.size != 0 ? Math.max(...notesDown) : OPEN_CHORD_NOTE;
  if (maxNote == activeNote) {
    return;
  }
  activeNote = maxNote;
  notesOut.value?.sendAllNotesOff();
  setActiveChord(CHORDS[maxNote]);
};

const onNoteOff = ({ note }: { note: Note }) => {
  console.debug("guitar onNoteOff", note);
  switch (true) {
    case note.number in CHORDS:
      notesDown.delete(note.number);
      maybeApplyChordChange();
      return;
  }
};

const getCurrentChordNotes = () => {
  const chord = activeChord.value;
  let root = chord.notes[0] + 36;
  if (root < LOWEST_GUITAR_NOTE) {
    root += 12;
  }
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

const onNoteOn = ({ note }: { note: Note }) => {
  console.debug("guitar onNoteOn", note);
  switch (true) {
    case isDownNote(note) || isUpNote(note):
      if (!notesOut.value) {
        return;
      }
      notesOut.value?.sendAllNotesOff();
      let notes = getCurrentChordNotes();
      if (isUpNote(note)) {
        notes = [...notes].reverse();
      }
      const varietyNumber = Math.random();
      const baseVelocity = 0.9 - 0.3 * varietyNumber;
      const strumSpeed = 20 - 10 * varietyNumber;
      notes.forEach((chordNote, index) => {
        notesOut.value?.sendNoteOn(
          new Note(chordNote, { attack: baseVelocity - 0.05 * index }),
          { time: `+${index * strumSpeed}` }
        );
      });
      return;
    case note.number in CHORDS:
      notesDown.add(note.number);
      maybeApplyChordChange();
      return;
  }
};

/// Effects --------------------------------------------------------------------

effect(() => {
  const input = guitarIn.value?.input;

  if (input) {
    input.addListener("noteoff", onNoteOff);
    input.addListener("noteon", onNoteOn);
  }

  return () => {
    const input = guitarIn.value?.input;
    if (input) {
      input.removeListener("noteoff", onNoteOff);
      input.removeListener("noteon", onNoteOn);
    }
  };
});

/// Exports --------------------------------------------------------------------

export const inputs = {
  "Guitar Hero controller": guitarIn,
};
export const outputs = {
  "Guitar track": notesOut,
};

export const setOptions = (newOptions: Options) => {
  options.value = {
    ...options.value,
    ...newOptions,
  };
};

export const guitar: Instrument = {
  label: "Guitar",
  inputs,
  midiPanic,
  outputs,
  setOptions,
};
