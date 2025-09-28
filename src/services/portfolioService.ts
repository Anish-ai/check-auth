import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  setDoc,
  Timestamp 
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
import { COLLECTIONS, ensureCollectionExists, validateDocumentStructure } from './collectionManager'
import type { 
  UserProfile, 
  Project, 
  Education, 
  Course, 
  Achievement, 
  SkillCategory, 
  Position, 
  Certification,
  UserProfileFormData,
  ProjectFormData,
  EducationFormData,
  CourseFormData,
  AchievementFormData,
  SkillCategoryFormData,
  PositionFormData,
  CertificationFormData
} from '../types/portfolio'

// Helper function to handle Firebase errors
const handleFirebaseError = (error: any, operation: string) => {
  console.error(`Firebase error during ${operation}:`, error)
  
  if (error?.code === 'permission-denied') {
    throw new Error(`Permission denied. Please ensure Firestore security rules are deployed. See FIREBASE_SETUP.md for instructions.`)
  } else if (error?.code === 'unavailable') {
    throw new Error(`Firebase is currently unavailable. Please check your internet connection.`)
  } else if (error?.code === 'not-found') {
    throw new Error(`The requested resource was not found.`)
  }
  
  throw new Error(`Operation failed: ${error?.message || 'Unknown error'}`)
}

// Helper function to clean data for Firestore (convert undefined to null)
const cleanDataForFirestore = (data: any): any => {
  const cleaned = { ...data }
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined) {
      cleaned[key] = null
    }
  })
  return cleaned
}

// Helper function to convert Firestore timestamps to Date objects
const convertTimestamps = (data: any) => {
  const converted = { ...data }
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate()
    }
  })
  return converted
}

// User Profile Services
export const profileService = {
  async create(userId: string, data: UserProfileFormData): Promise<void> {
    try {
      await ensureCollectionExists('PROFILES')
      
      const profileData = {
        ...data,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Validate structure before saving
      if (!validateDocumentStructure('profiles', profileData)) {
        console.warn('Profile data structure validation failed')
      }
      
      const profileRef = doc(db, COLLECTIONS.PROFILES, userId)
      await updateDoc(profileRef, profileData).catch(async () => {
        // If document doesn't exist, create it
        await setDoc(profileRef, profileData)
      })
    } catch (error) {
      handleFirebaseError(error, 'profile creation')
    }
  },

  async get(userId: string): Promise<UserProfile | null> {
    try {
      await ensureCollectionExists('PROFILES')
      
      const profileRef = doc(db, COLLECTIONS.PROFILES, userId)
      const profileSnap = await getDoc(profileRef)
      
      if (profileSnap.exists()) {
        return convertTimestamps({ ...profileSnap.data(), userId }) as UserProfile
      }
      return null
    } catch (error) {
      handleFirebaseError(error, 'profile fetch')
      return null // This line will never be reached due to handleFirebaseError throwing
    }
  },

  async update(userId: string, data: Partial<UserProfileFormData>): Promise<void> {
    try {
      await ensureCollectionExists('PROFILES')
      
      const profileRef = doc(db, COLLECTIONS.PROFILES, userId)
      await updateDoc(profileRef, {
        ...data,
        updatedAt: new Date()
      })
    } catch (error) {
      handleFirebaseError(error, 'profile update')
    }
  }
}

// File Upload Service
export const fileService = {
  async uploadProfilePhoto(userId: string, file: File): Promise<string> {
    const fileRef = ref(storage, `profiles/${userId}/photo`)
    await uploadBytes(fileRef, file)
    return await getDownloadURL(fileRef)
  },

  async deleteProfilePhoto(userId: string): Promise<void> {
    const fileRef = ref(storage, `profiles/${userId}/photo`)
    await deleteObject(fileRef).catch(() => {
      // Ignore if file doesn't exist
    })
  }
}

// Projects Services
export const projectsService = {
  async create(userId: string, data: ProjectFormData): Promise<string> {
    await ensureCollectionExists('PROJECTS')
    
    const projectData = cleanDataForFirestore({ ...data, userId })
    
    if (!validateDocumentStructure('projects', projectData)) {
      console.warn('Project data structure validation failed')
    }
    
    const projectsRef = collection(db, COLLECTIONS.PROJECTS)
    const docRef = await addDoc(projectsRef, projectData)
    return docRef.id
  },

  async getAll(userId: string): Promise<Project[]> {
    await ensureCollectionExists('PROJECTS')
    
    const projectsRef = collection(db, COLLECTIONS.PROJECTS)
    const q = query(projectsRef, where('userId', '==', userId), orderBy('startDate', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => convertTimestamps({
      projectId: doc.id,
      ...doc.data()
    })) as Project[]
  },

  async update(projectId: string, data: ProjectFormData): Promise<void> {
    await ensureCollectionExists('PROJECTS')
    
    const cleanedData = cleanDataForFirestore(data)
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId)
    await updateDoc(projectRef, cleanedData)
  },

  async delete(projectId: string): Promise<void> {
    await ensureCollectionExists('PROJECTS')
    
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId)
    await deleteDoc(projectRef)
  }
}

