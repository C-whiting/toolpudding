import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, mkdir } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { toolMetadata } from '../src/app/metadata.js'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'file:///C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')
const root = resolve('dist')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' }
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const target = resolve(root, `.${pathname}${extname(pathname) ? '' : '/index.html'}`)
    if (!target.startsWith(root + sep)) throw new Error('Outside build directory')
    response.setHeader('Content-Type', types[extname(target)] || 'application/octet-stream')
    response.end(await readFile(target))
  } catch { response.writeHead(404); response.end('Not found') }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
let browser
const errors = []
const externalRequests = []

try {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  await mkdir('.tmp/date-calculator', { recursive: true })
  for (const profile of [
    { name: 'desktop', viewport: { width: 1440, height: 1000 }, timezoneId: 'America/Chicago', today: '2026-10-07' },
    { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, timezoneId: 'America/Los_Angeles', today: '2026-10-07' },
    { name: 'small-mobile', viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true, timezoneId: 'Pacific/Kiritimati', today: '2026-10-08' },
  ]) {
    const { name, today, ...options } = profile
    const context = await browser.newContext({ ...options, permissions: ['clipboard-read', 'clipboard-write'] })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(`${name}: ${error.message}`))
    page.on('request', request => { if (!request.url().startsWith(origin)) externalRequests.push(request.url()) })
    await page.clock.setFixedTime(new Date('2026-10-08T02:00:00Z'))
    await page.goto(`${origin}/date-calculator`)
    const panel = page.getByRole('tabpanel', { name: 'Add / Subtract', exact: true })
    const result = () => page.locator('.date-result')
    await assert.equal(await panel.getByLabel('Starting date', { exact: true }).inputValue(), today)
    assert.equal(await page.locator('h1').count(), 1)
    assert.equal(await page.title(), 'Date Calculator – Add, Subtract & Count Days | ToolPudding')
    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://toolpudding.com/date-calculator')
    await panel.getByLabel('Starting date', { exact: true }).fill('2026-10-06')
    await panel.getByLabel('Amount', { exact: true }).fill('90')
    assert.match(await result().innerText(), /January 4, 2027/)
    assert.match(await result().innerText(), /Monday/)
    assert.match(await result().innerText(), /12 weeks \+ 6 days/)
    await panel.getByLabel('Starting date', { exact: true }).fill('2024-01-31')
    await panel.getByLabel('Amount', { exact: true }).fill('1')
    await panel.getByLabel('Unit', { exact: true }).selectOption('months')
    assert.match(await result().innerText(), /February 29, 2024/)
    await panel.getByLabel('Starting date', { exact: true }).fill('2024-02-29')
    await panel.getByLabel('Unit', { exact: true }).selectOption('years')
    assert.match(await result().innerText(), /February 28, 2025/)
    await panel.getByLabel('Amount', { exact: true }).fill('-1')
    assert.match(await result().innerText(), /non-negative whole number/)
    assert.equal(await page.getByRole('button', { name: 'Copy Result', exact: true }).isDisabled(), true)
    await panel.getByLabel('Amount', { exact: true }).fill('1')

    // Roving tab focus and panel relationships; Tab enters the first field.
    await page.getByRole('tab', { name: 'Add / Subtract', exact: true }).focus()
    await page.keyboard.press('ArrowRight')
    assert.equal(await page.getByRole('tab', { name: 'Days Between', exact: true }).getAttribute('aria-selected'), 'true')
    await page.keyboard.press('Tab')
    assert.equal(await page.getByRole('tabpanel', { name: 'Days Between', exact: true }).getByLabel('Start date', { exact: true }).evaluate(element => document.activeElement === element), true)
    const range = page.getByRole('tabpanel', { name: 'Days Between', exact: true })
    await range.getByLabel('Start date', { exact: true }).fill('2026-10-12')
    await range.getByLabel('End date', { exact: true }).fill('2026-10-09')
    assert.match(await result().innerText(), /^3 days/)
    assert.match(await result().innerText(), /entered in reverse/)
    await range.getByRole('checkbox', { name: 'Include end date (the later date)', exact: true }).check()
    assert.match(await result().innerText(), /^4 days/)
    await page.getByRole('tab', { name: 'Days Between', exact: true }).focus()
    await page.keyboard.press('End')
    assert.equal(await page.getByRole('tab', { name: 'Business Days', exact: true }).getAttribute('aria-selected'), 'true')
    const business = page.getByRole('tabpanel', { name: 'Business Days', exact: true })
    await business.getByLabel('Starting date', { exact: true }).fill('2026-10-10')
    await business.getByLabel('Amount', { exact: true }).fill('1')
    assert.match(await result().innerText(), /October 12, 2026/)
    await business.getByLabel('Operation', { exact: true }).selectOption('subtract')
    assert.match(await result().innerText(), /October 9, 2026/)
    await business.getByLabel('Calculate', { exact: true }).selectOption('between')
    await business.getByLabel('Start date', { exact: true }).fill('2026-10-09')
    await business.getByLabel('End date', { exact: true }).fill('2026-10-12')
    await business.getByRole('checkbox').uncheck()
    assert.match(await result().innerText(), /^1 business day/)
    await business.getByRole('checkbox').check()
    assert.match(await result().innerText(), /^2 business days/)
    await page.getByRole('button', { name: 'Copy Result', exact: true }).focus()
    await page.keyboard.press('Enter')
    await page.getByText('Result copied.', { exact: true }).waitFor()
    assert.equal(await page.locator('.date-copy-notice').innerText(), 'Result copied.')
    assert.match(await page.evaluate(() => navigator.clipboard.readText()), /2 business days/)
    await page.evaluate(() => { Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Clipboard blocked') } } }) })
    await page.getByRole('button', { name: 'Copy Result', exact: true }).click()
    await page.getByLabel('Copy this result', { exact: true }).waitFor()
    assert.match(await page.getByLabel('Copy this result', { exact: true }).inputValue(), /2 business days/)
    await page.getByRole('button', { name: 'Reset', exact: true }).focus()
    await page.keyboard.press('Space')
    assert.equal(await business.getByLabel('Starting date', { exact: true }).inputValue(), today)
    assert.equal(await business.getByLabel('Operation', { exact: true }).inputValue(), 'add')
    await page.getByRole('tab', { name: 'Business Days', exact: true }).focus()
    await page.keyboard.press('Home')
    assert.equal(await page.getByRole('tab', { name: 'Add / Subtract', exact: true }).getAttribute('aria-selected'), 'true')
    assert.equal(await panel.getByLabel('Unit', { exact: true }).inputValue(), 'days')
    assert.equal(await panel.getByLabel('Amount', { exact: true }).inputValue(), '90')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `${name}: page overflow`)
    const fields = await page.locator('.date-fields input:visible, .date-fields select:visible, .date-tabs button').evaluateAll(elements => elements.map(element => ({ width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height })))
    assert.ok(fields.every(field => field.width >= 44 && field.height >= 44), `${name}: touch targets`)
    await page.screenshot({ path: `.tmp/date-calculator/${name}.png`, fullPage: true })
    await page.reload()
    assert.equal(await panel.getByLabel('Starting date', { exact: true }).inputValue(), today)
    await page.goto(origin)
    assert.equal(await page.locator('.tool-directory .tool-card').count(), 4)
    await page.locator('.tool-directory').getByRole('link', { name: /Date Calculator/ }).click()
    await page.waitForURL(`${origin}/date-calculator`)
    assert.equal(await panel.getByLabel('Starting date', { exact: true }).inputValue(), today)
    assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'), 'https://toolpudding.com/date-calculator')
    if (name === 'desktop') {
      // Existing routes still mount after shared registry changes.
      for (const path of ['/image-resizer', '/name-generator', '/spin-the-wheel']) {
        await page.goto(`${origin}${path}`)
        assert.equal(await page.locator('h1').count(), 1)
      }
    }
    await context.close()
    console.log(`${name}: local today, live calculations, reversed/inclusive ranges, keyboard tabs, copy/reset, refresh, home navigation, touch targets and overflow passed`)
  }

  for (const tool of toolMetadata) {
    const html = await readFile(`dist${tool.path}/index.html`, 'utf8')
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1)
    assert.ok(html.includes(`rel="canonical" href="https://toolpudding.com${tool.path}"`))
    const escape = text => text.replaceAll('&', '&amp;')
    assert.ok(html.includes(`<title>${escape(tool.pageTitle)}</title>`))
    for (const key of ['description', 'og:description', 'twitter:description']) assert.ok(html.includes(`${key}" content="${escape(tool.description)}"`))
    for (const key of ['og:title', 'twitter:title']) assert.ok(html.includes(`${key}" content="${escape(tool.pageTitle)}"`))
    assert.ok(html.includes(`og:url" content="https://toolpudding.com${tool.path}"`))
  }
  const staticDate = await readFile('dist/date-calculator/index.html', 'utf8')
  assert.ok(staticDate.indexOf('class="date-calculator') < staticDate.indexOf('class="tool-guide"'))
  assert.ok((await readFile('dist/sitemap.xml', 'utf8')).includes('<loc>https://toolpudding.com/date-calculator</loc>'))
  assert.equal(await readFile('dist/robots.txt', 'utf8'), await readFile('public/robots.txt', 'utf8'))
  assert.deepEqual(errors, [])
  assert.deepEqual(externalRequests, [])
  console.log('Static metadata/H1/canonical/social tags, sitemap, robots, zero browser errors and no external requests passed')
} finally {
  await browser?.close()
  await new Promise(resolve => server.close(resolve))
}
