import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Card, 
  CardHeader,
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
import { skillsService } from '../services/portfolioService'
import type { SkillCategory, SkillCategoryFormData, Skill } from '../types/portfolio'
import { theme } from '../styles/theme'

export const Skills = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<SkillCategoryFormData>({
    category: '',
    skills: [],
  })
  const [newSkill, setNewSkill] = useState<Skill>({ name: '', level: 'Beginner' })

  const skillLevelOptions = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' },
  ]

  const predefinedCategories = [
    'Programming Languages',
    'Web Development',
    'Mobile Development',
    'Database Technologies',
    'Cloud & DevOps',
    'AI & Machine Learning',
    'Data Science',
    'Software Tools',
    'Frameworks & Libraries',
    'Operating Systems',
    'Version Control',
    'Testing',
    'Design & UI/UX',
    'Project Management',
    'Other'
  ]

  useEffect(() => {
    if (user?.uid) {
      fetchSkillCategories()
    }
  }, [user])

  const fetchSkillCategories = async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      const userSkills = await skillsService.getAll(user.uid)
      setSkillCategories(userSkills)
    } catch (error) {
      console.error('Error fetching skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      category: '',
      skills: [],
    })
    setNewSkill({ name: '', level: 'Beginner' })
    setEditingCategory(null)
  }

  const openModal = (category?: SkillCategory) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        category: category.category,
        skills: [...category.skills],
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

  const handleInputChange = (field: keyof SkillCategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (newSkill.name.trim() === '') return
    
    const skillExists = formData.skills.some(skill => 
      skill.name.toLowerCase() === newSkill.name.toLowerCase()
    )
    
    if (skillExists) {
      alert('This skill already exists in the category')
      return
    }

    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { ...newSkill }]
    }))
    setNewSkill({ name: '', level: 'Beginner' })
  }

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid) return

    if (formData.skills.length === 0) {
      alert('Please add at least one skill to the category')
      return
    }
    
    try {
      setSaving(true)
      
      if (editingCategory?.skillId) {
        await skillsService.update(editingCategory.skillId, formData)
      } else {
        await skillsService.create(user.uid, formData)
      }
      
      await fetchSkillCategories()
      closeModal()
    } catch (error) {
      console.error('Error saving skill category:', error)
      alert('Failed to save skill category. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (skillId: string) => {
    if (!confirm('Are you sure you want to delete this skill category?')) return
    
    try {
      await skillsService.delete(skillId)
      await fetchSkillCategories()
    } catch (error) {
      console.error('Error deleting skill category:', error)
      alert('Failed to delete skill category. Please try again.')
    }
  }

  const getSkillLevelColor = (level: Skill['level']) => {
    switch (level) {
      case 'Beginner':
        return { bg: theme.colors.gray[100], text: theme.colors.gray[700] }
      case 'Intermediate':
        return { bg: theme.colors.primary[100], text: theme.colors.primary[700] }
      case 'Advanced':
        return { bg: theme.colors.warning[100], text: theme.colors.warning[700] }
      case 'Expert':
        return { bg: theme.colors.success[100], text: theme.colors.success[700] }
      default:
        return { bg: theme.colors.gray[100], text: theme.colors.gray[700] }
    }
  }

  const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase()
    if (lowerCategory.includes('programming') || lowerCategory.includes('languages')) return '💻'
    if (lowerCategory.includes('web')) return '🌐'
    if (lowerCategory.includes('mobile')) return '📱'
    if (lowerCategory.includes('database')) return '💾'
    if (lowerCategory.includes('cloud') || lowerCategory.includes('devops')) return '☁️'
    if (lowerCategory.includes('ai') || lowerCategory.includes('machine')) return '🤖'
    if (lowerCategory.includes('data')) return '📊'
    if (lowerCategory.includes('design') || lowerCategory.includes('ui')) return '🎨'
    if (lowerCategory.includes('testing')) return '🧪'
    if (lowerCategory.includes('tools')) return '🔧'
    return '⚡'
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
            Skills
          </h1>
          <p style={{ 
            margin: 0,
            marginTop: theme.spacing[1],
            color: theme.colors.text.secondary 
          }}>
            Organize your technical and professional skills by categories
          </p>
        </div>
        <Button onClick={() => openModal()}>
          + Add Skill Category
        </Button>
      </div>

      {/* Skills Grid */}
      {skillCategories.length === 0 ? (
        <Card>
          <CardContent>
            <div style={{ 
              textAlign: 'center', 
              padding: theme.spacing[12] 
            }}>
              <div style={{ fontSize: '64px', marginBottom: theme.spacing[4] }}>⚡</div>
              <h3 style={{ 
                margin: 0,
                marginBottom: theme.spacing[2],
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.text.primary
              }}>
                No skills yet
              </h3>
              <p style={{ 
                margin: 0,
                marginBottom: theme.spacing[6],
                color: theme.colors.text.secondary
              }}>
                Create skill categories and add your technical and professional skills
              </p>
              <Button onClick={() => openModal()}>
                Add Your First Skill Category
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div style={{ 
          display: 'grid', 
          gap: theme.spacing[6],
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
        }}>
          {skillCategories.map((category) => (
            <Card key={category.skillId}>
              <CardHeader>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[3] }}>
                    <span style={{ fontSize: '24px' }}>{getCategoryIcon(category.category)}</span>
                    <h3 style={{ 
                      margin: 0,
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text.primary
                    }}>
                      {category.category}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: theme.spacing[1] }}>
                    <IconButton
                      onClick={() => openModal(category)}
                      variant="ghost"
                      size="sm"
                      tooltip="Edit category"
                    >
                      ✏️
                    </IconButton>
                    <IconButton
                      onClick={() => category.skillId && handleDelete(category.skillId)}
                      variant="ghost"
                      size="sm"
                      tooltip="Delete category"
                    >
                      🗑️
                    </IconButton>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: theme.spacing[3] 
                }}>
                  {category.skills.map((skill, index) => {
                    const levelColor = getSkillLevelColor(skill.level)
                    return (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: theme.spacing[3],
                          backgroundColor: theme.colors.background.secondary,
                          borderRadius: theme.borderRadius.lg,
                          border: `1px solid ${theme.colors.border.light}`,
                          minWidth: '120px',
                          textAlign: 'center',
                        }}
                      >
                        <span style={{
                          fontSize: theme.typography.fontSize.sm,
                          fontWeight: theme.typography.fontWeight.medium,
                          color: theme.colors.text.primary,
                          marginBottom: theme.spacing[2],
                        }}>
                          {skill.name}
                        </span>
                        <span
                          style={{
                            padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                            backgroundColor: levelColor.bg,
                            color: levelColor.text,
                            borderRadius: theme.borderRadius.md,
                            fontSize: theme.typography.fontSize.xs,
                            fontWeight: theme.typography.fontWeight.medium,
                          }}
                        >
                          {skill.level}
                        </span>
                      </div>
                    )
                  })}
                </div>
                
                <div style={{ 
                  marginTop: theme.spacing[4],
                  padding: theme.spacing[3],
                  backgroundColor: theme.colors.gray[50],
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  textAlign: 'center'
                }}>
                  {category.skills.length} skill{category.skills.length !== 1 ? 's' : ''} in this category
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Skill Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCategory ? 'Edit Skill Category' : 'Add Skill Category'}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <Select
            label="Category Name"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            options={[
              ...predefinedCategories.map(cat => ({ value: cat, label: cat })),
            ]}
            placeholder="Select or enter category name"
            required
          />

          <div>
            <label style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[2],
              display: 'block',
            }}>
              Add Skills
            </label>
            
            <FormGroup columns={2}>
              <Input
                value={newSkill.name}
                onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter skill name"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSkill()
                  }
                }}
              />
              
              <div style={{ display: 'flex', gap: theme.spacing[2] }}>
                <Select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, level: e.target.value as Skill['level'] }))}
                  options={skillLevelOptions}
                  placeholder="Level"
                />
                <Button
                  type="button"
                  onClick={addSkill}
                  disabled={!newSkill.name.trim()}
                  style={{ flexShrink: 0 }}
                >
                  Add
                </Button>
              </div>
            </FormGroup>
          </div>

          {/* Skills List */}
          {formData.skills.length > 0 && (
            <div>
              <label style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[3],
                display: 'block',
              }}>
                Skills in this category ({formData.skills.length})
              </label>
              
              <div style={{ 
                maxHeight: '200px',
                overflowY: 'auto',
                border: `1px solid ${theme.colors.border.light}`,
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing[3],
                backgroundColor: theme.colors.background.secondary,
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing[2] }}>
                  {formData.skills.map((skill, index) => {
                    const levelColor = getSkillLevelColor(skill.level)
                    return (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme.spacing[2],
                          padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                          backgroundColor: theme.colors.background.primary,
                          borderRadius: theme.borderRadius.md,
                          border: `1px solid ${theme.colors.border.light}`,
                        }}
                      >
                        <span style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.text.primary,
                        }}>
                          {skill.name}
                        </span>
                        <span
                          style={{
                            padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                            backgroundColor: levelColor.bg,
                            color: levelColor.text,
                            borderRadius: theme.borderRadius.sm,
                            fontSize: theme.typography.fontSize.xs,
                            fontWeight: theme.typography.fontWeight.medium,
                          }}
                        >
                          {skill.level}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: theme.colors.error[500],
                            fontSize: theme.typography.fontSize.sm,
                            padding: theme.spacing[1],
                            borderRadius: theme.borderRadius.sm,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

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
              disabled={saving || formData.skills.length === 0}
            >
              {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </div>
  )
}

Skills.displayName = 'Skills'