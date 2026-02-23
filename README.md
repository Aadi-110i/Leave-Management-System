# 🏢 Employee Leave Management System (ELMS)

A full-stack HR leave management system built with **React + Node.js + MongoDB**, featuring JWT authentication, role-based access control, and a premium Beige + Dark Grey design theme.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS v3 |
| Routing | React Router v7 |
| State | Context API + localStorage |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Token) |
| Charts | Chart.js + react-chartjs-2 |
| Notifications | react-hot-toast |
| Icons | react-icons (Material Design) |

---

## 📁 Project Structure

```
Employee Leave Management System/
├── server.js              # Express app entry point
├── package.json           # Backend dependencies
├── .env                   # Environment variables (not committed)
├── seed.js                # Database seeder
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   ├── User.js            # User schema (name, email, role, dept)
│   └── Leave.js           # Leave schema (type, dates, status)
├── controllers/
│   ├── authController.js  # Register, Login, GetMe
│   ├── userController.js  # Admin CRUD operations
│   └── leaveController.js # Apply, Approve, Reject, Stats
├── middleware/
│   ├── authMiddleware.js  # JWT verification
│   └── roleMiddleware.js  # Role-based access guard
├── routes/
│   ├── authRoutes.js      # /api/auth/*
│   ├── userRoutes.js      # /api/users/*
│   └── leaveRoutes.js     # /api/leaves/*
└── client/                # React frontend
    ├── src/
    │   ├── api/           # Axios instance + API calls
    │   ├── context/       # AuthContext (JWT + user state)
    │   ├── components/    # Sidebar, Navbar, StatusBadge, LoadingSpinner
    │   ├── pages/         # Login, Register, Employee/Manager/Admin dashboards
    │   └── routes/        # ProtectedRoute, RoleRoute
    └── tailwind.config.js
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

### 1. Clone & Install Backend

```bash
# Install backend dependencies (already in root)
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/leave_management
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Seed the Database

```bash
npm run seed
```

This creates demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@elms.com | admin123 |
| Manager | manager@elms.com | manager123 |
| Employee | john@elms.com | emp123 |
| Employee | anita@elms.com | emp123 |
| Employee | raj@elms.com | emp123 |

### 4. Start Backend Server

```bash
npm run dev
# Server running on http://localhost:5000
```

### 5. Setup & Start Frontend

```bash
cd client
npm install
npm run dev
# Frontend running on http://localhost:5173
```

---

## 🧑‍💼 Role-Based Features

### 👤 Employee
- View personal leave summary (Pending / Approved / Rejected)
- Apply for leave with type, dates, and reason
- View leave history with status
- Cancel pending leave requests
- Doughnut chart showing leave distribution

### 👔 Manager
- View all employee leave requests
- Filter by status (Pending / Approved / Rejected)
- Approve or reject requests with optional review note
- Overview stats for all requests

### 🛡️ Admin
- Full user management (Create, Read, Update, Delete)
- Assign roles (Admin / Manager / Employee)
- Search users by name, email, or role
- View user stats by role

---

## 🔐 API Endpoints

### Auth (`/api/auth`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login & get JWT |
| GET | `/me` | Private | Get current user |

### Users (`/api/users`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Admin | List all users |
| POST | `/` | Admin | Create user |
| PUT | `/:id` | Admin | Update user/role |
| DELETE | `/:id` | Admin | Delete user |

### Leaves (`/api/leaves`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/` | All | Apply for leave |
| GET | `/` | All | Get leaves (role filtered) |
| GET | `/stats` | All | Get leave statistics |
| PUT | `/:id/approve` | Manager/Admin | Approve leave |
| PUT | `/:id/reject` | Manager/Admin | Reject leave |
| DELETE | `/:id` | Owner/Admin | Delete pending leave |

---

## 🎨 Design System

- **Primary Background**: Beige `#DDD0C8`
- **Sidebar/Dark UI**: Dark Grey `#323232`
- **Font**: Inter (Google Fonts)
- **Border Radius**: Rounded corners throughout (xl, 2xl)
- **Animations**: Smooth hover transitions, float animation on logos
