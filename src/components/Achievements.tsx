import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Card, 
  CardContent,
  Button, 
  Input, 
  Textarea,
  Form, 
  FormActions,
  Modal,
  IconButton,
  LoadingSpinner 
} from './ui'
import { achievementsService } from '../services/portfolioService'
import type { Achievement, AchievementFormData } from '../types/portfolio'
import { theme } from '../styles/theme'

export const Achievements = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<AchievementFormData>({
    title: '',
    description: '',
    date: new Date(),
  })

  useEffect(() => {
    if (user?.uid) {
      fetchAchievements()
    }
  }, [user])

  const fetchAchievements = async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      const userAchievements = await achievementsService.getAll(user.uid)
      setAchievements(userAchievements)
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date(),
    })
    setEditingAchievement(null)
  }

  const openModal = (achievement?: Achievement) => {
    if (achievement) {
      setEditingAchievement(achievement)
      setFormData({
        title: achievement.title,
        description: achievement.description,
        date: achievement.date,
      })
    } else {
      resetForm()
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleInputChange = (field: keyof AchievementFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid) return
    
    try {
      setSaving(true)
      
      if (editingAchievement?.achievementId) {
        await achievementsService.update(editingAchievement.achievementId, formData)
      } else {
        await achievementsService.create(user.uid, formData)
      }
      
      await fetchAchievements()
      closeModal()
    } catch (error) {
      console.error('Error saving achievement:', error)
      alert('Failed to save achievement. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (achievementId: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return
    
    try {
      await achievementsService.delete(achievementId)
      await fetchAchievements()
    } catch (error) {
      console.error('Error deleting achievement:', error)
      alert('Failed to delete achievement. Please try again.')
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    }).format(date)
  }

  const getAchievementIcon = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('winner') || lowerTitle.includes('first') || lowerTitle.includes('1st')) return '🥇'
    if (lowerTitle.includes('runner') || lowerTitle.includes('second') || lowerTitle.includes('2nd')) return '🥈'
    if (lowerTitle.includes('third') || lowerTitle.includes('3rd')) return '🥉'
    if (lowerTitle.includes('hackathon') || lowerTitle.includes('coding')) return '💻'
    if (lowerTitle.includes('research') || lowerTitle.includes('paper')) return '📄'
    if (lowerTitle.includes('scholarship') || lowerTitle.includes('award')) return '🎖️'
    if (lowerTitle.includes('competition') || lowerTitle.includes('contest')) return '🏆'
    if (lowerTitle.includes('publication') || lowerTitle.includes('journal')) return '📚'
    return '⭐'
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
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

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: theme.spacing[6] 
      }}>
        <div>
          <h1 style={{ 
            margin: 0,
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary
          }}>
            Achievements
          </h1>
          <p style={{ 
            margin: 0,
            marginTop: theme.spacing[1],
            color: theme.colors.text.secondary 
          }}>
            Showcase your awards, competitions, and significant accomplishments
          </p>
        </div>
        <Button onClick={() => openModal()}>
          + Add Achievement
        </Button>
      </div>

      {/* Achievements Timeline */}
      {achievements.length === 0 ? (
        <Card>
          <CardContent>
            <div style={{ 
              textAlign: 'center', 
              padding: theme.spacing[12] 
            }}>
              <div style={{ fontSize: '64px', marginBottom: theme.spacing[4] }}>🏆</div>
              <h3 style={{ 
                margin: 0,
                marginBottom: theme.spacing[2],
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.text.primary
              }}>
                No achievements yet
              </h3>
              <p style={{ 
                margin: 0,
                marginBottom: theme.spacing[6],
                color: theme.colors.text.secondary
              }}>
                Add your awards, competitions, and accomplishments to highlight your success
              </p>
              <Button onClick={() => openModal()}>
                Add Your First Achievement
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: theme.spacing[4] }}>
          {achievements.map((achievement) => (
            <Card key={achievement.achievementId}>
              <CardContent>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  gap: theme.spacing[4]
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: theme.borderRadius.lg,
                    backgroundColor: theme.colors.warning[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    flexShrink: 0,
                  }}>
                    {getAchievementIcon(achievement.title)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: theme.spacing[3]
                    }}>
                      <div>
                        <h3 style={{ 
                          margin: 0,
                          fontSize: theme.typography.fontSize.lg,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.text.primary,
                          marginBottom: theme.spacing[1]
                        }}>
                          {achievement.title}
                        </h3>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: theme.spacing[3],
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.text.secondary,
                          marginBottom: theme.spacing[2]
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                            <span>📅</span>
                            <span>{formatDate(achievement.date)}</span>
                          </div>
                          <span>•</span>
                          <span>{getTimeAgo(achievement.date)}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: theme.spacing[1] }}>
                        <IconButton
                          onClick={() => openModal(achievement)}
                          variant="ghost"
                          size="sm"
                          tooltip="Edit achievement"
                        >
                          ✏️
                        </IconButton>
                        <IconButton
                          onClick={() => achievement.achievementId && handleDelete(achievement.achievementId)}
                          variant="ghost"
                          size="sm"
                          tooltip="Delete achievement"
                        >
                          🗑️
                        </IconButton>
                      </div>
                    </div>
                    
                    <p style={{ 
                      margin: 0,
                      fontSize: theme.typography.fontSize.base,
                      color: theme.colors.text.secondary,
                      lineHeight: theme.typography.lineHeight.relaxed
                    }}>
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Achievement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingAchievement ? 'Edit Achievement' : 'Add Achievement'}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <Input
            label="Achievement Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Winner of National Coding Competition"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your achievement, what you accomplished, and its significance"
            rows={4}
            required
          />

          <Input
            label="Achievement Date"
            type="date"
            value={formData.date.toISOString().split('T')[0]}
            onChange={(e) => handleInputChange('date', new Date(e.target.value))}
            required
          />

          <FormActions>
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : editingAchievement ? 'Update Achievement' : 'Add Achievement'}
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </div>
  )
}

Achievements.displayName = 'Achievements'