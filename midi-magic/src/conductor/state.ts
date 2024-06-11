import { computed, signal } from "@preact/signals";

import {
  type Chord,
  type ChordNumber,
  type NoteNumber,
  type Scale,
  createScale,
  ScaleType,
} from "../harmony/scales";
import { registerValue } from "../storage";

/// Types ----------------------------------------------------------------------

export type Energy = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Tension = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/// Const values ---------------------------------------------------------------

const MIDI_COUNT = 128;

/// State ----------------------------------------------------------------------

export const activeScale = signal<Scale>(createScale("major", 0));
export const activeChordNumber = signal<ChordNumber>("i");
export const energy = signal<Energy>(3);
export const tension = signal<Tension>(2);

export const activeChord = computed<Chord>(
  () => activeScale.value.chords[activeChordNumber.value],
);

/// Private functions ----------------------------------------------------------

const getActiveChordNotes = (tensionDelta: number) =>
  activeChord.value.notes.slice(
    0,
    1 + Math.max(0, tension.value + tensionDelta),
  );

const isMidiNum = (num: number) => num >= 0 && num < MIDI_COUNT;

const midiToNote = (midiNum: number): NoteNumber =>
  (midiNum % 12) as NoteNumber;

/// Exported functions ---------------------------------------------------------

export const getClosestNote = (
  note: number,
  tensionDelta: number = 0,
): number => {
  const chordNotes = new Set(getActiveChordNotes(tensionDelta));

  if (activeChord.value.notes.length < 1) {
    return note;
  }

  for (let i = 0; i < 7; i++) {
    const noteDown = note - i;
    const noteUp = note + i;

    if (chordNotes.has(midiToNote(noteUp))) {
      return noteUp;
    } else if (chordNotes.has(midiToNote(noteDown))) {
      return noteDown;
    }
  }

  return note;
};
export function getClosestNoteDown(
  note: number,
  tensionDelta: number = 0,
): number {
  const chordNotes = new Set(getActiveChordNotes(tensionDelta));

  for (let i = 1; i < 12; i++) {
    const noteDown = note - i;
    if (!isMidiNum(noteDown)) {
      return getClosestNoteUp(note);
    } else if (chordNotes.has(midiToNote(noteDown))) {
      return noteDown;
    }
  }

  return note;
}
export function getClosestNoteUp(
  note: number,
  tensionDelta: number = 0,
): number {
  const chordNotes = new Set(getActiveChordNotes(tensionDelta));

  for (let i = 1; i < 12; i++) {
    const noteUp = note + i;
    if (!isMidiNum(noteUp)) {
      return getClosestNoteUp(note);
    } else if (chordNotes.has(midiToNote(noteUp))) {
      return noteUp;
    }
  }

  return note;
}

export const setActiveChord = (chord: ChordNumber) => {
  activeChordNumber.value = chord;
};

/// Effects --------------------------------------------------------------------

registerValue(
  activeScale,
  "scale",
  (t) => `${t.root} ${t.type}`,
  (s) => {
    const [rootStr, type] = s.split(" ");
    return createScale(type as ScaleType, parseInt(rootStr) as NoteNumber);
  },
);
