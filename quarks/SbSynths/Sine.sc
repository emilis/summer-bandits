SbSynthsSine {

  classvar <name = "SbSynthsSine";

  *init {

    SynthDef.removeAt( name );
    
    SynthDef( name, { arg
      frequency = 440,
      out = 0;

      Out.ar(out, [
        SinOsc.ar( frequency, 0, 0.2 ),
        SinOsc.ar( frequency * 1.005, 0, 0.2 ),
      ]);
    }).add;
  }
}
