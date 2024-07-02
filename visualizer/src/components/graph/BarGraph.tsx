import {JSX} from 'preact'
import {MutableRef, useCallback, useLayoutEffect, useRef, useState} from 'preact/hooks'
import {Signal, ReadonlySignal} from '@preact/signals'

import classes from './BarGraph.module.css'
import {Overwrite, cx} from '../utils'

export type BoxedValues = {
  values: ArrayLike<number>
}

export type BarGraph = {
  props: Overwrite<
    JSX.HTMLAttributes<HTMLDivElement>, //
    {
      label?: string
      values: ArrayLike<number> | ReadonlySignal<BoxedValues>
      className?: string
    }
  >
}

export const BarGraph = ({label, values, className, ...rest}: BarGraph['props']) => {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  const valuesRef = useLayoutValueRef(values)

  const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    setContext(canvas ? canvas.getContext('2d') : null)
  }, [])

  useLayoutEffect(() => {
    if (!context) {
      return
    }

    const canvas = context.canvas

    const handleResize = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight

      const values = valuesRef.current

      if (values instanceof Signal) {
        drawBars(context, values.peek().values)
      } else {
        drawBars(context, values)
      }
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(canvas)

    handleResize()

    return () => {
      resizeObserver.disconnect()
    }
  }, [context])

  useLayoutEffect(() => {
    if (!context) {
      return
    }

    if (values instanceof Signal) {
      return values.subscribe(({values}) => drawBars(context, values))
    } else {
      drawBars(context, values)
    }
  }, [context, values])

  return (
    <div className={cx(classes.container, className)} {...rest}>
      <canvas ref={canvasRef} />
      <span className={classes.label}>{label}</span>
    </div>
  )
}

const UNSET_VALUE: unique symbol = Symbol()

const useLayoutValueRef = <T,>(value: T) => {
  const ref = useRef<T | typeof UNSET_VALUE>(UNSET_VALUE)

  if (ref.current === UNSET_VALUE) {
    ref.current = value
  }

  useLayoutEffect(() => {
    ref.current = value
  }, [value])

  return ref as MutableRef<T>
}

const drawBars = (context: CanvasRenderingContext2D, values: ArrayLike<number>) => {
  const {width, height} = context.canvas

  context.clearRect(0, 0, width, height)

  if (!values.length) {
    return
  }

  const gapCount = values.length - 1
  const gap = Math.min(1, (width * 0.1) / gapCount)
  const barWidth = (width - gapCount * gap) / values.length

  context.fillStyle = getComputedStyle(context.canvas).color

  context.globalAlpha = 0.2

  for (let i = 0; i < values.length; i++) {
    const barHeight = 2
    const x = i * (barWidth + gap)
    const y = height - barHeight
    context.fillRect(x, y, barWidth, barHeight)
  }

  context.globalAlpha = 1

  for (let i = 0; i < values.length; i++) {
    const barHeight = values[i] * height
    const x = i * (barWidth + gap)
    const y = height - barHeight
    context.fillRect(x, y, barWidth, barHeight)
  }
}
