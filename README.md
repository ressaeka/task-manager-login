# Task Manager API

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.x-orange.svg)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-purple.svg)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Deskripsi

Task Manager API adalah backend RESTful API untuk aplikasi manajemen task (todo list) dengan sistem authentication dan authorization berbasis role (User & Admin). Dibangun menggunakan **Node.js, Express, dan PostgreSQL** dengan arsitektur MVC yang bersih dan scalable.

## Fitur Lengkap

###  Authentication & Authorization
- ✅ Register & Login dengan JWT
- ✅ Password hashing dengan bcrypt
- ✅ Role-based access (User & Admin)
- ✅ Logout dengan token blacklist (Redis)
- ✅ Middleware untuk proteksi route

### Task Management (User)
- ✅ Create task baru (bisa dengan/tanpa deadline)
- ✅ Read semua task milik sendiri (dengan pagination)
- ✅ Read detail task by ID
- ✅ Update task (title, description, status, deadline)
- ✅ Delete task (hard delete)
- ✅ Soft delete & restore task (tong sampah dengan expiry 30 hari)
- ✅ Filter task by status (pending, in-progress, done)
- ✅ Search task by title
- ✅ Sorting task (by created_at, title, status, deadline_at)
- ✅ Deadline task management (set deadline, lihat deadline terdekat, deadline hari ini)
- ✅ Validasi input task

### Admin Dashboard
- ✅ Manage semua users (CRUD)
- ✅ Manage semua task (Read only)
- ✅ Search users by username
- ✅ Search users by public_id
- ✅ Filter users by role (user/admin)
- ✅ Filter task by status
- ✅ Search task by title (admin)
- ✅ Pagination untuk users & task
- ✅ Soft delete & restore user (dengan expiry 30 hari, task ikut terhapus)
- ✅ Dashboard statistics (total users, tasks, completion rate, dll)
- ✅ Create admin baru

### Security Features
- ✅ JWT token dengan expiry (7 hari)
- ✅ Rate limiting (login 5x/15 menit, register 3x/jam, API 100x/menit, admin 200x/menit)
- ✅ Input validation
- ✅ SQL injection protection (parameterized queries)
- ✅ Error handling global
- ✅ Environment variables

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password:** bcrypt
- **Validation:** Custom validators
- **Rate Limiting:** express-rate-limit
- **Caching/Blacklist:** Redis (optional)

### Tools & Testing
- **Testing:** Jest & Supertest
- **Linting:** ESLint
- **Formatting:** Prettier
- **Version Control:** Git


##  Cara Install & Menjalankan

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- npm atau yarn
- Redis (optional, untuk logout blacklist)

### Langkah-langkah

1. **Clone repository**
```bash
git clone https://github.com/username/task-manager-api.git
cd task-manager-api