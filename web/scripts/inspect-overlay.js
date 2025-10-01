const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

  // Open settings panel by clicking settings button in header
  try {
    await page.click('.settings-btn');
  } catch (e) {
    // ignore if not found
  }
  // Wait for panel animation to finish
  await page.evaluate(() => new Promise(res => setTimeout(res, 600)));

  const result = await page.evaluate(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // choose a point 60px from right and 120px from top — likely inside settings panel header
    const x = Math.max(w - 60, w * 0.7);
    const y = 120;
    function describe(el) {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      const ancestors = [];
      let p = el;
      for (let i = 0; i < 8 && p; i++) {
        ancestors.push({ tag: p.tagName, cls: p.className, id: p.id, z: window.getComputedStyle(p).zIndex, pe: window.getComputedStyle(p).pointerEvents });
        p = p.parentElement;
      }
      return { tag: el.tagName, cls: el.className, id: el.id, rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height }, z: cs.zIndex, pointerEvents: cs.pointerEvents, ancestors };
    }
    const el = document.elementFromPoint(x, y);
    return { x, y, top: describe(el), full: [].slice.call(document.elementsFromPoint(x,y)).map(e => ({ tag: e.tagName, cls: e.className, id: e.id, z: window.getComputedStyle(e).zIndex, pe: window.getComputedStyle(e).pointerEvents })) };
  });

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
