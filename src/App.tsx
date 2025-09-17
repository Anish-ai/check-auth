import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { LoginPage } from './components/LoginPage'
import { StudentDashboard } from './components/StudentDashboard'
import { ActivityForm } from './components/ActivityForm'
import { LoadingSpinner } from './components/ui'

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
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/activities" element={<ActivityForm />} />
        <Route 
          path="/portfolio" 
          element={
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Coming Soon</h2>
              <p className="text-gray-600">This feature is under development and will be available soon.</p>
            </div>
          } 
        />
        <Route 
          path="/verification" 
          element={
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Queue Coming Soon</h2>
              <p className="text-gray-600">This feature is under development and will be available soon.</p>
            </div>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚙️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel Coming Soon</h2>
              <p className="text-gray-600">This feature is under development and will be available soon.</p>
            </div>
          } 
        />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App