import { rgba2 } from './constellation'
import type { FxEnv, RGB } from './types'

interface FloatDie {
  x: number
  y: number
  /** Радиус описанной окружности контура, px */
  s: number
  sides: number
  rot: number
  vr: number
  sp: number
  ph: number
  a: number
  cr: boolean
}

export interface FloatDice {
  /** Подгоняет канвас под обёртку (DPR ≤ 2) и пересоздаёт кости при смене плотности */
  resize(w: number, h: number, canvas: HTMLCanvasElement): void
  render(ctx: CanvasRenderingContext2D, tSec: number, dt: number): void
}

const CRIMSON: RGB = [192, 90, 79]

/**
 * Поле парящих рун-костей над артефактом и подвалом (замена портала в v2):
 * контурные d3/d4/d6 всплывают, покачиваются, вращаются и мерцают.
 */
export function createFloatDice(env: FxEnv): FloatDice {
  let W = 0
  let H = 0
  let dpr = 1
  let dice: FloatDie[] = []

  function newDie(anyY: boolean): FloatDie {
    return {
      x: Math.random() * W,
      y: anyY ? Math.random() * H : H + 22,
      s: 10 + Math.random() * 13,
      sides: [3, 4, 6][Math.floor(Math.random() * 3)],
      rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.7,
      sp: 7 + Math.random() * 15,
      ph: Math.random() * 6.28,
      a: 0.1 + Math.random() * 0.16,
      cr: Math.random() < 0.14,
    }
  }

  return {
    resize(w, h, canvas) {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      W = w
      H = h
      const count = Math.max(16, Math.min(46, Math.round(w / 46)))
      if (dice.length !== count) {
        dice = Array.from({ length: count }, () => newDie(true))
      }
    },
    render(ctx, t, dt) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      if (env.reduced) return
      const { ac, acL } = env.palette
      for (const p of dice) {
        p.y -= p.sp * dt
        p.x += Math.sin(t * 0.5 + p.ph) * 0.2
        p.rot += p.vr * dt
        if (p.y < -26) Object.assign(p, newDie(false))
        const tw = 0.6 + 0.4 * Math.sin(t * 1.5 + p.ph)
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.beginPath()
        for (let i = 0; i < p.sides; i++) {
          const a = (i / p.sides) * 6.2832 - Math.PI / 2
          const x = Math.cos(a) * p.s
          const y = Math.sin(a) * p.s
          if (i) ctx.lineTo(x, y)
          else ctx.moveTo(x, y)
        }
        ctx.closePath()
        ctx.strokeStyle = rgba2(p.cr ? CRIMSON : ac, Math.min(1, p.a * tw * 2.4))
        ctx.lineWidth = 1.1
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(0, 0, 0.9, 0, 6.2832)
        ctx.fillStyle = rgba2(acL, p.a * tw * 2)
        ctx.fill()
        ctx.restore()
      }
    },
  }
}
