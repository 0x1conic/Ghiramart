import puppeteer from 'puppeteer-core'
import assert from 'node:assert/strict'
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] })
const page = await browser.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173'
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const transform = (selector) => page.$eval(selector, (node) => getComputedStyle(node).transform)
try {
  await page.setViewport({ width: 1440, height: 1000 })
  await page.goto(base)
  await page.bringToFront()
  await page.waitForSelector('.market-scene')
  assert.equal(await page.$('.arrival-controls'), null, 'Playback controls should be removed')
  await delay(1800)
  await page.waitForFunction(() => [...document.querySelectorAll('.scene-product')].every((node) => Number(getComputedStyle(node).opacity) > .99))
  await page.screenshot({ path: '/tmp/griha-motion-desktop.png' })
  const orbit = await transform('.market-scene-orbit')
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }))
  await delay(300)
  assert.notEqual(await transform('.market-scene-orbit'), orbit, 'Oval must follow scroll')
  const storyBefore = await transform('.story-rice')
  await page.$eval('.story-collection', (node) => node.scrollIntoView({ behavior: 'instant', block: 'center' }))
  await delay(1400)
  assert.notEqual(await transform('.story-rice'), storyBefore, 'Collection product must enter on scroll')
  await page.screenshot({ path: '/tmp/griha-motion-collections.png' })
  await page.$eval('.membership-section', (node) => node.scrollIntoView({ behavior: 'instant', block: 'center' }))
  await delay(350)
  assert.equal(await page.$eval('.brand-membership-art .scene-ripple', (node) => getComputedStyle(node).animationName), 'scene-ripple')
  const memberOrbit = await transform('.membership-orbit')
  await page.evaluate(() => window.scrollBy({ top: 150, behavior: 'instant' }))
  await delay(300)
  assert.notEqual(await transform('.membership-orbit'), memberOrbit, 'Membership circle must follow scroll')
  await delay(1000)
  await page.screenshot({ path: '/tmp/griha-motion-membership.png' })
  for (const width of [240, 280, 320, 360, 390, 768, 1024, 1440]) {
    await page.setViewport({ width, height: 900 })
    for (const route of ['/', '/market', '/rewards', '/account']) {
      await page.goto(base + route)
      await delay(1100)
      const overflow = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth,
        elements: [...document.querySelectorAll('main *')].filter((node) => node.getBoundingClientRect().right > innerWidth + 2 && getComputedStyle(node).position !== 'absolute').slice(0, 5).map((node) => node.className) }))
      assert(overflow.scroll <= width + 1, route + ' overflow at ' + width + ': ' + JSON.stringify(overflow))
      for (const href of ['/login', '/register']) {
        assert(await page.$eval('header a[href="' + href + '"]', (node) => { const r = node.getBoundingClientRect(); return r.width > 0 && r.left >= 0 && r.right <= innerWidth }), 'Auth link visible at ' + width)
      }
      if (route === '/' && [240, 320, 390].includes(width)) {
        await page.screenshot({ path: '/tmp/griha-motion-mobile-' + width + '.png' })
        await page.$eval('.market-scene', (node) => node.scrollIntoView({ behavior: 'instant', block: 'center' }))
        await delay(1700)
        await page.waitForFunction(() => [...document.querySelectorAll('.scene-product')].every((node) => Number(getComputedStyle(node).opacity) > .99))
        await page.screenshot({ path: '/tmp/griha-motion-scene-' + width + '.png' })
      }
    }
  }
  await page.setViewport({ width: 390, height: 844 })
  await page.goto(base)
  await page.click('header a[href="/login"]')
  await page.waitForFunction(() => location.pathname === '/login')
  await page.goto(base)
  await page.click('header a[href="/register"]')
  await page.waitForFunction(() => location.pathname === '/register')
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto(base)
  await page.$eval('.market-scene', (node) => node.scrollIntoView({ behavior: 'instant', block: 'center' }))
  await delay(500)
  const reduced = await transform('.market-scene-orbit')
  await page.evaluate(() => window.scrollBy({ top: 80, behavior: 'instant' }))
  await delay(300)
  assert.equal(await transform('.market-scene-orbit'), reduced, 'Reduced motion disables scroll rotation')
  assert.equal(await page.$eval('.market-scene .scene-ripple', (node) => getComputedStyle(node).animationName), 'none')
  assert.deepEqual(errors, [])
  console.log('PASS: scroll entrances, moving ovals, ripples, auth links, 240–1440px layouts and reduced motion; no browser errors.')
} finally { await browser.close() }
