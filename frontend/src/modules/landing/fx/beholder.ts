import {
  beginFrame,
  drawBg,
  drawEdges,
  drawEye,
  drawStars,
  hue,
  mkBg,
  rgba2,
  rot2,
  stepFire,
  type BgStar,
  type FireParticle,
} from './constellation'
import type { Constellation, FxEnv } from './types'

/**
 * Бехолдер-созвездие в секции «Возможности»: тело-октагон, щупальца,
 * моргающий центральный глаз и периодические лучи-частицы к кончикам щупалец.
 */
export function createBeholder(env: FxEnv): Constellation {
  const pts: [number, number][] = [
    [302, 158], [289, 189], [258, 202], [227, 189], [214, 158], [227, 127], [258, 114],
    [289, 127], [258, 158], [256, 80], [252, 50], [318, 92], [346, 66], [198, 92],
    [170, 66], [342, 150], [374, 142], [174, 150], [142, 142], [300, 204], [322, 230],
    [216, 204], [194, 230],
  ]
  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [6, 9], [9, 10],
    [7, 11], [11, 12], [5, 13], [13, 14], [0, 15], [15, 16], [4, 17], [17, 18],
    [1, 19], [19, 20], [3, 21], [21, 22],
  ]
  const faint: [number, number][] = [[8, 6], [8, 0], [8, 4], [8, 2]]
  const bright: Record<number, 1> = { 10: 1, 12: 1, 14: 1, 16: 1, 18: 1, 20: 1, 22: 1 }
  const bg: BgStar[] = mkBg(12)
  let fire: FireParticle[] = []
  let beamNext = 1.2
  let blinkAt = -9
  let blinkNext = 3

  return {
    render(ctx, t, dt) {
      beginFrame(ctx)
      const { h, hl } = hue(env, t, 0.55)
      drawBg(ctx, env, bg, t)
      const ox = 2 * Math.sin(t * 0.5)
      const oy = 2.5 * Math.sin(t * 0.7 + 1)
      const P = pts.map((p, i) => {
        let x = p[0] + ox
        let y = p[1] + oy
        // кончики щупалец (индексы от 9) дополнительно шевелятся
        if (i >= 9) {
          x += Math.sin(t * 1.4 + i) * 2.2
          y += Math.cos(t * 1.2 + i) * 1.6
        }
        return [x, y] as [number, number]
      })
      drawEdges(ctx, P, edges, t, h, 0.2, 0.1)
      drawEdges(ctx, P, faint, t, h, 0.08, 0.04)
      // «улыбка» — зигзаг между нижними точками тела
      const a = P[3]
      const b = P[1]
      ctx.lineWidth = 1.4
      ctx.strokeStyle = rgba2(hl, 0.55)
      ctx.beginPath()
      for (let i = 0; i <= 6; i++) {
        const u = i / 6
        const x = a[0] + (b[0] - a[0]) * u
        const y = a[1] + Math.sin(u * Math.PI) * 12 + (i % 2 ? 6 : 0)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      drawStars(ctx, env, P, bright, t)
      if (t > blinkNext) {
        blinkAt = t
        blinkNext = t + 3 + Math.random() * 3
      }
      const bk = Math.min(1, (t - blinkAt) / 0.22)
      const open = bk < 1 ? Math.abs(Math.cos(bk * Math.PI)) : 1
      const e = P[8]
      drawEye(ctx, e[0], e[1], 9, 5.5, open, 0, hl)
      beamNext -= dt
      if (beamNext <= 0 && !env.reduced) {
        beamNext = 1.4 + Math.random() * 1.6
        const tips = [10, 12, 14, 16, 18, 20, 22]
        const tp = P[tips[(Math.random() * tips.length) | 0]]
        const d: [number, number] = [tp[0] - e[0], tp[1] - e[1]]
        const dl = Math.hypot(d[0], d[1]) || 1
        for (let i = 0; i < 10; i++) {
          const sp = 70 + Math.random() * 90
          const dv = rot2([d[0] / dl, d[1] / dl], (Math.random() - 0.5) * 0.2)
          fire.push({ x: e[0], y: e[1], vx: dv[0] * sp, vy: dv[1] * sp, life: 0.4 + Math.random() * 0.4, age: 0 })
        }
      } else if (beamNext <= 0) {
        beamNext = 2
      }
      fire = stepFire(ctx, env, fire, dt, t, 0, 1.4, [204, 90, 80])
    },
  }
}
