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
  { id: 'about', label: 'About', icon: 'fa-solid fa-user', type: 'section', target: 'about', blocks: [], visible: true, isBtn: false },
  { id: 'skills', label: 'Skills', icon: 'fa-solid fa-code', type: 'section', target: 'skills', blocks: [], visible: true, isBtn: false },
  { id: 'experience', label: 'Experience', icon: 'fa-solid fa-briefcase', type: 'section', target: 'experience', blocks: [], visible: true, isBtn: false },
  { id: 'projects', label: 'Projects', icon: 'fa-solid fa-folder-open', type: 'section', target: 'projects', blocks: [], visible: true, isBtn: false },
  { 
    id: 'services', 
    label: 'Services & Solutions', 
    icon: 'fa-solid fa-layer-group', 
    type: 'route', 
    target: '/services', 
    blocks: [
      { id: 'b1', type: 'heading', level: 'h1', text: 'Enterprise Development & Architecture Solutions', align: 'left' },
      { id: 'b2', type: 'text', content: 'Specializing in high-performance Laravel backend architectures, custom React frontend SPAs, and scalable REST API design for modern enterprise platforms.' },
      { 
        id: 'b3', 
        type: 'image_left_text_right', 
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80', 
        heading: 'Scalable Microservices & REST API Engines', 
        text: 'Building robust, decoupled API architectures connecting Laravel 11 backends with React frontend frameworks, backed by MySQL and Redis caching.',
        buttonText: 'Get In Touch',
        buttonUrl: '#contact'
      },
      { 
        id: 'b4', 
        type: 'text_left_image_right', 
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', 
        heading: 'AI & Cloud Infrastructure Integration', 
        text: 'Integrating AWS Rekognition biometric engines, OpenAI ChatGPT API, and Docker containerized deployments on Vercel and Render.',
        buttonText: 'Explore Projects',
        buttonUrl: '#projects'
      },
      { id: 'b5', type: 'callout', title: 'Need Custom Architecture Consultation?', desc: 'Available for lead backend role, system optimization, or complete end-to-end full stack web application development.', icon: 'fa-rocket' }
    ], 
    visible: true, 
    isBtn: false 
  },
  { id: 'admin', label: 'Admin Portal', icon: 'fa-solid fa-lock', type: 'route', target: '/admin/login', blocks: [], visible: true, isBtn: false },
  { id: 'contact', label: 'Hire Me', icon: 'fa-solid fa-envelope', type: 'section', target: 'contact', blocks: [], visible: true, isBtn: true }
];

