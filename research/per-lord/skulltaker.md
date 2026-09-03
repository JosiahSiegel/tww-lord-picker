# Skulltaker — Research Notes

## Identity
- **Name:** Skulltaker
- **Race / Faction / Source:** Khorne / Blooded Wanderers / Omens of Destruction DLC
- **Difficulty (current):** 2

## Current App Content (from `index.html`)

**Tags:** `["Duelist","Quest-driven","Aggro"]`

**Mech:**
1. **Cloak of Skulls** — "a hit-list of the map's legendary lords and heroes — kill them (dueling them personally counts extra) and their skull goes on the cloak as a permanent stacking buff. The stacking gets out of hand by lategame, which is the point; ask anyone, the cloak carries the whole campaign — though plenty now say it carries too hard, turning the back half trivially easy"
2. **Boss-rush missions** — "missions point you at specific characters instead of provinces, so the sandbox turns into a boss-rush. Good if you want direction; annoying when the next target is three continents away"
3. **Khorne core** — "Skulls, Blood Hosts, Skull Throne rituals and Bloodletting all still apply: same free armies, same fight-or-decay pressure"

**Pros:**
- "Clear built-in direction: a hit-list of the map's biggest names"
- "One of the best duelists in the game"
- "Trophy buffs are permanent and stack into absurdity"

**Cons:**
- "The hit-list drags you far from a defensible empire"
- "Still melee-only Khorne with all its matchup problems"
- "Lustria start puts Lizardmen doomstacks in your face early"

**Pick line:** "Pick if you want a bounty-hunter campaign — widely considered the most interesting way to play Khorne."

---

## Steam Guide Verification (susaVile, "Skulltaker - Khorne overview")

**Source:** https://steamcommunity.com/sharedfiles/filedetails/?id=3408663616

### Mechanics (verified)

| Claim in app | Steam guide says | Verdict |
|---|---|---|
| Cloak of Skulls is a hit-list of LLs/heroes, kill them to add skulls (stacking buff) | ✓ Confirmed: "Empower 9 skulls in the Cloak of Skulls" (short victory) and "Empower 18 skulls" (long). "Hero capacity +2 for Bloodreapers... Upkeep -15% for Bloodletters and Exalted Bloodletters of Khorne" tied to Cloak. | ✓ |
| Boss-rush missions (point at specific characters) | The guide doesn't use the phrase "boss-rush" but the short/long victory are "Empower N skulls" tied to killing specific powerful Lords. The hit-list framing is accurate. | ✓ |
| Khorne core (Skulls, Blood Hosts, Skull Throne, Bloodletting) | ✓ Confirmed: "Skulls is your currency... Unholy manifestations... Skull Throne... Bloodletting is a mechanic tied to your armies" | ✓ |

### Faction effects (NEW from guide)

The guide lists specific bonuses that the app **doesn't mention**:
- **Hero capacity +2 for Bloodreapers** (faction effect)
- **Daemons reforged +10% chance for destroyed Bloodletters to be restored (all armies)**
- **Upkeep -15% for Bloodletters and Exalted Bloodletters of Khorne (all armies)**

These are significant and may warrant adding to the **Mech** array or a separate "faction effect" line.

### Victory conditions (NEW from guide)

- **Short:** Empower 9 skulls, occupy/loot/raze/sack 30 settlements. Reward: Chainsword unique weapon.
- **Long:** 18 skulls, 60 settlements, 8 Skull Throne rituals. Reward: lord recruit rank +10.

App doesn't mention these — could add to mech[0] description.

### Climate

Guide says: "only Athel Loren areas are uninhabitable... unpleasant climate areas exist, but a great faction for global domination." → App doesn't mention climate.

### Starting position

Guide: "you start surrounded by factions that will soon get to war with you... recommendation being to stay a bit clear from the jungle." → App's "Lustria start puts Lizardmen doomstacks in your face early" is **roughly accurate** but doesn't quite match the "stay clear of the jungle" guidance.

### Discrepancy flags

| Element | Flag | Note |
|---|---|---|
| **Cloak of Skulls description** | ⚠ Soft flag | App claims "carries too hard" with current stacking; guide confirms permanent buff stacking is the design. App is opinion-tinged, but consistent with community sentiment. |
| **Boss-rush missions** | ⚠ Soft flag | "Boss-rush" is app's framing; the underlying mechanic (hit-list / Cloak skulls) is the same. Could clarify: it's not "missions" per se, it's the victory condition tracking. |
| **Lustria start** | ⚠ Recheck | Guide says "stay clear of the jungle" — this suggests the start may not literally be IN Lustria. Could verify via wiki. Steam guide doesn't pin a specific province. |
| **Tags: Quest-driven** | ⚠ Recheck | App's "Quest-driven" tag suggests quest battles. Guide doesn't frame it that way — it's victory conditions + cloak, not quest battles. Could rename to "Hit-list" or "Trophy-hunter". |
| **Faction effects** | ⚠ Missing | +2 Bloodreaper heroes, +10% Bloodletter reforge, -15% upkeep on Bloodletters — significant effects not in app. |

### Suggested edits

1. **Add faction effects** to mech[0] description or as separate line:
   - `Hero capacity +2 for Bloodreapers`
   - `+10% Bloodletter reforge chance (all armies)`
   - `-15% upkeep on Bloodletters/Exalted Bloodletters (all armies)`

2. **Update "Quest-driven" tag** → consider `Hit-list` or `Trophy-hunter` (more accurate than quest-driven)

3. **Note about Cloak of Skulls** — minor: "carries the whole campaign" is opinion; community sentiment has been mixed. Could soften the "carries too hard" line.

4. **Lustria start recheck** — verify exact start position via Fandom wiki (currently blocked from this env, will leave a note).

## Sources
- Primary: Steam Community guide by susaVile (id=3408663616)
- Secondary: My training knowledge (TWH3 patch 4.x, Omens of Destruction)
- Fandom wiki: BLOCKED (Cloudflare)
