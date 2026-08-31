# TWW Lord Picker — Project Rules

## Tech Stack
- **Type**: Static web app — single `index.html` (vanilla HTML/CSS/JS)
- **No build step** — edit `index.html` directly, deploy by replacing the file
- **Fonts**: Google Fonts (Cinzel) — loaded via CDN

## Deployment
- The app lives entirely in `index.html`
- Deploy via `deploy` tool: point `dist_dir` at the project root
- CNAME / custom domain supported — `CNAME` file is present

## Conventions
- CSS variables defined in `:root` on the `<style>` block
- Filter chips: Faction → Start Pos → Legendary Lord
- No frameworks, no bundler, no dependencies beyond Google Fonts CDN
