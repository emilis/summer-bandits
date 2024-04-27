/*
    :SClangStart
    F5:     evaluate block
    F6:     evaluate line
    F12:    hard stop
    See:    https://github.com/supercollider/scvim
*/
/// Install --------------------------------------------------------------------
(
  Quarks.addFolder( File.getcwd +/+ "quarks" );
  Quarks.install( "SbMidi" );
  Quarks.install( "SbSynths" );
  /// do :SCLangRecompile
)
/// Initialize -----------------------------------------------------------------
(
  Server.default.quit;
  Server.default.options.device = "SuperColliderServer";
  Server.default.boot;
  SbSynthsSine.init;
)
(
  // Need to :SCLangRecompile after changes to quarks
  MIDIClient.init( 0, 0, false );
  MIDIIn.connectAll;
)

/// Debug ----------------------------------------------------------------------

/// GUI audio monitor:
Server.default.scope( 4 );

SbMidiInput.postln;

/// Main -----------------------------------------------------------------------

/// An example midi to synth setup:
(
  var modx = SbMidiInput( "MODX", "MODX MIDI 1" );
  var notes = Array.newClear( 128 );

  modx.onNoteOff({| key, velocity |
    [ 'onNoteOff', key, velocity ].postln;
    notes[key].free;
  });

  modx.onNoteOn({| key, velocity |
    [ 'onNoteOn', key, velocity ].postln;
    notes[key] = Synth.new(
      SbSynthsSine.name,
      [ frequency: key.midicps ],
    )
  });
)
