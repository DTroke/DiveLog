# DiveLog — Technical Spec

## Stack

| Layer | Tool | Version | Docs |
|---|---|---|---|
| Frontend framework | React + Vite | React 18, Vite 5 | [Vite docs](https://vitejs.dev/) · [React docs](https://react.dev/) |
| Styling | Tailwind CSS | v3 | [Tailwind docs](https://tailwindcss.com/docs) |
| Auth + Database + Storage | Supabase | Latest | [Supabase docs](https://supabase.com/docs) |
| Maps | React-Leaflet + Leaflet.js | React-Leaflet v5, Leaflet 1.9.4 | [React-Leaflet docs](https://react-leaflet.js.org/) |
| Hosting | Vercel | — | [Vercel + Vite](https://vercel.com/docs/frameworks/frontend/vite) |

**Why this stack:** Supabase eliminates all backend code — it handles auth, database, and file storage in one service. React is the foundation for a future React Native (App Store) port. Tailwind CSS provides mobile-first responsive layouts with dark mode built in. Leaflet is free, open source, and mobile-friendly with no API key required.

---

## Runtime & Deployment

- **Runs in:** Mobile browser (Safari on iPhone, Chrome on Android) and desktop browser
- **Deployment:** Vercel — connects to GitHub repo, auto-deploys on every push, provides a live HTTPS URL
- **Local development:** `npm run dev` → runs at `http://localhost:5173`
- **Environment requirements:**
  - Node.js 18+
  - `.env.local` file with two variables (never committed to git):
    ```
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    ```
- **App Store path (future):** The Supabase backend stays 100% as-is. Only the React frontend would be rebuilt in React Native. No data migration needed.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  React App (Vite)                   │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Auth     │  │ Pages    │  │ Components       │  │
│  │ Gate     │  │ (4 tabs) │  │ (UI building     │  │
│  │          │  │          │  │  blocks)         │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│                     │                               │
│              ┌──────────────┐                       │
│              │  Hooks       │                       │
│              │  (data layer)│                       │
│              └──────┬───────┘                       │
└─────────────────────┼───────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │        Supabase        │
         │                        │
         │  ┌─────┐ ┌──────────┐  │
         │  │Auth │ │PostgreSQL│  │
         │  │     │ │Database  │  │
         │  └─────┘ └──────────┘  │
         │         ┌──────────┐   │
         │         │ Storage  │   │
         │         │(photos)  │   │
         │         └──────────┘   │
         └────────────────────────┘
```

**Data flow summary:** React pages display data. Hooks fetch and write data to Supabase. Supabase stores everything. Photos go to Supabase Storage; URLs are saved in the database. All data is tagged with the logged-in user's ID so it persists across devices.

---

## Auth

Implements `prd.md > Onboarding & Account`

### Auth Gate (App.jsx)
- On app load, check if a Supabase session exists
- If no session → show `AuthPage.jsx` (login/signup)
- If session exists → show the main app (4-tab layout)
- Session persists automatically across browser restarts

### Signup Flow
- `SignupForm.jsx` collects: name, email, password
- Calls `supabase.auth.signUp()` → Supabase creates the user
- After signup, immediately creates a matching row in the `profiles` table
- Redirects to main app on success

### Login Flow
- `LoginForm.jsx` collects: email + password
- Calls `supabase.auth.signInWithPassword()`
- On success, Supabase session is set → App.jsx routes to main app
- All previously saved dives, creatures, and profile data load automatically

### Auth Docs
- [Supabase Auth + React quickstart](https://supabase.com/docs/guides/auth/quickstarts/react)

---

## Navigation

### Bottom Tab Bar (BottomNav.jsx)
- Fixed to bottom of screen on mobile
- 4 tabs: Dive Log · Pokédex · Map · Profile
- Active tab highlighted in teal
- Dark background to match ocean design theme

### Routing
- Use React Router v6 with 4 routes matching the 4 tabs
- Auth gate wraps all routes — unauthenticated users always land on AuthPage

---

## Dive Log

Implements `prd.md > Dive Log`

### Dive List Screen (DiveLogPage.jsx)
- Fetches all dives for the logged-in user from Supabase, sorted by date descending
- Renders a list of `DiveCard.jsx` components
- Each card shows: dive number, date, location name
- "Add Dive" floating action button in the bottom-right corner
- Dive numbers are **calculated at render time** — dives are ordered by date and numbered 1, 2, 3... No stored dive number field

### Add/Edit Dive Form (DiveForm.jsx)
Fields:
- **Date:** date picker, defaults to today
- **Location name:** text input (e.g. "Cozumel, Mexico")
- **Location pin:** `LocationPicker.jsx` — small Leaflet map, user taps to drop a pin OR hits "Use my location" (browser geolocation). Stores `latitude` and `longitude`.
- **Creatures spotted:** searchable multi-select from the creatures catalog. Filtered in real time as user types.
- **Photos:** optional file upload (up to 3), uploaded to Supabase Storage
- **Comments:** optional text area

On save:
1. Insert dive record into `dives` table
2. Upload any photos to Supabase Storage → save URLs
3. Insert rows into `dive_creatures` for each selected creature
4. Navigate back to dive list — new dive appears, Pokédex unlocks update

### Dive Detail View (DiveDetail.jsx)
- Shows: dive number, date, location name, mini Leaflet map with pin, creatures spotted (with thumbnails), photos (if any), comments (if any)
- Edit button → opens DiveForm pre-populated with existing data
- Delete button → shows confirmation dialog

### Delete Dive
Confirmation message: *"Are you sure you want to delete this dive? Any creatures only spotted on this dive will be locked again."*

On confirm:
1. Delete all `dive_creatures` rows for this dive
2. Delete the dive record
3. Dive numbers recalculate on next list render (no stored numbers to update)
4. Re-check which creatures are still unlocked — creatures with zero remaining sightings revert to silhouette

### Dive Number Calculation (diveUtils.js)
```
Sort all user dives by date ascending → assign index + 1 as dive number
```
Called wherever dive numbers are displayed. Never stored in the database.

---

## Creature Pokédex

Implements `prd.md > Creature Pokédex`

### Pokédex Screen (PokedexPage.jsx)
- Loads full creature catalog (60 pre-built species from `creatures.js` + any custom creatures from database)
- Loads all `dive_creatures` records for the user to determine which creatures are unlocked
- Renders a 2-column grid of `CreatureCard.jsx` components
- Progress counter at top: "X / Y creatures spotted"
- Search bar: filters visible creatures in real time
- "Show only unlocked" toggle: hides locked creatures

### Creature Card (CreatureCard.jsx)
- Shows creature image + name
- **Locked:** CSS filter `grayscale(100%) brightness(0.3)` applied to image → dark silhouette
- **Unlocked:** no filter → full color image
- Tap → opens `CreatureDetail.jsx`

### Creature Detail View (CreatureDetail.jsx)
- **Locked:** silhouette image, name, description, "Log a sighting" button
- **Unlocked:** full color image, name, description, first dive spotted (with link to dive detail), optional creature photo
- "Log a sighting" button → opens sighting form: select a dive from dropdown, optional photo upload

### Unlock Mechanic
A creature is unlocked if there exists at least one row in `dive_creatures` where `creature_id` matches and the linked dive belongs to the current user. Checked at query time — not stored.

### Custom Creature Form (CreatureForm.jsx)
Fields: name (required), description (optional), photo (optional), spotted status toggle:
- **"Not yet spotted"** → creature added to catalog as locked silhouette
- **"Already spotted"** → creature added as unlocked; optionally link to a specific dive from dropdown (if linked, shows "first spotted on Dive #X"; if not linked, shows as unlocked with no dive reference)

Custom creatures have `is_custom = true` and `user_id` set in the database — they appear only in that user's catalog.

### Creature Catalog Seed Data (data/creatures.js)
- 60 pre-built species, hardcoded as a JS array
- Each entry: `{ id, name, description, image_url }`
- Images sourced from [iNaturalist](https://www.inaturalist.org/) (public domain)
- Loaded into Supabase `creatures` table via a seed script at setup

---

## Dive Map

Implements `prd.md > Dive Map`

### Map Screen (MapPage.jsx)
- Full-screen Leaflet map, world view, dark tile layer (matches app theme)
- On load: fetches all user dives → places a pin at each `(latitude, longitude)`
- If no dives logged: empty map, no pins
- Dark map tile suggestion: [CartoDB Dark Matter tiles](https://github.com/CartoDB/basemap-styles) (free, no API key)

### Map Pin Behavior
- Single dive at location → tap pin → opens `DiveDetail.jsx`
- Multiple dives at same coordinates → tap pin → shows list of dives at that location → tap one to open detail

### Location Picker (LocationPicker.jsx)
- Used inside `DiveForm.jsx`
- Small Leaflet map (not full screen)
- "Use my location" button calls `navigator.geolocation.getCurrentPosition()`
  - If denied: falls back gracefully — map stays interactive, user taps manually to place pin
- Tap anywhere on map → places draggable pin → saves `latitude`, `longitude` to form state

---

## Profile

Implements `prd.md > Profile`

### Profile Screen (ProfilePage.jsx)
- Loads from `profiles` table using current user's ID
- Displays: profile photo (or placeholder), name, personal description, certifications, total dives, creatures spotted count, diver level
- Edit button → inline editing of all fields
- Stats (total dives, creatures spotted) are **calculated live** from the database on each load

### Diver Level Calculation (levelUtils.js)
```
0–9     → Newcomer
10–24   → Explorer
25–49   → Adventurer
50–99   → Intermediate
100–199 → Intermediate High
200–499 → Advanced
500–999 → Pro
1000+   → Expert
```
Calculated from total dive count. Displayed on profile screen.

### Certifications
- Multi-select from the official PADI list
- Stored as a JSON array in the `profiles` table
- Displayed as badges on the profile screen

**PADI Certification List:** Scuba Diver, Open Water Diver, Advanced Open Water Diver, Rescue Diver, Master Scuba Diver, Divemaster, Assistant Instructor, Open Water Scuba Instructor, Master Scuba Diver Trainer, IDC Staff Instructor, Master Instructor, Course Director

---

## Data Model

### Table: profiles
| Column | Type | Notes |
|---|---|---|
| user_id | uuid | FK → auth.users, primary key |
| name | text | |
| description | text | nullable |
| photo_url | text | nullable — points to Supabase Storage |
| certifications | jsonb | array of certification strings |
| created_at | timestamptz | auto |

### Table: dives
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | FK → auth.users |
| date | date | used for chronological ordering + dive number calc |
| location_name | text | typed by user |
| latitude | float8 | from map pin |
| longitude | float8 | from map pin |
| comments | text | nullable |
| created_at | timestamptz | auto |

### Table: dive_photos
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| dive_id | uuid | FK → dives |
| photo_url | text | points to Supabase Storage |

### Table: creatures
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| name | text | |
| description | text | |
| image_url | text | points to Supabase Storage or iNaturalist CDN |
| is_custom | boolean | false for pre-built, true for user-added |
| user_id | uuid | null for pre-built; FK → auth.users for custom |

### Table: dive_creatures
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| dive_id | uuid | FK → dives |
| creature_id | uuid | FK → creatures |
| creature_photo_url | text | nullable — optional photo of this sighting |

**Unlock query:** A creature is unlocked for a user if `dive_creatures` contains at least one row where `creature_id` matches and the linked dive's `user_id` matches the current user.

---

## File Structure

```
divelog/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx       # Email + password login
│   │   │   └── SignupForm.jsx      # New account creation
│   │   ├── dives/
│   │   │   ├── DiveCard.jsx        # Single row in dive list
│   │   │   ├── DiveForm.jsx        # Add/Edit dive form
│   │   │   └── DiveDetail.jsx      # Full dive detail view
│   │   ├── creatures/
│   │   │   ├── CreatureCard.jsx    # Single card in Pokédex grid
│   │   │   ├── CreatureDetail.jsx  # Creature info + unlock state
│   │   │   └── CreatureForm.jsx    # Add custom creature
│   │   ├── map/
│   │   │   ├── DiveMap.jsx         # Full-screen map tab
│   │   │   └── LocationPicker.jsx  # Mini map in dive form
│   │   ├── profile/
│   │   │   └── ProfileScreen.jsx   # Profile display + edit
│   │   └── ui/
│   │       ├── BottomNav.jsx       # 4-tab navigation bar
│   │       ├── Button.jsx          # Reusable button component
│   │       └── LoadingSpinner.jsx  # Loading state
│   ├── pages/
│   │   ├── AuthPage.jsx            # Login/signup screen
│   │   ├── DiveLogPage.jsx         # Dive list + add button
│   │   ├── PokedexPage.jsx         # Creature grid + search
│   │   ├── MapPage.jsx             # Full-screen map
│   │   └── ProfilePage.jsx         # Profile + stats
│   ├── lib/
│   │   ├── supabase.js             # Supabase client init (reads .env)
│   │   ├── diveUtils.js            # Dive number calculation
│   │   └── levelUtils.js           # Diver level lookup table
│   ├── hooks/
│   │   ├── useDives.js             # Fetch/create/update/delete dives
│   │   ├── useCreatures.js         # Catalog load + unlock checking
│   │   └── useProfile.js           # Profile fetch + update
│   ├── data/
│   │   └── creatures.js            # Pre-built catalog: 60 species
│   ├── App.jsx                     # Root: auth gate + routing
│   └── main.jsx                    # Entry point
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # All table definitions
├── docs/                           # Hackathon artifacts
├── process-notes.md
├── .env.local                      # Supabase keys — never commit
├── .gitignore                      # Must include .env.local
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Key Technical Decisions

### 1. Supabase over custom backend
**Decision:** Use Supabase for auth, database, and file storage instead of writing a backend.
**Why:** Juan is a beginner — writing a Node.js/Express backend would consume the entire build window. Supabase handles all of it with a client library. Zero backend code needed.
**Tradeoff:** Slight vendor dependency, but free tier is generous and Supabase is well-maintained.

### 2. CSS filter for silhouette effect
**Decision:** Apply `grayscale(100%) brightness(0.3)` CSS to locked creature images rather than storing separate silhouette images.
**Why:** Halves the storage requirement, simpler to maintain, and the visual effect is identical.
**Tradeoff:** Slightly less artistic control over the locked appearance compared to hand-crafted silhouettes.

### 3. Dive numbers calculated at render, not stored
**Decision:** Dive numbers are computed by sorting dives by date and assigning index position — not stored in the database.
**Why:** Eliminates an entire class of bugs around keeping a stored number in sync after edits and deletions. Any time dives are displayed, the numbers are always correct.
**Tradeoff:** Slight computation on every render, negligible at this scale.

### 4. Custom creatures: spotted toggle
**Decision:** When adding a custom creature, the user chooses "not yet spotted" or "already spotted" (with optional dive link) rather than going through the full dive logging flow.
**Why:** Juan identified during /spec that users might add a creature to their personal catalog before or after spotting it. The toggle handles both cases cleanly without forcing a dive association.
**Tradeoff:** Creatures marked "already spotted" without a dive link won't show "first spotted on Dive #X" in the detail view.

---

## Dependencies & External Services

| Service | Purpose | Free Tier | Docs |
|---|---|---|---|
| [Supabase](https://supabase.com) | Auth + database + file storage | 500MB DB, 1GB storage, 50K users | [Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs) |
| [React-Leaflet](https://react-leaflet.js.org/) | Interactive maps | Free, open source | [Docs](https://react-leaflet.js.org/) |
| [CartoDB Dark Matter](https://github.com/CartoDB/basemap-styles) | Dark map tiles | Free, no API key | Tile URL in repo README |
| [iNaturalist](https://www.inaturalist.org/) | Creature images (public domain) | Free | [API docs](https://api.inaturalist.org/v1/docs/) |
| [Vercel](https://vercel.com) | Hosting + live URL | Free (Hobby tier) | [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) |

**API keys needed:**
- `VITE_SUPABASE_URL` — from Supabase project settings
- `VITE_SUPABASE_ANON_KEY` — from Supabase project settings
- No other keys required (Leaflet and CartoDB tiles need no key)

---

## Open Issues

### 1. Photo storage on free tier
Supabase Storage free tier: 1GB. For a personal dive log this is generous. However if Juan ever scales this to many users, photo storage will be the first cost. Flag at build time — not a blocker for MVP.

### 2. Geolocation permission denied
If the user denies location access in the browser, "Use my location" silently fails and the map stays interactive for manual pin placement. This fallback should be tested during build.

### 3. Creature catalog image sourcing
60 creature images need to be sourced from iNaturalist and either uploaded to Supabase Storage or referenced directly by URL. This is a content task during build — not a technical risk, but it takes time. If time is short, start with 20–30 species and expand post-hackathon.

### 4. Multiple dives at same coordinates
The PRD specifies a list view when multiple dives share a pin. This is a minor UI component (`MultiDivePopup`) not explicitly in the file structure above — add it to `src/components/map/` during build.

### 5. Creature re-locking on dive deletion
When a dive is deleted, the app must re-check whether any creatures were spotted *only* on that dive and revert them to locked. The logic: after deleting `dive_creatures` rows for the deleted dive, query for creatures that now have zero sightings for this user. Implement in `useDives.js` delete handler.
