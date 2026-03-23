<div align="center">

<img src="https://img.shields.io/badge/HireBridge-Job%20Portal-4F46E5?style=for-the-badge&logoColor=white" alt="HireBridge" />

# HireBridge — Full-Stack Job Portal

**A production-ready job portal built with the MERN stack featuring three distinct roles — Candidate, Employer, and Admin — with complete auth, job management, application tracking, and email notifications.**

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20Site-4F46E5?style=for-the-badge)](https://hirebridge.vercel.app)
[![Backend API](https://img.shields.io/badge/⚙️%20Backend%20API-Render-10B981?style=for-the-badge)](https://hirebridge-api.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-praveen24lingam-181717?style=for-the-badge&logo=github)](https://github.com/praveen24lingam)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Praveen%20Lingam-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/praveen-lingam24/)

</div>

---

## 📌 What is HireBridge?

HireBridge is a full-stack job portal where **candidates** find and apply for jobs, **employers** post listings and manage applicants, and **admins** moderate the entire platform. Every feature — from JWT authentication to automated email notifications — is built from scratch without shortcuts.

The goal was to build something that works like a real product, not just a portfolio demo.

---

## 🖥️ Screenshots

> _Add screenshots after deployment_
>
> Suggested shots:
> 1. Landing page with job search
> 2. Candidate dashboard with application tracker
> 3. Employer applicant list with shortlist/reject actions
> 4. Admin dashboard with platform stats

---

## ✨ Features

### 👤 For Candidates
- Register and log in with JWT-based authentication
- Build a profile with skills, education, bio, and resume link
- Profile completeness score (0–100%) with live progress bar
- Search and filter jobs by keyword, location, job type, and salary range
- Apply to jobs with an optional cover letter
- Track all applications and their real-time status (Applied / Shortlisted / Rejected / Withdrawn)
- Withdraw an application before it is reviewed
- Receive email notifications when application status changes

### 🏢 For Employers
- Register as an employer with a company profile
- Post jobs with full details — title, description, location, type, salary range, skills, deadline
- View all applicants per job with profile completeness indicators
- Shortlist or reject candidates with one click
- Automated email sent to candidate on every status change
- Close or delete job listings
- Dashboard with hiring stats — total jobs, active listings, total applications, this week's activity

### 🔐 For Admin
- Separate admin access with role-based route protection
- Platform-wide stats — total candidates, employers, jobs, applications
- View and moderate all job listings across all employers
- Deactivate any job listing instantly
- View and manage all users — candidates and employers
- Suspend any user account with cascading job deactivation
- Reactivate suspended users

### 🔒 Security
- JWT authentication with role-based access control
- Bcrypt password hashing (10 salt rounds)
- Helmet.js for HTTP security headers
- Rate limiting on login route (10 attempts per 15 minutes)
- Compound unique index on applications to prevent duplicates
- Password field excluded from all API responses

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 (Vite) | Fast build tool, component-based UI |
| Styling | Tailwind CSS | Utility-first, no extra UI library needed |
| State | React Context + useState | Simple, interview-explainable state management |
| HTTP Client | Axios | Interceptors for auth token and error handling |
| Backend | Node.js + Express.js | Lightweight REST API server |
| Database | MongoDB + Mongoose | Flexible document model for evolving schema |
| Authentication | JWT + bcryptjs | Stateless, scalable auth system |
| Email | Nodemailer | Direct Gmail SMTP, no third-party cost |
| Security | Helmet + express-rate-limit | HTTP headers + brute force protection |
| Frontend Deploy | Vercel | Free tier, auto-deploy from GitHub |
| Backend Deploy | Render | Free tier, persistent Node.js server |

---

## 🗄️ Database Architecture

Five collections power the entire platform:

```
users
├── name, email, password (hashed), role, isActive, createdAt
├── role: 'candidate' | 'employer' | 'admin'
└── isActive: false = suspended account

profiles  (candidate only)
├── userId → ref: users
├── phone, location, bio, skills[], education{}
├── resumeLink, completenessScore (0–100)
└── One profile per candidate, auto-created on register

companyprofiles  (employer only)
├── userId → ref: users
├── companyName, website, industry, description, logoUrl
└── One profile per employer, auto-created on register

jobs
├── employerId → ref: users
├── title, description, location, jobType, salaryMin, salaryMax
├── skillsRequired[], openings, deadline, applicantCount
└── status: 'active' | 'closed' | 'inactive' | 'deleted'

applications
├── jobId → ref: jobs
├── candidateId → ref: users
├── coverLetter, resumeLink, status, appliedAt, updatedAt
├── status: 'applied' | 'shortlisted' | 'rejected' | 'withdrawn'
└── Compound unique index on { jobId, candidateId }
     → Prevents duplicate applications at database level
```

---

## 🔌 API Overview

```
POST   /api/auth/register          Public   Register candidate or employer
POST   /api/auth/login             Public   Login and receive JWT

GET    /api/jobs                   Public   Search jobs with filters + pagination
GET    /api/jobs/:jobId            Public   Get single job detail

GET    /api/candidate/profile      Candidate   Get own profile
PUT    /api/candidate/profile      Candidate   Update profile + recalculate score
POST   /api/applications           Candidate   Apply to a job
GET    /api/applications/my        Candidate   Get all own applications
GET    /api/applications/check/:jobId  Candidate   Check if already applied
PATCH  /api/applications/:id/withdraw  Candidate   Withdraw an application

GET    /api/employer/profile       Employer   Get company profile
PUT    /api/employer/profile       Employer   Update company profile
GET    /api/employer/dashboard     Employer   Get hiring stats
POST   /api/jobs                   Employer   Post a new job
GET    /api/employer/jobs          Employer   Get own job listings
PATCH  /api/employer/jobs/:id/close    Employer   Close a job listing
DELETE /api/employer/jobs/:id      Employer   Delete a job listing
GET    /api/employer/jobs/:id/applicants   Employer   Get all applicants
PATCH  /api/employer/applications/:id/status  Employer  Shortlist or reject

GET    /api/admin/dashboard        Admin   Platform-wide stats
GET    /api/admin/jobs             Admin   All jobs with filters
PATCH  /api/admin/jobs/:id/deactivate  Admin   Deactivate a job
PATCH  /api/admin/jobs/:id/reactivate  Admin   Reactivate a job
GET    /api/admin/users            Admin   All users with filters
PATCH  /api/admin/users/:id/suspend    Admin   Suspend a user
PATCH  /api/admin/users/:id/reactivate Admin   Reactivate a user
```

---

## 🔑 Role-Based Access Control

```
Every protected route runs two middleware functions in sequence:

1. authenticate.js
   → Reads Authorization: Bearer <token> from header
   → Verifies token with JWT_SECRET
   → Attaches decoded { userId, role, name } to req.user
   → Returns 401 if token is missing, invalid, or expired

2. authorizeRole('candidate' | 'employer' | 'admin')
   → Checks req.user.role matches required role
   → Returns 403 if role does not match
   → Controller only runs if both checks pass
```

---

## 📧 Email Notifications

| Trigger | Recipient | Subject |
|---------|-----------|---------|
| Candidate applies to a job | Candidate | Application received confirmation |
| Candidate applies to a job | Employer | New application notification |
| Employer shortlists candidate | Candidate | You have been shortlisted |
| Employer rejects candidate | Candidate | Application status update |
| Admin suspends account | User | Account suspended notice |

> All emails are fire-and-forget — email failure never breaks the API response. Failures are logged server-side with recipient, subject, error message, and timestamp.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Gmail account with App Password enabled

### 1. Clone the repository

```bash
git clone https://github.com/praveen24lingam/hirebridge.git
cd hirebridge
```

### 2. Setup Backend

```bash
cd server
npm install
cp .env.example .env
```

Fill in your `.env` file — see Environment Variables section below.

```bash
node server.js
```

Server runs at `http://localhost:5000`

### 3. Setup Frontend

```bash
cd ../client
npm install
```

Create `client/.env`:
```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

### 4. Create Admin User

Go to MongoDB Atlas → Browse Collections → users → Insert Document:

```json
{
  "name": "Admin",
  "email": "admin@hirebridge.com",
  "password": "<bcrypt hash of your password>",
  "role": "admin",
  "isActive": true,
  "createdAt": { "$date": "2025-01-01T00:00:00Z" }
}
```

To generate a bcrypt hash locally:
```bash
node -e "require('bcryptjs').hash('yourpassword', 10).then(h => console.log(h))"
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/hirebridge` |
| `JWT_SECRET` | Secret key for signing JWT tokens | Any random 32+ character string |
| `EMAIL_USER` | Gmail address for sending emails | `you@gmail.com` |
| `EMAIL_PASS` | Gmail App Password (not your main password) | `xxxx xxxx xxxx xxxx` |
| `CLIENT_URL` | Frontend URL for CORS | `https://hirebridge.vercel.app` |

### Frontend (`client/.env`)

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Backend API base URL | `https://hirebridge-api.onrender.com` |

---

## 📦 Deployment

### Backend → Render

1. Push `server/` code to GitHub
2. Render → New Web Service → Connect repo
3. Root Directory: `server`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add all environment variables from table above
7. Deploy and copy the Render URL

### Frontend → Vercel

1. Push `client/` code to GitHub
2. Vercel → New Project → Import repo
3. Root Directory: `client`
4. Add environment variable: `VITE_API_URL` = Render URL
5. Deploy and copy the Vercel URL
6. Go back to Render → update `CLIENT_URL` with Vercel URL

---

## 🔮 What I Would Build in V2

| Feature | Why |
|---------|-----|
| Real-time notifications | WebSockets for instant status updates without page refresh |
| Resume file upload | Multer + Cloudinary instead of external link |
| Job approval queue | Admin approves jobs before they go live to candidates |
| In-platform messaging | Candidate-employer chat after shortlisting |
| MongoDB text indexes | Full-text search with relevance ranking instead of regex |

---

## 👨‍💻 Author

**Praveen Lingam**

[![GitHub](https://img.shields.io/badge/GitHub-praveen24lingam-181717?style=flat&logo=github)](https://github.com/praveen24lingam)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-praveen--lingam24-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/praveen-lingam24/)

---

<div align="center">
  <p>Built with focus on clean code, interview-ready architecture, and real product thinking.</p>
  <p>⭐ Star this repo if you found it helpful</p>
</div>
