import { batch, signal, type Signal } from "@preact/signals";

import { activeScale } from "./state";

type LeadershipMode = "LEAD" | "FOLLOW" | "FREE_PLAY";

export type Player = {
  chordNumber: number;
  isFollower: boolean;
  isFreePlay: boolean;
  isLeader: boolean;
  mode: LeadershipMode;
  name: string;
};

export type PlayerSignal = Signal<Player>;

export const players: PlayerSignal[] = [];

const createPlayer = (
  name: string,
  mode: LeadershipMode = "FREE_PLAY",
  chordNumber: number = 0,
): Player => ({
  chordNumber,
  isFollower: mode === "FOLLOW",
  isFreePlay: mode === "FREE_PLAY",
  isLeader: mode === "LEAD",
  mode,
  name,
});

const changeChordNumber = (player: PlayerSignal, chordNumber: number) => {
  player.value = {
    ...player.value,
    chordNumber: chordNumber % activeScale.value.chords.length,
  };
};

const changeMode = (player: PlayerSignal, mode: LeadershipMode) => {
  player.value = {
    ...player.value,
    isFollower: mode === "FOLLOW",
    isFreePlay: mode === "FREE_PLAY",
    isLeader: mode === "LEAD",
    mode,
  };
};

const groupOtherPlayers = (withoutPlayer: PlayerSignal): PlayerSignal[][] => {
  const leaders: PlayerSignal[] = [];
  const followers: PlayerSignal[] = [];
  const freePlayers: PlayerSignal[] = [];
  for (const player of players) {
    if (player === withoutPlayer) {
      continue;
    } else if (player.value.isFollower) {
      followers.push(player);
    } else if (player.value.isFreePlay) {
      freePlayers.push(player);
    } else if (player.value.isLeader) {
      leaders.push(player);
    }
  }
  return [followers, freePlayers, leaders];
};

/// Exports --------------------------------------------------------------------

export const registerPlayer = (
  playerName: string,
  mode: LeadershipMode = "FREE_PLAY",
) => {
  const existingPlayer = players.find(
    (player) => player.value.name === playerName,
  );
  if (existingPlayer) {
    return existingPlayer;
  } else {
    const player = signal<Player>(createPlayer(playerName, mode));
    players.push(player);
    return player;
  }
};

export const setChordNumber = (player: PlayerSignal, chordNumber: number) => {
  batch(() => {
    if (player.value.mode === "FREE_PLAY" || player.value.mode === "LEAD") {
      changeChordNumber(player, chordNumber);
    }
    if (player.value.mode === "LEAD") {
      const [followers] = groupOtherPlayers(player);
      for (const follower of followers) {
        changeChordNumber(follower, chordNumber);
      }
    }
  });
};

export const setFollower = (player: PlayerSignal) => {
  batch(() => {
    const [followers, freePlayers, leaders] = groupOtherPlayers(player);
    if (leaders.length || freePlayers.length) {
      const leader = leaders[0] || freePlayers[0];
      changeMode(player, "FOLLOW");
      changeChordNumber(player, leader.value.chordNumber);
      if (!leader.value.isLeader) {
        changeMode(leader, "LEAD");
        for (const follower of followers) {
          changeChordNumber(follower, leader.value.chordNumber);
        }
      }
    }
  });
};

export const setFreePlay = (player: PlayerSignal) => {
  batch(() => {
    if (player.value.isFreePlay) {
      return;
    } else if (player.value.isFollower) {
      changeMode(player, "FREE_PLAY");
    } else {
      const [followers, freePlayers, leaders] = groupOtherPlayers(player);
      const nextLeader = leaders[0] || freePlayers[0];
      if (!nextLeader) {
        return;
      } else {
        changeMode(nextLeader, "LEAD");
        changeMode(player, "FREE_PLAY");
        for (const follower of followers) {
          changeChordNumber(follower, nextLeader.value.chordNumber);
        }
      }
    }
  });
};

export const setLeader = (player: PlayerSignal) => {
  batch(() => {
    const [followers, _, leaders] = groupOtherPlayers(player);
    changeMode(player, "LEAD");
    for (const oldLeader of leaders) {
      changeMode(oldLeader, "FREE_PLAY");
    }
    for (const follower of followers) {
      changeChordNumber(follower, player.value.chordNumber);
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
