import puppeteer from 'puppeteer-core'
import assert from 'node:assert/strict'

const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] })
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173'
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const transform = selector => page.$eval(selector, node => getComputedStyle(node).transform)
const ready = async () => {
  await page.waitForSelector('.auth-form-panel')
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.auth-form-panel')).opacity) > .99)
  await delay(500)
}
try {
  await page.setViewport({ width: 1440, height: 960 })
  await page.goto(base + '/register')
  await ready()
  for (const [name, value] of Object.entries({ fullName: 'Login Demo', email: 'hello@grihamart.com', phone: '+977 9800000000', password: 'testpassword' })) await page.type('input[name="' + name + '"]', value)
  await page.$eval('.auth-submit', node => node.click())
  await page.waitForFunction(() => location.pathname === '/member')
  await page.goto(base + '/login')
  await page.bringToFront()
  await ready()
  await delay(2000)
  await page.screenshot({ path: '/tmp/griha-auth-login-desktop.png', fullPage: true })
  const sun = await transform('.auth-sun')
  const rice = await transform('.auth-rice > div')
  const orbit = await transform('.auth-orbit')
  await delay(1200)
  assert.notEqual(await transform('.auth-sun'), sun, 'Golden sun animates')
  assert.notEqual(await transform('.auth-rice > div'), rice, 'Rice animates')
  assert.notEqual(await transform('.auth-orbit'), orbit, 'Orbit animates')
  await page.focus('input[name="email"]')
  await page.type('input[name="email"]', 'hello@grihamart.com')
  await delay(8500)
  assert.equal(await page.$eval('input[name="email"]', node => node.value), 'hello@grihamart.com')
  assert.equal(await page.$eval('.auth-form-panel', node => getComputedStyle(node).opacity), '1', 'Form stays visible past the loop')
  assert.equal(await page.$('.auth-motion-preference'), null, 'No manual reduce-animation control is shown')
  await page.click('.auth-submit')
  await page.waitForSelector('#password-error')
  await page.type('input[name="password"]', 'testpassword')
  await page.click('.auth-submit')
  await page.waitForFunction(() => location.pathname === '/member')

  for (const route of ['/login', '/register']) {
    for (const width of [240, 320, 390, 768, 1024, 1440]) {
      await page.setViewport({ width, height: width < 768 ? 844 : 960 })
      await page.goto(base + route)
      await ready()
      await delay(1600)
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route + ' overflows at ' + width)
      assert(await page.$$eval('.auth-form-panel input:not([type="checkbox"])', nodes => nodes.every(node => {
        const r = node.getBoundingClientRect(); return r.width > 0 && r.left >= 0 && r.right <= innerWidth
      })), route + ' fields fit at ' + width)
      if ([390, 1440].includes(width)) await page.screenshot({ path: '/tmp/griha-auth-' + route.slice(1) + '-' + width + '.png', fullPage: true })
      if (route === '/register' && [390, 1440].includes(width)) {
        const before = await transform('.auth-rice > div')
        await delay(600)
        assert.notEqual(await transform('.auth-rice > div'), before, 'Registration groceries animate at ' + width)
      }
      console.log('Layout passed:', route, width)
    }
  }
  await page.setViewport({ width: 390, height: 844 })
  await page.goto(base + '/register')
  await ready()
  await page.focus('input[name="fullName"]')
  await page.$eval('.auth-submit', node => node.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await delay(250)
  await page.click('.auth-submit')
  await page.waitForSelector('#fullName-error')
  assert.equal((await page.$$('[role="alert"]')).length, 4)
  for (const [name, value] of Object.entries({ fullName: 'Demo Member', email: 'member@example.com', phone: '+977 9800000000', password: 'testpassword' })) await page.type('input[name="' + name + '"]', value)
  await page.$eval('.auth-submit', node => node.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await page.click('.auth-submit')
  await page.waitForFunction(() => location.pathname === '/member')
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  for (const route of ['/login', '/register']) {
    await page.goto(base + route)
    await ready()
    const reduced = await transform('.auth-rice > div')
    await delay(500)
    assert.equal(await transform('.auth-rice > div'), reduced, 'System reduced motion is respected')
    assert.equal(await page.$eval('.auth-form-panel', node => getComputedStyle(node).opacity), '1')
  }
  await page.goto(base + '/login')
  await ready()
  await page.$eval('.auth-form-panel button[type="button"]', node => node.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await page.click('.auth-form-panel button[type="button"]')
  await page.waitForSelector('.auth-form-panel [role="status"]')
  assert((await page.$eval('.auth-form-panel [role="status"]', node => node.textContent)).includes('currently unavailable'))
  await page.click('.auth-back')
  await page.waitForFunction(() => location.pathname === '/')
  assert.deepEqual(errors, [])
  console.log('PASS: auth motion, full loop, automatic reduced motion, validation, submission, 240–1440px layouts; no browser errors.')
} finally { await browser.close() }
