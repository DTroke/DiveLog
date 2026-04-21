# Build Checklist

## Build Preferences

- **Build mode:** Step-by-step
- **Comprehension checks:** Yes
- **Git:** Commit after each item with message: "Complete step N: [title]"
- **Verification:** Yes — learner runs the app and confirms after each item before moving on
- **Check-in cadence:** Balanced — enough explanation to understand what was built, not so much it slows down

## Checklist

- [x] **1. Project Setup**
  Spec ref: `spec.md > Stack` and `spec.md > Runtime & Deployment`
  What to build: Scaffold a new React + Vite project. Install all dependencies: React Router v6, Tailwind CSS v3, Supabase JS client, React-Leaflet v5, and Leaflet 1.9.4. Set up `tailwind.config.js` and `vite.config.js`. Create `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` placeholders. Create `src/lib/supabase.js` to initialize the Supabase client. Add `.env.local` to `.gitignore`. Confirm the dev server starts and the default Vite page loads.
  Acceptance: `npm run dev` runs without errors. Browser opens to `http://localhost:5173` and shows a page. All packages are installed with no dependency errors.
  Verify: Run `npm run dev` and confirm the browser loads without errors in the console.

- [x] **2. Database Schema + Creature Seed Data**
  Spec ref: `spec.md > Data Model` and `spec.md > Creature Catalog Seed Data`
  What to build: Create `supabase/migrations/001_initial_schema.sql` with all 5 table definitions: `profiles`, `dives`, `dive_photos`, `creatures`, `dive_creatures`. Run the migration in Supabase. Create `src/data/creatures.js` with a hardcoded array of 60 pre-built sea species (id, name, description, image_url — source images from iNaturalist public domain URLs). Write a seed script or SQL insert to populate the `creatures` table with these 60 species.
  Acceptance: All 5 tables exist in Supabase dashboard. The `creatures` table has 60 rows visible in the Supabase table editor. No SQL errors on migration run.
  Verify: Open Supabase dashboard → Table Editor → confirm all 5 tables exist and `creatures` has 60 rows.

- [x] **3. Auth — Login & Signup**
  Spec ref: `spec.md > Auth`
  What to build: Build `AuthPage.jsx` with two sub-components: `LoginForm.jsx` (email + password, calls `supabase.auth.signInWithPassword()`) and `SignupForm.jsx` (name, email, password, calls `supabase.auth.signUp()` then inserts a row into `profiles`). In `App.jsx`, check for an active Supabase session on load — if no session show `AuthPage`, if session exists show the main app (placeholder for now). Session should persist across browser refreshes.
  Acceptance: A new user can sign up with name, email, and password. After signup, they land on the main app placeholder. A returning user can log in and land on the same place. Refreshing the browser keeps the user logged in. A new row appears in Supabase `profiles` table after signup.
  Verify: Sign up with a new email → confirm you land on the main app. Refresh the browser → confirm you're still logged in. Open Supabase → `profiles` table → confirm a row exists with your user ID.

- [x] **4. Navigation Shell — 4-Tab Layout**
  Spec ref: `spec.md > Navigation`
  What to build: Build `BottomNav.jsx` — a fixed bottom tab bar with 4 tabs: Dive Log, Pokédex, Map, Profile. Active tab highlighted in teal. Dark background. Set up React Router v6 with 4 routes, each rendering a placeholder page component (`DiveLogPage.jsx`, `PokedexPage.jsx`, `MapPage.jsx`, `ProfilePage.jsx`). Each placeholder just shows the tab name as a heading. Wrap all routes with the auth gate from step 3.
  Acceptance: After login, the app shows a bottom nav bar with 4 tabs. Tapping each tab navigates to a different screen showing its name. The active tab is highlighted. Unauthenticated users can't reach any tab — they're redirected to auth.
  Verify: Log in → confirm bottom nav appears with 4 tabs. Tap each tab → confirm the screen changes. Log out and try accessing a tab URL directly → confirm you're redirected to login.

- [x] **5. Dive Log — List, Add/Edit, Detail, Delete**
  Spec ref: `spec.md > Dive Log`
  What to build: Replace `DiveLogPage.jsx` placeholder with the full dive list: fetches all dives for the logged-in user sorted by date descending, renders `DiveCard.jsx` (dive number, date, location name), and shows an "Add Dive" floating action button. Build `DiveForm.jsx` with: date picker (defaults to today), location name text input, `LocationPicker.jsx` (small Leaflet map — tap to pin or "Use my location" button), creatures multi-select (searchable, from the creatures catalog), optional photo upload (up to 3, to Supabase Storage), optional comments text area. On save: insert into `dives`, upload photos, insert `dive_creatures` rows. Build `DiveDetail.jsx` showing all dive info: dive number, date, location name, mini Leaflet map with pin, creatures spotted with thumbnails, photos, comments. Add edit (pre-populates DiveForm) and delete (confirmation dialog with re-locking warning). Implement dive number calculation in `src/lib/diveUtils.js`. Build hooks: `useDives.js`. Implement creature re-locking logic on delete in the delete handler.
  Acceptance: Can log a new dive with date, location, pin on map, creatures, and optional photo. New dive appears in the list with the correct dive number. Dive numbers are chronological — not entry order. Tapping a dive shows full detail. Edit works. Delete shows the confirmation warning, removes the dive, and recalculates numbers. If a deleted dive was the only sighting of a creature, that creature reverts to locked.
  Verify: Add 3 dives on different dates in non-chronological entry order → confirm dive numbers sort by date, not entry order. Delete a dive → confirm the list updates and numbers recalculate. Log a creature on one dive only, then delete that dive → confirm the creature is locked again in the Pokédex.

