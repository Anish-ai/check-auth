import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { theme } from '../styles/theme'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, userProfile, isStudent, isClubLead, isFaculty, isAdmin } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navItemStyles = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    textDecoration: 'none',
    color: isActive ? theme.colors.primary[600] : theme.colors.text.secondary,
    backgroundColor: isActive ? theme.colors.primary[50] : 'transparent',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[1],
    transition: 'all 0.2s ease',
    fontSize: theme.typography.fontSize.base,
    fontWeight: isActive ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal,
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ 
        background: `linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[800]} 100%)`,
        color: theme.colors.text.inverse,
        padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
        boxShadow: theme.shadows.lg,
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.sticky,
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          maxWidth: '1200px', 
          margin: '0 auto' 
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: theme.typography.fontSize['2xl'], 
              fontWeight: theme.typography.fontWeight.bold,
              background: `linear-gradient(45deg, ${theme.colors.text.inverse}, ${theme.colors.primary[100]})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Smart Student Hub
            </h1>
            <p style={{ 
              margin: `${theme.spacing[1]} 0 0 0`, 
              fontSize: theme.typography.fontSize.sm, 
              opacity: 0.9,
              fontWeight: theme.typography.fontWeight.medium,
            }}>
              IIT Patna • Verified Student Records
            </p>
          </div>
          {userProfile && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: theme.spacing[4],
              background: 'rgba(255, 255, 255, 0.1)',
              padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
              borderRadius: theme.borderRadius.lg,
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontWeight: theme.typography.fontWeight.semibold,
                  fontSize: theme.typography.fontSize.base,
                }}>
                  {userProfile.name}
                </div>
                <div style={{ 
                  fontSize: theme.typography.fontSize.sm, 
                  opacity: 0.8,
                  textTransform: 'capitalize',
                }}>
                  {userProfile.role || 'Student'} • {userProfile.email}
                </div>
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: `linear-gradient(45deg, ${theme.colors.primary[400]}, ${theme.colors.secondary[400]})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors.text.inverse,
                fontWeight: theme.typography.fontWeight.bold,
                fontSize: theme.typography.fontSize.lg,
              }}>
                {userProfile.name?.charAt(0) || 'U'}
              </div>
            </div>
          )}
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        {user && (
          <nav style={{ 
            width: '280px', 
            background: theme.colors.background.primary,
            borderRight: `1px solid ${theme.colors.border.light}`,
            padding: `${theme.spacing[6]} 0`,
            boxShadow: theme.shadows.sm,
          }}>
            <div style={{ padding: `0 ${theme.spacing[6]}` }}>
              <h3 style={{ 
                margin: `0 0 ${theme.spacing[6]} 0`, 
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Navigation
              </h3>
              
              {/* Student Navigation */}
              {isStudent && (
                <div style={{ marginBottom: theme.spacing[8] }}>
                  <h4 style={{ 
                    margin: `0 0 ${theme.spacing[3]} 0`, 
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.tertiary,
                    fontWeight: theme.typography.fontWeight.semibold,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>
                    Student
                  </h4>
                  <Link 
                    to="/dashboard" 
                    style={navItemStyles(isActive('/dashboard'))}
                  >
                    <span style={{ fontSize: '1.2em' }}>📊</span>
                    Dashboard
                  </Link>
                  <Link 
                    to="/activities" 
                    style={navItemStyles(isActive('/activities'))}
                  >
                    <span style={{ fontSize: '1.2em' }}>➕</span>
                    Submit Activity
                  </Link>
                  <Link 
                    to="/portfolio" 
                    style={navItemStyles(isActive('/portfolio'))}
                  >
                    <span style={{ fontSize: '1.2em' }}>📄</span>
                    My Portfolio
                  </Link>
                </div>
              )}

              {/* Club Lead Navigation */}
              {isClubLead && (
                <div style={{ marginBottom: theme.spacing[8] }}>
                  <h4 style={{ 
                    margin: `0 0 ${theme.spacing[3]} 0`, 
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.tertiary,
                    fontWeight: theme.typography.fontWeight.semibold,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>
                    Club Lead
                  </h4>
                  <Link 
                    to="/verification" 
                    style={navItemStyles(isActive('/verification'))}
                  >
                    <span style={{ fontSize: '1.2em' }}>✅</span>
                    Verify Activities
                  </Link>
                </div>
              )}

              {/* Faculty/Admin Navigation */}
              {(isFaculty || isAdmin) && (
                <div style={{ marginBottom: theme.spacing[8] }}>
                  <h4 style={{ 
                    margin: `0 0 ${theme.spacing[3]} 0`, 
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.tertiary,
                    fontWeight: theme.typography.fontWeight.semibold,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>
                    Faculty/Admin
                  </h4>
                  <Link 
                    to="/verification" 
                    style={navItemStyles(isActive('/verification'))}
                  >
                    <span style={{ fontSize: '1.2em' }}>✅</span>
                    Verify Activities
                  </Link>
                  <Link 
                    to="/admin" 
                    style={navItemStyles(isActive('/admin'))}
                  >
                    <span style={{ fontSize: '1.2em' }}>⚙️</span>
                    Admin Panel
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main style={{ 
          flex: 1, 
          padding: theme.spacing[8], 
          background: theme.colors.background.secondary,
          minHeight: 'calc(100vh - 80px)',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}