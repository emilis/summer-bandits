import {
  type InputChannel,
  type Note,
  type OutputChannel,
}                           from 'webmidi';
import {
  computed,
  effect,
  signal,
}                           from '@preact/signals';

import { type ChordNumber } from '../harmony/scales';
import { type Instrument }  from '../instruments/types';
import {
  type MIDINumber,
  energy,
  getClosestNoteDown,
  getClosestNoteUp,
  setActiveChord,
}                           from '../conductor/state';

/// Types ----------------------------------------------------------------------

type Options = {
  localChords:              boolean;
};

/// Constant values ------------------------------------------------------------

const CHORDS: Record< number, ChordNumber > = {
  48:                       'iv',
  49:                       'vi',
  50:                       'i',
  51:                       'ii',
  52:                       'v',
  53:                       'iv',
  54:                       'vi',
  55:                       'i',
  56:                       'ii',
  57:                       'v',
};
const HIGH_CHORDS_FROM =    53;
const VELOCITIES: MIDINumber[] = [
  16,
  32,
  48,
  64,
  80,
  96,
  112,
  127,
];

/// State ----------------------------------------------------------------------

const guitarIn =            signal< InputChannel | null >( null );
const isTensionUp =         signal< boolean >( false );
const notesOut =            signal< OutputChannel | null >( null );
const options =             signal< Options >({
  localChords:              false,
});
const velocity = computed(() =>
  VELOCITIES[energy.value + ( isTensionUp.value ? 2 : 0 )]
);

let lastNote: MIDINumber =  60;

/// Private functions ----------------------------------------------------------

const isDownNote = ( note: Note ) =>

  note.number === 58;

const isUpNote = ( note: Note ) =>

  note.number === 59;

const midiPanic = () => {

  notesOut.value?.sendAllNotesOff();
  notesOut.value?.sendAllSoundOff();
};

const onNoteOff = (
  { note }: { note: Note },
) => {
  console.debug( 'guitar onNoteOff', note );
  switch( true ){

  case isDownNote( note ):
  case isUpNote( note ): {

    if( ! notesOut.value ){
      return;
    }
    notesOut.value.sendNoteOff( lastNote, {
      rawRelease:           velocity.value,
    });
    return;
  }
  }
};


const onNoteOn = (
  { note }: { note: Note },
) => {
  console.debug( 'guitar onNoteOn', note );
  switch( true ){

  case isDownNote( note ): {

    if( ! notesOut.value ){
      return;
    }
    lastNote =              getClosestNoteDown( lastNote, isTensionUp.value ? 2 : 0 );
    notesOut.value?.sendNoteOn( lastNote, { rawAttack: velocity.value });
    return;
  }
  case isUpNote( note ): {

    if( ! notesOut.value ){
      return;
    }
    lastNote =              getClosestNoteUp( lastNote, isTensionUp.value ? 2 : 0 );
    notesOut.value?.sendNoteOn( lastNote, { rawAttack: velocity.value });
    return;
  }
  case ( note.number in CHORDS ): {

    setActiveChord( CHORDS[ note.number ]);
    isTensionUp.value =     note.number >= HIGH_CHORDS_FROM;

    return;
  }
  }
}

/// Effects --------------------------------------------------------------------

effect(() => {
  const input = guitarIn.value?.input;

  if( input ){
    input.addListener( 'noteoff', onNoteOff );
    input.addListener( 'noteon', onNoteOn );
  }

  return () => {
    const input =           guitarIn.value?.input;
    if( input ){
      input.removeListener( 'noteoff', onNoteOff );
      input.removeListener( 'noteon', onNoteOn );
    }
  };
});

/// Exports --------------------------------------------------------------------

export const inputs = {
  'Guitar Hero controller': guitarIn,
};
export const outputs = {
  'Guitar track':           notesOut,
};

export const setOptions = ( newOptions: Options ) => {
  options.value = {
    ...options.value,
    ...newOptions,
  };
};

export const guitar: Instrument = {
  label:                    'Guitar',
  inputs,
  midiPanic,
  outputs,
  setOptions,
};
