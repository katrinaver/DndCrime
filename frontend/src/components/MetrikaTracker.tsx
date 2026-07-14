import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const METRIKA_ID = 110719407

declare global {
  interface Window {
    ym?: (id: number, action: string, ...params: unknown[]) => void
  }
}

/**
 * Досылает hit в Яндекс.Метрику при смене маршрута: счётчик из index.html
 * сам засчитывает только первую загрузку SPA.
 */
export function MetrikaTracker() {
  const location = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.ym?.(METRIKA_ID, 'hit', location.pathname + location.search)
  }, [location.pathname, location.search])

  return null
}
