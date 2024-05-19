import { type OutputChannel } from 'webmidi';
import { type JSX }           from 'preact';
import { type Signal }        from '@preact/signals';
import { useState }           from 'preact/hooks';

import { midiOutputs }        from './state';
import { SelectChannel }      from './SelectChannel';


export function SelectOutputChannel(
  { forSignal }: { forSignal: Signal<OutputChannel | null> },
){
  const [ channel, setChannel ] =
    useState<number>( forSignal.value?.number || 1 );

  const onChangeOutput = (evt: JSX.TargetedEvent<HTMLSelectElement>) => {

    const id =              evt.currentTarget.value;
    const output =          midiOutputs.value.find( output => output.id === id );
    forSignal.value =
      output?.channels[
        forSignal.value?.number || channel
      ] || null;
  };

  const onChangeChannel = ( channelNumber: number ) => {

    setChannel( channelNumber );

    if( forSignal.value ){
      forSignal.value =     forSignal.value.output.channels[channelNumber];
    }
  };

  return (
    <div>
      <select
        onChange={ onChangeOutput }
      >
        <option value={ undefined }>-- NO INPUT --</option>
        { midiOutputs.value.map( output =>
          <option
            key={ output.id }
            children={ output.name }
            value={ output.id }
          />
        )}
      </select>
      <SelectChannel onChange={ onChangeChannel } value={ channel } />
    </div>
  );
}
