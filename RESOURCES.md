# Skribble Architecture Resources

## Knowledge

- [Socket.IO Documentation](https://socket.io/docs/v4/)
  The real-time engine powering all in-game communication. Use for: understanding JOIN_ROOM, DRAW, GUESS events and room-based broadcasting.
- [Mongoose ODM Guide](https://mongoosejs.com/docs/guide.html)
  MongoDB object modeling for Node.js. Use for: understanding User and RoomMetadata schemas, pre-save hooks, and query patterns.
- [Redis Getting Started](https://redis.io/docs/get-started/)
  In-memory data store for ephemeral game state. Use for: understanding room storage, prefix conventions, and the dual-database pattern.
- [Express.js Routing Guide](https://expressjs.com/en/guide/routing.html)
  REST API framework. Use for: understanding /api/auth, /api/rooms, /api/profile, /api/stats route handlers.
- [React Context API](https://react.dev/learn/scaling-up-with-reducer-and-context)
  Client state management via AuthContext, RoomContext, MessagesContext. Use for: understanding how state flows through the component tree.
- [Vite + React Setup](https://vitejs.dev/guide/)
  Frontend build tool and dev server. Use for: understanding the client build pipeline and HMR.

## Wisdom (Communities)

- [r/reactjs](https://reddit.com/r/reactjs)
  High-signal React community. Use for: pattern questions, context vs. state management tradeoffs.
- [r/node](https://reddit.com/r/node)
  Node.js community. Use for: backend architecture questions, Socket.IO patterns.
- [Socket.IO Discord](https://socket.io/docs/#/chat)
  Official Socket.IO chat. Use for: real-time event handling questions.
