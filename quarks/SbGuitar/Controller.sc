SbGuitarController {

  getChord {| key |
    ^switch ( key,
      48, { 'vi' },
      49, { 'ii' },
      50, { 'V' },
      51, { 'I' },
      52, { 'IV' },
      53, { 'iii' },
      54, { 'vi' },
      55, { 'ii' },
      56, { 'V' },
      57, { 'I' },
    );
  }

  isChordKey {| key |
    ("isChordKey" + key).postln;
    ^(( key >= 48 ) && (key <= 57));
  }

  isDownNote {| key |
    ^( key == 58 );
  }
  isUpNote {| key |
    ^( key == 59 );
  }
  isNoteKey {| key |
    ^( this.isDownNote( key ) || this.isUpNote( key ));
  }

  isEffectKey {| key |
    ^(( key >= 60 ) && ( key <= 64 ));
  }

  isNextSynthKey {| key |
    ^( key == 66 );
  }
  isPreviousSynthKey {| key |
    ^( key == 65 );
  }

  isNextArpKey {| key |
    ^( key == 68 );
  }
  isPreviousArpKey {| key |
    ^( key == 67 );
  }

  isVoteKey {| key |
    ^( key == 69 );
  }

  isResetKey {| key |
    ^( key == 70 );
  }
}
