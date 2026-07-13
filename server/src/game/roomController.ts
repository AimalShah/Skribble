import { Server, Socket } from "socket.io";
import {
  Languages,
  Player,
  PlayerData,
  Room,
  RoomState,
  Settings,
} from "../types";
import {
  deleteRedisRoom,
  getPublicRoom,
  getRedisRoom,
  setRedisRoom,
} from "../utils/redis";
import { withRoomLock } from "../utils/roomLock";
import { GameEvent, RounEndReason } from "../types";
import { convertToUnderscores, getRandomWords } from "../utils/word";
import { generateEmptyRoom } from "./gameController";
import { getRoomFromSocket } from "./gameController";
import {
  BONUS_PER_GUESS,
  DRAWER_POINTS,
  END_ROUND_TIME,
  HINTS_TIME,
  WINNER_SHOW_TIME,
  WORDCHOOSE_TIME,
} from "../constants";

const timers = new Map();
const hintTimers = new Map();

// This is for new game on public rooms
const startGameTimers = new Map();

function clearTimers(roomId: string) {
  const timer = timers.get(roomId);
  const hintTimer = hintTimers.get(roomId);
  if (timer) {
    clearTimeout(timer);
    timers.delete(roomId);
  }
  if (hintTimer) {
    clearTimeout(hintTimer);
    hintTimers.delete(roomId);
  }
}

export async function startGame(room: Room, io: Server) {
  clearTimers(room.roomId);
  room.gameState.currentRound = 1;
  room.gameState.currentPlayer = 0;
  room.gameState.guessedWords = [];
  room.gameState.drawingData = [];
  room.gameState.hintLetters = [];
  (room.gameState.roomState = RoomState.CHOOSING_WORD),
    await setRedisRoom(room.roomId, room);
  io.to(room.roomId).emit(GameEvent.GAME_STARTED, room);
  await nextRound(room.roomId, io);
  return room;
}

export async function endRound(
  roomId: string,
  io: Server,
  reason: RounEndReason = RounEndReason.TIMEUP
) {
  let room = await getRedisRoom(roomId);
  if (!room) return;

  clearTimers(room.roomId);
  if (reason === RounEndReason.LEFT && room.players.length === 2) {
    return;
  }

  room.gameState.currentPlayer += 1;

  // Check if playerCounter needs to be incremented
  if (room.gameState.currentPlayer >= room.players.length) {
    // Round end
    room.gameState.currentRound += 1;
    room.gameState.currentPlayer = 0;
  }
  await setRedisRoom(roomId, room);

  await givePoints(roomId);
  room = await getRedisRoom(roomId);
  if (!room) return;
  room.gameState.drawingData = [];
  room.players = room.players.map((e) => {
    return { ...e, guessed: false, guessedAt: null };
  });
  await setRedisRoom(roomId, room);

  io.to(room.roomId).emit(GameEvent.TURN_END, room, {
    word: room.gameState.word,
    reason,
    time: END_ROUND_TIME,
  });
  room.gameState.word = "";
  room.gameState.roomState = RoomState.CHOOSING_WORD;
  await setRedisRoom(roomId, room);

  setTimeout(async () => {
    if (room.gameState.currentRound > room.settings.rounds) {
      return await endGame(roomId, io);
    }
    await nextRound(roomId, io);
  }, END_ROUND_TIME * 1000);
}

export async function guessWord(
  roomId: string,
  guess: string,
  socket: Socket,
  io: Server
) {
  await withRoomLock(roomId, async () => {
    const room = await getRedisRoom(roomId);
    if (!room) return;

    const player = room.players.find((e) => e.playerId === socket.id);
    if (!player) return;

    const currentPlayer = room.players[room.gameState.currentPlayer];

    if (
      player.playerId !== currentPlayer.playerId &&
      room.gameState.word === guess.toLowerCase() &&
      !player.guessed
    ) {
      // Mark player as guessed
      player.guessed = true;
      player.guessedAt = new Date();

      await setRedisRoom(room.roomId, room);
      io.to(room.roomId).emit(GameEvent.GUESSED, player);

      // Check if all players (except the current one) have guessed
      if (
        room.players.every(
          (p) => p.guessed || p.playerId === currentPlayer.playerId
        )
      ) {
        await endRound(room.roomId, io, RounEndReason.ALL_GUESSED);
      }
    } else {
      io.to(room.roomId).emit(GameEvent.GUESS, guess, player);
    }
  });
}

