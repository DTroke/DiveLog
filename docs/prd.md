# DiveLog — Product Requirements

## Problem Statement

Scuba divers have no good way to track their dives, the sea creatures they've encountered, and the places they've explored in one unified app. Existing apps either have a dive log without a creature collection mechanic, or a species list without the gamified "unlock" moment that makes completion satisfying. DiveLog combines all three — log, Pokédex, and map — into a personal tracker that makes every dive feel like progress.

---

## User Stories

### Epic: Onboarding & Account

- As a new diver opening DiveLog for the first time, I want to create an account with my email so that my data is saved to my account and accessible from any device.
  - [ ] First-launch screen prompts user to sign up with name, email, and password
  - [ ] User can optionally upload a profile photo (skippable)
  - [ ] User can write a short personal description (skippable)
  - [ ] User can select all certifications that apply from the official PADI list (skippable, editable later)
  - [ ] After completing setup, user lands on the main app (Dive Log screen)
  - [ ] If user already has an account, there is a "Log in" option on the first-launch screen

- As a returning diver on a new device, I want to log in with my email and password so that all my dives, creatures, and profile are restored exactly as I left them.
  - [ ] Login screen accepts email + password
  - [ ] After login, all previously logged dives, unlocked creatures, and profile info appear correctly

### Epic: Profile

- As a diver, I want a profile screen that shows who I am and how far I've come so that I can see my progress at a glance.
  - [ ] Profile screen shows: profile photo, name, personal description, certifications, total dives logged, total creatures spotted, and current diver level
  - [ ] Diver level is calculated automatically based on total dive count (see level table below)
  - [ ] Total dives and total creatures spotted update automatically as dives and creatures are logged
  - [ ] All profile fields (photo, name, description, certifications) are editable at any time
  - [ ] Profile photo is optional — if none is set, a placeholder is shown
  - [ ] Certifications are multi-select — a diver can hold multiple certifications simultaneously

**Diver Level Table:**
| Dives | Level |
|-------|-------|
| 0–9 | Newcomer |
| 10–24 | Explorer |
| 25–49 | Adventurer |
| 50–99 | Intermediate |
| 100–199 | Intermediate High |
| 200–499 | Advanced |
| 500–999 | Pro |
| 1,000+ | Expert |

**Certification List (PADI):**
Scuba Diver, Open Water Diver, Advanced Open Water Diver, Rescue Diver, Master Scuba Diver, Divemaster, Assistant Instructor, Open Water Scuba Instructor, Master Scuba Diver Trainer, IDC Staff Instructor, Master Instructor, Course Director

### Epic: Dive Log

- As a diver, I want to log a new dive so that I have a permanent record of where I dived, what I saw, and when.
  - [ ] "Add Dive" button is visible and accessible from the Dive Log screen
  - [ ] Dive log form includes: date (manual date picker, defaults to today), location (map pin — manual placement or "use current location"), optional photo(s), optional comments, and creatures spotted (searchable multi-select from the creature catalog)
  - [ ] Dive number is assigned automatically based on chronological order of the date entered — not entry order
  - [ ] Saving the dive adds it to the dive list and updates the creature Pokédex (any newly logged creatures unlock immediately)
  - [ ] If no photo is added, the dive saves without one — photo is always optional

- As a diver, I want to view my full list of logged dives so that I can browse my diving history.
  - [ ] Dive list is sorted with most recent dive at the top and oldest at the bottom
  - [ ] Each dive in the list shows: dive number, date, and location name
  - [ ] Tapping a dive opens the full dive detail view

- As a diver, I want to see the full details of a specific dive so that I can review everything about that dive.
  - [ ] Dive detail view shows: dive number, date, location name, interactive map with pin, creatures spotted on that dive, photo(s) if added, and comments if added

- As a diver, I want to edit a logged dive so that I can correct mistakes or add information I forgot.
  - [ ] All fields on a logged dive are editable: date, location, photo(s), creatures spotted, comments
  - [ ] If the date is changed, dive numbers recalculate chronologically across all dives

- As a diver, I want to delete a logged dive so that I can remove entries I no longer want.
  - [ ] Before deletion, the app shows a confirmation warning: "Are you sure you want to delete this dive? Any creatures only spotted on this dive will be locked again."
  - [ ] On confirmation, the dive is deleted, dive numbers recalculate (no gaps), and any creatures whose only sighting was on this dive revert to locked (gray silhouette)
  - [ ] If a creature was also spotted on other dives, it remains unlocked after the deletion

### Epic: Creature Pokédex

- As a diver, I want to browse a catalog of sea creatures so that I know what I might encounter and can identify what I've seen.
  - [ ] Creature catalog shows all species (pre-built list of ~60–100 species) as cards with: creature image (silhouette if not yet spotted, full color if spotted), and creature name
  - [ ] Tapping any creature — locked or unlocked — opens the creature detail view
  - [ ] Locked creature detail view shows: silhouette image, name, and description
  - [ ] Unlocked creature detail view shows: full-color image, name, description, which dive it was first spotted on, and the optional creature photo if one was added
  - [ ] A progress counter at the top of the screen shows "X / Y creatures spotted"

