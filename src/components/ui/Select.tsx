import { forwardRef, type SelectHTMLAttributes } from 'react'
import { theme } from '../../styles/theme'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  variant?: 'default' | 'filled'
  options: Array<{ value: string; label: string; disabled?: boolean }>
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  variant = 'default',
  options,
  placeholder,
  className = '',
  ...props
}, ref) => {
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing[1],
    width: fullWidth ? '100%' : 'auto',
  }

  const labelStyles = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: error ? theme.colors.error[600] : theme.colors.text.primary,
  }

  const selectStyles = {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    lineHeight: theme.typography.lineHeight.normal,
    color: theme.colors.text.primary,
    backgroundColor: variant === 'filled' ? theme.colors.gray[50] : theme.colors.background.primary,
    border: `1px solid ${error ? theme.colors.error[300] : theme.colors.border.medium}`,
    borderRadius: theme.borderRadius.md,
    transition: 'all 0.2s ease',
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
    appearance: 'none' as any,
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    paddingRight: '40px',
  }

  const helperTextStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: error ? theme.colors.error[600] : theme.colors.text.secondary,
  }

  return (
    <div style={containerStyles} className={`select-container ${className}`}>
      {label && (
        <label style={labelStyles} className="select-label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        style={selectStyles}
        className={`select select-${variant} ${error ? 'select-error' : ''}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {(error || helperText) && (
        <div style={helperTextStyles} className="select-helper">
          {error || helperText}
        </div>
      )}
    </div>
  )
})

Select.displayName = 'Select'
