import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Card, 
  CardContent,
  Button, 
  Input, 
  Form, 
  FormGroup,
  FormActions,
  Modal,
  IconButton,
  LoadingSpinner 
} from './ui'
import { certificationsService } from '../services/portfolioService'
import type { Certification, CertificationFormData } from '../types/portfolio'
import { theme } from '../styles/theme'

export const Certifications = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<CertificationFormData>({
    title: '',
    issuer: '',
    issueDate: new Date(),
    certificateLink: '',
  })

  useEffect(() => {
    if (user?.uid) {
      fetchCertifications()
    }
  }, [user])

  const fetchCertifications = async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      const userCertifications = await certificationsService.getAll(user.uid)
      setCertifications(userCertifications)
    } catch (error) {
      console.error('Error fetching certifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      issuer: '',
      issueDate: new Date(),
      certificateLink: '',
    })
    setEditingCertification(null)
  }

  const openModal = (certification?: Certification) => {
    if (certification) {
      setEditingCertification(certification)
      setFormData({
        title: certification.title,
        issuer: certification.issuer,
        issueDate: certification.issueDate,
        certificateLink: certification.certificateLink || '',
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

  const handleInputChange = (field: keyof CertificationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid) return
    
    try {
      setSaving(true)
      
      if (editingCertification?.certId) {
        await certificationsService.update(editingCertification.certId, formData)
      } else {
        await certificationsService.create(user.uid, formData)
      }
      
      await fetchCertifications()
      closeModal()
    } catch (error) {
      console.error('Error saving certification:', error)
      alert('Failed to save certification. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (certId: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return
    
    try {
      await certificationsService.delete(certId)
      await fetchCertifications()
    } catch (error) {
      console.error('Error deleting certification:', error)
      alert('Failed to delete certification. Please try again.')
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }).format(date)
  }

  const getCertificationIcon = (issuer: string, title: string) => {
    const lowerIssuer = issuer.toLowerCase()
    const lowerTitle = title.toLowerCase()
    
    if (lowerIssuer.includes('google') || lowerTitle.includes('google')) return '🔍'
    if (lowerIssuer.includes('microsoft') || lowerTitle.includes('azure') || lowerTitle.includes('microsoft')) return '🪟'
    if (lowerIssuer.includes('amazon') || lowerTitle.includes('aws')) return '☁️'
    if (lowerIssuer.includes('oracle') || lowerTitle.includes('oracle')) return '🔴'
    if (lowerIssuer.includes('cisco') || lowerTitle.includes('cisco')) return '🌐'
    if (lowerIssuer.includes('comptia') || lowerTitle.includes('comptia')) return '🔒'
    if (lowerTitle.includes('python') || lowerTitle.includes('java') || lowerTitle.includes('programming')) return '💻'
    if (lowerTitle.includes('data') || lowerTitle.includes('analytics')) return '📊'
    if (lowerTitle.includes('security') || lowerTitle.includes('cyber')) return '🛡️'
    if (lowerTitle.includes('project') || lowerTitle.includes('management')) return '📋'
    if (lowerTitle.includes('design') || lowerTitle.includes('ui/ux')) return '🎨'
    return '📜'
  }

  const getValidityStatus = (issueDate: Date) => {
    const now = new Date()
    const monthsSinceIssue = (now.getFullYear() - issueDate.getFullYear()) * 12 + now.getMonth() - issueDate.getMonth()
    
    if (monthsSinceIssue < 12) return { status: 'New', color: theme.colors.success[600], bg: theme.colors.success[100] }
    if (monthsSinceIssue < 36) return { status: 'Valid', color: theme.colors.primary[600], bg: theme.colors.primary[100] }
    return { status: 'Older', color: theme.colors.gray[600], bg: theme.colors.gray[100] }
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
            Certifications
          </h1>
          <p style={{ 
            margin: 0,
            marginTop: theme.spacing[1],
            color: theme.colors.text.secondary 
          }}>
            Showcase your professional certifications and credentials
          </p>
        </div>
        <Button onClick={() => openModal()}>
          + Add Certification
        </Button>
      </div>

      {/* Certifications Grid */}
      {certifications.length === 0 ? (
        <Card>
          <CardContent>
            <div style={{ 
              textAlign: 'center', 
              padding: theme.spacing[12] 
            }}>
              <div style={{ fontSize: '64px', marginBottom: theme.spacing[4] }}>📜</div>
              <h3 style={{ 
                margin: 0,
                marginBottom: theme.spacing[2],
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.text.primary
              }}>
                No certifications yet
              </h3>
              <p style={{ 
                margin: 0,
                marginBottom: theme.spacing[6],
                color: theme.colors.text.secondary
              }}>
                Add your professional certifications to validate your expertise
              </p>
              <Button onClick={() => openModal()}>
                Add Your First Certification
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div style={{ 
          display: 'grid', 
          gap: theme.spacing[4],
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))'
        }}>
          {certifications.map((certification) => {
            const validity = getValidityStatus(certification.issueDate)
            return (
              <Card key={certification.certId}>
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
                      backgroundColor: theme.colors.error[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0,
                    }}>
                      {getCertificationIcon(certification.issuer, certification.title)}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: theme.spacing[3]
                      }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            margin: 0,
                            fontSize: theme.typography.fontSize.base,
                            fontWeight: theme.typography.fontWeight.semibold,
                            color: theme.colors.text.primary,
                            lineHeight: theme.typography.lineHeight.tight,
                            marginBottom: theme.spacing[1]
                          }}>
                            {certification.title}
                          </h3>
                          <p style={{ 
                            margin: 0,
                            fontSize: theme.typography.fontSize.sm,
                            color: theme.colors.text.secondary,
                            fontWeight: theme.typography.fontWeight.medium,
                            marginBottom: theme.spacing[2]
                          }}>
                            {certification.issuer}
                          </p>
                          
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: theme.spacing[2]
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: theme.spacing[2],
                              fontSize: theme.typography.fontSize.sm,
                              color: theme.colors.text.secondary
                            }}>
                              <span>📅</span>
                              <span>Issued {formatDate(certification.issueDate)}</span>
                            </div>
                            
                            <span
                              style={{
                                padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                                backgroundColor: validity.bg,
                                color: validity.color,
                                borderRadius: theme.borderRadius.md,
                                fontSize: theme.typography.fontSize.xs,
                                fontWeight: theme.typography.fontWeight.medium,
                              }}
                            >
                              {validity.status}
                            </span>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: theme.spacing[1], marginLeft: theme.spacing[2] }}>
                          <IconButton
                            onClick={() => openModal(certification)}
                            variant="ghost"
                            size="sm"
                            tooltip="Edit certification"
                          >
                            ✏️
                          </IconButton>
                          <IconButton
                            onClick={() => certification.certId && handleDelete(certification.certId)}
                            variant="ghost"
                            size="sm"
                            tooltip="Delete certification"
                          >
                            🗑️
                          </IconButton>
                        </div>
                      </div>
                      
                      {certification.certificateLink && (
                        <div style={{ marginTop: theme.spacing[3] }}>
                          <a
                            href={certification.certificateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: theme.spacing[2],
                              padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                              backgroundColor: theme.colors.primary[50],
                              color: theme.colors.primary[600],
                              textDecoration: 'none',
                              borderRadius: theme.borderRadius.md,
                              fontSize: theme.typography.fontSize.sm,
                              fontWeight: theme.typography.fontWeight.medium,
                              transition: 'all 0.2s ease',
                              border: `1px solid ${theme.colors.primary[200]}`,
                              width: 'fit-content',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.colors.primary[100]
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = theme.colors.primary[50]
                            }}
                          >
                            <span>📄</span>
                            View Certificate
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add/Edit Certification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCertification ? 'Edit Certification' : 'Add Certification'}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <Input
            label="Certification Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., AWS Solutions Architect, Google Cloud Professional"
            required
          />

          <Input
            label="Issuing Organization"
            value={formData.issuer}
            onChange={(e) => handleInputChange('issuer', e.target.value)}
            placeholder="e.g., Amazon Web Services, Google, Microsoft, Oracle"
            required
          />

          <FormGroup columns={2}>
            <Input
              label="Issue Date"
              type="date"
              value={formData.issueDate.toISOString().split('T')[0]}
              onChange={(e) => handleInputChange('issueDate', new Date(e.target.value))}
              required
            />

            <Input
              label="Certificate Link"
              type="url"
              value={formData.certificateLink}
              onChange={(e) => handleInputChange('certificateLink', e.target.value)}
              placeholder="https://certificate-url.com"
              helperText="Optional: Link to verify certification"
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
              {saving ? 'Saving...' : editingCertification ? 'Update Certification' : 'Add Certification'}
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </div>
  )
}

Certifications.displayName = 'Certifications'