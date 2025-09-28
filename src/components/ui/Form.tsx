import { type ReactNode, type FormHTMLAttributes } from 'react'
import { theme } from '../../styles/theme'

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode
  onSubmit: (e: React.FormEvent) => void
}

export const Form = ({ children, onSubmit, ...props }: FormProps) => {
  const formStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing[4],
  }

  return (
    <form style={formStyles} onSubmit={onSubmit} {...props}>
      {children}
    </form>
  )
}

interface FormGroupProps {
  children: ReactNode
  columns?: 1 | 2
}

export const FormGroup = ({ children, columns = 1 }: FormGroupProps) => {
  const groupStyles = {
    display: 'grid',
    gridTemplateColumns: columns === 2 ? '1fr 1fr' : '1fr',
    gap: theme.spacing[4],
  }

  return <div style={groupStyles}>{children}</div>
}

interface FormActionsProps {
  children: ReactNode
  align?: 'left' | 'center' | 'right'
}

export const FormActions = ({ children, align = 'right' }: FormActionsProps) => {
  const actionsStyles = {
    display: 'flex',
    gap: theme.spacing[3],
    justifyContent: align === 'left' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end',
    paddingTop: theme.spacing[4],
    borderTop: `1px solid ${theme.colors.border.light}`,
    marginTop: theme.spacing[4],
  }

  return <div style={actionsStyles}>{children}</div>
}

Form.displayName = 'Form'
FormGroup.displayName = 'FormGroup'
FormActions.displayName = 'FormActions'