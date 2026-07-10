import { useEffect, useRef, type RefObject } from 'react'
import { buildPalette, LANDING_ACCENT } from '../accent'
import { TIPS } from '../data'
import { createBeholder } from '../fx/beholder'
import { createD20, type D20Callbacks } from '../fx/d20'
import { createDragon } from '../fx/dragon'
import { createEmbers } from '../fx/embers'
import { createFloatDice } from '../fx/floatDice'
import { createSkull } from '../fx/skull'
import { createTipRotator } from '../fx/tipBurn'
import type { FxEnv } from '../fx/types'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { useSectionVisibility } from './useSectionVisibility'

export interface LandingFxTargets {
  heroSection: RefObject<HTMLElement>
  tipSection: RefObject<HTMLElement>
  featuresSection: RefObject<HTMLElement>
  artifactSection: RefObject<HTMLElement>
  dieCanvas: RefObject<HTMLCanvasElement>
  emberCanvas: RefObject<HTMLCanvasElement>
  dragonCanvas: RefObject<HTMLCanvasElement>
  beholdCanvas: RefObject<HTMLCanvasElement>
  /** Обёртка артефакта и подвала — по её размеру живёт поле рун-костей */
  floatWrap: RefObject<HTMLElement>
  floatDiceCanvas: RefObject<HTMLCanvasElement>
  skullCanvas: RefObject<HTMLCanvasElement>
  tipText: RefObject<HTMLElement>
  tipLabel: RefObject<HTMLElement>
  tipFx: RefObject<HTMLCanvasElement>
  tipHost: RefObject<HTMLElement>
}

/**
 * Единый RAF-координатор всех canvas-анимаций лендинга (порт _tick прототипа).
 * Секция рендерится только когда видима (IntersectionObserver);
 * dt зажат в 0.001–0.05с, поэтому возврат из фонового таба не даёт скачка.
 */
export function useLandingFxLoop(targets: LandingFxTargets, cb: D20Callbacks): void {
  const {
    heroSection,
    tipSection,
    featuresSection,
    artifactSection,
    dieCanvas,
    emberCanvas,
    dragonCanvas,
    beholdCanvas,
    floatWrap,
    floatDiceCanvas,
    skullCanvas,
    tipText,
    tipLabel,
    tipFx,
    tipHost,
  } = targets

  const visRef = useSectionVisibility(heroSection, tipSection, featuresSection, artifactSection)
  const reducedRef = usePrefersReducedMotion()
  const cbRef = useRef(cb)
  useEffect(() => {
    cbRef.current = cb
  })

  useEffect(() => {
    const hero = heroSection.current
    const dieCv = dieCanvas.current
    const emberCv = emberCanvas.current
    const dragonCv = dragonCanvas.current
    const beholdCv = beholdCanvas.current
    const wrap = floatWrap.current
    const floatCv = floatDiceCanvas.current
    const skullCv = skullCanvas.current
    const tText = tipText.current
    const tLabel = tipLabel.current
    const tFx = tipFx.current
    const tHost = tipHost.current
    if (
      !hero || !dieCv || !dragonCv || !beholdCv || !wrap || !floatCv || !skullCv ||
      !tText || !tLabel || !tFx || !tHost
    ) {
      return
    }
    const dieCtx = dieCv.getContext('2d')
    // ember-канвас опционален: при LANDING_EMBERS=false его нет в DOM
    const emberCtx = emberCv?.getContext('2d') ?? null
    const dragonCtx = dragonCv.getContext('2d')
    const beholdCtx = beholdCv.getContext('2d')
    const floatCtx = floatCv.getContext('2d')
    const skullCtx = skullCv.getContext('2d')
    if (!dieCtx || !dragonCtx || !beholdCtx || !floatCtx || !skullCtx) return

    const env: FxEnv = {
      palette: buildPalette(LANDING_ACCENT),
      reduced: reducedRef.current,
    }
    const d20 = createD20(env, {
      onStatus: (text, color) => cbRef.current.onStatus(text, color),
      onHistory: (h) => cbRef.current.onHistory(h),
      onBurst: () => cbRef.current.onBurst(),
    })
    const detachDie = d20.attach(dieCv)
    const embers = emberCv && emberCtx ? createEmbers(env) : null
    const dragon = createDragon(env)
    const beholder = createBeholder(env)
    const floatDice = createFloatDice(env)
    const skull = createSkull(env)
    const tips = createTipRotator(env, TIPS)
    const tipTargets = { text: tText, label: tLabel, fx: tFx, host: tHost }

    // дракон и поле костей скрыты на узких экранах и CSS'ом, и здесь — чтобы не жечь CPU
    const dragonMq = window.matchMedia('(min-width: 880px)')
    const diceMq = window.matchMedia('(min-width: 720px)')

    const ro = new ResizeObserver(() => {
      if (embers && emberCv) embers.resize(hero.clientWidth, hero.clientHeight, emberCv)
      floatDice.resize(wrap.clientWidth, wrap.clientHeight, floatCv)
    })
    ro.observe(hero)
    ro.observe(wrap)
    if (embers && emberCv) embers.resize(hero.clientWidth, hero.clientHeight, emberCv)
    floatDice.resize(wrap.clientWidth, wrap.clientHeight, floatCv)

    let raf = 0
    let last = performance.now()
    const loop = (tMs: number) => {
      raf = requestAnimationFrame(loop)
      env.reduced = reducedRef.current
      const dt = Math.min(0.05, Math.max(0.001, (tMs - last) / 1000))
      last = tMs
      const tSec = tMs / 1000
      const v = visRef.current
      if (v.hero) {
        d20.tick(dieCtx, tMs, dt)
        if (embers && emberCtx) embers.render(emberCtx, tMs, dt)
        if (dragonMq.matches) dragon.render(dragonCtx, tSec, dt)
      }
      if (v.tip) tips.tick(tipTargets, tSec, dt)
      if (v.feat) beholder.render(beholdCtx, tSec, dt)
      if (v.art) {
        if (diceMq.matches) floatDice.render(floatCtx, tSec, dt)
        skull.render(skullCtx, tSec, dt)
      }
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      detachDie()
    }
  }, [
    heroSection, tipSection, featuresSection, artifactSection,
    dieCanvas, emberCanvas, dragonCanvas, beholdCanvas, floatWrap, floatDiceCanvas, skullCanvas,
    tipText, tipLabel, tipFx, tipHost,
    reducedRef, visRef,
  ])
}
