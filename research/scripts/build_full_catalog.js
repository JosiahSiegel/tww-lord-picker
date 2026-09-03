const fs = require('fs');
const path = require('path');
const catalog = JSON.parse(fs.readFileSync('/tmp/catalog.json', 'utf8'));
const lords = JSON.parse(fs.readFileSync('/tmp/lords.json', 'utf8'));
const researchDir = '/workspace/projects/tww-lord-picker/research/per-lord/';

// Patch 9.0 / Lords of the End Times known facts (Sept 24, 2026)
const patch9 = {
  date: '2026-09-24',
  endTimesDLC: ['Boris Todbringer', 'Grey Seer Thanquol', 'The Glottkin', 'Nagash, Supreme Lord of the Undead'],
  flc: ['Neferata, Queen of the Silver Pinnacle'],
  rework: 'Vampire Counts full rework: Raise Dead → Corpses/Blood resources, Vampire Lairs, infinite Bloodlines empower',
  archaon: 'Archaon gets major campaign mechanics expansion',
  endgame: ['Chaos Invasion (Archaon)', 'Vermintide (Skaven)', 'Nagash Rises'],
  victoryOverhaul: 'Lore-specific short/long/domination',
  theatres: 'Immortal Empires map split into 14 geographic Theatres',
};

// Categorize each lord by quality of research
function quality(c) {
  if (c.researchBytes < 1500) return 'STUB';
  if (c.researchBytes < 2500) return 'PARTIAL';
  if (c.researchBytes < 3500) return 'GOOD';
  return 'DETAILED';
}

catalog.forEach(c => { c.quality = quality(c); });

// Build markdown
let md = '';
md += '# Lord Picker — Master Research Catalog\n\n';
md += `**Generated:** 2026-09-03 (catalog compiled from 110 per-lord research files)\n`;
md += `**Latest TWW3 patch:** Update 9.0 — Lords of the End Times (release 2026-09-24)\n\n`;

md += '## Patch 9.0 (Lords of the End Times) — Key Changes\n\n';
md += '**4 new Legendary Lords (paid DLC):**\n';
patch9.endTimesDLC.forEach(n => md += `- ${n}\n`);
md += '\n**FLC:**\n';
patch9.flc.forEach(n => md += `- ${n}\n`);
md += `\n**Major reworks:** ${patch9.rework}\n\n`;
md += `**Archaon:** ${patch9.archaon}\n\n`;
md += `**End-game scenarios:** ${patch9.endgame.join(', ')}\n\n`;
md += `**Victory conditions:** ${patch9.victoryOverhaul}\n\n`;
md += `**Immortal Empires:** ${patch9.theatres}\n\n`;

md += '---\n\n## Catalog Statistics\n\n';
const byQuality = {};
catalog.forEach(c => { byQuality[c.quality] = (byQuality[c.quality] || 0) + 1; });
md += '**Research file quality:**\n';
Object.entries(byQuality).forEach(([q, n]) => md += `- ${q}: ${n}\n`);

const bySrc = {};
catalog.forEach(c => { bySrc[c.src] = (bySrc[c.src] || 0) + 1; });
md += '\n**By source (largest 15):**\n';
Object.entries(bySrc).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([s, n]) => {
  md += `- ${s}: ${n}\n`;
});

const byRace = {};
catalog.forEach(c => { byRace[c.r] = (byRace[c.r] || 0) + 1; });
md += '\n**By race:**\n';
Object.entries(byRace).sort((a, b) => b[1] - a[1]).forEach(([r, n]) => {
  md += `- ${r}: ${n}\n`;
});

md += '\n---\n\n## Per-Lord Catalog (110 entries, alphabetical by name)\n\n';
const sorted = catalog.slice().sort((a, b) => a.n.localeCompare(b.n));
for (const c of sorted) {
  md += `### ${c.n}\n`;
  md += `- **Race/Faction:** ${c.r} / ${c.f}\n`;
  md += `- **Source:** ${c.src}\n`;
  md += `- **Difficulty:** ${c.d}/5\n`;
  md += `- **Mechs (${c.mechCount}):** ${c.mech.join(' | ')}\n`;
  if (c.patchNote) md += `- **Patch 9.0 note:** ${c.patchNote}\n`;
  md += `- **Pros:** ${c.pros.length > 0 ? c.pros.join(' • ') : '(none)'}\n`;
  md += `- **Cons:** ${c.cons.length > 0 ? c.cons.join(' • ') : '(none)'}\n`;
  md += `- **Pick:** ${c.pl || '(none)'}\n`;
  md += `- **Research:** ${c.researchFile} (${c.researchBytes} bytes, ${c.quality})\n`;
  md += '\n';
}

fs.writeFileSync('/workspace/projects/tww-lord-picker/research/MASTER_CATALOG.md', md);
console.log('MASTER_CATALOG.md: ' + md.length + ' chars, ' + sorted.length + ' lords');
