const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.baidu.com/');
  await page.locator('#kw').fill('test');
  await page.locator('#kw').click();
  await page.locator('#kw').fill('testplaywright');
  await page.locator('#kw').click({
    clickCount: 3
  });
  await page.locator('#kw').fill('playwright');
  await page.locator('#kw').press('Enter');
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();