// Education Services
export const educationService = {
  async create(userId: string, data: EducationFormData): Promise<string> {
    await ensureCollectionExists('EDUCATION')
    
    const educationData = cleanDataForFirestore({ ...data, userId })
    
    if (!validateDocumentStructure('education', educationData)) {
      console.warn('Education data structure validation failed')
    }
    
    const educationRef = collection(db, COLLECTIONS.EDUCATION)
    const docRef = await addDoc(educationRef, educationData)
    return docRef.id
  },

  async getAll(userId: string): Promise<Education[]> {
    await ensureCollectionExists('EDUCATION')
    
    const educationRef = collection(db, COLLECTIONS.EDUCATION)
    const q = query(educationRef, where('userId', '==', userId), orderBy('startYear', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      eduId: doc.id,
      ...doc.data()
    })) as Education[]
  },

  async update(eduId: string, data: EducationFormData): Promise<void> {
    await ensureCollectionExists('EDUCATION')
    
    const educationRef = doc(db, COLLECTIONS.EDUCATION, eduId)
    await updateDoc(educationRef, data)
  },

  async delete(eduId: string): Promise<void> {
    await ensureCollectionExists('EDUCATION')
    
    const educationRef = doc(db, COLLECTIONS.EDUCATION, eduId)
    await deleteDoc(educationRef)
  }
}

