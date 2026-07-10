import type { ReactNode, RefObject } from 'react'
import {
  CalendarMock,
  CampaignMock,
  CharacterMock,
  ChatMock,
  NewsMock,
  NotesMock,
} from './featureMocks'

interface FeaturesSectionProps {
  sectionRef: RefObject<HTMLElement>
  beholdCanvasRef: RefObject<HTMLCanvasElement>
}

function FeatureCard({ chip, title, text, children }: { chip: string; title: string; text: string; children: ReactNode }) {
  return (
    <div className="lp-feature-card">
      <div className="flex items-center gap-[10px]">
        <span className="lp-feature-chip">{chip}</span>
        <h3 className="lp-slab m-0 text-[18px] font-semibold text-(--lp-ink)">{title}</h3>
      </div>
      <p className="m-0 text-[14px] leading-[1.55] text-(--lp-muted)">{text}</p>
      {children}
    </div>
  )
}

function CampaignRoomCard() {
  return (
    <div className="mt-[18px] flex flex-wrap items-center gap-[26px] rounded-2xl border border-(--lp-line-gold) bg-[linear-gradient(120deg,var(--lp-panel),#17130e)] p-[clamp(20px,2.5vw,26px)]">
      <div className="min-w-0 flex-[1_1_320px]">
        <span className="lp-mono rounded-md border border-(--lp-line-gold) bg-(--lp-gold-a07) px-[9px] py-[5px] text-[10px] font-semibold tracking-[0.16em] text-(--lp-gold)">
          КОМНАТА КАМПАНИИ
        </span>
        <h3 className="lp-slab mb-0 mt-[14px] text-[clamp(22px,2.4vw,28px)] font-bold leading-[1.1] text-(--lp-ink)">
          У каждой кампании — своя комната
        </h3>
        <p className="mb-0 mt-[11px] text-[14px] leading-[1.55] text-(--lp-ink-dim)">
          Меню, чат, материалы и достижения партии в одном пространстве. Мастер настраивает анкеты
          персонажей под свою кампанию.
        </p>
        <div className="mt-[15px] flex flex-wrap gap-2">
          <span className="lp-mono rounded-[7px] bg-[linear-gradient(160deg,var(--lp-gold-2),var(--lp-gold))] px-[11px] py-[6px] text-[11px] font-semibold text-[#1b1712]">Меню</span>
          <span className="lp-mono rounded-[7px] border border-(--lp-line) bg-(--lp-card) px-[11px] py-[6px] text-[11px] font-semibold text-(--lp-ink-dim)">Чат</span>
          <span className="lp-mono rounded-[7px] border border-(--lp-line) bg-(--lp-card) px-[11px] py-[6px] text-[11px] font-semibold text-(--lp-ink-dim)">Материалы</span>
          <span className="lp-mono rounded-[7px] border border-(--lp-line) bg-(--lp-card) px-[11px] py-[6px] text-[11px] font-semibold text-(--lp-ink-dim)">Достижения</span>
        </div>
      </div>
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-[9px]">
        <div className="flex items-center gap-[9px] rounded-[10px] border border-(--lp-line) bg-(--lp-card) px-3 py-[10px]">
          <span className="lp-mono rounded-[5px] border border-(--lp-line-gold) px-[6px] py-[3px] text-[9px] font-bold text-(--lp-gold)">PDF</span>
          <span className="text-[13px] font-medium text-(--lp-ink)">правила_дома.pdf</span>
          <span className="lp-mono ml-auto text-[10px] font-medium text-(--lp-muted)">180 КБ</span>
        </div>
        <div className="flex items-center gap-[9px] rounded-[10px] border border-(--lp-line) bg-(--lp-card) px-3 py-[10px]">
          <span className="lp-mono rounded-[5px] border border-(--lp-line-gold) px-[6px] py-[3px] text-[9px] font-bold text-(--lp-gold)">PNG</span>
          <span className="text-[13px] font-medium text-(--lp-ink)">карта_региона.png</span>
          <span className="lp-mono ml-auto text-[10px] font-medium text-(--lp-muted)">1.2 МБ</span>
        </div>
        <div className="flex items-center gap-[10px] rounded-[10px] border border-(--lp-line-gold) bg-(--lp-gold-a08) px-3 py-[10px]">
          <span className="h-2 w-2 flex-none rounded-full bg-(--lp-gold)" />
          <span className="lp-mono text-[11px] font-semibold text-(--lp-gold-2)">Достижение</span>
          <span className="text-[13px] font-medium text-(--lp-ink)">Первый дракон повержен</span>
        </div>
        <div className="flex items-center gap-[10px] rounded-[10px] border border-[rgba(192,90,79,0.35)] bg-[rgba(162,65,60,0.1)] px-3 py-[10px]">
          <span className="h-2 w-2 flex-none rounded-full bg-(--lp-crimson-2)" />
          <span className="lp-mono text-[11px] font-semibold text-(--lp-crimson-2)">Антидостижение</span>
          <span className="text-[13px] font-medium text-(--lp-ink)">Уронил факел в воду</span>
        </div>
      </div>
    </div>
  )
}

export function FeaturesSection({ sectionRef, beholdCanvasRef }: FeaturesSectionProps) {
  return (
    <section id="features" ref={sectionRef} className="lp-features">
      <canvas
        ref={beholdCanvasRef}
        aria-hidden="true"
        width={1040}
        height={600}
        className="lp-behold-canvas pointer-events-none absolute -top-[26px] right-[-40px] z-[1] h-auto w-[min(500px,72vw)] opacity-[0.74]"
      />
      <div className="relative z-[2] mx-auto max-w-[1220px]">
        <div className="mb-[clamp(30px,3.5vw,44px)] max-w-[720px]">
          <span className="lp-eyebrow">// Возможности</span>
          <h2 className="lp-h2">Всё, что живёт в чатах и документах — теперь здесь</h2>
          <p className="lp-lead">
            Реальные сущности продукта, а не абстракции: карточки кампаний, листы персонажей,
            календарь сессий, новости, заметки и чат партии.
          </p>
        </div>

        <div className="lp-features-grid">
          <FeatureCard chip="КМП" title="Кампании" text="Создавайте кампании, ведите список участников и управляйте пространством партии.">
            <CampaignMock />
          </FeatureCard>
          <FeatureCard chip="ПРС" title="Персонажи" text="Классический лист, общий профиль или анкета под конкретную кампанию.">
            <CharacterMock />
          </FeatureCard>
          <FeatureCard chip="КАЛ" title="Календарь" text="Планируйте сессии и не теряйте даты встреч.">
            <CalendarMock />
          </FeatureCard>
          <FeatureCard chip="НОВ" title="Новости" text="Публикуйте объявления между сессиями.">
            <NewsMock />
          </FeatureCard>
          <FeatureCard chip="ЗМТ" title="Заметки и файлы" text="Игровые заметки, подготовка и детали — с вложениями и аватарами.">
            <NotesMock />
          </FeatureCard>
          <FeatureCard chip="ЧАТ" title="Чат кампании" text="Внутреннее обсуждение по конкретной кампании.">
            <ChatMock />
          </FeatureCard>
        </div>

        <CampaignRoomCard />
      </div>
    </section>
  )
}
