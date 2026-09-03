#!/bin/bash
# research-one.sh <lord-name> <output-file>
# Web-search Steam Community guides for the lord, then playwright-fetch the top result.
# Outputs: lord name, source URL, extracted text, snippets to stdout (caller writes file).

set -e
LORD="$1"
OUT="$2"

# Use web search via matrix-mcp to find the top-rated guide
# Search: "<lord> total war warhammer III guide site:steamcommunity.com"

# Try to find guide via Steam search
SEARCH_URL="https://steamcommunity.com/app/1142710/guides/?searchText=$(echo "$LORD" | sed 's/ /+/g')&browsefilter=trend&requiredtags%5B%5D=Total+War%3A+WARHAMMER+III&p=1&numperpage=30"

# Use playwright to fetch Steam search results
cat > /tmp/playwright_fetch.js <<EOF
const { chromium } = require('playwright');
(async () => {
  const lord = process.argv[2];
  const searchUrl = process.argv[3];
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    // Find first guide link
    const guideUrl = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/sharedfiles/filedetails"]');
      for (const l of links) {
        const href = l.getAttribute('href');
        if (href && href.includes('id=')) return 'https://steamcommunity.com' + href;
      }
      return null;
    });
    if (!guideUrl) { console.log('NO_GUIDE_FOUND'); await browser.close(); return; }
    console.log('GUIDE_URL=' + guideUrl);
    // Fetch the guide
    await page.goto(guideUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    const title = await page.title();
    const text = await page.evaluate(() => {
      const guideBody = document.querySelector('#guideContent') || document.querySelector('.guide_body_content') || document.body;
      return guideBody ? guideBody.innerText : '';
    });
    console.log('TITLE=' + title);
    console.log('=== TEXT START ===');
    console.log(text);
  } catch(e) { console.error('ERR:', e.message); }
  await browser.close();
})();
EOF

NODE_PATH=$(npm root -g) node /tmp/playwright_fetch.js "$LORD" "$SEARCH_URL"
