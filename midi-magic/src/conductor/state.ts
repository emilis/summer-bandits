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

/// Const values ---------------------------------------------------------------

const MIDI_COUNT = 128;

/// State ----------------------------------------------------------------------

export const activeScale = signal<Scale>(createScale("major", 0));
export const activeChordNumber = signal<ChordNumber>("i");

export const activeChord = computed<Chord>(
  () => activeScale.value.chords[activeChordNumber.value],
);

/// Private functions ----------------------------------------------------------

const isMidiNum = (num: number) => num >= 0 && num < MIDI_COUNT;

const midiToNote = (midiNum: number): NoteNumber =>
  (midiNum % 12) as NoteNumber;

/// Exported functions ---------------------------------------------------------

export const getChordByNumber = (chordNumber: ChordNumber): Chord =>
  activeScale.value.chords[chordNumber];

export const getClosestChordNote = (
  chordNumber: ChordNumber,
  note: number,
  level: number = 0,
): number => {
  if (level > 6) {
    return note;
  }
  const chord = activeScale.value.chords[chordNumber];
  const notes = new Set<number>(
    level === 0
      ? chord.notes
      : level < 5
        ? chord.levels[level - 1]
        : activeScale.value.notes,
  );

  for (let i = 0; i < 7; i++) {
    const noteDown = note - i;
    const noteUp = note + i;

    if (isMidiNum(noteUp) && notes.has(midiToNote(noteUp))) {
      return noteUp;
    } else if (isMidiNum(noteDown) && notes.has(midiToNote(noteDown))) {
      return noteDown;
    }
  }

  return note;
};

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
