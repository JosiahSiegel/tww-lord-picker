# Boris Ursus — Research Notes

## Identity
- **Name:** Boris Ursus
- **Race / Faction / Source:** Kislev / Ursun Revivalists / WH3 base
- **Difficulty (current):** 4

## Current App Content

**Tags:** `["Hard start","Bears","Aggro"]`

**Mech:**
1. **Conqueror of the Wastes** — "starts alone deep in the Chaos Wastes — one of the hardest openings in the game if played straight. But the kit is built for staying: wasteland settlements take smaller climate penalties and generate Devotion, and a unique skill makes colonising ruins free. He's meant to settle the north, not run from it — and his victory objectives point straight at Archaon's Warhost"
2. **Ursun's chosen** — "rides the great bear Urskin, and War Bear Riders come cheaper and better-ranked in his army. Bear cavalry stacks are the faction's whole battle plan, and they carry it"
3. **Kislev core** — "The Motherland (Devotion from fighting Chaos) and Atamans (province governors) work from turn one. One catch: only Boris himself is immune to Wastes attrition, so second armies suffer up there"

**Pros:** "A real crusade arc: carve north and take Archaon's head", "Bear cavalry doomstacks are fun and effective", "Every neighbour is a valid target — no diplomacy guilt"

**Cons:** "Brutal, grinding early game with no safe province", "No allies to be found anywhere — the wiki's own guide says as much", "Weakest of the Kislev three once the novelty fades"

**Pick line:** "Pick if you want the hardest Kislev start — carving a bear-god empire out of the Wastes themselves. Not a first-campaign choice."

---

## Steam Guide Verification

**Source:** https://steamcommunity.com/sharedfiles/filedetails/?id=2972219604

### Mechanics (verified)

| Claim in app | Steam guide says | Verdict |
|---|---|---|
| Starts deep in the Chaos Wastes | ✓ Confirmed: "You do not even start with any settlement, but the initial one is quite easy to obtain... after the Tower of Torment, every territory is actually Chaos Wasteland" | ✓ |
| Wasteland settlements have reduced climate penalties + generate Devotion | ✓ Confirmed: "Settlements in the Chaos wastelands receive reduced climate penalties and generate Devotion" | ✓ |
| Unique skill makes colonising ruins free | ⚠ Soft — guide doesn't mention this specifically. App is detailed. Could be true (Wasteland kit). | ⚠ Recheck |
| Bear cavalry focus (Urskin mount, War Bear Riders) | ✓ Confirmed: "Recruit Rank +2 for War Bear Riders units" + "Construction cost -50% for garrison and religion buildings" (less direct) | ✓ |
| Victory points at Archaon | ✓ Confirmed: "Short victory: Destroy the factions of the Warhost of the Apocalypse (Archaon) and the Bloody Sword" | ✓ |
| Kislev core (Devotion, Atamans) | ✓ Confirmed | ✓ |
| "Only Boris himself is immune to Wastes attrition" | ⚠ Soft — guide doesn't mention this. App claim could be from a different patch. | ⚠ Recheck |

### Faction effects (NEW from guide)

- **Diplomatic relations +30 with Ice Court (Tzarina Katarin)** — directly contradicts app's "no allies to be found anywhere"!
- **Construction cost -50% for garrison and religion buildings**
- **Construction time -1 for Province capital/settlement buildings** (not -50%, just -1 turn flat)
- **Recruit Rank +2 for War Bear Riders units**

### Victory conditions (NEW from guide)

- **Short:** Destroy Warhost of the Apocalypse (Archaon) and the Bloody Sword. 30 settlements. Reward: +3 hero recruit capacity.
- **Long:** 70 settlements, destroy Legion of Chaos (Daniel), Wintertooth (Throgg), Heralds of the Tempest (Kholek). Reward: +10 hero recruit rank.

### Climate

Guide: "Climate is slightly better overall than others Kislev factions, but the biggest issue is in the early game." → App doesn't mention this nuance.

### Discrepancy flags

| Element | Flag | Note |
|---|---|---|
| **"No allies to be found anywhere — the wiki's own guide says as much" (con)** | ⚠ **CONTRADICTION** | Guide says "+30 diplomatic relations with Ice Court (Tzarina Katarin)" — direct alliance is *easier*, not harder. The con seems wrong. |
| **"Brutal, grinding early game"** | ✓ Confirmed | "Your starting location is quite difficult... one of the hardest campaigns" |
| **"A real crusade arc: carve north and take Archaon's head"** | ✓ Confirmed | Victory conditions match |
| **Tags: "Aggro"** | ✓ Confirmed | Aggressive expansion |
| **Tags: "Bears"** | ✓ Confirmed | War Bear Riders focus |
| **Tags: "Hard start"** | ✓ Confirmed | Guide explicitly says "one of the hardest campaigns" |
| **Faction effects missing from app** | ⚠ Missing | +30 with Ice Court, -50% garrison/religion cost, -1 turn construction, +2 War Bear Rider rank — significant |
| **App's "wiki's own guide says as much" reference** | ⚠ Cite | The app cites "the wiki's own guide" but the Steam guide actually says the opposite. This con may need rewriting. |

### Suggested edits

1. **CRITICAL: Reword the "no allies" con.** Steam guide shows +30 with Katarin. Suggested:
   - "Diplomatic ties with Ice Court are surprisingly decent — but every Chaos neighbor still hates you"
   - Or simply: "Brutal, grinding early game with no safe province" (drop the "no allies" line)

2. **Add faction effects** to mech[2] or new field:
   - `+30 diplomatic relations with Ice Court (Katarin)`
   - `-50% construction cost for garrison/religion buildings`
   - `-1 turn construction time for capital/settlement buildings`
   - `+2 recruit rank for War Bear Riders`

3. **Verify "Only Boris himself is immune to Wastes attrition"** — guide doesn't confirm. Could reword to: "Wasteland attrition hurts — Boris's bonuses help but the campaign is still brutal for follow-up armies"

## Sources
- Primary: Steam Community guide (id=2972219604)
- Fandom wiki: BLOCKED
- The app's "wiki's own guide" citation appears to contradict the Steam guide; might be a different wiki entry
