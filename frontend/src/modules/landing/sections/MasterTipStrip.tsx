import type { RefObject } from 'react'
import { TIPS } from '../data'

interface MasterTipStripProps {
  sectionRef: RefObject<HTMLDivElement>
  labelRef: RefObject<HTMLSpanElement>
  textRef: RefObject<HTMLSpanElement>
  fxRef: RefObject<HTMLCanvasElement>
  hostRef: RefObject<HTMLDivElement>
}

/**
 * Полоса «Совет мастера», две строки: сверху метка «СОВЕТ МАСТЕРА №N»,
 * под ней сам совет, оба по центру. React рендерит только первый совет —
 * дальше textContent мутирует createTipRotator (высокочастотный эффект сжигания).
 *
 * Слот совета растянут невидимыми копиями всех советов в одной grid-ячейке:
 * размер полосы не зависит от текущего совета, и контент ниже не дёргается
 * при ротации. Canvas эффекта ротатор позиционирует сам — по фактическому
 * положению текста на момент сжигания.
 */
export function MasterTipStrip({ sectionRef, labelRef, textRef, fxRef, hostRef }: MasterTipStripProps) {
  return (
    <div ref={sectionRef} className="relative">
      <div className="mx-auto flex max-w-[1220px] flex-col items-center gap-y-2 px-[clamp(20px,5vw,40px)] pb-[3px] pt-[15px]">
        <span
          ref={labelRef}
          className="lp-mono whitespace-nowrap text-[10px] font-semibold tracking-[0.18em] text-(--lp-gold)"
        >
          СОВЕТ МАСТЕРА №{TIPS[0].n}
        </span>
        <div ref={hostRef} className="relative grid">
          {TIPS.map((tip) => (
            <span
              key={tip.n}
              aria-hidden="true"
              className="lp-slab invisible col-start-1 row-start-1 text-[15px] font-medium italic leading-[1.5]"
            >
              {tip.q}
            </span>
          ))}
          <span
            ref={textRef}
            className="lp-slab col-start-1 row-start-1 self-start justify-self-center text-center text-[15px] font-medium italic leading-[1.5] text-(--lp-ink-dim)"
          >
            {TIPS[0].q}
          </span>
          <canvas
            ref={fxRef}
            aria-hidden="true"
            width={10}
            height={10}
            className="pointer-events-none absolute -left-6 -top-6"
          />
        </div>
      </div>
    </div>
  )
}
