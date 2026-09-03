#!/usr/bin/env node
// steam-fetch.js <lord-name> <appid>
// Searches Steam Community guides for a Total War: WARHAMMER III lord,
// then fetches the top result's content.
//
// Outputs (stdout, line-prefixed):
//   SEARCH_URL=<url>
//   GUIDE_URL=<url>
//   GUIDE_TITLE=<title>
//   GUIDE_TEXT=<text> (up to 32000 chars)

const { chromium } = require('playwright');

const lord = process.argv[2];
const appid = process.argv[3] || '1142710';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  try {
    const searchTerm = lord.replace(/[^a-zA-Z0-9]+/g, '+');
    const searchUrl = `https://steamcommunity.com/app/${appid}/guides/?searchText=${searchTerm}&browsefilter=trend`;
    console.log('SEARCH_URL=' + searchUrl);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);

    const guideUrl = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="sharedfiles/filedetails"]');
      for (const l of links) {
        const href = l.getAttribute('href');
        if (href && /id=\d+/.test(href) && !href.includes('editguide')) {
          return href.startsWith('http') ? href : 'https://steamcommunity.com' + href;
        }
      }
      return null;
    });

    if (!guideUrl) {
      console.log('NO_GUIDE_FOUND');
      await browser.close();
      return;
    }
    console.log('GUIDE_URL=' + guideUrl);

    await page.goto(guideUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2500);

    const title = await page.title();
    console.log('GUIDE_TITLE=' + title);

    const text = await page.evaluate(() => {
      const candidates = [
        '.guide.subSections',
        '.guide_body_content',
        '#guideContent',
        '.workshopItemContent'
      ];
      for (const sel of candidates) {
        const el = document.querySelector(sel);
        if (el && el.innerText && el.innerText.length > 200) {
          return el.innerText.slice(0, 32000);
        }
      }
      return document.body ? document.body.innerText.slice(0, 32000) : '';
    });
    console.log('GUIDE_TEXT:');
    console.log(text);
  } catch (e) {
    console.error('ERR:', e.message);
  }
  await browser.close();
})();
