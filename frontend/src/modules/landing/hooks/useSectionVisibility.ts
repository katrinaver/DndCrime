import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react'

export interface SectionVisibility {
  hero: boolean
  tip: boolean
  feat: boolean
  art: boolean
}

/**
 * Один IntersectionObserver на четыре секции лендинга.
 * Результат — мутабельный ref (без setState): RAF-цикл читает флаги каждый
 * кадр и пропускает рендер невидимых секций.
 */
export function useSectionVisibility(
  hero: RefObject<HTMLElement>,
  tip: RefObject<HTMLElement>,
  feat: RefObject<HTMLElement>,
  art: RefObject<HTMLElement>,
): MutableRefObject<SectionVisibility> {
  const visRef = useRef<SectionVisibility>({ hero: true, tip: true, feat: true, art: true })

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target === hero.current) visRef.current.hero = e.isIntersecting
          else if (e.target === tip.current) visRef.current.tip = e.isIntersecting
          else if (e.target === feat.current) visRef.current.feat = e.isIntersecting
          else if (e.target === art.current) visRef.current.art = e.isIntersecting
        }
      },
      { rootMargin: '100px' },
    )
    for (const r of [hero, tip, feat, art]) {
      if (r.current) io.observe(r.current)
    }
    return () => io.disconnect()
  }, [hero, tip, feat, art])

  return visRef
}
