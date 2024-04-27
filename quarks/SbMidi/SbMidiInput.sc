SbMidiInput {

  var predicate = nil;

  *new { arg
    deviceName = nil,
    portName = nil,
    channelNum = 0,
    deviceNum = 0;

    ^super.new.init( deviceName, portName, channelNum, deviceNum );
  }

  init {| deviceName, portName, channelNum, deviceNum |
    /// [ 'SbMidiInput', deviceName, portName, channelNum, deviceNum ].postln;

    var device = MIDIIn.findPort( deviceName, portName );

    predicate = {| uid, channel |
      /*
      [ 'predicate', uid, channel, device.uid, channelNum,
        device == nil,
        uid == device.uid,
        channelNum == 0,
        channel == channelNum,
      ].postln;
      */
      (( device == nil ) || ( uid == device.uid ))
        && (( channelNum == 0 ) || ( channel == channelNum ));
    };
    /*
    [ 'device:', device ].postln;
    [ 'predicate:', predicate ].postln;
    [ 'predicate check:', predicate.( device.uid, channelNum )].postln;
    */
  }

  onNoteOff {| func |
    MIDIIn.addFuncTo( 'noteOff',
      {| uid, channel, key, velocity |
        /// [ 'SbMidiInput.onNoteOff', uid, channel, key, velocity ].postln;
        if( predicate.( uid, channel ), {
          /// "then func".postln;
          func.( key, velocity );
        })
      }
    );
  }

  onNoteOn {| func |
    MIDIIn.addFuncTo( 'noteOn',
      {| uid, channel, key, velocity |
        /// [ 'SbMidiInput.onNoteOn', uid, channel, key, velocity ].postln;
        if( predicate.( uid, channel ), {
          /// "then func".postln;
          func.( key, velocity );
        })
      }
    );
  }
}
