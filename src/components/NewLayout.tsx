import { type ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { theme } from '../styles/theme'
import { IconButton, Button } from './ui'

interface LayoutProps {
  children: ReactNode
}

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/profile', label: 'Profile', icon: '👤' },
  { path: '/projects', label: 'Projects', icon: '💼' },
  { path: '/education', label: 'Education', icon: '🎓' },
  { path: '/courses', label: 'Courses', icon: '📚' },
  { path: '/achievements', label: 'Achievements', icon: '🏆' },
  { path: '/skills', label: 'Skills', icon: '⚡' },
  { path: '/positions', label: 'Positions', icon: '👔' },
  { path: '/certifications', label: 'Certifications', icon: '📜' },
]

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  const sidebarStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    height: '100vh',
    width: sidebarCollapsed ? '70px' : '280px',
    backgroundColor: theme.colors.background.primary,
    borderRight: `1px solid ${theme.colors.border.light}`,
    transition: 'width 0.3s ease',
    zIndex: 40,
    display: 'flex',
    flexDirection: 'column' as const,
  }

  const headerStyles = {
    padding: theme.spacing[4],
    borderBottom: `1px solid ${theme.colors.border.light}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: sidebarCollapsed ? 'center' : 'space-between',
  }

  const logoStyles = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
    textDecoration: 'none',
  }

  const navStyles = {
    flex: 1,
    padding: `${theme.spacing[4]} 0`,
    overflowY: 'auto' as const,
  }

  const navItemStyles = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    color: isActive ? theme.colors.primary[600] : theme.colors.text.secondary,
    backgroundColor: isActive ? theme.colors.primary[50] : 'transparent',
    textDecoration: 'none',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: isActive ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal,
    borderRight: isActive ? `3px solid ${theme.colors.primary[600]}` : 'none',
    transition: 'all 0.2s ease',
  })

  const navItemHoverStyles = {
    backgroundColor: theme.colors.gray[50],
    color: theme.colors.text.primary,
  }

  const mainContentStyles = {
    marginLeft: sidebarCollapsed ? '70px' : '280px',
    minHeight: '100vh',
    backgroundColor: theme.colors.gray[50],
    transition: 'margin-left 0.3s ease',
  }

  const topBarStyles = {
    height: '64px',
    backgroundColor: theme.colors.background.primary,
    borderBottom: `1px solid ${theme.colors.border.light}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${theme.spacing[6]}`,
    position: 'sticky' as const,
    top: 0,
    zIndex: 30,
  }

  const contentStyles = {
    padding: theme.spacing[6],
  }

  const userInfoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
  }

  const avatarStyles = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: theme.colors.primary[100],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[600],
  }

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div style={sidebarStyles}>
        <div style={headerStyles}>
          <Link to="/dashboard" style={logoStyles}>
            {sidebarCollapsed ? 'SH' : 'StudHub'}
          </Link>
          {!sidebarCollapsed && (
            <IconButton
              onClick={() => setSidebarCollapsed(true)}
              variant="ghost"
              size="sm"
              tooltip="Collapse sidebar"
            >
              ←
            </IconButton>
          )}
        </div>

        {sidebarCollapsed && (
          <div style={{ padding: theme.spacing[2], textAlign: 'center' }}>
            <IconButton
              onClick={() => setSidebarCollapsed(false)}
              variant="ghost"
              size="sm"
              tooltip="Expand sidebar"
            >
              →
            </IconButton>
          </div>
        )}

        <nav style={navStyles}>
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                style={navItemStyles(isActive)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    Object.assign(e.currentTarget.style, navItemHoverStyles)
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    Object.assign(e.currentTarget.style, {
                      backgroundColor: 'transparent',
                      color: theme.colors.text.secondary,
                    })
                  }
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User section at bottom */}
        <div style={{ 
          padding: theme.spacing[4], 
          borderTop: `1px solid ${theme.colors.border.light}`,
          display: sidebarCollapsed ? 'none' : 'block'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: theme.spacing[3],
            marginBottom: theme.spacing[3]
          }}>
            <div style={avatarStyles}>
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ 
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user?.displayName || 'User'}
              </p>
              <p style={{ 
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.secondary,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            fullWidth
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div style={mainContentStyles}>
        <div style={topBarStyles}>
          <h1 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            textTransform: 'capitalize'
          }}>
            {navigationItems.find(item => item.path === location.pathname)?.label || 'StudHub Portfolio'}
          </h1>

          {sidebarCollapsed && (
            <div style={userInfoStyles}>
              <div style={avatarStyles}>
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
              </div>
              <span style={{ 
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.primary
              }}>
                {user?.displayName || user?.email}
              </span>
            </div>
          )}
        </div>

        <div style={contentStyles}>
          {children}
        </div>
      </div>
    </div>
  )
}

Layout.displayName = 'Layout'