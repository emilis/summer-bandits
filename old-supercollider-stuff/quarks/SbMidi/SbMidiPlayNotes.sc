SbMidiPlayNotes {

  var midiInput;
  var synthName;

  *new {| midiInput, synthName |
    ^super.new.init( midiInput, synthName );
  }

  init {| midiInput, synthName |

    var notes = Array.newClear( 128 );

    midiInput.onNoteOff({| key, velocity |
      notes[key].free;
    });

    midiInput.onNoteOn({| key, velocity |
      notes[key] = Synth.new(
        synthName,
        [ frequency: key.midicps ],
      );
    });
  }
}
