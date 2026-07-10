import type { FxEnv, RGB } from './types'

/** Точка фонового «звёздного неба»: [x, y, фаза мерцания] */
export type BgStar = [number, number, number]

export interface FireParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  age: number
}

/** Багрянец для смешения с акцентом в пульсации hue (константа прототипа) */
const CRIM_LIGHT: RGB = [220, 130, 110]

export function mix2(a: RGB, b: RGB, m: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * m),
    Math.round(a[1] + (b[1] - a[1]) * m),
    Math.round(a[2] + (b[2] - a[2]) * m),
  ]
}

export function rgba2(c: RGB, a: number): string {
  return `rgba(${c[0]},${c[1]},${c[2]},${(a < 0 ? 0 : a > 1 ? 1 : a).toFixed(3)})`
}

export function rot2(v: [number, number], a: number): [number, number] {
  const c = Math.cos(a), s = Math.sin(a)
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]
}

/**
 * Начало кадра созвездия: канвасы 1040×600 с жёстким DPR=2,
 * вся логика — в координатах 520×300.
 */
export function beginFrame(ctx: CanvasRenderingContext2D): void {
  ctx.setTransform(2, 0, 0, 2, 0, 0)
  ctx.clearRect(0, 0, 520, 300)
}

export function mkBg(n: number): BgStar[] {
  return Array.from({ length: n }, () => [Math.random() * 520, Math.random() * 300, Math.random() * 6.28])
}

/** Пульсация цвета золото↔багрянец (порт _hueC) */
export function hue(env: FxEnv, t: number, amt: number): { h: RGB; hl: RGB } {
  const { ac, acL } = env.palette
  const hm = 0.5 + 0.5 * Math.sin(t * 0.45)
  return { h: mix2(ac, CRIM_LIGHT, hm * amt), hl: mix2(acL, CRIM_LIGHT, hm * amt * 0.7) }
}

export function drawBg(ctx: CanvasRenderingContext2D, env: FxEnv, arr: BgStar[], t: number): void {
  const acL = env.palette.acL
  for (const s of arr) {
    ctx.beginPath()
    ctx.arc(s[0], s[1], 0.9, 0, 6.2832)
    ctx.fillStyle = rgba2(acL, 0.1 + 0.1 * Math.sin(t * 1.3 + s[2]))
    ctx.fill()
  }
}

export function drawEdges(
  ctx: CanvasRenderingContext2D,
  P: [number, number][],
  list: [number, number][],
  t: number,
  col: RGB,
  base: number,
  amp: number,
): void {
  ctx.lineWidth = 1
  list.forEach((e, i) => {
    ctx.beginPath()
    ctx.moveTo(P[e[0]][0], P[e[0]][1])
    ctx.lineTo(P[e[1]][0], P[e[1]][1])
    ctx.strokeStyle = rgba2(col, base + amp * Math.sin(t * 0.9 + i * 1.3))
    ctx.stroke()
  })
}

/** Звёзды созвездия: мерцание, у ярких — крест-вспышка */
export function drawStars(
  ctx: CanvasRenderingContext2D,
  env: FxEnv,
  P: [number, number][],
  bright: Record<number, 1>,
  t: number,
): void {
  const acL = env.palette.acL
  const acLL = mix2(acL, [255, 255, 255], 0.22)
  P.forEach((p, i) => {
    const br = bright[i] ? 1 : 0
    const tw = 0.55 + 0.45 * Math.sin(t * (1.1 + (i % 5) * 0.22) + i * 1.7)
    ctx.beginPath()
    ctx.arc(p[0], p[1], 1.5 + br * 1.1 + tw * 0.7, 0, 6.2832)
    ctx.fillStyle = rgba2(br ? acLL : acL, 0.35 + 0.55 * tw)
    ctx.fill()
    if (br) {
      const fl = 5 + 3.5 * tw
      ctx.strokeStyle = rgba2(acLL, 0.3 + 0.3 * tw)
      ctx.beginPath()
      ctx.moveTo(p[0] - fl, p[1])
      ctx.lineTo(p[0] + fl, p[1])
      ctx.moveTo(p[0], p[1] - fl)
      ctx.lineTo(p[0], p[1] + fl)
      ctx.stroke()
    }
  })
}

/** Глаз с радиальным свечением; open<1 — моргание через scale по вертикали */
export function drawEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  open: number,
  rot: number,
  col: RGB,
): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, rx * 3)
  g.addColorStop(0, rgba2(col, 0.3 * open + 0.05))
  g.addColorStop(1, rgba2(col, 0))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, rx * 3, 0, 6.2832)
  ctx.fill()
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot || 0)
  ctx.scale(1, Math.max(0.06, open))
  ctx.beginPath()
  ctx.ellipse(0, 0, rx, ry, 0, 0, 6.2832)
  ctx.fillStyle = rgba2(col, 0.95)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(0, -ry * 0.85)
  ctx.lineTo(0, ry * 0.85)
  ctx.strokeStyle = 'rgba(20,14,8,0.9)'
  ctx.lineWidth = 1.6
  ctx.stroke()
  ctx.restore()
}

/**
 * Шаг огненных частиц (composite 'lighter'); возвращает живые частицы.
 * gy — «антигравитация» вверх, colB — цвет к концу жизни.
 */
export function stepFire(
  ctx: CanvasRenderingContext2D,
  env: FxEnv,
  arr: FireParticle[],
  dt: number,
  t: number,
  gy: number,
  sz: number,
  colB: RGB,
): FireParticle[] {
  const acL = env.palette.acL
  const alive = arr.filter((p) => (p.age += dt) < p.life)
  ctx.globalCompositeOperation = 'lighter'
  for (const p of alive) {
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy -= gy * dt
    const k = p.age / p.life
    const col = mix2(acL, colB, k)
    const tw = 0.5 + 0.5 * Math.sin(t * 6 + p.x)
    ctx.beginPath()
    ctx.arc(p.x, p.y, sz * (1 - k) + 0.5, 0, 6.2832)
    ctx.fillStyle = rgba2(col, (1 - k) * (0.5 + 0.4 * tw))
    ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'
  return alive
}
