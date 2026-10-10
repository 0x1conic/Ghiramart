import puppeteer from 'puppeteer-core'
import assert from 'node:assert/strict'

const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173'
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] })
const admin = await browser.newPage()
const market = await browser.newPage()
const errors = []
for (const page of [admin, market]) {
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
}
const fill = async (page, name, value) => { await page.bringToFront(); await page.locator('[name="' + name + '"]').fill(value) }
const click = async (page, label) => page.$$eval('button', (buttons, label) => {
  const button = buttons.find(button => button.textContent.trim().includes(label))
  if (!button) throw Error('Button missing: ' + label)
  button.click()
}, label)

try {
  await admin.setViewport({ width: 1440, height: 960 })
  await market.setViewport({ width: 1440, height: 960 })
  await market.goto(base + '/market')
  await admin.goto(base + '/admin/products')
  await click(admin, 'Add category')
  await admin.waitForSelector('.category-creator')
  await fill(admin, 'name', 'Tea & Biscuits')
  await fill(admin, 'mood', 'Tea-time favourites')
  await admin.select('select[name="accent"]', 'amber')
  await click(admin, 'Create category')
  await admin.waitForFunction(() => !document.querySelector('.category-creator'))
  const category = await admin.evaluate(() => JSON.parse(localStorage.getItem('griha-mart:categories:v1')).find(category => category.name === 'Tea & Biscuits'))
  assert(category?.id)
  await market.waitForFunction(() => document.body.textContent.includes('Tea-time favourites'))

  await admin.goto(base + '/admin/products/new')
  await admin.waitForSelector('select[name="categoryId"]')
  assert(await admin.$eval('select[name="categoryId"]', (select, id) => [...select.options].some(option => option.value === id), category.id))
  await admin.select('select[name="categoryId"]', category.id)
  for (const [name, value] of Object.entries({ name: 'Masala Tea Biscuits', sku: 'TEA-BISCUIT-CHECK', unit: '300 g', price: '180', stock: '24' })) await fill(admin, name, value)
  await click(admin, 'Publish product')
  await admin.waitForFunction(() => document.body.textContent.includes('Published. This product'))
  await market.waitForFunction(() => document.body.textContent.includes('Masala Tea Biscuits'))
  await market.$$eval('button', buttons => buttons.find(button => button.textContent.trim() === 'Tea-time favourites').click())
  await market.waitForFunction(id => new URLSearchParams(location.search).get('category') === id, {}, category.id)
  await market.waitForFunction(() => !document.body.textContent.includes('Himalayan Basmati Rice'))
  assert(await market.$$eval('.grocery-card', cards => cards.every(card => card.textContent.includes('Masala Tea Biscuits'))))

  await admin.goto(base + '/admin/products')
  await click(admin, 'Add category')
  await fill(admin, 'name', 'Tea & Biscuits')
  await fill(admin, 'mood', 'Another label')
  await click(admin, 'Create category')
  await admin.waitForFunction(() => document.body.textContent.includes('already exists'))
  await admin.reload()
  assert(await admin.$eval('body', body => body.textContent.includes('Categories')))
  for (const width of [180, 320, 768, 1440]) {
    await admin.setViewport({ width, height: 900 })
    await admin.goto(base + '/admin/products')
    await click(admin, 'Add category')
    await admin.waitForSelector('.category-creator')
    const layout = await admin.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth, offenders: [...document.querySelectorAll('body *')].filter(node => { const rect = node.getBoundingClientRect(); return rect.right > innerWidth + 1 && getComputedStyle(node).position !== 'absolute' }).slice(0, 8).map(node => ({ tag: node.tagName, className: String(node.className), text: node.textContent?.trim().slice(0, 40), right: Math.round(node.getBoundingClientRect().right) })) }))
    assert.equal(layout.scrollWidth <= width + 1, true, 'Category form overflow at ' + width + ': ' + JSON.stringify(layout))
  }
  assert.deepEqual(errors, [])
  console.log('PASS: add category, duplicate validation, persistence, product assignment, live market filtering and 180–1440px layouts; no browser errors.')
} finally { await browser.close() }
