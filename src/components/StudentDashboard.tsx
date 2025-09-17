import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { theme } from '../styles/theme'
import { Card, CardContent, Badge, LoadingSpinner } from './ui'

interface Activity {
  id: string
  title: string
  type: string
  description: string
  startDate: string
  endDate: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: any
  verifiedBy?: string
  verifiedAt?: any
  comments?: string
}

export function StudentDashboard() {
  const { userProfile } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  useEffect(() => {
    if (!userProfile?.uid) return

    const fetchActivities = async () => {
      try {
        const activitiesRef = collection(db, 'activities')
        const q = query(
          activitiesRef,
          where('userId', '==', userProfile.uid),
          orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(q)
        const activitiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Activity[]

        setActivities(activitiesData)
        
        // Calculate stats
        const total = activitiesData.length
        const pending = activitiesData.filter(a => a.status === 'pending').length
        const approved = activitiesData.filter(a => a.status === 'approved').length
        const rejected = activitiesData.filter(a => a.status === 'rejected').length
        
        setStats({ total, pending, approved, rejected })
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [userProfile?.uid])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: theme.spacing[4],
      }}>
        <LoadingSpinner size="lg" />
        <div style={{ 
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.text.secondary,
        }}>
          Loading your dashboard...
        </div>
      </div>
    )
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'error'
      case 'pending': return 'warning'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅'
      case 'rejected': return '❌'
      case 'pending': return '⏳'
      default: return '📝'
    }
  }

  return (
    <div>
      <div style={{ marginBottom: theme.spacing[8] }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: theme.typography.fontSize['3xl'], 
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing[2],
        }}>
          Welcome back, {userProfile?.name}!
        </h1>
        <p style={{ 
          margin: 0, 
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.text.secondary,
        }}>
          Here's an overview of your academic activities and achievements.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: theme.spacing[6], 
        marginBottom: theme.spacing[8] 
      }}>
        <Card variant="elevated" padding="lg">
          <CardContent>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: theme.typography.fontSize['4xl'], 
                fontWeight: theme.typography.fontWeight.bold, 
                color: theme.colors.primary[600],
                marginBottom: theme.spacing[2],
              }}>
                {stats.total}
              </div>
              <div style={{ 
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
              }}>
                Total Activities
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" padding="lg">
          <CardContent>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: theme.typography.fontSize['4xl'], 
                fontWeight: theme.typography.fontWeight.bold, 
                color: theme.colors.warning[600],
                marginBottom: theme.spacing[2],
              }}>
                {stats.pending}
              </div>
              <div style={{ 
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
              }}>
                Pending Review
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" padding="lg">
          <CardContent>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: theme.typography.fontSize['4xl'], 
                fontWeight: theme.typography.fontWeight.bold, 
                color: theme.colors.success[600],
                marginBottom: theme.spacing[2],
              }}>
                {stats.approved}
              </div>
              <div style={{ 
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
              }}>
                Approved
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" padding="lg">
          <CardContent>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: theme.typography.fontSize['4xl'], 
                fontWeight: theme.typography.fontWeight.bold, 
                color: theme.colors.error[600],
                marginBottom: theme.spacing[2],
              }}>
                {stats.rejected}
              </div>
              <div style={{ 
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
              }}>
                Rejected
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card variant="elevated" padding="lg">
        <div style={{ 
          paddingBottom: theme.spacing[4], 
          borderBottom: `1px solid ${theme.colors.border.light}`,
          marginBottom: theme.spacing[6],
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
          }}>
            Recent Activities
          </h2>
          <p style={{ 
            margin: `${theme.spacing[1]} 0 0 0`,
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.base,
          }}>
            Your latest submitted activities and their verification status
          </p>
        </div>

        <CardContent>
          {activities.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: theme.spacing[12], 
              color: theme.colors.text.secondary,
            }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: theme.spacing[4],
                opacity: 0.5,
              }}>
                📝
              </div>
              <div style={{ 
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.medium,
                marginBottom: theme.spacing[2],
              }}>
                No activities submitted yet
              </div>
              <div style={{ 
                fontSize: theme.typography.fontSize.base,
                marginBottom: theme.spacing[4],
              }}>
                Start building your verified academic portfolio by submitting your first activity.
              </div>
              <a 
                href="/activities" 
                style={{ 
                  color: theme.colors.primary[600], 
                  textDecoration: 'none',
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                }}
              >
                Submit your first activity →
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
              {activities.slice(0, 5).map(activity => (
                <Card key={activity.id} variant="outlined" padding="md">
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    marginBottom: theme.spacing[3],
                  }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text.primary,
                    }}>
                      {activity.title}
                    </h3>
                    <Badge variant={getStatusVariant(activity.status)} size="md">
                      {getStatusIcon(activity.status)} {activity.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div style={{ 
                    color: theme.colors.text.secondary, 
                    fontSize: theme.typography.fontSize.sm, 
                    marginBottom: theme.spacing[3],
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing[2],
                  }}>
                    <span style={{ 
                      background: theme.colors.primary[100],
                      color: theme.colors.primary[700],
                      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                      borderRadius: theme.borderRadius.sm,
                      fontSize: theme.typography.fontSize.xs,
                      fontWeight: theme.typography.fontWeight.medium,
                    }}>
                      {activity.type}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(activity.startDate).toLocaleDateString()} - {new Date(activity.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div style={{ 
                    color: theme.colors.text.primary, 
                    fontSize: theme.typography.fontSize.base,
                    lineHeight: theme.typography.lineHeight.relaxed,
                    marginBottom: theme.spacing[3],
                  }}>
                    {activity.description}
                  </div>
                  
                  {activity.comments && (
                    <div style={{ 
                      padding: theme.spacing[3], 
                      background: theme.colors.gray[50], 
                      borderRadius: theme.borderRadius.md,
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary,
                      borderLeft: `3px solid ${theme.colors.primary[300]}`,
                    }}>
                      <strong style={{ color: theme.colors.text.primary }}>Comments:</strong> {activity.comments}
                    </div>
                  )}
                </Card>
              ))}
              
              {activities.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: theme.spacing[4] }}>
                  <a 
                    href="/activities" 
                    style={{ 
                      color: theme.colors.primary[600], 
                      textDecoration: 'none',
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.medium,
                    }}
                  >
                    View all activities →
                  </a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}