- [x] **6. Creature Pokédex + Custom Creatures**
  Spec ref: `spec.md > Creature Pokédex`
  What to build: Replace `PokedexPage.jsx` placeholder with the full Pokédex: loads all 60 pre-built creatures plus any user custom creatures, checks `dive_creatures` to determine which are unlocked, renders a 2-column grid of `CreatureCard.jsx` (image with CSS grayscale filter if locked, full color if unlocked; creature name). Progress counter at top ("X / Y creatures spotted"). Search bar filtering in real time. "Show only unlocked" toggle. Build `CreatureDetail.jsx`: locked state (silhouette, name, description, "Log a sighting" button) and unlocked state (full color image, name, description, first dive spotted with link, optional creature photo). "Log a sighting" flow: select a dive from dropdown, optional photo upload, saves to `dive_creatures`. Build `CreatureForm.jsx` for custom creatures: name (required), description (optional), photo (optional), spotted toggle (not yet spotted / already spotted with optional dive link). Custom creatures get `is_custom = true` and `user_id` in the database. Build hook: `useCreatures.js`.
  Acceptance: Pokédex grid shows all 60 species as gray silhouettes initially. After logging a dive with creatures, those creatures appear in full color. Progress counter updates. Search filters in real time. "Show only unlocked" toggle works. Tapping a locked creature shows the locked detail view. Tapping an unlocked creature shows full info including which dive. Logging a sighting from the creature screen unlocks it. Custom creatures can be added and appear only for that user.
  Verify: Log a dive with 3 creatures → open Pokédex → confirm those 3 are in full color, rest are gray silhouettes. Progress counter shows 3 / 60. Search for a creature by name → confirm it filters. Add a custom creature → confirm it appears in your catalog. Log in on a different account → confirm the custom creature doesn't appear.

- [x] **7. Dive Map**
  Spec ref: `spec.md > Dive Map`
  What to build: Replace `MapPage.jsx` placeholder with the full map screen: full-screen Leaflet map using CartoDB Dark Matter tile layer, fetches all user dives on load and places a pin at each `(latitude, longitude)`. Single dive at a location → tap pin → opens `DiveDetail.jsx`. Multiple dives at same coordinates → tap pin → shows `MultiDivePopup` listing all dives at that location → tap one to open detail. If no dives logged, show empty map with no pins.
  Acceptance: Map screen shows a dark full-screen world map. Each logged dive with coordinates appears as a pin. Tapping a single-dive pin opens that dive's detail. Tapping a pin with multiple dives shows the list. Empty state (no dives) shows just the map with no pins. Map works on mobile browser.
  Verify: Log 2 dives at different locations → open Map → confirm 2 pins appear. Tap each pin → confirm it opens the right dive detail. Log another dive at the exact same coordinates as an existing dive → tap that pin → confirm it shows the list of both dives.

- [x] **8. Profile Screen**
  Spec ref: `spec.md > Profile`
  What to build: Replace `ProfilePage.jsx` placeholder with the full profile screen: loads from `profiles` table using current user's ID. Displays: profile photo (or placeholder avatar if none set), name, personal description, certifications (shown as badges), total dives logged, total creatures spotted, and current diver level. Total dives and creatures spotted are calculated live from the database on each load. Diver level calculated from total dive count using the level table in `src/lib/levelUtils.js`. Edit button enables inline editing of all fields (photo, name, description, certifications multi-select from the PADI list). Build hook: `useProfile.js`.
  Acceptance: Profile screen shows name, description, certifications as badges, total dives, total creatures spotted, and diver level. Stats update automatically after logging new dives or creatures without needing a refresh. Edit mode allows changing all fields. Profile photo uploads and displays. Diver level changes correctly as dive count crosses thresholds.
  Verify: Open Profile → confirm your name and stats appear. Log a new dive → return to Profile → confirm total dives incremented. Edit your name → save → confirm the new name appears. Upload a profile photo → confirm it displays.

- [ ] **9. Submit Your Project to Devpost**
  Spec ref: `prd.md > What We're Building`
  What to build: First, create a GitHub repository: go to github.com, create a new public repo named "divelog", initialize git in the project folder, add the remote, and push all code (agent will walk through each command). Then connect to Vercel: go to vercel.com, import the GitHub repo, add the two environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`), deploy — Vercel gives a live HTTPS URL. Then go to the hackathon Devpost page and fill in the submission: project name (DiveLog), tagline (one punchy sentence), project story (what you built, why, what you learned — draw from scope.md and prd.md), "built with" tags (React, Vite, Tailwind CSS, Supabase, Leaflet, Vercel), screenshots (Pokédex with locked/unlocked creatures, world map with dive pins, profile screen with stats and diver level), link to the live Vercel app, link to the GitHub repo. Upload docs/ folder artifacts. Review all fields and submit.
  Acceptance: GitHub repo is public and contains all project code. Vercel app is live at an HTTPS URL and the app loads and works. Devpost submission is complete with green "Submitted" badge — project name, tagline, description, built-with tags, 3 screenshots (Pokédex, map, profile), live app link, and GitHub repo link all present.
  Verify: Open your Devpost submission page → confirm green "Submitted" badge. Click the live app link → confirm the app loads and you can log in. Click the GitHub link → confirm the repo is public and the code is there. Read the project description out loud — would someone who knows nothing about DiveLog understand what it does and why it's cool?
