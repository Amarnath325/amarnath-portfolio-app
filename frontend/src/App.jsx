import React, { useState, useEffect } from 'react';
import { 
  fetchPortfolioData, 
  sendContactMessage, 
  adminLogin, 
  fetchAdminMessages, 
  updatePersonalInfo,
  fetchAdminProjects,
  saveProject,
  deleteProjectApi,
  fetchAdminSkills,
  saveSkill,
  deleteSkillApi,
  fetchAdminExperiences,
  saveExperience,
  deleteExperienceApi,
  saveNavConfigApi
} from './api';

const DEFAULT_NAV_MENUS = [
  { id: 'about', label: 'About', icon: 'fa-solid fa-user', type: 'section', target: 'about', page_content: '', visible: true, isBtn: false },
  { id: 'skills', label: 'Skills', icon: 'fa-solid fa-code', type: 'section', target: 'skills', page_content: '', visible: true, isBtn: false },
  { id: 'experience', label: 'Experience', icon: 'fa-solid fa-briefcase', type: 'section', target: 'experience', page_content: '', visible: true, isBtn: false },
  { id: 'projects', label: 'Projects', icon: 'fa-solid fa-folder-open', type: 'section', target: 'projects', page_content: '', visible: true, isBtn: false },
  { id: 'admin', label: 'Admin', icon: 'fa-solid fa-lock', type: 'route', target: '/admin/login', page_content: '', visible: true, isBtn: false },
  { id: 'contact', label: 'Hire Me', icon: 'fa-solid fa-envelope', type: 'section', target: 'contact', page_content: '', visible: true, isBtn: true }
];

