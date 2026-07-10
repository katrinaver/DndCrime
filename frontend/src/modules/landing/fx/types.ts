export type RGB = [number, number, number]

export interface AccentPalette {
  /** Акцент как [r,g,b] — базовое золото canvas-анимаций */
  ac: RGB
  /** Светлый вариант: смесь 45% к белому (формула applyTweaks прототипа) */
  acL: RGB
}

/**
 * Мутабельное окружение fx-модулей: координатор обновляет поля на лету
 * (смена prefers-reduced-motion), модули читают их каждый кадр.
 */
export interface FxEnv {
  palette: AccentPalette
  reduced: boolean
}

/** Общий контракт фоновых созвездий (дракон/бехолдер/череп) */
export interface Constellation {
  render(ctx: CanvasRenderingContext2D, tSec: number, dt: number): void
}
