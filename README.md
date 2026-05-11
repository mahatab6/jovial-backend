# ⚙️ Jovial AI - Backend

### **Robust & Scalable AI Content Generation Engine**

[![Node.js](https://img.shields.io/badge/Node.js-20-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-black?style=flat-square&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 📖 Project Overview

The **Jovial AI Backend** is a high-performance REST API built with Node.js and TypeScript. It serves as the core intelligence engine for the Jovial AI platform, orchestrating complex AI workflows, managing secure role-based access, and providing real-time data for the administration dashboard.

### **Core Capabilities**
- **AI Orchestration**: Seamlessly interacts with Google Gemini 1.5.
- **Unified Auth**: Centralized authentication and authorization with Better-Auth.
- **Modular Design**: Domain-driven architecture for high maintainability.
- **Data Security**: Strict Zod validation and Prisma type-safety.

---

## 🔗 API Resources

| Resource | URL |
| :--- | :--- |
| **API Base URL** | [https://jovial-backend-production.up.railway.app](https://jovial-backend-production.up.railway.app) |
| **Frontend Live** | [https://jovial-ai-frontend.vercel.app](https://jovial-ai-frontend.vercel.app) |
| **GitHub Repo** | [https://github.com/mahatab6/jovial-backend](https://github.com/mahatab6/jovial-backend) |

---

## ✨ Backend Features

### 🛡️ Security & Auth
- [x] **Better-Auth Integration**: Enterprise-grade session and OAuth management.
- [x] **RBAC (Role Based Access Control)**: Middleware-driven permission system (ADMIN, MANAGER, USER).
- [x] **CORS & Secure Headers**: Configured for cross-domain production environments.

### 🤖 AI content Pipeline
- [x] **Google Gemini Integration**: Optimized prompt engineering for specific content types.
- [x] **History Tracking**: Automatic persistence of all AI generations per user.
- [x] **Dynamic Templates**: Admin-defined prompt specifications injected into AI queries.

### 📈 System Management
- [x] **Advanced Filtering**: Custom `QueryBuilder` for complex searching/sorting.
- [x] **Global Stats**: Aggregated metrics for AI usage and user activity.
- [x] **Prisma Multi-Schema**: Cleanly organized database models for scalability.

---

## 🛠️ Tech Stack

### **Core Engine**
- **Runtime**: Node.js v20+
- **Framework**: Express.js with TypeScript
- **ORM**: Prisma (PostgreSQL)

### **Authentication**
- **Engine**: Better-Auth
- **Plugins**: Bearer, OAuth (Google)

### **AI Tools**
- **API**: Google Generative AI (Gemini 1.5 Pro/Flash)

### **DevOps**
- **Deployment**: Railway
- **Environment**: Cloudflare/Vercel trusted origins

---

## 🏗️ Backend Architecture

### **Modular Structure**
The project follows a modular design pattern where each domain (User, Template, AI) contains its own routes, controller, service, and validation logic.

```bash
src/
├── app/
│   ├── modules/            # Domain-specific modules
│   │   ├── ai/             # AI generation logic
│   │   ├── templates/      # Template management CRUD
│   │   ├── user/           # User & Role management
│   │   └── stats/          # Dashboard analytics
│   ├── middlewares/        # Auth, Validation, Global Error Handling
│   ├── lib/                # Database and Auth initializers
│   └── routes/             # Route index aggregation
├── config/                 # App configuration & logger
└── prisma/                 # Database schema (multi-file)
```

---

## 🛣️ API Documentation

### **Auth Routes**
| Method | Route | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/api/auth/session` | Get current session | Public |
| POST | `/api/auth/sign-in` | Email/Pass Login | Public |
| GET | `/api/auth/callback/google` | OAuth Callback | Public |

### **Template Routes**
| Method | Route | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/templates` | List templates | Public |
| GET | `/api/v1/templates/:id` | Template details | Public |
| POST | `/api/v1/templates` | Create template | Admin |
| PUT | `/api/v1/templates/:id` | Update template | Admin |
| DELETE | `/api/v1/templates/:id` | Delete template | Admin |

### **AI Routes**
| Method | Route | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/ai/generate` | Generate AI content | Authenticated |

---

## 🚀 Installation & Setup

1. **Clone & Install**
   ```bash
   git clone https://github.com/mahatab6/jovial-backend.git
   cd jovial-backend
   npm install
   ```

2. **Setup Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Configure Environment Variables**
   Create a `.env` file:
   ```env
   DATABASE_URL=your_postgresql_url
   BETTER_AUTH_SECRET=your_secret
   BETTER_AUTH_URL=backend_base_url
   FRONTEND_URL=frontend_base_url
   GEMINI_API_KEY=your_google_ai_key
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   ```

4. **Run Server**
   ```bash
   npm run dev
   ```

---

## 👨‍💻 Author
**Mahatab**
- **GitHub**: [@mahatab6](https://github.com/mahatab6)
- **LinkedIn**: [Your LinkedIn Link]

---

## 📄 License
MIT License.