// Courses Services
export const coursesService = {
  async create(userId: string, data: CourseFormData): Promise<string> {
    await ensureCollectionExists('COURSES')
    
    const courseData = { ...data, userId }
    
    if (!validateDocumentStructure('courses', courseData)) {
      console.warn('Course data structure validation failed')
    }
    
    const coursesRef = collection(db, COLLECTIONS.COURSES)
    const docRef = await addDoc(coursesRef, courseData)
    return docRef.id
  },

  async getAll(userId: string): Promise<Course[]> {
    await ensureCollectionExists('COURSES')
    
    const coursesRef = collection(db, COLLECTIONS.COURSES)
    const q = query(coursesRef, where('userId', '==', userId), orderBy('completionDate', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => convertTimestamps({
      courseId: doc.id,
      ...doc.data()
    })) as Course[]
  },

  async update(courseId: string, data: CourseFormData): Promise<void> {
    await ensureCollectionExists('COURSES')
    
    const courseRef = doc(db, COLLECTIONS.COURSES, courseId)
    await updateDoc(courseRef, data)
  },

  async delete(courseId: string): Promise<void> {
    await ensureCollectionExists('COURSES')
    
    const courseRef = doc(db, COLLECTIONS.COURSES, courseId)
    await deleteDoc(courseRef)
  }
}

// Achievements Services
export const achievementsService = {
  async create(userId: string, data: AchievementFormData): Promise<string> {
    await ensureCollectionExists('ACHIEVEMENTS')
    
    const achievementData = { ...data, userId }
    
    if (!validateDocumentStructure('achievements', achievementData)) {
      console.warn('Achievement data structure validation failed')
    }
    
    const achievementsRef = collection(db, COLLECTIONS.ACHIEVEMENTS)
    const docRef = await addDoc(achievementsRef, achievementData)
    return docRef.id
  },

  async getAll(userId: string): Promise<Achievement[]> {
    await ensureCollectionExists('ACHIEVEMENTS')
    
    const achievementsRef = collection(db, COLLECTIONS.ACHIEVEMENTS)
    const q = query(achievementsRef, where('userId', '==', userId), orderBy('date', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => convertTimestamps({
      achievementId: doc.id,
      ...doc.data()
    })) as Achievement[]
  },

  async update(achievementId: string, data: AchievementFormData): Promise<void> {
    await ensureCollectionExists('ACHIEVEMENTS')
    
    const achievementRef = doc(db, COLLECTIONS.ACHIEVEMENTS, achievementId)
    await updateDoc(achievementRef, data)
  },

  async delete(achievementId: string): Promise<void> {
    await ensureCollectionExists('ACHIEVEMENTS')
    
    const achievementRef = doc(db, COLLECTIONS.ACHIEVEMENTS, achievementId)
    await deleteDoc(achievementRef)
  }
}

// Skills Services
export const skillsService = {
  async create(userId: string, data: SkillCategoryFormData): Promise<string> {
    await ensureCollectionExists('SKILLS')
    
    const skillData = { ...data, userId }
    
    if (!validateDocumentStructure('skills', skillData)) {
      console.warn('Skill data structure validation failed')
    }
    
    const skillsRef = collection(db, COLLECTIONS.SKILLS)
    const docRef = await addDoc(skillsRef, skillData)
    return docRef.id
  },

  async getAll(userId: string): Promise<SkillCategory[]> {
    await ensureCollectionExists('SKILLS')
    
    const skillsRef = collection(db, COLLECTIONS.SKILLS)
    const q = query(skillsRef, where('userId', '==', userId), orderBy('category'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      skillId: doc.id,
      ...doc.data()
    })) as SkillCategory[]
  },

  async update(skillId: string, data: SkillCategoryFormData): Promise<void> {
    await ensureCollectionExists('SKILLS')
    
    const skillRef = doc(db, COLLECTIONS.SKILLS, skillId)
    await updateDoc(skillRef, data)
  },

  async delete(skillId: string): Promise<void> {
    await ensureCollectionExists('SKILLS')
    
    const skillRef = doc(db, COLLECTIONS.SKILLS, skillId)
    await deleteDoc(skillRef)
  }
}

// Positions Services
export const positionsService = {
  async create(userId: string, data: PositionFormData): Promise<string> {
    await ensureCollectionExists('POSITIONS')
    
    // Clean data to convert undefined values to null for Firestore
    const positionData = cleanDataForFirestore({ ...data, userId })
    
    if (!validateDocumentStructure('positionsOfResponsibility', positionData)) {
      console.warn('Position data structure validation failed')
    }
    
    const positionsRef = collection(db, COLLECTIONS.POSITIONS)
    const docRef = await addDoc(positionsRef, positionData)
    return docRef.id
  },

  async getAll(userId: string): Promise<Position[]> {
    await ensureCollectionExists('POSITIONS')
    
    const positionsRef = collection(db, COLLECTIONS.POSITIONS)
    const q = query(positionsRef, where('userId', '==', userId), orderBy('startDate', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => convertTimestamps({
      posId: doc.id,
      ...doc.data()
    })) as Position[]
  },

  async update(posId: string, data: PositionFormData): Promise<void> {
    await ensureCollectionExists('POSITIONS')
    
    // Clean data to convert undefined values to null for Firestore
    const cleanedData = cleanDataForFirestore(data)
    
    const positionRef = doc(db, COLLECTIONS.POSITIONS, posId)
    await updateDoc(positionRef, cleanedData)
  },

  async delete(posId: string): Promise<void> {
    await ensureCollectionExists('POSITIONS')
    
    const positionRef = doc(db, COLLECTIONS.POSITIONS, posId)
    await deleteDoc(positionRef)
  }
}

// Certifications Services
export const certificationsService = {
  async create(userId: string, data: CertificationFormData): Promise<string> {
    await ensureCollectionExists('CERTIFICATIONS')
    
    const certificationData = { ...data, userId }
    
    if (!validateDocumentStructure('certifications', certificationData)) {
      console.warn('Certification data structure validation failed')
    }
    
    const certificationsRef = collection(db, COLLECTIONS.CERTIFICATIONS)
    const docRef = await addDoc(certificationsRef, certificationData)
    return docRef.id
  },

  async getAll(userId: string): Promise<Certification[]> {
    await ensureCollectionExists('CERTIFICATIONS')
    
    const certificationsRef = collection(db, COLLECTIONS.CERTIFICATIONS)
    const q = query(certificationsRef, where('userId', '==', userId), orderBy('issueDate', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => convertTimestamps({
      certId: doc.id,
      ...doc.data()
    })) as Certification[]
  },

  async update(certId: string, data: CertificationFormData): Promise<void> {
    await ensureCollectionExists('CERTIFICATIONS')
    
    const certificationRef = doc(db, COLLECTIONS.CERTIFICATIONS, certId)
    await updateDoc(certificationRef, data)
  },

  async delete(certId: string): Promise<void> {
    await ensureCollectionExists('CERTIFICATIONS')
    
    const certificationRef = doc(db, COLLECTIONS.CERTIFICATIONS, certId)
    await deleteDoc(certificationRef)
  }
}