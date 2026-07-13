# Dual-database architecture: MongoDB for users, Redis for rooms

We need persistent user accounts (profiles, avatars, stats) that survive sessions and server restarts, plus fast ephemeral room state for real-time gameplay. MongoDB holds user records; Redis holds room game state. Public room metadata (name, owner, player count, language, settings) lives in MongoDB for queryable feed browsing; the actual game state for those rooms stays in Redis.

This avoids the latency hit of using MongoDB for real-time game events while giving us durable user data. Room state is ephemeral — when all players leave, the room and its Redis key are deleted. The MongoDB metadata entry is also cleaned up.

Considered putting everything in Redis (simpler, but no persistent user data) or everything in MongoDB (persistent but too slow for real-time draw/guess events).
