# Amarnath Chauhan - Full Stack Portfolio App 🚀
### **Backend**: Laravel 11 RESTful API | **Frontend**: React.js SPA (Vite)

This is a completely standalone Full-Stack Portfolio Application built separately from `fixhr-WEB`.

---

## 📁 Project Architecture
```
amarnath-portfolio-app/
├── backend/                  # Laravel 11 REST API Engine
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── PortfolioApiController.php   # Public API for React
│   │   │   └── AdminPortfolioController.php # Full CRUD Admin API
│   │   └── Models/ (PersonalInfo, Strength, Skill, Experience, Project, Education, ContactMessage)
│   ├── database/
│   │   ├── migrations/                      # DB Table Schemas
│   │   └── seeders/DatabaseSeeder.php       # Populates Amarnath's resume data
│   └── routes/api.php                       # REST API Routes
│
└── frontend/                 # React.js SPA (Vite)
    ├── src/
    │   ├── api.js                           # Axios API layer to Laravel
    │   ├── App.jsx                          # Main Dynamic UI
    │   └── index.css                        # Modern Dark Mode & Glassmorphism Styling
```

---

## ⚡ How to Run Locally

### 1. Start Laravel Backend (Port 8000)
Open a terminal:
```bash
cd backend
php artisan migrate --seed
php artisan serve
```
> **Backend live at**: `http://localhost:8000/api/portfolio`

### 2. Start React Frontend (Port 5173)
Open a 2nd terminal:
```bash
cd frontend
npm install
npm run dev
```
> **Frontend live at**: `http://localhost:5173`

---

## 🎛️ How Content is Fully Dynamic

Aap backend SQLite / MySQL Database ya Laravel API endpoints se content aasaani se badal sakte hain:

### Public API Endpoints (Consumed by React):
- `GET /api/portfolio` -> Returns entire resume payload
- `POST /api/contact` -> Saves contact form inquiries into database

### Admin Control API Endpoints:
- `POST /api/admin/personal` -> Update Name, Summary, Title
- `POST /api/admin/projects` -> Add new project
- `PUT /api/admin/projects/{id}` -> Update existing project
- `DELETE /api/admin/projects/{id}` -> Delete project
- `POST /api/admin/skills` -> Add new skill tag
- `GET /api/admin/messages` -> View contact form submissions

---

## 🌐 FREE HOSTING GUIDE

1. **Frontend (React)**: Host FREE on **Vercel** or **Netlify**
   - Connect `frontend/` folder or push to GitHub.
   - Vercel automatically builds Vite React.

2. **Backend (Laravel)**: Host FREE on **Render.com**, **Fly.io**, or **Railway.app**
   - Push `backend/` to GitHub.
   - Deploy as PHP application on Render.com or Railway.app (Free Tier available).

---

**Designed & Engineered for Amarnath Chauhan.**
