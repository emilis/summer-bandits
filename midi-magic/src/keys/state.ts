import { type InputChannel, type OutputChannel } from "webmidi";
import { computed, effect, signal } from "@preact/signals";

import { activeScale } from "../conductor/state";
import { type Chord } from "../harmony/scales";
import { type Instrument, type NoteEventHandler } from "../instruments/types";
import { LP_COLORS } from "../launchpad/";
import { getClosestChordNote } from "../conductor/state";
import { registerInput, registerOutput } from "../storage";
import {
  Player,
  registerPlayer,
  setChordNumber,
  setFollower,
  setFreePlay,
  setLeader,
} from "../conductor/players";
import {
  play as playerPlay,
  stop as playerStop,
} from './player';

/// Constant values ------------------------------------------------------------

const { BLACK, GREEN_HI, GREEN_LO, RED_HI, RED_LO, YELLOW_HI, YELLOW_LO } =
  LP_COLORS;

const LABEL = "Keyboard";
const CHORDS: Record<number, number> = {
  112: 0,
  113: 1,
  114: 2,
  115: 3,
  116: 4,
  117: 5,
  118: 6,
  119: 7,
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
const player = registerPlayer(LABEL, "FOLLOW");
const spiceLevel = signal<number>(0);

const allNotesMode = computed<boolean>(() => spiceLevel.value > 5);

const notesOn: Record<number, number> = {};

/// Private functions ----------------------------------------------------------

const midiPanic = () => {
  notesOut.value?.sendAllNotesOff();
  notesOut.value?.sendAllSoundOff();
};

/// LaunchPad UI ---------------------------------------------------------------

const setButtonColor = (noteNum: number, color: number) =>
  lpOut.value?.sendNoteOn(noteNum, { rawAttack: color });

const showChordsUi = (playerValue: Player, chords: Chord[]) => {
  const { chordNumber, isFollower, isFreePlay } = playerValue;
  const bgColor = isFollower ? GREEN_LO : isFreePlay ? YELLOW_LO : RED_LO;
  const fgColor = isFollower ? GREEN_HI : isFreePlay ? YELLOW_HI : RED_HI;
  CHORD_NOTES.forEach((midiNote, i) =>
    setButtonColor(
      midiNote,
      !(i in chords)
        ? BLACK
        : midiNote === CHORD_NUMBER_TO_NOTE[chordNumber]
          ? fgColor
          : bgColor,
    ),
  );
};

const showInstrumentsBackground = () => {
  INSTRUMENT_NOTES.forEach((noteNumber) => setButtonColor(noteNumber, RED_LO));
};

const showPlayerModeUi = ({ mode }: Player) => {
  setButtonColor(FOLLOWER_NOTE, mode === "FOLLOW" ? GREEN_HI : GREEN_LO);
  setButtonColor(FREE_PLAY_NOTE, mode === "FREE_PLAY" ? YELLOW_HI : YELLOW_LO);
  setButtonColor(LEADER_NOTE, mode === "LEAD" ? RED_HI : RED_LO);
};

const showSpiceLevelUi = (level: number) => {
  setButtonColor(SPICE_LEVELS[0], level === 0 ? GREEN_HI : GREEN_LO);
  setButtonColor(SPICE_LEVELS[1], level === 1 ? GREEN_HI : GREEN_LO);
  setButtonColor(SPICE_LEVELS[2], level === 2 ? GREEN_HI : GREEN_LO);
  setButtonColor(SPICE_LEVELS[3], level === 3 ? YELLOW_HI : YELLOW_LO);
  setButtonColor(SPICE_LEVELS[4], level === 4 ? YELLOW_HI : YELLOW_LO);
  setButtonColor(SPICE_LEVELS[5], level === 5 ? RED_HI : RED_LO);
  setButtonColor(SPICE_LEVELS[6], level === 6 ? RED_HI : RED_LO);
};

/// Note On handlers -----------------------------------------------------------

const onChannelAftertouch = ({ value }: { value?: number | boolean }) => {
  if (typeof value === "number") {
    notesOut.value?.sendChannelAftertouch(value);
  }
};
const onControlChange = ({
  controller: { number },
  rawValue,
}: {
  controller: { number: number };
  rawValue?: number;
}) => {
  if (typeof rawValue === "number") {
    notesOut.value?.sendControlChange(number, rawValue);
  }
};

const onLpNoteOn: NoteEventHandler = ({ note: { number } }) => {
  /// console.debug("keyboard onLpNoteOn", note.number);

  switch (true) {
    case number in CHORDS: {
      setChordNumber(player, CHORDS[number]);
      return;
    }
    case INSTRUMENT_NOTES.includes(number): {
      notesOut.value?.sendControlChange(0, INSTRUMENT_NOTES.indexOf(number));
      showInstrumentsBackground();
      setButtonColor(number, RED_HI);
      return;
    }
    case SPICE_LEVELS.includes(number): {
      spiceLevel.value = SPICE_LEVELS.indexOf(number);
      showSpiceLevelUi(spiceLevel.peek());
      return;
    }
    case number === FOLLOWER_NOTE: {
      setFollower(player);
      return;
    }
    case number === FREE_PLAY_NOTE: {
      setFreePlay(player);
      return;
    }
    case number === LEADER_NOTE: {
      setLeader(player);
      return;
    }
  }
};

const onNoteOff: NoteEventHandler = ({ note }) => {
  console.debug("keyboard onNoteOff", note.number, note.rawRelease);
  playerStop();
  return;

  notesOut.value?.sendNoteOff(notesOn[note.number], note);
};

const onNoteOn: NoteEventHandler = ({ note }) => {
  console.debug("keyboard onNoteOn", note.number, note.rawAttack);
  playerPlay(note.identifier);
  return;

  const midiNote = allNotesMode.value
    ? note.number
    : getClosestChordNote(
        player.value.chordNumber,
        note.number,
        spiceLevel.value,
      );
  notesOn[note.number] = midiNote;
  notesOut.value?.sendNoteOn(midiNote, note);
};

const onPitchBend = ({ value }: { value?: number | boolean }) => {
  if (typeof value === "number") {
    notesOut.value?.sendPitchBend(value);
  }
};

/// Effects --------------------------------------------------------------------

effect(() => {
  const lpInput = lpIn.value?.input;

  if (lpInput) {
    /// console.log(LABEL, "effect lpIn.value truthy");
    lpInput.addListener("noteon", onLpNoteOn);
  }

  return () => {
    if (lpInput) {
      lpInput.removeListener("noteon", onLpNoteOn);
    }
  };
});
effect(() => {
  if (lpOut.value) {
    /// console.log(LABEL, "effect lpOut.value truthy");

    lpOut.value.sendControlChange(0, 0); // turn off all buttons
    showChordsUi(player.peek(), activeScale.peek().chords);
    showInstrumentsBackground();
    showPlayerModeUi(player.peek());
    showSpiceLevelUi(spiceLevel.peek());
  }
});
effect(() => {
  const notesInput = notesIn.value;

  if (notesInput) {
    /// console.log(LABEL, "effect notesInput truthy");
    notesInput.addListener("channelaftertouch", onChannelAftertouch);
    notesInput.addListener("controlchange", onControlChange);
    notesInput.addListener("noteoff", onNoteOff);
    notesInput.addListener("noteon", onNoteOn);
    notesInput.addListener("pitchbend", onPitchBend);
  }

  return () => {
    if (notesInput) {
      notesInput.removeListener("channelaftertouch", onChannelAftertouch);
      notesInput.removeListener("controlchange", onControlChange);
      notesInput.removeListener("noteoff", onNoteOff);
      notesInput.removeListener("noteon", onNoteOn);
      notesInput.removeListener("pitchbend", onPitchBend);
    }
  };
});
effect(() => {
  showChordsUi(player.value, activeScale.value.chords);
});
effect(() => {
  showPlayerModeUi(player.value);
});

/// Register MIDI I/O  ---------------------------------------------------------

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

export const keyboard: Instrument = {
  label: LABEL,
  inputs,
  midiPanic,
  outputs,
};
