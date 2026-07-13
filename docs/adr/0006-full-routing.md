# Full multi-page routing with react-router-dom

The app moves from a single-page view to a multi-page application using the already-installed react-router-dom. Routes:

- `/` — Home (landing page, profile setup, avatar customization)
- `/feed` — Public Room Feed (browse published rooms, join)
- `/room/:roomId` — Game Room (drawing, guessing, chat)
- `/profile` — Profile page (edit display name, avatar, view stats)
- `/create-room` — Create Room form (settings, public/private toggle, password)

This replaces the current JoinGameForm as the entry point. The Home page becomes the landing experience with user identity (login/register) and navigation to the feed or room creation.
