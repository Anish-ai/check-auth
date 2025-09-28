import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Card, 
  CardContent,
  Button, 
  Input, 
  Textarea,
  Form, 
  FormGroup,
  FormActions,
  Modal,
  IconButton,
  LoadingSpinner 
} from './ui'
import { positionsService } from '../services/portfolioService'
import type { Position, PositionFormData } from '../types/portfolio'
import { theme } from '../styles/theme'

export const Positions = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [positions, setPositions] = useState<Position[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<PositionFormData>({
    title: '',
    organization: '',
    description: '',
    startDate: new Date(),
    endDate: undefined,
  })

  useEffect(() => {
    if (user?.uid) {
      fetchPositions()
    }
  }, [user])

  const fetchPositions = async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      const userPositions = await positionsService.getAll(user.uid)
      setPositions(userPositions)
    } catch (error) {
      console.error('Error fetching positions:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      organization: '',
      description: '',
      startDate: new Date(),
      endDate: undefined,
    })
    setEditingPosition(null)
  }

  const openModal = (position?: Position) => {
    if (position) {
      setEditingPosition(position)
      setFormData({
        title: position.title,
        organization: position.organization,
        description: position.description,
        startDate: position.startDate,
        endDate: position.endDate,
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

  const handleInputChange = (field: keyof PositionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid) return
    
    try {
      setSaving(true)
      
      if (editingPosition?.posId) {
        await positionsService.update(editingPosition.posId, formData)
      } else {
        await positionsService.create(user.uid, formData)
      }
      
      await fetchPositions()
      closeModal()
    } catch (error) {
      console.error('Error saving position:', error)
      alert('Failed to save position. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (posId: string) => {
    if (!confirm('Are you sure you want to delete this position?')) return
    
    try {
      await positionsService.delete(posId)
      await fetchPositions()
    } catch (error) {
      console.error('Error deleting position:', error)
      alert('Failed to delete position. Please try again.')
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      year: 'numeric' 
    }).format(date)
  }

  const getDuration = (startDate: Date, endDate?: Date) => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth()
    
    if (months < 1) return '< 1 month'
    if (months === 1) return '1 month'
    if (months < 12) return `${months} months`
    
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`
    return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
  }

  const getPositionIcon = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('president') || lowerTitle.includes('chair')) return '👑'
    if (lowerTitle.includes('vice') || lowerTitle.includes('deputy')) return '👨‍💼'
    if (lowerTitle.includes('secretary')) return '📝'
    if (lowerTitle.includes('treasurer')) return '💰'
    if (lowerTitle.includes('coordinator') || lowerTitle.includes('manager')) return '🎯'
    if (lowerTitle.includes('lead') || lowerTitle.includes('leader')) return '🚀'
    if (lowerTitle.includes('member') || lowerTitle.includes('representative')) return '👥'
    if (lowerTitle.includes('mentor') || lowerTitle.includes('advisor')) return '🎓'
    if (lowerTitle.includes('volunteer')) return '❤️'
    return '👔'
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
            Positions of Responsibility
          </h1>
          <p style={{ 
            margin: 0,
            marginTop: theme.spacing[1],
            color: theme.colors.text.secondary 
          }}>
            Highlight your leadership roles and responsibilities in organizations
          </p>
        </div>
        <Button onClick={() => openModal()}>
          + Add Position
        </Button>
      </div>

      {/* Positions Timeline */}
      {positions.length === 0 ? (
        <Card>
          <CardContent>
            <div style={{ 
              textAlign: 'center', 
              padding: theme.spacing[12] 
            }}>
              <div style={{ fontSize: '64px', marginBottom: theme.spacing[4] }}>👔</div>
              <h3 style={{ 
                margin: 0,
                marginBottom: theme.spacing[2],
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.text.primary
              }}>
                No positions yet
              </h3>
              <p style={{ 
                margin: 0,
                marginBottom: theme.spacing[6],
                color: theme.colors.text.secondary
              }}>
                Add your leadership roles and positions of responsibility
              </p>
              <Button onClick={() => openModal()}>
                Add Your First Position
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: theme.spacing[4] }}>
          {positions.map((position) => (
            <Card key={position.posId}>
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
                    backgroundColor: theme.colors.secondary[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0,
                  }}>
                    {getPositionIcon(position.title)}
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
                          {position.title}
                        </h3>
                        <p style={{ 
                          margin: 0,
                          fontSize: theme.typography.fontSize.base,
                          color: theme.colors.text.secondary,
                          fontWeight: theme.typography.fontWeight.medium,
                          marginBottom: theme.spacing[2]
                        }}>
                          {position.organization}
                        </p>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: theme.spacing[3],
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.text.secondary,
                          marginBottom: theme.spacing[3]
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                            <span>📅</span>
                            <span>
                              {formatDate(position.startDate)} - {position.endDate ? formatDate(position.endDate) : 'Present'}
                            </span>
                          </div>
                          <span>•</span>
                          <span>{getDuration(position.startDate, position.endDate)}</span>
                          {!position.endDate && (
                            <>
                              <span>•</span>
                              <span style={{ 
                                color: theme.colors.success[600],
                                fontWeight: theme.typography.fontWeight.medium
                              }}>
                                Current
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: theme.spacing[1] }}>
                        <IconButton
                          onClick={() => openModal(position)}
                          variant="ghost"
                          size="sm"
                          tooltip="Edit position"
                        >
                          ✏️
                        </IconButton>
                        <IconButton
                          onClick={() => position.posId && handleDelete(position.posId)}
                          variant="ghost"
                          size="sm"
                          tooltip="Delete position"
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
                      {position.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Position Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPosition ? 'Edit Position' : 'Add Position of Responsibility'}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <Input
            label="Position Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., President, Vice President, Secretary, Coordinator"
            required
          />

          <Input
            label="Organization"
            value={formData.organization}
            onChange={(e) => handleInputChange('organization', e.target.value)}
            placeholder="e.g., Student Council, Tech Club, Cultural Society"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your key responsibilities, achievements, and impact in this role"
            rows={4}
            required
          />

          <FormGroup columns={2}>
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate.toISOString().split('T')[0]}
              onChange={(e) => handleInputChange('startDate', new Date(e.target.value))}
              required
            />

            <Input
              label="End Date"
              type="date"
              value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleInputChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
              helperText="Leave empty if currently serving"
            />
          </FormGroup>

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
              {saving ? 'Saving...' : editingPosition ? 'Update Position' : 'Add Position'}
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </div>
  )
}

Positions.displayName = 'Positions'