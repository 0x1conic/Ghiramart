import puppeteer from 'puppeteer-core'
import assert from 'node:assert/strict'

const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const page = await browser.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173'
const settle = () => new Promise((resolve) => setTimeout(resolve, 850))

try {
  await page.setViewport({ width: 1440, height: 1000 })
  // Verify resolved colors, not merely DOM presence: the previous bug rendered dark links on a dark header.
  for (const route of ['/', '/rewards', '/checkout', '/products/himalayan-basmati-rice']) {
    await page.goto(base + route)
    await page.waitForSelector('header nav a')
    const checks = await page.evaluate(() => {
      const context = document.createElement('canvas').getContext('2d')
      const rgb = (color) => { context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1); return [...context.getImageData(0, 0, 1, 1).data] }
      const composite = (front, back) => front.slice(0, 3).map((v, i) => v * front[3] / 255 + back[i] * (1 - front[3] / 255))
      const luminance = (color) => color.map((value) => { const v = value / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4 }).reduce((sum, value, i) => sum + value * [.2126, .7152, .0722][i], 0)
      const header = document.querySelector('header')
      return [...header.querySelectorAll('a')].map((link) => {
        const style = getComputedStyle(link)
        const headerBg = composite(rgb(getComputedStyle(header).backgroundColor), [249, 244, 229])
        const bg = composite(rgb(style.backgroundColor), headerBg)
        const a = luminance(composite(rgb(style.color), bg)), b = luminance(bg)
        return { label: link.textContent || link.getAttribute('aria-label'), contrast: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) }
      })
    })
    for (const check of checks) assert(check.contrast >= 4.5, route + ': unreadable navigation ' + JSON.stringify(check))
  }
  await page.goto(base + '/')
  await page.click('header a[href="/rewards"]')
  await page.waitForSelector('.membership-card')
  await settle()
  assert.equal(await page.$eval('header nav a[href="/rewards"]', (link) => link.getAttribute('aria-current')), 'page')
  const bounds = await page.$eval('.membership-card', (node) => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } })
  await page.mouse.move(bounds.x + bounds.width * .8, bounds.y + bounds.height * .2)
  await settle()
  const tilted = await page.$eval('.membership-card .depth-surface', (node) => getComputedStyle(node).transform)
  assert(tilted.startsWith('matrix3d'), 'Membership card should rotate in 3D on mouse movement')
  await page.screenshot({ path: '/tmp/griha-rewards-desktop.png', fullPage: true })
  await browser.defaultBrowserContext().overridePermissions(base, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write'])
  await page.$eval('button[aria-label="Copy referral code"]', (node) => node.scrollIntoView({ behavior: 'instant', block: 'center' }))
  await settle()
  await page.click('button[aria-label="Copy referral code"]')
  await settle()
  await page.waitForFunction(() => [...document.querySelectorAll('[role="status"]')].some((node) => node.textContent === 'Referral code copied.'))
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'BIJAYA150')
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent === 'redeemed').click())
  assert.equal(await page.$$eval('.divide-y > div', (rows) => rows.length), 1)

  for (const width of [390, 768]) {
    await page.setViewport({ width, height: 844 })
    await page.goto(base + '/rewards')
    await settle()
    const overflow = await page.evaluate(() => [...document.querySelectorAll('main *')].filter((node) => node.getBoundingClientRect().right > innerWidth + 1).map((node) => ({ tag: node.tagName, class: node.className, right: node.getBoundingClientRect().right })))
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Rewards horizontal overflow at ' + width + ': ' + JSON.stringify(overflow))
    if (width === 390) {
      await page.click('nav[aria-label="Mobile navigation"] a[href="/market"]')
      await page.waitForSelector('section[aria-label="Products"]')
      await page.click('nav[aria-label="Mobile navigation"] a[href="/rewards"]')
      await page.waitForSelector('.membership-card')
      await settle()
      await page.screenshot({ path: '/tmp/griha-rewards-mobile.png', fullPage: true })
      assert.equal(await page.$eval('nav[aria-label="Mobile navigation"] a[href="/rewards"]', (link) => link.getAttribute('aria-current')), 'page')
    }
  }
  await page.setViewport({ width: 1440, height: 1000 })
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto(base + '/rewards')
  await page.waitForSelector('.membership-card')
  await page.hover('.membership-card')
  await settle()
  assert.equal(await page.$eval('.membership-card .depth-surface', (node) => getComputedStyle(node).transform), 'none')
  assert.deepEqual(errors, [])
  console.log('PASS: navigation contrast on light/dark pages, Offers navigation, 3D pointer response, referral clipboard, history filter, mobile/tablet overflow and navigation, reduced motion; no browser errors.')
} finally { await browser.close() }
