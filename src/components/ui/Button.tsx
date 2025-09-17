import type { ReactNode } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { theme } from '../../styles/theme'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: theme.typography.lineHeight.tight,
    borderRadius: theme.borderRadius.md,
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled || loading ? 0.6 : 1,
  }

  const sizeStyles = {
    sm: {
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.sm,
    },
    md: {
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      fontSize: theme.typography.fontSize.base,
    },
    lg: {
      padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
      fontSize: theme.typography.fontSize.lg,
    },
  }

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary[600],
      color: theme.colors.text.inverse,
      boxShadow: theme.shadows.sm,
    },
    secondary: {
      backgroundColor: theme.colors.secondary[600],
      color: theme.colors.text.inverse,
      boxShadow: theme.shadows.sm,
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.primary[600],
      border: `1px solid ${theme.colors.primary[300]}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.primary[600],
    },
    danger: {
      backgroundColor: theme.colors.error[600],
      color: theme.colors.text.inverse,
      boxShadow: theme.shadows.sm,
    },
  }

  const hoverStyles = {
    primary: {
      backgroundColor: theme.colors.primary[700],
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows.md,
    },
    secondary: {
      backgroundColor: theme.colors.secondary[700],
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows.md,
    },
    outline: {
      backgroundColor: theme.colors.primary[50],
      borderColor: theme.colors.primary[400],
    },
    ghost: {
      backgroundColor: theme.colors.primary[50],
    },
    danger: {
      backgroundColor: theme.colors.error[700],
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows.md,
    },
  }

  const styles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(disabled || loading ? {} : {
      '&:hover': hoverStyles[variant],
    }),
  }

  return (
    <button
      style={styles}
      disabled={disabled || loading}
      className={`button button-${variant} button-${size} ${className}`}
      {...props}
    >
      {loading && (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  )
}
