# DiveLog — Sea Creature Pokédex for Scuba Divers

## Idea
A personal dive tracking app where scuba divers log their dives, unlock sea creatures they've spotted in a Pokédex-style collection, and visualize everywhere they've dived on a map.

## Who It's For
Scuba divers who want a fun, gamified way to track their diving history — the dives they've done, the creatures they've encountered, and the places they've explored. The user is someone like Juan: active, adventure-driven, and motivated by the satisfaction of building a collection over time. There's currently no app that combines a clean dive log with the "unlock" mechanic of a creature Pokédex.

## Inspiration & References
- **[Depth – Scuba Dive Log Tracker](https://apps.apple.com/us/app/scuba-dive-log-tracker-depth/id6760669839)** — Closest existing app. Has a "life list" of species but lacks the Pokédex unlock mechanic and creature log. Primary reference for what we're building beyond.
- **[Seabook – Fish Identifier & Dive Log](https://apps.apple.com/us/app/fish-identifier%E3%86%8Dscuba-dive-log/id1457338313)** — More complex, has AI photo ID. Too heavy. Useful reference for creature catalog structure.
- **Strava** — Social layer inspiration for a future version (v2). Sets the benchmark for activity-based social apps in the sports/adventure space.
- **Pokémon Pokédex** — Core gamification reference. Gray/silhouette = not yet seen. Full color = unlocked. The emotional hook that makes users want to complete the collection.

**Design direction:** Dark mode, minimal, clean. Muted ocean tones — deep navy, dark teal, soft whites. Nothing oversaturated. Feels like a dive computer crossed with a well-designed modern app. Think functional and sellable, not decorative.

## Goals
- Build something Juan would actually use and show to other divers
- Prove the concept of a gamified dive tracker with the creature unlock mechanic
- Ship a complete, polished MVP in one hackathon session
- Lay the foundation for a product that could be sold or expanded (social layer, v2)

## What "Done" Looks Like
A working web app with three core modules:

1. **Dive Log** — User can log a new dive with: auto-incremented dive number, location name, date, optional notes, optional photo upload, and selection of creatures spotted. Logged dives appear in a list. Tapping a dive opens a detail view showing all its information.

2. **Creature Pokédex** — A pre-built catalog of sea creatures. Unlogged creatures appear as gray silhouettes. Once a creature is logged on any dive, it "unlocks" — displaying in full color. The collection view shows progress (e.g., "12 / 80 creatures spotted").

3. **Map View** — An interactive map showing pins at every location the user has logged a dive. Tapping a pin shows the dive(s) logged at that location.

The app tracks total dive count automatically. The experience feels complete without any backend/social features — it works as a personal tracker.

## What's Explicitly Cut
- **Social layer** — No user profiles, no following/followers, no FYP, no public/private settings. This is v2. Reason: would take weeks to build properly; the personal tracker is a complete product on its own.
- **AI creature identification** — No photo-to-species AI. Reason: adds API complexity; the catalog selection flow is simpler and sufficient for MVP.
- **Community features** — No shared sightings, no leaderboards, no buddy tracking. Reason: same as social layer — save for v2.
- **Dive computer sync** — No import from dive computers or wearables. Reason: hardware integration is out of scope for a hackathon.

## Loose Implementation Notes
- Web app (browser-based), not native mobile — keeps the build accessible for this session
- Creature catalog will be a curated list (manageable number, e.g. 60-100 well-known species) rather than an exhaustive database — quality over completeness for MVP
- Map integration via a library like Leaflet or Google Maps — user types a location name, coordinates are geocoded or manually pinned
- Local storage or a lightweight database (e.g. SQLite, localStorage for MVP) to persist dives and unlocked creatures
- Photo uploads: optional feature — if time allows, store as base64 or use a simple file storage approach
