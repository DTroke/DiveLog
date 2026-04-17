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
