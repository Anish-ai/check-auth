import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Card, 
  CardContent,
  Button, 
  Input, 
  Select,
  Form, 
  FormGroup, 
  FormActions,
  Modal,
  IconButton,
  LoadingSpinner 
} from './ui'
import { educationService } from '../services/portfolioService'
import type { Education, EducationFormData } from '../types/portfolio'
import { theme } from '../styles/theme'

export const EducationSection = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [education, setEducation] = useState<Education[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEducation, setEditingEducation] = useState<Education | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<EducationFormData>({
    institute: '',
    degree: '',
    branch: '',
    startYear: new Date().getFullYear(),
    endYear: undefined,
    cgpaOrPercentage: '',
  })

  const degreeOptions = [
    { value: 'B.Tech', label: 'Bachelor of Technology (B.Tech)' },
    { value: 'B.E.', label: 'Bachelor of Engineering (B.E.)' },
    { value: 'B.Sc', label: 'Bachelor of Science (B.Sc)' },
    { value: 'BCA', label: 'Bachelor of Computer Applications (BCA)' },
    { value: 'M.Tech', label: 'Master of Technology (M.Tech)' },
    { value: 'M.E.', label: 'Master of Engineering (M.E.)' },
    { value: 'M.Sc', label: 'Master of Science (M.Sc)' },
    { value: 'MCA', label: 'Master of Computer Applications (MCA)' },
    { value: 'PhD', label: 'Doctor of Philosophy (PhD)' },
    { value: '12th', label: 'Class XII / Senior Secondary' },
    { value: '10th', label: 'Class X / Secondary' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Other', label: 'Other' },
  ]

  useEffect(() => {
    if (user?.uid) {
      fetchEducation()
    }
  }, [user])

  const fetchEducation = async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      const userEducation = await educationService.getAll(user.uid)
      setEducation(userEducation)
    } catch (error) {
      console.error('Error fetching education:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      institute: '',
      degree: '',
      branch: '',
      startYear: new Date().getFullYear(),
      endYear: undefined,
      cgpaOrPercentage: '',
    })
    setEditingEducation(null)
  }

  const openModal = (educationItem?: Education) => {
    if (educationItem) {
      setEditingEducation(educationItem)
      setFormData({
        institute: educationItem.institute,
        degree: educationItem.degree,
        branch: educationItem.branch || '',
        startYear: educationItem.startYear,
        endYear: educationItem.endYear,
        cgpaOrPercentage: educationItem.cgpaOrPercentage || '',
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

  const handleInputChange = (field: keyof EducationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid) return
    
    try {
      setSaving(true)
      
      if (editingEducation?.eduId) {
        await educationService.update(editingEducation.eduId, formData)
      } else {
        await educationService.create(user.uid, formData)
      }
      
      await fetchEducation()
      closeModal()
    } catch (error) {
      console.error('Error saving education:', error)
      alert('Failed to save education. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (eduId: string) => {
    if (!confirm('Are you sure you want to delete this education record?')) return
    
    try {
      await educationService.delete(eduId)
      await fetchEducation()
    } catch (error) {
      console.error('Error deleting education:', error)
      alert('Failed to delete education. Please try again.')
    }
  }

  const getYearRange = (startYear: number, endYear?: number) => {
    if (!endYear || endYear === startYear) return startYear.toString()
    return `${startYear} - ${endYear}`
  }

  const getEducationIcon = (degree: string) => {
    if (degree.includes('PhD')) return '🎓'
    if (degree.includes('M.')) return '🎓'
    if (degree.includes('B.')) return '📚'
    if (degree === '12th') return '📖'
    if (degree === '10th') return '✏️'
    return '🎓'
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
            Education
          </h1>
          <p style={{ 
            margin: 0,
            marginTop: theme.spacing[1],
            color: theme.colors.text.secondary 
          }}>
            Add your academic qualifications and educational background
          </p>
        </div>
        <Button onClick={() => openModal()}>
          + Add Education
        </Button>
      </div>

      {/* Education Timeline */}
      {education.length === 0 ? (
        <Card>
          <CardContent>
            <div style={{ 
              textAlign: 'center', 
              padding: theme.spacing[12] 
            }}>
              <div style={{ fontSize: '64px', marginBottom: theme.spacing[4] }}>🎓</div>
              <h3 style={{ 
                margin: 0,
                marginBottom: theme.spacing[2],
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.text.primary
              }}>
                No education records yet
              </h3>
              <p style={{ 
                margin: 0,
                marginBottom: theme.spacing[6],
                color: theme.colors.text.secondary
              }}>
                Add your educational qualifications to build your academic profile
              </p>
              <Button onClick={() => openModal()}>
                Add Education Record
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: theme.spacing[4] }}>
          {education.map((edu) => (
            <Card key={edu.eduId}>
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
                    backgroundColor: theme.colors.primary[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0,
                  }}>
                    {getEducationIcon(edu.degree)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: theme.spacing[2]
                    }}>
                      <div>
                        <h3 style={{ 
                          margin: 0,
                          fontSize: theme.typography.fontSize.lg,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.text.primary
                        }}>
                          {edu.degree}{edu.branch ? ` in ${edu.branch}` : ''}
                        </h3>
                        <p style={{ 
                          margin: 0,
                          fontSize: theme.typography.fontSize.base,
                          color: theme.colors.text.secondary,
                          marginTop: theme.spacing[1]
                        }}>
                          {edu.institute}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: theme.spacing[1] }}>
                        <IconButton
                          onClick={() => openModal(edu)}
                          variant="ghost"
                          size="sm"
                          tooltip="Edit education"
                        >
                          ✏️
                        </IconButton>
                        <IconButton
                          onClick={() => edu.eduId && handleDelete(edu.eduId)}
                          variant="ghost"
                          size="sm"
                          tooltip="Delete education"
                        >
                          🗑️
                        </IconButton>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: theme.spacing[4],
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                        <span>📅</span>
                        <span>{getYearRange(edu.startYear, edu.endYear)}</span>
                      </div>
                      {edu.cgpaOrPercentage && (
                        <>
                          <span>•</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                            <span>📊</span>
                            <span>{edu.cgpaOrPercentage}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Education Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingEducation ? 'Edit Education' : 'Add Education'}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <Input
            label="Institute/University"
            value={formData.institute}
            onChange={(e) => handleInputChange('institute', e.target.value)}
            placeholder="e.g., Indian Institute of Technology, Delhi"
            required
          />

          <FormGroup columns={2}>
            <Select
              label="Degree"
              value={formData.degree}
              onChange={(e) => handleInputChange('degree', e.target.value)}
              options={degreeOptions}
              placeholder="Select degree type"
              required
            />

            <Input
              label="Branch/Specialization"
              value={formData.branch}
              onChange={(e) => handleInputChange('branch', e.target.value)}
              placeholder="e.g., Computer Science, Electronics"
            />
          </FormGroup>

          <FormGroup columns={2}>
            <Input
              label="Start Year"
              type="number"
              value={formData.startYear}
              onChange={(e) => handleInputChange('startYear', parseInt(e.target.value))}
              min="1990"
              max="2030"
              required
            />

            <Input
              label="End Year"
              type="number"
              value={formData.endYear || ''}
              onChange={(e) => handleInputChange('endYear', e.target.value ? parseInt(e.target.value) : undefined)}
              min="1990"
              max="2030"
              helperText="Leave empty if currently pursuing"
            />
          </FormGroup>

          <Input
            label="CGPA/Percentage"
            value={formData.cgpaOrPercentage}
            onChange={(e) => handleInputChange('cgpaOrPercentage', e.target.value)}
            placeholder="e.g., 8.5 CGPA or 85%"
            helperText="Optional: Add your academic performance"
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
              {saving ? 'Saving...' : editingEducation ? 'Update Education' : 'Add Education'}
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </div>
  )
}

EducationSection.displayName = 'EducationSection'