import axios from 'axios';

// Base API Configuration connecting to custom domain admin.amarnath.info
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000/api'
  : 'https://admin.amarnath.info/api';

export const fetchPortfolioData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/portfolio`);
    if (response.data && response.data.status) {
      return response.data.data;
    }
    throw new Error('Invalid backend payload');
  } catch (error) {
    console.warn('Backend API offline or loading fallback data:', error.message);
    return getFallbackData();
  }
};

export const sendContactMessage = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/contact`, formData);
    return response.data;
  } catch (error) {
    console.error('Contact submission error:', error);
    throw error;
  }
};

export const adminLogin = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/login`, credentials);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { status: false, message: 'Server error or network failure.' };
  }
};

export const fetchAdminMessages = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/messages`);
    return response.data;
  } catch (error) {
    return { status: false, data: [] };
  }
};

export const markMessageAsRead = async (id) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/messages/${id}/read`);
    return response.data;
  } catch (error) {
    return { status: false, message: 'Failed to mark read' };
  }
};

export const updatePersonalInfo = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/personal`, data);
    return response.data;
  } catch (error) {
    return { status: false, message: 'Update failed' };
  }
};

// Projects CRUD
export const fetchAdminProjects = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/projects`);
    return response.data;
  } catch (error) {
    return { status: false, data: [] };
  }
};

export const saveProject = async (projectData) => {
  try {
    const url = projectData.id ? `${API_BASE_URL}/admin/projects/${projectData.id}` : `${API_BASE_URL}/admin/projects`;
    const method = projectData.id ? 'put' : 'post';
    const response = await axios[method](url, projectData);
    return response.data;
  } catch (error) {
    return { status: false, message: 'Save failed' };
  }
};

export const deleteProjectApi = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/projects/${id}`);
    return response.data;
  } catch (error) {
    return { status: false, message: 'Delete failed' };
  }
};

// Skills CRUD
export const fetchAdminSkills = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/skills`);
    return response.data;
  } catch (error) {
    return { status: false, data: [] };
  }
};

export const saveSkill = async (skillData) => {
  try {
    const url = skillData.id ? `${API_BASE_URL}/admin/skills/${skillData.id}` : `${API_BASE_URL}/admin/skills`;
    const method = skillData.id ? 'put' : 'post';
    const response = await axios[method](url, skillData);
    return response.data;
  } catch (error) {
    return { status: false, message: 'Save failed' };
  }
};

export const deleteSkillApi = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/skills/${id}`);
    return response.data;
  } catch (error) {
    return { status: false, message: 'Delete failed' };
  }
};

// Experiences CRUD
export const fetchAdminExperiences = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/experiences`);
    return response.data;
  } catch (error) {
    return { status: false, data: [] };
  }
};

export const saveExperience = async (expData) => {
  try {
    const url = expData.id ? `${API_BASE_URL}/admin/experiences/${expData.id}` : `${API_BASE_URL}/admin/experiences`;
    const method = expData.id ? 'put' : 'post';
    const response = await axios[method](url, expData);
    return response.data;
  } catch (error) {
    return { status: false, message: 'Save failed' };
  }
};

export const deleteExperienceApi = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/experiences/${id}`);
    return response.data;
  } catch (error) {
    return { status: false, message: 'Delete failed' };
  }
};

// Header Navigation Config
export const saveNavConfigApi = async (navItems) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/nav-config`, { menus: navItems });
    return response.data;
  } catch (error) {
    return { status: false, message: 'Nav save failed' };
  }
};

// Fallback Data if backend is starting up
function getFallbackData() {
  return {
    personal: {
      name: "Amarnath Chauhan",
      title: "Senior Laravel & Full Stack Developer",
      location: "Raipur, Chhattisgarh, India",
      phone: "+91-88894-36902",
      email: "amarnath24081997@gmail.com",
      github: "https://github.com/Amarnath325",
      linkedin: "https://linkedin.com/in/amarnath-chauhan-255805183",
      experience_years: 5,
      summary: "Full Stack Developer with 5+ years of experience specializing in scalable enterprise applications across Laravel, Magento2, and React.js."
    },
    strengths: [
      { title: "Authentication & RBAC", icon: "fa-shield-halved", desc: "Granular role-based access control & Sanctum security." },
      { title: "Scalable Architecture", icon: "fa-layer-group", desc: "High-throughput REST APIs & Redis caching." },
      { title: "AWS Face Recognition", icon: "fa-face-smile", desc: "AWS Rekognition biometric attendance." },
      { title: "AI Workflow Integration", icon: "fa-robot", desc: "OpenAI ChatGPT API & Claude AI automation." }
    ],
    skills: {
      backend: [{ id: 1, name: "PHP 8.x", icon: "fa-brands fa-php", is_highlighted: true }, { id: 2, name: "Laravel 11", icon: "fa-brands fa-laravel", is_highlighted: true }],
      frontend: [{ id: 3, name: "React.js", icon: "fa-brands fa-react", is_highlighted: true }, { id: 4, name: "Magento 2", icon: "fa-brands fa-magento", is_highlighted: true }],
      cloudDb: [{ id: 5, name: "MySQL", icon: "fa-solid fa-database", is_highlighted: true }, { id: 6, name: "Redis", icon: "fa-solid fa-memory", is_highlighted: true }],
      aiSecurity: [{ id: 7, name: "OpenAI API", icon: "fa-solid fa-brain", is_highlighted: true }]
    },
    experiences: [
      { id: 1, role: "Laravel Developer", company: "Fixingdots Pvt Ltd", period: "Jan 2025 - Present", points: ["Architecting scalable APIs", "Attendance engine & RBAC"] }
    ],
    projects: [
      { id: 1, title: "FixHR - HRMS System", category: "enterprise", tag: "HRMS Platform", icon: "fa-users-gear", description: "Attendance and leave engine with AWS Face Recognition", tech: ["Laravel", "AWS Rekognition", "MySQL"] }
    ],
    education: [
      { degree: "B.Tech in Computer Science", school: "CSVTU Bhilai", year: "2016 - 2020", icon: "fa-graduation-cap" }
    ]
  };
}
