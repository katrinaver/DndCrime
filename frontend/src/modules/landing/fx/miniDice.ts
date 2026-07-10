/**
 * Бросок мини-кости из «Набора искателя»: WAAPI-вращение фигуры,
 * мелькание случайных значений каждые 55мс, фиксация результата через 640мс.
 * Максимум подсвечивается белым, единица — багрянцем.
 *
 * Возвращает cancel-функцию (обязательно вызвать при unmount);
 * вызывающий сам следит, чтобы кость не бросалась повторно во время анимации.
 */
export function rollMini(
  shape: HTMLElement | null,
  num: HTMLElement | SVGTextElement,
  max: number,
  onFinish: () => void,
): () => void {
  if (shape && typeof shape.animate === 'function') {
    shape.animate(
      [
        { transform: 'rotate(0deg) scale(1)' },
        { transform: 'rotate(300deg) scale(1.15)' },
        { transform: 'rotate(360deg) scale(1)' },
      ],
      { duration: 620, easing: 'cubic-bezier(.25,.6,.25,1)' },
    )
  }
  const iv = window.setInterval(() => {
    num.textContent = String(1 + Math.floor(Math.random() * max))
  }, 55)
  const to = window.setTimeout(() => {
    window.clearInterval(iv)
    const f = 1 + Math.floor(Math.random() * max)
    num.textContent = String(f)
    // svg-цифра красится через fill (инлайн перебивает fill="currentColor"),
    // '' возвращает наследование; color — на случай html-элемента
    num.style.fill = num.style.color = f === max ? '#fff' : f === 1 ? 'var(--lp-crimson-2)' : ''
    onFinish()
  }, 640)
  return () => {
    window.clearInterval(iv)
    window.clearTimeout(to)
  }
}
