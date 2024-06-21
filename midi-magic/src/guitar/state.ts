import { type InputChannel, Note, type OutputChannel } from "webmidi";
import { Signal, batch, effect, signal } from "@preact/signals";

import { type ChordNumber } from "../harmony/scales";
import { type Instrument } from "../instruments/types";
import {
  activeChord as globalActiveChord,
  activeScale,
  activeChordNumber,
} from "../conductor/state";
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

/// Types ----------------------------------------------------------------------

type Options = {
  localChords: boolean;
};

/// Constant values ------------------------------------------------------------

const OPEN_CHORD_NOTE = 47;

const SPICY_THRESHOLD = 52;

// This mapping is not final, but here just for testing the playback of all chords
const CHORDS: Record<number, ChordNumber> = {
  [OPEN_CHORD_NOTE]: "i",
  48: "ii",
  49: "iii",
  50: "iv",
  51: "v",
  52: "vi",
  53: "ii",
  54: "iii",
  55: "iv",
  56: "v",
  57: "vi",
};

/// State ----------------------------------------------------------------------

const guitarIn = signal<InputChannel | null>(null);
const notesOut = signal<OutputChannel | null>(null);
const options = signal<Options>({
  localChords: false,
});

const localGuitarChord = signal<GuitarChord>({
  chord: globalActiveChord.peek(),
  spicy: false,
});

let activeNote = OPEN_CHORD_NOTE;
const notesDown = new Set<number>();

let previousChord = localGuitarChord.peek();

let lastStrumAt = performance.now();
let lastStrumDirection: "UP" | "DOWN" = "DOWN";

let mode: Signal<"LEAD" | "FOLLOW" | "INDEPENDENT"> = signal("LEAD");

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
      (playing) => playing.pitch == pitch,
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
  67: FullStrumming(localGuitarChord, noteSender),
  68: CombinedStrumming(localGuitarChord, noteSender, {
    rootNoteCount: 2,
    velocity: 0.7,
  }),
  69: CombinedStrumming(localGuitarChord, noteSender, {
    rootNoteCount: 1,
    velocity: 0.7,
  }),
  70: PickedStrumming(localGuitarChord, noteSender, {
    resetOnChordChange: true,
    keepOverlapping: true,
  }),
  71: PowerChordStrumming(localGuitarChord, noteSender),
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
  batch(() => {
    localGuitarChord.value = {
      chord: activeScale.value.chords[CHORDS[maxNote]],
      spicy: activeNote > SPICY_THRESHOLD,
    };
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
      if (mode.peek() == "LEAD") {
        activeChordNumber.value = localGuitarChord.value.chord.number;
      }
      currentStrumming.handleDown();
      lastStrumDirection = "DOWN";
      lastStrumAt = performance.now();
      return;
    case isUpNote(note):
      if (mode.peek() == "LEAD") {
        activeChordNumber.value = localGuitarChord.value.chord.number;
      }
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
  const currentActiveChord = globalActiveChord.value;
  if (mode.value == "FOLLOW") {
    localGuitarChord.value = {
      ...localGuitarChord.peek(),

      chord: currentActiveChord,
    };
    if (performance.now() - lastStrumAt < 50) {
      if (lastStrumDirection == "UP") {
        currentStrumming.handleUp();
      } else {
        currentStrumming.handleDown();
      }
    }
  }
});

effect(() => {
  currentStrumming.handleChordChange(previousChord);
  previousChord = localGuitarChord.value;
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
