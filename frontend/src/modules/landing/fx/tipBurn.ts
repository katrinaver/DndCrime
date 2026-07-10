import { mix2, rgba2 } from './constellation'
import type { FxEnv } from './types'

export interface Tip {
  n: number
  q: string
}

export interface TipTargets {
  /** span с текстом совета — ротатор мутирует textContent/style напрямую,
   *  по нему же меряется область сжигания (host шире — растянут под самый длинный совет) */
  text: HTMLElement
  /** span с меткой «СОВЕТ МАСТЕРА №N» */
  label: HTMLElement
  /** canvas эффекта — при старте burn ротатор кладёт его left/top по
   *  фактическому положению текста (текст центрирован в host и двигается) */
  fx: HTMLCanvasElement
  /** обёртка-слот — positioned-родитель canvas, от неё меряется offset текста */
  host: HTMLElement
}

interface BurnParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  age: number
  r: number
}

type Phase = 'show' | 'burn' | 'in'

const SHOW_SEC = 6.5
const BURN_SEC = 1.05
const IN_SEC = 0.5

/**
 * Ротация советов мастера: show → burn (движущийся жар + искры, текст
 * гаснет с blur) → in (плавное появление следующего). При reduced — мгновенный свап.
 */
export function createTipRotator(env: FxEnv, tips: Tip[]) {
  let phase: Phase = 'show'
  let until = -1
  let idx = 0
  let parts: BurnParticle[] = []
  let sweep = -1
  let w = 0
  let h = 0
  let t0 = 0

  function swap(tg: TipTargets) {
    idx = (idx + 1) % tips.length
    tg.text.textContent = tips[idx].q
    tg.label.textContent = `СОВЕТ МАСТЕРА №${tips[idx].n}`
  }

  function tick(tg: TipTargets, t: number, dt: number) {
    if (until < 0) until = t + SHOW_SEC
    if (phase === 'show' && t > until) {
      if (env.reduced) {
        swap(tg)
        until = t + 7
      } else {
        w = tg.text.offsetWidth
        h = tg.text.offsetHeight
        tg.fx.width = (w + 48) * 2
        tg.fx.height = (h + 48) * 2
        tg.fx.style.width = `${w + 48}px`
        tg.fx.style.height = `${h + 48}px`
        tg.fx.style.left = `${tg.text.offsetLeft - 24}px`
        tg.fx.style.top = `${tg.text.offsetTop - 24}px`
        phase = 'burn'
        t0 = t
        parts = []
      }
    } else if (phase === 'burn') {
      const pr = Math.min(1, (t - t0) / BURN_SEC)
      tg.text.style.opacity = (1 - pr).toFixed(3)
      tg.text.style.filter = `blur(${(pr * 2.5).toFixed(2)}px)`
      sweep = 24 + w * pr
      for (let i = 0; i < 3; i++) {
        if (Math.random() < 0.85) {
          parts.push({
            x: sweep + (Math.random() - 0.5) * 26,
            y: 22 + Math.random() * (h + 4),
            vx: (Math.random() - 0.5) * 16,
            vy: -20 - Math.random() * 32,
            life: 0.45 + Math.random() * 0.55,
            age: 0,
            r: 0.8 + Math.random() * 1.5,
          })
        }
      }
      if (pr >= 1) {
        swap(tg)
        tg.text.style.opacity = '0'
        tg.text.style.filter = ''
        phase = 'in'
        t0 = t
        sweep = -1
      }
    } else if (phase === 'in') {
      const pr = Math.min(1, (t - t0) / IN_SEC)
      tg.text.style.opacity = pr.toFixed(3)
      tg.text.style.transform = `translateY(${(5 * (1 - pr)).toFixed(1)}px)`
      if (pr >= 1) {
        phase = 'show'
        until = t + SHOW_SEC
        tg.text.style.transform = ''
        tg.text.style.opacity = ''
      }
    }

    const ctx = tg.fx.getContext('2d')
    if (!ctx) return
    ctx.setTransform(2, 0, 0, 2, 0, 0)
    ctx.clearRect(0, 0, tg.fx.width / 2, tg.fx.height / 2)
    if (parts.length || sweep >= 0) {
      const acL = env.palette.acL
      ctx.globalCompositeOperation = 'lighter'
      if (sweep >= 0) {
        const gy = 24 + h / 2
        const g = ctx.createRadialGradient(sweep, gy, 0, sweep, gy, 15)
        g.addColorStop(0, rgba2(acL, 0.45))
        g.addColorStop(1, rgba2(acL, 0))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(sweep, gy, 15, 0, 6.2832)
        ctx.fill()
      }
      parts = parts.filter((p) => (p.age += dt) < p.life)
      for (const p of parts) {
        p.x += p.vx * dt
        p.y += p.vy * dt
        const k = p.age / p.life
        const col = mix2(acL, [200, 84, 66], k)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * (1 - k) + 0.4, 0, 6.2832)
        ctx.fillStyle = rgba2(col, (1 - k) * 0.8)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  return { tick }
}
