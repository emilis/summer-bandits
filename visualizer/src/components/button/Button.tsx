import {JSX} from 'preact'

import {Overwrite, cx} from '../utils'
import classes from './Button.module.css'

export type Button = {
  props: Overwrite<
    JSX.HTMLAttributes<HTMLButtonElement>, //
    {className?: string}
  >
}

export const Button = (props: Button['props']) => (
  <button
    {...props} //
    type={props.type ?? 'button'}
    className={cx(classes.button, props.className)}
  />
)

export type ToggleButton = {
  props: Overwrite<
    JSX.HTMLAttributes<HTMLButtonElement>, //
    {value: boolean; className?: string}
  >
}

/**
 * A button that can be toggled on and off.
 *
 * Label or text content **must** remain the same regardless of toggle state.
 * If different label or text content is required based on toggle state, use a
 * `<Button>` instead.
 */
export const ToggleButton = ({value, ...props}: ToggleButton['props']) => (
  <button
    {...props}
    type={props.type ?? 'button'}
    aria-pressed={value}
    className={cx(classes.button, props.className)}
  />
)
