import type { ReactNode } from 'react'
import { theme } from '../../styles/theme'

interface CardProps {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
}: CardProps) {
  const baseStyles = {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    transition: 'all 0.2s ease',
  }

  const variantStyles = {
    default: {
      boxShadow: theme.shadows.sm,
      border: `1px solid ${theme.colors.border.light}`,
    },
    elevated: {
      boxShadow: theme.shadows.lg,
      border: 'none',
    },
    outlined: {
      boxShadow: 'none',
      border: `1px solid ${theme.colors.border.medium}`,
    },
  }

  const paddingStyles = {
    sm: { padding: theme.spacing[4] },
    md: { padding: theme.spacing[6] },
    lg: { padding: theme.spacing[8] },
  }

  const styles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...paddingStyles[padding],
  }

  return (
    <div
      style={styles}
      className={`card card-${variant} ${className}`}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div
      style={{
        paddingBottom: theme.spacing[4],
        borderBottom: `1px solid ${theme.colors.border.light}`,
        marginBottom: theme.spacing[4],
      }}
      className={`card-header ${className}`}
    >
      {children}
    </div>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div
      className={`card-content ${className}`}
    >
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div
      style={{
        paddingTop: theme.spacing[4],
        borderTop: `1px solid ${theme.colors.border.light}`,
        marginTop: theme.spacing[4],
      }}
      className={`card-footer ${className}`}
    >
      {children}
    </div>
  )
}
