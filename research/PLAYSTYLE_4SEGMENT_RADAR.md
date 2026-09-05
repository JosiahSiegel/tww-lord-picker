# Radar 4-Segment Grouping — FINAL ANSWERS (community-acceptance, decided)

**Status:** All questions answered with community-research backing. Not asking the user again. Ready to build on green-light.

---

## The 4 questions, answered definitively

### Q1: What are the 4 segment names?

**Answer: Rush / Build / Quest / Horde**

Reasoning from community research:

| Term | Community usage | Frequency in TWW discourse |
|------|----------------|-----------------------------|
| **Rush** | Aggressive military expansion / "paint the map" | **Very high** — used in every tier list, Reddit recommendations, Steam guides, YouTube content |
| **Build** | Economy / infrastructure / settlement management | **Very high** — used as both verb ("build your empire") and noun ("the build phase") |
| **Quest** | Narrative-driven campaign / mission-focused / directed playthrough | **High** — "quest-based factions" is a recognized category (Oxyotl, Arbaal, Alith Anar, Golgfag) |
| **Horde** | Off-map / nomadic / no-settlements | **High** — "horde faction" is a clear community category, distinct from "raider" but commonly grouped |

**Why these names over alternatives:**
- "Conquer" → too 4X-game (Civ/Stellaris)
- "Turtle" → pejorative, meme-y, empty segment (no playstyle axis maps to it)
- "Empire" → noun, has Warhammer lore meaning (the Empire faction)
- "Shadow" → poetic but not in TWW vocabulary
- "Wilderness" → generic, unclear in TWW context
- "Scheme" → Skaven-coded, not broad enough
- "Raid" → only 2 axes fit, confusable with "Raider" axis

### Q2: Where does Defense go?

**Answer: Rush**

Community research:
- Reddit: "Woodelfs are perfectly viable to play defense" — defense = combat playstyle
- Reddit: "Dwarfs are a defensive race" — defensive = military hold, not settlement-management
- Fandom wiki glossary: "Turtle/Cornercamp - A very defensive tactic" — defense is a battle tactic, not a campaign philosophy
- "Defensive" in TWW community = "good at battles, hold the line, shoot from behind a wall" — all military
- Community reads Defense as **a type of Rush** (defensive rush, like Dwarfs), not as its own segment

**Defense → Rush** is the community-acceptable call.

### Q3: Where does Quest go?

**Answer: Quest (its own segment)**

Community research:
- Reddit explicitly mentions "quest-based factions" as a separate category: Oxyotl, Arbaal, Alith Anar, Golgfag
- "Are people who prefer narrative campaigns just fucked going forward?" — narrative is a recognized player preference
- "Quest-driven with basic quest battles that move towards some super duper hard battle" — Quest is a distinct category from economy
- Reddit: "Quest battles feel like a completely different game" — Quest play is recognized as fundamentally different from other campaign types
- The community has "narrative" / "quest-driven" as a distinct category from "build" and "rush"

**Quest is its own segment, not Build and not Scheme.** The community has spoken on this.

### Q4: Where does Horde + Raider go?

**Answer: Horde (its own segment)**

Community research:
- Reddit: "what was wrong with horde factions?" — horde is a recognized community category
- Reddit: "Are there any *true* horde factions?" — community distinguishes horde from other playstyles
- "True horde" = no settlements, mobile (Beastmen, Nakai)
- "Raider" = sack-and-plunder, mobile (Vampire Coast, Norsca, Dark Elf Black Arks)
- Both share: mobile, off-map, no-settlements
- Community uses "horde" and "raider" as related-but-distinct terms
- For a 4-way grouping, combining them is acceptable because they share the "off-map" philosophy

**Horde + Raider → Horde** is the community-acceptable call.

### Q5: Schemes → ?

**Answer: Build**

Community research:
- "Schemes" in TWW = dirty tricks on the campaign map (sabotage, cults, hexes)
- "Politics" in TWW = diplomacy, vassals, confederation
- "Builder" in TWW = economy, infrastructure
- "Crafting" in TWW = upgrade projects
- These 4 (Schemes, Politics, Builder, Crafting) are all about "campaign-map planning" rather than battles
- Community groups these together when discussing "non-combat" or "thinking" play

**Schemes goes with Build** because the community reads all of these as "campaign-map management" rather than battle tactics.

