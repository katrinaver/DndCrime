import { beginFrame, drawBg, hue, mix2, mkBg, rgba2, type BgStar } from './constellation'
import type { Constellation, FxEnv } from './types'

interface PortalParticle {
  ang: number
  rad: number
  va: number
  vr: number
  r: number
  cr: boolean
}

/**
 * Руно-портал в секции «Артефакт»: два кольца рун, вращающихся в противофазе,
 * частицы, засасываемые к центру, и пульсирующее ядро.
 */
export function createPortal(env: FxEnv): Constellation {
  const bg: BgStar[] = mkBg(10)
  const parts: PortalParticle[] = Array.from({ length: 26 }, () => ({
    ang: Math.random() * 6.28,
    rad: 40 + Math.random() * 70,
    va: 0.8 + Math.random() * 1.2,
    vr: 14 + Math.random() * 20,
    r: 0.8 + Math.random() * 1.3,
    cr: Math.random() < 0.2,
  }))

  return {
    render(ctx, t, dt) {
      beginFrame(ctx)
      const { h, hl } = hue(env, t, 0.4)
      drawBg(ctx, env, bg, t)
      const cx = 258, cy = 150, oR = 94, iR = 56, NO = 12, NI = 8
      const aO = t * 0.16
      const aI = -t * 0.24
      const outer: [number, number][] = []
      const inner: [number, number][] = []
      for (let i = 0; i < NO; i++) {
        const a = aO + (i / NO) * 6.2832
        outer.push([cx + Math.cos(a) * oR, cy + Math.sin(a) * oR])
      }
      for (let i = 0; i < NI; i++) {
        const a = aI + (i / NI) * 6.2832
        inner.push([cx + Math.cos(a) * iR, cy + Math.sin(a) * iR])
      }
      ctx.lineWidth = 1
      ctx.beginPath()
      outer.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
      ctx.closePath()
      ctx.strokeStyle = rgba2(h, 0.28)
      ctx.stroke()
      ctx.beginPath()
      inner.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
      ctx.closePath()
      ctx.strokeStyle = rgba2(h, 0.24)
      ctx.stroke()
      // руны-насечки наружу от внешнего кольца
      outer.forEach((p, i) => {
        const a = Math.atan2(p[1] - cy, p[0] - cx)
        ctx.beginPath()
        ctx.moveTo(p[0], p[1])
        ctx.lineTo(p[0] + Math.cos(a) * 8, p[1] + Math.sin(a) * 8)
        ctx.strokeStyle = rgba2(hl, 0.3 + 0.2 * Math.sin(t * 2 + i))
        ctx.stroke()
      })
      for (let i = 0; i < NI; i += 2) {
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(inner[i][0], inner[i][1])
        ctx.strokeStyle = rgba2(h, 0.1)
        ctx.stroke()
      }
      const acL = env.palette.acL
      ;[...outer, ...inner].forEach((p, i) => {
        const tw = 0.55 + 0.45 * Math.sin(t * 1.4 + i)
        ctx.beginPath()
        ctx.arc(p[0], p[1], 1.6 + tw * 0.7, 0, 6.2832)
        ctx.fillStyle = rgba2(acL, 0.4 + 0.5 * tw)
        ctx.fill()
      })
      ctx.globalCompositeOperation = 'lighter'
      for (const p of parts) {
        p.ang += p.va * dt
        p.rad -= p.vr * dt
        if (p.rad < 8) {
          p.rad = 90 + Math.random() * 20
          p.ang = Math.random() * 6.28
        }
        const px = cx + Math.cos(p.ang) * p.rad
        const py = cy + Math.sin(p.ang) * p.rad
        const k = 1 - p.rad / 110
        ctx.beginPath()
        ctx.arc(px, py, p.r * (0.6 + k), 0, 6.2832)
        ctx.fillStyle = p.cr ? rgba2([210, 110, 96], 0.5 * k + 0.2) : rgba2(acL, 0.5 * k + 0.2)
        ctx.fill()
      }
      const pulse = 0.6 + 0.4 * Math.sin(t * 2.2)
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26)
      g.addColorStop(0, rgba2(hl, 0.5 * pulse))
      g.addColorStop(1, rgba2(hl, 0))
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, 26, 0, 6.2832)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
      ctx.beginPath()
      ctx.arc(cx, cy, 3 + pulse, 0, 6.2832)
      ctx.fillStyle = rgba2(mix2(acL, [255, 255, 255], 0.3), 0.9)
      ctx.fill()
    },
  }
}
