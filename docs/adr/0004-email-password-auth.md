# Email/password authentication with JWT

All users must register with email and password to play. JWT tokens are issued on login and used for API route protection. Socket.IO uses a separate session-based auth mechanism (socket middleware that validates the JWT on connection).

Profiles (display name, avatar) and statistics are persisted in MongoDB. The avatar system (emoji-based body/eyes/mouth) is saved to the user profile and rendered in-game next to player names — replacing the current unused avatar data and static logo.

No OAuth is included in the initial implementation. The system is designed so OAuth can be added later without changing the User model (email is unique; OAuth users would have a null password).
