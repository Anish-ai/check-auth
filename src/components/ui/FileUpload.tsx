import { useState, useRef, type ChangeEvent } from 'react'
import { theme } from '../../styles/theme'
import { LoadingSpinner } from './LoadingSpinner'

interface FileUploadProps {
  label?: string
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  onFileSelect: (files: FileList | null) => void
  isLoading?: boolean
  error?: string
  previewUrl?: string
  disabled?: boolean
}

export const FileUpload = ({
  label,
  accept = 'image/*',
  multiple = false,
  maxSize = 5, // 5MB default
  onFileSelect,
  isLoading = false,
  error,
  previewUrl,
  disabled = false,
}: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled || isLoading) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files: FileList) => {
    // Validate file size
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxSize * 1024 * 1024) {
        alert(`File ${files[i].name} is too large. Maximum size is ${maxSize}MB.`)
        return
      }
    }
    onFileSelect(files)
  }

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing[2],
  }

  const labelStyles = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: error ? theme.colors.error[600] : theme.colors.text.primary,
  }

  const uploadAreaStyles = {
    border: `2px dashed ${
      dragActive 
        ? theme.colors.primary[400] 
        : error 
          ? theme.colors.error[300] 
          : theme.colors.border.medium
    }`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[8],
    textAlign: 'center' as const,
    backgroundColor: dragActive 
      ? `${theme.colors.primary[50]}` 
      : theme.colors.gray[50],
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
  }

  const previewStyles = {
    width: '120px',
    height: '120px',
    objectFit: 'cover' as const,
    borderRadius: theme.borderRadius.lg,
    border: `2px solid ${theme.colors.border.light}`,
    margin: '0 auto',
    display: 'block',
  }

  const errorStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error[600],
  }

  return (
    <div style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      
      <div
        style={uploadAreaStyles}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !isLoading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          style={{ display: 'none' }}
          disabled={disabled || isLoading}
        />

        {isLoading ? (
          <div>
            <LoadingSpinner size="md" />
            <p style={{ marginTop: theme.spacing[2], color: theme.colors.text.secondary }}>
              Uploading...
            </p>
          </div>
        ) : previewUrl ? (
          <div>
            <img src={previewUrl} alt="Preview" style={previewStyles} />
            <p style={{ marginTop: theme.spacing[2], fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
              Click to change photo
            </p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '48px', marginBottom: theme.spacing[2] }}>📁</div>
            <p style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.text.primary, marginBottom: theme.spacing[1] }}>
              {dragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
              {accept.includes('image') ? 'PNG, JPG, GIF up to' : 'Files up to'} {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {error && <p style={errorStyles}>{error}</p>}
    </div>
  )
}

FileUpload.displayName = 'FileUpload'