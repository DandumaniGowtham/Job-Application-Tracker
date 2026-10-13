import { useState } from 'react'
import './App.css'
import Dashboard from './Dashboard'

function App() {
  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem('access_token'))
  )
  

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [loading, setLoading] = useState(false)
  
  if (isLoggedIn) {
    return <Dashboard />
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage('')
    setMessageType('')
    setLoading(true)

    try {
      const endpoint = isRegister ? '/register' : '/login'

      const response = await fetch(
        `https://job-application-tracker-api-7997.onrender.com${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            isRegister
              ? { name, email, password }
              : { email, password }
          ),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        const errorMessage =
          typeof data.detail === 'string'
            ? data.detail
            : Array.isArray(data.detail)
              ? data.detail.map((error) => error.msg).join(', ')
              : 'Request failed. Please check your details.'

        setMessage(errorMessage)
        setMessageType('error')
        return
      }

      if (isRegister) {
        setMessage('Account created successfully. Please sign in.')
        setMessageType('success')
        setIsRegister(false)
        setName('')
        setPassword('')
      } else {
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token)
          setIsLoggedIn(true)
        } else {
          setMessage('Login response did not contain an access token.')
          setMessageType('error')
        }
      }
    } catch {
      setMessage(
        'Unable to connect to the server. Please check thclassName="brand-icon"at the backend is running.'
      )
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setIsRegister((current) => !current)
    setShowPassword(false)
    setName('')
    setEmail('')
    setPassword('')
    setMessage('')
    setMessageType('')
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        {/* Left welcome panel */}
        <aside className="welcome-panel">
          <a
            className="brand"
            href="/"
            aria-label="Job Tracker"
          >
            <span className="brand-icon">JT</span>
            <span className="brand-name">
              Job Tracker<span>.</span>
            </span>
          </a>

          <div className="welcome-content">
            <div className="rocket-icon" aria-hidden="true">
              <svg
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M38.5 7.5C45.7 4.5 53.4 4.6 57.4 5.2C58 9.2 58.1 16.9 55.1 24.1C51.7 32.4 44.6 38.7 35.4 43.1L25.9 33.6C30.3 24.4 36.6 17.3 44.9 13.9"
                  fill="currentColor"
                />
                <path
                  d="M26 18.5L13.8 19.2C11.9 19.3 10.1 20.4 9.2 22.1L3.3 32.5C2.8 33.4 3.5 34.5 4.6 34.5H20.8L26 18.5Z"
                  fill="currentColor"
                />
                <path
                  d="M45.5 38L44.8 50.2C44.7 52.1 43.6 53.9 41.9 54.8L31.5 60.7C30.6 61.2 29.5 60.5 29.5 59.4V43.2L45.5 38Z"
                  fill="currentColor"
                />
                <path
                  d="M23.8 36.2L17.4 42.6C16.6 43.4 16.6 44.7 17.4 45.5L22.5 50.6C23.3 51.4 24.6 51.4 25.4 50.6L31.8 44.2L23.8 36.2Z"
                  fill="currentColor"
                />
                <circle
                  cx="44.5"
                  cy="18.5"
                  r="5"
                  fill="#08BFC1"
                />
              </svg>
            </div>

            <h1>
              {isRegister ? 'Join Job Tracker' : 'Welcome'}
            </h1>

            <p>
              {isRegister
                ? 'Your next opportunity is waiting. Create an account and start organizing your career journey.'
                : "We're glad to see you again! Sign in to continue managing your job search."}
            </p>

            <div className="welcome-benefits">
              <div className="benefit-item">
                <span className="benefit-check">✓</span>
                <span>Keep every application organized</span>
              </div>

              <div className="benefit-item">
                <span className="benefit-check">✓</span>
                <span>Track interviews and follow-ups</span>
              </div>

              <div className="benefit-item">
                <span className="benefit-check">✓</span>
                <span>Stay focused on your next move</span>
              </div>
            </div>
          </div>

          <div className="welcome-footer">
            Save jobs. Track applications. Stay organized.
          </div>
        </aside>

        {/* Right login/register panel */}
        <section className="form-panel">
          <div className="form-top">
            <div className="form-heading">
              <span className="form-eyebrow">
                {isRegister ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}
              </span>

              <h2>
                {isRegister ? 'Create Account' : 'Sign In'}
              </h2>
            </div>

            <span className="account-badge">
              <span className="badge-dot" />
              Job Tracker
            </span>
          </div>

          <div className="form-content">
            <p className="form-intro">
              {isRegister
                ? 'Enter your details to get started.'
                : 'Sign in with your email and password.'}
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              {isRegister && (
                <div className="field-group">
                  <label htmlFor="name">Full Name *</label>

                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <div className="field-group">
                <label htmlFor="email">Email Address *</label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="password">Password *</label>

                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={
                      isRegister ? 'new-password' : 'current-password'
                    }
                    required
                  />

                  <button
                    className="password-toggle"
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 3L21 21" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.1-2.2 3" />
                        <path d="M6.2 6.2C3.9 7.7 2.8 9.8 2.5 12c.8 2 4.3 7 9.5 7 1.4 0 2.6-.3 3.7-.9" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                className="submit-button"
                type="submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? 'Please wait...'
                    : isRegister
                      ? 'Create Account'
                      : 'Login'}
                </span>

                <span className="submit-arrow" aria-hidden="true">
                  →
                </span>
              </button>

              {message && (
                <div
                  className={`form-message ${messageType}`}
                  role="status"
                >
                  {message}
                </div>
              )}
            </form>

            <div className="form-switch">
              <span>
                {isRegister
                  ? 'Already have an account?'
                  : "Don't have an account?"}
              </span>

              <button
                type="button"
                className="switch-button"
                onClick={switchMode}
              >
                {isRegister ? 'Sign In' : 'Register'}
                <span aria-hidden="true"> ↗</span>
              </button>
            </div>

            <div className="security-note">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>

              <span>Your career journey, organized securely.</span>
            </div>
          </div>

          <footer className="form-footer">
            <span>BUILT FOR TRACK YOUR JOB APPLICATIONS</span>
          </footer>
        </section>
      </section>
    </main>
  )
}

export default App