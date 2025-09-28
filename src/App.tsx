import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/NewLayout'
import { LoginPage } from './components/LoginPage'
import { Dashboard } from './components/Dashboard'
import { Profile } from './components/Profile'
import { Projects } from './components/Projects'
import { EducationSection } from './components/Education'
import { Courses } from './components/Courses'
import { Achievements } from './components/Achievements'
import { Skills } from './components/Skills'
import { Positions } from './components/Positions'
import { Certifications } from './components/Certifications'
import { LoadingSpinner } from './components/ui'
import { ensureFirebaseReady } from './firebase'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-gray-600">Loading StudHub...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/education" element={<EducationSection />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/positions" element={<Positions />} />
        <Route path="/certifications" element={<Certifications />} />
      </Routes>
    </Layout>
  )
}

function App() {
  // Initialize Firebase collections on app start
  useEffect(() => {
    ensureFirebaseReady().catch(console.warn)
  }, [])

  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App