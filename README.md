# 🚀 JobNova

JobNova is a comprehensive, modern employment platform built for both **White Collar Professionals** and **Blue Collar Skilled Workers**. It bridges the gap between employers and job seekers by seamlessly integrating two distinct hiring ecosystems into one unified portal.

---

## ✨ Key Features

### 🏢 For Employers
- **Dual Hiring Mode:** Seamlessly switch between posting permanent White Collar roles and hiring for short-term Blue Collar tasks.
- **Applicant Management:** Review applications, analyze parsed CVs, and shortlist candidates with a clean, kanban-style management flow.
- **Task Assignment:** Assign tasks instantly to local skilled workers via geolocation mapping.
- **Hiring History & Rating:** Premium UI to track past hires and leave ratings for workers.

### 💼 For White Collar Professionals
- **AI-Powered CV Parsing:** Upload your PDF/Word CV and let the system automatically extract your skills, education, and experience.
- **Smart Job Matching:** Get matched with relevant permanent roles based on parsed skills.
- **Application Tracking:** Minimalist dashboard to track the status of all active job applications.

### 🧑‍🔧 For Blue Collar Workers
- **Urdu Voice Assistant:** Navigate and search for jobs using our bilingual voice assistant—tailored specifically to support Roman Urdu ("bijli ka kaam"). 
- **Geo-location Map Searching:** Find nearby gigs directly on an integrated map view based on user-defined work radiuses.
- **Flexible Availability & Hourly Rates:** Easily set working hours and rates with quick toggles.

### 🛡️ Admin & Security
- **Comprehensive Admin Dashboard:** Bird's eye view of the platform’s health with detailed statistics.
- **Identity Verification:** Users can submit their ID/CNIC for verification to earn a trust badge.
- **Compliance & Complaints:** Robust report-and-resolve workflow where admins can view complaints, dismiss them, or immediately suspend violating users.

---

## 🛠️ Technology Stack

- **Frontend:** React.js (Context API, standard CSS architecture, CSS Glassmorphism)
- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL)
- **APIs & Integrations:** 
  - Real-time WebSockets for Chat 
  - Geolocation Mapping Algorithms
  - Bilingual Custom Voice-to-Text Processing
  - Regex-based Document Parsing Algorithms

---

## 🚀 Getting Started

### 1. Requirements
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v16+)
- A [Supabase](https://supabase.com/) Project instance (for the database)

### 2. Installation
Clone the repository:
```bash
git clone https://github.com/iShadabAli/JobNova.git
cd JobNova
```

Install the dependencies for both the frontend and backend:
```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3. Environment Variables
Create a `.env` file in **both** your `frontend` and `backend` directories referencing proper Supabase URLs and database connections as well as any specific JWT secrets. (A `.env.example` file is provided where applicable).

### 4. Running the Application Locally
We have provided a convenient batch script to spin up both servers at once on Windows:

Double click the `start_project.bat` file in the root directory.

*Alternatively, start them separately:*
```bash
# Terminal 1 - Backend (Runs on http://localhost:5000)
cd backend
npm run dev

# Terminal 2 - Frontend (Runs on http://localhost:3000)
cd frontend
npm start
```

---

## 🎓 Final Year Project Details
JobNova is proudly engineered as a fully optimized, production-ready system to fulfil Final Year Project (FYP) requirements. The platform prioritizes architectural integrity via a strict 3-tier structure (Presentation -> Business Logic -> Data Layer), preventing database bloat and demonstrating solid, scalable software engineering principles.

*Developed with passion.*
