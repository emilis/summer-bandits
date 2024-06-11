import { type InputChannel, type OutputChannel } from "webmidi";
import { effect, signal } from "@preact/signals";

import { NoteNumber, type ChordNumber } from "../harmony/scales";
import { type Instrument, type NoteEventHandler } from "../instruments/types";
import { LP_COLORS } from '../launchpad/';
import {
  type MIDINumber,
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

const INSTRUMENT_NOTES: MIDINumber[] = [ 64, 65, 66, 67, 68, 69, 70, 71, 80, 81, 82 ];

const CHORDS: Record<number, ChordNumber> = {
  112: "i",
  113: "ii",
  114: "iii",
  115: "iv",
  116: "v",
  117: "vi",
  118: "vii",
  119: "i",
};
const CHORD_NUMBER_TO_NOTE = Object.fromEntries(
  Object.entries(CHORDS).map(([note, chord]) => [chord, Number(note)]),
);

/// State ----------------------------------------------------------------------

const lpIn = signal<InputChannel | null>(null);
const lpOut = signal<OutputChannel | null>(null);
const notesIn = signal<InputChannel | null>(null);
const notesOut = signal<OutputChannel | null>(null);
const options = signal<Options>({
  localChords: false,
});

const notesOn: Record<number, MIDINumber> = {};

/// Private functions ----------------------------------------------------------

const midiPanic = () => {
  notesOut.value?.sendAllNotesOff();
  notesOut.value?.sendAllSoundOff();
};

const setButtonColor = (noteNum: MIDINumber, color: MIDINumber) =>
    lpOut.value?.sendNoteOn(noteNum, { rawAttack: color });

const setChordsBackground = () => {
    Object.keys(CHORDS)
    .map(Number)
    .forEach((midiNote) =>
        setButtonColor(midiNote as MIDINumber, LP_COLORS.YELLOW_LO as MIDINumber),
    );
};

const setInstrumentsBackground = () => {
  INSTRUMENT_NOTES.forEach( noteNumber =>
    setButtonColor( noteNumber, LP_COLORS.RED_LO ),
  );
};

const onLpNoteOff: NoteEventHandler = ({ note }) => {
  console.debug("keyboard onLpNoteOff", note.number);
};

const onLpNoteOn: NoteEventHandler = ({ note }) => {
  console.debug("keyboard onLpNoteOn", note.number);

  if (note.number in CHORDS) {
    setActiveChord(CHORDS[note.number]);
  } else if( INSTRUMENT_NOTES.includes( note.number )){
    notesOut.value?.sendControlChange( 0, INSTRUMENT_NOTES.indexOf( note.number ));
    setInstrumentsBackground();
    setButtonColor( note.number, LP_COLORS.RED_HI );
  }
};

const onNoteOff: NoteEventHandler = ({ note }) => {
  console.debug("keyboard onNoteOff", note.number, note.rawRelease);

  notesOut.value?.sendNoteOff(notesOn[note.number], note);
};

const onNoteOn: NoteEventHandler = ({ note }) => {
  console.debug("keyboard onNoteOn", note.number, note.rawAttack);

  const midiNote = getClosestNote(note.number as MIDINumber);
  notesOn[note.number] = midiNote;
  notesOut.value?.sendNoteOn(midiNote, note);
};

/// Effects --------------------------------------------------------------------

effect(() => {
  const lpInput = lpIn.value?.input;

  if (lpInput) {
    lpInput.addListener("noteoff", onLpNoteOff);
    lpInput.addListener("noteon", onLpNoteOn);

    setChordsBackground();
  }

  return () => {
    if (lpInput) {
      lpInput.removeListener("noteoff", onLpNoteOff);
      lpInput.removeListener("noteon", onLpNoteOn);
    }
  };
});

effect(() => {
  const notesInput = notesIn.value?.input;

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
