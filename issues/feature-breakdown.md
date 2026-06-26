# Feature Breakdown: Auth + Leaderboard & Doodle UI Redesign

## Workstream 1 — Auth & Leaderboard (MongoDB)

### Issue 1: MongoDB connection & configuration

**What:** Add MongoDB client (mongoose) to the server, create a DB connection module, add config for connection string.

**Parent:** Workstream 1

**Files to create/modify:**
- `server/src/utils/database.ts` — mongoose connection
- `server/.env` — connection string config
- `server/package.json` — add `mongoose` dependency

**Blocked by:** None — can start immediately

---

### Issue 2: User model + registration endpoint

**What:** `POST /api/auth/register` — username + password. Hash passwords (bcrypt). Store in MongoDB `users` collection. Return a token (JWT or session).

**Parent:** Workstream 1

**Files to create/modify:**
- `server/src/models/User.ts` — mongoose schema
- `server/src/routes/auth.ts` — register route
- `server/src/server.ts` — mount auth router

**Blocked by:** Issue 1

---

### Issue 3: Login endpoint + auth middleware

**What:** `POST /api/auth/login` — verify credentials, return token. Create reusable Express middleware that checks the token on protected routes.

**Parent:** Workstream 1

**Files to create/modify:**
- `server/src/routes/auth.ts` — add login route
- `server/src/middleware/auth.ts` — token verification middleware

**Blocked by:** Issue 2

---

### Issue 4: Leaderboard model & top scores endpoint

**What:** `GET /api/leaderboard` — returns top N players globally. `Score` can be a new collection or embedded in User. Decide whether to track all-time best score or cumulative.

**Parent:** Workstream 1

**Files to create/modify:**
- `server/src/models/Score.ts` or extend User schema
- `server/src/routes/leaderboard.ts` — leaderboard route
- `server/src/server.ts` — mount leaderboard router

**Blocked by:** Issue 1

---

### Issue 5: Save score after each game

**What:** When a game ends on the server, send the final scores to the leaderboard API. Only saves for logged-in users (anonymous players skip).

**Parent:** Workstream 1

**Files to modify:**
- `server/src/game/roomController.ts` — in `endGame`, emit scores to leaderboard
- `server/src/routes/leaderboard.ts` — add score submission endpoint

**Blocked by:** Issue 3, Issue 4

---

### Issue 6: Login UI in the join screen

**What:** Add a login/register form on the JoinGameForm page (toggle between "Play as Guest" and "Login"). Store the token in localStorage. Attach player name from account when joining.

**Parent:** Workstream 1

**Files to create/modify:**
- `client/src/components/AuthForm.tsx` — new login/register component
- `client/src/components/JoinGameForm.tsx` — integrate auth toggle
- `client/src/hooks/useAuth.ts` — auth state hook

**Blocked by:** Issue 3

---

## Workstream 2 — Doodle-style UI Redesign

### Issue A: Design token palette

**What:** Define the doodle theme's CSS custom properties in `index.css` — paper textures (`#f5f0e8` warm off-white), sketchy border colors, loose shadow styles. Choose a hand-drawn font (e.g. `"Gaegu"`, `"Caveat"`, or `"Patrick Hand"` from Google Fonts). Add the font via `index.html`.

**Parent:** Workstream 2

**Files to modify:**
- `client/src/index.css` — CSS custom properties
- `client/index.html` — Google Fonts link
- `client/tailwind.config.js` — extend theme with doodle tokens

**Blocked by:** None — can start immediately

---

### Issue B: Skinnify Button, Select, Input, Dialog components

**What:** Rework `ui/Button.tsx`, `ui/Select.tsx`, `ui/Dialog.tsx`, `ui/CustomWordsInput.tsx` — sketchy borders (dashed/zigzag), rounded hand-drawn feel, crayon-like color fills. Use the tokens from Issue A.

**Parent:** Workstream 2

**Files to modify:**
- `client/src/components/ui/Button.tsx`
- `client/src/components/ui/Select.tsx`
- `client/src/components/ui/Dialog.tsx`
- `client/src/components/ui/CustomWordsInput.tsx`

**Blocked by:** Issue A

---

### Issue C: Skinnify the canvas toolbar & color palette

**What:** Rework `Toolbar.tsx` + `LineWidthSelector.tsx` — hand-drawn icons for undo/clear, paint-swatch-style color grid, rough line-width picker.

**Parent:** Workstream 2

**Files to modify:**
- `client/src/components/Toolbar.tsx`
- `client/src/components/Toolbar/LineWidthSelector.tsx`

**Blocked by:** Issue A

---

### Issue D: Skinnify player cards & scores

**What:** Rework `PlayerCard.tsx`, `PlayerScores.tsx` — paper-strip player list, hand-drawn crowns/mute icons, sketchy score badges.

