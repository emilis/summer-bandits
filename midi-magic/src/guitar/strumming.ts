import { Signal } from "@preact/signals";
import { Chord } from "../harmony/scales";
import {
  getChordNotes as getGuitarChordNotes,
  getPowerChordNotes,
} from "./chords";
import { activeChord } from "../conductor/state";

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

type KeepOverlappingOpts = {
  keepOverlapping?: boolean;
};

const keepOverlappingDefaults: Required<KeepOverlappingOpts> = {
  keepOverlapping: false,
};

const handleOverlappingChordChange = (
  noteSender: NoteSender,
  previous: Chord,
  chordFn: (chord: Chord) => number[],
  options: Required<KeepOverlappingOpts>,
) => {
  if (options.keepOverlapping) {
    const prevNotes = new Set(chordFn(previous));
    const currNotes = new Set(chordFn(activeChord.value));
    const intersection = new Set<number>();
    prevNotes.forEach((note) => {
      if (currNotes.has(note)) intersection.add(note);
    });
    noteSender.muteAll(intersection);
  } else {
    noteSender.muteAll();
  }
};

const calcStrumDelay = (
  rand: number,
  options: Required<StrumOpts>,
  index: number,
): number => index * (options.strumSpeed - options.strumSpeedRand * rand);

export type NoteSender = {
  playNote(note: { pitch: number; velocity: number; delay?: number }): void;
  muteAll(except?: Set<number>): void;
};

export type Strumming = {
  handleDown(): void;
  handleUp(): void;
  handleChordChange(previous: Chord): void;
};

export const FullStrumming = (
  activeChord: Signal<Chord>,
  noteSender: NoteSender,
  options: { velocityDecay?: number } & StrumOpts &
    VelocityOpts &
    KeepOverlappingOpts = {},
): Strumming => {
  const opts = {
    ...velocityDefaults,
    ...strumDefaults,
    ...keepOverlappingDefaults,
    velocityDecay: 0.05,
    ...options,
  };
  const strum = (notes: number[]) => {
    noteSender.muteAll();
    const varietyNumber = Math.random();
    const baseVelocity = calcVelocity(varietyNumber, opts);
    notes.forEach((chordNote, index) => {
      noteSender.playNote({
        pitch: chordNote,
        velocity: baseVelocity - opts.velocityDecay * index,
        delay: calcStrumDelay(varietyNumber, opts, index),
      });
    });
  };

  return {
    handleDown: () => {
      strum(getGuitarChordNotes(activeChord.value));
    },
    handleUp: () => {
      strum([...getGuitarChordNotes(activeChord.value)].reverse());
    },
    handleChordChange: (previous: Chord) =>
      handleOverlappingChordChange(
        noteSender,
        previous,
        getGuitarChordNotes,
        opts,
      ),
  };
};

export const PickedStrumming = (
  activeChord: Signal<Chord>,
  noteSender: NoteSender,
  options: {
    resetOnChordChange?: boolean;
  } & KeepOverlappingOpts = {},
): Strumming => {
  let opts = {
    ...velocityDefaults,
    ...keepOverlappingDefaults,
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
    noteSender.playNote({
      pitch: note,
      velocity: calcVelocity(varietyNumber, opts),
    });
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
    handleChordChange: (previous: Chord) =>
      handleOverlappingChordChange(
        noteSender,
        previous,
        getGuitarChordNotes,
        opts,
      ),
  };
};

export const CombinedStrumming = (
  activeChord: Signal<Chord>,
  noteSender: NoteSender,
  options: {
    rootNoteCount?: number;
    strummedNoteCount?: number;
    resetOnChordChange?: boolean;
  } & VelocityOpts &
    KeepOverlappingOpts = {},
): Strumming => {
  const opts = {
    ...velocityDefaults,
    ...strumDefaults,
    ...keepOverlappingDefaults,
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
    noteSender.playNote({
      pitch: note,
      velocity: calcVelocity(varietyNumber, opts),
    });
  };

  const strum = (notes: number[]) => {
    const varietyNumber = Math.random();
    const baseVelocity = calcVelocity(varietyNumber, opts);
    notes.forEach((chordNote, index) => {
      noteSender.playNote({
        pitch: chordNote,
        velocity: baseVelocity - 0.05 * index,
      });
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
        [...getGuitarChordNotes(activeChord.value)].slice(-opts.strummedCount),
      );
    },
    handleChordChange: (previous: Chord) =>
      handleOverlappingChordChange(
        noteSender,
        previous,
        getGuitarChordNotes,
        opts,
      ),
  };
};

export const PowerChordStrumming = (
  activeChord: Signal<Chord>,
  noteSender: NoteSender,
  options: { noteCount?: 1 | 2 | 3 } & VelocityOpts & StrumOpts = {},
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
    noteSender.muteAll();
    const varietyNumber = Math.random();
    const baseVelocity = calcVelocity(varietyNumber, opts);
    notes.slice(0, opts.noteCount).forEach((chordNote, index) => {
      noteSender.playNote({
        pitch: chordNote,
        velocity: baseVelocity - 0.05 * index,
        delay: calcStrumDelay(varietyNumber, opts, index),
      });
    });
  };

  return {
    handleDown: () => {
      strum(getPowerChordNotes(activeChord.value));
    },
    handleUp: () => {
      strum([...getPowerChordNotes(activeChord.value)].reverse());
    },
    handleChordChange: () => {
      noteSender.muteAll();
    },
  };
};
