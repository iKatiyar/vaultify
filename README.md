# 🔐 Vaultify

> Distributed authentication & authorization system built for scale — JWT + OAuth2, BCrypt encryption, Role-Based Access Control, and a React admin dashboard.

<div align="center">

![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.4-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

---

## 📌 Overview

Vaultify is a production-grade identity and access management backend engineered to handle high-throughput API traffic reliably. It combines **stateless JWT/OAuth2 Bearer authentication**, **BCrypt credential encryption**, and **fine-grained RBAC** to secure every endpoint — all managed through a sleek React admin dashboard.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Docker Compose                          │
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────────────────┐    │
│  │  React Frontend  │      │     Spring Boot API (8080)   │    │
│  │  Vite + Tailwind │      │                              │    │
│  │  nginx (port 80) │─────▶│  ┌──────────────────────┐   │    │
│  │                  │      │  │  Security Filter Chain│   │    │
│  │  • Login Page    │      │  │  OAuth2 Resource      │   │    │
│  │  • Dashboard     │      │  │  Server (JWT Bearer)  │   │    │
│  │  • User Mgmt     │      │  └──────────┬───────────┘   │    │
│  └──────────────────┘      │             │               │    │
│         │                  │  ┌──────────▼───────────┐   │    │
│         │  /api/* proxy    │  │  RBAC Authorization   │   │    │
│         └─────────────────▶│  │  EMPLOYEE / MANAGER   │   │    │
│                             │  │  ADMIN                │   │    │
│                             │  └──────────┬───────────┘   │    │
│                             │             │               │    │
│                             │  ┌──────────▼───────────┐   │    │
│                             │  │  Service + JPA Layer  │   │    │
│                             │  │  Spring Data + BCrypt │   │    │
│                             │  └──────────┬───────────┘   │    │
│                             └─────────────┼───────────────┘    │
│                                           │                     │
│                             ┌─────────────▼───────────┐        │
│                             │     MySQL 8 (3306)       │        │
│                             │  users + user_roles      │        │
│                             └─────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
Client Request
     │
     ▼
[nginx / Vite Dev Server]
     │
     ▼ (Bearer token in Authorization header)
[JwtAuthFilter] ──── invalid/missing ──▶ 401 Unauthorized
     │
     ▼ valid
[OAuth2 Resource Server] — decodes JWT, extracts roles
     │
     ▼
[SecurityFilterChain RBAC]
     ├── GET    /api/users  ──▶ requires ROLE_EMPLOYEE
     ├── POST   /api/users  ──▶ requires ROLE_MANAGER or ROLE_ADMIN
     ├── PUT    /api/users  ──▶ requires ROLE_MANAGER or ROLE_ADMIN
     └── DELETE /api/users  ──▶ requires ROLE_ADMIN
```

---

## ✨ Features

### Backend
| Feature | Details |
|---|---|
| **JWT + OAuth2** | Stateless Bearer tokens via `spring-security-oauth2-resource-server`; roles embedded as JWT claims |
| **BCrypt Encryption** | All passwords hashed with BCrypt before persistence — plaintext never stored |
| **RBAC** | Three-tier role system enforced at the HTTP method level via `SecurityFilterChain` |
| **Global Error Handling** | `@RestControllerAdvice` returns structured JSON errors with HTTP status codes |
| **Input Validation** | `@Valid` on all request bodies with per-field error messages |
| **CORS** | Configured for React dev server and production origins |
| **Stateless Sessions** | `SessionCreationPolicy.STATELESS` — zero server-side session overhead |

### Frontend
| Feature | Details |
|---|---|
| **Login Page** | JWT auth flow with real-time error handling and loading states |
| **Dashboard Home** | Live stats: total users, admin/manager/employee counts, security summary |
| **User Management** | Searchable table with role badges, status indicators, join dates |
| **RBAC-Aware UI** | Edit shown to MANAGERs+, Delete shown to ADMINs only |
| **Create / Edit / Delete** | Modal forms with validation, role multi-select, and confirmation dialog |
| **Auth Context** | Token persisted in localStorage, attached to every request via axios interceptor |
| **Auto Logout** | 401 response from API automatically clears session and redirects to login |

---

## 🗄️ Database Schema

```sql
CREATE TABLE users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  UNIQUE NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,        -- BCrypt hash
    enabled     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  DATETIME     NOT NULL,
    updated_at  DATETIME
);

CREATE TABLE user_roles (
    user_id  BIGINT      NOT NULL REFERENCES users(id),
    role     VARCHAR(50) NOT NULL,             -- e.g. ROLE_ADMIN
    PRIMARY KEY (user_id, role)
);
```

---

## 🔑 API Reference

### Auth — Public

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `POST` | `/api/auth/register` | `{ username, email, password, roles? }` | `201` UserResponse |
| `POST` | `/api/auth/login` | `{ username, password }` | `200` `{ token, tokenType, username, roles }` |

### Users — Secured

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/users` | `EMPLOYEE` | List all users |
| `GET` | `/api/users/{id}` | `EMPLOYEE` | Get user by ID |
| `POST` | `/api/users` | `MANAGER` or `ADMIN` | Create a managed user |
| `PUT` | `/api/users/{id}` | `MANAGER` or `ADMIN` | Update email, password, or roles |
| `DELETE` | `/api/users/{id}` | `ADMIN` | Permanently delete a user |

### Error Responses

All errors return:
```json
{
  "status": 404,
  "message": "User not found with id: 5",
  "timestamp": "2025-01-01T12:00:00"
}
```

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Java 17+ (for local backend dev)
- Node.js 18+ (for local frontend dev)

### Run with Docker (recommended)

```bash
git clone https://github.com/iKatiyar/vaultify.git
cd vaultify
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend (React) | http://localhost |
| Backend API | http://localhost:8080 |
| MySQL | localhost:3306 |

### Run Locally (without Docker)

**Backend:**
```bash
# Make sure MySQL is running on port 3306
# Update src/main/resources/application.properties with your credentials
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173, proxies /api to http://localhost:8080
```

---

## 🔧 Configuration

| Property | Default | Description |
|---|---|---|
| `spring.datasource.url` | `localhost:3306/vaultify_db` | MySQL connection URL |
| `vaultify.jwt.secret` | *(set in env)* | HMAC-SHA256 signing key — min 256 bits |
| `vaultify.jwt.expiration-ms` | `86400000` (24h) | Token lifetime in milliseconds |

For Docker, set these via environment variables in `docker-compose.yml` or a `.env` file:
```env
MYSQL_USER=vaultify
MYSQL_PASSWORD=your_password
JWT_SECRET=your-256-bit-secret-key
JWT_EXPIRATION_MS=86400000
```

---

## 📦 Project Structure

```
vaultify/
├── src/main/java/com/vaultify/
│   ├── config/
│   │   ├── SecurityConfig.java        # OAuth2 Resource Server, RBAC, CORS
│   │   └── PasswordConfig.java        # BCryptPasswordEncoder bean (avoids circular deps)
│   ├── controller/
│   │   ├── AuthController.java        # /api/auth/register + /api/auth/login
│   │   └── UserController.java        # /api/users CRUD
│   ├── dao/
│   │   └── UserRepository.java        # JpaRepository + findByUsername
│   ├── dto/
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   ├── AuthResponse.java          # token + username + roles
│   │   └── UserResponse.java          # safe user projection (no password)
│   ├── entity/
│   │   └── User.java                  # @Entity with @ElementCollection roles
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ResourceNotFoundException.java
│   │   └── ConflictException.java
│   ├── security/
│   │   ├── JwtService.java            # token generation + validation (JJWT)
│   │   └── JwtAuthFilter.java         # OncePerRequestFilter
│   └── service/
│       ├── UserService.java
│       └── UserServiceImpl.java       # implements UserDetailsService
├── frontend/
│   ├── src/
│   │   ├── api/                       # axios instance + auth/users API calls
│   │   ├── context/AuthContext.jsx    # token, user, login, logout, hasRole
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardHome.jsx      # stats overview
│   │   │   └── UsersPage.jsx          # user table + modals
│   │   └── components/
│   │       └── Sidebar.jsx
│   ├── Dockerfile                     # multi-stage: node build → nginx serve
│   └── nginx.conf                     # SPA fallback + /api proxy
├── Dockerfile                         # multi-stage: maven build → JRE run
├── docker-compose.yml                 # mysql + api + frontend
└── src/main/resources/
    ├── application.properties
    └── application-docker.properties
```

---

## 📋 Example Requests

**Register a new admin:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "securepassword",
    "roles": ["ROLE_ADMIN", "ROLE_EMPLOYEE"]
  }'
```

**Login and get a JWT:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "securepassword"}'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiJ9...",
#   "tokenType": "Bearer",
#   "username": "alice",
#   "roles": ["ROLE_ADMIN", "ROLE_EMPLOYEE"]
# }
```

**Access a secured endpoint:**
```bash
curl http://localhost:8080/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Delete a user (ADMIN only):**
```bash
curl -X DELETE http://localhost:8080/api/users/3 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```
