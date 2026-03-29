import { useState, useRef, useEffect } from 'react'
import './App.css'
import * as api from './api/client'
import type { JobMatch, SkillGapResponse } from './api/client'

type Theme = 'dark' | 'light'
type Page = 'home' | 'login' | 'signup'
type Persona = 'students' | 'institutions' | 'industry'

function App() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')
  const [activePage, setActivePage] = useState<Page>('home')
  const [persona, setPersona] = useState<Persona>('students')
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [extractedTopics, setExtractedTopics] = useState<string[]>([])
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([])
  const [uploadWarning, setUploadWarning] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'extracting' | 'done' | 'error'>('idle')
  const [skillsText, setSkillsText] = useState('')
  const [skillsMatching, setSkillsMatching] = useState(false)
  const [skillsMatchError, setSkillsMatchError] = useState<string | null>(null)
  const [selectedJobForGap, setSelectedJobForGap] = useState<string | null>(null)
  const [skillGapData, setSkillGapData] = useState<SkillGapResponse | null>(null)
  const [skillGapLoading, setSkillGapLoading] = useState(false)
  const [skillGapError, setSkillGapError] = useState<string | null>(null)
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

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    const list = Array.from(files)
    setUploading(true)
    setUploadedFiles([])
    setExtractedTopics([])
    setExtractionStatus('extracting')
    setUploadWarning(null)
    setJobMatches([])
    try {
      const data = await api.upload(list)
      setUploadedFiles(data.uploaded ?? [])
      if (data.warning) setUploadWarning(data.warning)
      setJobMatches(data.job_matches ?? [])
      if (data.topics && data.topics.length > 0) {
        setExtractedTopics(data.topics)
        setExtractionStatus('done')
      } else {
        setExtractionStatus('error')
      }
    } catch (e) {
      setUploadedFiles([])
      setJobMatches([])
      setExtractionStatus('error')
    } finally {
      setUploading(false)
    }
  }

  async function handleMatchJobs() {
    if (!skillsText.trim()) return
    setSkillsMatching(true)
    setSkillsMatchError(null)
    setJobMatches([])
    setExtractedTopics([])
    setExtractionStatus('idle')
    try {
      const data = await api.matchJobs(skillsText.trim(), 5)
      setJobMatches(data.job_matches ?? [])
      const skills = skillsText.split(',').map((s) => s.trim()).filter(Boolean)
      setExtractedTopics(skills)
      setExtractionStatus('done')
    } catch (e) {
      setSkillsMatchError(e instanceof Error ? e.message : 'Job matching failed.')
    } finally {
      setSkillsMatching(false)
    }
  }

  async function handleViewSkillGap(job: JobMatch) {
    if (selectedJobForGap === job.job_title) {
      setSelectedJobForGap(null)
      setSkillGapData(null)
      setSkillGapError(null)
      return
    }
    setSelectedJobForGap(job.job_title)
    setSkillGapLoading(true)
    setSkillGapError(null)
    setSkillGapData(null)
    try {
      const data = await api.getSkillGap(extractedTopics, job.job_title, job.skills_required)
      setSkillGapData(data)
    } catch (e) {
      setSkillGapError(e instanceof Error ? e.message : 'Skill gap analysis failed.')
    } finally {
      setSkillGapLoading(false)
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
            <img src="/orca-logo.png" alt="ORCA logo" className="brand-logo" />
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
                  <button className="profile-menu-item" type="button" role="menuitem">
                    Settings
                  </button>
                  <button className="profile-menu-item" type="button" role="menuitem">
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
                      {uploading && <p className="dropzone-status status-loading">⏳ Uploading and extracting topics with AI…</p>}
                      {!uploading && extractionStatus === 'done' && (
                        <p className="dropzone-status status-success">✅ {extractedTopics.length} topics extracted — job matches ready</p>
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

                {extractionStatus === 'done' && extractedTopics.length > 0 && (
                  <div className="skills-extraction-panel" aria-label="Extracted skills">
                    <div className="skills-panel-header">
                      <h3 className="skills-panel-title">Extracted skills &amp; topics</h3>
                      <p className="skills-panel-sub">
                        Pulled from your document into <code>extracted_content[].topics</code> — used to match industry roles.
                      </p>
                    </div>
                    <ul className="skills-chip-list">
                      {extractedTopics.map((skill) => (
                        <li key={skill} className="skills-chip">
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {uploadWarning && extractionStatus === 'done' && (
                  <p className="upload-warning-banner" role="status">
                    {uploadWarning}
                  </p>
                )}

                {jobMatches.length > 0 && (
                  <div className="job-matches-panel" aria-label="Suggested job roles">
                    <div className="job-matches-header">
                      <h3 className="job-matches-title">Suggested job roles</h3>
                      <p className="job-matches-sub">
                      Matched from the project job dataset using your extracted skills (semantic similarity).

                      </p>
                    </div>
                    <ul className="job-matches-list">
                    {jobMatches.slice(0, 5).map((job) => (
                        <li key={job.job_title} className="job-match-card">
                          <div className="job-match-top">
                            <span className="job-match-title">{job.job_title}</span>
                            <span className="job-match-score">
                              {(job.match_score * 100).toFixed(2)}%
                            </span>
                          </div>
                          <div className="job-match-meta">
                            <span>{job.industry}</span>
                            <span>{job.experience_level}</span>
                          </div>
                          <p className="job-match-skills">
                            <strong>Typical skills:</strong> {job.skills_required}
                          </p>
                          <button
                            className={`skill-gap-btn ${selectedJobForGap === job.job_title ? 'skill-gap-btn-active' : ''}`}
                            type="button"
                            onClick={() => handleViewSkillGap(job)}
                            disabled={skillGapLoading && selectedJobForGap === job.job_title}
                          >
                            {skillGapLoading && selectedJobForGap === job.job_title
                              ? '⏳ Analyzing…'
                              : selectedJobForGap === job.job_title
                                ? '✕ Close Gap Analysis'
                                : '🔍 View Skill Gap & Roadmap'}
                          </button>

                          {selectedJobForGap === job.job_title && skillGapError && (
                            <p className="skill-gap-error" role="alert">{skillGapError}</p>
                          )}

                          {selectedJobForGap === job.job_title && skillGapData && (
                            <div className="skill-gap-panel" aria-label="Skill gap analysis">
                              <div className="skill-gap-header">
                                <div className="skill-gap-meter">
                                  <div className="skill-gap-meter-fill" style={{ width: `${skillGapData.match_percentage}%` }} />
                                </div>
                                <span className="skill-gap-pct">{skillGapData.match_percentage}% skill match</span>
                              </div>

                              <div className="skill-gap-columns">
                                <div className="skill-gap-col">
                                  <h4 className="skill-gap-col-title skill-gap-have">✅ Skills you have ({skillGapData.matched_skills.length})</h4>
                                  <ul className="skill-gap-chips">
                                    {skillGapData.matched_skills.map((s) => (
                                      <li key={s} className="skill-chip-matched">{s}</li>
                                    ))}
                                    {skillGapData.matched_skills.length === 0 && (
                                      <li className="skill-chip-empty">No matching skills found</li>
                                    )}
                                  </ul>
                                </div>
                                <div className="skill-gap-col">
                                  <h4 className="skill-gap-col-title skill-gap-missing">⚠️ Skills to learn ({skillGapData.missing_skills.length})</h4>
                                  <ul className="skill-gap-chips">
                                    {skillGapData.missing_skills.map((s) => (
                                      <li key={s} className="skill-chip-missing">{s}</li>
                                    ))}
                                    {skillGapData.missing_skills.length === 0 && (
                                      <li className="skill-chip-empty">You have all required skills! 🎉</li>
                                    )}
                                  </ul>
                                </div>
                              </div>

                              {skillGapData.roadmap.length > 0 && (
                                <div className="roadmap-section">
                                  <h4 className="roadmap-title">🗺️ Learning Roadmap</h4>
                                  <p className="roadmap-subtitle">Personalized path to close your skill gaps</p>
                                  <div className="roadmap-timeline">
                                    {skillGapData.roadmap.map((item, idx) => (
                                      <div key={item.skill} className={`roadmap-card roadmap-${item.priority}`}>
                                        <div className="roadmap-card-header">
                                          <span className="roadmap-step">{idx + 1}</span>
                                          <div className="roadmap-card-info">
                                            <span className="roadmap-skill-name">{item.skill}</span>
                                            <span className={`roadmap-priority priority-${item.priority}`}>{item.priority}</span>
                                          </div>
                                          <span className="roadmap-time">⏱ {item.estimated_time}</span>
                                        </div>
                                        <p className="roadmap-reason">{item.reason}</p>
                                        <div className="roadmap-resources">
                                          <span className="roadmap-resources-label">Resources:</span>
                                          <ul className="roadmap-resources-list">
                                            {item.resources.map((r, ri) => (
                                              <li key={ri}>{r}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* ── Manual skills text input ── */}
                <div className="skills-input-panel">
                  <div className="skills-input-header">
                    <h3 className="skills-input-title">Or enter your skills manually</h3>
                    <p className="skills-input-sub">
                      Type skills separated by commas — same matching as file upload.
                    </p>
                  </div>
                  <div className="skills-input-row">
                    <input
                      className="skills-input-field"
                      type="text"
                      value={skillsText}
                      onChange={(e) => setSkillsText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleMatchJobs()}
                      placeholder="e.g. Python, Machine Learning, SQL, REST APIs..."
                      aria-label="Enter skills manually"
                    />
                    <button
                      className="skills-input-btn"
                      type="button"
                      disabled={skillsMatching || !skillsText.trim()}
                      onClick={handleMatchJobs}
                    >
                      {skillsMatching ? 'Matching…' : 'Find Jobs'}
                    </button>
                  </div>
                  {skillsMatchError && (
                    <p className="skills-input-error" role="alert">{skillsMatchError}</p>
                  )}
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