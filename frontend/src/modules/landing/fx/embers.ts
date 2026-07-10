import { rgba2 } from './constellation'
import type { FxEnv } from './types'

interface Ember {
  x: number
  y: number
  r: number
  sp: number
  ph: number
  sw: number
  a: number
  cr: boolean
}

export interface Embers {
  /** Подгоняет канвас под контейнер и пересоздаёт частицы при смене плотности */
  resize(w: number, h: number, canvas: HTMLCanvasElement): void
  render(ctx: CanvasRenderingContext2D, tMs: number, dt: number): void
}

function newEmber(w: number, h: number, anyY: boolean): Ember {
  return {
    x: Math.random() * w,
    y: anyY ? Math.random() * h : h + 6,
    r: 0.7 + Math.random() * 1.5,
    sp: 9 + Math.random() * 22,
    ph: Math.random() * 6.28,
    sw: 0.3 + Math.random() * 0.8,
    a: 0.1 + Math.random() * 0.26,
    cr: Math.random() < 0.14,
  }
}

export function createEmbers(env: FxEnv): Embers {
  let W = 0
  let H = 0
  let embers: Ember[] = []

  return {
    resize(w, h, canvas) {
      canvas.width = Math.max(1, w)
      canvas.height = Math.max(1, h)
      W = w
      H = h
      const count = Math.max(12, Math.min(30, Math.round(w / 55)))
      if (embers.length !== count) {
        embers = Array.from({ length: count }, () => newEmber(w, h, true))
      }
    },
    render(ctx, t, dt) {
      if (env.reduced) {
        ctx.clearRect(0, 0, W, H)
        return
      }
      const ac = env.palette.ac
      ctx.clearRect(0, 0, W, H)
      for (const e of embers) {
        e.y -= e.sp * dt
        e.x += Math.sin((t / 1000) * e.sw + e.ph) * 0.25
        if (e.y < -8) Object.assign(e, newEmber(W, H, false))
        const tw = 0.55 + 0.45 * Math.sin(t / 500 + e.ph * 3)
        ctx.beginPath()
        ctx.arc(e.x, e.y, e.r, 0, 6.2832)
        ctx.fillStyle = e.cr ? `rgba(192,90,79,${(e.a * tw).toFixed(3)})` : rgba2(ac, e.a * tw)
        ctx.fill()
      }
    },
  }
}
