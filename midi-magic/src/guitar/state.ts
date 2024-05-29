import { type InputChannel, Note, type OutputChannel } from "webmidi";
import { Signal, effect, signal } from "@preact/signals";

import { type ChordNumber } from "../harmony/scales";
import { type Instrument } from "../instruments/types";
import { activeChord, setActiveChord } from "../conductor/state";
import {
  CombinedStrumming,
  FullStrumming,
  NoteSender,
  PickedStrumming,
  PowerChordStrumming,
  Strumming,
} from "./strumming";
import { midiInputs, midiOutputs } from "../webmidi/state";
import { registerInput, registerOutput } from "../storage";

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
  53: "vii", // This one is not accessible with the guitar controller
};

/// State ----------------------------------------------------------------------

const guitarIn = signal<InputChannel | null>(null);
const notesOut = signal<OutputChannel | null>(null);
const options = signal<Options>({
  localChords: false,
});

let activeNote = OPEN_CHORD_NOTE;
const notesDown = new Set<number>();

type PlayingNote = {
  pitch: number;
  scheduledAt?: number;
};

const playingNotes: PlayingNote[] = [];

const noteSender: NoteSender = {
  playNote: (note) => {
    const { pitch, velocity, delay } = note;
    const now = performance.now();
    const scheduledAt = delay ? now + delay : undefined;
    const existingIndex = playingNotes.findIndex(
      (playing) => playing.pitch == pitch
    );
    // TODO: this doesn't mute notes before retriggering them.
    // Not sure if it's a problem though.
    if (existingIndex == -1) {
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
  muteAll: () => {
    playingNotes.forEach((note) => {
      const { pitch, scheduledAt } = note;
      if (scheduledAt) {
        notesOut.value?.sendNoteOff(pitch, { time: scheduledAt + 0.1 });
      } else {
        notesOut.value?.sendNoteOff(pitch);
      }
    });
    playingNotes.length = 0;
  },
};

const STRUMMINGS: Record<number, Strumming> = {
  67: FullStrumming(activeChord, noteSender),
  68: CombinedStrumming(activeChord, noteSender, {
    rootNoteCount: 2,
    velocity: 0.8,
  }),
  69: CombinedStrumming(activeChord, noteSender, {
    rootNoteCount: 1,
    velocity: 0.8,
  }),
  70: PickedStrumming(activeChord, noteSender, { resetOnChordChange: true }),
  71: PowerChordStrumming(activeChord, noteSender),
};

let currentStrumming = STRUMMINGS[67];

/// Private functions ----------------------------------------------------------

const isDownNote = (note: Note) => note.number === 59;

const isUpNote = (note: Note) => note.number === 58;

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
  noteSender.muteAll();
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
    if (input) {
      input.removeListener("noteoff", onNoteOff);
      input.removeListener("noteon", onNoteOn);
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
