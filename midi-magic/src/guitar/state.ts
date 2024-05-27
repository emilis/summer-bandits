import { type InputChannel, Note, type OutputChannel } from "webmidi";
import { effect, signal } from "@preact/signals";

import { type ChordNumber } from "../harmony/scales";
import { type Instrument } from "../instruments/types";
import { activeChord, setActiveChord } from "../conductor/state";
import {
  CombinedStrumming,
  FullStrumming,
  PickedStrumming,
  PowerChordStrumming,
  Strumming,
} from "./strumming";

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

/// State ----------------------------------------------------------------------

const guitarIn = signal<InputChannel | null>(null);
const notesOut = signal<OutputChannel | null>(null);
const options = signal<Options>({
  localChords: false,
});

let activeNote = OPEN_CHORD_NOTE;
const notesDown = new Set<number>();

const STRUMMINGS: Record<number, Strumming> = {
  67: FullStrumming(activeChord, notesOut),
  68: PickedStrumming(activeChord, notesOut, { resetOnChordChange: false }),
  69: PickedStrumming(activeChord, notesOut, { resetOnChordChange: true }),
  70: CombinedStrumming(activeChord, notesOut, { rootNoteCount: 1 }),
  71: CombinedStrumming(activeChord, notesOut, { rootNoteCount: 2 }),
  72: PowerChordStrumming(activeChord, notesOut),
};

let currentStrumming = FullStrumming(activeChord, notesOut);

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

const onNoteOn = ({ note }: { note: Note }) => {
  console.debug("guitar onNoteOn", note);
  switch (true) {
    case isDownNote(note):
      currentStrumming.handleDown();
      return;
    case isUpNote(note):
      currentStrumming.handleUp();
      return;
    case note.number in CHORDS:
      notesDown.add(note.number);
      maybeApplyChordChange();
      return;
    case note.number in STRUMMINGS:
      currentStrumming = STRUMMINGS[note.number];
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
