# Boris Todbringer — Research Notes (Patch 9.0)

## Identity
- **Name:** Boris Todbringer
- **Race / Faction / Source:** The Empire / Middenland (Reikland in app) / Lords of the End Times DLC (Patch 9.0)
- **Difficulty:** 2

## Current App Content
- **Source listed as:** FLC (Update 6.0) — **STALE**: should be "Lords of the End Times" DLC
- **Mech 1:** "Crush the Weak" passive — WAAAGH-style offensive ability against wounded enemies
- **Mech 2:** 2 landmark buildings (Middenheim-area)
- **Mech 3:** Empire core (Boris was originally Reikland Empire in app)

## Patch 9.0 / End Times Verification
**Source:** CA blog: Lords of the End Times (Aug 13, 2026); InsertCoins preview; Gamereactor review (May 1, 2026)

### Faction effects (verified, End Times DLC)
- **Great Temple of Ulric** — campaign mechanic: Fervour raises by defeating Empire's enemies; enables development of the Great Temple of Ulric
- **Beast Paths / Underway interception** — increased chance to intercept enemy armies (proposed, may have shipped)
- **Leadership and weapon strength buffs** (per Reddit speculation, unverified)
- **Faction:** Middenland, not Reikland — Middenland is a separate Empire faction in IE now

### Discrepancy flags (CRITICAL)
| Element | Flag | Note |
|---|---|---|
| Source attribution | STALE | App says "FLC (Update 6.0)" but he releases with Lords of the End Times DLC, Sept 24, 2026 |
| Faction | STALE | App says Reikland; actual is Middenland |
| Great Temple of Ulric | MISSING | Campaign mechanic not mentioned in app |
| Fervour mechanic | MISSING | Defeat-based faction meter not mentioned |

### Suggested edits
1. Update `src` field to "Lords of the End Times"
2. Update `f` field to "Middenland" (or whatever CA named it)
3. Add Fervour / Great Temple of Ulric to mech[1]
4. Note Underway interception

## Sources
- Primary: CA blog: Lords of the End Times (Aug 13, 2026)
- InsertCoins preview (lords-of-the-end-times-preview)
- Fandom: Boris Todbringer (WH3)
- Reddit: r/totalwar Boris Todbringer unique LL discussion
- Gamereactor: Middenland review
