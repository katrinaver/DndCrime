import { useEffect, useRef } from 'react'
import { DICE } from '../data'
import { rollMini } from '../fx/miniDice'

/** Полоса «Набор искателя»: шесть кликабельных костей d4–d20 */
export function DiceStrip() {
  const shapeRefs = useRef<(HTMLSpanElement | null)[]>([])
  const numRefs = useRef<(HTMLSpanElement | null)[]>([])
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
                className="relative block bg-(--lp-gold-deep)"
                style={{
                  width: d.size,
                  height: d.size,
                  clipPath: d.clip ?? undefined,
                  borderRadius: d.radius?.outer,
                }}
              >
                <span
                  className="absolute grid place-items-center bg-[linear-gradient(160deg,#2c2418,#181310)]"
                  style={{
                    inset: d.inset,
                    clipPath: d.clip ?? undefined,
                    borderRadius: d.radius?.inner,
                  }}
                >
                  <span
                    ref={(el) => {
                      numRefs.current[i] = el
                    }}
                    className="lp-slab font-bold text-(--lp-gold-2)"
                    style={{
                      fontSize: d.fontSize,
                      transform: d.numShift ? `translateY(${d.numShift}px)` : undefined,
                    }}
                  >
                    {d.max}
                  </span>
                </span>
              </span>
              <span className="lp-mono text-[10px] font-semibold tracking-[0.08em] text-(--lp-muted)">
                {d.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
