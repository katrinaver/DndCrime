import type { AccentPalette, RGB } from './fx/types'

/**
 * Единственный источник акцентного цвета лендинга.
 * Меняется здесь — перекрашивается и CSS-палитра (через --lp-accent + color-mix
 * в landing.css), и все canvas-анимации (через buildPalette → FxEnv).
 */
export const LANDING_ACCENT = '#d8b268'

/** Вариант фоновой текстуры — ветки applyTweaks прототипа (Гексы/Сетка/Точки/Чисто) */
export type LandingTexture = 'hex' | 'grid' | 'dots' | 'none'
export const LANDING_TEXTURE: LandingTexture = 'hex'

/** Угли в hero: false убирает канвас из DOM и всю работу частиц */
export const LANDING_EMBERS: boolean = true

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

export interface TextureStyle {
  backgroundImage?: string
  backgroundSize?: string
}

/** Инлайн-стиль слоя .lp-texture для выбранного варианта текстуры */
export function buildTextureStyle(texture: LandingTexture, [r, g, b]: RGB): TextureStyle {
  const col = `rgba(${r},${g},${b},`
  switch (texture) {
    case 'grid':
      return {
        backgroundImage: `linear-gradient(${col}0.05) 1px, transparent 1px), linear-gradient(90deg, ${col}0.05) 1px, transparent 1px)`,
        backgroundSize: '34px 34px',
      }
    case 'dots':
      return {
        backgroundImage: `radial-gradient(${col}0.11) 1px, transparent 1.6px)`,
        backgroundSize: '22px 22px',
      }
    case 'none':
      return {}
    case 'hex':
      return { backgroundImage: buildHexTextureDataUri([r, g, b]), backgroundSize: '29.44px 51px' }
  }
}
