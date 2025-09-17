import type { TextareaHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { theme } from '../../styles/theme'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  variant?: 'default' | 'filled'
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  variant = 'default',
  resize = 'vertical',
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

  const textareaStyles = {
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
    resize,
    minHeight: '100px',
  }

  const helperTextStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: error ? theme.colors.error[600] : theme.colors.text.secondary,
  }

  return (
    <div style={containerStyles} className={`textarea-container ${className}`}>
      {label && (
        <label style={labelStyles} className="textarea-label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        style={textareaStyles}
        className={`textarea textarea-${variant} ${error ? 'textarea-error' : ''}`}
        {...props}
      />
      {(error || helperText) && (
        <div style={helperTextStyles} className="textarea-helper">
          {error || helperText}
        </div>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'
