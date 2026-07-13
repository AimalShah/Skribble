# Skribble

A real-time multiplayer drawing and guessing game (like skribble.io) with authenticated users, public room feed, private rooms with passwords, and a paper-and-pencil doodle theme.

## Language

### Core Entities

**User**:
A registered person with email, password, display name, avatar, and game statistics.
_Avoid_: Player, account, member (use "Player" only when referring to someone actively in a game room)

**Player**:
A User who is currently participating in a game room. Has a score, guess state, and is identified by their socket connection.
_Avoid_: Participant, user (in game context)

**Room**:
A game instance where Players draw and guess words. Has settings, game state, and a lifecycle (not started → drawing → ended).
_Avoid_: Lobby, game, match

**RoomOwner**:
The User who created a Room. Controls settings, can start the game, and can publish/unpublish from the public feed. Transfers ownership if they leave.
_Avoid_: Creator, host, admin

### Room Access

**Public Room**:
A Room that the RoomOwner has published to the feed. Visible to all Users. Anyone can join without a password. Stays in the feed until the game starts or the owner unpublishes it.
_Avoid_: Open room, quick play

**Private Room**:
A Room that requires both a Room ID and a password to join. Not listed in any public feed. Password is set at creation time by the RoomOwner.
_Avoid_: Invite-only room, locked room

**Room Password**:
A secret set by the RoomOwner at creation time. Required to join a Private Room. Verified server-side before allowing entry.
_Avoid_: Passcode, PIN, key

**Room ID**:
A unique identifier for a Room, used in invite links and to join by code. Format: UUID-style string.
_Avoid_: Room code, invite code

### Public Feed

**Public Feed**:
A browsable list of published Public Rooms. Shows room name, owner, player count, language, and settings. Users can join directly from the feed.
_Avoid_: Room list, lobby browser, matchmaking

**Publish**:
The act of making a Private Room visible in the Public Feed. Only the RoomOwner can publish. Unpublishing removes it from the feed but doesn't end the room.
_Avoid_: List, advertise, expose

### User Profile

**Avatar**:
A visual representation composed of emoji selections for body, eyes, and mouth. Saved to the User's profile in MongoDB and rendered next to their name in-game.
_Avoid_: Skin, character, icon

**Profile**:
The collection of a User's display name, avatar, and statistics. Editable from the home page.
_Avoid_: Account settings, user page

**Statistics**:
Aggregated game performance data: games played, games won, total score, drawing rounds completed, words guessed correctly.
_Avoid_: Stats, metrics, leaderboard (a leaderboard is a ranking of multiple Users)

### Game State

**GameState**:
The current phase of a Room's game lifecycle. Values: NOT_STARTED, CHOOSING_WORD, DRAWING, GAME_ENDED.
_Aavoid_: Status, phase

**Turn**:
A single drawing round within a game. One Player draws, others guess. Ends when the timer expires or all Players have guessed.
_Aavoid_: Round (use Round for the outer loop of turns)

**Round**:
A complete cycle where every Player has had one Turn as the drawer. A game consists of multiple Rounds.
_Aavoid_: Game, match

**Word**:
The secret word that the drawer illustrates and guessers attempt to猜. Selected from a word list filtered by language. Shown as hints (underscores) to guessers.
_Avoid_: Prompt, answer, solution

**Hint**:
A progressively revealed letter of the Word. Shown to guessers at timed intervals during a Turn.
_Aavoid_: Clue, reveal

**DrawingData**:
A sequence of stroke events (coordinates, color, line width) captured from the canvas and broadcast to all non-drawer Players in real-time.
_Avoid_: Canvas data, stroke data

### Scoring

**Score**:
Points earned by a Player during a game. Awarded for correct guesses (faster = more points) and for the drawer (proportional to correct guesses).
_Aavoid_: Points, rating

**Guess**:
A text attempt by a Player to identify the Word. Can be correct (matched exactly) or incorrect (broadcast to the room as a chat message).
_Aavoid_: Answer, try, attempt

### Moderation

**VoteKick**:
A mechanism for Players to collectively remove a disruptive Player. Requires a majority of Players to vote. Tracked per Player per Room.
_Aavoid_: Kick vote, removal

**Mute**:
Hides a Player's messages from a specific other Player. Only affects the muting Player's view.
_Aavoid_: Silence, ban

### Technical

**SocketConnection**:
The real-time WebSocket link between a client and the server, identified by a socket ID. Used for all in-game communication.
_Aavoid_: Connection, link, channel

**Redis Room State**:
The game state, player list, and settings stored in Redis for low-latency access during gameplay. Ephemeral — deleted when the Room is empty.
_Aavoid_: Cache, session data

**MongoDB User Record**:
The persistent user profile, credentials, and statistics stored in MongoDB. Survives across sessions and server restarts.
_Aavoid_: Database record, user data

**JWT Token**:
A signed JSON Web Token issued on login. Contains the User ID. Sent with API requests and validated on protected routes. Not used for Socket.IO (which uses session-based auth).
_Aavoid_: Auth token, session token, access token
