import { buildGeometry, type Face } from './icosahedron'
import {
  cross,
  matApply,
  matAxis,
  matMul,
  IDENTITY,
  type Mat3,
  type Vec3,
} from './math3d'
import { rgba2 } from './constellation'
import type { FxEnv } from './types'

export interface D20Callbacks {
  /** cssColor — строка вида 'var(--lp-gold-2)' или '' (цвет по умолчанию) */
  onStatus(text: string, cssColor: string): void
  onHistory(last6: number[]): void
  /** Вспышка glow-пятна при броске/крите */
  onBurst(): void
}

export interface D20 {
  /** Настраивает размер канваса и pointer/keyboard-события; возвращает detach */
  attach(canvas: HTMLCanvasElement): () => void
  roll(): void
  /** Шаг state machine + рендер кадра. tMs — миллисекунды performance.now() */
  tick(ctx: CanvasRenderingContext2D, tMs: number, dt: number): void
}

type Mode = 'idle' | 'drag' | 'rolling' | 'settling' | 'idlePause'

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  age: number
  r: number
  cr: boolean
}

interface MagicParticle {
  ang: number
  rad: number
  va: number
  ph: number
  sp: number
  r: number
  cr: boolean
}

interface DragState {
  x: number
  y: number
  moved: number
  t: number
  vx: number
  vy: number
}

/** Логический размер канваса и радиус кубика (координаты прототипа) */
const S = 220
const R = 50

