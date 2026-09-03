# Research Status (2026-09-03 15:55 UTC)

## Setup
- ✅ Research directory created: `research/{batches,per-lord}/`
- ✅ Template: `research/TEMPLATE.md` (per-lord structure)
- ✅ Methodology: `research/METHODOLOGY.md` (6 batches, source priority)
- ✅ Lord list extracted: 110 lords at `research/lord_list.txt`

## Web Fetching — STATUS (2026-09-03 16:00 UTC)

### Tested approaches
- ❌ `totalwarwarhammer.fandom.com` — Fandom blocks (Cloudflare challenge)
- ❌ `reddit.com` / `old.reddit.com` — network policy block
- ❌ `web.archive.org` — fails
- ❌ `extract_content_from_websites` tool — fails on all of the above
- ✅ **`playwright` (chromium) + `steamcommunity.com`** — works! Got full Tzarina Katarin guide content (Steam Community Guides have rich per-lord analysis)
- ✅ Web search snippets — work (used to discover Steam guide URLs)

### What this means
**Steam Community Guides are a viable primary source.** TWH3 has hundreds of detailed per-lord guides on Steam. Quality is mixed but top-rated ones are excellent. I can:
1. Web search to find the top-rated guide per lord
2. Playwright-fetch the guide
3. Extract mechanics, strengths, weaknesses, community consensus
4. Compare against current app data

Combined with my training knowledge as cross-reference, this is enough for a meaningful accuracy audit.

### What's still blocked
- Fandom wiki (canonical reference) — Cloudflare
- Reddit threads — network block
- Steam reviews — likely blocked

These would have been nice-to-have for full coverage, but the Steam Guides + my training knowledge covers the main ground.

## Pivot Options

**Option A: Knowledge-based audit**
- Use my TWH3 training knowledge to review each lord's description
- Cross-check against the app's existing content
- Flag clear inaccuracies, missing mechanics, wrong tags
- Caveat: same source family as the app data, so accuracy gain is moderate
- Output: per-lord `per-lord/<slug>.md` with flagged issues
- Speed: 1-2 batches per turn

**Option B: Web snippet audit**
- For each lord: web search "lord name total war warhammer wiki"
- Pull what snippets I can
- Use snippets as supplementary evidence
- Output: per-lord files with snippet citations
- Speed: slower per-lord, but verifiable external sources

**Option C: Hybrid**
- Knowledge-based as primary
- Targeted snippet checks for suspicious claims
- Flag items needing human verification

## Recommended: **Steam-Guides + knowledge hybrid (NEW)**
1. Web search → find top-rated Steam Community Guide per lord
2. Playwright-fetch the guide (Steam works, Fandom doesn't)
3. Cross-reference with my training knowledge
4. Compare against current app data
5. Flag discrepancies

This is now viable thanks to the playwright + Steam discovery.

## What's done
- Framework: ✓
- Lord list: ✓
- Playwright viability confirmed: ✓ (Steam Community works, Fandom blocked)
- First test fetch (Katarin Steam guide): ✓
- Per-lord research files: 0/110

## What's pending
- First batch per-lord files
- Discrepancy summary
- Apply edits (only after user review)

## Time estimate
- Per-lord: ~15s (search + playwright fetch + write)
- Total: ~30 min for all 110 if I can batch multiple per turn
- Realistic per turn: 5-8 lords researched = 12-15 turns for full sweep
