import { type InputChannel, Note, type OutputChannel } from "webmidi";
import { batch, effect, signal } from "@preact/signals";

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
import { registerInput, registerOutput } from "../storage";
import { GuitarChord } from "./chords";
import {
    OPEN_CHORD_NOTE,
    CHORDS,
    CLOSER_CHORD_NOTES,
    isUpNote,
    isDownNote,
} from './controls';

/// Types ----------------------------------------------------------------------

type Options = {
  localChords: boolean;
};

/// Constant values ------------------------------------------------------------
/// State ----------------------------------------------------------------------

const guitarIn = signal<InputChannel | null>(null);
const notesOut = signal<OutputChannel | null>(null);
const options = signal<Options>({
  localChords: false,
});

const spicy = signal<boolean>(false);

const activeGuitarChord = signal<GuitarChord>({
  chord: activeChord.peek(),
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
    setActiveChord(CHORDS[maxNote]);
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
    case isDownNote(note):
      currentStrumming.handleDown();
      lastStrumDirection = "DOWN";
      lastStrumAt = performance.now();
      return;
    case isUpNote(note):
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
  }
};

/// Effects --------------------------------------------------------------------

effect(() => {
  activeGuitarChord.value = {
    chord: activeChord.value,
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
