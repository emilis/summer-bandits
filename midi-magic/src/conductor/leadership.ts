import { batch, signal, type Signal } from "@preact/signals";

type LeadershipMode = 'LEAD' | 'FOLLOW' | 'FREE_PLAY';

type LeadershipInstrument = {
    name: string;
    isFollower: boolean;
    isFreePlay: boolean;
    isLeader: boolean;
    mode: LeadershipMode;
}

type InstrumentSignal = Signal<LeadershipInstrument>;

const instruments: InstrumentSignal[] = [];

const createInstrument = (
    name: string,
    mode: LeadershipMode = 'FREE_PLAY',
): LeadershipInstrument => ({
    name,
    isFollower: mode === 'LEAD',
    isFreePlay: mode === 'FREE_PLAY',
    isLeader: mode === 'FOLLOW',
    mode,
});

const changeMode = (instrument: InstrumentSignal, mode: LeadershipMode) => {
    instrument.value = createInstrument(instrument.value.name, mode);
};

const groupOtherInstruments = (withoutInstrument: InstrumentSignal): InstrumentSignal[][] => {
    const leaders: InstrumentSignal[] = [];
    const followers: InstrumentSignal[] = [];
    const freePlayers: InstrumentSignal[] = [];
    for( const instrument of instruments ){
        if( instrument === withoutInstrument ){
            break;
        } else if( instrument.value.isFollower ){
            followers.push( instrument );
        } else if( instrument.value.isFreePlay ){
            freePlayers.push( instrument );
        } else if( instrument.value.isLeader ){
            leaders.push( instrument );
        }
    }
    return [leaders, followers, freePlayers];
};

export const registerLeadership = (
    instrumentName: string,
    mode: LeadershipMode = 'FREE_PLAY',
) => {
    const existingInstrument = instruments.find((instrument =>
        instrument.value.name === instrumentName
    ));
    if( existingInstrument ){
        return existingInstrument;
    } else {
        const instrument = signal<LeadershipInstrument>(createInstrument(instrumentName, mode));
        instruments.push(instrument);
        return instrument;
    }
};

export const setFollower = (instrument: InstrumentSignal) => {
    batch(() => {
        const [ _, freePlayers, leaders ] = groupOtherInstruments( instrument );
        if( leaders.length || freePlayers.length ){
            changeMode(instrument, 'FOLLOW');
            if( ! leaders.length ){
                changeMode( freePlayers[0], 'LEAD' );
            }
        }
    });
};

export const setFreePlay = (instrument: InstrumentSignal) => {
    batch(() => {
        if( instrument.value.isFreePlay ){
            return;
        } else if( instrument.value.isFollower ){
            changeMode(instrument, 'FREE_PLAY');
        } else {
            const [ _, freePlayers, leaders ] = groupOtherInstruments( instrument );
            const potentialLeaders = [...leaders, ...freePlayers];
            if( potentialLeaders.length ){
                changeMode(potentialLeaders[0], 'LEAD');
                changeMode(instrument, 'FREE_PLAY');
            } else {
                changeMode(instrument, 'LEAD');
            }
        }
    });
};

export const setLeader = (sourceInstrument: InstrumentSignal) => {
    batch(() => {
        for (const instrument of instruments) {
            if (instrument === sourceInstrument) {
                changeMode(instrument, 'LEAD');
            } else if (instrument.value.isLeader) {
                changeMode(instrument, 'FREE_PLAY');
            }
        }
    });
};

export const toggleLeadership = (instrument: InstrumentSignal) => {
    if (instrument.value.isLeader) {
        setFollower(instrument);
    } else {
        setLeader(instrument);
    }
};