**Parent:** Workstream 2

**Files to modify:**
- `client/src/components/Player/PlayerCard.tsx`
- `client/src/components/PlayerScores.tsx`

**Blocked by:** Issue A

---

### Issue E: Skinnify overlays (word select, winners, choosing word)

**What:** Rework `WordSelector.tsx`, `Winners.tsx`, `ChoosingWord.tsx`, `OverlayContent.tsx` — doodle-style word buttons, sketchy leaderboard, paper backgrounds.

**Parent:** Workstream 2

**Files to modify:**
- `client/src/components/Overlay/WordSelector.tsx`
- `client/src/components/Overlay/Winners.tsx`
- `client/src/components/Overlay/ChoosingWord.tsx`
- `client/src/components/OverlayContent.tsx`

**Blocked by:** Issue A

---

### Issue F: Skinnify the header, chat, and join form

**What:** Rework `Header.tsx`, `Chat.tsx`, `Message.tsx`, `JoinGameForm.tsx` — hand-drawn timer, guess input as a doodle speech bubble, chat bubbles with sketchy borders, join form as a notebook card.

**Parent:** Workstream 2

**Files to modify:**
- `client/src/components/Header.tsx`
- `client/src/components/Chat.tsx`
- `client/src/components/Chat/Message.tsx`
- `client/src/components/JoinGameForm.tsx`

**Blocked by:** Issue A

---

### Issue G: Canvas stroke style to hand-drawn feel

**What:** On the `<canvas>`, add slight roughness/jitter to lines or use a brush-like stroke. Could use a library like `roughjs` or implement a simple perturbation on draw points.

**Parent:** Workstream 2

**Files to modify:**
- `client/src/components/GameCanvas.tsx`

**Blocked by:** None — can start immediately (independent of other UI issues)

---

## Dependency Graph

```
Workstream 1:
  1 ──→ 2 ──→ 3 ──→ 5
  1 ──→ 4 ──────────→ 5
  2 ──→ 3 ──→ 6

Workstream 2:
  A ──→ B, C, D, E, F
  G (independent)
```

Both workstreams are fully independent of each other — they can be parallelized.

---

## Workstream 3 — TypeScript → JavaScript Refactor

### Issue 3.1: Server-side TS → JS

**What:** Convert all `.ts` files in `server/src/` to `.js`. Remove type annotations, interfaces, enums (convert to plain objects/constants), and type imports. Update `package.json` scripts — replace `ts-node-dev` with `node` + `nodemon` (or `node --watch` on Node 18+). Remove `tsconfig.json` and TypeScript dev dependencies.

**Parent:** Workstream 3

**Files to modify (representative — full list in directory):**
- `server/src/server.ts` → `.js`
- `server/src/socket/socketHandlers.ts` → `.js`
- `server/src/game/gameController.ts` → `.js`
- `server/src/game/roomController.ts` → `.js`
- `server/src/utils/*.ts` → `.js`
- `server/src/constants.ts` → `.js`
- `server/src/types/index.ts` → delete (move enums to relevant files as const objects)
- `server/package.json` — update scripts & dependencies
- `server/tsconfig.json` — delete

**Blocked by:** None — can start immediately

---

### Issue 3.2: Client-side TS/TSX → JS/JSX

**What:** Convert all `.tsx` → `.jsx` and `.ts` → `.js` files in `client/src/`. Remove type annotations, interfaces, enums (convert to plain objects), and type imports. Update Vite config to plain JS (`vite.config.ts` → `vite.config.js`). Remove tsconfig files and TypeScript dev dependencies.

**Parent:** Workstream 3

**Files to modify (representative — full list in directory):**
- `client/src/App.tsx` → `.jsx`
- `client/src/main.tsx` → `.jsx`
- `client/src/socketHandler.ts` → `.js`
- `client/src/components/*.tsx` → `.jsx`
- `client/src/components/**/*.tsx` → `.jsx`
- `client/src/context/*.tsx` → `.jsx`
- `client/src/hooks/*.ts` → `.js`
- `client/src/types/index.ts` → delete (move enums to relevant files as const objects)
- `client/vite.config.ts` → `.js`
- `client/tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` — delete
- `client/package.json` — update dependencies
- `client/eslint.config.js` — remove `typescript-eslint` plugin

**Blocked by:** None — can start immediately (parallel with 3.1)

---

### Dependency Graph (full)

```
Workstream 1:
  1 ──→ 2 ──→ 3 ──→ 5
  1 ──→ 4 ──────────→ 5
  2 ──→ 3 ──→ 6

Workstream 2:
  A ──→ B, C, D, E, F
  G (independent)

Workstream 3:
  3.1 (independent)
  3.2 (independent)

All three workstreams are independent of each other — maximum parallelism.
```
