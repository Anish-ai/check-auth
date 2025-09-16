import './App.css'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { InteractionRequiredAuthError } from '@azure/msal-browser'
import { useCallback, useEffect, useMemo, useState } from 'react'

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

function App() {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const [profile, setProfile] = useState<{ name?: string; email?: string; oid?: string } | null>(null)
  const [easyAuthRaw, setEasyAuthRaw] = useState<any | null>(null)
  const [loadingMe, setLoadingMe] = useState<boolean>(false)

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
      console.log('base', base)
      const res = await fetch(`${base}/.auth/me`, { credentials: 'include' })
      console.log('res', res)
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
    // Try Easy Auth first; if it works, we can use those claims even on localhost
    fetchEasyAuthMe()
    // Fallback to MSAL path is already handled by the other effect
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

  const easyAuthLogoutPopup = () => {
    const base = (import.meta.env.VITE_EASY_AUTH_BASE || window.location.origin).replace(/\/$/, '')
    const doneUrl = `${window.location.origin}/auth-complete`
    const url = `${base}/.auth/logout?post_logout_redirect_uri=${encodeURIComponent(doneUrl)}`
    openCenteredPopup(url, 'azure-logout')
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

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <h2>Smart Student Hub – Azure Login Demo</h2>
      {!isAuthenticated && !profile ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={login} style={{ padding: '10px 16px' }}>Sign in with MSAL</button>
          <button onClick={easyAuthLoginPopup} style={{ padding: '8px 12px' }}>Sign in (Easy Auth popup)</button>
          <button onClick={fetchEasyAuthMe} disabled={loadingMe} style={{ padding: '8px 12px' }}>{loadingMe ? 'Checking /.auth/me…' : 'Refresh session' }</button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 12 }}>
            <strong>Status:</strong> Signed in
          </div>
          <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
            <div><strong>Name:</strong> {profile?.name || '—'}</div>
            <div><strong>Email:</strong> {profile?.email || '—'}</div>
            <div><strong>OID:</strong> {profile?.oid || '—'}</div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button onClick={logout} style={{ padding: '8px 12px' }}>Sign out (MSAL)</button>
            <button onClick={easyAuthLogoutPopup} style={{ padding: '8px 12px' }}>Sign out (Easy Auth popup)</button>
          </div>
          {easyAuthRaw && (
            <details style={{ marginTop: 16 }}>
              <summary>Show raw /.auth/me JSON</summary>
              <pre style={{ whiteSpace: 'pre-wrap', background: '#fafafa', padding: 12, borderRadius: 8 }}>
                {JSON.stringify(easyAuthRaw, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
      <div style={{ marginTop: 24, color: '#666' }}>
        Tip: On localhost, set VITE_EASY_AUTH_BASE to your Azure site to fetch /.auth/me.
      </div>
    </div>
  )
}

export default App
