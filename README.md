# HireBridge - Full-Stack Job Portal

[![Live Demo](https://img.shields.io/badge/Live-Demo-indigo)](YOUR_VERCEL_URL)
[![Backend](https://img.shields.io/badge/API-Render-green)](YOUR_RENDER_URL)

> A full-stack job portal with three roles - Candidate, Employer, and Admin - built to demonstrate end-to-end product thinking and full-stack development skills.

## Screenshots
[Add 3 screenshots after deployment:
1. Landing page with search
2. Candidate dashboard with applications
3. Employer applicant list with drawer open]

## Features

### For Candidates
- Browse and search jobs with filters
- Apply with optional cover letter
- Track application status in real time
- Build profile with completeness score

### For Employers
- Post jobs with full details
- View and manage applicants
- Shortlist or reject with one click
- Automated email notifications

### For Admin
- Platform-wide stats dashboard
- Job moderation (activate/deactivate)
- User management (suspend/reactivate)
- Cascading actions on suspension

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React (Vite) + Tailwind CSS | Fast build, utility-first styling |
| Backend | Node.js + Express.js | Lightweight, JavaScript end-to-end |
| Database | MongoDB + Mongoose | Flexible schema for evolving data |
| Auth | JWT + bcryptjs | Stateless, scalable authentication |
| Email | Nodemailer | Direct SMTP, no third-party cost |
| Deploy | Vercel + Render | Free tier, suitable for portfolio |

## Architecture

### Database Collections
- **users** - all roles in one collection, differentiated by role field
- **profiles** - candidate-specific data, linked to users by userId
- **companyprofiles** - employer company info, linked to users by userId
- **jobs** - all job postings, linked to employer via employerId
- **applications** - join between candidates and jobs, compound unique index prevents duplicates

### API Overview
- `/api/auth` - register and login
- `/api/jobs` - public job search and detail
- `/api/candidate` - profile management
- `/api/applications` - apply, track, withdraw
- `/api/employer` - job posting, applicant management
- `/api/admin` - moderation and user management
- `/api/stats` - public homepage stats

## Getting Started

1. Clone the repository
2. `cd server && npm install`
3. Create `server/.env` from `server/.env.example`
4. `cd ../client && npm install`
5. Create `client/.env` with `VITE_API_URL=http://localhost:5000`
6. `cd ../server && node server.js`
7. `cd ../client && npm run dev`
8. Open `http://localhost:5173`

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| MONGODB_URI | MongoDB Atlas connection | mongodb+srv://... |
| JWT_SECRET | JWT signing key | random-32-char-string |
| EMAIL_USER | Gmail address | you@gmail.com |
| EMAIL_PASS | Gmail App Password | xxxx xxxx xxxx xxxx |
| CLIENT_URL | Frontend URL for CORS | https://hirebridge.vercel.app |
| VITE_API_URL | Backend URL | https://hirebridge-api.onrender.com |

## What I'd Build in V2
- **Real-time notifications** using WebSockets - instant alerts when application status changes
- **Resume file upload** using Multer + Cloudinary - instead of external resume link
- **Job approval queue** - admin approves jobs before they go live
- **Candidate-employer messaging** - in-platform chat after shortlisting
- **AI job matching** - recommend jobs based on candidate skills profile

## Author
[Your Name] - [LinkedIn URL] - [Portfolio URL]
