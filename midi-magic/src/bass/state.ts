import { type InputChannel, Note, type OutputChannel } from "webmidi";
import { computed, effect, signal } from "@preact/signals";

import { type Chord } from "../harmony/scales";
import { type Instrument } from "../instruments/types";
import { getChordByNumber } from "../conductor/state";
import { registerInput, registerOutput } from "../storage";
import {
  type STRUMMINGS_NOTE,
  CHORDS,
  CROSS_NOTES,
  DOWN_NOTE,
  FIRST_CROSS_NOTE,
  SET_FREE_PLAY_NOTE,
  TOGGLE_LEADER_NOTE,
  UP_NOTE,
} from "../guitar/controls";
import {
  registerPlayer,
  setChordNumber,
  setFreePlay,
  toggleLeadership,
} from "../conductor/players";

/// Types ----------------------------------------------------------------------

type GetNextNote = (chord: Chord, isNoteDown: boolean) => number;

/// Constant values ------------------------------------------------------------

const CROSS_CC_START = 20;
const CROSS_VALUE_COUNT = 4;
const LABEL = "Bass";

/// State ----------------------------------------------------------------------

const bassIn = signal<InputChannel | null>(null);
const notesOut = signal<OutputChannel | null>(null);
const player = registerPlayer(LABEL, "FREE_PLAY");

const activeChord = computed(() => getChordByNumber(player.value.chordNumber));

const crossValues: Record<number, number> = {
  60: 0,
  61: 0,
  62: 0,
  63: 0,
};

let activeNote: number = activeChord.value.notes[0];
let activeStrumming: STRUMMINGS_NOTE = 67;
let isPlaying: boolean = false;
let strumIndex: number = 0;

/// Private functions ----------------------------------------------------------

const setOctave = (note: number): number => note + (note > 8 ? 24 : 36);

const getNextNote: Record<STRUMMINGS_NOTE, GetNextNote> = {
  67: (chord, isNoteDown) => chord.notes[0] + (isNoteDown ? 0 : 1) * 12,
  68: (chord, isNoteDown) => chord.notes[isNoteDown ? 0 : 2],
  69: (chord, isNoteDown) => chord.notes[isNoteDown ? 0 : 1],
  70: (chord, isNoteDown) => {
    const notes = chord.notes;
    const index = isNoteDown ? strumIndex++ : strumIndex--;
    return notes.at(index % notes.length) as number;
  },
  71: (chord, isNoteDown) => {
    const notes = chord.levels[1] || chord.notes;
    const index = isNoteDown ? strumIndex++ : strumIndex--;
    return notes.at(index % notes.length) as number;
  },
};

const midiPanic = () => {
  notesOut.value?.sendAllNotesOff();
  notesOut.value?.sendAllSoundOff();
};

const offPlayingNote = () => {
  if (isPlaying) {
    notesOut.value?.sendNoteOff(activeNote);
  }
};

/// Event handlers -------------------------------------------------------------

const onNoteOff = ({ note: { number } }: { note: Note }) => {
  switch (true) {
    case number === DOWN_NOTE:
    case number === UP_NOTE:
      offPlayingNote();
      return;
    case number in CHORDS:
      offPlayingNote();
      strumIndex = 0;
      setChordNumber(player, 0);
      return;
  }
};

const onNoteOn = ({ note: { number } }: { note: Note }) => {
  switch (true) {
    case number === DOWN_NOTE:
      offPlayingNote();
      activeNote = setOctave(
        getNextNote[activeStrumming](activeChord.value, true),
      );
      isPlaying = true;
      notesOut.value?.sendNoteOn(activeNote);
      return;
    case number === UP_NOTE:
      offPlayingNote();
      activeNote = setOctave(
        getNextNote[activeStrumming](activeChord.value, false),
      );
      isPlaying = true;
      notesOut.value?.sendNoteOn(activeNote);
      return;
    case number in CHORDS:
      offPlayingNote();
      strumIndex = 0;
      setChordNumber(player, CHORDS[number]);
      return;
    case number in getNextNote:
      offPlayingNote();
      activeStrumming = number as STRUMMINGS_NOTE;
      strumIndex = 0;
      return;
    case number === TOGGLE_LEADER_NOTE:
      offPlayingNote();
      strumIndex = 0;
      toggleLeadership(player);
      return;
    case number === SET_FREE_PLAY_NOTE:
      setFreePlay(player);
      return;
    case CROSS_NOTES.has(number):
      notesOut.value?.sendControlChange(
        number - FIRST_CROSS_NOTE + CROSS_CC_START,
        (crossValues[number] = (crossValues[number] + 1) % CROSS_VALUE_COUNT),
      );
      return;
  }
};

const onWhammy = ({ rawValue }: { rawValue?: number }) => {
  if (rawValue) {
    notesOut.value?.sendControlChange(1, rawValue);
  }
};

/// Effects --------------------------------------------------------------------

effect(() => {
  const input = bassIn.value;
  if (input) {
    input.addListener("controlchange-controller1", onWhammy);
    input.addListener("noteoff", onNoteOff);
    input.addListener("noteon", onNoteOn);
  }

  return () => {
    if (input) {
      input.removeListener("controlchange-controller1", onWhammy);
      input.removeListener("noteoff", onNoteOff);
      input.removeListener("noteon", onNoteOn);
    }
  };
});

registerInput("bass", bassIn);
registerOutput("bass", notesOut);

/// Exports --------------------------------------------------------------------

export const inputs = {
  "Guitar Hero controller": bassIn,
};
export const outputs = {
  "Bass track": notesOut,
};

export const bass: Instrument = {
  label: LABEL,
  inputs,
  midiPanic,
  outputs,
};
