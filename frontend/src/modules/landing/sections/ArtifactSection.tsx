import type { RefObject } from 'react'
import { Link } from 'react-router-dom'

interface ArtifactSectionProps {
  sectionRef: RefObject<HTMLElement>
  skullCanvasRef: RefObject<HTMLCanvasElement>
  appLink: string
}

export function ArtifactSection({ sectionRef, skullCanvasRef, appLink }: ArtifactSectionProps) {
  return (
    <section id="artifact" ref={sectionRef} className="lp-artifact z-[1]">
      <canvas
        ref={skullCanvasRef}
        aria-hidden="true"
        width={1040}
        height={600}
        className="pointer-events-none absolute -top-4 right-0 z-[1] h-auto w-[min(640px,80vw)] translate-x-[30%] opacity-90"
      />
      <div className="relative z-[2] mx-auto max-w-[1220px]">
        <div className="mb-[clamp(30px,3.5vw,44px)] max-w-[720px]">
          <span className="lp-eyebrow">// Артефакт</span>
          <h2 className="lp-h2">Легендарный предмет вашей партии</h2>
          <p className="lp-lead">
            Соберите кампанию в одном месте — и получите бонусы, которых не даёт ни один свиток.
          </p>
        </div>
      </div>
      <div className="relative z-[2] mx-auto flex max-w-[1220px] flex-wrap items-center gap-[clamp(30px,4.5vw,60px)]">
        <div className="lp-artifact-col min-w-0 flex-[1_1_420px]">
          <div className="lp-artifact-card">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="lp-slab text-[clamp(24px,2.6vw,30px)] font-bold tracking-[0.01em] text-(--lp-gold-2)">DndCrime</span>
              <span className="lp-mono rounded-md border border-[rgba(192,90,79,0.4)] bg-[rgba(162,65,60,0.08)] px-2 py-1 text-[10px] font-semibold tracking-[0.14em] text-(--lp-crimson-2)">
                ЛЕГЕНДАРНЫЙ
              </span>
            </div>
            <div className="lp-slab mt-[7px] text-[14px] font-medium italic text-(--lp-muted)">
              Чудесный предмет (портал партии) · требуется настройка всей партией
            </div>
            <div className="lp-divider-right" />
            <div className="flex flex-col gap-3">
              <div className="text-[14px] leading-[1.55] text-(--lp-ink-dim)">
                <span className="lp-slab font-bold text-(--lp-gold)">Организованность.</span> +5 ко всем
                проверкам «собраться на сессию вовремя».
              </div>
              <div className="text-[14px] leading-[1.55] text-(--lp-ink-dim)">
                <span className="lp-slab font-bold text-(--lp-gold)">Память партии.</span> Преимущество на
                воспоминания «что было в прошлой серии» — заметки и логи всегда под рукой.
              </div>
              <div className="text-[14px] leading-[1.55] text-(--lp-ink-dim)">
                <span className="lp-slab font-bold text-(--lp-gold)">Иммунитет.</span> Потерянные листы,
                забытые даты, вопрос «а у кого карта?».
              </div>
              <div className="text-[14px] leading-[1.55] text-(--lp-ink-dim)">
                <span className="lp-slab font-bold text-(--lp-crimson-2)">Уязвимость.</span> Отменённая
                сессия наносит партии 2d6 урона по морали.
              </div>
            </div>
            <div className="lp-divider-left" />
            <div className="lp-slab text-[13px] italic leading-[1.6] text-(--lp-muted)">
              «Найден в архивах Каррна. Партия, завершившая настройку, не теряет нить кампании — и
              друг друга.»
            </div>
          </div>
        </div>
        <div className="lp-artifact-col flex min-w-0 flex-[1_1_320px] flex-col items-start gap-[18px]">
          <span className="lp-eyebrow">// Финальный ход</span>
          <h2 className="lp-artifact-cta-title">Бросьте инициативу — и откройте своё дело</h2>
          <p className="m-0 max-w-[420px] text-[15px] leading-[1.6] text-(--lp-ink-dim)">
            Вход через Google, без пароля. Комната партии, календарь и листы персонажей будут готовы
            за минуту.
          </p>
          <Link to={appLink} className="lp-cta lp-cta-lg">
            Войти
          </Link>
          <span className="lp-mono text-[12px] font-medium tracking-[0.04em] text-(--lp-muted)">
            Свой d20 приносить не обязательно — он уже здесь
          </span>
        </div>
      </div>
    </section>
  )
}
