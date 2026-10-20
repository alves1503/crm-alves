import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { RobotScene } from '../components/RobotScene'
import { TechnologyOrbit } from '../components/TechnologyOrbit'
import { authService } from '../services/authService'
import type { User } from '../types/auth'

interface LoginPageProps {
  onLogin: (user: User) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      onLogin(await authService.login(email, password))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-screen">
      <section className="login-card">
        <div className="login-panel">
          <div className="brand login-brand">
            <span className="brand-mark"><span /><span /><span /><span /></span>
            <span>Alves<span className="brand-period">.CRM</span></span>
          </div>
          <div className="login-copy">
            <span className="eyebrow">SUA CENTRAL DE RELACIONAMENTO</span>
            <h1>Boas conversas<br />começam por aqui.</h1>
            <p className="login-intro">Entre na sua central e transforme cada atendimento em uma experiência próxima e atenciosa.</p>
          </div>
          <form className="login-form" onSubmit={submit}>
            <div className="login-form-heading">
              <strong>Acesse sua conta</strong>
              <span>Informe suas credenciais para continuar.</span>
            </div>
            <label className="field">E-mail
              <input type="email" autoComplete="username" autoCapitalize="none" autoCorrect="off" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@empresa.com" />
            </label>
            <label className="field">Senha
              <span className="password-input-wrap">
                <input type={passwordVisible ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Digite sua senha" />
                <button
                  className="password-toggle"
                  type="button"
                  aria-label={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={passwordVisible}
                  onClick={() => setPasswordVisible((visible) => !visible)}
                >
                  {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </span>
            </label>
            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="button button-primary login-submit" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar no CRM'}
            </button>
          </form>
          <div className="login-security"><LockKeyhole size={16} /><span>Acesso protegido</span><i /> <ShieldCheck size={16} /><span>Conexão segura</span></div>
        </div>
        <aside className="login-illustration">
          <div className="illustration-heading"><span className="illustration-brand">ALVES<span>.CRM</span></span></div>
          <div className="illustration-copy">
            <span>RELACIONAMENTO SEM COMPLICAÇÃO</span>
            <h2>Mais clareza em cada conversa.</h2>
            <p>Atenda com contexto, organização e proximidade.</p>
          </div>
          <RobotScene passwordVisible={passwordVisible} />
          <TechnologyOrbit />
        </aside>
      </section>
      <p className="login-footer">Alves.CRM <span>·</span> Atendimento mais próximo, sempre.</p>
    </main>
  )
}
