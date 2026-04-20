# Process Notes

## /scope

**How the idea evolved:** Juan arrived with a semi-formed idea — a "sea creature Pokédex" for divers. Through conversation it expanded into a full three-module app (dive log, creature tracker, map view) and briefly into a full social network (Strava for divers). The core unlock mechanic (gray silhouette → full color) emerged organically from Juan, not from prompting — it's the strongest differentiator in the product.

**Pushback received:** Scope was challenged directly when the social layer grew to include FYP, following feeds, and privacy settings. Juan accepted the cut quickly and cleanly — "I think we can work on it right now without considering the social layer." Good instinct. No resistance.

**References that resonated:** Depth (closest existing app, but missing creature logs), Strava (social layer vision for v2), Pokémon Pokédex (gamification frame — Juan arrived with this analogy and it stuck).

**Deepening rounds:** One deepening round after mandatory questions — asked about design vibe. Juan: dark, minimal, clean, not oversaturated. Materially improved the scope doc's design direction section.

**Active shaping:** Juan drove the direction strongly. The unlock mechanic was entirely his idea ("like when you haven't unlocked a character in a video game"). The Strava comparison was his. The social layer expansion was his. The cut of the social layer was also his decision, made quickly and confidently. He was not passive — every major product decision came from him.

## /prd

**Key additions vs scope doc:** Juan introduced a full account/auth system (email + password, cross-device sync) — not in the scope doc. The Profile module was also new — scope had 3 modules (dive log, Pokédex, map), Juan added Profile as a 4th. Profile grew substantially: photo, description, certifications (multi-select PADI list), diver level progression system, and auto-calculated stats.

**What surprised him:** The dive number edge case (logging an old dive that conflicts with existing numbers) — Juan caught this himself before being asked and proposed the right solution (chronological renumbering). Also the creature re-locking on dive deletion — he immediately proposed the confirmation warning without prompting.

**Diver level naming:** Juan rejected his own initial names and went through a collaborative naming process. Chose Adventure/Discovery direction. Changed "Pro Expert" to just "Expert" on his own initiative.

**Scope guard moments:** Auth/account system added without pushback — Juan considered it essential for a real product ("linked to your DiveLog account"). Creature type filtering was discussed; Juan chose to defer it to v2 on agent recommendation. Photo storage flagged as an open question.

**Deepening rounds:** One deepening round. Surfaced: cross-device data persistence → led to full account system requirement. Creature catalog editability → custom creature feature defined. Dive list card design. Map pin tap behavior. Submission "wow moment" identification (creature unlock + map/dive log combination).

**Active shaping:** Juan was highly active throughout. He proposed the 4-module structure unprompted. He caught the dive number conflict edge case himself. He proposed the creature re-locking warning on deletion himself. He pushed back on the level names he'd originally suggested and drove the renaming process. The certifications list came entirely from his research. He was not passive — every major decision was his.

## /spec

*(in progress)*

## /build

### Step 4: Navigation Shell — 4-Tab Layout

- Built BottomNav.jsx (fixed bottom tab bar, 4 tabs, teal active highlight, dark bg) and 4 placeholder page components (DiveLogPage, PokedexPage, MapPage, ProfilePage).
- Rewrote App.jsx to wrap BrowserRouter inside the session check — routes only exist when logged in, providing structural auth protection.
- Added catch-all route `<Navigate to="/log" />` so any unknown path lands on Dive Log.
- Logout button added to ProfilePage placeholder (removed in step 3 cleanup, restored here — will be replaced properly in step 8).
- Verification: Juan confirmed 4 tabs visible, tab switching works, active tab highlighted teal. Auth redirect test was done while logged in (correctly showed Pokédex tab — redirect only fires when logged out).
- Comprehension check: "Why does BrowserRouter live inside the session check?" — Juan answered correctly: routes don't exist until logged in. First try.


### Step 3: Auth — Login & Signup

- Built AuthPage.jsx, LoginForm.jsx, SignupForm.jsx, rewrote App.jsx with auth gate and session spinner.
- Bug encountered: profiles row wasn't being inserted after signup. Root cause: email confirmation is enabled in Supabase, so the auth session doesn't exist at signup time — the insert was getting blocked by RLS.
- Fix: moved profile creation to the `onAuthStateChange` handler in App.jsx (fires on SIGNED_IN event, after email confirmation). Used upsert with ignoreDuplicates so it's safe to fire multiple times. Name passed via Supabase user_metadata at signup time.
- Juan noticed the missing profiles row himself during verification — good catch, active engagement.
- Juan chose to keep email confirmation on ("I think it's important") — correct instinct for a real product. Signup form now shows a teal "Check your email" message instead of an error.
- Second bug: even after fix, upsert from JS client was failing silently (RLS blocked it). Root cause: `using`-only RLS policy doesn't reliably cover INSERT from the JS client. Fix: database trigger (`handle_new_user`) that auto-creates the profile row on auth.users insert — runs as security definer, bypasses RLS entirely. Trigger saved in 003_profile_trigger.sql.
- Backfill SQL used to create the row for Juan's existing account. Row appeared with correct user_id; name was empty (account predates name-in-metadata fix) — acceptable, will be filled in via Profile screen in Step 8.
- Comprehension check: Juan answered correctly — getSession() is async, spinner prevents flashing wrong screen.

