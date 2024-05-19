import { signal }           from '@preact/signals';

import {
  type Chord,
  type ChordNumber,
  type NoteNumber,
  type Scale,
  createScale,
}                           from '../harmony/scales';

/// Types ----------------------------------------------------------------------

export type MIDINumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110 | 111 | 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 | 120 | 121 | 122 | 123 | 124 | 125 | 126 | 127;

export type Energy =        0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Tension =       0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/// Const values ---------------------------------------------------------------

const MIDI_COUNT =          128;

/// State ----------------------------------------------------------------------

export const activeScale =  signal<Scale>( createScale( 'major', 0 ));
export const activeChord =  signal<Chord>( activeScale.value.chords.i );
export const energy =       signal<Energy>( 3 );
export const tension =      signal<Tension>( 2 );

/// Private functions ----------------------------------------------------------

const getActiveChordNotes = ( tensionDelta: number ) =>

  activeChord.value.slice(
    0,
    1 + Math.max( 0, tension.value + tensionDelta ),
  );

const isMidiNum = ( num: number ): num is MIDINumber =>

  num >= 0 && num < MIDI_COUNT;

const midiToNote = ( midiNum: MIDINumber ): NoteNumber =>

  midiNum % 12 as NoteNumber;

/// Exported functions ---------------------------------------------------------

export const getClosestNote = (
  note: MIDINumber,
  tensionDelta: number =    0
): MIDINumber => {

  const chordNotes = new Set( getActiveChordNotes( tensionDelta ));

  if( activeChord.value.length < 1 ){
    return note;
  }

  for( let i = 1; i < 7; i++ ){
    const noteDown =        note - i;
    const noteUp =          note + i;

    if( isMidiNum( noteUp ) && chordNotes.has( midiToNote( noteUp  ))){
      return noteUp;
    } else if( isMidiNum( noteDown ) && chordNotes.has( midiToNote( noteDown ))){
      return noteDown;
    }
  }

  return note;
};
export function getClosestNoteDown(
  note: MIDINumber,
  tensionDelta: number =    0,
): MIDINumber {

  const chordNotes = new Set( getActiveChordNotes( tensionDelta ));

  for( let i = 1; i < 12; i++ ){
    const noteDown =        note - i;
    if( ! isMidiNum( noteDown )){
      return getClosestNoteUp( note );
    } else if( chordNotes.has( midiToNote( noteDown ))){
      return noteDown;
    }
  }

  return note;
};
export function getClosestNoteUp(
  note: MIDINumber,
  tensionDelta: number =    0,
): MIDINumber {

  const chordNotes = new Set( getActiveChordNotes( tensionDelta ));

  for( let i = 1; i < 12; i++ ){
    const noteUp =          note + i;
    if( ! isMidiNum( noteUp )){
      return getClosestNoteUp( note );
    } else if( chordNotes.has( midiToNote( noteUp ))){
      return noteUp;
    }
  }

  return note;
}

export const setActiveChord = ( chord: ChordNumber ) => {

  activeChord.value =       activeScale.value.chords[chord];
};