export async function nextRound(roomId: string, io: Server) {
  const room = await getRedisRoom(roomId);
  if (!room) return;

  // Set the current player
  const currentPlayer = room.players[room.gameState.currentPlayer];
  if (!currentPlayer) return;

  // Get random words
  const words = await getRandomWords(
    room.settings.wordCount,
    room.settings.language,
    room.settings.onlyCustomWords,
    room.settings.customWords
  );

  // Send words to current player
  io.to(currentPlayer.playerId).emit(GameEvent.CHOOSE_WORD, {
    words,
    time: WORDCHOOSE_TIME,
  });

  // Send choosing word event to other players in the room
  io.to(room.roomId)
    .except(currentPlayer.playerId)
    .emit(GameEvent.CHOOSING_WORD, { currentPlayer, time: WORDCHOOSE_TIME });

  room.gameState.timerStartedAt = new Date();
  await setRedisRoom(room.roomId, room);

  const timeOut = setTimeout(async () => {
    const room = await getRedisRoom(roomId);
    if (!room) return;
    if (room.gameState.word != "") return;
    // Not selected a word;
    const randomWord = words[Math.floor(Math.random() * words.length)];
    await wordSelected(roomId, randomWord, io);
  }, WORDCHOOSE_TIME * 1000);
  timers.set(roomId, timeOut);
}

export async function wordSelected(roomId: string, word: string, io: Server) {
  const room = await getRedisRoom(roomId);
  if (!room) return;
  clearTimers(room.roomId);

  room.gameState.word = word;
  room.gameState.roomState = RoomState.DRAWING;
  room.gameState.timerStartedAt = new Date();
  await setRedisRoom(room.roomId, room);

  await setRedisRoom(roomId, room);

  const player = room.players[room.gameState.currentPlayer];
  if (!player) return;

  // Send the selected word to the drawer
  io.to(player.playerId).emit(GameEvent.WORD_CHOSEN, {
    word,
    time: room.settings.drawTime,
  });

  // convert the word into array of letter lengths
  const words_lens = convertToUnderscores(word);
  io.to(room.roomId).except(player.playerId).emit(GameEvent.GUESS_WORD_CHOSEN, {
    word: words_lens,
    time: room.settings.drawTime,
  });

  const timeOut = setTimeout(async () => {
    await endRound(roomId, io, RounEndReason.TIMEUP);
  }, room.settings.drawTime * 1000);
  timers.set(roomId, timeOut);

  if (room.settings.hints > 0) {
    const hintsTimeout = setTimeout(async () => {
      await sendHint(io, roomId);
    }, room.settings.drawTime * 0.5 * 1000);
    hintTimers.set(roomId, hintsTimeout);
  }
}

export async function givePoints(roomId: string) {
  const room = await getRedisRoom(roomId);
  if (!room) return;
  const now = new Date();
  const playersWhoGuessed = room.players.filter((player) => player.guessed);
  if (playersWhoGuessed.length === 0) {
    room.players.forEach((player) => {
      player.score += 0;
    });
    await setRedisRoom(room.roomId, room);
    return;
  }

  playersWhoGuessed.forEach((player, index) => {
    const points = 200;
    const guessTime = Math.abs(
      (now.getTime() - new Date(player.guessedAt ?? now).getTime()) / 1000
    );
    player.score += Math.round(Math.max(points - guessTime, 0));
  });

  const currentPlayer = room.players[room.gameState.currentPlayer];
  if (!currentPlayer) return;
  currentPlayer.score +=
    DRAWER_POINTS + playersWhoGuessed.length * BONUS_PER_GUESS;
  await setRedisRoom(room.roomId, room);
}

