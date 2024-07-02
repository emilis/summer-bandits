import {JSX} from 'preact'
import {ChangeEvent} from 'preact/compat'
import classes from './Select.module.css'
import {Overwrite, cx} from '../utils'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type Select = {
  props: Overwrite<
    JSX.HTMLAttributes<HTMLSelectElement>,
    {
      value?: string
      options: SelectOption[]
      className?: string
      onChange?: (event: ChangeEvent<HTMLSelectElement>, value?: string) => void
    }
  >
}

export const Select = ({value, options, onChange, className, ...rest}: Select['props']) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event, event.currentTarget.value)
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      data-placeholder={value === undefined}
      className={cx(classes.select, className)}
      {...rest}
    >
      <option selected={value === undefined} disabled style={{display: 'none'}}>
        {rest.placeholder}
      </option>
      {options.map(({value, label, disabled}) => (
        <option key={value} value={value} disabled={disabled}>
          {label}
        </option>
      ))}
    </select>
  )
}
