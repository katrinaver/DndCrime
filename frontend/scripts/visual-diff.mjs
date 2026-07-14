#!/usr/bin/env node
import { chromium } from 'playwright-core'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const cfg = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => {
  if (v.startsWith('--')) a.push([v.slice(2), all[i + 1]])
  return a
}, []))
if (!cfg.baseline || !cfg.current || !cfg.out || !cfg.token) throw new Error('missing --baseline/--current/--out/--token')

const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/privacy-policy', '/terms-of-service']
const protectedRoutes = ['/home', '/campaigns', '/campaigns/new', '/calendar', '/characters', '/characters/new/general', '/characters/new/campaign', '/characters/new/classic', '/profile', '/news', '/notes']
const viewports = [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]
const user = { id: 'google:117866390602140110240', email: 'averkatrin@gmail.com', name: 'Katrin Aver' }
const safe = (route) => route === '/' ? '_root' : route.replaceAll('/', '_').replace(/[^a-zA-Z0-9_-]/g, '_')

async function dynamicRoutes(base) {
  const headers = { Authorization: `Bearer ${cfg.token}` }
  const get = async (path) => {
    const response = await fetch(`${base}${path}`, { headers })
    return response.ok ? response.json() : null
  }
  const [campaigns, characters] = await Promise.all([get('/api/campaigns'), get('/api/characters')])
  const routes = []
  for (const campaign of Array.isArray(campaigns) ? campaigns : campaigns?.campaigns ?? []) {
    const id = campaign.id
    if (!id) continue
    for (const part of ['menu', 'chat', 'assets', 'progress', 'achievements']) routes.push(`/campaigns/${id}/${part}`)
    if (campaign.role === 'master' || campaign.masterId === user.id) {
      for (const part of ['settings', 'participants', 'chat', 'assets', 'progress']) routes.push(`/campaigns/${id}/master/${part}`)
    }
    routes.push(`/characters/new/campaign/${id}`)
  }
  for (const character of Array.isArray(characters) ? characters : characters?.characters ?? []) {
    if (character.id) routes.push(`/characters/${character.id}`)
  }
  return routes
}

async function capture(browser, base, route, auth, viewport, path) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: viewport.name === 'mobile' ? 2 : 1, reducedMotion: 'reduce' })
  await context.addInitScript(({ auth, token, user }) => {
    let state = 0x2f6e2b1
    Math.random = () => {
      state ^= state << 13; state ^= state >>> 17; state ^= state << 5
      return (state >>> 0) / 0x1_0000_0000
    }
    if (auth) {
      localStorage.setItem('dndcrime-auth-token', token)
      localStorage.setItem('dndcrime-auth-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('dndcrime-auth-token')
      localStorage.removeItem('dndcrime-auth-user')
    }
  }, { auth, token: cfg.token, user })
  const page = await context.newPage()
  const start = new Date('2026-01-01T00:00:00Z')
  await page.clock.install({ time: start })
  await page.clock.pauseAt(new Date(start.getTime() + 1))
  // waitForLoadState('networkidle') нельзя переиспользовать: он срабатывает один раз,
  // а поздние фетчи стартуют по таймерам, которые оживают только от clock.runFor.
  // Считаем незавершённые запросы сами и ждём реальной тишины в сети.
  // Тишину меряем по отметке последней сетевой активности, а не по снимкам счётчика:
  // на быстром бэкенде целый всплеск запросов успевает начаться и закончиться между
  // двумя опросами, и «тишина» засчиталась бы ложно.
  let pendingRequests = 0
  let lastNetworkActivity = Date.now()
  const touch = (delta) => {
    pendingRequests += delta
    lastNetworkActivity = Date.now()
  }
  page.on('request', () => touch(1))
  page.on('requestfinished', () => touch(-1))
  page.on('requestfailed', () => touch(-1))
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const waitForNetworkQuiet = async (quietMs, timeoutMs) => {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (pendingRequests === 0 && Date.now() - lastNetworkActivity >= quietMs) return
      await sleep(50)
    }
  }
  const isLoading = async () =>
    (await page.locator('.animate-spin').count()) > 0 ||
    (await page.getByText(/Загру(зка|жаем)/).count()) > 0

  await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  await page.evaluate(() => document.fonts.ready)
  // Спиннеры и текстовые лоадеры («Загрузка…»): крутим замороженные часы И спим
  // реальное время — ответы API приходят по реальным часам, один runFor их не дождётся.
  // Если страница так и грузится (бэкенд икнул, например во время деплоя) — перезагрузка.
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 })
    }
    await waitForNetworkQuiet(500, 20_000)
    for (let i = 0; i < 40 && (await isLoading()); i++) {
      await page.clock.runFor(200)
      await sleep(150)
    }
    if (!(await isLoading())) break
  }
  // Часть страниц во время загрузки рендерит пустое состояние, а не лоадер, поэтому
  // проверки выше проходят раньше времени. Крутим часы (это будит отложенные фетчи),
  // ждём тишины в сети и снимаем текст DOM, пока два замера подряд не совпадут.
  for (let i = 0, prev = ''; i < 10; i++) {
    await page.clock.runFor(300)
    await waitForNetworkQuiet(400, 5_000)
    const text = await page.evaluate(() => document.body.innerText)
    if (text === prev) break
    prev = text
  }
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}iframe[src*="accounts.google"]{visibility:hidden!important}' })
  await page.clock.runFor(1000)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.clock.runFor(1000)
  // Скролл до низа триггерит ленивые загрузки (аватары, картинки постов) — дожидаемся
  // их до снимка, иначе картинка успевает появиться только в одном из двух прогонов.
  await waitForNetworkQuiet(400, 5_000)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.clock.runFor(1000)
  await waitForNetworkQuiet(400, 5_000)
  await page.screenshot({ path, fullPage: true })
  await context.close()
}