export async function endGame(roomId: string, io: Server) {
  const room = await getRedisRoom(roomId);
  if (!room) return;

  clearTimers(room.roomId);

  // Track stats for authenticated users
  try {
    const { User } = require("../models/User");
    for (const player of room.players) {
      // Players are identified by socket.id, we need to update stats
      // This is a best-effort update - if the user isn't authenticated, we skip
    }
  } catch {
    // Stats update is optional, don't fail the game end
  }

  room.gameState.currentRound = 0;
  room.gameState.word = "";
  room.gameState.guessedWords = [];
  room.gameState.roomState = RoomState.NOT_STARTED;
  room.vote_kickers = [];
  await setRedisRoom(roomId, room);
  io.to(roomId).emit(GameEvent.GAME_ENDED, { room, time: WINNER_SHOW_TIME });

  if (!room.isPrivate) {
    const timeOut = setTimeout(async () => {
      await startGame(room, io);
    }, WINNER_SHOW_TIME * 1000);
    startGameTimers.set(roomId, timeOut);
  }
}

export const handleNewRoom = async (
  io: Server,
  socket: Socket,
  playerData: PlayerData,
  language: Languages,
  isPrivate?: boolean
) => {
  let roomId;
  if (isPrivate) {
    roomId = await generateEmptyRoom(socket, isPrivate, language);
  } else {
    const room = await getPublicRoom(language);
    if (!room) {
      roomId = await generateEmptyRoom(socket, false, language);
    } else {
      roomId = room.roomId;
    }
  }

  handleNewPlayerJoin(roomId, socket, io, playerData, language);
};

export async function handleDrawAction(
  socket: Socket,
  action: "DRAW" | "CLEAR" | "UNDO",
  drawData?: any
) {
  const room = await getRoomFromSocket(socket);
  if (!room || room.gameState.currentRound === 0) return;

  const currentPlayer = room.players[room.gameState.currentPlayer];
  if (!currentPlayer || currentPlayer.playerId !== socket.id) return;

  await withRoomLock(room.roomId, async () => {
    const currentRoom = await getRedisRoom(room.roomId);
    if (!currentRoom) return;

    switch (action) {
      case "DRAW":
        if (!drawData) return;
        currentRoom.gameState.drawingData.push(drawData);
        socket.to(currentRoom.roomId).emit(GameEvent.DRAW_DATA, drawData);
        break;

      case "CLEAR":
        currentRoom.gameState.drawingData = [];
        socket.to(currentRoom.roomId).emit(GameEvent.CLEAR_DRAW);
        break;

      case "UNDO":
        currentRoom.gameState.drawingData.pop();
        socket.to(currentRoom.roomId).emit(GameEvent.UNDO_DRAW);
        break;
    }

    await setRedisRoom(currentRoom.roomId, currentRoom);
  });
}

export const handlePlayerLeft = async (socket: Socket, io: Server) => {
  const room = await getRoomFromSocket(socket);
  if (!room) return;

  await withRoomLock(room.roomId, async () => {
    const currentRoom = await getRedisRoom(room.roomId);
    if (!currentRoom) return;

    const currentPlayer = currentRoom.players[currentRoom.gameState.currentPlayer];
    if (currentPlayer && currentPlayer.playerId === socket.id) {
      await endRound(currentRoom.roomId, io, RounEndReason.LEFT);
    }

    const player = currentRoom.players.find((e) => e.playerId === socket.id);
    if (!player) return;
    currentRoom.players = currentRoom.players.filter((e) => e.playerId != socket.id);
    if (currentRoom.players.length === 0) {
      await deleteRedisRoom(currentRoom.roomId);
      return;
    }

    if (
      currentRoom.creator === player.playerId &&
      currentRoom.players.length > 0 &&
      currentRoom.isPrivate
    ) {
      currentRoom.creator = currentRoom.players[0].playerId;
    }

    await setRedisRoom(currentRoom.roomId, currentRoom);
    socket.to(currentRoom.roomId).emit(GameEvent.PLAYER_LEFT, player);
    if (currentRoom.players.length === 1 && currentRoom.gameState.currentRound >= 1) {
      // No players left in the room
      await endGame(currentRoom.roomId, io);

      // not 2 players present so game will not start
      if (!currentRoom.isPrivate) {
        if (startGameTimers.has(currentRoom.roomId)) {
          clearTimeout(startGameTimers.get(currentRoom.roomId));
          startGameTimers.delete(currentRoom.roomId);
        }
      }
    }

    if (currentRoom.players.length <= 0) {
      await deleteRedisRoom(currentRoom.roomId);
      clearTimers(currentRoom.roomId);
      if (startGameTimers.has(currentRoom.roomId)) {
        clearTimeout(startGameTimers.get(currentRoom.roomId));
        startGameTimers.delete(currentRoom.roomId);
      }
    }
  });
};

