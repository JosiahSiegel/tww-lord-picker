# Malekith, the Witch King — Research Notes

## Identity
- **Name:** Malekith
- **Race / Faction / Source:** Dark Elves / Naggarond / WH2 base
- **Difficulty (current):** 2

## Current App Content

**Tags:** `["Tyrant","Slaves","Caster-fighter"]`

**Mech:**
1. **The Witch King** — "elite caster AND elite duelist on a black dragon — wins the magic duel and the melee one. One of the few lords who reshapes battles just by existing"
2. **Slave economy & Black Arks** — "battle captives fuel industry; Black Arks roam the seas as mobile fortresses recruiting and bombarding. Both were touched up in Update 7.0"
3. **Claim Ulthuan** — "the long arc points at the Phoenix Throne. Getting there is a boat ride; taking it is the campaign"

**Pros:** (need to verify)
**Cons:** (need to verify)
**Pick line:** (need to verify)

---

## Steam Guide Verification (extract_content_from_websites)

**Source:** https://steamcommunity.com/sharedfiles/filedetails/?id=2940452205 (Malekith - Dark Elves patch 8)

### Faction effects (verified)

- **Diplomatic relations +20 with Dark Elves**
- **+50% Allegiance points gained for alliances with Dark Elves**
- **-25% Upkeep for Black Guard, Dreadspears, Bleakswords, and Darkshards**
- **+2 Loyalty for new characters**

### Victory conditions (verified)

- **Short:** Destroy Eataine (Tyrion), control Lothern directly or via allies, 30 settlements. Reward: +3 recruit rank to all units.
- **Long:** Short + 60 settlements + control at least 8 provinces in Ulthuan. Reward: +15% income from slaves.

### Starting location (verified)

"Somewhat easy 2-settlement province, neighboring a 4-settlement province. Initial expansion typically involves clearing out the north (Grombrindal, Valkia, and Norsca) before heading south or sailing to Ulthuan."

### Climate (verified)

"Considered poor to average. There are plenty of unpleasant and uninhabitable climates, which makes map domination difficult and restricts army replenishment."

### Unique mechanics (verified)

- **Black Arks:** Horde-style armies restricted to the sea. Mobile military recruitment bases, replenishment to nearby armies, bombardment abilities during coastal battles.
- **Slave mechanic:** Globally generate income, factionwide buffs, required for Rites/Diktats, can rush building construction.
- **Diktats:** Secondary province edicts powered by slaves (+10 control, 1500 gold, or +50 growth).
- **Names of Power:** At level 10, lords receive a random highly impactful skill/title.
- **Loyalty:** A lord mechanic; at 0 they form their own faction and rebel.
- **Rites:** Four situational abilities powered by slaves (magic/XP buffs, control/loyalty, Black Ark summoning, replenishment).

### Discrepancy flags

| Element | Flag | Note |
|---|---|---|
| **"Black Arks roam the seas as mobile fortresses"** | ✓ Confirmed | "Horde-style armies restricted to the sea" |
| **"Battle captives fuel industry"** | ✓ Confirmed | "Slave mechanic: globally generate income" |
| **Tags: "Tyrant", "Slaves", "Caster-fighter"** | ✓ All confirmed | |
| **Faction effects** | ⚠ Missing | +20 DE diplo, +50% allegiance, -25% Black Guard/Dreadspears/Bleakswords/Darkshards upkeep, +2 loyalty for new characters |
| **"Caster-fighter"** | ✓ Confirmed | "elite caster AND elite duelist" |
| **"Touched up in Update 7.0"** | ✓ Confirmed (re: Black Arks/Slaves) | |

### Suggested edits

1. **Add faction effects** to mech[1] or new line:
   - `+20 diplomatic relations with Dark Elves`
   - `+50% allegiance from DE alliances`
   - `-25% upkeep for Black Guard, Dreadspears, Bleakswords, Darkshards`
   - `+2 loyalty for new characters`

2. **App is broadly accurate** on the Witch King + Slaves + Black Arks framing.

## Sources
- Primary: Steam Community guide (susaVile, id=2940452205) via extract_content_from_websites
- Fandom wiki: BLOCKED
- Web search: confirmed URL
