export const OPEN_CHORD_NOTE = 47;
export type CHORD_NOTE = 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57;
// This mapping is not final, but here just for testing the playback of all chords
export const CHORDS: Record<number, number> = {
  47: 0,
  48: 1,
  49: 2,
  50: 3,
  51: 4,
  52: 5,
  53: 6,
  54: 7,
  55: 8,
  56: 9,
  57: 10,
};
export const DOWN_NOTE = 58;
export const UP_NOTE = 59;
export type CROSS_NOTE = 60 | 61 | 62 | 63;
export const CROSS_NOTES = new Set<number>([60, 61, 62, 63]);
export const FIRST_CROSS_NOTE = 60;
export const TOGGLE_LEADER_NOTE = 65;
export const SET_FREE_PLAY_NOTE = 66;
export type STRUMMINGS_NOTE = 67 | 68 | 69 | 70 | 71;

export const WHAMMY_CC = 1;
