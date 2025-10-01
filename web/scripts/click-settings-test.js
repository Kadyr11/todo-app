const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  const logs = [];
  page.on('console', m => logs.push({type: m.type(), text: m.text()}));
  page.on('pageerror', e => logs.push({type: 'error', text: e.message, stack: e.stack}));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => new Promise(res => setTimeout(res, 500)));
  await page.click('.settings-btn');
  await page.evaluate(() => new Promise(res => setTimeout(res, 400)));

  // Try to click the EN language button inside settings panel (match by innerText)
  const clicked = await page.evaluate(() => {
    const panel = document.querySelector('.settings-panel');
    if (!panel) return { ok: false, reason: 'panel not found' };
    const buttons = Array.from(panel.querySelectorAll('button'));
    // Find a button whose text contains 'EN' (could be emoji + 'EN')
    const enBtn = buttons.find(b => /\bEN\b/.test(b.innerText));
    if (!enBtn) return { ok: false, reason: 'EN button not found', found: buttons.map(b=>b.innerText) };
    enBtn.click();
    return { ok: true, text: enBtn.innerText };
  });

  await page.evaluate(() => new Promise(res => setTimeout(res, 300)));
  const lang = await page.evaluate(() => localStorage.getItem('lang'));
  console.log('clicked', clicked, 'lang', lang);
  console.log('logs:', JSON.stringify(logs.slice(0,40), null, 2));

  await browser.close();
})();
