import assert from 'node:assert/strict'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] })
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173'

try {
  await page.setViewport({ width: 1440, height: 960 })
  await page.goto(base + '/products/himalayan-basmati-rice')
  await page.waitForSelector('.product-gallery-thumbs')
  assert.equal(await page.$$eval('.product-gallery-thumbs button', nodes => nodes.length), 3, 'Seeded rice includes three gallery views')
  await page.goto(base + '/admin/products/new')
  await page.waitForSelector('.studio-upload-button input[type="file"]')
  const upload = await page.$('.studio-upload-button input[type="file"]')
  await upload.uploadFile(path.resolve('public/assets/products/masoor-dal.png'), path.resolve('public/assets/products/mustard-oil.png'))
  await page.waitForFunction(() => document.querySelectorAll('.studio-gallery article').length === 3)
  assert.equal(await page.$$eval('.studio-gallery article', nodes => nodes.length), 3)
  await page.click('.studio-gallery article:nth-child(3) .studio-gallery-actions button:nth-child(2)')
  assert.equal(await page.$eval('.studio-gallery article:first-child', node => node.classList.contains('is-cover')), true)

  for (const [name, value] of Object.entries({ name: 'Gallery Test Product', sku: 'GM-GALLERY-TEST', unit: '1 pack', price: '450', stock: '12' })) {
    await page.click(`[name="${name}"]`)
    await page.type(`[name="${name}"]`, value)
  }
  await page.click('.studio-actions button[type="submit"]')
  await page.waitForFunction(() => document.querySelector('.studio-success, .studio-error'))
  assert.match(await page.$eval('.studio-success, .studio-error', node => node.textContent || ''), /Published/)
  const productUrl = await page.$eval('.studio-view', node => node.getAttribute('href'))
  await page.goto(base + productUrl)
  await new Promise(resolve => setTimeout(resolve, 800))
  if (!await page.$('.product-gallery-thumbs')) {
    const diagnostic = await page.evaluate(() => { const product = JSON.parse(localStorage.getItem('griha-mart:products:v1') || '[]').find(product => product.name === 'Gallery Test Product'); return { url: location.href, text: document.body.innerText.slice(0, 500), saved: product && { id: product.id, slug: product.slug, publication: product.publication, status: product.status, imageCount: product.images?.length, imageLength: product.image?.length, categoryId: product.categoryId } } })
    throw new Error(`Gallery did not render: ${JSON.stringify(diagnostic)}`)
  }
  await page.waitForSelector('.product-gallery-thumbs')
  assert.equal(await page.$$eval('.product-gallery-thumbs button', nodes => nodes.length), 3)
  const first = await page.$eval('.product-gallery-main > img', node => node.getAttribute('src'))
  await page.click('.product-gallery-thumbs button:nth-child(2)')
  await page.waitForFunction(previous => document.querySelector('.product-gallery-main > img')?.getAttribute('src') !== previous, {}, first)
  await page.setViewport({ width: 320, height: 844 })
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true)
  assert.deepEqual(errors, [])
  console.log('PASS: multi-upload, cover selection, publish, gallery thumbnails and mobile layout.')
} finally { await browser.close() }