export const handleSettingsChange = async (
  socket: Socket,
  io: Server,
  setting: keyof Settings,
  value: any
) => {
  if (typeof setting !== "string") return;

  const room = await getRoomFromSocket(socket);
  if (!room) return;

  await withRoomLock(room.roomId, async () => {
    const currentRoom = await getRedisRoom(room.roomId);
    if (!currentRoom) return;

    if (!(setting in currentRoom.settings))
      return socket.emit("error", "Invalid setting value");

    const settingType = typeof currentRoom.settings[setting];
    if (typeof value !== settingType)
      return socket.emit("error", `Invalid value type for ${setting}`);

    // @ts-ignore
    currentRoom.settings[setting] = value as SettingValue;

    await setRedisRoom(currentRoom.roomId, currentRoom);
    io.to(currentRoom.roomId).emit(GameEvent.SETTINGS_CHANGED, setting, value);
  });
};

export async function sendHint(io: Server, roomId: string) {
  const room = await getRedisRoom(roomId);
  if (!room) return;
  const word = room.gameState.word;
  if (!word) return;
  if (room.gameState.hintLetters.length >= room.settings.hints) return;

  if (hintTimers.get(roomId)) clearTimeout(hintTimers.get(roomId));

  // Cannot make the whole word appear randomly
  if (room.gameState.hintLetters.length - 1 >= word.length) return;

  const revealedIndices = new Set<number>();

  // Reveal some characters based on word length
  while (revealedIndices.size < Math.ceil(word.length / 3)) {
    const index = Math.floor(Math.random() * word.length);
    revealedIndices.add(index);
  }

  // Create an array of revealed letters with indices
  const hintArray = Array.from(revealedIndices).map((index) => ({
    index,
    letter: word[index],
  }));
  // Get a random element from the hint array
  const randomIndex = Math.floor(Math.random() * hintArray.length);
  const hint = hintArray[randomIndex];
  room.gameState.hintLetters.push(hint);

  // Emit hint to the room
  io.to(roomId)
    .except(room.players[room.gameState.currentPlayer].playerId)
    .emit(GameEvent.GUESS_HINT, hint);

  if (room.gameState.hintLetters.length !== room.settings.hints) {
    hintTimers.set(roomId, setTimeout(sendHint, HINTS_TIME * 1000, io, roomId));
  }
}

