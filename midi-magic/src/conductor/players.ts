import { batch, signal, type Signal } from "@preact/signals";

import { type ChordNumber } from "../harmony/scales";

type LeadershipMode = 'LEAD' | 'FOLLOW' | 'FREE_PLAY';

type Player = {
    chordNumber: ChordNumber;
    isFollower: boolean;
    isFreePlay: boolean;
    isLeader: boolean;
    mode: LeadershipMode;
    name: string;
}

export type PlayerSignal = Signal<Player>;

export const players: PlayerSignal[] = [];

const createPlayer = (
    name: string,
    mode: LeadershipMode = 'FREE_PLAY',
    chordNumber: ChordNumber = 'i',
): Player => ({
    chordNumber,
    isFollower: mode === 'FOLLOW',
    isFreePlay: mode === 'FREE_PLAY',
    isLeader: mode === 'LEAD',
    mode,
    name,
});

const changeChordNumber = (player: PlayerSignal, chordNumber: ChordNumber) => {
  player.value = {
    ...player.value,
    chordNumber,
  };
};

const changeMode = (player: PlayerSignal, mode: LeadershipMode) => {
    player.value = {
      ...player.value,
      isFollower: mode === 'FOLLOW',
      isFreePlay: mode === 'FREE_PLAY',
      isLeader: mode === 'LEAD',
      mode,
    };
};

const groupOtherPlayers = (withoutPlayer: PlayerSignal): PlayerSignal[][] => {
    const leaders: PlayerSignal[] = [];
    const followers: PlayerSignal[] = [];
    const freePlayers: PlayerSignal[] = [];
    for( const player of players ){
        if( player === withoutPlayer ){
            break;
        } else if( player.value.isFollower ){
            followers.push( player );
        } else if( player.value.isFreePlay ){
            freePlayers.push( player );
        } else if( player.value.isLeader ){
            leaders.push( player );
        }
    }
    return [leaders, followers, freePlayers];
};

/// Exports --------------------------------------------------------------------

export const registerPlayer = (
    playerName: string,
    mode: LeadershipMode = 'FREE_PLAY',
) => {
    const existingPlayer = players.find((player =>
        player.value.name === playerName
    ));
    if( existingPlayer ){
        return existingPlayer;
    } else {
        const player = signal<Player>(createPlayer(playerName, mode));
        players.push(player);
        return player;
    }
};

export const setChordNumber = (player: PlayerSignal, chordNumber: ChordNumber) => {
  batch(() => {
    if( player.value.mode === 'FREE_PLAY'
      || player.value.mode === 'LEAD'
    ){
      changeChordNumber( player, chordNumber );
    }
    if( player.value.mode === 'LEAD' ){
      const [_, followers] = groupOtherPlayers(player);
      for( const follower of followers ){
        changeChordNumber( follower, chordNumber );
      }
    }
  });
};

export const setFollower = (player: PlayerSignal) => {
    batch(() => {
        const [ _, freePlayers, leaders ] = groupOtherPlayers( player );
        if( leaders.length || freePlayers.length ){
            changeMode(player, 'FOLLOW');
            if( ! leaders.length ){
                changeMode( freePlayers[0], 'LEAD' );
            }
        }
    });
};

export const setFreePlay = (player: PlayerSignal) => {
    batch(() => {
        if( player.value.isFreePlay ){
            return;
        } else if( player.value.isFollower ){
            changeMode(player, 'FREE_PLAY');
        } else {
            const [ _, freePlayers, leaders ] = groupOtherPlayers( player );
            const potentialLeaders = [...leaders, ...freePlayers];
            if( potentialLeaders.length ){
                changeMode(potentialLeaders[0], 'LEAD');
                changeMode(player, 'FREE_PLAY');
            } else {
                changeMode(player, 'LEAD');
            }
        }
    });
};

export const setLeader = (sourcePlayer: PlayerSignal) => {
    batch(() => {
        for (const player of players) {
            if (player === sourcePlayer) {
                changeMode(player, 'LEAD');
            } else if (player.value.isLeader) {
                changeMode(player, 'FREE_PLAY');
            }
        }
    });
};

export const toggleLeadership = (player: PlayerSignal) => {
    if (player.value.isLeader) {
        setFollower(player);
    } else {
        setLeader(player);
    }
};
