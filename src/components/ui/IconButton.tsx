import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { theme } from '../../styles/theme'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  tooltip?: string
}

export const IconButton = ({ 
  children, 
  variant = 'ghost', 
  size = 'md', 
  tooltip,
  className = '',
  disabled = false,
  ...props 
}: IconButtonProps) => {
  const sizeStyles = {
    sm: {
      width: '32px',
      height: '32px',
      fontSize: theme.typography.fontSize.sm,
    },
    md: {
      width: '40px',
      height: '40px',
      fontSize: theme.typography.fontSize.base,
    },
    lg: {
      width: '48px',
      height: '48px',
      fontSize: theme.typography.fontSize.lg,
    },
  }

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary[600],
      color: theme.colors.text.inverse,
      border: 'none',
      hover: {
        backgroundColor: theme.colors.primary[700],
      },
    },
    secondary: {
      backgroundColor: theme.colors.gray[100],
      color: theme.colors.text.primary,
      border: 'none',
      hover: {
        backgroundColor: theme.colors.gray[200],
      },
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.border.medium}`,
      hover: {
        backgroundColor: theme.colors.gray[50],
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.text.secondary,
      border: 'none',
      hover: {
        backgroundColor: theme.colors.gray[100],
        color: theme.colors.text.primary,
      },
    },
  }

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    position: 'relative' as const,
    opacity: disabled ? 0.6 : 1,
    ...sizeStyles[size],
    ...variantStyles[variant],
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      Object.assign(e.currentTarget.style, variantStyles[variant].hover)
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      Object.assign(e.currentTarget.style, {
        backgroundColor: variantStyles[variant].backgroundColor,
        color: variantStyles[variant].color,
      })
    }
  }

  return (
    <button
      style={baseStyles}
      className={`icon-button icon-button-${variant} icon-button-${size} ${className}`}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={tooltip}
      {...props}
    >
      {children}
    </button>
  )
}

IconButton.displayName = 'IconButton'