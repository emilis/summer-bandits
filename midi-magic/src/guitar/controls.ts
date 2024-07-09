import { type ChordNumber } from "../harmony/scales";

export const OPEN_CHORD_NOTE = 47;
export type CHORD_NOTE = 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57;
// This mapping is not final, but here just for testing the playback of all chords
export const CHORDS: Record<number, ChordNumber> = {
  47: "i",
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
export const FURTHER_CHORD_NOTES = new Set<number>([47, 48, 49, 50, 51, 52]);
export const CLOSER_CHORD_NOTES = new Set<number>([53, 54, 55, 56, 57]);
export const UP_NOTE = 58;
export const DOWN_NOTE = 59;
export type CROSS_NOTE = 60 | 61 | 62 | 63;
export const CROSS_NOTES = new Set<number>([60, 61, 62, 63]);
export const FIRST_CROSS_NOTE = 60;
export const TOGGLE_LEADER_NOTE = 65;
export const SET_FREE_PLAY_NOTE = 66;
export type STRUMMINGS_NOTE = 67 | 68 | 69 | 70 | 71;

export const WHAMMY_CC = 1;
