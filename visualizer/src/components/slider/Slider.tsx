// import {JSX, RefObject} from 'preact'
// import {useState} from 'preact/hooks'
// import {clamp, lerp, remap} from '../../common/math'

// const KEY_ARROW_LEFT = 1
// const KEY_ARROW_RIGHT = 1 << 1
// const KEY_ARROW_UP = 1 << 2
// const KEY_ARROW_DOWN = 1 << 3
// const KEY_PAGE_UP = 1 << 4
// const KEY_PAGE_DOWN = 1 << 5

// const keyToFlag: Record<string, number | undefined> = {
//   ArrowLeft: KEY_ARROW_LEFT,
//   ArrowRight: KEY_ARROW_RIGHT,
//   ArrowUp: KEY_ARROW_UP,
//   ArrowDown: KEY_ARROW_DOWN,
//   PageUp: KEY_PAGE_UP,
//   PageDown: KEY_PAGE_DOWN,
// }

// // -----------------------------------------------------------------------------

// const MASK_ARROW_X = KEY_ARROW_LEFT | KEY_ARROW_RIGHT
// const MASK_ARROW_Y = KEY_ARROW_UP | KEY_ARROW_DOWN
// const MASK_ARROW_XY = MASK_ARROW_X | MASK_ARROW_Y

// type ClampValue = (value: number, options: ConstraintOptions) => number

// type GetPointerValue = (
//   event: JSX.TargetedPointerEvent<HTMLElement>,
//   trackElement: HTMLElement | null,
//   options: ConstraintOptions,
// ) => number

// type GetThumbPosition<T> = (value: number, options: ConstraintOptions) => T

// type ConstraintOptions = {
//   min?: number
//   max?: number
//   step?: number
// }

// type AdapterOptions<T> = {
//   clampValue?: ClampValue
//   getPointerValue?: GetPointerValue
//   getThumbPosition?: GetThumbPosition<T>
// }

// type StateOptions = {
//   value: number
//   disabled?: boolean
//   onChange?: (value: number) => void
// }

// type SliderOptions<T> = ConstraintOptions & AdapterOptions<T> & StateOptions

// const defaultClampValue: ClampValue = (value, {min = 0, max = 100, step = 1}) => {
//   const rangeInSteps = Math.floor((max - min) / step)
//   let valueInSteps = Math.round((value - min) / step)
//   valueInSteps = clamp(valueInSteps, 0, rangeInSteps)
//   return min + valueInSteps * step
// }

// const defaultGetPointerValue: GetPointerValue = (event, trackElement, {min = 0, max = 100}) => {
//   const {left, width} = (trackElement ?? event.currentTarget).getBoundingClientRect()
//   const t = (event.clientX - left) / width
//   return lerp(t, min, max)
// }

// const defaultGetThumbPosition: GetThumbPosition<number> = (value: number, {min = 0, max = 100}) =>
//   remap(value, min, max, 0, 1)

// export const useSlider2 = <T,>(
//   options: SliderOptions<T>,
//   trackRef: RefObject<HTMLElement>,
//   thumbRef: RefObject<HTMLElement>,
// ) => {
//   const {
//     min = 0,
//     max = 100,
//     step = 1,
//     disabled,
//     onChange,
//     clampValue = defaultClampValue,
//     getPointerValue = defaultGetPointerValue,
//     getThumbPosition = defaultGetThumbPosition,
//   } = options
//   const value = clampValue(options.value, options)
//   const thumbPosition = getThumbPosition(value, options)
//   const [activePointerId, setActivePointerId] = useState<number | undefined>(undefined)

//   const handlePointerEvent = (event: JSX.TargetedPointerEvent<HTMLElement>) => {
//     const {type, pointerId, button, currentTarget} = event

//     if (activePointerId === undefined && type === 'pointerdown' && button === 0) {
//       setActivePointerId(pointerId)
//       currentTarget.setPointerCapture(pointerId)
//       event.preventDefault()
//       thumbRef.current?.focus?.()
//       onChange?.(clampValue(getPointerValue(event, trackRef.current, options), options))
//       return
//     }

//     if (activePointerId === pointerId) {
//       if (type === 'pointermove') {
//         onChange?.(clampValue(getPointerValue(event, trackRef.current, options), options))
//       } else if (type === 'pointerup' || type === 'pointercancel') {
//         setActivePointerId(undefined)
//       }
//     }
//   }

//   const handleKeyDown = (event: JSX.TargetedKeyboardEvent<HTMLElement>) => {
//     const flag = keyToFlag[event.key] ?? 0

//     if (!event.defaultPrevented && flag & MASK_ARROW_XY) {
//       event.preventDefault()
//       const delta = event.shiftKey ? step * 10 : step
//       const direction = flag & (KEY_ARROW_UP | KEY_ARROW_RIGHT) ? 1 : -1
//       onChange?.(clampValue(value + delta * direction, options))
//     }
//   }

//   const active = activePointerId !== undefined
//   const onIdlePointerEvent = !active && !disabled ? handlePointerEvent : undefined
//   const onActivePointerEvent = active && !disabled ? handlePointerEvent : undefined
//   const onKeyDown = !disabled ? handleKeyDown : undefined

//   return [
//     {
//       onPointerDown: onIdlePointerEvent,
//       onPointerMove: onActivePointerEvent,
//       onPointerUp: onActivePointerEvent,
//       onPointerCancel: onActivePointerEvent,
//     },
//     {
//       role: 'slider',
//       tabIndex: disabled ? -1 : 0,
//       'aria-disabled': disabled,
//       'aria-valuemin': min,
//       'aria-valuemax': max,
//       'aria-valuenow': value,
//       onKeyDown,
//     },
//     thumbPosition as T,
//     active,
//   ] as const
// }
