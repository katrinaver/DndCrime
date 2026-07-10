import { ABILITY_SCORES } from '../data'

/** Статичные мини-моки внутри карточек «Возможностей» (витринные данные) */

export function CampaignMock() {
  return (
    <div className="mt-auto flex items-center gap-[11px] rounded-[11px] border border-(--lp-line) bg-(--lp-panel) p-[11px]">
      <div className="lp-hatch h-[38px] w-[38px] flex-none rounded-[9px] border border-(--lp-line)" />
      <div className="min-w-0">
        <div className="lp-slab text-[14px] font-semibold text-(--lp-ink)">Преступления в Каррне</div>
        <div className="lp-mono mt-[2px] text-[10px] font-medium text-(--lp-muted)">Комната · чат · материалы</div>
      </div>
      <div className="ml-auto flex">
        <span className="lp-av lp-av-gold h-6 w-6 border-[1.5px] border-(--lp-panel) text-[10px] text-[#1b1712]">К</span>
        <span className="lp-av lp-av-crimson -ml-2 h-6 w-6 border-[1.5px] border-(--lp-panel) text-[10px] text-[#1b1712]">А</span>
        <span className="lp-av -ml-2 h-6 w-6 border-[1.5px] border-(--lp-panel) bg-(--lp-card-2) text-[9px] text-(--lp-gold)">+3</span>
      </div>
    </div>
  )
}

