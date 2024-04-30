/*
  SuperCollider IDE:

    Recompile classes in quarks/: Ctrl+Shift+L
    Evaluate a region:            Ctrl+Enter
    Evaluate a line:              Shift+Enter
    Stop sounds:                  Ctrl+.

  Vim:

    Run at start:                 :SClangStart
    Recompile classes in quarks/: :SClangRecompile
    Evaluate a region:            F5
    Evaluate a line:              F6
    Stop sounds:                  F12
    See:    https://github.com/supercollider/scvim
*/
/// Install --------------------------------------------------------------------
( // Evaluate this region when first running SC:
  ~quarksDir = File.getcwd +/+ "quarks";
  Quarks.install( ~quarksDir +/+ "SbMidi" );
  Quarks.install( ~quarksDir +/+ "SbSynths" );
)
/// (Re)Boot -------------------------------------------------------------------
(
  /// Recompile classes if needed
  Server.default.quit;
  Server.default.options.device = "SuperColliderServer";
  Server.default.boot;
  SbSynthsSine.init;
  SbSynthsGuitar.init;
  MIDIClient.init( 0, 0, false );
  MIDIIn.connectAll;
)

/// Debug ----------------------------------------------------------------------

/// GUI audio monitor:
Server.default.scope( 4 );

/// Check if our quarks loaded:
SbMidiInput.postln;

/// Sound check:
~soundCheck = Synth.new( SbSynthsSine.name, [ frequency: 440 ]);
~soundCheck.free;

/// Main -----------------------------------------------------------------------

/// An example midi to synth setup.
/// Replace the strings for your MIDI controller:
(
  SbMidiPlayNotes(
    SbMidiInput( "MODX", "MODX MIDI 1" ),
    /// SbSynthsSine.name,
    SbSynthsGuitar.name,
  );
)
