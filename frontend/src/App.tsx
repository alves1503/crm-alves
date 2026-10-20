import { useEffect, useState } from 'react'
import { InboxPage } from './pages/InboxPage'
import { LoginPage } from './pages/LoginPage'
import { authService } from './services/authService'
import type { User } from './types/auth'

export default function App() {
  const [storedUser] = useState(() => authService.currentUser())
  const [user, setUser] = useState<User | null>(storedUser)
  const [checkingSession, setCheckingSession] = useState(storedUser !== null)
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    let active = true
    const logout = () => setUser(null)
    window.addEventListener('alvescrm:unauthorized', logout)
    if (storedUser) {
      void authService.me()
        .then((verifiedUser) => {
          if (active) setUser(verifiedUser)
        })
        .catch((cause: unknown) => {
          if (active && localStorage.getItem('alves-crm-token')) {
            setSessionError(cause instanceof Error ? cause.message : 'Não foi possível validar sua sessão.')
          }
        })
        .finally(() => {
          if (active) setCheckingSession(false)
        })
    }
    return () => {
      active = false
      window.removeEventListener('alvescrm:unauthorized', logout)
    }
  }, [])

  async function validateSession() {
    setSessionError('')
    setCheckingSession(true)
    try {
      setUser(await authService.me())
    } catch (cause) {
      if (localStorage.getItem('alves-crm-token')) {
        setSessionError(cause instanceof Error ? cause.message : 'Não foi possível validar sua sessão.')
      } else {
        setUser(null)
      }
    } finally {
      setCheckingSession(false)
    }
  }

  if (checkingSession) {
    return <main className="session-check"><span className="spinner" /> Validando sua sessão...</main>
  }

  if (sessionError) {
    return (
      <main className="session-check session-check-error">
        <h1>Não foi possível validar sua sessão</h1>
        <p>{sessionError}</p>
        <div>
          <button className="button button-primary" onClick={() => void validateSession()}>Tentar novamente</button>
          <button className="button button-light" onClick={() => { authService.logout(); setUser(null); setSessionError('') }}>Voltar ao login</button>
        </div>
      </main>
    )
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />
  }

  return <InboxPage user={user} onLogout={() => { authService.logout(); setUser(null) }} />
}
