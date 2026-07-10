import type { RefObject } from 'react'
import { LANDING_EMBERS } from '../accent'
import { HeroPanel } from './HeroPanel'

export interface DieStatus {
  text: string
  /** CSS-цвет ('var(--lp-gold-2)' и т.п.) или '' для дефолтного */
  color: string
}

interface HeroSectionProps {
  sectionRef: RefObject<HTMLElement>
  emberCanvasRef: RefObject<HTMLCanvasElement>
  dragonCanvasRef: RefObject<HTMLCanvasElement>
  dieCanvasRef: RefObject<HTMLCanvasElement>
  glowRef: RefObject<HTMLSpanElement>
  status: DieStatus
  history: number[]
}

export function HeroSection({
  sectionRef,
  emberCanvasRef,
  dragonCanvasRef,
  dieCanvasRef,
  glowRef,
  status,
  history,
}: HeroSectionProps) {
  return (
    <section id="top" ref={sectionRef} className="lp-hero">
      {LANDING_EMBERS && (
        <canvas
          ref={emberCanvasRef}
          aria-hidden="true"
          width={300}
          height={200}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      )}
      <canvas
        ref={dragonCanvasRef}
        aria-hidden="true"
        width={1040}
        height={600}
        className="lp-dragon-canvas pointer-events-none absolute -top-[58px] left-[-10px] z-[70] h-[300px] w-[520px] opacity-85"
      />
      <div className="relative mx-auto flex max-w-[1220px] flex-wrap items-center gap-[clamp(32px,5vw,60px)]">
        <div className="flex min-w-0 flex-[1_1_440px] flex-col items-start gap-[22px]">
          <h1 className="lp-h1 lp-fade-up" style={{ animationDelay: '.12s' }}>
            Вся кампания —
            <br />
            <span className="text-(--lp-gold)">в одном месте.</span>
          </h1>
          <p className="lp-hero-sub lp-fade-up" style={{ animationDelay: '.2s' }}>
            DndCrime — портал для офлайн D&amp;D-партий.
          </p>
          <p className="lp-hero-desc lp-fade-up" style={{ animationDelay: '.28s' }}>
            Кампании, персонажи, календарь, новости, заметки и материалы партии собраны в одном
            командном центре. Готовьтесь, координируйтесь и ничего не теряйте между сессиями.
          </p>
          <div className="lp-fade-up mt-[6px] flex flex-wrap items-center gap-5" style={{ animationDelay: '.52s' }}>
            <div className="relative h-[140px] w-[140px] flex-none">
              <span ref={glowRef} aria-hidden="true" className="lp-glow" />
              <canvas
                ref={dieCanvasRef}
                width={440}
                height={440}
                role="button"
                tabIndex={0}
                aria-label="Кубик d20 — кликни для броска, потяни, чтобы раскрутить"
                className="lp-die-canvas"
              />
            </div>
            <div className="lp-die-status flex min-w-[190px] max-w-[250px] flex-col gap-[5px]">
              <span className="lp-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-(--lp-gold)">
                Проверка удачи · d20
              </span>
              <span
                className="text-[14px] font-medium leading-[1.45] text-(--lp-ink-dim)"
                style={status.color ? { color: status.color } : undefined}
              >
                {status.text}
              </span>
              <span className="lp-mono min-h-[14px] text-[11px] font-medium tracking-[0.05em] text-(--lp-muted)">
                {history.length > 0 ? `журнал: ${history.join(' · ')}` : ''}
              </span>
            </div>
          </div>
        </div>

        <HeroPanel />
      </div>
    </section>
  )
}
