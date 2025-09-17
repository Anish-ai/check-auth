import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { InteractionRequiredAuthError } from '@azure/msal-browser'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { firebaseAuth, db } from '../firebase'
import { signInAnonymously, updateProfile } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { theme } from '../styles/theme'
import { Button, Card, CardContent } from './ui'

type EasyAuthMe = any

function extractFromEasyAuth(me: EasyAuthMe): { name?: string; email?: string; oid?: string } | null {
  try {
    if (!me) return null
    // Azure App Service Easy Auth often returns an array with provider entries
    if (Array.isArray(me) && me.length > 0) {
      const entry = me[0]
      const claims = entry?.user_claims as Array<{ typ: string; val: string }> | undefined
      if (claims && claims.length > 0) {
        const get = (keys: string[]) => claims.find(c => keys.includes(c.typ))?.val
        const name = get(['name', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'])
        const email = get(['preferred_username', 'emails', 'email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'])
        const oid = get(['oid', 'http://schemas.microsoft.com/identity/claims/objectidentifier'])
        return { name, email, oid }
      }
      // Some variants place basic fields at top level
      if (entry?.user_id || entry?.userDetails) {
        return { name: entry?.userDetails, email: entry?.user_id, oid: entry?.user_id }
      }
    }
    // Azure Static Web Apps uses clientPrincipal shape
    if (me?.clientPrincipal?.claims) {
      const claims = me.clientPrincipal.claims as Array<{ typ: string; val: string }>
      const get = (keys: string[]) => claims.find(c => keys.includes(c.typ))?.val
      const name = get(['name', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'])
      const email = get(['preferred_username', 'emails', 'email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'])
      const oid = get(['oid', 'http://schemas.microsoft.com/identity/claims/objectidentifier'])
      return { name, email, oid }
    }
  } catch (e) {
    console.warn('Failed to parse Easy Auth payload', e)
  }
  return null
}

export function LoginPage() {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const [profile, setProfile] = useState<{ name?: string; email?: string; oid?: string } | null>(null)
  const [easyAuthRaw, setEasyAuthRaw] = useState<any | null>(null)
  const [loadingMe, setLoadingMe] = useState<boolean>(false)
  const [creatingUser, setCreatingUser] = useState(false)

  const activeAccount = useMemo(() => {
    if (accounts.length > 0) return accounts[0]
    return null
  }, [accounts])

  useEffect(() => {
    if (!activeAccount) {
      setProfile(null)
      return
    }
    // Claims live in ID token on the active account
    const idTokenClaims = activeAccount.idTokenClaims as any
    const name = idTokenClaims?.name || idTokenClaims?.given_name || activeAccount.name
    const email = idTokenClaims?.preferred_username || idTokenClaims?.email
    const oid = idTokenClaims?.oid
    setProfile({ name, email, oid })
  }, [activeAccount])

  const fetchEasyAuthMe = useCallback(async () => {
    setLoadingMe(true)
    try {
      const base = import.meta.env.VITE_EASY_AUTH_BASE || window.location.origin
      const res = await fetch(`${base}/.auth/me`, { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      localStorage.setItem('easyAuthMe', JSON.stringify(json))
      setEasyAuthRaw(json)
      const extracted = extractFromEasyAuth(json)
      if (extracted) setProfile(extracted)
      return json
    } catch (e) {
      console.warn('Easy Auth fetch failed', e)
      return null
    } finally {
      setLoadingMe(false)
    }
  }, [])

  useEffect(() => {
    fetchEasyAuthMe()
  }, [fetchEasyAuthMe])

  // Popup-based Easy Auth flow that auto-closes after auth and refreshes session
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.data && (e.data as any).type === 'EASY_AUTH_DONE') {
        fetchEasyAuthMe()
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [fetchEasyAuthMe])

  const openCenteredPopup = (url: string, name: string) => {
    const w = 520
    const h = 600
    const y = window.top?.outerHeight ? Math.max(0, ((window.top.outerHeight - h) / 2) + (window.top.screenY || 0)) : 0
    const x = window.top?.outerWidth ? Math.max(0, ((window.top.outerWidth - w) / 2) + (window.top.screenX || 0)) : 0
    return window.open(url, name, `width=${w},height=${h},left=${x},top=${y}`)
  }

  const easyAuthLoginPopup = () => {
    const base = (import.meta.env.VITE_EASY_AUTH_BASE || window.location.origin).replace(/\/$/, '')
    const doneUrl = `${window.location.origin}/auth-complete`
    const url = `${base}/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(doneUrl)}`
    openCenteredPopup(url, 'azure-login')
  }

  const login = async () => {
    try {
      await instance.loginPopup({
        scopes: ['openid', 'profile', 'email'],
        prompt: 'select_account',
      })
    } catch (err: any) {
      if (err instanceof InteractionRequiredAuthError) {
        await instance.loginRedirect({ scopes: ['openid', 'profile', 'email'] })
      } else {
        console.error(err)
        alert('Login failed. See console for details.')
      }
    }
  }

  const logout = async () => {
    await instance.logoutPopup({
      postLogoutRedirectUri: window.location.origin,
    })
  }

  const createFirebaseUser = async () => {
    setCreatingUser(true)
    try {
      if (!profile?.oid) {
        alert('No Azure user profile available. Please sign in first.')
        return
      }

      // Sign in anonymously to Firebase (we'll use Azure OID as the UID)
      const userCredential = await signInAnonymously(firebaseAuth)
      const firebaseUser = userCredential.user

      // Update Firebase user profile with Azure data
      await updateProfile(firebaseUser, {
        displayName: profile.name || 'Unknown User',
        photoURL: null,
      })

      // Create/update user document in Firestore using Firebase UID as document ID
      const userDocRef = doc(db, 'users', firebaseUser.uid)
      const userDocSnap = await getDoc(userDocRef)
      
      if (!userDocSnap.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          azureOid: profile.oid,
          email: profile.email || null,
          name: profile.name || null,
          firebaseUid: firebaseUser.uid,
          role: 'student',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        })
      } else {
        // Update existing user document
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          azureOid: profile.oid,
          email: profile.email || null,
          name: profile.name || null,
          firebaseUid: firebaseUser.uid,
          lastLoginAt: serverTimestamp(),
        }, { merge: true })
      }
    } catch (e) {
      console.error('Firebase user creation failed:', e)
      alert('Failed to create Firebase user. See console for details.')
    } finally {
      setCreatingUser(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.secondary[50]} 100%)`,
      padding: theme.spacing[4],
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: '500px',
      }}>
        <Card variant="elevated" padding="lg">
          <CardContent>
            <div style={{ textAlign: 'center', marginBottom: theme.spacing[8] }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto',
                background: `linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.secondary[600]})`,
                borderRadius: theme.borderRadius['2xl'],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                marginBottom: theme.spacing[4],
                boxShadow: theme.shadows.lg,
              }}>
                🎓
              </div>
              <h1 style={{ 
                margin: 0, 
                fontSize: theme.typography.fontSize['3xl'], 
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2],
              }}>
                Smart Student Hub
              </h1>
              <p style={{ 
                margin: 0, 
                color: theme.colors.text.secondary, 
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.medium,
              }}>
                IIT Patna • Verified Student Records
              </p>
            </div>

            {!isAuthenticated && !profile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
                <Button 
                  onClick={login} 
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loadingMe}
                >
                  Sign in with IITP Account (MSAL)
                </Button>
                <Button 
                  onClick={easyAuthLoginPopup} 
                  variant="secondary"
                  size="lg"
                  fullWidth
                >
                  Sign in with IITP Account (Easy Auth)
                </Button>
                <Button 
                  onClick={fetchEasyAuthMe} 
                  variant="outline"
                  size="lg"
                  fullWidth
                  loading={loadingMe}
                >
                  {loadingMe ? 'Checking session...' : 'Check Existing Session'}
                </Button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: theme.spacing[6] }}>
                  <Card variant="outlined" padding="md">
                    <h3 style={{ 
                      margin: `0 0 ${theme.spacing[4]} 0`, 
                      color: theme.colors.text.primary,
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                    }}>
                      Azure Profile
                    </h3>
                    <div style={{ display: 'grid', gap: theme.spacing[3] }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: theme.typography.fontWeight.medium, color: theme.colors.text.secondary }}>Name:</span>
                        <span style={{ color: theme.colors.text.primary }}>{profile?.name || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: theme.typography.fontWeight.medium, color: theme.colors.text.secondary }}>Email:</span>
                        <span style={{ color: theme.colors.text.primary }}>{profile?.email || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: theme.typography.fontWeight.medium, color: theme.colors.text.secondary }}>OID:</span>
                        <span style={{ 
                          color: theme.colors.text.primary, 
                          fontFamily: theme.typography.fontFamily.mono.join(', '),
                          fontSize: theme.typography.fontSize.sm,
                        }}>
                          {profile?.oid || '—'}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>

                <div style={{ display: 'flex', gap: theme.spacing[3], marginBottom: theme.spacing[6] }}>
                  <Button 
                    onClick={createFirebaseUser}
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={creatingUser}
                  >
                    {creatingUser ? 'Setting up account...' : 'Continue to App'}
                  </Button>
                  <Button 
                    onClick={logout} 
                    variant="outline"
                    size="lg"
                  >
                    Sign Out
                  </Button>
                </div>

                {easyAuthRaw && (
                  <details style={{ marginTop: theme.spacing[4] }}>
                    <summary style={{ 
                      cursor: 'pointer', 
                      color: theme.colors.text.secondary,
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                    }}>
                      Show raw Azure data
                    </summary>
                    <pre style={{ 
                      whiteSpace: 'pre-wrap', 
                      background: theme.colors.gray[50], 
                      padding: theme.spacing[4], 
                      borderRadius: theme.borderRadius.md,
                      fontSize: theme.typography.fontSize.xs,
                      marginTop: theme.spacing[2],
                      overflow: 'auto',
                      maxHeight: '200px',
                      fontFamily: theme.typography.fontFamily.mono.join(', '),
                    }}>
                      {JSON.stringify(easyAuthRaw, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}