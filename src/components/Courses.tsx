import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Card, 
  CardContent,
  Button, 
  Input,
  Form,
  FormActions,
  Modal,
  IconButton,
  LoadingSpinner 
} from './ui'
import { coursesService } from '../services/portfolioService'
import type { Course, CourseFormData } from '../types/portfolio'
import { theme } from '../styles/theme'

export const Courses = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    provider: '',
    certificateLink: '',
    completionDate: new Date(),
  })

  useEffect(() => {
    if (user?.uid) {
      fetchCourses()
    }
  }, [user])

  const fetchCourses = async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      const userCourses = await coursesService.getAll(user.uid)
      setCourses(userCourses)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      provider: '',
      certificateLink: '',
      completionDate: new Date(),
    })
    setEditingCourse(null)
  }

  const openModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course)
      setFormData({
        title: course.title,
        provider: course.provider,
        certificateLink: course.certificateLink || '',
        completionDate: course.completionDate,
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

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid) return
    
    try {
      setSaving(true)
      
      if (editingCourse?.courseId) {
        await coursesService.update(editingCourse.courseId, formData)
      } else {
        await coursesService.create(user.uid, formData)
      }
      
      await fetchCourses()
      closeModal()
    } catch (error) {
      console.error('Error saving course:', error)
      alert('Failed to save course. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    
    try {
      await coursesService.delete(courseId)
      await fetchCourses()
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Failed to delete course. Please try again.')
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }).format(date)
  }

  const getProviderIcon = (provider: string) => {
    const lowerProvider = provider.toLowerCase()
    if (lowerProvider.includes('coursera')) return '🎓'
    if (lowerProvider.includes('udemy')) return '📚'
    if (lowerProvider.includes('edx')) return '🎯'
    if (lowerProvider.includes('khan')) return '📖'
    if (lowerProvider.includes('linkedin')) return '💼'
    if (lowerProvider.includes('pluralsight')) return '🔧'
    if (lowerProvider.includes('codecademy')) return '💻'
    if (lowerProvider.includes('freecodecamp')) return '🔥'
    return '📜'
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
            Courses
          </h1>
          <p style={{ 
            margin: 0,
            marginTop: theme.spacing[1],
            color: theme.colors.text.secondary 
          }}>
            Track your online courses, certifications, and continuous learning
          </p>
        </div>
        <Button onClick={() => openModal()}>
          + Add Course
        </Button>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent>
            <div style={{ 
              textAlign: 'center', 
              padding: theme.spacing[12] 
            }}>
              <div style={{ fontSize: '64px', marginBottom: theme.spacing[4] }}>📚</div>
              <h3 style={{ 
                margin: 0,
                marginBottom: theme.spacing[2],
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.text.primary
              }}>
                No courses yet
              </h3>
              <p style={{ 
                margin: 0,
                marginBottom: theme.spacing[6],
                color: theme.colors.text.secondary
              }}>
                Add courses and certifications to showcase your continuous learning
              </p>
              <Button onClick={() => openModal()}>
                Add Your First Course
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div style={{ 
          display: 'grid', 
          gap: theme.spacing[4],
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
        }}>
          {courses.map((course) => (
            <Card key={course.courseId}>
              <CardContent>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  gap: theme.spacing[4]
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: theme.borderRadius.lg,
                    backgroundColor: theme.colors.success[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0,
                  }}>
                    {getProviderIcon(course.provider)}
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
                          fontSize: theme.typography.fontSize.base,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.text.primary,
                          lineHeight: theme.typography.lineHeight.tight
                        }}>
                          {course.title}
                        </h3>
                        <p style={{ 
                          margin: 0,
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.text.secondary,
                          marginTop: theme.spacing[1]
                        }}>
                          {course.provider}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: theme.spacing[1] }}>
                        <IconButton
                          onClick={() => openModal(course)}
                          variant="ghost"
                          size="sm"
                          tooltip="Edit course"
                        >
                          ✏️
                        </IconButton>
                        <IconButton
                          onClick={() => course.courseId && handleDelete(course.courseId)}
                          variant="ghost"
                          size="sm"
                          tooltip="Delete course"
                        >
                          🗑️
                        </IconButton>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                        <span>📅</span>
                        <span>Completed {formatDate(course.completionDate)}</span>
                      </div>
                      
                      {course.certificateLink && (
                        <a
                          href={course.certificateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: theme.spacing[1],
                            padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                            backgroundColor: theme.colors.success[50],
                            color: theme.colors.success[600],
                            textDecoration: 'none',
                            borderRadius: theme.borderRadius.md,
                            fontSize: theme.typography.fontSize.xs,
                            fontWeight: theme.typography.fontWeight.medium,
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.success[100]
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.success[50]
                          }}
                        >
                          <span>📜</span>
                          Certificate
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCourse ? 'Edit Course' : 'Add Course'}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <Input
            label="Course Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Complete React Developer Course"
            required
          />

          <Input
            label="Provider"
            value={formData.provider}
            onChange={(e) => handleInputChange('provider', e.target.value)}
            placeholder="e.g., Coursera, Udemy, edX, LinkedIn Learning"
            required
          />

          <Input
            label="Completion Date"
            type="date"
            value={formData.completionDate.toISOString().split('T')[0]}
            onChange={(e) => handleInputChange('completionDate', new Date(e.target.value))}
            required
          />

          <Input
            label="Certificate Link"
            type="url"
            value={formData.certificateLink}
            onChange={(e) => handleInputChange('certificateLink', e.target.value)}
            placeholder="https://certificate-url.com"
            helperText="Optional: Link to your certificate"
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
              {saving ? 'Saving...' : editingCourse ? 'Update Course' : 'Add Course'}
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </div>
  )
}

Courses.displayName = 'Courses'