import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardHeader, CardContent, LoadingSpinner } from './ui'
import { theme } from '../styles/theme'
import { 
  profileService,
  projectsService, 
  educationService, 
  coursesService,
  achievementsService,
  skillsService,
  positionsService,
  certificationsService
} from '../services/portfolioService'
import type { UserProfile } from '../types/portfolio'

export const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState({
    projects: 0,
    education: 0,
    courses: 0,
    achievements: 0,
    skills: 0,
    positions: 0,
    certifications: 0,
  })
  const [recentActivity, setRecentActivity] = useState<Array<{
    type: string
    title: string
    date: Date
    icon: string
  }>>([])

  useEffect(() => {
    if (user?.uid) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)

      // Fetch user profile
      const userProfile = await profileService.get(user.uid)
      setProfile(userProfile)

      // Fetch all data for statistics
      const [
        projects,
        education,
        courses,
        achievements,
        skillCategories,
        positions,
        certifications,
      ] = await Promise.all([
        projectsService.getAll(user.uid),
        educationService.getAll(user.uid),
        coursesService.getAll(user.uid),
        achievementsService.getAll(user.uid),
        skillsService.getAll(user.uid),
        positionsService.getAll(user.uid),
        certificationsService.getAll(user.uid),
      ])

      // Update stats
      setStats({
        projects: projects.length,
        education: education.length,
        courses: courses.length,
        achievements: achievements.length,
        skills: skillCategories.reduce((total, category) => total + category.skills.length, 0),
        positions: positions.length,
        certifications: certifications.length,
      })

      // Create recent activity timeline
      const activities = [
        ...projects.slice(0, 3).map(p => ({
          type: 'project',
          title: `Added project: ${p.title}`,
          date: p.startDate,
          icon: '💼'
        })),
        ...achievements.slice(0, 3).map(a => ({
          type: 'achievement',
          title: `Earned: ${a.title}`,
          date: a.date,
          icon: '🏆'
        })),
        ...courses.slice(0, 3).map(c => ({
          type: 'course',
          title: `Completed: ${c.title}`,
          date: c.completionDate,
          icon: '📚'
        })),
        ...certifications.slice(0, 3).map(c => ({
          type: 'certification',
          title: `Certified: ${c.title}`,
          date: c.issueDate,
          icon: '📜'
        })),
      ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8)

      setRecentActivity(activities)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statCards = [
    { label: 'Projects', value: stats.projects, icon: '💼', color: theme.colors.primary[600] },
    { label: 'Education', value: stats.education, icon: '🎓', color: theme.colors.secondary[600] },
    { label: 'Courses', value: stats.courses, icon: '📚', color: theme.colors.success[600] },
    { label: 'Achievements', value: stats.achievements, icon: '🏆', color: theme.colors.warning[600] },
    { label: 'Skills', value: stats.skills, icon: '⚡', color: theme.colors.primary[500] },
    { label: 'Positions', value: stats.positions, icon: '👔', color: theme.colors.secondary[500] },
    { label: 'Certifications', value: stats.certifications, icon: '📜', color: theme.colors.error[600] },
  ]

  const containerStyles = {
    display: 'grid',
    gap: theme.spacing[6],
  }

  const welcomeCardStyles = {
    background: `linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[700]} 100%)`,
    color: theme.colors.text.inverse,
    padding: theme.spacing[8],
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing[6],
  }

  const statsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[6],
  }

  const statCardStyles = {
    padding: theme.spacing[5],
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.border.light}`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[4],
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  }

  const statIconStyles = (color: string) => ({
    width: '48px',
    height: '48px',
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${color}20`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  })

  const statTextStyles = {
    flex: 1,
  }

  const statValueStyles = {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    margin: 0,
  }

  const statLabelStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: 0,
  }

  const recentActivityStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: theme.spacing[4],
  }

  const activityItemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
    padding: theme.spacing[3],
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border.light}`,
  }

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    )
  }

  return (
    <div style={containerStyles}>
      {/* Welcome Section */}
      <div style={welcomeCardStyles}>
        <h1 style={{ 
          margin: 0, 
          marginBottom: theme.spacing[2],
          fontSize: theme.typography.fontSize['2xl'],
          fontWeight: theme.typography.fontWeight.bold 
        }}>
          Welcome back, {profile?.name || user?.displayName || 'Student'}! 👋
        </h1>
        <p style={{ 
          margin: 0, 
          fontSize: theme.typography.fontSize.base,
          opacity: 0.9 
        }}>
          Track your academic journey and build an impressive portfolio
        </p>
      </div>

      {/* Statistics Grid */}
      <div>
        <h2 style={{ 
          marginBottom: theme.spacing[4],
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary
        }}>
          Portfolio Overview
        </h2>
        <div style={statsGridStyles}>
          {statCards.map((stat) => (
            <div key={stat.label} style={statCardStyles}>
              <div style={statIconStyles(stat.color)}>
                {stat.icon}
              </div>
              <div style={statTextStyles}>
                <p style={statValueStyles}>{stat.value}</p>
                <p style={statLabelStyles}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div>
          <h2 style={{ 
            marginBottom: theme.spacing[4],
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary
          }}>
            Recent Activity
          </h2>
          <div style={recentActivityStyles}>
            {recentActivity.map((activity, index) => (
              <div key={index} style={activityItemStyles}>
                <span style={{ fontSize: '24px' }}>{activity.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    margin: 0,
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.primary,
                    fontWeight: theme.typography.fontWeight.medium
                  }}>
                    {activity.title}
                  </p>
                </div>
                <span style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.text.secondary
                }}>
                  {formatDate(activity.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 style={{ margin: 0 }}>Quick Actions</h3>
        </CardHeader>
        <CardContent>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: theme.spacing[4] 
          }}>
            {[
              { label: 'Add Project', href: '/projects', icon: '💼' },
              { label: 'Update Profile', href: '/profile', icon: '👤' },
              { label: 'Add Achievement', href: '/achievements', icon: '🏆' },
              { label: 'Update Skills', href: '/skills', icon: '⚡' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[3],
                  padding: theme.spacing[4],
                  backgroundColor: theme.colors.gray[50],
                  borderRadius: theme.borderRadius.md,
                  textDecoration: 'none',
                  color: theme.colors.text.primary,
                  transition: 'all 0.2s ease',
                  border: `1px solid ${theme.colors.border.light}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.gray[100]
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.gray[50]
                }}
              >
                <span style={{ fontSize: '24px' }}>{action.icon}</span>
                <span style={{ fontWeight: theme.typography.fontWeight.medium }}>
                  {action.label}
                </span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

Dashboard.displayName = 'Dashboard'