import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { theme } from '../../styles/theme'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  variant?: 'default' | 'filled'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  variant = 'default',
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

  const inputStyles = {
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
  }

  const helperTextStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: error ? theme.colors.error[600] : theme.colors.text.secondary,
  }

  return (
    <div style={containerStyles} className={`input-container ${className}`}>
      {label && (
        <label style={labelStyles} className="input-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        style={inputStyles}
        className={`input input-${variant} ${error ? 'input-error' : ''}`}
        {...props}
      />
      {(error || helperText) && (
        <div style={helperTextStyles} className="input-helper">
          {error || helperText}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'
