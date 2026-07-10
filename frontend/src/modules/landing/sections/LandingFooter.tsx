import { Link } from 'react-router-dom'

export function LandingFooter({ appLink }: { appLink: string }) {
  return (
    <footer className="border-t border-(--lp-line) px-[clamp(20px,5vw,40px)] py-8">
      <div className="lp-footer-inner mx-auto flex max-w-[1220px] flex-wrap items-center gap-[18px]">
        <div className="mr-auto flex items-center gap-[11px]">
          <span className="lp-slab grid h-7 w-7 place-items-center rounded-lg bg-[linear-gradient(160deg,var(--lp-gold-2),var(--lp-gold))] text-[15px] font-extrabold text-[#1b1712]">
            D
          </span>
          <div>
            <div className="lp-slab text-[17px] font-bold leading-none text-(--lp-ink)">
              Dnd<span className="text-(--lp-gold)">Crime</span>
            </div>
            <div className="lp-mono mt-[3px] text-[11px] font-medium text-(--lp-muted)">
              Портал для офлайн D&amp;D-партий
            </div>
          </div>
        </div>
        <Link to={appLink} className="lp-mono text-[13px] font-medium text-(--lp-gold) hover:text-(--lp-gold-2)">
          dnd-crime.gistrec.cloud →
        </Link>
        <span className="lp-mono text-[11px] font-medium tracking-[0.06em] text-(--lp-faint)">
          ДЕЛО № DC-2026 · между сессиями
        </span>
      </div>
    </footer>
  )
}
