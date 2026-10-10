import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] })
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 180, height: 900 })
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  for (const route of ['/products/himalayan-basmati-rice', '/rewards', '/account', '/member', '/member/orders', '/login', '/register']) {
    await page.goto('http://127.0.0.1:4173' + route)
    await new Promise(resolve => setTimeout(resolve, 450))
    console.log(route, await page.evaluate(() => {
      const texts = []
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let node
      while ((node = walker.nextNode())) {
        if (!node.textContent.trim() || node.parentElement.closest('nav, script, style')) continue
        const range = document.createRange(); range.selectNodeContents(node)
        const r = range.getBoundingClientRect()
        if (r.right > innerWidth + 1) texts.push({ text: node.textContent.slice(0, 70), parent: node.parentElement.className, right: r.right })
      }
      return { width: innerWidth, scroll: document.documentElement.scrollWidth, texts: texts.slice(0, 12) }
    }))
  }
} finally { await browser.close() }
