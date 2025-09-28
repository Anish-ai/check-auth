import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { initializeAllCollections } from './services/collectionManager'

const firebaseConfig = {
    apiKey: "AIzaSyCShen9yutsSZEqyGpHpL4sTwi9-xxAt0U",
    authDomain: "studhub-iitp.firebaseapp.com",
    projectId: "studhub-iitp",
    storageBucket: "studhub-iitp.firebasestorage.app",
    messagingSenderId: "720625783074",
    appId: "1:720625783074:web:0a773b39c6315ac52a957b",
    measurementId: "G-29Q01V6MXP"
};

export const app = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize collections on app start
let collectionsInitialized = false
export const ensureFirebaseReady = async (): Promise<void> => {
  if (!collectionsInitialized) {
    try {
      await initializeAllCollections()
      collectionsInitialized = true
      console.log('Firebase collections initialized successfully')
    } catch (error) {
      console.warn('Firebase collections initialization had some issues:', error)
      console.warn('This is normal if Firestore security rules are not deployed yet.')
      console.warn('Please deploy the security rules using Firebase Console.')
      // Still mark as initialized to prevent repeated attempts
      collectionsInitialized = true
    }
  }
}

