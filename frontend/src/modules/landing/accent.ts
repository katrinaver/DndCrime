import type { AccentPalette, RGB } from './fx/types'

/**
 * Единственный источник акцентного цвета лендинга.
 * Меняется здесь — перекрашивается и CSS-палитра (через --lp-accent + color-mix
 * в landing.css), и все canvas-анимации (через buildPalette → FxEnv).
 */
export const LANDING_ACCENT = '#d8b268'

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

/** Формула applyTweaks прототипа: acL — линейный sRGB-микс 45% к белому */
export function buildPalette(hex: string): AccentPalette {
  const ac = hexToRgb(hex)
  const acL: RGB = [
    Math.round(ac[0] + (255 - ac[0]) * 0.45),
    Math.round(ac[1] + (255 - ac[1]) * 0.45),
    Math.round(ac[2] + (255 - ac[2]) * 0.45),
  ]
  return { ac, acL }
}

/** Гекс-текстура фона, окрашенная акцентом (ветка «Гексы» из applyTweaks) */
export function buildHexTextureDataUri([r, g, b]: RGB): string {
  const col = `rgba(${r},${g},${b},`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="29.44" height="51"><path d="M14.72 0L29.44 8.5V25.5L14.72 34L0 25.5V8.5ZM14.72 34V51" fill="none" stroke="${col}0.09)"/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}
