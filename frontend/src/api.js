import axios from 'axios';

// Base API Configuration connecting to Laravel Backend
const API_BASE_URL = 'http://localhost:8000/api';

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
      backend: [{ name: "PHP 8.x", icon: "fa-brands fa-php", is_highlighted: true }, { name: "Laravel 11", icon: "fa-brands fa-laravel", is_highlighted: true }],
      frontend: [{ name: "React.js", icon: "fa-brands fa-react", is_highlighted: true }, { name: "Magento 2", icon: "fa-brands fa-magento", is_highlighted: true }],
      cloudDb: [{ name: "MySQL", icon: "fa-solid fa-database", is_highlighted: true }, { name: "Redis", icon: "fa-solid fa-memory", is_highlighted: true }],
      aiSecurity: [{ name: "OpenAI API", icon: "fa-solid fa-brain", is_highlighted: true }]
    },
    experiences: [
      { role: "Laravel Developer", company: "Fixingdots Pvt Ltd", period: "Jan 2025 - Present", points: ["Architecting scalable APIs", "Attendance engine & RBAC"] }
    ],
    projects: [
      { id: 1, title: "FixHR - HRMS System", category: "enterprise", tag: "HRMS Platform", icon: "fa-users-gear", description: "Attendance and leave engine with AWS Face Recognition", tech: ["Laravel", "AWS Rekognition", "MySQL"] }
    ],
    education: [
      { degree: "B.Tech in Computer Science", school: "CSVTU Bhilai", year: "2016 - 2020", icon: "fa-graduation-cap" }
    ]
  };
}
