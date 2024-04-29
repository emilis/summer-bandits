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
)
(
  SbSynthsSine.init;
  SbSynthsGuitar.init;
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

/// Sound check:
~soundCheck = Synth.new( SbSynthsSine.name, [ frequency: 440 ]);
~soundCheck.free;

/// Main -----------------------------------------------------------------------

/// An example midi to synth setup:
(
  SbMidiPlayNotes(
    SbMidiInput( "MODX", "MODX MIDI 1" ),
    /// SbSynthsSine.name,
    SbSynthsGuitar.name,
  );
)
