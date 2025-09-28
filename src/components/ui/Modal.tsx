import { type ReactNode } from 'react'
import { theme } from '../../styles/theme'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  if (!isOpen) return null

  const overlayStyles = {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  }

  const modalSizes = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '500px' },
    lg: { maxWidth: '700px' },
    xl: { maxWidth: '900px' },
  }

  const modalStyles = {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    width: '100%',
    ...modalSizes[size],
    margin: theme.spacing[4],
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  }

  const headerStyles = {
    padding: `${theme.spacing[6]} ${theme.spacing[6]} ${theme.spacing[4]}`,
    borderBottom: `1px solid ${theme.colors.border.light}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }

  const titleStyles = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  }

  const closeButtonStyles = {
    background: 'none',
    border: 'none',
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.secondary,
    cursor: 'pointer',
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.md,
    transition: 'all 0.2s ease',
  }

  const contentStyles = {
    padding: theme.spacing[6],
    overflowY: 'auto' as const,
    flex: 1,
  }

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyles}>
          <h2 style={titleStyles}>{title}</h2>
          <button
            onClick={onClose}
            style={closeButtonStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.gray[100]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            ×
          </button>
        </div>
        <div style={contentStyles}>
          {children}
        </div>
      </div>
    </div>
  )
}

Modal.displayName = 'Modal'