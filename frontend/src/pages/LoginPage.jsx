import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const [activeTab, setActiveTab] = useState('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(loginForm.email, loginForm.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(registerForm.username, registerForm.email, registerForm.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:       '100vh',
      background:      'var(--bg-primary)',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         '24px',
      position:        'relative',
      overflow:        'hidden',
    }}>

      {/* Top left purple circle */}
      <div style={{
        position:     'absolute',
        top:          '-200px',
        left:         '-200px',
        width:        '600px',
        height:       '600px',
        borderRadius: '50%',
        background:   'rgba(124, 58, 237, 0.25)',
        filter:       'blur(120px)',
        pointerEvents:'none',
      }} />

      {/* Bottom right blue circle */}
      <div style={{
        position:     'absolute',
        bottom:       '-200px',
        right:        '-200px',
        width:        '600px',
        height:       '600px',
        borderRadius: '50%',
        background:   'rgba(91, 124, 246, 0.2)',
        filter:       'blur(120px)',
        pointerEvents:'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontFamily:           'Orbitron, sans-serif',
            fontWeight:           900,
            fontSize:             '22px',
            letterSpacing:        '0.1em',
            background:           'linear-gradient(135deg, #a78bfa, #5b7cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:       'text',
          }}>
            LIFEBOARD
          </div>
        </div>

        {/* Card */}
        <div style={{
          background:           'rgba(18, 18, 30, 0.75)',
          border:               '1px solid var(--glass-border-purple)',
          borderRadius:         '20px',
          padding:              '36px',
          backdropFilter:       'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow:            '0 32px 64px rgba(0,0,0,0.5)',
        }}>

          {/* Tabs */}
          <div style={{
            display:      'flex',
            borderBottom: '1px solid var(--glass-border)',
            marginBottom: '28px',
            position:     'relative',
          }}>
            {['login', 'register'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setError('') }}
                style={{
                  flex:            1,
                  background:      'none',
                  border:          'none',
                  borderBottom:    activeTab === tab ? '2px solid var(--accent-purple)' : '2px solid transparent',
                  color:           activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize:        '14px',
                  fontWeight:      500,
                  padding:         '0 0 14px',
                  cursor:          'pointer',
                  transition:      'all 0.2s',
                  textTransform:   'capitalize',
                  marginBottom:    '-1px',
                }}
              >
                {tab === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Login form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>
              <p style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px' }}>Welcome back</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Sign in to your LifeBoard dashboard.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    className="form-input font-mono"
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <input
                    className="form-input font-mono"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
                {error && (
                  <p style={{ fontSize: '12px', color: '#f87171', textAlign: 'center' }}>{error}</p>
                )}
                <button
                  type="submit"
                  className="btn-gradient"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', height: '44px', marginTop: '4px' }}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          )}

          {/* Register form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister}>
              <p style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px' }}>Create your account</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Start tracking your career, gaming and Pokémon journey.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="form-label">Username</label>
                  <input
                    className="form-input font-mono"
                    type="text"
                    placeholder="ajmal123"
                    value={registerForm.username}
                    onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    className="form-input font-mono"
                    type="email"
                    placeholder="you@example.com"
                    value={registerForm.email}
                    onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <input
                    className="form-input font-mono"
                    type="password"
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                  />
                </div>
                {error && (
                  <p style={{ fontSize: '12px', color: '#f87171', textAlign: 'center' }}>{error}</p>
                )}
                <button
                  type="submit"
                  className="btn-gradient"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', height: '44px', marginTop: '4px' }}
                >
                  {loading ? 'Creating account...' : 'Get started'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)' }}>
          LifeBoard © 2025
        </p>
      </div>
    </div>
  )
}

export default LoginPage