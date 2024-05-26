import { Note, OutputChannel } from "webmidi";
import { Signal } from "@preact/signals";
import { Chord } from "../harmony/scales";
import {
  getChordNotes as getGuitarChordNotes,
  getPowerChordNotes,
} from "./chords";

type VelocityOpts = {
  velocity?: number;
  velocityRand?: number;
};

const velocityDefaults: Required<VelocityOpts> = {
  velocity: 0.9,
  velocityRand: 0.3,
};

const calcVelocity = (rand: number, options: Required<VelocityOpts>) =>
  options.velocity - options.velocityRand * rand;

type StrumOpts = {
  strumSpeed?: number;
  strumSpeedRand?: number;
};

const strumDefaults: Required<StrumOpts> = {
  strumSpeed: 20,
  strumSpeedRand: 10,
};

const calcStrumDelay = (
  rand: number,
  options: Required<StrumOpts>,
  index: number
) => `+${index * (options.strumSpeed - options.strumSpeedRand * rand)}`;

export type Strumming = {
  handleDown(): void;
  handleUp(): void;
};


export const FullStrumming = (
  activeChord: Signal<Chord>,
  notesOut: Signal<OutputChannel | null>,
  options: { velocityDecay?: number } & StrumOpts & VelocityOpts = {}
): Strumming => {
  const opts = {
    ...velocityDefaults,
    ...strumDefaults,
    velocityDecay: 0.05,
    ...options,
  };
  const strum = (notes: number[]) => {
    notesOut.value?.sendAllNotesOff();
    const varietyNumber = Math.random();
    const baseVelocity = calcVelocity(varietyNumber, opts);
    notes.forEach((chordNote, index) => {
      notesOut.value?.sendNoteOn(
        new Note(chordNote, {
          attack: baseVelocity - opts.velocityDecay * index,
        }),
        { time: calcStrumDelay(varietyNumber, opts, index) }
      );
    });
  };

  return {
    handleDown: () => {
      strum(getGuitarChordNotes(activeChord.value));
    },
    handleUp: () => {
      strum([...getGuitarChordNotes(activeChord.value)].reverse());
    },
  };
};

export const PickedStrumming = (
  activeChord: Signal<Chord>,
  notesOut: Signal<OutputChannel | null>,
  options: {
    resetOnChordChange?: boolean;
  } = {}
): Strumming => {
  let opts = {
    ...velocityDefaults,
    resetOnChordChange: true,
    ...options,
  };
  let current = 0;

  if (opts.resetOnChordChange) {
    activeChord.subscribe(() => {
      current = 0;
    });
  }

  const playNote = (note: number) => {
    const varietyNumber = Math.random();
    notesOut.value?.sendNoteOn(
      new Note(note, { attack: calcVelocity(varietyNumber, opts) })
    );
  };

  return {
    handleDown: () => {
      const notes = getGuitarChordNotes(activeChord.value);
      playNote(notes[current]);
      current++;
      current %= notes.length;
    },
    handleUp: () => {
      const notes = getGuitarChordNotes(activeChord.value);
      playNote(notes[current]);
      current--;
      if (current < 0) current = notes.length - 1;
    },
  };
};

export const CombinedStrumming = (
  activeChord: Signal<Chord>,
  notesOut: Signal<OutputChannel | null>,
  options: {
    rootNoteCount?: number;
    strummedNoteCount?: number;
    resetOnChordChange?: boolean;
  } & VelocityOpts = {}
): Strumming => {
  const opts = {
    ...velocityDefaults,
    ...strumDefaults,
    rootNoteCount: 1,
    strummedCount: 3,
    resetOnChordChange: true,
    ...options,
  };

  let current = 0;

  if (opts.resetOnChordChange) {
    activeChord.subscribe(() => {
      current = 0;
    });
  }

  const playNote = (note: number) => {
    const varietyNumber = Math.random();
    notesOut.value?.sendNoteOn(
      new Note(note, { attack: calcVelocity(varietyNumber, opts) })
    );
  };

  const strum = (notes: number[]) => {
    const varietyNumber = Math.random();
    const baseVelocity = calcVelocity(varietyNumber, opts);
    notes.forEach((chordNote, index) => {
      notesOut.value?.sendNoteOn(
        new Note(chordNote, { attack: baseVelocity - 0.05 * index })
      );
    });
  };

  return {
    handleDown: () => {
      const notes = getGuitarChordNotes(activeChord.value);
      playNote(notes[current]);
      current++;
      current %= opts.rootNoteCount;
    },
    handleUp: () => {
      strum(
        [...getGuitarChordNotes(activeChord.value)].slice(-opts.strummedCount)
      );
    },
  };
};

export const PowerChordStrumming = (
  activeChord: Signal<Chord>,
  notesOut: Signal<OutputChannel | null>,
  options: { noteCount?: 1 | 2 | 3 } & VelocityOpts & StrumOpts = {}
): Strumming => {
  const opts = {
    velocity: 0.9,
    velocityRand: 0.1,
    strumSpeed: 15,
    strumSpeedRand: 10,
    noteCount: 3,
    ...options,
  };
  const strum = (notes: number[]) => {
    notesOut.value?.sendAllNotesOff();
    const varietyNumber = Math.random();
    const baseVelocity = calcVelocity(varietyNumber, opts);
    notes.slice(0, opts.noteCount).forEach((chordNote, index) => {
      notesOut.value?.sendNoteOn(
        new Note(chordNote, { attack: baseVelocity - 0.05 * index }),
        { time: calcStrumDelay(varietyNumber, opts, index) }
      );
    });
  };

  return {
    handleDown: () => {
      strum(getPowerChordNotes(activeChord.value));
    },
    handleUp: () => {
      strum([...getPowerChordNotes(activeChord.value)].reverse());
    },
  };
};
