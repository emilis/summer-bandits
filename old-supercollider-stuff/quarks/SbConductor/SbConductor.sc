SbConductor {

  classvar chords;

  var activeChord, rootNote;

  *initClass {

    chords = (
      I:    [ 0, 4, 7 ],
      ii:   [ 2, 5, 9 ],
      iii:  [ 4, 7, 11 ],
      IV:   [ 5, 9, 0 ],
      V:    [ 7, 11, 2 ],
      vi:   [ 9, 0, 4 ],
      vii:  [ 11, 2, 5 ],
    );
  }

  *new {
    ^super.new.init;
  }

  init {

    activeChord = chords['I'];
    rootNote = 0;
  }

  getChord {
    ^activeChord;
  }

  setChord {| chord |
    if( chords.includesKey( chord )){
      activeChord = chords[chord].collect({| chordNote |
        ( chordNote + rootNote ) % 12;
      });
    }{
      "Invalid chord".postln;
    };
    ^activeChord;
  }
}
