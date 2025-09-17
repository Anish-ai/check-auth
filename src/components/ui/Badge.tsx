import type { ReactNode } from 'react'
import { theme } from '../../styles/theme'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: theme.typography.fontWeight.medium,
    borderRadius: theme.borderRadius.full,
    border: 'none',
    whiteSpace: 'nowrap' as const,
  }

  const sizeStyles = {
    sm: {
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
      fontSize: theme.typography.fontSize.xs,
    },
    md: {
      padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.sm,
    },
    lg: {
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      fontSize: theme.typography.fontSize.base,
    },
  }

  const variantStyles = {
    default: {
      backgroundColor: theme.colors.gray[100],
      color: theme.colors.gray[800],
    },
    success: {
      backgroundColor: theme.colors.success[100],
      color: theme.colors.success[800],
    },
    warning: {
      backgroundColor: theme.colors.warning[100],
      color: theme.colors.warning[800],
    },
    error: {
      backgroundColor: theme.colors.error[100],
      color: theme.colors.error[800],
    },
    info: {
      backgroundColor: theme.colors.primary[100],
      color: theme.colors.primary[800],
    },
  }

  const styles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
  }

  return (
    <span
      style={styles}
      className={`badge badge-${variant} badge-${size} ${className}`}
    >
      {children}
    </span>
  )
}
