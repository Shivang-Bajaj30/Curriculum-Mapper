import { useState, useRef, useEffect } from 'react'
import './App.css'
import * as api from './api/client'

type Theme = 'dark' | 'light'

function App() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')
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
              aria-label="Dark theme"
            >
              <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <button className="hint-pill" type="button" onClick={() => { setSearchQuery('Map topics to standards'); setSearchResult(null); }}>
                  Map topics to standards
                </button>
                <button className="hint-pill" type="button" onClick={() => { setSearchQuery('Find gaps in week 3'); setSearchResult(null); }}>
                  Find gaps in week 3
                </button>
                <button className="hint-pill" type="button" onClick={() => { setSearchQuery('List all learning outcomes'); setSearchResult(null); }}>
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
