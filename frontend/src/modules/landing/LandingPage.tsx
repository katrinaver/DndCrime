import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useAuth } from '../../context/AuthContext'
import { buildHexTextureDataUri, buildPalette, LANDING_ACCENT } from './accent'
import { INITIAL_DIE_STATUS } from './data'
import { useLandingFxLoop } from './hooks/useLandingFxLoop'
import { ArtifactSection } from './sections/ArtifactSection'
import { DiceStrip } from './sections/DiceStrip'
import { FeaturesSection } from './sections/FeaturesSection'
import { HeroSection, type DieStatus } from './sections/HeroSection'
import { LandingFooter } from './sections/LandingFooter'
import { LandingHeader } from './sections/LandingHeader'
import { MasterTipStrip } from './sections/MasterTipStrip'
import './landing.css'

// Шрифты лендинга (self-host, попадают в lazy-чанк вместе со страницей).
// Заголовки: Zilla Slab (латиница, без кириллицы) + Bitter (кириллический slab-фолбэк).
import '@fontsource/zilla-slab/400.css'
import '@fontsource/zilla-slab/500.css'
import '@fontsource/zilla-slab/600.css'
import '@fontsource/zilla-slab/700.css'
import '@fontsource/zilla-slab/400-italic.css'
import '@fontsource/zilla-slab/500-italic.css'
import '@fontsource/bitter/400.css'
import '@fontsource/bitter/500.css'
import '@fontsource/bitter/600.css'
import '@fontsource/bitter/700.css'
import '@fontsource/bitter/400-italic.css'
import '@fontsource/bitter/500-italic.css'
import '@fontsource/golos-text/400.css'
import '@fontsource/golos-text/500.css'
import '@fontsource/golos-text/600.css'
import '@fontsource/golos-text/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import '@fontsource/jetbrains-mono/700.css'

export default function LandingPage() {
  const { user } = useAuth()
  const appLink = user ? '/home' : '/login'

  const [status, setStatus] = useState<DieStatus>({ text: INITIAL_DIE_STATUS, color: '' })
  const [history, setHistory] = useState<number[]>([])

  const heroSectionRef = useRef<HTMLElement>(null)
  const tipSectionRef = useRef<HTMLDivElement>(null)
  const featuresSectionRef = useRef<HTMLElement>(null)
  const artifactSectionRef = useRef<HTMLElement>(null)
  const dieCanvasRef = useRef<HTMLCanvasElement>(null)
  const emberCanvasRef = useRef<HTMLCanvasElement>(null)
  const dragonCanvasRef = useRef<HTMLCanvasElement>(null)
  const beholdCanvasRef = useRef<HTMLCanvasElement>(null)
  const portalCanvasRef = useRef<HTMLCanvasElement>(null)
  const skullCanvasRef = useRef<HTMLCanvasElement>(null)
  const glowRef = useRef<HTMLSpanElement>(null)
  const tipTextRef = useRef<HTMLSpanElement>(null)
  const tipLabelRef = useRef<HTMLSpanElement>(null)
  const tipFxRef = useRef<HTMLCanvasElement>(null)
  const tipHostRef = useRef<HTMLDivElement>(null)

  const onStatus = useCallback((text: string, color: string) => setStatus({ text, color }), [])
  const onHistory = useCallback((last6: number[]) => setHistory(last6), [])
  const onBurst = useCallback(() => {
    const glow = glowRef.current
    if (glow && typeof glow.animate === 'function') {
      glow.animate(
        [
          { opacity: 1, transform: 'scale(1.3)' },
          { opacity: 0.6, transform: 'scale(1)' },
        ],
        { duration: 900, easing: 'ease-out' },
      )
    }
  }, [])

  useLandingFxLoop(
    {
      heroSection: heroSectionRef,
      tipSection: tipSectionRef,
      featuresSection: featuresSectionRef,
      artifactSection: artifactSectionRef,
      dieCanvas: dieCanvasRef,
      emberCanvas: emberCanvasRef,
      dragonCanvas: dragonCanvasRef,
      beholdCanvas: beholdCanvasRef,
      portalCanvas: portalCanvasRef,
      skullCanvas: skullCanvasRef,
      tipText: tipTextRef,
      tipLabel: tipLabelRef,
      tipFx: tipFxRef,
      tipHost: tipHostRef,
    },
    { onStatus, onHistory, onBurst },
  )

  // плавный скролл по якорям — только пока лендинг смонтирован
  useEffect(() => {
    document.documentElement.classList.add('lp-smooth')
    return () => document.documentElement.classList.remove('lp-smooth')
  }, [])

  const hexTexture = useMemo(() => buildHexTextureDataUri(buildPalette(LANDING_ACCENT).ac), [])

  return (
    <div className="lp-root" style={{ '--lp-accent': LANDING_ACCENT } as CSSProperties}>
      <div className="lp-texture" aria-hidden="true" style={{ backgroundImage: hexTexture }} />
      <div className="lp-noise" aria-hidden="true" />
      <div className="lp-vignette" aria-hidden="true" />

      <div className="relative z-[1]">
        <LandingHeader appLink={appLink} />
        <HeroSection
          sectionRef={heroSectionRef}
          emberCanvasRef={emberCanvasRef}
          dragonCanvasRef={dragonCanvasRef}
          dieCanvasRef={dieCanvasRef}
          glowRef={glowRef}
          status={status}
          history={history}
        />
        <MasterTipStrip
          sectionRef={tipSectionRef}
          labelRef={tipLabelRef}
          textRef={tipTextRef}
          fxRef={tipFxRef}
          hostRef={tipHostRef}
        />
        <DiceStrip />
        <FeaturesSection sectionRef={featuresSectionRef} beholdCanvasRef={beholdCanvasRef} />
        <ArtifactSection
          sectionRef={artifactSectionRef}
          skullCanvasRef={skullCanvasRef}
          portalCanvasRef={portalCanvasRef}
          appLink={appLink}
        />
        <LandingFooter appLink={appLink} />
      </div>
    </div>
  )
}
