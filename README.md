<div align="center">

# ⬡ Etharia
### Team Task Manager — Full Stack Web Application

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![NeonDB](https://img.shields.io/badge/NeonDB-00E5BF?style=for-the-badge&logo=neon&logoColor=black)](https://neon.tech/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

*A premium, full-stack project & task management platform with role-based access control.*

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Secure JWT-based signup & login with bcrypt password hashing |
| 📁 **Project Management** | Create, edit, and delete projects with team collaboration |
| ✅ **Task Tracking** | Full CRUD with priority levels, status, assignees & due dates |
| 🎯 **Kanban Board** | Visual Todo → In Progress → Done workflow |
| 👥 **Team Management** | Invite members by email, manage roles from a slide-in panel |
| 🛡️ **Role-Based Access** | Admin and Member roles enforced on both frontend and backend |
| 📊 **Dashboard** | Real-time stats — total tasks, completed, in-progress, overdue |
| ⚠️ **Overdue Alerts** | Tasks past their due date are highlighted automatically |

---

## 🏗️ Tech Stack

### Backend
- **Runtime** — Node.js
- **Framework** — Express.js
- **Database** — PostgreSQL via [NeonDB](https://neon.tech) (serverless)
- **Query Builder** — Knex.js
- **Authentication** — JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`

### Frontend
- **Framework** — React 18
- **Bundler** — Vite
- **Routing** — React Router v6
- **State Management** — Zustand (with `localStorage` persistence)
- **HTTP Client** — Axios (with JWT interceptor & auto-logout on 401)
- **Icons** — Lucide React
- **Styling** — Vanilla CSS (dark glassmorphism design system)

---

## 📁 Project Structure

```
Etharia/
├── backend/
│   ├── .env                    # Environment variables (never commit!)
│   ├── .env.example            # Template for env setup
│   ├── server.js               # Express entry point
│   ├── db.js                   # Knex + NeonDB schema setup
│   ├── middleware/
│   │   ├── auth.js             # JWT verification middleware
│   │   └── rbac.js             # Role-based access middleware
│   └── routes/
│       ├── auth.js             # POST /signup, /login | GET /me
│       ├── projects.js         # Project CRUD
│       ├── tasks.js            # Task list & create (nested)
│       ├── taskActions.js      # Task update & delete (standalone)
│       ├── members.js          # Team member management
│       └── dashboard.js        # Aggregated stats
│
└── frontend/
    ├── vite.config.js          # Vite config with /api proxy
    └── src/
        ├── App.jsx             # React Router setup
        ├── main.jsx            # App entry point
        ├── index.css           # Global design system
        ├── api/
        │   └── axios.js        # Axios instance with JWT interceptor
        ├── store/
        │   └── authStore.js    # Zustand auth state
        ├── pages/
        │   ├── Login.jsx       # Split-screen login page
        │   ├── Signup.jsx      # Registration page
        │   ├── Dashboard.jsx   # Stats + projects grid
        │   └── ProjectView.jsx # Kanban board + team panel
        └── components/
            ├── Navbar.jsx
            ├── ProtectedRoute.jsx
            ├── StatCard.jsx
            ├── ProjectCard.jsx
            ├── KanbanBoard.jsx
            ├── TaskCard.jsx
            ├── TaskModal.jsx
            ├── ProjectModal.jsx
            └── MembersPanel.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- A [NeonDB](https://neon.tech/) account (free tier works great)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/etharia.git
cd etharia
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create your `.env` file from the template:

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
DATABASE_URL=postgresql://your_user:your_password@your_host/neondb?sslmode=require
JWT_SECRET=your_super_secret_key_here
PORT=3000
```

Start the backend server:

```bash
npm start          # production
npm run dev        # development (with nodemon hot-reload)
```

The server will automatically create all database tables on first run.

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies all `/api` requests to the backend at `http://localhost:3000`.

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user info |

### Projects
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/projects` | Any | List my projects |
| `POST` | `/api/projects` | Any | Create a project |
| `GET` | `/api/projects/:id` | Member | Get project details |
| `PUT` | `/api/projects/:id` | Admin | Update project |
| `DELETE` | `/api/projects/:id` | Admin | Delete project |

### Members
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/projects/:id/members` | Member | List members |
| `POST` | `/api/projects/:id/members` | Admin | Invite member by email |
| `PUT` | `/api/projects/:id/members/:uid` | Admin | Change member role |
| `DELETE` | `/api/projects/:id/members/:uid` | Admin | Remove member |

### Tasks
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/projects/:id/tasks` | Member | List tasks |
| `POST` | `/api/projects/:id/tasks` | Admin | Create task |
| `PUT` | `/api/tasks/:id` | Member* | Update task |
| `DELETE` | `/api/tasks/:id` | Admin | Delete task |

> *Members can only update `status`. Admins can update all fields.

### Dashboard
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard` | ✅ | Aggregated stats for current user |

---

## 🛡️ Role-Based Access Control

| Action | Admin | Member |
|---|:---:|:---:|
| View project & tasks | ✅ | ✅ |
| Move tasks (status change) | ✅ | ✅ |
| Create tasks | ✅ | ❌ |
| Edit task details | ✅ | ❌ |
| Delete tasks | ✅ | ❌ |
| Edit project info | ✅ | ❌ |
| Invite / Remove members | ✅ | ❌ |
| Delete project | ✅ | ❌ |

> The **project creator** is automatically assigned the `Admin` role.

---

## 🗃️ Database Schema

```sql
users           → id, name, email, password, created_at
projects        → id, name, description, owner_id, created_at
project_members → project_id, user_id, role (Admin|Member)
tasks           → id, project_id, title, description, status, priority,
                  assigned_to, due_date, created_by, created_at
```

---

## 🎨 Design Highlights

- 🌑 **Dark glassmorphism** UI with `backdrop-filter` blur effects
- 🟣 **Electric violet + cyan** gradient accent palette
- 🔤 **Inter** font from Google Fonts
- ✨ **Micro-animations** — fade-in on mount, hover-lift on cards
- 🔴🟡🟢 **Priority badges** — High / Medium / Low with distinct colours
- 📱 **Responsive layout** — Kanban collapses to single column on mobile

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute.

---

<div align="center">

Made with ❤️ by **Harshit**

</div>
