import React, { useState, useEffect } from 'react';
import { fetchPortfolioData, sendContactMessage, adminLogin, fetchAdminMessages, updatePersonalInfo } from './api';

function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [scrolled, setScrolled] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState(null);

  // Admin state
  const [loginForm, setLoginForm] = useState({ email: 'admin@amarnath.info', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('admin_token') || '');
  const [messages, setMessages] = useState([]);
  const [adminTab, setAdminTab] = useState('personal');
  const [editPersonal, setEditPersonal] = useState({ name: '', title: '', phone: '', email: '', summary: '' });
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    const loadData = async () => {
      setLoading(true);
      const res = await fetchPortfolioData();
      setData(res);
      if (res && res.personal) {
        setEditPersonal(res.personal);
      }
      setLoading(false);
    };
    loadData();

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const res = await adminLogin(loginForm);
    setLoginLoading(false);

    if (res.status && res.token) {
      localStorage.setItem('admin_token', res.token);
      setAdminToken(res.token);
      navigateTo('/admin/dashboard');
    } else {
      setLoginError(res.message || 'Invalid email or password credentials.');
    }
  };

  const loadAdminData = async () => {
    const msgs = await fetchAdminMessages();
    if (msgs.status) {
      setMessages(msgs.data);
    }
  };

  useEffect(() => {
    if (route === '/admin/dashboard') {
      if (!adminToken) {
        navigateTo('/admin/login');
      } else {
        loadAdminData();
      }
    }
  }, [route, adminToken]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAdminToken('');
    navigateTo('/admin/login');
  };

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setSaveStatus('saving');
    const res = await updatePersonalInfo(editPersonal);
    if (res.status) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      setSaveStatus('error');
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    try {
      await sendContactMessage(contactForm);
      setFormStatus('success');
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      setFormStatus('error');
    }
  };

  const scrollTo = (id) => {
    if (route !== '/') {
      navigateTo('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // ==========================================
  // ROUTE: Admin Login (https://amarnath.info/admin/login)
  // ==========================================
  if (route === '/admin/login') {
    return (
      <div className="portfolio-app" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16' }}>
        <div className="bg-glow bg-glow-1"></div>
        <div className="bg-glow bg-glow-2"></div>

        <div style={{ width: '100%', maxWidth: '440px', padding: '32px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '2rem', color: '#6366f1', fontWeight: 'bold' }}>&lt;Amarnath/&gt;</span>
            <h2 style={{ color: '#ffffff', marginTop: '8px', fontSize: '1.5rem', fontWeight: 600 }}>Backend Admin Portal</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Domain: amarnath.info/admin/login</p>
          </div>

          {loginError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem', textAlign: 'center' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i> {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.875rem' }}>Admin Email</label>
              <input 
                type="email" 
                className="form-input"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required 
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.875rem' }}>Password</label>
              <input 
                type="password" 
                className="form-input"
                placeholder="Enter admin password (default: admin123)"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ width: '100%', padding: '14px', borderRadius: '8px', fontSize: '1rem', fontWeight: 600 }} disabled={loginLoading}>
              {loginLoading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Validating Credentials...</> : <><i className="fa-solid fa-right-to-bracket"></i> Login to Dashboard</>}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button onClick={() => navigateTo('/')} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '0.875rem' }}>
              &larr; Back to Portfolio Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ROUTE: Admin Dashboard (https://amarnath.info/admin/dashboard)
  // ==========================================
  if (route === '/admin/dashboard') {
    return (
      <div className="portfolio-app" style={{ minHeight: '100vh', background: '#090d16', color: '#fff' }}>
        <header className="navbar scrolled">
          <div className="container nav-container" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="logo-accent" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>&lt;Amarnath Control Panel/&gt;</span>
              <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>amarnath.info</span>
            </div>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
            </button>
          </div>
        </header>

        <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #1e293b', pb: '12px' }}>
            <button 
              className={`filter-btn ${adminTab === 'personal' ? 'active' : ''}`}
              onClick={() => setAdminTab('personal')}
            >
              <i className="fa-solid fa-user-pen"></i> Personal Info
            </button>
            <button 
              className={`filter-btn ${adminTab === 'messages' ? 'active' : ''}`}
              onClick={() => setAdminTab('messages')}
            >
              <i className="fa-solid fa-inbox"></i> Inquiries Inbox ({messages.length})
            </button>
          </div>

          {adminTab === 'personal' && (
            <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <h3 style={{ marginBottom: '16px', color: '#818cf8' }}>Update Dynamic Portfolio Content</h3>
              {saveStatus === 'success' && <div style={{ color: '#22c55e', padding: '10px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px', marginBottom: '16px' }}>✓ Personal Info updated successfully in Laravel Database!</div>}
              <form onSubmit={handleSavePersonal}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', mb: '4px' }}>Full Name</label>
                    <input type="text" className="form-input" style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '10px', borderRadius: '6px' }} value={editPersonal.name || ''} onChange={(e) => setEditPersonal({ ...editPersonal, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', mb: '4px' }}>Professional Title</label>
                    <input type="text" className="form-input" style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '10px', borderRadius: '6px' }} value={editPersonal.title || ''} onChange={(e) => setEditPersonal({ ...editPersonal, title: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', mb: '4px' }}>Phone</label>
                    <input type="text" className="form-input" style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '10px', borderRadius: '6px' }} value={editPersonal.phone || ''} onChange={(e) => setEditPersonal({ ...editPersonal, phone: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', mb: '4px' }}>Email</label>
                    <input type="email" className="form-input" style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '10px', borderRadius: '6px' }} value={editPersonal.email || ''} onChange={(e) => setEditPersonal({ ...editPersonal, email: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', mb: '4px' }}>Bio / Executive Summary</label>
                  <textarea className="form-input" rows="4" style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '10px', borderRadius: '6px' }} value={editPersonal.summary || ''} onChange={(e) => setEditPersonal({ ...editPersonal, summary: e.target.value })}></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                  {saveStatus === 'saving' ? 'Saving to Database...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {adminTab === 'messages' && (
            <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <h3 style={{ marginBottom: '16px', color: '#818cf8' }}>Received Website Inquiries</h3>
              {messages.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>No inquiries received yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {messages.map((m, idx) => (
                    <div key={idx} style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#f8fafc' }}>{m.name} ({m.email})</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(m.created_at || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{m.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // ROUTE: Main Portfolio Landing Page (https://amarnath.info/)
  // ==========================================
  if (loading || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#818cf8', fontSize: '1.5rem', fontFamily: 'sans-serif', background: '#090d16' }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: '12px' }}></i> Connecting to Laravel Engine...
      </div>
    );
  }

  const { personal, strengths, skills, experiences, projects, education } = data;
  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.category === filter);

  return (
    <div className="portfolio-app">
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>

      {/* Navbar */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <a href="#hero" className="logo" onClick={(e) => { e.preventDefault(); scrollTo('hero'); }}>
            <span className="logo-accent">&lt;</span>Amarnath<span className="logo-accent">/&gt;</span>
          </a>
          <nav className="nav-menu">
            <button className="nav-link" onClick={() => scrollTo('about')}><i className="fa-solid fa-user"></i> About</button>
            <button className="nav-link" onClick={() => scrollTo('skills')}><i className="fa-solid fa-code"></i> Skills</button>
            <button className="nav-link" onClick={() => scrollTo('experience')}><i className="fa-solid fa-briefcase"></i> Experience</button>
            <button className="nav-link" onClick={() => scrollTo('projects')}><i className="fa-solid fa-folder-open"></i> Projects</button>
            <button className="nav-link" onClick={() => navigateTo('/admin/login')} style={{ color: '#818cf8' }}><i className="fa-solid fa-lock"></i> Admin</button>
            <button className="nav-link nav-btn" onClick={() => scrollTo('contact')}><i className="fa-solid fa-envelope"></i> Hire Me</button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero" id="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="badge-pill">
              <span className="pulse-dot"></span> Dynamic Content Powered by Laravel Backend API
            </div>
            <h1 className="hero-title">
              Hi, I'm <span className="gradient-text">{personal.name}</span>
            </h1>
            <h2 className="hero-subtitle">{personal.title}</h2>
            <p className="hero-description">{personal.summary}</p>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{personal.experience_years || 5}+</span>
                <span className="stat-label">Years Exp.</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10+</span>
                <span className="stat-label">Enterprise Apps</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">REST API Driven</span>
              </div>
            </div>

            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => scrollTo('projects')}><i className="fa-solid fa-rocket"></i> Key Projects</button>
              <button className="btn btn-secondary" onClick={() => scrollTo('contact')}><i className="fa-solid fa-paper-plane"></i> Contact Me</button>
            </div>

            <div className="social-links">
              <a href={personal.github} target="_blank" rel="noreferrer"><i className="fa-brands fa-github"></i></a>
              <a href={personal.linkedin} target="_blank" rel="noreferrer"><i className="fa-brands fa-linkedin-in"></i></a>
              <a href={`mailto:${personal.email}`}><i className="fa-solid fa-envelope"></i></a>
              <a href={`tel:${personal.phone}`}><i className="fa-solid fa-phone"></i></a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="code-card-wrapper">
              <div className="code-card-header">
                <div className="mac-dots">
                  <span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span>
                </div>
                <span className="card-title">PortfolioApiController.php</span>
              </div>
              <div className="code-card-body">
                <pre><code><span style={{color: '#f472b6'}}>GET</span> /api/portfolio
<span style={{color: '#38bdf8'}}>Response 200 OK</span>

&#123;
  <span style={{color: '#fbbf24'}}>"status"</span>: <span style={{color: '#34d399'}}>true</span>,
  <span style={{color: '#fbbf24'}}>"developer"</span>: <span style={{color: '#34d399'}}>"Amarnath Chauhan"</span>,
  <span style={{color: '#fbbf24'}}>"backend"</span>: <span style={{color: '#34d399'}}>"Laravel 11 REST API"</span>,
  <span style={{color: '#fbbf24'}}>"frontend"</span>: <span style={{color: '#34d399'}}>"React.js SPA"</span>
&#125;</code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section" id="about">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">OVERVIEW</span>
            <h2 className="section-title">About & Core Strengths</h2>
          </div>
          <div className="strengths-grid">
            {strengths && strengths.map((item, i) => (
              <div key={i} className="strength-card">
                <div className="strength-icon"><i className={`fa-solid ${item.icon}`}></i></div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="section section-dark" id="skills">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">EXPERTISE</span>
            <h2 className="section-title">Technical Skillset</h2>
          </div>
          <div className="skills-wrapper">
            {skills && Object.keys(skills).map((catKey) => (
              <div key={catKey} className="skill-category">
                <h3 className="category-title" style={{ textTransform: 'capitalize' }}>
                  <i className="fa-solid fa-code"></i> {catKey}
                </h3>
                <div className="skill-tags">
                  {skills[catKey].map((s, idx) => (
                    <span key={idx} className={`skill-tag ${s.is_highlighted ? 'highlighted' : ''}`}>
                      <i className={s.icon}></i> {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="section" id="experience">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">CAREER</span>
            <h2 className="section-title">Professional Experience</h2>
          </div>
          <div className="timeline">
            {experiences && experiences.map((exp, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="exp-header">
                    <div>
                      <h3 className="exp-role">{exp.role}</h3>
                      <h4 className="exp-company">{exp.company}</h4>
                    </div>
                    <span className="exp-period"><i className="fa-solid fa-calendar"></i> {exp.period}</span>
                  </div>
                  <ul className="exp-points">
                    {exp.points && exp.points.map((pt, i) => <li key={i}>{pt}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="section section-dark" id="projects">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">PORTFOLIO</span>
            <h2 className="section-title">Key Projects Delivered</h2>
          </div>
          <div className="project-filters">
            {['all', 'enterprise', 'custom', 'cms'].map((cat) => (
              <button key={cat} className={`filter-btn ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="projects-grid">
            {filteredProjects && filteredProjects.map((p) => (
              <div key={p.id} className="project-card">
                <div className="project-banner">
                  <span className="project-tag">{p.tag}</span>
                  <div className="project-icon"><i className={`fa-solid ${p.icon}`}></i></div>
                </div>
                <div className="project-body">
                  <h3 className="project-title">{p.title}</h3>
                  <p className="project-text">{p.description}</p>
                  <div className="project-tech">
                    {p.tech && p.tech.map((t, i) => <span key={i}>{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">EDUCATION</span>
            <h2 className="section-title">Academic Qualifications</h2>
          </div>
          <div className="edu-grid">
            {education && education.map((edu, i) => (
              <div key={i} className="edu-card">
                <div className="edu-icon"><i className={`fa-solid ${edu.icon}`}></i></div>
                <div>
                  <h3>{edu.degree}</h3>
                  <p>{edu.school}</p>
                  <span style={{ color: '#818cf8', fontWeight: 600 }}>{edu.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section section-dark" id="contact">
        <div className="container">
          <div className="contact-box">
            <div className="contact-info">
              <span className="section-subtitle">CONTACT</span>
              <h2 className="contact-title">Let's Connect!</h2>
              <p className="contact-desc">Open for Senior Backend / Full Stack opportunities, freelance consulting, or architecture reviews.</p>
              <div className="contact-details">
                <div className="contact-item">
                  <div className="c-icon"><i className="fa-solid fa-envelope"></i></div>
                  <div><span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>EMAIL</span><br/><a href={`mailto:${personal.email}`} className="c-value">{personal.email}</a></div>
                </div>
                <div className="contact-item">
                  <div className="c-icon"><i className="fa-solid fa-phone"></i></div>
                  <div><span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>PHONE</span><br/><a href={`tel:${personal.phone}`} className="c-value">{personal.phone}</a></div>
                </div>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleContactSubmit}>
              <h3>Send Inquiry to Laravel API</h3>
              {formStatus === 'success' && <div style={{ color: '#22c55e', padding: '10px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px' }}>✓ Inquiry saved to Laravel Database!</div>}
              {formStatus === 'error' && <div style={{ color: '#ef4444', padding: '10px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>✕ Error saving to backend.</div>}
              <input type="text" className="form-input" placeholder="Your Name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required />
              <input type="email" className="form-input" placeholder="Your Email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} required />
              <textarea className="form-input" rows="4" placeholder="Your Message..." value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} required></textarea>
              <button type="submit" className="btn btn-primary btn-full">
                {formStatus === 'sending' ? 'Saving to Laravel...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-container">
          <p>&copy; {new Date().getFullYear()} {personal.name}. Powered by Laravel & React.</p>
          <div className="footer-links">
            <a href={personal.github} target="_blank" rel="noreferrer">GitHub</a>
            <a href={personal.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
