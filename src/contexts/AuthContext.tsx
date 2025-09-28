import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { firebaseAuth } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

interface UserProfile {
  uid: string
  azureOid?: string
  email?: string
  name?: string
  role?: string
  createdAt?: any
  lastLoginAt?: any
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  isStudent: boolean
  isClubLead: boolean
  isFaculty: boolean
  isAdmin: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      setUser(user)
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile)
          } else {
            setUserProfile(null)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    await signOut(firebaseAuth)
  }

  const isStudent = userProfile?.role === 'student' || !userProfile?.role
  const isClubLead = userProfile?.role === 'club_lead'
  const isFaculty = userProfile?.role === 'faculty'
  const isAdmin = userProfile?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      isStudent,
      isClubLead,
      isFaculty,
      isAdmin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