export function CharacterMock() {
  return (
    <div className="mt-auto flex flex-col gap-[11px] rounded-[11px] border border-(--lp-line) bg-(--lp-panel) p-3">
      <div className="flex items-center gap-[10px]">
        <div className="lp-hatch-sm grid h-[42px] w-[42px] flex-none place-items-center rounded-[9px] border border-(--lp-line)">
          <span className="lp-mono text-[8px] font-medium tracking-[0.08em] text-(--lp-faint)">ПОРТРЕТ</span>
        </div>
        <div className="min-w-0">
          <div className="lp-slab text-[14px] font-semibold text-(--lp-ink)">Кассандра Вейл</div>
          <div className="lp-mono mt-[2px] text-[10px] font-medium text-(--lp-muted)">Полурослик · Плут · ур. 5</div>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-[5px]">
        {ABILITY_SCORES.map((a) => (
          <div key={a.code} className="rounded-[7px] border border-(--lp-line) bg-(--lp-card) px-px py-[6px] text-center">
            <div className="lp-mono text-[8px] font-semibold text-(--lp-muted)">{a.code}</div>
            <div className="lp-slab text-[15px] font-bold leading-[1.1] text-(--lp-ink)">{a.value}</div>
            <div className="lp-mono text-[9px] font-semibold text-(--lp-gold)">{a.mod}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-[7px]">
        <span className="lp-mono rounded-[7px] border border-(--lp-line-gold) bg-(--lp-gold-a10) px-[9px] py-1 text-[11px] font-semibold text-(--lp-gold-2)">HP 34 / 34</span>
        <span className="lp-mono rounded-[7px] border border-(--lp-line-gold) bg-(--lp-gold-a10) px-[9px] py-1 text-[11px] font-semibold text-(--lp-gold-2)">КЗ 15</span>
        <span className="lp-mono rounded-[7px] border border-(--lp-line) bg-(--lp-card) px-[9px] py-1 text-[11px] font-semibold text-(--lp-muted)">Скор. 25</span>
      </div>
    </div>
  )
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const CALENDAR_WEEK = [7, 8, 9, 10, 11, 12, 13]
const SESSION_DAY = 12

export function CalendarMock() {
  return (
    <div className="mt-auto flex flex-col gap-[9px] rounded-[11px] border border-(--lp-line) bg-(--lp-panel) p-3">
      <div className="flex items-center">
        <span className="lp-slab text-[13px] font-semibold text-(--lp-ink)">Июль 2026</span>
        <span className="lp-mono ml-auto text-[10px] font-medium text-(--lp-gold)">2 сессии</span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="lp-mono text-center text-[9px] font-semibold text-(--lp-muted)">
            {d}
          </div>
        ))}
        {CALENDAR_WEEK.map((day) =>
          day === SESSION_DAY ? (
            <div
              key={day}
              className="rounded-md border border-(--lp-gold-deep) bg-[linear-gradient(160deg,var(--lp-gold-2),var(--lp-gold))] py-[5px] text-center text-[12px] font-bold text-[#1b1712]"
            >
              {day}
            </div>
          ) : (
            <div key={day} className="rounded-md bg-(--lp-card) py-[5px] text-center text-[12px] font-semibold text-(--lp-ink-dim)">
              {day}
            </div>
          ),
        )}
      </div>
      <div className="flex items-center gap-[9px] rounded-lg border border-(--lp-line-gold) bg-(--lp-gold-a08) px-[9px] py-2">
        <span className="lp-mono text-[10px] font-bold text-(--lp-gold-2)">12 ИЮЛ</span>
        <span className="text-[12px] font-medium text-(--lp-ink)">Session 14</span>
        <span className="lp-mono ml-auto text-[10px] font-medium text-(--lp-muted)">сб 18:00</span>
      </div>
    </div>
  )
}

export function NewsMock() {
  return (
    <div className="mt-auto rounded-[11px] border border-(--lp-line) bg-(--lp-panel) p-[13px]">
      <div className="flex items-center gap-2">
        <span className="lp-mono rounded-md border border-(--lp-line-gold) bg-(--lp-gold-a10) px-[7px] py-[3px] text-[10px] font-semibold text-(--lp-gold-2)">05 ИЮЛ</span>
        <span className="lp-mono text-[11px] font-medium text-(--lp-muted)">Мастер</span>
      </div>
      <div className="lp-slab mt-[9px] text-[15px] font-semibold text-(--lp-ink)">Смена места встречи</div>
      <p className="mt-[6px] text-[13px] leading-[1.5] text-(--lp-ink-dim)">
        Играем у Артёма — стол больше. Приносите кубики и, если можно, снеки.
      </p>
      <div className="lp-mono mt-[10px] flex items-center gap-[10px] text-[10px] font-medium text-(--lp-muted)">
        <span>2 комментария</span>
        <span className="text-(--lp-gold)">· закреплено</span>
      </div>
    </div>
  )
}

export function NotesMock() {
  return (
    <div className="mt-auto rounded-[11px] border border-(--lp-line) bg-(--lp-panel) p-[13px]">
      <div className="flex items-center">
        <span className="lp-slab text-[14px] font-semibold text-(--lp-ink)">Тайник гоблинов — зацепки</span>
        <span className="lp-mono ml-auto text-[10px] font-medium text-(--lp-muted)">черновик</span>
      </div>
      <div className="mt-[10px] flex flex-col gap-[6px]">
        <div className="flex items-center gap-2 text-[12px] text-(--lp-ink-dim)">
          <span className="h-[5px] w-[5px] flex-none rounded-full bg-(--lp-gold)" />
          Разбитый фонарь у входа в туннель
        </div>
        <div className="flex items-center gap-2 text-[12px] text-(--lp-ink-dim)">
          <span className="h-[5px] w-[5px] flex-none rounded-full bg-(--lp-gold)" />
          Метка на карте — комната с ловушкой
        </div>
      </div>
      <div className="mt-[11px] flex items-center gap-[9px] rounded-lg border border-(--lp-line) bg-(--lp-card) px-[9px] py-2">
        <span className="lp-mono rounded-[5px] border border-(--lp-line-gold) px-[5px] py-[3px] text-[9px] font-bold text-(--lp-gold)">PNG</span>
        <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-medium text-(--lp-ink)">карта_подземелья.png</span>
        <span className="lp-mono ml-auto whitespace-nowrap text-[10px] font-medium text-(--lp-muted)">+3 файла</span>
      </div>
    </div>
  )
}

export function ChatMock() {
  return (
    <div className="mt-auto flex flex-col gap-[9px] rounded-[11px] border border-(--lp-line) bg-(--lp-panel) p-3">
      <div className="flex items-start gap-2">
        <span className="lp-av lp-av-gold h-[22px] w-[22px] flex-none text-[9px] text-[#1b1712]">М</span>
        <div className="min-w-0">
          <div className="lp-mono text-[9px] font-semibold tracking-[0.05em] text-(--lp-gold)">Мастер</div>
          <div className="mt-[3px] rounded-[9px] border border-(--lp-line) bg-(--lp-card) px-[9px] py-[7px] text-[12px] leading-[1.4] text-(--lp-ink)">
            Сессия в субботу переносится на 18:00.
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <span className="lp-av lp-av-crimson h-[22px] w-[22px] flex-none text-[9px] text-[#1b1712]">А</span>
        <div className="min-w-0">
          <div className="lp-mono text-[9px] font-semibold tracking-[0.05em] text-(--lp-crimson-2)">Артём</div>
          <div className="mt-[3px] rounded-[9px] border border-(--lp-line) bg-(--lp-card) px-[9px] py-[7px] text-[12px] leading-[1.4] text-(--lp-ink)">
            Принял! Кассандра готова к вылазке.
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-[9px] border border-(--lp-line) bg-(--lp-card) px-[9px] py-[7px]">
        <span className="text-[12px] text-(--lp-muted)">Написать в чат кампании…</span>
        <span className="lp-mono ml-auto rounded-md bg-[linear-gradient(160deg,var(--lp-gold-2),var(--lp-gold))] px-2 py-1 text-[10px] font-bold text-[#1b1712]">↵</span>
      </div>
    </div>
  )
}