function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [scrolled, setScrolled] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('api');
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
    if (exps.status && exps.data && exps.data.length > 0) {
      setExperiencesList(exps.data);
    } else {
      setExperiencesList([
        { id: 1, role: 'Senior Full Stack & API Developer', company: 'Fixingdots Pvt Ltd (FixHR)', period: 'Jan 2025 - Present', points: ['Architecting scalable microservices & attendance engines', 'AWS Rekognition facial biometric AI integration', 'High-speed multi-sheet Excel data parser'] },
        { id: 2, role: 'Full Stack Web Developer', company: 'Enterprise Digital Solutions', period: '2021 - 2024', points: ['Built decoupled Laravel 11 REST backends & React SPAs', 'Database query optimization, Redis caching & Docker deployments'] }
      ]);
    }
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

  // Block Builder Helper Handlers
  const addBlockToMenu = (blockType) => {
    const blocks = modalItem.blocks || [];
    let newBlock = { id: 'blk_' + Date.now(), type: blockType };

    if (blockType === 'heading') {
      newBlock = { ...newBlock, level: 'h2', text: 'New Section Heading', align: 'left' };
    } else if (blockType === 'text') {
      newBlock = { ...newBlock, content: 'Enter your paragraph content here. You can explain your features, architectural stack, or case studies.' };
    } else if (blockType === 'image_left_text_right' || blockType === 'text_left_image_right') {
      newBlock = { 
        ...newBlock, 
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80', 
        heading: 'Feature Highlight Title', 
        text: 'Detailed description text explaining your services or solutions.',
        buttonText: 'Learn More',
        buttonUrl: '#contact'
      };
    } else if (blockType === 'callout') {
      newBlock = { ...newBlock, title: 'Important Announcement', desc: 'Callout text highlighting key features or special services.', icon: 'fa-circle-info' };
    } else if (blockType === 'code') {
      newBlock = { ...newBlock, title: 'API Response Example', code: '{\n  "status": true,\n  "message": "Laravel API Success"\n}' };
    }

    setModalItem({ ...modalItem, blocks: [...blocks, newBlock] });
  };

  const updateBlockInMenu = (index, updatedBlock) => {
    const blocks = [...(modalItem.blocks || [])];
    blocks[index] = updatedBlock;
    setModalItem({ ...modalItem, blocks });
  };

  const removeBlockFromMenu = (index) => {
    const blocks = [...(modalItem.blocks || [])];
    blocks.splice(index, 1);
    setModalItem({ ...modalItem, blocks });
  };

  const moveBlockOrder = (index, direction) => {
    const blocks = [...(modalItem.blocks || [])];
    if (direction === 'up' && index > 0) {
      const temp = blocks[index];
      blocks[index] = blocks[index - 1];
      blocks[index - 1] = temp;
    } else if (direction === 'down' && index < blocks.length - 1) {
      const temp = blocks[index];
      blocks[index] = blocks[index + 1];
      blocks[index + 1] = temp;
    }
    setModalItem({ ...modalItem, blocks });
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
      const formattedItem = {
        ...modalItem,
        points: typeof modalItem.pointsText === 'string' ? modalItem.pointsText.split('\n').filter(Boolean) : (modalItem.points || [])
      };
      await saveExperience(formattedItem);
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
          type: modalItem.type || 'section',
          blocks: modalItem.blocks || []
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
      <div className="portfolio-app" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050811' }}>
        <div className="bg-glow bg-glow-1"></div>
        <div className="bg-glow bg-glow-2"></div>

        <div style={{ width: '100%', maxWidth: '440px', padding: '36px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', zIndex: 10 }}>
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

            <button type="submit" className="btn btn-primary btn-full" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700 }} disabled={loginLoading}>
              {loginLoading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Authenticating Session...</> : <><i className="fa-solid fa-right-to-bracket"></i> Open Admin Suite</>}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button onClick={() => navigateTo('/')} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
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
      <div style={{ display: 'flex', minHeight: '100vh', background: '#050811', color: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        
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
              { id: 'nav_menus', label: 'WordPress Block CMS', icon: 'fa-cubes' },
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
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}><i className="fa-solid fa-cubes"></i></div>
                    <div><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{navMenus.length}</div><div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Dynamic CMS Menus</div></div>
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

            {/* TAB 2: WORDPRESS ELEMENTOR-STYLE BLOCK BUILDER CMS */}
            {activeTab === 'nav_menus' && (
              <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#818cf8' }}><i className="fa-solid fa-cubes"></i> WordPress-Style Visual Content Block CMS</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Add H1/H2/H3 Headings, Text Paragraphs, Left Image + Right Content, and Alert Banners to any dynamic route page!</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => { setModalType('nav_menu'); setModalItem({ label: '', icon: 'fa-solid fa-layer-group', type: 'route', target: '/new-page', blocks: [], visible: true, isBtn: false }); setModalOpen(true); }}
                      style={{ padding: '10px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <i className="fa-solid fa-plus"></i> Create New Page
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
                    ✓ Frontend Header Navigation & Block CMS updated successfully!
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
                              {item.type === 'route' ? `📍 NEW PAGE ROUTE (${(item.blocks || []).length} BLOCKS)` : item.type === 'external' ? '🔗 EXTERNAL URL' : '📜 SAME PAGE SCROLL'}
                            </span>
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>
                            Target Path: <code style={{ color: '#818cf8' }}>{item.target}</code>
                          </div>
                        </div>
                      </div>

                      {/* Actions & Status Toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <button onClick={() => { setModalType('nav_menu'); setModalItem(item); setModalOpen(true); }} style={{ background: '#6366f1', border: 'none', color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className="fa-solid fa-cubes-stacked"></i> Edit Visual Blocks
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
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', borderRadius: '10px' }}>
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

            {/* TAB 6: EXPERIENCES MANAGER */}
            {activeTab === 'experience' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}><i className="fa-solid fa-briefcase" style={{ color: '#818cf8', marginRight: '8px' }}></i> Career Experience Manager</h3>
                  <button 
                    onClick={() => { setModalType('experience'); setModalItem({ role: '', company: '', period: '', pointsText: '' }); setModalOpen(true); }}
                    style={{ padding: '10px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <i className="fa-solid fa-plus"></i> Add New Experience
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {experiencesList.map((exp) => (
                    <div key={exp.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{exp.role}</h4>
                          <h5 style={{ fontSize: '0.95rem', color: '#818cf8', marginTop: '2px' }}>{exp.company}</h5>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                            <i className="fa-solid fa-calendar" style={{ marginRight: '6px' }}></i> {exp.period}
                          </span>
                          <button onClick={() => { setModalType('experience'); setModalItem({ ...exp, pointsText: Array.isArray(exp.points) ? exp.points.join('\n') : (exp.points || '') }); setModalOpen(true); }} style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}><i className="fa-solid fa-pen"></i> Edit</button>
                          <button onClick={() => handleDeleteItem('experience', exp.id)} style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
                        </div>
                      </div>

                      <ul style={{ paddingLeft: '20px', color: '#94a3b8', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {Array.isArray(exp.points) ? exp.points.map((pt, i) => <li key={i}>{pt}</li>) : <li>{exp.points}</li>}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: INQUIRIES INBOX */}
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

            {/* TAB 8: SYSTEM HEALTH */}
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

        {/* MODAL POPUP */}
        {modalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ width: '100%', maxWidth: '750px', background: '#0f172a', border: '1px solid #334155', borderRadius: '24px', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', maxHeight: '92vh', overflowY: 'auto' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-cubes" style={{ color: '#818cf8' }}></i> {modalType === 'nav_menu' ? 'WordPress-Style Visual Block Editor' : `Manage ${modalType}`}
                  </h3>
                </div>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
              </div>

              <form onSubmit={handleSaveModalItem}>
                {modalType === 'experience' && (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Role / Designation</label>
                      <input type="text" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} value={modalItem.role || ''} onChange={(e) => setModalItem({ ...modalItem, role: e.target.value })} placeholder="e.g. Senior Laravel Developer" required />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Company Name</label>
                      <input type="text" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} value={modalItem.company || ''} onChange={(e) => setModalItem({ ...modalItem, company: e.target.value })} placeholder="e.g. Fixingdots Pvt Ltd" required />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Work Period</label>
                      <input type="text" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} value={modalItem.period || ''} onChange={(e) => setModalItem({ ...modalItem, period: e.target.value })} placeholder="e.g. Jan 2025 - Present" required />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Key Responsibilities & Bullet Points (One per line)</label>
                      <textarea rows="4" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} value={modalItem.pointsText || ''} onChange={(e) => setModalItem({ ...modalItem, pointsText: e.target.value })} placeholder="Architected scalable REST APIs&#10;Integrated AWS Rekognition facial recognition" required></textarea>
                    </div>
                  </>
                )}

                {modalType === 'nav_menu' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Menu Label Title</label>
                        <input type="text" style={{ width: '100%', padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#fff' }} value={modalItem.label || ''} onChange={(e) => setModalItem({ ...modalItem, label: e.target.value })} placeholder="e.g. Services & Solutions" required />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Routing Type</label>
                        <select style={{ width: '100%', padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#fff' }} value={modalItem.type || 'section'} onChange={(e) => setModalItem({ ...modalItem, type: e.target.value })}>
                          <option value="section">📜 Same Page Scroll (#section_id)</option>
                          <option value="route">📍 Dedicated New Page Route (/custom-route)</option>
                          <option value="external">🔗 External Link (https://...)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Target Path / ID</label>
                        <input type="text" style={{ width: '100%', padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#fff' }} value={modalItem.target || ''} onChange={(e) => setModalItem({ ...modalItem, target: e.target.value })} placeholder="/services or about" required />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>FontAwesome Icon Class</label>
                        <input type="text" style={{ width: '100%', padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#fff' }} value={modalItem.icon || 'fa-solid fa-layer-group'} onChange={(e) => setModalItem({ ...modalItem, icon: e.target.value })} required />
                      </div>
                    </div>

                    {modalItem.type === 'route' && (
                      <div style={{ borderTop: '1px solid #334155', paddingTop: '20px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h4 style={{ color: '#818cf8', fontSize: '1rem', fontWeight: 700 }}><i className="fa-solid fa-square-plus"></i> Add Content Blocks (WordPress Gutenberg Style)</h4>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', background: '#1e293b', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
                          <button type="button" onClick={() => addBlockToMenu('heading')} style={{ padding: '8px 12px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}><i className="fa-solid fa-heading"></i> + Heading (H1/H2/H3)</button>
                          <button type="button" onClick={() => addBlockToMenu('text')} style={{ padding: '8px 12px', background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', color: '#c084fc', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}><i className="fa-solid fa-paragraph"></i> + Text Paragraph</button>
                          <button type="button" onClick={() => addBlockToMenu('image_left_text_right')} style={{ padding: '8px 12px', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}><i className="fa-solid fa-file-image"></i> + Left Image + Right Text</button>
                          <button type="button" onClick={() => addBlockToMenu('text_left_image_right')} style={{ padding: '8px 12px', background: 'rgba(56,189,248,0.2)', border: '1px solid rgba(56,189,248,0.4)', color: '#38bdf8', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}><i className="fa-solid fa-file-image"></i> + Left Text + Right Image</button>
                          <button type="button" onClick={() => addBlockToMenu('callout')} style={{ padding: '8px 12px', background: 'rgba(234,179,8,0.2)', border: '1px solid rgba(234,179,8,0.4)', color: '#facc15', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}><i className="fa-solid fa-bullhorn"></i> + Alert Callout</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {(modalItem.blocks || []).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '24px', border: '2px dashed #334155', borderRadius: '12px', color: '#94a3b8', fontSize: '0.9rem' }}>
                              No content blocks added yet. Click buttons above to add Headings, Paragraphs or Image+Text blocks!
                            </div>
                          ) : (
                            modalItem.blocks.map((blk, idx) => (
                              <div key={blk.id || idx} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>
                                    Block #{idx + 1}: {blk.type.replace(/_/g, ' ')}
                                  </span>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button type="button" onClick={() => moveBlockOrder(idx, 'up')} disabled={idx === 0} style={{ background: '#334155', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>▲</button>
                                    <button type="button" onClick={() => moveBlockOrder(idx, 'down')} disabled={idx === modalItem.blocks.length - 1} style={{ background: '#334155', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>▼</button>
                                    <button type="button" onClick={() => removeBlockFromMenu(idx)} style={{ background: 'rgba(239,68,68,0.2)', border: 'none', color: '#f87171', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
                                  </div>
                                </div>

                                {blk.type === 'heading' && (
                                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                                    <select value={blk.level} onChange={(e) => updateBlockInMenu(idx, { ...blk, level: e.target.value })} style={{ padding: '8px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}>
                                      <option value="h1">Heading H1</option>
                                      <option value="h2">Heading H2</option>
                                      <option value="h3">Heading H3</option>
                                    </select>
                                    <input type="text" value={blk.text} onChange={(e) => updateBlockInMenu(idx, { ...blk, text: e.target.value })} placeholder="Heading text..." style={{ padding: '8px 12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: '#fff', fontWeight: 700 }} />
                                  </div>
                                )}

                                {blk.type === 'text' && (
                                  <textarea rows="3" value={blk.content} onChange={(e) => updateBlockInMenu(idx, { ...blk, content: e.target.value })} placeholder="Paragraph content..." style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}></textarea>
                                )}

                                {(blk.type === 'image_left_text_right' || blk.type === 'text_left_image_right') && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <input type="text" value={blk.imageUrl} onChange={(e) => updateBlockInMenu(idx, { ...blk, imageUrl: e.target.value })} placeholder="Image URL (e.g. https://...)" style={{ padding: '8px 12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }} />
                                    <input type="text" value={blk.heading} onChange={(e) => updateBlockInMenu(idx, { ...blk, heading: e.target.value })} placeholder="Column Heading..." style={{ padding: '8px 12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: '#fff', fontWeight: 700 }} />
                                    <textarea rows="2" value={blk.text} onChange={(e) => updateBlockInMenu(idx, { ...blk, text: e.target.value })} placeholder="Column Paragraph description..." style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}></textarea>
                                  </div>
                                )}

                                {blk.type === 'callout' && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <input type="text" value={blk.title} onChange={(e) => updateBlockInMenu(idx, { ...blk, title: e.target.value })} placeholder="Callout Title..." style={{ padding: '8px 12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: '#fff', fontWeight: 700 }} />
                                    <textarea rows="2" value={blk.desc} onChange={(e) => updateBlockInMenu(idx, { ...blk, desc: e.target.value })} placeholder="Callout Description..." style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}></textarea>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                  <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // ROUTE: Dynamic Gutenberg/Elementor Block Page Renderer (e.g. /services, /certifications)
  // ==========================================
  const activeCustomMenu = navMenus.find(m => m.type === 'route' && m.target === route);
  if (activeCustomMenu && route !== '/' && !route.startsWith('/admin')) {
    const blocks = activeCustomMenu.blocks || [];

    return (
      <div className="portfolio-app" style={{ minHeight: '100vh', background: '#050811', color: '#fff' }}>
        <div className="bg-glow bg-glow-1"></div>
        <div className="bg-glow bg-glow-2"></div>
        
        {/* Navbar */}
        <header className="navbar scrolled">
          <div className="container nav-container">
            <a href="/" className="logo" onClick={(e) => { e.preventDefault(); navigateTo('/'); }}>
              <span className="logo-accent">&lt;</span>Amarnath<span className="logo-accent">/&gt;</span>
            </a>
            <nav className="nav-menu">
              {navMenus.filter(m => m.visible).map((menu) => (
                <button 
                  key={menu.id} 
                  className={`nav-link ${menu.isBtn ? 'nav-btn' : ''}`}
                  onClick={() => handleNavClick(menu)}
                >
                  <i className={menu.icon}></i> {menu.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <div className="container" style={{ paddingTop: '130px', paddingBottom: '90px' }}>
          
          {/* Hero Banner for Dynamic Page */}
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '40px', marginBottom: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              <i className={activeCustomMenu.icon}></i>
            </div>
            <div>
              <h1 style={{ fontSize: '2.6rem', fontWeight: 800 }}>{activeCustomMenu.label}</h1>
              <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '4px' }}>Dynamic WordPress Block CMS • Active Route: <code style={{ color: '#818cf8' }}>{activeCustomMenu.target}</code></p>
            </div>
          </div>

          {/* RENDER VISUAL BLOCKS */}
          {blocks.length === 0 ? (
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '50px', borderRadius: '24px', border: '1px solid #334155', textAlign: 'center', color: '#cbd5e1' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome to {activeCustomMenu.label}!</h3>
              <p style={{ marginTop: '10px', color: '#94a3b8' }}>No content blocks added yet. Open Admin Dashboard -&gt; WordPress Block CMS to add Headings, Left Image + Right Text, or Alert Banners!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {blocks.map((blk, idx) => (
                <div key={blk.id || idx}>
                  
                  {/* HEADING BLOCK */}
                  {blk.type === 'heading' && (
                    <div style={{ textAlign: blk.align || 'left', margin: '16px 0' }}>
                      {blk.level === 'h1' && <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff' }}>{blk.text}</h1>}
                      {blk.level === 'h2' && <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#818cf8' }}>{blk.text}</h2>}
                      {blk.level === 'h3' && <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#cbd5e1' }}>{blk.text}</h3>}
                    </div>
                  )}

                  {/* PARAGRAPH TEXT BLOCK */}
                  {blk.type === 'text' && (
                    <p style={{ fontSize: '1.125rem', lineHeight: '1.8', color: '#cbd5e1', background: 'rgba(15, 23, 42, 0.6)', padding: '28px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {blk.content}
                    </p>
                  )}

                  {/* LEFT IMAGE + RIGHT TEXT BLOCK */}
                  {blk.type === 'image_left_text_right' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px', alignItems: 'center', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '28px', padding: '36px' }}>
                      <img src={blk.imageUrl} alt={blk.heading} style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '20px', border: '1px solid #334155' }} />
                      <div>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>{blk.heading}</h3>
                        <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '24px' }}>{blk.text}</p>
                        {blk.buttonText && (
                          <button onClick={() => scrollTo('contact')} className="btn btn-primary">
                            <i className="fa-solid fa-arrow-right"></i> {blk.buttonText}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* LEFT TEXT + RIGHT IMAGE BLOCK */}
                  {blk.type === 'text_left_image_right' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px', alignItems: 'center', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '28px', padding: '36px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>{blk.heading}</h3>
                        <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '24px' }}>{blk.text}</p>
                        {blk.buttonText && (
                          <button onClick={() => scrollTo('projects')} className="btn btn-secondary">
                            <i className="fa-solid fa-rocket"></i> {blk.buttonText}
                          </button>
                        )}
                      </div>
                      <img src={blk.imageUrl} alt={blk.heading} style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '20px', border: '1px solid #334155' }} />
                    </div>
                  )}

                  {/* ALERT CALLOUT BLOCK */}
                  {blk.type === 'callout' && (
                    <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '24px', padding: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                        <i className={`fa-solid ${blk.icon || 'fa-circle-info'}`}></i>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{blk.title}</h4>
                        <p style={{ color: '#cbd5e1', fontSize: '1rem', marginTop: '4px' }}>{blk.desc}</p>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '56px', textAlign: 'center' }}>
            <button onClick={() => navigateTo('/')} className="btn btn-primary">
              <i className="fa-solid fa-house"></i> Return to Main Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ROUTE: Ultra-Professional Main Landing Page (https://amarnath.info/)
  // ==========================================
  if (loading || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#818cf8', fontSize: '1.3rem', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#050811' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
        <div style={{ fontWeight: 700, color: '#fff' }}>Loading Enterprise Architecture...</div>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>Fetching Real-Time State from Laravel 11 REST Engine</div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { personal, strengths, skills, experiences, projects, education } = data;
  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.category === filter);

  return (
    <div className="portfolio-app">
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      <div className="bg-glow bg-glow-3"></div>

      {/* Floating Capsule Glassmorphism Navbar */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          {/* Zone 1: Logo */}
          <a href="#hero" className="logo" onClick={(e) => { e.preventDefault(); scrollTo('hero'); }}>
            <div className="logo-icon">
              <i className="fa-solid fa-code"></i>
            </div>
            <span>Amarnath<span style={{ color: 'var(--primary-light)' }}>.info</span></span>
          </a>

          {/* Zone 2: Center Navigation Capsule */}
          <nav className="nav-menu">
            {navMenus.filter(m => m.visible && !m.isBtn && m.id !== 'admin').map((menu) => (
              <button 
                key={menu.id} 
                className="nav-link"
                onClick={() => handleNavClick(menu)}
              >
                <i className={menu.icon}></i> {menu.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Right Action Buttons */}
          <div className="nav-actions">
            <button 
              className="nav-btn-admin"
              onClick={() => navigateTo('/admin/login')}
            >
              <i className="fa-solid fa-shield-halved"></i> Admin
            </button>

            <button 
              className="nav-btn-cta"
              onClick={() => scrollTo('contact')}
            >
              <i className="fa-solid fa-paper-plane"></i> Hire Me
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="badge-pill">
              <span className="pulse-dot"></span> Available for Lead Backend & Full Stack Architect Roles
            </div>
            
            <h1 className="hero-title">
              Senior Full Stack & <span className="gradient-text">API Architect</span>
            </h1>
            <h2 className="hero-subtitle">Building Scalable Enterprise ERP Engines & Biometric AI Systems</h2>
            
            <p className="hero-description">
              5+ years of expertise specializing in high-concurrency Laravel 11 backends, decoupled React SPAs, AWS Rekognition facial biometric integrations, and enterprise database query optimization.
            </p>

            {/* Quick Tech Pills */}
            <div className="hero-tech-pills">
              <span className="tech-pill"><i className="fa-brands fa-laravel"></i> Laravel 11 REST API</span>
              <span className="tech-pill"><i className="fa-brands fa-react"></i> React 18 SPA</span>
              <span className="tech-pill"><i className="fa-solid fa-database"></i> MySQL & Redis</span>
              <span className="tech-pill"><i className="fa-brands fa-docker"></i> Docker & Cloud</span>
              <span className="tech-pill"><i className="fa-solid fa-face-smile"></i> AWS Rekognition AI</span>
            </div>

            {/* Hero Key Metrics */}
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">5+ Yrs</span>
                <span className="stat-label">Production Exp.</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10+</span>
                <span className="stat-label">Enterprise Apps</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">API Uptime</span>
              </div>
            </div>

            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => scrollTo('projects')}><i className="fa-solid fa-rocket"></i> Explore Projects</button>
              <button className="btn btn-secondary" onClick={() => scrollTo('contact')}><i className="fa-solid fa-paper-plane"></i> Contact Me</button>
            </div>

            <div className="social-links">
              <a href={personal.github} target="_blank" rel="noreferrer" title="GitHub"><i className="fa-brands fa-github"></i></a>
              <a href={personal.linkedin} target="_blank" rel="noreferrer" title="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
              <a href={`mailto:${personal.email}`} title="Email"><i className="fa-solid fa-envelope"></i></a>
              <a href={`tel:${personal.phone}`} title="Phone"><i className="fa-solid fa-phone"></i></a>
            </div>
          </div>

          {/* Hero Visual Card: Enterprise System Architecture Spec */}
          <div className="hero-visual">
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.85)', 
              backdropFilter: 'blur(20px)', 
              border: '1px solid rgba(99, 102, 241, 0.35)', 
              borderRadius: '24px', 
              padding: '32px', 
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Card Top Title & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.25rem', fontWeight: 800 }}>
                    <i className="fa-solid fa-server"></i>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>Enterprise Core Architecture</h3>
                    <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>Production System Engine • amarnath.info</span>
                  </div>
                </div>
                <span style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', fontSize: '0.75rem', padding: '6px 12px', borderRadius: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span> Live API Synced
                </span>
              </div>

              {/* Architectural Modules Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ color: '#818cf8', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>RESTful Backend</div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>Laravel 11.x Core</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '4px' }}>Sanctum Auth • Redis Queue</div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ color: '#c084fc', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Frontend SPA</div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>React 18 Engine</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '4px' }}>Vite • Dark Glassmorphism</div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ color: '#38bdf8', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>AI Biometrics</div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>AWS Rekognition</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '4px' }}>Real-time Face Vectoring</div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ color: '#facc15', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Visual Block CMS</div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>WordPress Builder</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '4px' }}>Dynamic Page Router</div>
                </div>
              </div>

              {/* Live Metric Stats Bar */}
              <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(56, 189, 248, 0.15) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '16px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Performance Uptime</div>
                  <div style={{ color: '#34d399', fontWeight: 800, fontSize: '0.95rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-bolt"></i> 99.9% Uptime • &lt; 28ms Latency
                  </div>
                </div>
                <button onClick={() => navigateTo('/admin/login')} style={{ background: 'var(--primary-gradient)', border: 'none', color: '#fff', padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}>
                  <i className="fa-solid fa-lock"></i> Admin Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strengths & Architecture Highlights */}
      <section className="section" id="about">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">CORE CAPABILITIES</span>
            <h2 className="section-title">Enterprise Systems Architecture</h2>
            <p className="section-desc">Designed to scale under heavy enterprise loads with decoupled API architectures and modern React UI components.</p>
          </div>

          <div className="strengths-grid">
            <div className="strength-card">
              <div className="strength-icon"><i className="fa-solid fa-server"></i></div>
              <h3>Scalable Microservices & REST API</h3>
              <p>Designing clean, secure, and documented RESTful APIs in Laravel 11 connected with Redis queue workers and high-speed MySQL queries.</p>
            </div>

            <div className="strength-card">
              <div className="strength-icon"><i className="fa-solid fa-face-smile"></i></div>
              <h3>Biometric AI & Face Recognition</h3>
              <p>Integrating AWS Rekognition facial comparison vector engines for real-time automated employee attendance and security checks.</p>
            </div>

            <div className="strength-card">
              <div className="strength-icon"><i className="fa-solid fa-layer-group"></i></div>
              <h3>Decoupled React 18 SPA & CMS</h3>
              <p>Building high-performance single page applications with dynamic Gutenberg/Elementor-style visual block content management systems.</p>
            </div>

            <div className="strength-card">
              <div className="strength-icon"><i className="fa-solid fa-file-excel"></i></div>
              <h3>Enterprise ERP & Attendance Engine</h3>
              <p>Developed FixHR ERP modules: multi-sheet Excel parsers, automated shift resolvers, overtime calculators, and payroll generators.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="section section-dark" id="skills">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">TECHNICAL EXPERTISE</span>
            <h2 className="section-title">Technology Stack & Tools</h2>
            <p className="section-desc">Hand-picked battle-tested technologies for modern web performance and developer productivity.</p>
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

      {/* Professional Experience */}
      <section className="section" id="experience">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">CAREER TRACK RECORD</span>
            <h2 className="section-title">Professional Work Experience</h2>
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
                    <span className="exp-period"><i className="fa-solid fa-calendar" style={{ marginRight: '6px' }}></i> {exp.period}</span>
                  </div>
                  <ul className="exp-points">
                    {exp.points && (Array.isArray(exp.points) ? exp.points.map((pt, i) => <li key={i}>{pt}</li>) : <li>{exp.points}</li>)}
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
            <span className="section-subtitle">FEATURED PORTFOLIO</span>
            <h2 className="section-title">Key Projects & Deliverables</h2>
            <p className="section-desc">Production systems developed for enterprise HRMS, dynamic content engines, and SaaS platforms.</p>
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
                  <div>
                    <h3 className="project-title">{p.title}</h3>
                    <p className="project-text">{p.description}</p>
                  </div>
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
            <span className="section-subtitle">ACADEMIC BACKGROUND</span>
            <h2 className="section-title">Qualifications & Education</h2>
          </div>

          <div className="edu-grid">
            {education && education.map((edu, i) => (
              <div key={i} className="edu-card">
                <div className="edu-icon"><i className={`fa-solid ${edu.icon}`}></i></div>
                <div>
                  <h3>{edu.degree}</h3>
                  <p style={{ color: '#94a3b8', marginTop: '4px' }}>{edu.school}</p>
                  <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.85rem', marginTop: '6px', display: 'inline-block' }}>{edu.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section section-dark" id="contact">
        <div className="container">
          <div className="contact-box">
            <div className="contact-info">
              <span className="section-subtitle">GET IN TOUCH</span>
              <h2 className="contact-title">Let's Build Something Exceptional</h2>
              <p className="contact-desc">Available for Senior Full Stack Engineer / Lead Architect positions, system performance optimization, or tech consulting.</p>
              
              <div className="contact-details">
                <div className="contact-item">
                  <div className="c-icon"><i className="fa-solid fa-envelope"></i></div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '1px' }}>EMAIL ADDRESS</span><br/>
                    <a href={`mailto:${personal.email}`} className="c-value">{personal.email}</a>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="c-icon"><i className="fa-solid fa-phone"></i></div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '1px' }}>PHONE NUMBER</span><br/>
                    <a href={`tel:${personal.phone}`} className="c-value">{personal.phone}</a>
                  </div>
                </div>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleContactSubmit}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Send Inquiry to Laravel API</h3>
              {formStatus === 'success' && <div style={{ color: '#22c55e', padding: '12px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', fontSize: '0.9rem' }}>✓ Inquiry saved to Laravel Database!</div>}
              {formStatus === 'error' && <div style={{ color: '#ef4444', padding: '12px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', fontSize: '0.9rem' }}>✕ Error saving to backend.</div>}
              
              <input type="text" className="form-input" placeholder="Your Full Name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required />
              <input type="email" className="form-input" placeholder="Your Email Address" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} required />
              <textarea className="form-input" rows="4" placeholder="How can I help you? Project details or role opportunities..." value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} required></textarea>
              
              <button type="submit" className="btn btn-primary btn-full">
                {formStatus === 'sending' ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Saving to Backend...</> : <><i className="fa-solid fa-paper-plane"></i> Send Direct Inquiry</>}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-container">
          <p>&copy; {new Date().getFullYear()} {personal.name}. Powered by Laravel 11 & React 18.</p>
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
