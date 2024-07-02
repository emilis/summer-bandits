export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

export const cx = (...classNames: (string | undefined | false)[]) => classNames.filter(Boolean).join(' ')