### Step 2: Database Schema + Creature Seed Data

- Created supabase/migrations/001_initial_schema.sql with all 5 tables: profiles, dives, dive_photos, creatures, dive_creatures. Includes Row Level Security policies.
- Created supabase/migrations/002_seed_creatures.sql with 60 marine species (no hardcoded UUIDs — let Supabase generate them).
- Created src/data/creatures.js with matching 60-species array for frontend use.
- Supabase account created fresh during this step — Juan had no prior account or GitHub. Signed up via email.
- First SQL run (001) succeeded immediately. Second SQL run (002) had a syntax error on first attempt due to escaped single quotes in terminal output copy-paste; fixed by simplifying the insert to remove apostrophes in descriptions.
- Learner verification: Table Editor confirmed 60 records in creatures table. All 5 tables visible.
- Juan asked if more creatures can be added post-launch — confirmed yes, both via SQL and via the custom creature feature in the app.

### Step 1: Project Setup

- Scaffolded React + Vite (React 19, Vite 8). Node.js v24 was not installed — learner installed it via nodejs.org installer.
- Installed: react-router-dom@6, @supabase/supabase-js, tailwindcss@3, @tailwindcss/vite, react-leaflet@5, leaflet@1.9.4. Used --legacy-peer-deps due to react-leaflet@4 peer conflict with React 19; resolved by upgrading to react-leaflet@5.
- Created src/lib/supabase.js (Supabase client init from env vars).
- Created .env.local with placeholder keys (covered by *.local in .gitignore).
- Tailwind configured via @tailwindcss/vite plugin (v4-style, no tailwind.config.js needed).
- Dev server confirmed running at http://localhost:5173 (HTTP 200).
- Git initialized and first commit made.

## /checklist

**Sequencing decisions:** Auth-first was Juan's instinct and correct — he immediately identified that the account system is the foundation everything links to. Full sequence: project setup → database schema → auth → navigation shell → dive log → Pokédex → map → profile → Devpost. Leaflet map placed in step 5 (Dive Log) deliberately — earliest point it appears, maximizes time to adapt if it causes trouble.

**Methodology preferences:** Step-by-step mode. Comprehension checks: yes (Juan wants to learn, not just ship). Verification: yes after each item. Check-in cadence: balanced (enough explanation, not so much it slows down). Git: commit after each item.

**Items and estimated time:** 9 items, estimated 20-30 minutes each. Total build time: 3-4 hours. Juan confirmed "it's good" on the item count.

**Confidence vs guidance:** Juan immediately knew auth came first and had solid sequencing instinct. He needed the agent to fill in the dependency reasoning (why database before auth, why dive log before Pokédex). He accepted the proposed sequence without pushback once the logic was explained.

**Submission planning:** Three "wow moments" identified by Juan: Pokédex grid with locked/unlocked creatures, world map with pins, profile screen with stats and diver level. Core story: personal app built by an actual diver who wanted this for himself. No GitHub repo yet — Juan doesn't know what GitHub is; full walkthrough included in the submission step.

**Deepening rounds:** Zero. Juan moved efficiently through all questions and agreed the 9-item plan was solid. No refinement rounds needed — the spec was detailed enough that the checklist translated directly.

## /onboard

**Technical experience:** Beginner. Has shipped real software using Lovable and ChatGPT but entirely through UI/prompts — no direct code editing. Strong domain knowledge (business admin, quotation logic) but no programming background.

**Learning goals:** Write real specs, direct AI builds, understand the output, build a repeatable process he can turn into a business.

**Creative sensibility:** Outdoor adventurer (scuba, mountain biking), GTA fan, strong entrepreneurial filter. Likely prefers clean functional UI. Everything is evaluated through "can I sell this?"

**Prior SDD experience:** Solid. Planned a complex paper packaging quotation system upfront — machine-specific logic, pricing databases, cost modeling. Has felt the pain of missing info mid-build. Understands value of planning but hasn't done it in a formal/structured way before.

**Energy and engagement:** High motivation, clear goals, honest self-assessment. Knows what he doesn't know. Good candidate for learning — will respond well to practical framing and business-relevant examples.
