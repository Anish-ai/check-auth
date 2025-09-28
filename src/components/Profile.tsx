import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  Input, 
  Form, 
  FormGroup, 
  FormActions, 
  FileUpload,
  LoadingSpinner 
} from './ui'
import { profileService, fileService } from '../services/portfolioService'
import type { UserProfile, UserProfileFormData } from '../types/portfolio'
import { theme } from '../styles/theme'

export const Profile = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<UserProfileFormData>({
    name: '',
    email: '',
    phone: '',
    portfolioWebsite: '',
    githubLink: '',
    linkedinLink: '',
    photoURL: '',
  })

  useEffect(() => {
    if (user?.uid) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      const userProfile = await profileService.get(user.uid)
      
      if (userProfile) {
        setProfile(userProfile)
        setFormData({
          name: userProfile.name || '',
          email: userProfile.email || user.email || '',
          phone: userProfile.phone || '',
          portfolioWebsite: userProfile.portfolioWebsite || '',
          githubLink: userProfile.githubLink || '',
          linkedinLink: userProfile.linkedinLink || '',
          photoURL: userProfile.photoURL || '',
        })
      } else {
        // Initialize with user data from auth
        setFormData(prev => ({
          ...prev,
          name: user.displayName || '',
          email: user.email || '',
        }))
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user?.uid) return
    
    try {
      setUploadingPhoto(true)
      const file = files[0]
      const photoURL = await fileService.uploadProfilePhoto(user.uid, file)
      
      setFormData(prev => ({ ...prev, photoURL }))
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid) return
    
    try {
      setSaving(true)
      
      if (profile) {
        await profileService.update(user.uid, formData)
      } else {
        await profileService.create(user.uid, formData)
      }
      
      // Refresh profile data
      await fetchProfile()
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
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

  const profilePhotoSection = (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: theme.spacing[4],
      marginBottom: theme.spacing[6]
    }}>
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: `4px solid ${theme.colors.border.light}`,
        backgroundColor: theme.colors.gray[100],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.primary[600],
      }}>
        {formData.photoURL ? (
          <img 
            src={formData.photoURL} 
            alt="Profile" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          (formData.name?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?').toUpperCase()
        )}
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ 
          margin: 0,
          marginBottom: theme.spacing[1],
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary
        }}>
          {formData.name || user?.displayName || 'Your Name'}
        </h2>
        <p style={{
          margin: 0,
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary
        }}>
          {formData.email || user?.email}
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'grid', gap: theme.spacing[6], maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <CardHeader>
          <h1 style={{ margin: 0 }}>Profile Information</h1>
          <p style={{ margin: 0, color: theme.colors.text.secondary }}>
            Update your personal information and social media links
          </p>
        </CardHeader>
        <CardContent>
          {profilePhotoSection}
          
          <Form onSubmit={handleSubmit}>
            <FileUpload
              label="Profile Photo"
              accept="image/*"
              onFileSelect={handlePhotoUpload}
              isLoading={uploadingPhoto}
              previewUrl={formData.photoURL}
            />

            <FormGroup columns={2}>
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
              
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                required
              />
            </FormGroup>

            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
            />

            <FormGroup>
              <Input
                label="Portfolio Website"
                type="url"
                value={formData.portfolioWebsite}
                onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
                placeholder="https://yourportfolio.com"
              />
            </FormGroup>

            <FormGroup columns={2}>
              <Input
                label="GitHub Profile"
                type="url"
                value={formData.githubLink}
                onChange={(e) => handleInputChange('githubLink', e.target.value)}
                placeholder="https://github.com/yourusername"
              />
              
              <Input
                label="LinkedIn Profile"
                type="url"
                value={formData.linkedinLink}
                onChange={(e) => handleInputChange('linkedinLink', e.target.value)}
                placeholder="https://linkedin.com/in/yourusername"
              />
            </FormGroup>

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={fetchProfile}
                disabled={saving}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </FormActions>
          </Form>
        </CardContent>
      </Card>

      {/* Profile Preview */}
      {(formData.name || formData.githubLink || formData.linkedinLink || formData.portfolioWebsite) && (
        <Card>
          <CardHeader>
            <h2 style={{ margin: 0 }}>Profile Preview</h2>
            <p style={{ margin: 0, color: theme.colors.text.secondary }}>
              This is how your profile will appear to others
            </p>
          </CardHeader>
          <CardContent>
            <div style={{ 
              padding: theme.spacing[6],
              backgroundColor: theme.colors.gray[50],
              borderRadius: theme.borderRadius.lg,
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: `2px solid ${theme.colors.border.light}`,
                backgroundColor: theme.colors.gray[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.primary[600],
                margin: '0 auto',
                marginBottom: theme.spacing[4]
              }}>
                {formData.photoURL ? (
                  <img 
                    src={formData.photoURL} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  (formData.name?.charAt(0) || '?').toUpperCase()
                )}
              </div>
              
              <h3 style={{ 
                margin: 0,
                marginBottom: theme.spacing[2],
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary
              }}>
                {formData.name || 'Your Name'}
              </h3>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: theme.spacing[4],
                flexWrap: 'wrap'
              }}>
                {formData.githubLink && (
                  <a 
                    href={formData.githubLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: theme.colors.primary[600], 
                      textDecoration: 'none',
                      fontSize: theme.typography.fontSize.sm
                    }}
                  >
                    🔗 GitHub
                  </a>
                )}
                {formData.linkedinLink && (
                  <a 
                    href={formData.linkedinLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: theme.colors.primary[600], 
                      textDecoration: 'none',
                      fontSize: theme.typography.fontSize.sm
                    }}
                  >
                    🔗 LinkedIn
                  </a>
                )}
                {formData.portfolioWebsite && (
                  <a 
                    href={formData.portfolioWebsite} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: theme.colors.primary[600], 
                      textDecoration: 'none',
                      fontSize: theme.typography.fontSize.sm
                    }}
                  >
                    🔗 Portfolio
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

Profile.displayName = 'Profile'