<div align="center">
  
  # 💎 CoreOnyx
  **Your intelligent course companion, built for clarity.**

  <br />
  
  ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
  ![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)
  ![Prisma](https://img.shields.io/badge/Prisma-ORM-1B222D?style=for-the-badge&logo=prisma)
  ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

</div>

<br />

## 🌟 Overview
CoreOnyx is a premium, high-security academic dashboard designed to streamline the grading and assessment process between Teaching Assistants and Students. Featuring a stunning dark/light-mode UI, it offers a seamless and highly secure experience.

## ✨ Key Features
- **🔒 High Security Auth:** NextAuth v5 integration with strict middleware-based route guarding.
- **🛡️ Auto-Bootstrap Zero State:** The first user to log in automatically assumes ownership and `ADMIN` privileges.
- **👥 Whitelist Roster Management:** Complete lockdown of the platform. Admins must explicitly invite/whitelist students before they can access the portal.
- **📊 Real-time Grade Syncing:** Instant grade updates and CSV bulk-uploading capabilities.
- **🎨 Premium UI/UX:** Built with Tailwind CSS featuring micro-animations, glassmorphism, and a highly polished dark/light-mode aesthetic.

## 🧭 Dashboard Features

### For Teaching Assistants (Admin)
- **👥 Roster & Whitelist Management:** Add students individually or bulk-import via CSV to grant them access to the platform.
- **📊 Grades Dashboard:** Upload student grades via CSV. The system automatically calculates percentages and letter grades.
- **📢 Announcements System:** Pin urgent messages and broadcast important course updates to all students.
- **💬 Q&A Hub:** Respond to public FAQs and private student questions in real-time.
- **🎫 Dispute Resolution:** Review and resolve grade dispute tickets securely with attached evidence.
- **💻 Solutions Repository:** Manage and publish code solutions with embedded syntax highlighting.

### For Students
- **📈 Personal Analytics:** View individual grades, performance metrics, and overall class standing.
- **❓ Interactive Q&A:** Ask private questions to TAs or participate in public threads.
- **📝 Dispute Tickets:** Submit structured grade dispute tickets and attach necessary file evidence.
- **📚 Solutions Viewer:** Read annotated course solutions released by the TA.
- **🔔 Live Announcements:** Stay up-to-date with pinned alerts and recent course news.

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/AhmadFarazDev001/CoreOnyx.git
cd CoreOnyx
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add your connection strings (Neon Database, NextAuth Secret, Google OAuth Credentials).

### 4. Push Database Schema
```bash
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to view the application!

## 🔐 Deployment & Bootstrap Notes
When deploying this application to production:
1. Ensure the database is completely empty.
2. The **very first Google account** to log in will be automatically granted the `ADMIN` role.
3. The Admin can then add students via the **Roster Dashboard**.

---
<div align="center">
  <i>Designed and engineered for maximum security and premium aesthetics.</i>
</div>
