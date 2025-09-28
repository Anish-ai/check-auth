import { doc, setDoc, getDoc, collection } from 'firebase/firestore'
import { db } from '../firebase'

// Collection names as constants
export const COLLECTIONS = {
  PROFILES: 'profiles',
  PROJECTS: 'projects', 
  EDUCATION: 'education',
  COURSES: 'courses',
  ACHIEVEMENTS: 'achievements',
  SKILLS: 'skills',
  POSITIONS: 'positionsOfResponsibility',
  CERTIFICATIONS: 'certifications'
} as const

// Sample documents for each collection to ensure proper field structure
const SAMPLE_DOCUMENTS = {
  profiles: {
    userId: '',
    name: '',
    email: '',
    phone: '',
    portfolioWebsite: '',
    githubLink: '',
    linkedinLink: '',
    photoURL: '',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  projects: {
    projectId: '',
    userId: '',
    title: '',
    description: '',
    techStack: [],
    projectLink: '',
    githubRepo: '',
    startDate: new Date(),
    endDate: null
  },
  education: {
    eduId: '',
    userId: '',
    institute: '',
    degree: '',
    branch: '',
    startYear: 0,
    endYear: 0,
    cgpaOrPercentage: ''
  },
  courses: {
    courseId: '',
    userId: '',
    title: '',
    provider: '',
    certificateLink: '',
    completionDate: new Date()
  },
  achievements: {
    achievementId: '',
    userId: '',
    title: '',
    description: '',
    date: new Date()
  },
  skills: {
    skillId: '',
    userId: '',
    category: '',
    skills: [
      { name: 'React', level: 'Intermediate' },
      { name: 'Firebase', level: 'Beginner' }
    ]
  },
  positionsOfResponsibility: {
    posId: '',
    userId: '',
    title: '',
    organization: '',
    description: '',
    startDate: new Date(),
    endDate: null
  },
  certifications: {
    certId: '',
    userId: '',
    title: '',
    issuer: '',
    issueDate: new Date(),
    certificateLink: ''
  }
}

/**
 * Ensures a collection exists by checking if it has any documents
 * If not, creates a sample document with the proper structure
 */
export const ensureCollectionExists = async (collectionName: keyof typeof COLLECTIONS): Promise<void> => {
  try {
    const collectionKey = COLLECTIONS[collectionName]
    const sampleDocRef = doc(db, collectionKey, '_sample')
    const sampleDoc = await getDoc(sampleDocRef)
    
    if (!sampleDoc.exists()) {
      // Create a sample document to establish collection structure
      const sampleData = SAMPLE_DOCUMENTS[collectionKey as keyof typeof SAMPLE_DOCUMENTS]
      await setDoc(sampleDocRef, {
        ...sampleData,
        _isSample: true,
        _createdAt: new Date()
      })
      
      console.log(`Collection '${collectionKey}' initialized with sample document`)
    }
  } catch (error) {
    console.warn(`Warning: Could not ensure collection '${collectionName}' exists:`, error)
    // Don't throw error - collection will be created on first real document
  }
}

/**
 * Initialize all collections with proper structure
 */
export const initializeAllCollections = async (): Promise<void> => {
  try {
    const collectionNames = Object.keys(COLLECTIONS) as Array<keyof typeof COLLECTIONS>
    
    console.log('Initializing Firestore collections...')
    
    for (const collectionName of collectionNames) {
      try {
        await ensureCollectionExists(collectionName)
        console.log(`✓ Collection ${COLLECTIONS[collectionName]} ready`)
      } catch (error: any) {
        if (error?.code === 'permission-denied') {
          console.warn(`⚠️ Permission denied for collection ${COLLECTIONS[collectionName]}. This is normal on first run.`)
          console.warn('Please deploy Firestore security rules using Firebase Console.')
        } else {
          console.error(`❌ Error initializing collection ${COLLECTIONS[collectionName]}:`, error)
        }
      }
    }
    
    console.log('Collection initialization complete')
  } catch (error) {
    console.error('Error during collection initialization:', error)
    // Don't throw - let the app continue even if collections aren't initialized
  }
}

/**
 * Get a reference to a collection, ensuring it exists first
 */
export const getCollectionRef = async (collectionName: keyof typeof COLLECTIONS) => {
  await ensureCollectionExists(collectionName)
  return collection(db, COLLECTIONS[collectionName])
}

/**
 * Validate document data against expected structure
 */
export const validateDocumentStructure = (
  collectionName: keyof typeof SAMPLE_DOCUMENTS, 
  data: any
): boolean => {
  const sampleStructure = SAMPLE_DOCUMENTS[collectionName]
  const requiredFields = Object.keys(sampleStructure)
  
  for (const field of requiredFields) {
    if (!(field in data) && field !== 'createdAt' && field !== 'updatedAt') {
      console.warn(`Missing required field '${field}' in ${collectionName} document`)
      return false
    }
  }
  
  return true
}