function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [scrolled, setScrolled] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState(null);

  // Header Nav Items Config state (Saved in localStorage & synced with backend)
  const [navMenus, setNavMenus] = useState(() => {
    const saved = localStorage.getItem('portfolio_nav_menus');
    return saved ? JSON.parse(saved) : DEFAULT_NAV_MENUS;
  });
  const [navSaveStatus, setNavSaveStatus] = useState('');

  // Admin Dashboard State
  const [loginForm, setLoginForm] = useState({ email: 'admin@amarnath.info', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('admin_token') || '');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard Data States
  const [messages, setMessages] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [experiencesList, setExperiencesList] = useState([]);
  const [editPersonal, setEditPersonal] = useState({ name: '', title: '', phone: '', email: '', summary: '' });
  const [saveStatus, setSaveStatus] = useState('');

  // Modal States for Add/Edit CRUD
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'project', 'skill', 'experience', 'nav_menu'
  const [modalItem, setModalItem] = useState({});

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

  const loadAdminDashboardData = async () => {
    const msgs = await fetchAdminMessages();
    if (msgs.status) setMessages(msgs.data || []);

    const projs = await fetchAdminProjects();
    if (projs.status) setProjectsList(projs.data || []);

    const skls = await fetchAdminSkills();
    if (skls.status) setSkillsList(skls.data || []);

    const exps = await fetchAdminExperiences();
    if (exps.status) setExperiencesList(exps.data || []);
  };

  useEffect(() => {
    if (route === '/admin/dashboard') {
      if (!adminToken) {
        navigateTo('/admin/login');
      } else {
        loadAdminDashboardData();
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

  // Header Nav Config Handlers
  const toggleNavVisibility = (id) => {
    const updated = navMenus.map(m => m.id === id ? { ...m, visible: !m.visible } : m);
    setNavMenus(updated);
    localStorage.setItem('portfolio_nav_menus', JSON.stringify(updated));
  };

  const handleSaveNavConfig = async () => {
    setNavSaveStatus('saving');
    localStorage.setItem('portfolio_nav_menus', JSON.stringify(navMenus));
    await saveNavConfigApi(navMenus);
    setNavSaveStatus('success');
    setTimeout(() => setNavSaveStatus(''), 3000);
  };

  const handleSaveModalItem = async (e) => {
    e.preventDefault();
    if (modalType === 'project') {
      await saveProject(modalItem);
      const projs = await fetchAdminProjects();
      if (projs.status) setProjectsList(projs.data || []);
    } else if (modalType === 'skill') {
      await saveSkill(modalItem);
      const skls = await fetchAdminSkills();
      if (skls.status) setSkillsList(skls.data || []);
    } else if (modalType === 'experience') {
      await saveExperience(modalItem);
      const exps = await fetchAdminExperiences();
      if (exps.status) setExperiencesList(exps.data || []);
    } else if (modalType === 'nav_menu') {
      let updated;
      if (modalItem.id) {
        updated = navMenus.map(m => m.id === modalItem.id ? modalItem : m);
      } else {
        const newItem = { 
          ...modalItem, 
          id: 'custom_' + Date.now(), 
          visible: true,
          type: modalItem.type || 'section'
        };
        updated = [...navMenus, newItem];
      }
      setNavMenus(updated);
      localStorage.setItem('portfolio_nav_menus', JSON.stringify(updated));
      await saveNavConfigApi(updated);
    }
    setModalOpen(false);
    setModalItem({});
  };

  const handleDeleteItem = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    if (type === 'project') {
      await deleteProjectApi(id);
      setProjectsList(projectsList.filter(p => p.id !== id));
    } else if (type === 'skill') {
      await deleteSkillApi(id);
      setSkillsList(skillsList.filter(s => s.id !== id));
    } else if (type === 'experience') {
      await deleteExperienceApi(id);
      setExperiencesList(experiencesList.filter(e => e.id !== id));
    } else if (type === 'nav_menu') {
      const updated = navMenus.filter(m => m.id !== id);
      setNavMenus(updated);
      localStorage.setItem('portfolio_nav_menus', JSON.stringify(updated));
      await saveNavConfigApi(updated);
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

  const handleNavClick = (menu) => {
    if (menu.type === 'external') {
      window.open(menu.target, '_blank');
    } else if (menu.type === 'route') {
      navigateTo(menu.target);
    } else {
      // Same page section scroll
      if (route !== '/') {
        navigateTo('/');
        setTimeout(() => {
          const el = document.getElementById(menu.target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        const el = document.getElementById(menu.target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
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

        <div style={{ width: '100%', maxWidth: '440px', padding: '36px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '2rem', color: '#6366f1', fontWeight: '800', letterSpacing: '-0.5px' }}>&lt;Amarnath Control/&gt;</span>
            <h2 style={{ color: '#ffffff', marginTop: '8px', fontSize: '1.4rem', fontWeight: 700 }}>Admin Suite Authentication</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Full Stack Management Portal • amarnath.info</p>
          </div>

          {loginError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.875rem', textAlign: 'center' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i> {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Admin Email</label>
              <input 
                type="email" 
                className="form-input"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.95rem' }}
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required 
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
              <input 
                type="password" 
                className="form-input"
                placeholder="Enter password (default: admin123)"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.95rem' }}
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', border: 'none', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }} disabled={loginLoading}>
              {loginLoading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Authenticating Session...</> : <><i className="fa-solid fa-right-to-bracket"></i> Open Admin Suite</>}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button onClick={() => navigateTo('/')} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '0.875rem' }}>
              &larr; Return to Main Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ROUTE: Admin Dashboard with Sidebar & Advanced UI (https://amarnath.info/admin/dashboard)
  // ==========================================
  if (route === '/admin/dashboard') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#070a12', color: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        
        {/* Sidebar */}
        <aside style={{ 
          width: sidebarCollapsed ? '80px' : '260px', 
          background: 'rgba(15, 23, 42, 0.95)', 
          borderRight: '1px solid rgba(255, 255, 255, 0.08)', 
          display: 'flex', 
          flexDirection: 'column', 
          transition: 'all 0.3s ease',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100
        }}>
          {/* Sidebar Header */}
          <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            {!sidebarCollapsed && <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6366f1', letterSpacing: '-0.5px' }}>&lt;Amarnath/&gt;</span>}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <i className={`fa-solid ${sidebarCollapsed ? 'fa-angles-right' : 'fa-angles-left'}`}></i>
            </button>
          </div>

          {/* User Profile Widget */}
          <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
              AC
            </div>
            {!sidebarCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Amarnath Chauhan</div>
                <div style={{ fontSize: '0.75rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }}></span> Admin Online
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'dashboard', label: 'Overview', icon: 'fa-chart-pie' },
              { id: 'nav_menus', label: 'Header Navigation CMS', icon: 'fa-bars-staggered' },
              { id: 'profile', label: 'Profile & Bio', icon: 'fa-user-gear' },
              { id: 'projects', label: 'Projects Manager', icon: 'fa-folder-kanban' },
              { id: 'skills', label: 'Skills & Stack', icon: 'fa-code' },
              { id: 'experience', label: 'Experiences', icon: 'fa-briefcase' },
              { id: 'messages', label: 'Inquiries Inbox', icon: 'fa-inbox', badge: messages.length },
              { id: 'system', label: 'System Health', icon: 'fa-server' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === item.id ? 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.2) 100%)' : 'transparent',
                  color: activeTab === item.id ? '#818cf8' : '#94a3b8',
                  borderLeft: activeTab === item.id ? '3px solid #6366f1' : '3px solid transparent',
                  fontWeight: activeTab === item.id ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  transition: 'all 0.2s ease'
                }}
              >
                <i className={`fa-solid ${item.icon}`} style={{ fontSize: '1rem', width: '20px' }}></i>
                {!sidebarCollapsed && (
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                )}
                {!sidebarCollapsed && item.badge > 0 && (
                  <span style={{ background: '#6366f1', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer Logout */}
          <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#f87171',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
              }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              {!sidebarCollapsed && <span>Logout Session</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ 
          flex: 1, 
          marginLeft: sidebarCollapsed ? '80px' : '260px', 
          transition: 'margin 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}>
          {/* Header Bar */}
          <header style={{ 
            height: '70px', 
            background: 'rgba(15, 23, 42, 0.8)', 
            backdropFilter: 'blur(16px)', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
            padding: '0 28px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Admin Control Panel</span>
              <span style={{ color: '#475569' }}>/</span>
              <span style={{ color: '#fff', fontWeight: 600, textTransform: 'capitalize' }}>{activeTab}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={() => navigateTo('/')}
                style={{ 
                  background: 'rgba(99, 102, 241, 0.15)', 
                  border: '1px solid rgba(99, 102, 241, 0.3)', 
                  color: '#818cf8', 
                  padding: '8px 16px', 
                  borderRadius: '10px', 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="fa-solid fa-globe"></i> Visit Website (amarnath.info)
              </button>
            </div>
          </header>

          {/* Tab Content Container */}
          <div style={{ padding: '28px', flex: 1 }}>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '24px' }}>System Overview & Quick Stats</h2>
                
                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}><i className="fa-solid fa-folder-kanban"></i></div>
                    <div><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{projectsList.length || 5}</div><div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Active Projects</div></div>
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}><i className="fa-solid fa-code"></i></div>
                    <div><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{skillsList.length || 12}</div><div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Tech Skills</div></div>
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}><i className="fa-solid fa-bars-staggered"></i></div>
                    <div><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{navMenus.length}</div><div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Header Menus</div></div>
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}><i className="fa-solid fa-inbox"></i></div>
                    <div><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{messages.length}</div><div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Inquiries</div></div>
                  </div>
                </div>

                {/* API Status Cards */}
                <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#818cf8' }}><i className="fa-solid fa-network-wired"></i> Connected Services & API Architecture</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>REACT SPA FRONTEND</div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>https://amarnath.info</div>
                      <div style={{ fontSize: '0.8rem', color: '#4ade80', marginTop: '6px' }}>🟢 Hosted on Vercel SPA Engine</div>
                    </div>
                    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>LARAVEL REST BACKEND</div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>https://admin.amarnath.info</div>
                      <div style={{ fontSize: '0.8rem', color: '#4ade80', marginTop: '6px' }}>🟢 Containerized Docker on Render</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HEADER NAVIGATION FULL CRUD CMS MANAGER */}
            {activeTab === 'nav_menus' && (
              <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#818cf8' }}><i className="fa-solid fa-bars-staggered"></i> Frontend Header Navigation CMS (FULL CRUD)</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Create custom menus, set target (Same Page Section vs New Page Route vs External URL), and edit dynamic page content!</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => { setModalType('nav_menu'); setModalItem({ label: '', icon: 'fa-solid fa-link', type: 'section', target: 'about', page_content: '', visible: true, isBtn: false }); setModalOpen(true); }}
                      style={{ padding: '10px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <i className="fa-solid fa-plus"></i> Add New Header Menu
                    </button>
                    <button 
                      onClick={handleSaveNavConfig}
                      style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <i className="fa-solid fa-floppy-disk"></i> {navSaveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>

                {navSaveStatus === 'success' && (
                  <div style={{ color: '#4ade80', padding: '12px', background: 'rgba(34,197,94,0.15)', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem' }}>
                    ✓ Frontend Header Navigation Config updated successfully!
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {navMenus.map((item) => (
                    <div key={item.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                          <i className={item.icon}></i>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {item.label}
                            <span style={{ fontSize: '0.75rem', background: item.type === 'route' ? 'rgba(168,85,247,0.2)' : item.type === 'external' ? 'rgba(234,179,8,0.2)' : 'rgba(99,102,241,0.2)', color: item.type === 'route' ? '#c084fc' : item.type === 'external' ? '#facc15' : '#818cf8', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                              {item.type === 'route' ? '📍 NEW PAGE ROUTE' : item.type === 'external' ? '🔗 EXTERNAL URL' : '📜 SAME PAGE SCROLL'}
                            </span>
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>
                            Target: <code style={{ color: '#818cf8' }}>{item.target}</code>
                          </div>
                        </div>
                      </div>

                      {/* Actions & Status Toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <button onClick={() => { setModalType('nav_menu'); setModalItem(item); setModalOpen(true); }} style={{ background: '#334155', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className="fa-solid fa-pen"></i> Edit
                        </button>
                        <button onClick={() => handleDeleteItem('nav_menu', item.id)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleNavVisibility(item.id)}
                          style={{
                            width: '56px',
                            height: '30px',
                            borderRadius: '15px',
                            background: item.visible ? '#4ade80' : '#475569',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: '#fff',
                            position: 'absolute',
                            top: '3px',
                            left: item.visible ? '29px' : '3px',
                            transition: 'all 0.3s ease'
                          }}></span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PERSONAL INFO */}
            {activeTab === 'profile' && (
              <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '28px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: '#818cf8' }}><i className="fa-solid fa-user-pen"></i> Personal Profile & Bio Settings</h3>
                
                {saveStatus === 'success' && <div style={{ color: '#4ade80', padding: '12px', background: 'rgba(34,197,94,0.15)', borderRadius: '10px', marginBottom: '20px' }}>✓ Personal details updated in Laravel database!</div>}
                
                <form onSubmit={handleSavePersonal}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '8px' }}>Full Name</label>
                      <input type="text" style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#fff' }} value={editPersonal.name || ''} onChange={(e) => setEditPersonal({ ...editPersonal, name: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '8px' }}>Professional Title</label>
                      <input type="text" style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#fff' }} value={editPersonal.title || ''} onChange={(e) => setEditPersonal({ ...editPersonal, title: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '8px' }}>Contact Phone</label>
                      <input type="text" style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#fff' }} value={editPersonal.phone || ''} onChange={(e) => setEditPersonal({ ...editPersonal, phone: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '8px' }}>Email Address</label>
                      <input type="email" style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#fff' }} value={editPersonal.email || ''} onChange={(e) => setEditPersonal({ ...editPersonal, email: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '8px' }}>Executive Bio & Summary</label>
                    <textarea rows="4" style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#fff' }} value={editPersonal.summary || ''} onChange={(e) => setEditPersonal({ ...editPersonal, summary: e.target.value })}></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                    {saveStatus === 'saving' ? 'Saving to Database...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 4: PROJECTS MANAGER */}
            {activeTab === 'projects' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Projects Portfolio Manager</h3>
                  <button 
                    onClick={() => { setModalType('project'); setModalItem({ title: '', category: 'enterprise', tag: '', icon: 'fa-layer-group', description: '' }); setModalOpen(true); }}
                    style={{ padding: '10px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <i className="fa-solid fa-plus"></i> Add New Project
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {projectsList.map((p) => (
                    <div key={p.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>{p.tag || p.category}</span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => { setModalType('project'); setModalItem(p); setModalOpen(true); }} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}><i className="fa-solid fa-pen"></i></button>
                            <button onClick={() => handleDeleteItem('project', p.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
                          </div>
                        </div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{p.title}</h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: SKILLS */}
            {activeTab === 'skills' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Technical Skillset Manager</h3>
                  <button 
                    onClick={() => { setModalType('skill'); setModalItem({ name: '', category: 'backend', icon: 'fa-solid fa-code', is_highlighted: true }); setModalOpen(true); }}
                    style={{ padding: '10px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <i className="fa-solid fa-plus"></i> Add New Skill
                  </button>
                </div>

                <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem' }}>
                        <th style={{ padding: '12px' }}>SKILL NAME</th>
                        <th style={{ padding: '12px' }}>CATEGORY</th>
                        <th style={{ padding: '12px' }}>ICON</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skillsList.map((s) => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #1e293b' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}><i className={s.icon} style={{ marginRight: '8px', color: '#818cf8' }}></i> {s.name}</td>
                          <td style={{ padding: '12px', textTransform: 'capitalize', color: '#94a3b8', fontSize: '0.85rem' }}>{s.category}</td>
                          <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#cbd5e1' }}>{s.icon}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <button onClick={() => handleDeleteItem('skill', s.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i> Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: INQUIRIES INBOX */}
            {activeTab === 'messages' && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '28px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: '#818cf8' }}><i className="fa-solid fa-inbox"></i> Website Inquiries & Messages</h3>
                {messages.length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>No inquiries received yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {messages.map((m, idx) => (
                      <div key={idx} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{m.name} &lt;{m.email}&gt;</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(m.created_at || Date.now()).toLocaleString()}</span>
                        </div>
                        <p style={{ color: '#cbd5e1', fontSize: '0.925rem', lineHeight: '1.5' }}>{m.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: SYSTEM HEALTH */}
            {activeTab === 'system' && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '28px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: '#818cf8' }}><i className="fa-solid fa-server"></i> Full Stack System Health</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#1e293b', padding: '16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Laravel Framework Version</span>
                    <strong style={{ color: '#4ade80' }}>Laravel 11.55</strong>
                  </div>
                  <div style={{ background: '#1e293b', padding: '16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>PHP Runtime Environment</span>
                    <strong style={{ color: '#4ade80' }}>PHP 8.2.33</strong>
                  </div>
                  <div style={{ background: '#1e293b', padding: '16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Database Engine</span>
                    <strong style={{ color: '#4ade80' }}>SQLite (Docker Ephemeral Mount)</strong>
                  </div>
                  <div style={{ background: '#1e293b', padding: '16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Frontend Hosting</span>
                    <strong style={{ color: '#4ade80' }}>Vercel SPA Engine (https://amarnath.info)</strong>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* CRUD MODAL POPUP */}
        {modalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ width: '100%', maxWidth: '550px', background: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>Manage {modalType.replace('_', ' ')}</h3>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
              </div>

              <form onSubmit={handleSaveModalItem}>
                {modalType === 'nav_menu' && (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Menu Label Title</label>
                      <input type="text" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} value={modalItem.label || ''} onChange={(e) => setModalItem({ ...modalItem, label: e.target.value })} placeholder="e.g. Services / Certifications" required />
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Routing Type</label>
                      <select style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} value={modalItem.type || 'section'} onChange={(e) => setModalItem({ ...modalItem, type: e.target.value })}>
                        <option value="section">📜 Same Page Scroll (#section_id)</option>
                        <option value="route">📍 Dedicated New Page Route (/custom-route)</option>
                        <option value="external">🔗 External Link (https://...)</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>
                        {modalItem.type === 'route' ? 'New Page Path (e.g. /services)' : modalItem.type === 'external' ? 'External URL (e.g. https://github.com)' : 'Section Anchor ID (e.g. about)'}
                      </label>
                      <input type="text" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} value={modalItem.target || ''} onChange={(e) => setModalItem({ ...modalItem, target: e.target.value })} required />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>FontAwesome Icon Class</label>
                      <input type="text" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} value={modalItem.icon || 'fa-solid fa-link'} onChange={(e) => setModalItem({ ...modalItem, icon: e.target.value })} required />
                    </div>

                    {modalItem.type === 'route' && (
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Dynamic Page HTML / Markdown Content</label>
                        <textarea rows="5" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontFamily: 'monospace' }} value={modalItem.page_content || ''} onChange={(e) => setModalItem({ ...modalItem, page_content: e.target.value })} placeholder="Enter HTML content to display on this custom route page..."></textarea>
                      </div>
                    )}
                  </>
                )}

                {modalType === 'project' && (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', mb: '4px' }}>Project Title</label>
                      <input type="text" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} value={modalItem.title || ''} onChange={(e) => setModalItem({ ...modalItem, title: e.target.value })} required />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', mb: '4px' }}>Tag / Platform</label>
                      <input type="text" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} value={modalItem.tag || ''} onChange={(e) => setModalItem({ ...modalItem, tag: e.target.value })} required />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', mb: '4px' }}>Description</label>
                      <textarea rows="3" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} value={modalItem.description || ''} onChange={(e) => setModalItem({ ...modalItem, description: e.target.value })} required></textarea>
                    </div>
                  </>
                )}

                {modalType === 'skill' && (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', mb: '4px' }}>Skill Name</label>
                      <input type="text" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} value={modalItem.name || ''} onChange={(e) => setModalItem({ ...modalItem, name: e.target.value })} required />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', mb: '4px' }}>Category</label>
                      <select style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} value={modalItem.category || 'backend'} onChange={(e) => setModalItem({ ...modalItem, category: e.target.value })}>
                        <option value="backend">Backend</option>
                        <option value="frontend">Frontend</option>
                        <option value="cloudDb">Cloud & Database</option>
                        <option value="aiSecurity">AI & Security</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', mb: '4px' }}>FontAwesome Icon Class</label>
                      <input type="text" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} value={modalItem.icon || 'fa-solid fa-code'} onChange={(e) => setModalItem({ ...modalItem, icon: e.target.value })} required />
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                  <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 18px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Save Item</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // ROUTE: Dynamic Custom Route Page Renderer (e.g. /services, /certifications)
  // ==========================================
  const activeCustomMenu = navMenus.find(m => m.type === 'route' && m.target === route);
  if (activeCustomMenu && route !== '/' && !route.startsWith('/admin')) {
    return (
      <div className="portfolio-app" style={{ minHeight: '100vh', background: '#090d16', color: '#fff' }}>
        <div className="bg-glow bg-glow-1"></div>
        
        {/* Navbar */}
        <header className="navbar scrolled">
          <div className="container nav-container">
            <a href="/" className="logo" onClick={(e) => { e.preventDefault(); navigateTo('/'); }}>
              <span className="logo-accent">&lt;</span>Amarnath<span className="logo-accent">/&gt;</span>
            </a>
            <nav className="nav-menu">
              <button className="nav-link" onClick={() => navigateTo('/')}><i className="fa-solid fa-arrow-left"></i> Back to Home</button>
            </nav>
          </div>
        </header>

        {/* Dynamic Page Hero */}
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                <i className={activeCustomMenu.icon}></i>
              </div>
              <div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>{activeCustomMenu.label}</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Dynamic Page • Route: {activeCustomMenu.target}</p>
              </div>
            </div>

            <div 
              style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.8', marginTop: '28px', borderTop: '1px solid #1e293b', paddingTop: '28px' }}
              dangerouslySetInnerHTML={{ __html: activeCustomMenu.page_content || `<p>Welcome to <strong>${activeCustomMenu.label}</strong> page! You can edit this dynamic page content anytime from the Admin Dashboard Header Navigation Manager.</p>` }}
            />

            <div style={{ marginTop: '40px' }}>
              <button onClick={() => navigateTo('/')} className="btn btn-primary">
                <i className="fa-solid fa-house"></i> Return to Main Portfolio
              </button>
            </div>
          </div>
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

      {/* Navbar with Dynamic Header CMS Links */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <a href="#hero" className="logo" onClick={(e) => { e.preventDefault(); scrollTo('hero'); }}>
            <span className="logo-accent">&lt;</span>Amarnath<span className="logo-accent">/&gt;</span>
          </a>
          <nav className="nav-menu">
            {navMenus.filter(m => m.visible).map((menu) => (
              <button 
                key={menu.id} 
                className={`nav-link ${menu.isBtn ? 'nav-btn' : ''}`}
                style={menu.id === 'admin' ? { color: '#818cf8' } : {}}
                onClick={() => handleNavClick(menu)}
              >
                <i className={menu.icon}></i> {menu.label}
              </button>
            ))}
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
