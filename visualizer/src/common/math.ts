export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export const clampT = (v: number) => clamp(v, 0, 1)

export const lerp = (t: number, a: number, b: number) => t * (b - a) + a

export const unlerp = (v: number, a: number, b: number) => (v - a) / (b - a)

export const remap = (v: number, a0: number, b0: number, a1: number, b1: number) => lerp(unlerp(v, a0, b0), a1, b1)
