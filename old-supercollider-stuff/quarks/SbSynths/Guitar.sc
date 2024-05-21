SbSynthsGuitar {
  classvar <name = "SbSynthsGuitar";

  *init {
    var buffer;
    var samplePath;

    name.postln;
    this.postln;
    filenameSymbol.postln;
    filenameSymbol.asString.postln;
    filenameSymbol.asString.dirname.postln;

    samplePath = filenameSymbol.asString.dirname +/+ "../../samples/guitar/16401__pitx__muted_guitar_c.wav";
    samplePath.postln;

    buffer = Buffer.read( Server.default, samplePath );
    buffer.postln;

    SynthDef.removeAt( name );

    SynthDef( name, { arg
      frequency = 440,
      out = 0;

      var rate = BufRateScale.kr( buffer ) * frequency / 261.6256;
      var sig = PlayBuf.ar(
        2,
        buffer,
        rate,
        doneAction: Done.freeSelf,
      );
      sig.postln;
      Out.ar( out, sig );
    }).add;
    //*/
  }
}
