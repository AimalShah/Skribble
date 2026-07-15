# Skribble clone

A real-time multiplayer drawing & guessing game (skribble.io style) — with authenticated users, a public room feed, private password-protected rooms, and a paper-and-pencil doodle theme.

## Features

- **Real-time drawing sync** — canvas strokes broadcast instantly to all players via WebSockets
- **Public & private rooms** — join public rooms straight from the feed, or create a password-protected private room
- **Public feed** — browse live public rooms by name, owner, player count, and language
- **Live scoring** — faster correct guesses earn more points; drawers score based on how many players guess correctly
- **Progressive hints** — letters of the word are revealed at timed intervals
- **User profiles** — display name, avatar (emoji-based), and aggregated game stats
- **Moderation** — vote-kick disruptive players, mute players individually
- **Two-tier auth** — JWT for the REST API, session-based auth for Socket.IO

## Tech Stack

- **Backend:** Node.js, Socket.IO, Redis, MongoDB
- **Frontend:** React, TypeScript, Vite
- **Auth:** JWT (API) + session-based (Socket.IO)

## Architecture

Live game state (room, player list, game phase, scores) lives in **Redis** as the single source of truth — ephemeral, and cleared when a room empties. Persistent data (user credentials, profiles, stats) lives in **MongoDB**, surviving across sessions and restarts.

Game lifecycle: `NOT_STARTED → CHOOSING_WORD → DRAWING → GAME_ENDED`

## Getting Started

### Prerequisites
- Node.js
- Redis
- MongoDB

### Clone the repository
```bash
git clone https://github.com/AimalShah/Skribble.git
cd Skribble
```

### Start Redis
```bash
docker run -d -p 6379:6379 redis
```

### Start the server
```bash
cd server
npm install
npm run dev
```

### Start the client
```bash
cd client
npm install
npm run dev
```

### Environment Variables

Server `.env`:
```
REDDIS_URL=redis://localhost:6379
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Play

Open [http://localhost:5173](http://localhost:5173)

## License

MIT