- As a diver, I want to search and filter the creature catalog so that I can find a specific creature quickly.
  - [ ] Search bar filters the visible creature list in real time as the user types
  - [ ] "Show only unlocked" toggle filters the list to display only creatures the user has spotted
  - [ ] Search and filter can be used together

- As a diver, I want to log a creature sighting directly from the creature screen so that I can add a creature I forgot to log during the dive entry.
  - [ ] From an unlocked or locked creature's detail view, there is an option to log a sighting
  - [ ] Logging from the creature screen requires selecting which dive the sighting belongs to (from a list of logged dives)
  - [ ] After logging, the creature unlocks (if not already) and the sighting is associated with the selected dive
  - [ ] User can optionally add a photo of the creature when logging a sighting

- As a diver, I want to add a custom creature that isn't in the pre-built catalog so that I can log unusual or rare species I've encountered.
  - [ ] "Add custom creature" option is available on the creature catalog screen
  - [ ] Custom creatures require a name at minimum; description and photo are optional
  - [ ] Custom creatures appear only in the user's own catalog — they do not affect other users
  - [ ] Custom creatures follow the same unlock mechanic as pre-built creatures

### Epic: Dive Map

- As a diver, I want to see an interactive world map showing everywhere I've dived so that I can visualize my diving history geographically.
  - [ ] Map screen shows a world map with a pin at every location where a dive has been logged
  - [ ] If no dives are logged, the map is empty with no pins
  - [ ] Tapping a pin opens the full dive detail view for that dive
  - [ ] If multiple dives were logged at the same location (same coordinates), tapping the pin shows all dives at that location

---

## What We're Building

Everything below must be complete and working at the end of the build session:

1. **Account system** — Email/password signup and login. Data persists to the account, not the device.
2. **Profile screen** — Photo, name, description, certifications (multi-select), auto-calculated dive count, creatures spotted count, and diver level.
3. **Dive Log screen** — Sortable list of logged dives (latest first). Each entry shows dive number, date, location. Tap to open full detail view.
4. **Add/Edit Dive form** — Date picker, map-based location pin (manual or current location), optional photo(s), creatures multi-select with search, optional comments. Dive number auto-assigned chronologically.
5. **Delete dive** — With confirmation warning about creature re-locking. Renumbers all subsequent dives.
6. **Creature Pokédex** — Pre-built catalog of ~60–100 species. Cards show silhouette/full-color image + name. Search bar + "show only unlocked" filter. Progress counter.
7. **Creature detail view** — Name, description, silhouette (locked) or full-color image (unlocked). If unlocked: which dive, optional creature photo.
8. **Log creature from creature screen** — Select a dive, optionally add photo. Unlocks the creature.
9. **Custom creature entry** — Add a creature not in the pre-built list. Appears only in the user's catalog.
10. **Dive Map** — World map with pins at every logged dive location. Tap pin to see dive detail(s).

---

## What We'd Add With More Time

- **Social layer (v2)** — User profiles visible to others, following/followers, activity feed. Full Strava-style social network for divers. Major feature — save for v2.
- **Creature type filtering** — Categorize species by type (fish, mammal, coral, etc.) and add filter to the catalog. Requires categorizing every species — worth doing once catalog is built.
- **Dive stats on profile** — Deepest dive, longest dive, most-visited location, favorite creature. Adds personality to the profile.
- **Dive photo gallery** — A dedicated gallery view showing all photos across all dives.
- **AI creature identification** — Photo-to-species identification. Heavy feature, out of scope for MVP.
- **Dive computer sync** — Import dives from wearables/dive computers. Hardware integration — save for v2.

---

## Non-Goals

- **No social features in MVP** — No public profiles, following, feeds, or shared sightings. The app works as a personal tracker without any social layer. Social is v2.
- **No AI photo identification** — Users select creatures manually from the catalog. No camera-to-species recognition.
- **No community catalog editing** — Custom creatures a user adds are private to their account. There is no shared creature database that users can collectively edit.
- **No dive computer or wearable sync** — All dive data is entered manually.
- **No real-time collaboration** — No buddy tracking, shared dive logs, or live location features.

---

## Open Questions

- **How many creatures in the pre-built catalog?** The scope says 60–100. The exact number affects build time for populating the catalog. Needs a decision before /spec. Recommendation: start with 60 well-known species and note that the catalog can grow post-launch.
- **Map pin placement UX** — "Use current location" requires browser geolocation permission. What happens if the user denies location access? Should fall back gracefully to manual pin placement. Can be resolved at build time.
- **Photo storage** — Photos need to be stored somewhere when tied to an account (not just local storage). This is a technical decision for /spec, but worth flagging — it affects whether photo upload is fully functional in the MVP build window.
- **Creature sighting and multiple dives** — If a creature is spotted on 3 dives and the user edits one of those dives to remove the creature, does anything change? (The creature stays unlocked since it was spotted on other dives.) This edge case should be confirmed before /spec.
