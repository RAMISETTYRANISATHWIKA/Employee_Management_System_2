# Employee Management System (MERN Stack)

A complete, modern Employee Management System built with MongoDB, Express.js, React, and Node.js. Features role-based access control, staff and admin portals, leave management, salary tracking, EOD reports, announcements, and analytics.

## Features

### Staff Portal
- Dashboard with announcements, holidays, leave balance, salary status
- Leave request management with balance validation
- Salary history (own records only)
- Daily EOD work tracking (draft/submit)
- Profile management
- Announcements with read/unread status
- Holiday calendar
- Notifications

### Admin Portal
- Dashboard with Recharts analytics
- Employee CRUD with search, filter, pagination
- Leave approval/rejection workflow
- Salary record management with status workflow
- EOD report review
- Holiday and announcement management
- Reports and audit logs

### Security
- JWT authentication with role validation on backend
- bcrypt password hashing
- Rate limiting on login
- Helmet security headers
- CORS from environment
- Audit logging for sensitive actions
- Auto-generated admin credentials with forced password change

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, Recharts, React Hook Form, Zod, Lucide Icons |
| Backend | Node.js, Express, Mongoose, JWT, bcryptjs, Helmet, express-rate-limit, express-validator |
| Database | MongoDB (Atlas or local) |

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **MongoDB** — local installation or MongoDB Atlas account
- **npm** (comes with Node.js)

## Project Structure

```
employee_manage/
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── credentials/     # Generated login credentials (git-ignored)
├── .env.example     # Environment template
└── package.json     # Root scripts
```

## Setup (Windows)

### 1. Clone / navigate to project

```powershell
cd C:\Users\MALLIKARJUN\employee_manage
```

### 2. Install dependencies

```powershell
npm run install-all
```

### 3. Configure environment

```powershell
copy .env.example .env
```

Edit `.env` and set your MongoDB connection string:

```env
MONGO_URI=mongodb://127.0.0.1:27017/employee_manage
# Or MongoDB Atlas:
# MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/employee_manage

JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=1d
PORT=5000
CLIENT_URL=http://localhost:5173
INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_STAFF_EMAIL=staff@example.com
```

> **Important:** Do not commit `.env`. Never hardcode real MongoDB Atlas credentials in source code.

### 4. Start MongoDB

Ensure MongoDB is running locally, or use a valid Atlas connection string in `.env`.

### 5. Seed initial accounts

```powershell
npm run seed:all
```

This creates:
- **Admin account** — random password, must change on first login
- **Staff account** — random password for testing

Credentials are saved to `credentials/initial-credentials.txt` (git-ignored).

### 6. Start development servers

```powershell
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Login

1. Open http://localhost:5173/login
2. Toggle **Staff** or **Admin**
3. Use credentials from `credentials/initial-credentials.txt`
4. Admin must change password on first login

Login accepts **email** or **employee ID** + password. Role is validated server-side.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run install-all` | Install root, server, and client dependencies |
| `npm run dev` | Run frontend + backend concurrently |
| `npm run seed:admin` | Seed admin only (idempotent) |
| `npm run seed:all` | Seed admin + staff + sample data |
| `npm run test` | Run backend unit tests |

### Server only

```powershell
cd server
npm run dev
npm run seed:all
```

### Client only

```powershell
cd client
npm run dev
npm run build
```

## API Overview

| Route | Description |
|-------|-------------|
| `POST /api/auth/login` | Login (email/employeeId + password + role) |
| `GET /api/auth/me` | Current user |
| `POST /api/auth/change-password` | Change password |
| `GET/POST /api/employees` | Employee management |
| `GET/POST /api/leaves` | Leave requests |
| `PATCH /api/leaves/:id/review` | Approve/reject leave |
| `GET/POST /api/salaries` | Salary records |
| `GET/POST /api/eod` | EOD reports |
| `GET/POST /api/announcements` | Announcements |
| `GET/POST /api/holidays` | Holidays |
| `GET /api/notifications` | Notifications |
| `GET /api/reports/dashboard` | Dashboard stats |
| `GET /api/reports/audit-logs` | Audit logs |

All protected routes require `Authorization: Bearer <token>`.

## Database Models

1. **User** — auth, role, permissions
2. **Employee** — employee profile and leave balance
3. **LeaveRequest** — leave workflow
4. **SalaryRecord** — payroll records
5. **EODReport** — daily work reports
6. **Announcement** — company announcements
7. **Holiday** — company holidays
8. **Notification** — user notifications
9. **AuditLog** — admin action audit trail

## Testing

```powershell
npm run test
```

Covers leave calculation logic and authorization enums. Integration tests against a live database are not included — run manual verification after seeding.

## Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET` from a secrets manager
3. Configure MongoDB Atlas with IP allowlist and least-privilege user
4. Enable HTTPS (reverse proxy / platform TLS)
5. Set `CLIENT_URL` to your production frontend URL
6. Build client: `cd client && npm run build`
7. Serve client static files or deploy separately

## Known Limitations

- File upload for attachments is schema-ready but UI upload is not implemented
- Payslip PDF generation not implemented
- Attendance module not implemented
- Email notifications are in-app only (no SMTP)
- Dark theme only in current UI

## Security Notes

- Rotate credentials after first login
- Delete `credentials/` files after saving passwords securely
- Never expose `.env` or credentials in version control
- Backend validates all roles and permissions — frontend role toggle is not trusted