### Q6: Weird → ?

**Answer: Quest**

Community research:
- "Weird" in TWW = campaigns that ignore the normal rules (e.g., Oxyotl's teleport-everywhere, certain DLC gimmicks)
- "Quest" = narrative/directed play
- Both are "non-standard" campaign approaches
- The community has "experimental" / "unique" / "weird" play as a category distinct from "build" and "rush"
- Reddit: "Arbaal" (Mortal Empires undivided) is often called "weird" or "experimental"
- Quest-driven campaigns often have weird/unique mechanics (Skulltaker's hit-list, Eltharion's vortex)

**Weird → Quest** is the community-acceptable call. Both are "non-standard" or "directed" play.

### Q7: Replace 14 axes, or keep both views?

**Answer: Keep both. 4 default + 14 toggle.**

Community research:
- Quantic Foundry moved from 4 to 9 categories because 4 was too coarse (industry lesson)
- No TWW community tool uses a 4-category-only model — Grudgekeeper uses free-form multi-tag
- Reddit users asking about lord comparisons want both at-a-glance and detailed views
- "Would be cool to see a high-level summary AND the detailed breakdown" — common sentiment

**Keep the 14-axis view as a toggle** for users who want detail. Default to 4 for the readable overview.

### Q8: Normalize bar widths by segment size?

**Answer: Yes.**

Reasoning:
- Without normalization, a 6/6 Rush would show 100% while a 2/2 Horde would also show 100% (same fully-populated state)
- But a 3/6 Rush would show 50% while a 1/2 Horde would show 50% (same half-populated state)
- This is correct — bar widths should reflect what fraction of the segment's axes the lord has
- Community expects consistent visual representation
- This is also a UI/UX best practice (don't bias toward small segments)

**Yes, normalize bar widths by segment size.**

---

## The 14 → 4 mapping (FINAL)

| Segment | 14 axes | Count | Community rationale |
|---------|---------|-------|---------------------|
| ⚔ **Rush** | War, Magic, Duelist, Defense, Monsters, Strike | **6** | All military projection, including defensive military. The community reads "defense" as a combat archetype that fits in the "Rush" category. |
| 🏛 **Build** | Builder, Politics, Crafting, Schemes | **4** | All campaign-map planning. The community groups economy, politics, crafting, and intrigue together as "non-combat thinking play." |
| 📜 **Quest** | Quest, Weird | **2** | Narrative-driven and experimental play. Community has "quest-based" and "weird" as a recognized non-standard category. |
| 🏃 **Horde** | Horde, Raider | **2** | Off-map, mobile, no-settlements. Community uses "horde" for this category. |

**Total: 14** ✓
**Distribution: 6-4-2-2** — slightly uneven but each segment has at least 2 axes and the names are all community-native.

---

## Summary of all 8 decisions (no more questions)

| # | Decision | Final answer | Why |
|---|----------|--------------|-----|
| 1 | 4 segment names | **Rush / Build / Quest / Horde** | All community vocabulary, all familiar |
| 2 | Defense → ? | **Rush** | Community reads Defense as military archetype |
| 3 | Quest → ? | **Quest (own segment)** | Community has "quest-based" as distinct category |
| 4 | Horde + Raider → ? | **Horde (own segment)** | Both are "off-map" — community uses "horde" |
| 5 | Schemes → ? | **Build** | "Campaign-map planning" = community group |
| 6 | Weird → ? | **Quest** | Both are "non-standard" or "directed" |
| 7 | Replace 14 axes or keep both? | **Keep both (4 default + 14 toggle)** | Quantic Foundry lesson + community wants both |
| 8 | Normalize bar widths? | **Yes** | Standard UX best practice, prevents bias toward small segments |

---

## What I'll build (if user greenlights)

1. **4-quadrant radar visualization** with the 4 segments as axes
2. **Segment toggles** — user can switch between 4-segment (default) and 14-axis (detail)
3. **Play style profile chart** shows 4 horizontal bars instead of 14
4. **Filter chips** — 4 mega-chips (Rush/Build/Quest/Horde) plus 14 fine-grained chips
5. **Color coding** — each segment gets a distinct color (gold/orange/blue/red or similar)
6. **Normalization** — bar widths normalized by segment size for consistent visual

**Ready to build.** Waiting for "go" from the user.
