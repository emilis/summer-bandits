import { type InputChannel }  from 'webmidi';
import { type JSX }           from 'preact';
import { type Signal }        from '@preact/signals';
import { useState }           from 'preact/hooks';

import { midiInputs }         from './state';
import { SelectChannel }      from './SelectChannel';


export function SelectInputChannel(
  { forSignal }: { forSignal: Signal<InputChannel | null> },
){
  const [ channel, setChannel ] =
    useState<number>( forSignal.value?.number || 1 );

  const onChangeInput = (evt: JSX.TargetedEvent<HTMLSelectElement>) => {

    const id =              evt.currentTarget.value;
    const input =           midiInputs.value.find( input => input.id === id );
    forSignal.value =
      input?.channels[
        forSignal.value?.number || channel
      ] || null;
  };

  const onChangeChannel = ( channelNumber: number ) => {

    setChannel( channelNumber );

    if( forSignal.value ){
      forSignal.value =     forSignal.value.input.channels[channelNumber];
    }
  };

  return (
    <div>
      <select
        onChange={ onChangeInput }
      >
        <option value={ undefined }>-- NO INPUT --</option>
        { midiInputs.value.map( input =>
          <option
            key={ input.id }
            children={ input.name }
            value={ input.id }
          />
        )}
      </select>
      <SelectChannel onChange={ onChangeChannel } value={ channel } />
    </div>
  );
}
