import { Link } from 'react-router-dom'

export function LandingHeader({ appLink }: { appLink: string }) {
  return (
    <header className="lp-header">
      <nav className="lp-nav">
        <a href="#top" className="mr-auto flex items-center gap-[11px]">
          <span className="lp-logo-badge">D</span>
          <span className="lp-slab text-[20px] font-bold leading-none tracking-[0.01em] text-(--lp-ink)">
            Dnd<span className="text-(--lp-gold)">Crime</span>
          </span>
        </a>
        <div className="lp-nav-links flex items-center gap-[22px]">
          <a href="#features" className="lp-navlink">
            Возможности
          </a>
          <a href="#artifact" className="lp-navlink">
            Артефакт
          </a>
        </div>
        <Link to={appLink} className="lp-cta">
          Войти
        </Link>
      </nav>
    </header>
  )
}
