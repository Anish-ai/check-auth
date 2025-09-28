// User Profile Types
export interface UserProfile {
  userId: string
  name: string
  email: string
  phone?: string
  portfolioWebsite?: string
  githubLink?: string
  linkedinLink?: string
  photoURL?: string
  createdAt: Date
  updatedAt: Date
}

// Projects Types
export interface Project {
  projectId?: string
  userId: string
  title: string
  description: string
  techStack: string[]
  projectLink?: string
  githubRepo?: string
  startDate: Date
  endDate?: Date
}

// Education Types
export interface Education {
  eduId?: string
  userId: string
  institute: string
  degree: string
  branch?: string
  startYear: number
  endYear?: number
  cgpaOrPercentage?: string
}

// Courses Types
export interface Course {
  courseId?: string
  userId: string
  title: string
  provider: string
  certificateLink?: string
  completionDate: Date
}

// Achievements Types
export interface Achievement {
  achievementId?: string
  userId: string
  title: string
  description: string
  date: Date
}

// Skills Types
export interface Skill {
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
}

export interface SkillCategory {
  skillId?: string
  userId: string
  category: string
  skills: Skill[]
}

// Positions of Responsibility Types
export interface Position {
  posId?: string
  userId: string
  title: string
  organization: string
  description: string
  startDate: Date
  endDate?: Date
}

// Certifications Types
export interface Certification {
  certId?: string
  userId: string
  title: string
  issuer: string
  issueDate: Date
  certificateLink?: string
}

// Form data types (without readonly fields)
export type UserProfileFormData = Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt'>
export type ProjectFormData = Omit<Project, 'projectId' | 'userId'>
export type EducationFormData = Omit<Education, 'eduId' | 'userId'>
export type CourseFormData = Omit<Course, 'courseId' | 'userId'>
export type AchievementFormData = Omit<Achievement, 'achievementId' | 'userId'>
export type SkillCategoryFormData = Omit<SkillCategory, 'skillId' | 'userId'>
export type PositionFormData = Omit<Position, 'posId' | 'userId'>
export type CertificationFormData = Omit<Certification, 'certId' | 'userId'>