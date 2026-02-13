# Aura Experience 🌌

A high-performance, secure event infrastructure and ticketing platform built with Next.js 15, Prisma, and Tailwind CSS. Aura provides a seamless experience for users to discover events, for organizers to manage sales, and for admins to oversee the entire ecosystem.

## ✨ Features

- **🛡️ Secure Ticketing**: Cryptographic ticket generation and QR code validation to prevent fraud.
- **⚡ Real-time Reservations**: High-performance engine for instant ticket holds and inventory management.
- **🎭 Multi-role System**: 
  - **Citizens (Users)**: Browse events, purchase tickets, and manage their profile.
  - **Organizers**: Create events, track sales analytics, and manage attendees.
  - **Admins**: Moderate events, manage users, and view system-wide audit logs.
  - **Super Admins**: Full system control including administrator management.
- **📊 Advanced Analytics**: Sales trends, attendee tracking, and performance metrics for organizers.
- **📱 Responsive UI**: Modern, glassmorphic design with a mobile-first approach.
- **🔒 Security**: Role-based access control (RBAC), secure authentication, and comprehensive audit logging.

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [Prisma](https://www.prisma.io/) with SQLite (local)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Server Components & Server Actions
- **Security**: JWT-based auth with `jose`, `bcryptjs` for hashing.

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+ 
- npm / yarn / pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```bash
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📂 Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components (Admin, Organizer, Shared).
- `src/lib`: Core utilities (Auth, Prisma client, QR generation).
- `src/services`: Business logic for ticketing, validation, and administration.
- `prisma`: Database schema and seed scripts.
- `public`: Static assets and user uploads.

## 🔐 Role Access

| Role | Access Level |
| :--- | :--- |
| **User** | Browse, Book, Profile |
| **Organizer** | Create Events, Analytics, Check-in Interface |
| **Admin** | Approve/Reject Events, Block Users, Audit Logs |
| **Super Admin** | Everything + Manage Administrators |

## 📜 License

This project is private and proprietary.
