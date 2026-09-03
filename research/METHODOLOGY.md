# Research Methodology

## Batches
- **Batch 1 (WH3 base + most recent DLCs):** Skarbrand, Skulltaker, Arbaal, Katarin, Kostaltyn, Boris, Ostankya, Miao Ying, Zhao Ming, Yuan Bo, Bhashiva, Kairos, Changeling, Ku'gath, Tamurkhan, Epidemius, N'Kari, Dechala, Masque, Daemon Prince
- **Batch 2 (Ogres + Chaos Dwarfs + Warriors of Chaos):** Greasus, Skrag, Golgfag, Astragoth, Drazhoath, Zhatan, Archaon, Be'lakor, Kholek, Sigvald, Valkia, Festus, Vilitch, Azazel, Glottkin
- **Batch 3 (Norsca + WH1 base):** Wulfrik, Throgg, Karl Franz, Balthasar Gelt, Volkmar, Wulfhart
- **Batch 4 (WH2 base + FLC):** Tyrion, Teclis, Alarielle, Malekith, Morathi, Settra, Khalida, Khatep, Mannfred, etc.
- **Batch 5 (All DLCs + FLC packs):** remaining
- **Batch 6 (DLCs, character packs, FLC):** final sweep

## Source priority
1. **totalwarwarhammer.fandom.com** — official-style wiki, comprehensive
2. **r/totalwar** subreddit — community consensus, patch discussions
3. **Steam reviews / discussions** — casual player views
4. **TWW community sites** (e.g. TWC forums, Chinese community if relevant)

## Per-lord research flow
1. Web search: `"<lord name>" Total War Warhammer wiki`
2. Extract wiki page
3. Web search: `"<lord name>" Total War Warhammer reddit`
4. Read current app entry from `index.html` LORDS array
5. Compare and flag

## Output
- `per-lord/<lord-slug>.md` — individual research files
- `batches/batch-N-summary.md` — batch summary with all discrepancy flags

## Definition of "accurate"
- Mechanics: present and described correctly
- Pros/cons: reflect actual gameplay consensus
- Tags: aligned with current meta-perception
- Pick line: captures the lord's appeal without misrepresenting difficulty

## What we're NOT doing
- Auto-editing the app
- Rewriting everything — only flagging clear inaccuracies
- Making up info — if wiki/community doesn't have it, mark as "no data"
