import { useEffect, useRef, type MutableRefObject } from 'react'

/**
 * Текущее значение prefers-reduced-motion в ref (без ре-рендеров):
 * RAF-цикл читает его каждый кадр, переключение на лету подхватывается.
 */
export function usePrefersReducedMotion(): MutableRefObject<boolean> {
  const reducedRef = useRef(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedRef.current = mq.matches
    const onChange = () => {
      reducedRef.current = mq.matches
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reducedRef
}
