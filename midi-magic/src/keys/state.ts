import { type InputChannel, type OutputChannel } from "webmidi";
import { computed, effect, signal } from "@preact/signals";

import { type ChordNumber } from "../harmony/scales";
import { type Instrument, type NoteEventHandler } from "../instruments/types";
import { LP_COLORS } from "../launchpad/";
import {
  activeChordNumber,
  getClosestNote,
  setActiveChord,
} from "../conductor/state";
import { registerInput, registerOutput } from "../storage";

/// Types ----------------------------------------------------------------------

type Options = {
  localChords: boolean;
};

/// Constant values ------------------------------------------------------------

const CHORDS: Record<number, ChordNumber> = {
  112: "i",
  113: "ii",
  114: "iii",
  115: "iv",
  116: "v",
  117: "vi",
  118: "vii",
};
const CHORD_NOTES = Object.keys(CHORDS).map(Number);
const CHORD_NUMBER_TO_NOTE = Object.fromEntries(
  Object.entries(CHORDS).map(([note, chord]) => [chord, Number(note)]),
);
const INSTRUMENT_NOTES = [64, 65, 66, 67, 68, 69, 70, 71, 80, 81, 82];
const LEADER_NOTE = 88;
const FOLLOWER_NOTE = 104;
const FREE_PLAY_NOTE = 120;
const SPICE_LEVELS = [96, 97, 98, 99, 100, 101, 103];

/// State ----------------------------------------------------------------------

const lpIn = signal<InputChannel | null>(null);
const lpOut = signal<OutputChannel | null>(null);
const notesIn = signal<InputChannel | null>(null);
const notesOut = signal<OutputChannel | null>(null);
const options = signal<Options>({
  localChords: false,
});
const spiceLevel = signal<number>(0);

const allNotesMode = computed<boolean>(() => spiceLevel.value > 5);

const notesOn: Record<number, number> = {};

/// Private functions ----------------------------------------------------------

const midiPanic = () => {
  notesOut.value?.sendAllNotesOff();
  notesOut.value?.sendAllSoundOff();
};

const setButtonColor = (noteNum: number, color: number) =>
  lpOut.value?.sendNoteOn(noteNum, { rawAttack: color });

const setChordsBackground = () => {
  CHORD_NOTES.forEach((midiNote) =>
    setButtonColor(midiNote, LP_COLORS.YELLOW_LO),
  );
};

const setInstrumentsBackground = () => {
  INSTRUMENT_NOTES.forEach((noteNumber) =>
    setButtonColor(noteNumber, LP_COLORS.RED_LO),
  );
};

const setSpiceLevelColors = () => {
  const { GREEN_HI, GREEN_LO, RED_HI, RED_LO, YELLOW_HI, YELLOW_LO } =
    LP_COLORS;
  const level = spiceLevel.value;
  setButtonColor(SPICE_LEVELS[0], level === 0 ? GREEN_HI : GREEN_LO);
  setButtonColor(SPICE_LEVELS[1], level === 1 ? GREEN_HI : GREEN_LO);
  setButtonColor(SPICE_LEVELS[2], level === 2 ? GREEN_HI : GREEN_LO);
  setButtonColor(SPICE_LEVELS[3], level === 3 ? YELLOW_HI : YELLOW_LO);
  setButtonColor(SPICE_LEVELS[4], level === 4 ? YELLOW_HI : YELLOW_LO);
  setButtonColor(SPICE_LEVELS[5], level === 5 ? RED_HI : RED_LO);
  setButtonColor(SPICE_LEVELS[6], level === 6 ? RED_HI : RED_LO);
};

const onLpNoteOff: NoteEventHandler = ({ note }) => {
  console.debug("keyboard onLpNoteOff", note.number);
};

const onLpNoteOn: NoteEventHandler = ({ note }) => {
  console.debug("keyboard onLpNoteOn", note.number);

  if (note.number in CHORDS) {
    setActiveChord(CHORDS[note.number]);
  } else if (INSTRUMENT_NOTES.includes(note.number)) {
    notesOut.value?.sendControlChange(0, INSTRUMENT_NOTES.indexOf(note.number));
    setInstrumentsBackground();
    setButtonColor(note.number, LP_COLORS.RED_HI);
  } else if (SPICE_LEVELS.includes(note.number)) {
    spiceLevel.value = SPICE_LEVELS.indexOf(note.number);
    setSpiceLevelColors();
  }
};

const onNoteOff: NoteEventHandler = ({ note }) => {
  console.debug("keyboard onNoteOff", note.number, note.rawRelease);

  notesOut.value?.sendNoteOff(notesOn[note.number], note);
};

const onNoteOn: NoteEventHandler = ({ note }) => {
  console.debug("keyboard onNoteOn", note.number, note.rawAttack);

  const midiNote = allNotesMode.value
    ? note.number
    : getClosestNote(note.number, spiceLevel.value);
  notesOn[note.number] = midiNote;
  notesOut.value?.sendNoteOn(midiNote, note);
};

/// Effects --------------------------------------------------------------------

effect(() => {
  const lpInput = lpIn.value?.input;

  if (lpInput) {
    lpInput.addListener("noteoff", onLpNoteOff);
    lpInput.addListener("noteon", onLpNoteOn);
  }

  return () => {
    if (lpInput) {
      lpInput.removeListener("noteoff", onLpNoteOff);
      lpInput.removeListener("noteon", onLpNoteOn);
    }
  };
});
effect(() => {
  if (lpOut.value) {
    lpOut.value.sendControlChange(0, 0);
    setChordsBackground();
    setInstrumentsBackground();
    setSpiceLevelColors();
  }
});

effect(() => {
  const notesInput = notesIn.value;

  if (notesInput) {
    notesInput.addListener("noteoff", onNoteOff);
    notesInput.addListener("noteon", onNoteOn);
  }

  return () => {
    if (notesInput) {
      notesInput.removeListener("noteoff", onNoteOff);
      notesInput.removeListener("noteon", onNoteOn);
    }
  };
});

effect(() => {
  console.log(
    "effect",
    activeChordNumber.value,
    CHORD_NUMBER_TO_NOTE[activeChordNumber.value],
  );
  setChordsBackground();
  setButtonColor(
    CHORD_NUMBER_TO_NOTE[activeChordNumber.value],
    LP_COLORS.YELLOW_HI,
  );
});

registerInput("keys.keyboard", notesIn);
registerOutput("keys.keyboard", notesOut);
registerInput("keys.lp", lpIn);
registerOutput("keys.lp", lpOut);

/// Exports --------------------------------------------------------------------

export const inputs = {
  Keyboard: notesIn,
  LaunchPad: lpIn,
};
export const outputs = {
  "Keys track": notesOut,
  LaunchPad: lpOut,
};

export const setOptions = (newOptions: Options) => {
  options.value = {
    ...options.value,
    ...newOptions,
  };
};

export const keyboard: Instrument = {
  label: "Keyboard",
  inputs,
  midiPanic,
  outputs,
  setOptions,
};