function pad(p, width, height) {
  if (p.width === width && p.height === height) return p
  const out = new PNG({ width, height }); out.data.fill(255)
  PNG.bitblt(p, out, 0, 0, p.width, p.height, 0, 0)
  return out
}

async function compare(beforePath, afterPath, diffPath) {
  let before = PNG.sync.read(await readFile(beforePath)), after = PNG.sync.read(await readFile(afterPath))
  const width = Math.max(before.width, after.width), height = Math.max(before.height, after.height)
  before = pad(before, width, height); after = pad(after, width, height)
  const diff = new PNG({ width, height })
  const options = { threshold: .4, includeAA: false, alpha: .5, diffColor: [255, 0, 0] }
  let changed = pixelmatch(before.data, after.data, diff.data, width, height, options)
  if ((changed / (width * height)) * 100 < .01) {
    changed = 0
    pixelmatch(before.data, before.data, diff.data, width, height, options)
  }
  await Promise.all([writeFile(beforePath, PNG.sync.write(before)), writeFile(afterPath, PNG.sync.write(after)), writeFile(diffPath, PNG.sync.write(diff))])
  return ((changed / (width * height)) * 100).toFixed(3)
}

function slider(route, viewport, stem) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${route}</title><style>body{margin:0;background:#111;color:#eee;font:14px system-ui}header{padding:12px 18px}.c{position:relative;cursor:ew-resize;touch-action:none}.c img{display:block;width:100%}.a{position:absolute;inset:0;clip-path:inset(0 0 0 50%)}.d{position:absolute;top:0;bottom:0;left:50%;width:3px;background:#d8b268}</style></head><body><header>${route} · ${viewport}</header><div class="c" id="c"><img src="${stem}--baseline.png"><img class="a" id="a" src="${stem}--current.png"><i class="d" id="d"></i></div><script>let drag=false,c=document.querySelector('#c'),a=document.querySelector('#a'),d=document.querySelector('#d');function m(e){let r=c.getBoundingClientRect(),p=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));a.style.clipPath='inset(0 0 0 '+p+'%)';d.style.left=p+'%'}c.onpointerdown=e=>{drag=true;c.setPointerCapture(e.pointerId);m(e)};c.onpointermove=e=>drag&&m(e);c.onpointerup=()=>drag=false</script></body></html>`
}

await mkdir(cfg.out, { recursive: true })
const baseline = cfg.baseline.replace(/\/$/, ''), current = cfg.current.replace(/\/$/, '')
const dynamic = await dynamicRoutes(baseline)
const routes = [...publicRoutes.map(route => ({ route, auth: false })), ...[...protectedRoutes, ...dynamic].map(route => ({ route, auth: true }))]
const browser = await chromium.launch({ headless: true }), report = []
try {
  for (const { route, auth } of routes) for (const viewport of viewports) {
    const stem = `${safe(route)}--${viewport.name}`, before = join(cfg.out, `${stem}--baseline.png`), after = join(cfg.out, `${stem}--current.png`)
    await capture(browser, baseline, route, auth, viewport, before)
    await capture(browser, current, route, auth, viewport, after)
    const pct = await compare(before, after, join(cfg.out, `${stem}--diff.png`))
    await writeFile(join(cfg.out, `${stem}.html`), slider(route, viewport.name, stem))
    report.push(`${route}\t${viewport.name}\t${pct}\t${stem}`)
    console.log(route, viewport.name, `${pct}%`)
  }
} finally { await browser.close() }
await writeFile(join(cfg.out, 'report.tsv'), `${report.join('\n')}\n`)
