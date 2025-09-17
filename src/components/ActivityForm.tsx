import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { theme } from '../styles/theme'
import { Card, CardContent, Button, Input, Textarea, Select } from './ui'

interface ActivityFormData {
  title: string
  type: string
  description: string
  startDate: string
  endDate: string
  evidence: File | null
}

const ACTIVITY_TYPES = [
  'Academic Achievement',
  'Club/Society Position',
  'Sports Achievement',
  'Cultural Event',
  'Technical Project',
  'Internship',
  'Research Paper',
  'Competition',
  'Volunteer Work',
  'Other'
]

export function ActivityForm() {
  const { userProfile } = useAuth()
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    type: '',
    description: '',
    startDate: '',
    endDate: '',
    evidence: null
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, evidence: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile?.uid) return

    setSubmitting(true)
    try {
      // For now, we'll just store the file name. In a real app, you'd upload to Firebase Storage
      const activityData = {
        userId: userProfile.uid,
        title: formData.title,
        type: formData.type,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        evidenceFileName: formData.evidence?.name || null,
        status: 'pending',
        createdAt: serverTimestamp(),
        submittedAt: serverTimestamp()
      }

      await addDoc(collection(db, 'activities'), activityData)
      
      setSubmitted(true)
      setFormData({
        title: '',
        type: '',
        description: '',
        startDate: '',
        endDate: '',
        evidence: null
      })
    } catch (error) {
      console.error('Error submitting activity:', error)
      alert('Failed to submit activity. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card variant="elevated" padding="lg">
        <CardContent>
          <div style={{ textAlign: 'center', padding: theme.spacing[8] }}>
            <div style={{ 
              fontSize: '4rem', 
              marginBottom: theme.spacing[4],
              color: theme.colors.success[600],
            }}>
              ✅
            </div>
            <h2 style={{ 
              color: theme.colors.success[600], 
              marginBottom: theme.spacing[4],
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
            }}>
              Activity Submitted Successfully!
            </h2>
            <p style={{ 
              color: theme.colors.text.secondary, 
              marginBottom: theme.spacing[8],
              fontSize: theme.typography.fontSize.lg,
              lineHeight: theme.typography.lineHeight.relaxed,
            }}>
              Your activity has been submitted for verification. You'll be notified once it's reviewed by the appropriate authority.
            </p>
            <Button 
              onClick={() => setSubmitted(false)}
              variant="primary"
              size="lg"
            >
              Submit Another Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    )
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
          Submit Activity
        </h1>
        <p style={{ 
          margin: 0, 
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.text.secondary,
        }}>
          Submit your academic activities, achievements, and positions of responsibility for verification.
        </p>
      </div>
      
      <div style={{ maxWidth: '800px' }}>
        <Card variant="elevated" padding="lg">
          <CardContent>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[6] }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing[6] }}>
              <Input
                label="Activity Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., President of Coding Club"
                fullWidth
              />

              <Select
                label="Activity Type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                placeholder="Select activity type"
                options={ACTIVITY_TYPES.map(type => ({ value: type, label: type }))}
                fullWidth
              />
            </div>

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Describe your role, responsibilities, and achievements..."
              fullWidth
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing[6] }}>
              <Input
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                fullWidth
              />
              
              <Input
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                fullWidth
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing[2],
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
              }}>
                Supporting Evidence (Optional)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                style={{
                  width: '100%',
                  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                  fontSize: theme.typography.fontSize.base,
                  fontFamily: theme.typography.fontFamily.sans.join(', '),
                  border: `1px solid ${theme.colors.border.medium}`,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.colors.background.primary,
                  cursor: 'pointer',
                }}
              />
              <div style={{ 
                fontSize: theme.typography.fontSize.sm, 
                color: theme.colors.text.secondary, 
                marginTop: theme.spacing[1],
              }}>
                Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: theme.spacing[4],
              paddingTop: theme.spacing[4],
              borderTop: `1px solid ${theme.colors.border.light}`,
            }}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                fullWidth
              >
                {submitting ? 'Submitting...' : 'Submit Activity'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setFormData({
                  title: '',
                  type: '',
                  description: '',
                  startDate: '',
                  endDate: '',
                  evidence: null
                })}
              >
                Clear Form
              </Button>
            </div>
            </form>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}