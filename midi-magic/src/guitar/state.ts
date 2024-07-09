import { type InputChannel, Note, type OutputChannel } from "webmidi";
import { batch, effect, signal } from "@preact/signals";

import { type Instrument } from "../instruments/types";
import { getChordByNumber } from "../conductor/state";
import {
  CombinedStrumming,
  FullStrumming,
  NoteSender,
  PickedStrumming,
  PowerChordStrumming,
  Strumming,
} from "./strumming";
import { registerInput, registerOutput } from "../storage";

import { GuitarChord } from "./chords";
import {
  CHORDS,
  CLOSER_CHORD_NOTES,
  CROSS_NOTES,
  DOWN_NOTE,
  FIRST_CROSS_NOTE,
  OPEN_CHORD_NOTE,
  SET_FREE_PLAY_NOTE,
  TOGGLE_LEADER_NOTE,
  UP_NOTE,
} from "./controls";
import {
  registerPlayer,
  setChordNumber,
  setFreePlay,
  toggleLeadership,
} from "../conductor/players";

/// Constant values ------------------------------------------------------------

const CROSS_CC_START = 80;
const CROSS_VALUE_COUNT = 4;
const LABEL = "Guitar";

/// State ----------------------------------------------------------------------

const guitarIn = signal<InputChannel | null>(null);
const notesOut = signal<OutputChannel | null>(null);
const player = registerPlayer(LABEL, "LEAD");

const spicy = signal<boolean>(false);

const activeGuitarChord = signal<GuitarChord>({
  chord: getChordByNumber(player.peek().chordNumber),
  spicy: spicy.peek(),
});

let activeNote = OPEN_CHORD_NOTE;
const notesDown = new Set<number>();

let previousChord = activeGuitarChord.peek();

let lastStrumAt = performance.now();
let lastStrumDirection: "UP" | "DOWN" = "DOWN";

type PlayingNote = {
  pitch: number;
  scheduledAt?: number;
};

const playingNotes: PlayingNote[] = [];

const crossValues: Record<number, number> = {
  60: 0,
  61: 0,
  62: 0,
  63: 0,
};

const noteSender: NoteSender = {
  playNote: (note) => {
    const { pitch, velocity, delay } = note;
    const now = performance.now();
    const scheduledAt = delay ? now + delay : undefined;
    const existingIndex = playingNotes.findIndex(
      (playing) => playing.pitch === pitch,
    );
    // TODO: this doesn't mute notes before retriggering them.
    // Not sure if it's a problem though.
    if (existingIndex === -1) {
      playingNotes.push({ pitch, scheduledAt });
    } else {
      // Only keep latest scheduled note to not send multiple notes offs for same note.
      const alreadyScheduledAt = playingNotes[existingIndex].scheduledAt;
      if (scheduledAt) {
        if (!alreadyScheduledAt || scheduledAt > alreadyScheduledAt) {
          playingNotes[existingIndex] = { pitch, scheduledAt };
        }
      }
    }
    notesOut.value?.sendNoteOn(new Note(pitch, { attack: velocity }), {
      time: scheduledAt,
    });
  },
  muteAll: (except?: Set<number>) => {
    const exceptNotes = except || new Set();
    const keptNotes: PlayingNote[] = [];
    playingNotes.forEach((note) => {
      if (exceptNotes.has(note.pitch)) {
        keptNotes.push(note);
      } else {
        const { pitch, scheduledAt } = note;
        if (scheduledAt) {
          notesOut.value?.sendNoteOff(pitch, { time: scheduledAt + 0.1 });
        } else {
          notesOut.value?.sendNoteOff(pitch);
        }
      }
    });
    playingNotes.length = 0;
    playingNotes.push(...keptNotes);
  },
};

const STRUMMINGS: Record<number, Strumming> = {
  67: FullStrumming(activeGuitarChord, noteSender),
  68: CombinedStrumming(activeGuitarChord, noteSender, {
    rootNoteCount: 2,
    velocity: 0.7,
  }),
  69: CombinedStrumming(activeGuitarChord, noteSender, {
    rootNoteCount: 1,
    velocity: 0.7,
  }),
  70: PickedStrumming(activeGuitarChord, noteSender, {
    resetOnChordChange: true,
    keepOverlapping: true,
  }),
  71: PowerChordStrumming(activeGuitarChord, noteSender),
};

let currentStrumming = STRUMMINGS[67];

/// Private functions ----------------------------------------------------------

const midiPanic = () => {
  notesOut.value?.sendAllNotesOff();
  notesOut.value?.sendAllSoundOff();
};

const maybeApplyChordChange = () => {
  const maxNote =
    notesDown.size != 0 ? Math.max(...notesDown) : OPEN_CHORD_NOTE;
  if (maxNote === activeNote) {
    return;
  }
  activeNote = maxNote;
  batch(() => {
    setChordNumber(player, CHORDS[maxNote]);
    spicy.value = CLOSER_CHORD_NOTES.has(activeNote);
  });
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
    case note.number === DOWN_NOTE:
      currentStrumming.handleDown();
      lastStrumDirection = "DOWN";
      lastStrumAt = performance.now();
      return;
    case note.number === UP_NOTE:
      currentStrumming.handleUp();
      lastStrumDirection = "UP";
      lastStrumAt = performance.now();
      return;
    case note.number in CHORDS:
      notesDown.add(note.number);
      maybeApplyChordChange();
      return;
    case note.number in STRUMMINGS:
      currentStrumming = STRUMMINGS[note.number];
      return;
    case note.number === TOGGLE_LEADER_NOTE:
      toggleLeadership(player);
      return;
    case note.number === SET_FREE_PLAY_NOTE:
      setFreePlay(player);
      return;
    case CROSS_NOTES.has(note.number):
      notesOut.value?.sendControlChange(
        note.number - FIRST_CROSS_NOTE + CROSS_CC_START,
        (crossValues[note.number] =
          (crossValues[note.number] + 1) % CROSS_VALUE_COUNT),
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
  activeGuitarChord.value = {
    chord: getChordByNumber(player.value.chordNumber),
    spicy: spicy.value,
  };
});

effect(() => {
  currentStrumming.handleChordChange(previousChord);
  previousChord = activeGuitarChord.value;
  if (performance.now() - lastStrumAt < 50) {
    if (lastStrumDirection === "UP") {
      currentStrumming.handleUp();
    } else {
      currentStrumming.handleDown();
    }
  }
});

effect(() => {
  const input = guitarIn.value;
  if (input) {
    input.addListener("noteoff", onNoteOff);
    input.addListener("noteon", onNoteOn);
    input.addListener("controlchange-controller1", onWhammy);
  }

  return () => {
    if (input) {
      input.removeListener("noteoff", onNoteOff);
      input.removeListener("noteon", onNoteOn);
      input.removeListener("controlchange-controller1");
    }
  };
});

registerInput("guitar", guitarIn);
registerOutput("guitar", notesOut);

/// Exports --------------------------------------------------------------------

export const inputs = {
  "Guitar Hero controller": guitarIn,
};
export const outputs = {
  "Guitar track": notesOut,
};

export const guitar: Instrument = {
  label: LABEL,
  inputs,
  midiPanic,
  outputs,
};
