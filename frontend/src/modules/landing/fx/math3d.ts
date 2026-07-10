export type Vec3 = [number, number, number]
/** Матрица 3×3 в row-major порядке (9 элементов) */
export type Mat3 = number[]

export function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

export function norm(a: Vec3): Vec3 {
  const l = Math.hypot(a[0], a[1], a[2]) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}

export function matMul(A: Mat3, B: Mat3): Mat3 {
  const r = new Array<number>(9)
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      r[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]
  return r
}

/** Матрица поворота вокруг единичной оси ax на угол ang (формула Родрига) */
export function matAxis(ax: Vec3, ang: number): Mat3 {
  const x = ax[0], y = ax[1], z = ax[2], c = Math.cos(ang), s = Math.sin(ang), t = 1 - c
  return [
    t * x * x + c, t * x * y - s * z, t * x * z + s * y,
    t * x * y + s * z, t * y * y + c, t * y * z - s * x,
    t * x * z - s * y, t * y * z + s * x, t * z * z + c,
  ]
}

export function matApply(M: Mat3, v: Vec3): Vec3 {
  return [
    M[0] * v[0] + M[1] * v[1] + M[2] * v[2],
    M[3] * v[0] + M[4] * v[1] + M[5] * v[2],
    M[6] * v[0] + M[7] * v[1] + M[8] * v[2],
  ]
}

export const IDENTITY: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1]
