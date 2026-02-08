import { useState, useRef, useEffect } from 'react'
import './App.css'

type Theme = 'dark' | 'light'

function App() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileMenuOpen])

  useEffect(() => {
    document.body.classList.toggle('theme-light', theme === 'light')
  }, [theme])

  return (
    <div className={`app theme-${theme}`}>
      <nav className="nav-bar">
        <header className="app-header">
        <div className="brand">
          <div className="brand-mark">CM</div>
          <div className="brand-text">
            <span className="brand-title">Curriculum Mapper</span>
            <span className="brand-subtitle">AI-powered course design</span>
          </div>
        </div>

        <nav className="nav">
          <div className="theme-switch" role="group" aria-label="Theme">
            <button
              className={`theme-switch-btn ${theme === 'dark' ? 'active' : ''}`}
              type="button"
              onClick={() => setTheme('dark')}
              aria-pressed={theme === 'dark'}
            >
              Dark
            </button>
            <button
              className={`theme-switch-btn ${theme === 'light' ? 'active' : ''}`}
              type="button"
              onClick={() => setTheme('light')}
              aria-pressed={theme === 'light'}
            >
              Light
            </button>
          </div>
          <button className="nav-link" type="button">
            Login
          </button>
          <div className="nav-avatar-wrap" ref={profileRef}>
            <button
              className="nav-avatar"
              type="button"
              aria-label="Profile"
              aria-expanded={profileMenuOpen}
              aria-haspopup="true"
              onClick={() => setProfileMenuOpen((o) => !o)}
            >
              <span className="nav-avatar-initial">R</span>
            </button>
            {profileMenuOpen && (
              <div className="profile-menu" role="menu">
                <button className="profile-menu-item" type="button" role="menuitem">
                  Profile
                </button>
                <button className="profile-menu-item" type="button" role="menuitem">
                  Settings
                </button>
                <button className="profile-menu-item" type="button" role="menuitem">
                  Privacy Policy
                </button>
                <button className="profile-menu-item" type="button" role="menuitem">
                  Log out
                </button>
              </div>
            )}
          </div>
        </nav>
        </header>
      </nav>

      <main className="app-main">
        <section className="hero" aria-label="Curriculum mapper introduction">
          {theme === 'dark' && (
            <p className="hero-kicker">Smart curriculum mapping</p>
          )}
          <h1 className="hero-title">
            Turn messy syllabi into a clear, searchable map.
          </h1>
          {theme === 'light' && (
            <div className="hero-decorations" aria-hidden="true">
              <div className="hero-dotted-circle hero-dotted-1" />
              <div className="hero-dotted-circle hero-dotted-2" />
              <div className="hero-dotted-circle hero-dotted-3" />
              <svg className="hero-scribble hero-scribble-1" viewBox="0 0 120 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M5 20 Q30 5 60 20 T115 25" />
              </svg>
              <svg className="hero-scribble hero-scribble-2" viewBox="0 0 80 30" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                <path d="M10 25 Q40 10 70 20" />
              </svg>
              <svg className="hero-graffiti hero-graffiti-1" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
                <path d="M5 18 Q25 8 50 15 Q75 22 95 12" />
              </svg>
              <div className="hero-doodle" />
            </div>
          )}
          <p className="hero-subtitle">
            Drop in your curriculum files and instantly search topics, skills,
            and learning outcomes—just like chatting with an AI.
          </p>
        </section>

        <section className="workspace" aria-label="Upload and search">
          <div className="drop-search">
            <div className="dropzone" role="button" tabIndex={0}>
              <div className="dropzone-inner">
                <div className="dropzone-icon">⤓</div>
                <div className="dropzone-copy">
                  <p className="dropzone-title">Drop your curriculum here</p>
                  <p className="dropzone-subtitle">
                    Or click to browse files. We support PDF, DOCX, and TXT.
                  </p>
                </div>
              </div>
            </div>

            <div className="search-shell">
              <div className="search-row">
                <input
                  className="search-input"
                  type="text"
                  placeholder="Ask anything about your curriculum..."
                  aria-label="Search within your curriculum"
                />
                <button className="search-button" type="button">
                  Search
                </button>
              </div>

              <div className="search-hints">
                <span className="hint-label">Try:</span>
                <button className="hint-pill" type="button">
                  Map topics to standards
                </button>
                <button className="hint-pill" type="button">
                  Find gaps in week 3
                </button>
                <button className="hint-pill" type="button">
                  List all learning outcomes
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
