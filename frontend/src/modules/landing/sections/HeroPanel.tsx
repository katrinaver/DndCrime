import { QUICK_LINKS } from '../data'

/** Мок «Главной панели» в правой колонке hero: окно, сессия, быстрые переходы, кампания */
export function HeroPanel() {
  return (
    <div className="lp-fade-up-slow relative min-w-0 flex-[1_1_440px]" style={{ animationDelay: '.32s' }}>
      <span aria-hidden="true" className="absolute -left-[9px] -top-[9px] h-[22px] w-[22px] border-l-2 border-t-2 border-(--lp-line-gold)" />
      <span aria-hidden="true" className="absolute -right-[9px] -top-[9px] h-[22px] w-[22px] border-r-2 border-t-2 border-(--lp-line-gold)" />
      <span aria-hidden="true" className="absolute -bottom-[9px] -left-[9px] h-[22px] w-[22px] border-b-2 border-l-2 border-(--lp-line-gold)" />
      <span aria-hidden="true" className="absolute -bottom-[9px] -right-[9px] h-[22px] w-[22px] border-b-2 border-r-2 border-(--lp-line-gold)" />
      <div className="lp-stamp">ДЕЛО ОТКРЫТО</div>

      <div className="relative overflow-hidden rounded-2xl border border-(--lp-line-gold) bg-[linear-gradient(180deg,var(--lp-panel),#17130e)] shadow-[0_34px_74px_-24px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-[10px] border-b border-(--lp-line) bg-black/20 px-[15px] py-3">
          <span className="h-[9px] w-[9px] rounded-full bg-(--lp-crimson-2)" />
          <span className="h-[9px] w-[9px] rounded-full bg-(--lp-gold)" />
          <span className="h-[9px] w-[9px] rounded-full bg-(--lp-faint)" />
          <span className="lp-slab ml-1 text-[13px] font-semibold text-(--lp-ink-dim)">DndCrime — Главная панель</span>
          <span className="lp-mono ml-auto text-[11px] font-medium text-(--lp-muted)">партия «Каррн»</span>
          <span className="lp-av lp-av-gold h-6 w-6 border-[1.5px] border-(--lp-panel) text-[11px] text-[#1b1712]">К</span>
        </div>

        <div className="flex flex-col gap-3 p-[15px]">
          <div className="lp-session-card flex items-center gap-[13px] rounded-xl border border-(--lp-line-gold) bg-[linear-gradient(120deg,var(--lp-gold-a12),var(--lp-gold-a02))] px-[13px] py-3">
            <div className="w-[52px] flex-none rounded-[9px] border border-(--lp-line-gold) bg-(--lp-gold-a16) py-[5px] text-center">
              <div className="lp-slab text-[22px] font-bold leading-none text-(--lp-gold-2)">12</div>
              <div className="lp-mono text-[10px] font-semibold tracking-[0.1em] text-(--lp-gold)">ИЮЛ</div>
            </div>
            <div className="min-w-0">
              <div className="lp-mono text-[10px] font-semibold tracking-[0.14em] text-(--lp-muted)">СЛЕДУЮЩАЯ СЕССИЯ</div>
              <div className="lp-slab mt-[3px] text-[15px] font-semibold text-(--lp-ink)">Session 14 · Подземелья Каррна</div>
            </div>
            <span className="lp-session-pill lp-mono ml-auto inline-flex items-center gap-[7px] whitespace-nowrap rounded-full border border-(--lp-line-gold) bg-(--lp-gold-a10) px-[10px] py-[5px] text-[11px] font-medium text-(--lp-gold-2)">
              <span className="lp-live-dot" />
              через 3 дня
            </span>
          </div>

          <div className="lp-mono text-[11px] font-medium tracking-[0.16em] text-(--lp-muted)">БЫСТРЫЕ ПЕРЕХОДЫ</div>
          <div className="lp-quick-grid grid grid-cols-3 gap-[9px]">
            {QUICK_LINKS.map((q) => (
              <a key={q.code} href="#features" className="lp-quick">
                <span className="lp-mono text-[10px] font-medium tracking-[0.1em] text-(--lp-gold)">{q.code}</span>
                <span className="text-[14px] font-semibold text-(--lp-ink)">{q.title}</span>
                <span className="lp-mono text-[11px] font-medium text-(--lp-muted)">{q.sub}</span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-[11px] border border-(--lp-line) bg-(--lp-card) px-3 py-[11px]">
            <div className="lp-hatch h-10 w-10 flex-none rounded-[9px] border border-(--lp-line)" />
            <div className="min-w-0">
              <div className="lp-mono text-[10px] font-medium tracking-[0.12em] text-(--lp-muted)">КАМПАНИЯ</div>
              <div className="lp-slab text-[15px] font-semibold text-(--lp-ink)">Преступления в Каррне</div>
            </div>
            <div className="ml-auto flex items-center">
              <span className="lp-av lp-av-gold h-[26px] w-[26px] border-[1.5px] border-(--lp-card) text-[10px] text-[#1b1712]">К</span>
              <span className="lp-av lp-av-crimson -ml-[9px] h-[26px] w-[26px] border-[1.5px] border-(--lp-card) text-[10px] text-[#1b1712]">А</span>
              <span className="lp-av lp-av-slate -ml-[9px] h-[26px] w-[26px] border-[1.5px] border-(--lp-card) text-[10px] text-[#1b1712]">Л</span>
              <span className="lp-av -ml-[9px] h-[26px] w-[26px] border-[1.5px] border-(--lp-card) bg-(--lp-card-2) text-[10px] text-(--lp-gold)">+2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
