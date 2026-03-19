import { useState, useRef, useEffect } from 'react'
import './App.css'
import * as api from './api/client'
import type { AnalysisResult } from './api/client'

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
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [searching, setSearching] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [extractedTopics, setExtractedTopics] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'extracting' | 'done' | 'error'>('idle')
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
    if (extractedTopics.length === 0) {
      setSearchResult('Please upload a curriculum file first so the AI can extract its topics.')
      return
    }
    setSearching(true)
    setSearchResult(null)
    setAnalysisResult(null)
    try {
      const data = await api.analyze(searchQuery.trim(), extractedTopics)
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis)
      } else {
        setSearchResult('Analysis returned no results.')
      }
    } catch (e) {
      setSearchResult(e instanceof Error ? e.message : 'Analysis failed. Make sure the backend is running with a valid GEMINI_API_KEY.')
    } finally {
      setSearching(false)
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    const list = Array.from(files)
    setUploading(true)
    setUploadedFiles([])
    setExtractedTopics([])
    setExtractionStatus('extracting')
    setAnalysisResult(null)
    setSearchResult(null)
    try {
      const data = await api.upload(list)
      setUploadedFiles(data.uploaded ?? [])
      if (data.topics && data.topics.length > 0) {
        setExtractedTopics(data.topics)
        setExtractionStatus('done')
      } else {
        setExtractionStatus('error')
        setSearchResult(data.warning ?? 'No topics could be extracted from the file.')
      }
    } catch (e) {
      setUploadedFiles([])
      setExtractionStatus('error')
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
            <div className="brand-mark">CM</div>
            <div className="brand-text">
              <span className="brand-title">Curriculum Mapper</span>
              <span className="brand-subtitle">AI-powered course design</span>
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
            <section className="hero" aria-label="Curriculum mapper introduction">
              {theme === 'dark' && <p className="hero-kicker">Smart curriculum mapping</p>}
              <h1 className="hero-title">Turn messy syllabi into a clear, searchable map.</h1>
              {theme === 'light' && (
                <div className="hero-decorations" aria-hidden="true">
                  <div className="hero-dotted-circle hero-dotted-1" />
                  <div className="hero-dotted-circle hero-dotted-2" />
                  <div className="hero-dotted-circle hero-dotted-3" />
                  <svg
                    className="hero-scribble hero-scribble-1"
                    viewBox="0 0 120 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M5 20 Q30 5 60 20 T115 25" />
                  </svg>
                  <svg
                    className="hero-scribble hero-scribble-2"
                    viewBox="0 0 80 30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  >
                    <path d="M10 25 Q40 10 70 20" />
                  </svg>
                  <svg
                    className="hero-graffiti hero-graffiti-1"
                    viewBox="0 0 100 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                  >
                    <path d="M5 18 Q25 8 50 15 Q75 22 95 12" />
                  </svg>
                  <div className="hero-doodle" />
                </div>
              )}
              <p className="hero-subtitle">
                Drop in your curriculum files and instantly search topics, skills, and learning outcomes—just like
                chatting with an AI.
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
                      {uploading && <p className="dropzone-status status-loading">⏳ Uploading and extracting topics with AI…</p>}
                      {!uploading && extractionStatus === 'done' && (
                        <p className="dropzone-status status-success">✅ {extractedTopics.length} topics extracted — ready to analyse</p>
                      )}
                      {!uploading && extractionStatus === 'error' && (
                        <p className="dropzone-status status-error">⚠️ Topic extraction failed. Try a different file.</p>
                      )}
                      {!uploading && uploadedFiles.length > 0 && extractionStatus !== 'done' && extractionStatus !== 'error' && (
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
                      placeholder="Enter a role or keywords (e.g. Data Engineer, UiPath Developer)..."
                      aria-label="Search within your curriculum"
                    />
                    <button
                      className="search-button"
                      type="button"
                      disabled={searching || !searchQuery.trim()}
                      onClick={handleSearch}
                    >
                      {searching ? 'Analysing…' : 'Analyse'}
                    </button>
                  </div>
                  {searchResult && (
                    <p className="search-result" role="status">
                      {searchResult}
                    </p>
                  )}

                  {analysisResult && (
                    <div className="ai-analysis-panel" role="region" aria-label="AI analysis results">
                      <div className="analysis-header">
                        <div className="analysis-title-row">
                          <div className="analysis-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 16v-4M12 8h.01" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="analysis-title">AI Curriculum Analysis</h3>
                            <p className="analysis-query">Role / Keywords: <span>{searchQuery}</span></p>
                          </div>
                        </div>
                        <div className="analysis-score-wrap" aria-label={`Compatibility score: ${analysisResult.compatibility_score}%`}>
                          <svg className="score-ring" viewBox="0 0 44 44" aria-hidden="true">
                            <circle className="score-ring-bg" cx="22" cy="22" r="18" />
                            <circle
                              className="score-ring-fill"
                              cx="22" cy="22" r="18"
                              strokeDasharray={`${(analysisResult.compatibility_score / 100) * 113.1} 113.1`}
                              style={{ stroke: analysisResult.compatibility_score >= 70 ? '#7c3aed' : analysisResult.compatibility_score >= 40 ? '#2563eb' : '#334155' }}
                            />
                          </svg>
                          <div className="score-label">
                            <span className="score-value">{analysisResult.compatibility_score}%</span>
                            <span className="score-text">match</span>
                          </div>
                        </div>
                      </div>

                      <div className="analysis-summary">
                        <p>{analysisResult.summary}</p>
                      </div>

                      {analysisResult.pointers && analysisResult.pointers.length > 0 && (
                        <div className="analysis-pointers">
                          <p className="pointers-label">Compatibility Breakdown</p>
                          <ul className="pointers-list">
                            {analysisResult.pointers.map((pointer, idx) => (
                              <li key={idx} className={`pointer-item pointer-${pointer.match_level}`}>
                                <div className="pointer-header">
                                  <span className={`pointer-badge badge-${pointer.match_level}`}>
                                    {pointer.match_level === 'high' ? '▲ High' : pointer.match_level === 'medium' ? '◆ Medium' : '▼ Low'}
                                  </span>
                                  <span className="pointer-topic">{pointer.topic}</span>
                                </div>
                                <p className="pointer-relevance">{pointer.relevance}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="search-hints">
                    <span className="hint-label">Try:</span>
                    <button
                      className="hint-pill"
                      type="button"
                      onClick={() => {
                        setSearchQuery('Data Engineer')
                        setSearchResult(null)
                        setAnalysisResult(null)
                      }}
                    >
                      Data Engineer
                    </button>
                    <button
                      className="hint-pill"
                      type="button"
                      onClick={() => {
                        setSearchQuery('RPA Developer')
                        setSearchResult(null)
                        setAnalysisResult(null)
                      }}
                    >
                      RPA Developer
                    </button>
                    <button
                      className="hint-pill"
                      type="button"
                      onClick={() => {
                        setSearchQuery('Machine Learning, Python, Automation')
                        setSearchResult(null)
                        setAnalysisResult(null)
                      }}
                    >
                      ML & Automation skills
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