export function createD20(env: FxEnv, cb: D20Callbacks): D20 {
  const { vertices, faces } = buildGeometry()

  // Стартовая ориентация: грань «20» к зрителю
  const f20 = faces.find((f) => f.num === 20) as Face
  let M: Mat3 = IDENTITY
  {
    let ax = cross(f20.n, [0, 0, 1])
    const l = Math.hypot(ax[0], ax[1], ax[2])
    if (l > 1e-4) {
      ax = [ax[0] / l, ax[1] / l, ax[2] / l]
      M = matAxis(ax, Math.acos(Math.max(-1, Math.min(1, f20.n[2]))))
    }
  }

  const d = {
    M,
    w: [0, 0, 0] as Vec3,
    mode: 'idle' as Mode,
    sparks: [] as Spark[],
    shake: 0,
    settleTarget: -1,
    settleFast: false,
    settleSilent: false,
    pauseUntil: 0,
    boost: 0,
    magic: Array.from({ length: 16 }, (): MagicParticle => ({
      ang: Math.random() * 6.2832,
      rad: 58 + Math.random() * 36,
      va: (Math.random() < 0.5 ? -1 : 1) * (0.15 + Math.random() * 0.3),
      ph: Math.random() * 6.2832,
      sp: 0.8 + Math.random() * 1.4,
      r: 0.8 + Math.random() * 1.1,
      cr: Math.random() < 0.15,
    })),
  }

  let drag: DragState | null = null
  let dpr = 1
  const hist: number[] = []

  function rotWorld(ax: Vec3, ang: number) {
    d.M = matMul(matAxis(ax, ang), d.M)
  }

  function spawnSparks(n: number, sp0: number, spr: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = sp0 + Math.random() * spr
      d.sparks.push({
        x: 110,
        y: 110,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 30,
        life: 0.55 + Math.random() * 0.45,
        age: 0,
        r: 0.8 + Math.random() * 1.6,
        cr: Math.random() < 0.18,
      })
    }
    cb.onBurst()
  }

  function beginSettle(fast: boolean, silent: boolean) {
    let best = -1
    let bz = -2
    for (let i = 0; i < 20; i++) {
      const nz = matApply(d.M, faces[i].n)[2]
      if (nz > bz) {
        bz = nz
        best = i
      }
    }
    d.settleTarget = best
    d.mode = 'settling'
    d.settleFast = fast
    d.settleSilent = silent
  }

  function announce(i: number) {
    const num = faces[i].num
    hist.push(num)
    cb.onHistory(hist.slice(-6))
    if (num === 20) {
      spawnSparks(34, 40, 140)
      cb.onStatus('Натуральная 20! Критический успех — дело раскрыто.', 'var(--lp-gold-2)')
    } else if (num === 1) {
      d.shake = 1
      cb.onStatus('Натуральная 1… улики безнадёжно утеряны.', 'var(--lp-crimson-2)')
    } else if (num >= 15) cb.onStatus(`Выпало ${num} — уверенный успех.`, 'var(--lp-ink-dim)')
    else if (num >= 10) cb.onStatus(`Выпало ${num} — сойдёт для Каррна.`, 'var(--lp-ink-dim)')
    else cb.onStatus(`Выпало ${num} — стража что-то заподозрила…`, 'var(--lp-ink-dim)')
  }

  function roll() {
    if (d.mode === 'rolling' || d.mode === 'settling') return
    if (env.reduced) {
      const v: Vec3 = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]
      const l = Math.hypot(v[0], v[1], v[2]) || 1
      rotWorld([v[0] / l, v[1] / l, v[2] / l], Math.random() * 6.28)
      d.w = [0, 0, 0]
      beginSettle(true, false)
      return
    }
    const r = () => Math.random() - 0.5
    const w: Vec3 = [r() * 24, r() * 24, r() * 10]
    const sp = Math.hypot(w[0], w[1]) || 1
    if (sp < 10) {
      w[0] *= 10 / sp
      w[1] *= 10 / sp
    }
    d.w = w
    d.mode = 'rolling'
    d.settleSilent = false
    d.boost = 1
    spawnSparks(16, 26, 70)
    cb.onStatus('бросаем…', 'var(--lp-muted)')
  }

  function attach(cv: HTMLCanvasElement): () => void {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    cv.width = S * dpr
    cv.height = S * dpr

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault()
      cv.focus()
      try {
        cv.setPointerCapture(e.pointerId)
      } catch {
        // канвас мог не получить capture (например, synthetic event) — drag работает и без него
      }
      drag = { x: e.clientX, y: e.clientY, moved: 0, t: performance.now(), vx: 0, vy: 0 }
      d.mode = 'drag'
      cv.style.cursor = 'grabbing'
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!drag) return
      const dx = e.clientX - drag.x
      const dy = e.clientY - drag.y
      drag.x = e.clientX
      drag.y = e.clientY
      drag.moved += Math.abs(dx) + Math.abs(dy)
      const k = 0.012
      rotWorld([0, 1, 0], dx * k)
      rotWorld([1, 0, 0], dy * k)
      drag.vx = 0.7 * drag.vx + 0.3 * (dy * k * 60)
      drag.vy = 0.7 * drag.vy + 0.3 * (dx * k * 60)
    }
    const release = () => {
      if (!drag) return
      const dr = drag
      drag = null
      cv.style.cursor = 'grab'
      // короткий тап без движения — это клик-бросок
      if (dr.moved < 8 && performance.now() - dr.t < 350) {
        roll()
        return
      }
      const sp = Math.hypot(dr.vx, dr.vy)
      if (sp > 1.4) {
        d.w = [dr.vx, dr.vy, (Math.random() - 0.5) * 2]
        d.mode = 'rolling'
        d.settleSilent = false
        d.boost = 1
        spawnSparks(10, 20, 55)
        cb.onStatus('крутится…', 'var(--lp-muted)')
      } else {
        beginSettle(false, dr.moved < 30)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        roll()
      }
    }

    cv.addEventListener('pointerdown', onPointerDown)
    cv.addEventListener('pointermove', onPointerMove)
    cv.addEventListener('pointerup', release)
    cv.addEventListener('pointercancel', release)
    cv.addEventListener('keydown', onKeyDown)
    return () => {
      cv.removeEventListener('pointerdown', onPointerDown)
      cv.removeEventListener('pointermove', onPointerMove)
      cv.removeEventListener('pointerup', release)
      cv.removeEventListener('pointercancel', release)
      cv.removeEventListener('keydown', onKeyDown)
      drag = null
    }
  }

  function step(t: number, dt: number) {
    if (d.mode === 'idle' && !env.reduced) {
      rotWorld([0, 1, 0], 0.28 * dt)
      rotWorld([1, 0, 0], 0.1 * dt)
    } else if (d.mode === 'rolling') {
      const sp = Math.hypot(d.w[0], d.w[1], d.w[2])
      if (sp > 0.0001) rotWorld([d.w[0] / sp, d.w[1] / sp, d.w[2] / sp], sp * dt)
      const f = Math.exp(-2.1 * dt)
      d.w = [d.w[0] * f, d.w[1] * f, d.w[2] * f]
      if (Math.hypot(d.w[0], d.w[1], d.w[2]) < 1.0) beginSettle(false, d.settleSilent)
    } else if (d.mode === 'settling') {
      const n = matApply(d.M, faces[d.settleTarget].n)
      const ang = Math.acos(Math.max(-1, Math.min(1, n[2])))
      if (ang < 0.015) {
        d.mode = 'idlePause'
        d.pauseUntil = t + (d.settleSilent ? 1200 : 2800)
        if (!d.settleSilent) announce(d.settleTarget)
      } else {
        const ax = cross(n, [0, 0, 1])
        const l = Math.hypot(ax[0], ax[1], ax[2])
        const axn: Vec3 = l < 1e-4 ? [1, 0, 0] : [ax[0] / l, ax[1] / l, ax[2] / l]
        const stepAng = d.settleFast ? ang : Math.min(ang, ang * 0.16 + 0.5 * dt)
        rotWorld(axn, stepAng)
      }
    } else if (d.mode === 'idlePause') {
      if (t > d.pauseUntil) d.mode = 'idle'
    }
    if (d.shake > 0) d.shake = Math.max(0, d.shake - dt * 2.2)
  }

  function render(ctx: CanvasRenderingContext2D, t: number, dt: number) {
    const { ac, acL } = env.palette
    let cx = S / 2
    let cy = S / 2
    if (d.shake > 0) {
      const s = d.shake * 4
      cx += (Math.random() - 0.5) * s
      cy += (Math.random() - 0.5) * s
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, S, S)

    // магические частицы вокруг кубика (позади него)
    const boost = d.boost
    for (const m of d.magic) {
      m.ang += m.va * dt * (1 + 2.5 * boost)
      const rr = m.rad + 6 * Math.sin((t / 1000) * 0.7 + m.ph)
      const px = cx + Math.cos(m.ang) * rr
      const py = cy + Math.sin(m.ang) * rr * 0.9
      const tw = 0.5 + 0.5 * Math.sin((t / 1000) * m.sp * 2 + m.ph)
      const al = (0.1 + 0.25 * tw) * (1 + 1.8 * boost)
      ctx.beginPath()
      ctx.arc(px, py, m.r * (1 + 0.6 * boost), 0, 6.2832)
      ctx.fillStyle = m.cr ? rgba2([192, 90, 79], al) : rgba2(acL, al)
      ctx.fill()
    }
    if (d.boost) d.boost = Math.max(0, d.boost - dt * 0.9)

    const M = d.M
    const P3 = vertices.map((v) => matApply(M, v))
    const per = (z: number) => 3.4 / (3.4 - z)
    const P2 = P3.map((p) => {
      const f = per(p[2])
      return [cx + p[0] * R * f, cy - p[1] * R * f] as [number, number]
    })
    // painter's algorithm: грани от дальних к ближним
    const fl = faces
      .map((f) => {
        const n = matApply(M, f.n)
        const zc = (P3[f.a][2] + P3[f.b][2] + P3[f.c][2]) / 3
        return { f, n, zc }
      })
      .sort((A, B) => A.zc - B.zc)
    ctx.lineJoin = 'round'
    ctx.lineWidth = 1
    for (const F of fl) {
      const f = F.f
      const n = F.n
      const pa = P2[f.a], pb = P2[f.b], pc = P2[f.c]
      ctx.beginPath()
      ctx.moveTo(pa[0], pa[1])
      ctx.lineTo(pb[0], pb[1])
      ctx.lineTo(pc[0], pc[1])
      ctx.closePath()
      if (n[2] <= 0.02) {
        ctx.strokeStyle = `rgba(${ac[0]},${ac[1]},${ac[2]},0.07)`
        ctx.stroke()
      } else {
        const tt = n[2]
        ctx.fillStyle = `rgb(${Math.round(22 + tt * ac[0] * 0.22)},${Math.round(18 + tt * ac[1] * 0.2)},${Math.round(12 + tt * ac[2] * 0.16)})`
        ctx.fill()
        ctx.strokeStyle = `rgba(${ac[0]},${ac[1]},${ac[2]},${(0.16 + 0.5 * tt).toFixed(3)})`
        ctx.stroke()
      }
    }
    // цифры на видимых гранях — трансформация по u/w-базису грани
    for (const F of fl) {
      const f = F.f
      const n = F.n
      if (n[2] < 0.32) continue
      const c3 = matApply(M, f.cm)
      const fpc = per(c3[2])
      const C = [cx + c3[0] * R * fpc, cy - c3[1] * R * fpc]
      const u3 = matApply(M, f.u)
      const w3 = matApply(M, f.w)
      const U = [u3[0] * R * fpc, -u3[1] * R * fpc]
      let W = [w3[0] * R * fpc, -w3[1] * R * fpc]
      if (U[0] * W[1] - U[1] * W[0] < 0) W = [-W[0], -W[1]]
      const s = 0.032
      ctx.setTransform(dpr * U[0] * s, dpr * U[1] * s, dpr * W[0] * s, dpr * W[1] * s, dpr * C[0], dpr * C[1])
      const alpha = Math.min(1, (n[2] - 0.32) / 0.55)
      ctx.fillStyle = rgba2(acL, 0.95 * alpha)
      ctx.font = '700 10px "Zilla Slab", "Bitter", serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(f.num + (f.num === 6 || f.num === 9 ? '.' : ''), 0, 0)
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (d.sparks.length) {
      d.sparks = d.sparks.filter((p) => (p.age += dt) < p.life)
      for (const p of d.sparks) {
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vy += 70 * dt
        const a = Math.max(0, 1 - p.age / p.life)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, 6.2832)
        ctx.fillStyle = p.cr ? `rgba(192,90,79,${a.toFixed(3)})` : rgba2(acL, a)
        ctx.fill()
      }
    }
  }

  return {
    attach,
    roll,
    tick(ctx, tMs, dt) {
      step(tMs, dt)
      render(ctx, tMs, dt)
    },
  }
}
