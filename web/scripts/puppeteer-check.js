const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const outDir = path.resolve(__dirname, 'puppeteer-out');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const logs = [];
  const errors = [];

  page.on('console', msg => {
    logs.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => {
    errors.push({ type: 'pageerror', message: err.message, stack: err.stack });
  });
  page.on('requestfailed', req => {
    logs.push({ type: 'requestfailed', url: req.url(), errorText: req.failure().errorText });
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(outDir, 'screenshot.png'), fullPage: true });
  } catch (e) {
    errors.push({ type: 'navigation', message: e.message, stack: e.stack });
  }

  const out = { logs, errors };
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(out, null, 2));
  console.log('Done. Output in', outDir);
  await browser.close();
})();
