import puppeteer from 'puppeteer-core'

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173'
const routes = [
  '/', '/market', '/search', '/products/himalayan-basmati-rice',
  '/products/red-onions', '/products/golden-potatoes', '/products/ripe-bananas', '/cart', '/checkout',
  '/order-confirmation/GM-2048', '/login', '/register', '/forgot-password', '/reset-password',
  '/member', '/member/addresses', '/member/orders', '/member/orders/GM-2048', '/rewards', '/account', '/states',
  '/admin', '/admin/login', '/admin/dashboard', '/admin/products', '/admin/products/new', '/admin/products/rice-5kg/edit',
  '/admin/orders', '/admin/orders/GM-2048', '/admin/customers', '/admin/rewards', '/admin/promotions',
]

const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] })
const page = await browser.newPage()
const errors = []

async function clickButton(text) {
  const clicked = await page.$$eval('button', (buttons, label) => {
    const button = buttons.find((candidate) => candidate.textContent?.includes(label))
    if (!button) return false
    button.click()
    return true
  }, text)
  if (!clicked) throw new Error(`Button not found: ${text}`)
}

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`)
})
page.on('pageerror', (error) => errors.push(`page: ${error.message}`))

await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 1 })
for (const route of routes) {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' })
  if (!response?.ok()) throw new Error(`${route}: HTTP ${response?.status()}`)
  await page.waitForSelector('#root > *', { timeout: 5000 })
  const textLength = await page.$eval('#root', (root) => root.textContent?.trim().length || 0)
  if (textLength < 10) throw new Error(`${route}: rendered content is unexpectedly empty`)
  const visibleCopy = await page.$eval('body', body => body.innerText)
  if (/frontend demo|backend|demo profile|not protected|mock services|every api response|test details/i.test(visibleCopy)) throw new Error(`${route}: developer-only copy is visible`)
}

await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' })
await new Promise((resolve) => setTimeout(resolve, 1800))
const homeHero = await page.$eval('section.page-shell', (section) => getComputedStyle(section).backgroundColor)
if (homeHero === 'rgb(11, 13, 12)' || homeHero === 'rgb(8, 18, 14)') throw new Error('Home: hero unexpectedly uses the old dark theme')
const heroProductCount = await page.$$eval('.hero-product-stage a[href^="/products/"]', (links) => links.length)
if (heroProductCount !== 7) throw new Error(`Home: expected 7 interactive hero products, found ${heroProductCount}`)
await page.screenshot({ path: '/tmp/griha-desktop-home.png', fullPage: true })

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.$eval('header nav a[href="/rewards"]', (link) => link.click())
await page.waitForFunction(() => window.location.pathname === '/rewards' && window.scrollY === 0)
const rewardsHeader = await page.$eval('header', (header) => ({
  position: getComputedStyle(header).position,
  top: header.getBoundingClientRect().top,
  visible: header.getBoundingClientRect().height > 0,
}))
if (rewardsHeader.position !== 'fixed' || rewardsHeader.top !== 0 || !rewardsHeader.visible) {
  throw new Error(`Rewards: persistent header check failed (${JSON.stringify(rewardsHeader)})`)
}

await page.goto(`${baseUrl}/market`, { waitUntil: 'domcontentloaded' })
const marketProductCount = await page.$$eval('section[aria-label="Products"] article', (cards) => cards.length)
if (marketProductCount !== 13) throw new Error(`Market: expected 13 products, found ${marketProductCount}`)
await page.waitForFunction(() => [...document.querySelectorAll('section[aria-label="Products"] img')].every((image) => image.complete && image.naturalWidth > 0))
const assetChecks = await page.$$eval('section[aria-label="Products"] img', (images) => images.map((image) => {
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0)
  return { src: image.getAttribute('src'), width: image.naturalWidth, cornerAlpha: context.getImageData(0, 0, 1, 1).data[3] }
}))
if (assetChecks.some((asset) => asset.width < 1024 || asset.cornerAlpha !== 0)) throw new Error(`Catalog assets need high resolution and transparent corners: ${JSON.stringify(assetChecks)}`)
for (const [name, slug] of [['Red Onions', 'red-onions'], ['Golden Potatoes', 'golden-potatoes'], ['Ripe Bananas', 'ripe-bananas']]) {
  if (!await page.$(`a[aria-label="View ${name}"][href="/products/${slug}"]`)) throw new Error(`Missing product link: ${name}`)
  await page.$eval(`button[aria-label="Add ${name} to basket"]`, (button) => button.click())
}
await page.screenshot({ path: '/tmp/griha-refreshed-catalog-desktop.png', fullPage: true })
const addButton = await page.$('button[aria-label^="Add "]')
if (!addButton) throw new Error('Market: add-to-basket button not found')
await addButton.click()
await page.waitForFunction(() => document.body.textContent?.includes('added to your basket.'))
await page.locator('input[placeholder^="Search rice"]').fill('unfindable-product')
await page.waitForFunction(() => document.body.textContent?.includes('Nothing matched that craving.'))

await page.goto(`${baseUrl}/cart`, { waitUntil: 'domcontentloaded' })
await clickButton('Clear')
await page.waitForFunction(() => document.body.textContent?.includes('Your basket is ready for its first hero.'))

await page.goto(`${baseUrl}/checkout`, { waitUntil: 'domcontentloaded' })
  for (const [name, value] of Object.entries({ recipient: 'Demo Customer', phone: '+977 9800000123', address: 'Demo Tole', city: 'Pokhara' })) await page.locator('input[name="' + name + '"]').fill(value)
await clickButton('Place order')
await page.waitForFunction(() => window.location.pathname.startsWith('/order-confirmation/'), { timeout: 5000 })

await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' })
await clickButton('Enter Griha Mart')
await page.waitForFunction(() => document.body.textContent?.includes('This field is required.'))

await page.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded' })
await clickButton('Enter dashboard')
await page.waitForFunction(() => document.body.textContent?.includes('Enter your admin email.') && document.body.textContent?.includes('six-digit admin access code.'))

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' })
const navCount = await page.$$eval('nav[aria-label="Mobile navigation"] a', (links) => links.length)
if (navCount !== 5) throw new Error(`mobile navigation: expected 5 links, found ${navCount}`)
await new Promise((resolve) => setTimeout(resolve, 1200))
await page.screenshot({ path: '/tmp/griha-mobile-home.png', fullPage: true })

for (const width of [390, 1440]) {
  await page.setViewport({ width, height: 960, deviceScaleFactor: 1 })
  await page.goto(`${baseUrl}/admin/promotions`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('nav[aria-label="Admin navigation"]')
  if (await page.$$eval('nav[aria-label="Admin navigation"] a', links => links.length) !== 6) throw new Error('Admin navigation links are missing')
  await new Promise(resolve => setTimeout(resolve, 400))
  if (!(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))) throw new Error('Promotions overflows at ' + width)
  await page.screenshot({ path: `/tmp/griha-promotions-copy-${width}.png`, fullPage: true })
}
await browser.close()
if (errors.length) throw new Error(`Browser errors:\n${errors.join('\n')}`)
console.log(`Validated ${routes.length} routes, responsive mobile navigation, search, cart, COD checkout, and authentication validation with no browser-console errors.`)
