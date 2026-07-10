import { beginFrame, mix2, rgba2, rot2, type FireParticle } from './constellation'
import type { Constellation, FxEnv, RGB } from './types'

const CRIM_LIGHT: RGB = [220, 130, 110]
const FIRE_END: RGB = [200, 84, 66]

/**
 * Дракон-созвездие в hero: точки-звёзды, рёбра, мембраны крыльев,
 * взмахи (flap) и огонь из пасти. Логические координаты 520×300, DPR=2.
 */
export function createDragon(env: FxEnv): Constellation {
  const pts: [number, number][] = [
    [30, 214], [52, 206], [86, 196], [120, 184], [152, 172], [190, 158], [224, 146],
    [252, 128], [274, 112], [302, 118], [286, 132], [256, 90], [272, 86], [282, 108],
    [232, 174], [250, 186], [162, 198], [180, 208], [212, 98], [204, 52], [142, 24],
    [196, 14], [248, 26], [238, 92], [180, 104], [164, 60], [118, 40], [150, 28],
    [18, 222], [40, 228],
  ]
  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 28], [0, 29], [4, 5], [5, 6], [6, 7], [7, 8],
    [8, 9], [9, 10], [10, 8], [8, 11], [8, 12], [6, 14], [14, 15], [4, 16], [16, 17],
    [6, 18], [18, 19], [19, 20], [19, 21], [19, 22], [20, 21], [21, 22], [22, 23], [23, 6],
  ]
  const faint: [number, number][] = [[5, 24], [24, 25], [25, 26], [25, 27], [26, 27]]
  const membranes: number[][] = [[19, 20, 21], [19, 21, 22], [19, 22, 23]]
  const bright: Record<number, 1> = { 13: 1, 20: 1, 9: 1 }
  const fireIdx = 9
  const fireDir: [number, number] = [1, 0.35]
  const flapIdxs = [19, 20, 21, 22, 25, 26, 27]
  const flapAmp = 6
  let fire: FireParticle[] = []

  return {
    render(ctx, t, dt) {
      beginFrame(ctx)
      const { ac, acL } = env.palette
      const hm = 0.5 + 0.5 * Math.sin(t * 0.45)
      // дракон миксует hue по собственным коэффициентам (0.55/0.4), не через hue()
      const h = mix2(ac, CRIM_LIGHT, hm * 0.55)
      const hl = mix2(acL, CRIM_LIGHT, hm * 0.4)
      const ox = 2.5 * Math.sin(t * 0.55)
      const oy = 3 * Math.sin(t * 0.75 + 1)
      const flap = flapAmp * Math.sin(t * 1.15)
      const P = pts.map(
        (p, i) => [p[0] + ox, p[1] + oy + (flapIdxs.indexOf(i) >= 0 ? flap : 0)] as [number, number],
      )
      membranes.forEach((m, i) => {
        ctx.beginPath()
        ctx.moveTo(P[m[0]][0], P[m[0]][1])
        for (let j = 1; j < m.length; j++) ctx.lineTo(P[m[j]][0], P[m[j]][1])
        ctx.closePath()
        ctx.fillStyle = rgba2(h, 0.09 + 0.035 * Math.sin(t * 0.8 + i))
        ctx.fill()
      })
      ctx.lineWidth = 1.25
      edges.forEach((e, i) => {
        ctx.beginPath()
        ctx.moveTo(P[e[0]][0], P[e[0]][1])
        ctx.lineTo(P[e[1]][0], P[e[1]][1])
        ctx.strokeStyle = rgba2(h, 0.32 + 0.13 * Math.sin(t * 0.9 + i * 1.3))
        ctx.stroke()
      })
      faint.forEach((e, i) => {
        ctx.beginPath()
        ctx.moveTo(P[e[0]][0], P[e[0]][1])
        ctx.lineTo(P[e[1]][0], P[e[1]][1])
        ctx.strokeStyle = rgba2(h, 0.16 + 0.06 * Math.sin(t * 0.9 + i))
        ctx.stroke()
      })
      // звёзды дракона рисуются своим кодом (не drawStars): другой размер и hueL у ярких
      P.forEach((p, i) => {
        const br = bright[i] ? 1 : 0
        const tw = 0.55 + 0.45 * Math.sin(t * (1.1 + (i % 5) * 0.22) + i * 1.7)
        ctx.beginPath()
        ctx.arc(p[0], p[1], 1.8 + br * 1.2 + tw * 0.8, 0, 6.2832)
        ctx.fillStyle = rgba2(br ? hl : acL, 0.5 + 0.5 * tw)
        ctx.fill()
        if (br) {
          const fl = 5 + 3.5 * tw
          ctx.strokeStyle = rgba2(hl, 0.45 + 0.3 * tw)
          ctx.beginPath()
          ctx.moveTo(p[0] - fl, p[1])
          ctx.lineTo(p[0] + fl, p[1])
          ctx.moveTo(p[0], p[1] - fl)
          ctx.lineTo(p[0], p[1] + fl)
          ctx.stroke()
        }
      })
      // дыхание огнём из пасти (точка fireIdx)
      const sn = P[fireIdx]
      const B = 0.35 + 0.65 * Math.pow(Math.max(0, Math.sin(t * 0.7 + 2)), 2)
      if (!env.reduced || fire.length === 0) {
        const spawn = (Math.random() < B * 0.9 ? 1 : 0) + (Math.random() < B * 0.5 ? 1 : 0)
        for (let i = 0; i < spawn; i++) {
          const dv = rot2(fireDir, (Math.random() - 0.5) * 0.5)
          const dl = Math.hypot(dv[0], dv[1]) || 1
          const sp = 36 + Math.random() * 58
          fire.push({
            x: sn[0] + 3,
            y: sn[1] + 1,
            vx: (dv[0] / dl) * sp,
            vy: (dv[1] / dl) * sp,
            life: 0.9 + Math.random() * 0.9,
            age: 0,
          })
        }
      }
      // огонь дракона крупнее и с мерцанием — свой рендер, не stepFire
      ctx.globalCompositeOperation = 'lighter'
      fire = fire.filter((p) => (p.age += dt) < p.life)
      for (const p of fire) {
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vy -= 6 * dt
        const k = p.age / p.life
        const col = mix2(acL, FIRE_END, k)
        const tw = 0.5 + 0.5 * Math.sin(t * 6 + p.x)
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.3 + (1 - k) * 1.4, 0, 6.2832)
        ctx.fillStyle = rgba2(col, (1 - k) * (0.65 + 0.35 * tw))
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
    },
  }
}
