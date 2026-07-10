import {
  beginFrame,
  drawBg,
  drawEdges,
  drawEye,
  drawStars,
  hue,
  mkBg,
  rgba2,
  type BgStar,
} from './constellation'
import type { Constellation, FxEnv } from './types'

interface SkullEmber {
  x: number
  y: number
  sp: number
  ph: number
  r: number
}

/**
 * Некро-череп в секции «Артефакт»: контур, зубы, два моргающих
 * и мерцающих глаза, поднимающиеся угли.
 */
export function createSkull(env: FxEnv): Constellation {
  const pts: [number, number][] = [
    [258, 72], [306, 84], [330, 120], [326, 158], [300, 182], [258, 196], [216, 182],
    [190, 158], [186, 120], [210, 84], [288, 132], [228, 132], [258, 150], [250, 166], [266, 166],
  ]
  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0],
    [12, 13], [13, 14], [14, 12],
  ]
  const faint: [number, number][] = [[1, 10], [9, 11], [2, 10], [8, 11]]
  const bg: BgStar[] = mkBg(10)
  const embers: SkullEmber[] = Array.from({ length: 8 }, () => ({
    x: 200 + Math.random() * 116,
    y: 60 + Math.random() * 140,
    sp: 8 + Math.random() * 12,
    ph: Math.random() * 6.28,
    r: 0.7 + Math.random(),
  }))
  let blinkAt = -9
  let blinkNext = 4

  return {
    render(ctx, t, dt) {
      beginFrame(ctx)
      const { h, hl } = hue(env, t, 0.5)
      drawBg(ctx, env, bg, t)
      const ox = 1.5 * Math.sin(t * 0.4)
      const oy = 2 * Math.sin(t * 0.6 + 1)
      const P = pts.map((p) => [p[0] + ox, p[1] + oy] as [number, number])
      drawEdges(ctx, P, faint, t, h, 0.09, 0.04)
      drawEdges(ctx, P, edges, t, h, 0.22, 0.1)
      // зубы вдоль нижней челюсти (ломаная P6→P5→P4)
      ctx.strokeStyle = rgba2(hl, 0.5)
      ctx.lineWidth = 1.2
      for (let i = 0; i < 6; i++) {
        const u = i / 5
        let x: number
        let y: number
        if (u < 0.5) {
          const v = u / 0.5
          x = P[6][0] + (P[5][0] - P[6][0]) * v
          y = P[6][1] + (P[5][1] - P[6][1]) * v
        } else {
          const v = (u - 0.5) / 0.5
          x = P[5][0] + (P[4][0] - P[5][0]) * v
          y = P[5][1] + (P[4][1] - P[5][1]) * v
        }
        ctx.beginPath()
        ctx.moveTo(x - 3, y - 8)
        ctx.lineTo(x, y)
        ctx.lineTo(x + 3, y - 8)
        ctx.stroke()
      }
      drawStars(ctx, env, P, {}, t)
      if (t > blinkNext) {
        blinkAt = t
        blinkNext = t + 4 + Math.random() * 4
      }
      const bk = Math.min(1, (t - blinkAt) / 0.18)
      const blink = bk < 1 ? Math.abs(Math.cos(bk * Math.PI)) : 1
      const flick = 0.62 + 0.38 * Math.sin(t * 7) * Math.sin(t * 3.3)
      drawEye(ctx, P[10][0], P[10][1], 6.5, 4.5, blink * flick, 0.15, hl)
      drawEye(ctx, P[11][0], P[11][1], 6.5, 4.5, blink * flick, -0.15, hl)
      ctx.globalCompositeOperation = 'lighter'
      for (const e of embers) {
        e.y -= e.sp * dt
        e.x += Math.sin(t * 0.6 + e.ph) * 0.2
        if (e.y < -6) {
          e.y = 306
          e.x = 200 + Math.random() * 116
        }
        ctx.beginPath()
        ctx.arc(e.x, e.y, e.r, 0, 6.2832)
        ctx.fillStyle = rgba2(hl, 0.25 * (0.6 + 0.4 * Math.sin(t * 2 + e.ph)))
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
    },
  }
}
