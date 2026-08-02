<div align="center">
  
  # 💎 CoreOnyx
  **A Premium Academic Management Platform**

  <br />
  
  ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
  ![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)
  ![Prisma](https://img.shields.io/badge/Prisma-ORM-1B222D?style=for-the-badge&logo=prisma)
  ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)

</div>

<br />

## 🌟 Overview 
CoreOnyx is a robust, full-stack academic dashboard built for university courses. Designed with a premium aesthetic and high security in mind, it provides a seamless portal for Teaching Assistants (Admins) and Students to manage grades, announcements, code solutions, Q&A threads, and dispute tickets.

---

## 🛠️ Technology Stack
- **Framework:** Next.js 15 (App Router, Server Components, Server Actions)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Dark/Light mode, Glassmorphism, Micro-animations)
- **Database:** PostgreSQL (Hosted via Neon)
- **ORM:** Prisma v5
- **Authentication:** Auth.js (NextAuth v5) with Google OAuth
- **File Storage:** Vercel Blob (For Dispute Ticket attachments)
- **Deployment:** Vercel

---

## ✨ Core Features & Architecture

### Security First
- **Zero-State Bootstrapping:** The first user to log in to a fresh database is automatically assigned the `ADMIN` role.
- **Strict Roster Access:** The platform is entirely locked down. Users cannot access the portal unless their email is explicitly whitelisted by the Admin.
- **Robust CSRF Protection:** Internal API routes (like CSV uploads) are fortified with dual Origin/Host header validation to prevent Cross-Site Request Forgery, even on dynamic Vercel deployments.
- **Middleware Guarding:** Edge-compatible Next.js Middleware blocks unauthorized routes instantly, while Server Actions double-check database-level blocking states.

### 👨‍🏫 Admin (TA) Portal
- **Whitelist Management:** Single or bulk CSV imports for authorizing student emails.
- **Grade Management:** CSV bulk uploads for grades, featuring automatic calculation of absolute weights (e.g., `Quiz 1 [Max:20, Abs:2]`), precise to 3 decimal places.
- **Ticketing System:** Review and resolve student dispute tickets. Attached evidence files are managed via Vercel Blob and automatically cleaned up upon resolution.
- **Solutions & Announcements:** Rich text editor for publishing code solutions (with Shiki syntax highlighting) and pinned announcements.

### 🎓 Student Portal
- **Interactive Analytics:** View individual grades and course standing securely.
- **Dispute Submission:** Submit structured tickets with image/PDF evidence directly to the Admin.
- **Q&A Hub:** Start public threads or private conversations with the teaching staff.

---

## 📂 Project Structure

```text
CoreOnyx/
├── prisma/
│   └── schema.prisma        # Database schema definitions
├── src/
│   ├── app/                 # Next.js App Router (Pages, Layouts, API Routes)
│   │   ├── (admin)/         # Protected Admin Routes
│   │   ├── (student)/       # Protected Student Routes
│   │   ├── (auth)/          # Login and Onboarding Routes
│   │   └── api/             # API Endpoints (Uploads, Auth, Logout)
│   ├── components/          # Reusable React UI Components
│   │   ├── admin/           # Admin specific widgets
│   │   ├── shared/          # Buttons, Cards, Inputs, Layouts
│   │   └── ... 
│   ├── lib/                 # Core Utilities
│   │   ├── actions/         # Next.js Server Actions (Database logic)
│   │   ├── auth.ts          # Auth.js Configuration
│   │   ├── prisma.ts        # Prisma Client Singleton
│   │   └── utils.ts         # Tailwind/CSS Helpers
│   └── proxy.ts             # Next.js Middleware
```

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
- **Node.js** (v18.17.0 or newer)
- **PostgreSQL Database** (e.g., [Neon](https://neon.tech/))
- **Google Cloud Console** (For OAuth Client ID and Secret)
- **Vercel Account** (For Blob Storage)

### 2. Clone the Repository
```bash
git clone https://github.com/AhmadFarazDev001/CoreOnyx.git
cd CoreOnyx
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory and populate it with the following keys:

```env
# Database
DATABASE_URL="postgres://user:password@host:port/neondb?sslmode=require"

# NextAuth (Auth.js)
AUTH_SECRET="generate-a-random-32-char-string-here"
AUTH_GOOGLE_ID="your-google-oauth-client-id"
AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"

# Application URL (Used for absolute redirects)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

### 5. Initialize the Database
Push the Prisma schema to your database to create the necessary tables:
```bash
npx prisma db push
```
*(Note: If you plan on using migrations in the future, initialize with `npx prisma migrate dev` instead.)*

### 6. Start the Development Server
```bash
npm run dev
```
Visit `http://localhost:3000`. The first Google Account to log in will automatically be granted the `ADMIN` role.

---

## 📦 Deployment Guide (Vercel)

1. **Environment Variables:** Ensure all `.env` variables are added to your Vercel Project Settings. 
2. **Build Cache:** If you ever perform a hard database reset (`npx prisma migrate reset`) while the app is deployed, you **must redeploy without the Build Cache**. Next.js statically generates pages during the build, and a corrupted cache can cause deployment failures if the database tables are missing.
3. **Dynamic Routing:** The `/(admin)` and `/(student)` layouts are hard-coded with `export const dynamic = 'force-dynamic';`. This prevents Vercel from attempting to execute hundreds of Prisma queries during the build phase, which would otherwise exhaust Serverless Postgres connection pools.

## 📝 CSV Upload Formats

### Whitelist Roster
Upload a standard CSV with a single column header `emails` or `email`, followed by the student emails.

### Grades
The system calculates absolute percentages automatically based on header formatting. 
**Header Format:** `Assessment Name [Max:Total_Marks, Abs:Weight_Percentage]`

| Email | Quiz 1 [Max:20, Abs:2] | Midterm [Max:100, Abs:25] |
| :--- | :--- | :--- |
| student1@nu.edu.pk | 18 | 85 |

---

<div align="center">
  <i>Engineered for stability, speed, and premium aesthetics.</i>
</div>