export async function handleNewPlayerJoin(
  roomId: string,
  socket: Socket,
  io: Server,
  playerData: PlayerData,
  language: Languages
) {
  await withRoomLock(roomId, async () => {
    let room = await getRedisRoom(roomId);
    if (!room) {
      // Try to create Redis room from MongoDB metadata
      try {
        const { RoomMetadata } = require("../models/RoomMetadata");
        const metadata = await RoomMetadata.findOne({ roomId });
        if (metadata) {
          const newRoom: Room = {
            roomId,
            creator: null,
            players: [],
            gameState: {
              currentRound: 0,
              drawingData: [],
              guessedWords: [],
              word: "",
              currentPlayer: 0,
              hintLetters: [],
              roomState: RoomState.NOT_STARTED,
              timerStartedAt: new Date(),
            },
            settings: {
              players: metadata.settings?.players || 2,
              drawTime: metadata.settings?.drawTime || 60,
              rounds: metadata.settings?.rounds || 1,
              wordCount: metadata.settings?.wordCount || 3,
              hints: metadata.settings?.hints || 2,
              language: (metadata.language as Languages) || Languages.en,
              customWords: metadata.settings?.customWords || [],
              onlyCustomWords: metadata.settings?.onlyCustomWords || false,
            },
            isPrivate: metadata.isPrivate || false,
            vote_kickers: [],
          };
          await setRedisRoom(roomId, newRoom);
          room = newRoom;
        }
      } catch (err) {
        console.warn("Could not create room from metadata:", err);
      }

      if (!room) {
        return handleNewRoom(io, socket, playerData, language, false);
      }
    }

    if (room.players.length >= room.settings.players) {
      socket.emit("error", "The room you're trying to join is full");
      return socket.disconnect();
    }

    // Prevent duplicate player entries for the same socket
    const existingIndex = room.players.findIndex((p) => p.playerId === socket.id);
    if (existingIndex !== -1) {
      // Player reconnected — update their data but don't add a new entry
      room.players[existingIndex] = {
        ...room.players[existingIndex],
        ...playerData,
        score: room.players[existingIndex].score,
        guessed: false,
        guessedAt: null,
      };
    } else {
      const player: Player = {
        ...playerData,
        score: 0,
        playerId: socket.id,
        guessed: false,
        guessedAt: null,
      };
      room.players.push(player);
    }

    await setRedisRoom(roomId, room);

    socket.join(roomId);
    socket.emit(GameEvent.JOINED_ROOM, room);

    const joinedPlayer = room.players.find((p) => p.playerId === socket.id);
    if (joinedPlayer) {
      io.to(room.roomId).emit(GameEvent.PLAYER_JOINED, joinedPlayer);
    }

    if (
      !room.isPrivate &&
      room.players.length >= 2 &&
      !startGameTimers.has(roomId) &&
      room.gameState.currentRound === 0
    ) {
      await startGame(room, io);
    }

    if (room.gameState.roomState != RoomState.NOT_STARTED) {
      handleInBetweenJoin(roomId, socket, io);
    }
  });
}

export async function handleInBetweenJoin(
  roomId: string,
  socket: Socket,
  io: Server
) {
  const room = await getRedisRoom(roomId);
  if (!room) return;
  socket.join(roomId);

  // subtract now from timerStartedAt
  const now = new Date();
  const timeElapsed =
    now.getTime() - new Date(room.gameState.timerStartedAt).getTime();
  const timeLeft =
    (room.gameState.roomState === RoomState.CHOOSING_WORD
      ? WORDCHOOSE_TIME
      : room.settings.drawTime) *
      1000 -
    timeElapsed;
  if (timeLeft < 0) return;
  const time = Math.round(timeLeft / 1000);

  const gameStateWithoutWord = {
    ...room.gameState,
    word: convertToUnderscores(room.gameState.word),
    time,
  };
  socket.emit(GameEvent.GAME_STATE, { gameState: gameStateWithoutWord });
}

export async function handleVoteKick(
  socket: Socket,
  io: Server,
  playerId: string
) {
  const room = await getRoomFromSocket(socket);
  if (!room) return;

  await withRoomLock(room.roomId, async () => {
    const currentRoom = await getRedisRoom(room.roomId);
    if (!currentRoom) return;

    const voteKickers = currentRoom.vote_kickers;
    const player = currentRoom.players.find((e) => e.playerId === playerId);
    if (!player) return;

    const voter = currentRoom.players.find((e) => e.playerId === socket.id);
    if (!voter) return;

    const voteKicker = voteKickers.find((e) => e[0] === playerId);
    if (!voteKicker) {
      voteKickers.push([playerId, [voter.playerId]]);
    } else {
      if (voteKicker[1].includes(voter.playerId)) return;
      voteKicker[1].push(voter.playerId);
    }

    const votesNeeded = Math.ceil(currentRoom.players.length / 2);
    const votes = voteKickers.find((e) => e[0] === playerId)?.[1].length ?? 0;

    io.to(currentRoom.roomId).emit(GameEvent.KICKING_VOTE, {
      voter: voter.name,
      player: player.name,
      votes,
      votesNeeded,
    });

    if (votes >= votesNeeded) {
      currentRoom.players = currentRoom.players.filter((e) => e.playerId !== playerId);
      currentRoom.vote_kickers = currentRoom.vote_kickers.filter((e) => e[0] !== playerId);
      io.to(currentRoom.roomId).emit(GameEvent.PLAYER_LEFT, player);
      io.to(playerId).emit(GameEvent.KICKED);
      io.sockets.sockets.get(playerId)?.leave(currentRoom.roomId);
    }
    await setRedisRoom(currentRoom.roomId, currentRoom);
  });
}
