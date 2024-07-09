import { type InputChannel, Note, type OutputChannel } from "webmidi";
import { computed, effect, signal } from "@preact/signals";

import { type Instrument } from "../instruments/types";
import { getChordByNumber } from "../conductor/state";
import { registerInput, registerOutput } from "../storage";
import {
  CHORDS,
  DOWN_NOTE,
  OPEN_CHORD_NOTE,
  SET_FREE_PLAY_NOTE,
  TOGGLE_LEADER_NOTE,
  UP_NOTE,
  isDownNote,
  isUpNote,
} from "../guitar/controls";
import { registerPlayer, setChordNumber, setFreePlay, toggleLeadership } from "../conductor/players";

import { NoteSender, PickedStrumming, Strumming } from "./strumming";

/// Constant values ------------------------------------------------------------

const LABEL = "Bass";

/// State ----------------------------------------------------------------------

const bassIn = signal<InputChannel | null>(null);
const notesOut = signal<OutputChannel | null>(null);
const player = registerPlayer(LABEL, "FREE_PLAY");

const activeChord = computed(() => getChordByNumber(player.value.chordNumber));

let activeNote = OPEN_CHORD_NOTE;
const notesDown = new Set<number>();

type PlayingNote = {
  pitch: number;
  scheduledAt?: number;
};

const playingNotes: PlayingNote[] = [];

const noteSender: NoteSender = {
  playNote: (note) => {
    const { pitch, velocity, delay, exclusive } = note;

    if (exclusive) {
      noteSender.muteAll();
    }
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
  67: PickedStrumming(activeChord, noteSender, { notes: [0] }),
  68: PickedStrumming(activeChord, noteSender, { notes: [0, 3] }),
  69: PickedStrumming(activeChord, noteSender),
  70: PickedStrumming(activeChord, noteSender, { notes: [0, 2, 3] }),
  71: PickedStrumming(activeChord, noteSender, {
    notes: [0, 2, 3],
    resetOnChordChange: true,
  }),
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
  if (maxNote == activeNote) {
    return;
  }
  activeNote = maxNote;
  noteSender.muteAll();
  setChordNumber(player, CHORDS[maxNote]);
};

const onNoteOff = ({ note }: { note: Note }) => {
  console.debug("bass onNoteOff", note);
  switch (true) {
    case note.number in CHORDS:
      notesDown.delete(note.number);
      maybeApplyChordChange();
      return;
  }
};

const onNoteOn = ({ note }: { note: Note }) => {
  console.debug("bass onNoteOn", note);
  switch (true) {
    case note.number === DOWN_NOTE:
      currentStrumming.handleDown();
      return;
    case note.number === UP_NOTE:
      currentStrumming.handleUp();
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
  }
};

/// Effects --------------------------------------------------------------------

effect(() => {
  const input = bassIn.value;
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

registerInput("bass", bassIn);
registerOutput("bass", notesOut);

/// Exports --------------------------------------------------------------------

export const inputs = {
  "Guitar Hero controller": bassIn,
};
export const outputs = {
  "Bass track": notesOut,
};

export const bass: Instrument = {
  label: LABEL,
  inputs,
  midiPanic,
  outputs,
};
