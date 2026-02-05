import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">CM</div>
          <div className="brand-text">
            <span className="brand-title">Curriculum Mapper</span>
            <span className="brand-subtitle">AI-powered course design</span>
          </div>
        </div>

        <nav className="nav">
          <button className="nav-link" type="button">
            Privacy
          </button>
          <button className="nav-link" type="button">
            Login
          </button>
          <button className="nav-avatar" type="button" aria-label="Profile">
            <span className="nav-avatar-initial">R</span>
          </button>
        </nav>
      </header>

      <main className="app-main">
        <section className="hero" aria-label="Curriculum mapper introduction">
          <p className="hero-kicker">Smart curriculum mapping</p>
          <h1 className="hero-title">
            Turn messy syllabi into a clear, searchable map.
          </h1>
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
