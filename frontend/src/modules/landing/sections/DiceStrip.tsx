import { useEffect, useRef } from 'react'
import { DICE } from '../data'
import { rollMini } from '../fx/miniDice'

/** Полоса «Набор искателя»: шесть кликабельных контурных костей d4–d20 */
export function DiceStrip() {
  const shapeRefs = useRef<(HTMLSpanElement | null)[]>([])
  const numRefs = useRef<(SVGTextElement | null)[]>([])
  const cancelsRef = useRef(new Map<number, () => void>())

  useEffect(() => {
    const cancels = cancelsRef.current
    return () => {
      for (const cancel of cancels.values()) cancel()
      cancels.clear()
    }
  }, [])

  const roll = (i: number, max: number) => {
    // повторный клик во время анимации игнорируется (как в прототипе)
    if (cancelsRef.current.has(i)) return
    const num = numRefs.current[i]
    if (!num) return
    const cancel = rollMini(shapeRefs.current[i], num, max, () => cancelsRef.current.delete(i))
    cancelsRef.current.set(i, cancel)
  }

  return (
    <section aria-label="Набор кубиков" className="relative border-t border-(--lp-line) bg-black/[0.16]">
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-center gap-[clamp(18px,3vw,36px)] px-[clamp(20px,5vw,40px)] py-5">
        <div className="lp-dice-label mr-auto flex flex-col gap-1">
          <span className="lp-mono text-[11px] font-semibold tracking-[0.18em] text-(--lp-gold)">
            НАБОР ИСКАТЕЛЯ
          </span>
          <span className="text-[13px] text-(--lp-muted)">
            Полный комплект — кликни по кости, и она бросится
          </span>
        </div>
        <div className="lp-dice-row flex flex-wrap items-end gap-[clamp(12px,1.8vw,22px)]">
          {DICE.map((d, i) => (
            <button
              key={d.max}
              type="button"
              title={`Бросить ${d.label}`}
              className="lp-die-btn"
              onClick={() => roll(i, d.max)}
            >
              <span
                ref={(el) => {
                  shapeRefs.current[i] = el
                }}
                className="block text-(--lp-gold)"
                style={{ width: d.size, height: d.size }}
              >
                <svg viewBox="0 0 60 60" width={d.size} height={d.size}>
                  {d.shape.kind === 'rect' ? (
                    <rect
                      x={d.shape.x}
                      y={d.shape.y}
                      width={d.shape.w}
                      height={d.shape.h}
                      rx={d.shape.rx}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={d.strokeWidth}
                      opacity={d.outlineOpacity}
                    />
                  ) : (
                    <polygon
                      points={d.shape.points}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={d.strokeWidth}
                      strokeLinejoin="round"
                      opacity={d.outlineOpacity}
                    />
                  )}
                  {d.midline && (
                    <line
                      x1={d.midline.x1}
                      y1={d.midline.y1}
                      x2={d.midline.x2}
                      y2={d.midline.y2}
                      stroke="currentColor"
                      strokeWidth={0.8}
                      opacity={0.35}
                    />
                  )}
                  {d.inner && (
                    <polygon
                      points={d.inner}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={0.8}
                      opacity={0.4}
                    />
                  )}
                  {d.dots.map(([x, y]) => (
                    <circle key={`${x}:${y}`} cx={x} cy={y} r={d.dotR} fill="currentColor" />
                  ))}
                  <text
                    ref={(el) => {
                      numRefs.current[i] = el
                    }}
                    x={30}
                    y={d.numY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="lp-slab"
                    fontWeight={700}
                    fontSize={d.fontSize}
                    fill="currentColor"
                  >
                    {d.max}
                  </text>
                </svg>
              </span>
              <span
                className={`lp-mono text-[10px] font-semibold tracking-[0.08em] ${
                  d.max === 20 ? 'text-(--lp-gold)' : 'text-(--lp-muted)'
                }`}
              >
                {d.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
