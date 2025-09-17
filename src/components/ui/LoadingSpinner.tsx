import { theme } from '../../styles/theme'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  color = theme.colors.primary[600],
  className = '',
}: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: '16px',
    md: '24px',
    lg: '32px',
  }

  const spinnerStyles = {
    width: sizeStyles[size],
    height: sizeStyles[size],
    border: `2px solid transparent`,
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }

  return (
    <div
      style={spinnerStyles}
      className={`loading-spinner loading-spinner-${size} ${className}`}
    />
  )
}
