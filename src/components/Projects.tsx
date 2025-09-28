import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Card, 
  CardHeader, 
  CardContent,
  Button, 
  Input, 
  Textarea,
  Form, 
  FormGroup, 
  FormActions,
  Modal,
  Badge,
  IconButton,
  LoadingSpinner 
} from './ui'
import { projectsService } from '../services/portfolioService'
import type { Project, ProjectFormData } from '../types/portfolio'
import { theme } from '../styles/theme'

export const Projects = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    techStack: [],
    projectLink: '',
    githubRepo: '',
    startDate: new Date(),
    endDate: undefined,
  })

  useEffect(() => {
    if (user?.uid) {
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      const userProjects = await projectsService.getAll(user.uid)
      setProjects(userProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      techStack: [],
      projectLink: '',
      githubRepo: '',
      startDate: new Date(),
      endDate: undefined,
    })
    setEditingProject(null)
  }

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setFormData({
        title: project.title,
        description: project.description,
        techStack: project.techStack,
        projectLink: project.projectLink || '',
        githubRepo: project.githubRepo || '',
        startDate: project.startDate,
        endDate: project.endDate,
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

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTechStackChange = (value: string) => {
    const techArray = value.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0)
    setFormData(prev => ({ ...prev, techStack: techArray }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid) return
    
    try {
      setSaving(true)
      
      if (editingProject?.projectId) {
        await projectsService.update(editingProject.projectId, formData)
      } else {
        await projectsService.create(user.uid, formData)
      }
      
      await fetchProjects()
      closeModal()
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Failed to save project. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    try {
      await projectsService.delete(projectId)
      await fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project. Please try again.')
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
            Projects
          </h1>
          <p style={{ 
            margin: 0,
            marginTop: theme.spacing[1],
            color: theme.colors.text.secondary 
          }}>
            Showcase your development projects and technical work
          </p>
        </div>
        <Button onClick={() => openModal()}>
          + Add Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card>
          <CardContent>
            <div style={{ 
              textAlign: 'center', 
              padding: theme.spacing[12] 
            }}>
              <div style={{ fontSize: '64px', marginBottom: theme.spacing[4] }}>💼</div>
              <h3 style={{ 
                margin: 0,
                marginBottom: theme.spacing[2],
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.text.primary
              }}>
                No projects yet
              </h3>
              <p style={{ 
                margin: 0,
                marginBottom: theme.spacing[6],
                color: theme.colors.text.secondary
              }}>
                Start building your portfolio by adding your first project
              </p>
              <Button onClick={() => openModal()}>
                Add Your First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div style={{ 
          display: 'grid', 
          gap: theme.spacing[4],
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
        }}>
          {projects.map((project) => (
            <Card key={project.projectId}>
              <CardHeader>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  gap: theme.spacing[3]
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: 0,
                      marginBottom: theme.spacing[2],
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text.primary
                    }}>
                      {project.title}
                    </h3>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: theme.spacing[2],
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary
                    }}>
                      <span>📅</span>
                      <span>
                        {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Present'}
                      </span>
                      <span>•</span>
                      <span>{getDuration(project.startDate, project.endDate)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: theme.spacing[1] }}>
                    <IconButton
                      onClick={() => openModal(project)}
                      variant="ghost"
                      size="sm"
                      tooltip="Edit project"
                    >
                      ✏️
                    </IconButton>
                    <IconButton
                      onClick={() => project.projectId && handleDelete(project.projectId)}
                      variant="ghost"
                      size="sm"
                      tooltip="Delete project"
                    >
                      🗑️
                    </IconButton>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p style={{ 
                  margin: 0,
                  marginBottom: theme.spacing[4],
                  color: theme.colors.text.secondary,
                  lineHeight: theme.typography.lineHeight.relaxed
                }}>
                  {project.description}
                </p>

                {project.techStack.length > 0 && (
                  <div style={{ marginBottom: theme.spacing[4] }}>
                    <p style={{ 
                      margin: 0,
                      marginBottom: theme.spacing[2],
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text.primary
                    }}>
                      Tech Stack:
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: theme.spacing[2] 
                    }}>
                      {project.techStack.map((tech, index) => (
                        <Badge key={index} variant="info">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ 
                  display: 'flex', 
                  gap: theme.spacing[3],
                  flexWrap: 'wrap'
                }}>
                  {project.projectLink && (
                    <a
                      href={project.projectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: theme.spacing[2],
                        padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                        backgroundColor: theme.colors.primary[50],
                        color: theme.colors.primary[600],
                        textDecoration: 'none',
                        borderRadius: theme.borderRadius.md,
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.medium,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.primary[100]
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.primary[50]
                      }}
                    >
                      <span>🔗</span>
                      Live Demo
                    </a>
                  )}
                  
                  {project.githubRepo && (
                    <a
                      href={project.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: theme.spacing[2],
                        padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                        backgroundColor: theme.colors.gray[50],
                        color: theme.colors.text.primary,
                        textDecoration: 'none',
                        borderRadius: theme.borderRadius.md,
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.medium,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.gray[100]
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.gray[50]
                      }}
                    >
                      <span>📂</span>
                      Source Code
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProject ? 'Edit Project' : 'Add New Project'}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <Input
            label="Project Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter project title"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your project, its purpose, and key features"
            rows={4}
            required
          />

          <Input
            label="Tech Stack"
            value={formData.techStack.join(', ')}
            onChange={(e) => handleTechStackChange(e.target.value)}
            placeholder="React, Node.js, MongoDB, etc. (separate with commas)"
            helperText="Enter technologies separated by commas"
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
              helperText="Leave empty if project is ongoing"
            />
          </FormGroup>

          <FormGroup columns={2}>
            <Input
              label="Project Link"
              type="url"
              value={formData.projectLink}
              onChange={(e) => handleInputChange('projectLink', e.target.value)}
              placeholder="https://your-project.com"
            />

            <Input
              label="GitHub Repository"
              type="url"
              value={formData.githubRepo}
              onChange={(e) => handleInputChange('githubRepo', e.target.value)}
              placeholder="https://github.com/yourusername/project"
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
              {saving ? 'Saving...' : editingProject ? 'Update Project' : 'Add Project'}
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </div>
  )
}

Projects.displayName = 'Projects'