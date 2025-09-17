import React from 'react'
import { theme } from '../../styles/theme'

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  isLoading?: boolean
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  isLoading = false, 
  disabled,
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    fontWeight: theme.typography.fontWeight.medium,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    outline: 'none',
    opacity: disabled || isLoading ? 0.6 : 1
  }

  const sizeStyles = {
    sm: {
      fontSize: theme.typography.fontSize.sm,
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      minHeight: '2rem'
    },
    md: {
      fontSize: theme.typography.fontSize.base,
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      minHeight: '2.5rem'
    },
    lg: {
      fontSize: theme.typography.fontSize.lg,
      padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
      minHeight: '3rem'
    }
  }

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary[500],
      color: theme.colors.background.primary,
      boxShadow: theme.shadows.sm,
      border: `1px solid ${theme.colors.primary[500]}`,
      ':hover': !disabled && !isLoading ? {
        backgroundColor: theme.colors.primary[600],
        boxShadow: theme.shadows.md
      } : {}
    },
    secondary: {
      backgroundColor: theme.colors.secondary[500],
      color: theme.colors.background.primary,
      boxShadow: theme.shadows.sm,
      border: `1px solid ${theme.colors.secondary[500]}`,
      ':hover': !disabled && !isLoading ? {
        backgroundColor: theme.colors.secondary[600],
        boxShadow: theme.shadows.md
      } : {}
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.primary[600],
      border: `1px solid ${theme.colors.primary[300]}`,
      ':hover': !disabled && !isLoading ? {
        backgroundColor: theme.colors.primary[50],
        borderColor: theme.colors.primary[400]
      } : {}
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.gray[700],
      border: '1px solid transparent',
      ':hover': !disabled && !isLoading ? {
        backgroundColor: theme.colors.gray[100]
      } : {}
    }
  }

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant]
  }

  return (
    <button
      style={combinedStyles}
      disabled={disabled || isLoading}
      className={className}
      {...props}
    >
      {isLoading && (
        <div style={{
          width: '1rem',
          height: '1rem',
          border: '2px solid currentColor',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )}
      {children}
    </button>
  )
}

// Card Component
interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  shadow?: 'sm' | 'base' | 'md' | 'lg'
}

export function Card({ children, className = '', padding = 'md', shadow = 'base' }: CardProps) {
  const paddingMap = {
    sm: theme.spacing[4],
    md: theme.spacing[6],
    lg: theme.spacing[8]
  }

  const shadowMap = {
    sm: theme.shadows.sm,
    base: theme.shadows.base,
    md: theme.shadows.md,
    lg: theme.shadows.lg
  }

  const styles = {
    backgroundColor: theme.colors.background.primary,
    border: `1px solid ${theme.colors.gray[200]}`,
    borderRadius: theme.borderRadius.lg,
    padding: paddingMap[padding],
    boxShadow: shadowMap[shadow]
  }

  return (
    <div style={styles} className={className}>
      {children}
    </div>
  )
}

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
  const inputStyles = {
    width: '100%',
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    border: `1px solid ${error ? theme.colors.error[500] : theme.colors.gray[300]}`,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.primary,
    color: theme.colors.gray[900],
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    ':focus': {
      borderColor: error ? theme.colors.error[500] : theme.colors.primary[500],
      boxShadow: `0 0 0 3px ${error ? theme.colors.error[100] : theme.colors.primary[100]}`
    }
  }

  const labelStyles = {
    display: 'block',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing[1]
  }

  const errorStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error[500],
    marginTop: theme.spacing[1]
  }

  const helperStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[500],
    marginTop: theme.spacing[1]
  }

  return (
    <div className={className}>
      {label && <label style={labelStyles}>{label}</label>}
      <input style={inputStyles} {...props} />
      {error && <div style={errorStyles}>{error}</div>}
      {helperText && !error && <div style={helperStyles}>{helperText}</div>}
    </div>
  )
}

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  const selectStyles = {
    width: '100%',
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    border: `1px solid ${error ? theme.colors.error[500] : theme.colors.gray[300]}`,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.primary,
    color: theme.colors.gray[900],
    outline: 'none',
    cursor: 'pointer'
  }

  const labelStyles = {
    display: 'block',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing[1]
  }

  const errorStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error[500],
    marginTop: theme.spacing[1]
  }

  return (
    <div className={className}>
      {label && <label style={labelStyles}>{label}</label>}
      <select style={selectStyles} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div style={errorStyles}>{error}</div>}
    </div>
  )
}

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Textarea({ label, error, helperText, className = '', ...props }: TextareaProps) {
  const textareaStyles = {
    width: '100%',
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    border: `1px solid ${error ? theme.colors.error[500] : theme.colors.gray[300]}`,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.primary,
    color: theme.colors.gray[900],
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '100px'
  }

  const labelStyles = {
    display: 'block',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing[1]
  }

  const errorStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error[500],
    marginTop: theme.spacing[1]
  }

  const helperStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[500],
    marginTop: theme.spacing[1]
  }

  return (
    <div className={className}>
      {label && <label style={labelStyles}>{label}</label>}
      <textarea style={textareaStyles} {...props} />
      {error && <div style={errorStyles}>{error}</div>}
      {helperText && !error && <div style={helperStyles}>{helperText}</div>}
    </div>
  )
}

// Badge Component
interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'gray'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'gray', size = 'sm' }: BadgeProps) {
  const sizeStyles = {
    sm: {
      fontSize: theme.typography.fontSize.xs,
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`
    },
    md: {
      fontSize: theme.typography.fontSize.sm,
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`
    }
  }

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary[100],
      color: theme.colors.primary[800]
    },
    success: {
      backgroundColor: theme.colors.success[100],
      color: theme.colors.success[800]
    },
    warning: {
      backgroundColor: theme.colors.warning[100],
      color: theme.colors.warning[800]
    },
    error: {
      backgroundColor: theme.colors.error[100],
      color: theme.colors.error[800]
    },
    gray: {
      backgroundColor: theme.colors.gray[100],
      color: theme.colors.gray[800]
    }
  }

  const styles = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    fontWeight: theme.typography.fontWeight.medium,
    ...sizeStyles[size],
    ...variantStyles[variant]
  }

  return <span style={styles}>{children}</span>
}

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export function LoadingSpinner({ size = 'md', color = theme.colors.primary[500] }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: '1rem',
    md: '2rem',
    lg: '3rem'
  }

  const styles = {
    width: sizeMap[size],
    height: sizeMap[size],
    border: '2px solid transparent',
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }

  return <div style={styles} />
}