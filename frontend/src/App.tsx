import { useState, useRef, useEffect } from 'react'
import './App.css'
import * as api from './api/client'

type Theme = 'dark' | 'light'
type Page = 'home' | 'about' | 'login' | 'signup'
type Persona = 'students' | 'institutions' | 'industry'

function App() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')
  const [activePage, setActivePage] = useState<Page>('home')
  const [persona, setPersona] = useState<Persona>('students')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  function goTo(page: Page) {
    setActivePage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearching(true)
    setSearchResult(null)
    try {
      const data = await api.search(searchQuery.trim())
      setSearchResult(data.message ?? `Found ${(data.results ?? []).length} result(s).`)
    } catch (e) {
      setSearchResult(e instanceof Error ? e.message : 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    const list = Array.from(files)
    setUploading(true)
    setUploadedFiles([])
    try {
      const data = await api.upload(list)
      setUploadedFiles(data.uploaded ?? [])
    } catch (e) {
      setUploadedFiles([])
      setSearchResult(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const personaImage =
    persona === 'students'
      ? '/persona-students.png'
      : persona === 'institutions'
        ? '/persona-institutions.png'
        : '/persona-industry.png'

  return (
    <div className={`app theme-${theme}`}>
      <nav className="nav-bar">
        <header className="app-header">
          <button
            className="brand"
            type="button"
            onClick={() => goTo('home')}
            aria-label="Go to home"
          >
            <div className="brand-text">
              <span className="brand-title">ORCA</span>
              <span className="brand-subtitle">Navigate your career with precision.</span>
            </div>
          </button>

          <nav className="nav">
            <button
              className={`nav-link ${activePage === 'home' ? 'nav-link-active' : ''}`}
              type="button"
              onClick={() => goTo('home')}
            >
              Home
            </button>
            <button
              className={`nav-link ${activePage === 'about' ? 'nav-link-active' : ''}`}
              type="button"
              onClick={() => goTo('about')}
            >
              About
            </button>

            <div className="theme-switch" role="group" aria-label="Theme">
              <button
                className={`theme-switch-btn ${theme === 'dark' ? 'active' : ''}`}
                type="button"
                onClick={() => setTheme('dark')}
                aria-pressed={theme === 'dark'}
                aria-label="Dark theme"
              >
                <svg
                  className="theme-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </button>
              <button
                className={`theme-switch-btn ${theme === 'light' ? 'active' : ''}`}
                type="button"
                onClick={() => setTheme('light')}
                aria-pressed={theme === 'light'}
                aria-label="Light theme"
              >
                <svg
                  className="theme-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </button>
            </div>

            <button
              className={`nav-link nav-auth ${activePage === 'login' || activePage === 'signup' ? 'nav-link-active' : ''}`}
              type="button"
              onClick={() => goTo('login')}
            >
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
                  <button className="profile-menu-item" type="button" role="menuitem" onClick={() => goTo('home')}>
                    Profile
                  </button>
                  <button className="profile-menu-item" type="button" role="menuitem" onClick={() => goTo('about')}>
                    Settings
                  </button>
                  <button className="profile-menu-item" type="button" role="menuitem" onClick={() => goTo('about')}>
                    Privacy Policy
                  </button>
                  <button className="profile-menu-item" type="button" role="menuitem" onClick={() => goTo('login')}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </nav>
        </header>
      </nav>

      <main className="app-main">
        {activePage === 'home' && (
          <>
            <section className="hero" aria-label="ORCA career navigation">
              {theme === 'dark' && <p className="hero-kicker">AI-powered career navigation</p>}
              <h1 className="hero-title">Navigate your career with precision.</h1>

              <p className="hero-subtitle">
                Upload your resume and let ORCA map your skills to the right opportunities, identify gaps, and chart the
                exact steps to get where you want to go.
              </p>
            </section>

            <section className="workspace" aria-label="Upload and search">
              <div className="drop-search">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  className="visually-hidden"
                  aria-hidden
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <div
                  className="dropzone"
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleFiles(e.dataTransfer?.files ?? null)
                  }}
                >
                  <div className="dropzone-inner">
                    <div className="dropzone-icon">⤓</div>
                    <div className="dropzone-copy">
                      <p className="dropzone-title">Drop your curriculum here</p>
                      <p className="dropzone-subtitle">
                        Or click to browse files. We support PDF, DOCX, and TXT.
                      </p>
                      {uploading && <p className="dropzone-status">Uploading…</p>}
                      {uploadedFiles.length > 0 && (
                        <p className="dropzone-status">Uploaded: {uploadedFiles.join(', ')}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="search-shell">
                  <div className="search-row">
                    <input
                      className="search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Ask anything about your curriculum..."
                      aria-label="Search within your curriculum"
                    />
                    <button
                      className="search-button"
                      type="button"
                      disabled={searching || !searchQuery.trim()}
                      onClick={handleSearch}
                    >
                      {searching ? 'Searching…' : 'Search'}
                    </button>
                  </div>
                  {searchResult && (
                    <p className="search-result" role="status">
                      {searchResult}
                    </p>
                  )}

                  <div className="search-hints">
                    <span className="hint-label">Try:</span>
                    <button
                      className="hint-pill"
                      type="button"
                      onClick={() => {
                        setSearchQuery('Map topics to standards')
                        setSearchResult(null)
                      }}
                    >
                      Map topics to standards
                    </button>
                    <button
                      className="hint-pill"
                      type="button"
                      onClick={() => {
                        setSearchQuery('Find gaps in week 3')
                        setSearchResult(null)
                      }}
                    >
                      Find gaps in week 3
                    </button>
                    <button
                      className="hint-pill"
                      type="button"
                      onClick={() => {
                        setSearchQuery('List all learning outcomes')
                        setSearchResult(null)
                      }}
                    >
                      List all learning outcomes
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="ai-product" aria-label="AI product overview">
              <div className="ai-product-copy">
                <p className="section-kicker">Our AI engine</p>
                <h2 className="section-title">A humanoid co‑pilot for curriculum design.</h2>
                <p className="section-body">
                  Curriculum Mapper analyses every syllabus, module outline, and assessment rubric to build a living
                  knowledge graph of your program. Our conversational agent surfaces hidden overlaps, gaps, and
                  dependencies in seconds.
                </p>
                <ul className="feature-list">
                  <li>
                    <span className="feature-dot" />
                    Topic & standard alignment suggestions powered by large language models.
                  </li>
                  <li>
                    <span className="feature-dot" />
                    Automatic skill tagging across courses with explainable rationales.
                  </li>
                  <li>
                    <span className="feature-dot" />
                    Scenario-based Q&amp;A so faculty can test curriculum resilience.
                  </li>
                </ul>
              </div>
              <div className="ai-product-visual" aria-hidden="true">
                <div className="robot-frame">
                  <img src="/ai-robot.png" alt="" className="robot-image" />
                  <div className="robot-frame-glow" />
                </div>
              </div>
            </section>

            <section className="ai-grid" aria-label="AI capabilities">
              <div className="ai-grid-card">
                <h3>Live curriculum radar</h3>
                <p>See how every change to a course ripples across programs, outcomes, and accreditation standards.</p>
              </div>
              <div className="ai-grid-card">
                <h3>Faculty‑first workflows</h3>
                <p>
                  Draft mappings in natural language, then export clean documentation that fits accreditation templates.
                </p>
              </div>
              <div className="ai-grid-card">
                <h3>Privacy‑aware by design</h3>
                <p>All documents stay inside your institution&rsquo;s private workspace with strict access controls.</p>
              </div>
              <div className="ai-grid-card">
                <h3>Explainable suggestions</h3>
                <p>The AI shows exactly which passages informed a recommendation so teams can trust every change.</p>
              </div>
            </section>

            <section className="personas" aria-label="Who benefits from Curriculum Mapper">
              <div className="personas-header">
                <p className="section-kicker">Who it&apos;s for</p>
                <h2 className="section-title">Curriculum Mapper connects every stakeholder.</h2>
              </div>

              <div className="persona-tabs" role="tablist" aria-label="Primary users">
                <button
                  type="button"
                  className={`persona-tab ${persona === 'students' ? 'persona-tab-active' : ''}`}
                  role="tab"
                  aria-selected={persona === 'students'}
                  onClick={() => setPersona('students')}
                >
                  Students
                </button>
                <button
                  type="button"
                  className={`persona-tab ${persona === 'institutions' ? 'persona-tab-active' : ''}`}
                  role="tab"
                  aria-selected={persona === 'institutions'}
                  onClick={() => setPersona('institutions')}
                >
                  Institutes &amp; universities
                </button>
                <button
                  type="button"
                  className={`persona-tab ${persona === 'industry' ? 'persona-tab-active' : ''}`}
                  role="tab"
                  aria-selected={persona === 'industry'}
                  onClick={() => setPersona('industry')}
                >
                  Recruiters &amp; industry
                </button>
              </div>

              <div className="persona-layout">
                <div className="persona-visual" aria-hidden="true">
                  <div
                    className={`persona-orbit ${
                      persona === 'students'
                        ? 'persona-orbit-students'
                        : persona === 'institutions'
                          ? 'persona-orbit-institutions'
                          : 'persona-orbit-industry'
                    }`}
                  >
                    <img src={personaImage} alt="" className="persona-image" />
                  </div>
                </div>

                <div className="persona-copy">
                  {persona === 'students' && (
                    <>
                      <h3 className="persona-title">For students</h3>
                      <ul className="persona-points">
                        <li>See exactly which courses build the skills you care about.</li>
                        <li>Surface gaps in your learning path before enrolment deadlines.</li>
                        <li>Search outcomes, projects, and assessments like chatting with an AI.</li>
                        <li>Export personalised skill maps to share with mentors and advisors.</li>
                        <li>Discover electives that align with internships and future roles.</li>
                      </ul>
                    </>
                  )}
                  {persona === 'institutions' && (
                    <>
                      <h3 className="persona-title">For institutes &amp; universities</h3>
                      <ul className="persona-points">
                        <li>Maintain a living, searchable map of programmes, outcomes, and standards.</li>
                        <li>Spot overlap and gaps across departments before accreditation visits.</li>
                        <li>Generate clear, audit-ready documentation from conversational queries.</li>
                        <li>Coordinate curriculum updates across faculty with shared AI insights.</li>
                        <li>Communicate programme strengths to leadership with data, not spreadsheets.</li>
                      </ul>
                    </>
                  )}
                  {persona === 'industry' && (
                    <>
                      <h3 className="persona-title">For recruiters &amp; industry partners</h3>
                      <ul className="persona-points">
                        <li>Understand which skills and tools graduates actually practice in class.</li>
                        <li>Co-design modules with faculty and see exactly where they land in the map.</li>
                        <li>Align hiring pipelines with cohorts that match your capability needs.</li>
                        <li>Share feedback loops so curricula keep pace with emerging roles.</li>
                        <li>Spot partnership opportunities across programmes and campuses.</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {activePage === 'about' && (
          <section className="content-page">
            <p className="section-kicker">About</p>
            <h2 className="section-title">Built with educators, for educators.</h2>
            <p className="section-body">
              Curriculum Mapper was designed alongside programme directors, accreditation specialists, and instructional
              designers who needed a clearer view of how everything connects.
            </p>
          </section>
        )}

        {(activePage === 'login' || activePage === 'signup') && (
          <section className="auth-page" aria-label="Authentication">
            <div className="auth-tech-backdrop" aria-hidden="true" />
            <div className="auth-card">
              <div className="auth-tabs" role="tablist" aria-label="Authentication">
                <button
                  className={`auth-tab ${activePage === 'login' ? 'auth-tab-active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={activePage === 'login'}
                  onClick={() => setActivePage('login')}
                >
                  Login
                </button>
                <button
                  className={`auth-tab ${activePage === 'signup' ? 'auth-tab-active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={activePage === 'signup'}
                  onClick={() => setActivePage('signup')}
                >
                  Sign up
                </button>
              </div>

              <h2 className="auth-title">
                {activePage === 'login' ? 'Welcome back, curriculum architect.' : 'Create your Curriculum Mapper space.'}
              </h2>
              <p className="auth-subtitle">
                {activePage === 'login'
                  ? 'Sign in to continue mapping, refining, and exploring your programmes.'
                  : 'Start a secure workspace for your team to design and maintain curricula together.'}
              </p>

              <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
                <label className="auth-field">
                  <span>Email</span>
                  <input type="email" required placeholder="you@university.edu" />
                </label>
                <label className="auth-field">
                  <span>Password</span>
                  <input type="password" required placeholder="Enter a secure password" />
                </label>
                {activePage === 'signup' && (
                  <label className="auth-field">
                    <span>Institution</span>
                    <input type="text" required placeholder="e.g. Horizon University" />
                  </label>
                )}

                <button className="auth-submit" type="submit">
                  {activePage === 'login' ? 'Continue' : 'Create account'}
                </button>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
