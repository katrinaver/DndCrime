import { cross, dot, norm, sub, type Vec3 } from './math3d'

export interface Face {
  a: number
  b: number
  c: number
  /** Внешняя нормаль грани */
  n: Vec3
  /** Центр грани */
  cm: Vec3
  /** Базис u/w в плоскости грани — ориентация цифры */
  u: Vec3
  w: Vec3
  /** Номер на грани (раскладка стандартного d20) */
  num: number
}

export interface IcosahedronGeometry {
  vertices: Vec3[]
  faces: Face[]
}

/**
 * Икосаэдр: 12 вершин по золотому сечению, 20 граней.
 * NUMS — раскладка номеров по граням из прототипа (противоположные грани дают 21).
 */
export function buildGeometry(): IcosahedronGeometry {
  const P = (1 + Math.sqrt(5)) / 2
  const raw: Vec3[] = [
    [-1, P, 0], [1, P, 0], [-1, -P, 0], [1, -P, 0],
    [0, -1, P], [0, 1, P], [0, -1, -P], [0, 1, -P],
    [P, 0, -1], [P, 0, 1], [-P, 0, -1], [-P, 0, 1],
  ]
  const vertices = raw.map(norm)
  const FI: [number, number, number][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ]
  const NUMS = [20, 8, 14, 2, 12, 4, 16, 6, 10, 18, 1, 13, 7, 19, 9, 5, 17, 11, 3, 15]
  const faces = FI.map((fi, i) => {
    const a = fi[0]
    let b = fi[1]
    let c = fi[2]
    const V = vertices
    const cm: Vec3 = [
      (V[a][0] + V[b][0] + V[c][0]) / 3,
      (V[a][1] + V[b][1] + V[c][1]) / 3,
      (V[a][2] + V[b][2] + V[c][2]) / 3,
    ]
    let n = norm(cross(sub(V[b], V[a]), sub(V[c], V[a])))
    if (dot(n, cm) < 0) {
      const t = b
      b = c
      c = t
      n = [-n[0], -n[1], -n[2]]
    }
    const u = norm(sub(V[a], cm))
    const w = cross(n, u)
    return { a, b, c, n, cm, u, w, num: NUMS[i] }
  })
  return { vertices, faces }
}
