SbGuitar : SbGuitarController {

  var conductor, midiIn, outBus;
  var noteIndex = 0;

  *new {| conductor, midiIn, outBus |

    SbGuitarMutedString.init;

    ^super.newCopyArgs( conductor, midiIn, outBus ).init;
  }

  init {

    midiIn.onNoteOn({| key, velocity |
      this.onNoteOn( key, velocity )
    });
  }

  onNoteOn {| key, velocity |
    ("onNoteOn " + key + " " + velocity).postln;
    case
      { this.isChordKey( key )}{
        "SbGuitar.onNoteOn isChordKey".postln;
        conductor.setChord( this.getChord( key ));
        noteIndex = 0;
      }
      { this.isNoteKey( key )}{
        var note;
        "SbGuitar.onNoteOn isNoteKey".postln;
        note = conductor.getChord.().wrapAt( noteIndex )
          + if( this.isUpNote( key ), { 60 }, { 48 });
        noteIndex = noteIndex + 1;
        Synth.new(
          SbGuitarMutedString.name,
          [ frequency: note.midicps ],
        );
      }
    ;
  }
}
