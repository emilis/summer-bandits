import { Signal } from "@preact/signals";
import { Chord } from "../harmony/scales";
import { getChordNotes as getGuitarChordNotes } from "./chords";

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

export type NoteSender = {
  playNote(note: {
    pitch: number;
    velocity: number;
    delay?: number;
    exclusive?: boolean;
  }): void;
  muteAll(): void;
};

export type Strumming = {
  handleDown(): void;
  handleUp(): void;
};

export const PickedStrumming = (
  activeChord: Signal<Chord>,
  noteSender: NoteSender,
  options: {
    resetOnChordChange?: boolean;
    notes?: number[];
  } = {},
): Strumming => {
  let opts = {
    ...velocityDefaults,
    resetOnChordChange: true,
    notes: [0, 1, 2, 3],
    ...options,
  };
  let current = 0;

  const getFilteredNotes = () => {
    const all = getGuitarChordNotes(activeChord.value);
    return opts.notes.map((index) => all[index]);
  };

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
      exclusive: true,
    });
  };

  return {
    handleDown: () => {
      const notes = getFilteredNotes();
      playNote(notes[current]);
      current++;
      current %= notes.length;
    },
    handleUp: () => {
      const notes = getFilteredNotes();
      playNote(notes[current]);
      current--;
      if (current < 0) current = notes.length - 1;
    },
  };
};
