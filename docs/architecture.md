# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep React components focused on presentation and use the shared API client for requests. Each capability should show loading, empty, and accessible error states.
- Logic tier decision: Implement capability behavior in backend services behind the existing Express routes. Validate request data and return deliberate 4xx responses for invalid inputs or missing records.
- Data tier decision: Add required fields and defaults to the existing Mongoose models. Preserve idempotent seeding and existing unrelated records.
- Activity tracking approach: Validate activity fields and well-formed IDs for existing users and teams; compute points and `occurredAt` on the server.
- Team management approach: Create and list teams with their submitted names, mascots, and members; reject a missing name with `400`.
- Leaderboard approach: Sum activity points per team, sort highest first, and assign 1-based ranks.
- Workout suggestions approach: Find the user by email and recommend a workout whose focus reflects their goal or recent activity, with an explanatory reason; return a 4xx for an unknown email.

Implement in dependency order: complete and test model validation first, implement and test the API services next, then connect the presentation components and verify their loading, empty, and error states.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` (last run: 4 failures for missing required model validation; the idempotent seed test passed).
- API command: `npm run test:api --prefix octofit-tracker/backend` (last run: 4 failures covering activity/team creation, leaderboard ranking, and workout suggestions).
- Frontend command: `npm test --prefix octofit-tracker/frontend` (last run: 15 failures covering data rendering, request behavior, loading, empty, and accessible error states).
- Backend build command: `npm run build --prefix octofit-tracker/backend` (not run).
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` (not run).
##TESTT
