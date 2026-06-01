# Portfolio Backend

A production-ready multi-tenant Portfolio backend platform where users can register, manage their portfolio data, and access their own public APIs dynamically.

---

# 🚀 What is this?

This project is a complete backend infrastructure for a Portfolio platform.

The idea behind this system is:

- Every user can register on the platform
- Every user gets their own portfolio management dashboard
- Users can manage:
  - Projects
  - Certificates
  - Experience
  - Hero Section
  - Skills
  - Portfolio Links
- Every user's data becomes publicly accessible through dynamic APIs
- Frontend portfolio websites can fetch portfolio data dynamically from this backend

This backend acts like a centralized portfolio data engine.

---

# 🌍 Real World Use Case

Suppose:

A user registers with:

```bash
username = premraichura
```

Then the backend automatically provides public APIs like:

```bash
GET /api/public/
```

Frontend portfolio websites can use this API to dynamically fetch and display portfolio data.

This means:

- The portfolio website becomes dynamic
- User updates portfolio data from admin panel
- Public website updates automatically through APIs

---

# 🧠 Main Concept

```text
User Dashboard
↓
Backend Database
↓
Public API Generation
↓
Portfolio Frontend Website
```

---

# ⚡ Features

## Authentication System

- JWT Authentication
- Access Tokens
- Refresh Tokens
- Secure Login System
- Protected Routes

---

## Portfolio Management

Users can manage:

- Hero Section
- Projects
- Certificates
- Experience
- Skills
- Social Links

---

## API Key System

Users can generate API Keys.

Example:

```bash
x-api-key: USER_API_KEY
```

Used for:
- Public portfolio APIs
- External integrations
- Portfolio frontend fetching

---

## Multi-Tenant Architecture

Each user only accesses:
- their own data
- their own logs
- their own analytics

---

## Analytics System

Tracks:
- Portfolio views
- API usage
- Requests count
- Performance metrics

---

## Logging System

Stores:
- Route
- Method
- Request data
- Response data
- Status code
- IP Address
- Response time

Logs are:
- asynchronous
- queue-based
- user-wise isolated

---

## Queue System

Using:
- BullMQ
- Redis

Workers:
- Logs Worker
- Analytics Worker

---

## Cloudinary Uploads

Supports:
- Project Images
- Certificate Images
- Portfolio Assets

---

## Dockerized Infrastructure

Complete Docker support:
- Backend container
- PostgreSQL container
- Redis container

---

## Production Deployment

Successfully deployed on:

- Render
- PostgreSQL Cloud DB
- Redis Cloud

---

# 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Backend Framework |
| PostgreSQL | Database |
| Prisma ORM | ORM |
| Redis | Cache + Queue Backend |
| BullMQ | Queue System |
| JWT | Authentication |
| Cloudinary | Image Uploads |
| Docker | Containerization |
| Render | Deployment |

---

# 📁 Project Structure

```bash
server/
├── prisma/
├── src/
│   ├── config/
│   ├── features/
│   │   ├── analytics/
│   │   ├── apiKeys/
│   │   ├── auth/
│   │   ├── certificates/
│   │   ├── dashboard/
│   │   ├── experience/
│   │   ├── health/
│   │   ├── hero/
│   │   ├── logs/
│   │   ├── projects/
│   │   ├── public/
│   │   ├── tokens/
│   │   └── users/
│   ├── jobs/
│   │   ├── analytics/
│   │   └── logs/
│   ├── shared/
│   │   └── middleware/
│   ├── utils/
│   └── app.js
├── Dockerfile
├── docker-compose.yml
└── package.json
```

Each feature folder owns its route and controller files. Background queue definitions and workers live together in `jobs/`, while reusable HTTP middleware lives in `shared/middleware/`. Shared infrastructure such as database clients, upload config, utilities, and Prisma generated files stays outside `features/`.

---

# 🔐 Authentication Flow

## Login Flow

```text
Login
↓
Generate Access Token
↓
Generate Refresh Token
↓
Frontend stores tokens
```

---

## Access Token

- Short expiry
- Used for API authentication

---

## Refresh Token

- Long expiry
- Generates new access token automatically

---

# 🌐 Public API System

The platform provides dynamic public APIs for every registered user.

Instead of exposing usernames directly in routes, the system uses secure API Keys.

Each registered user receives their own API Key which is used to access their public portfolio data.

---

# 🔑 Public API Authentication

Public APIs use:

```bash
x-api-key
```

inside request headers.

Example:

```bash
x-api-key: USER_API_KEY
```

---

# 📡 Public Portfolio API

## Endpoint

```bash
GET /api/public
```

---

# 📌 Example Request

```javascript
fetch(
  "https://your-api.com/api/public",
  {
    headers: {
      "x-api-key":
        "USER_API_KEY"
    }
  }
)
```

---

# 📌 Example Response

```json
{
  "success": true,
  "user": {
    "name": "Prem Raichura",
    "projects": [],
    "certificates": [],
    "skills": [],
    "hero": {},
    "experience": []
  }
}
```

---

# 👤 How User Data Works

## Step 1 — User Generates API Key

The backend generates a unique API Key for the user.

Example:

```bash
x-api-key: USER_API_KEY
```

This API Key uniquely identifies the portfolio owner.

---

## Step 2 — Public API Access

Frontend portfolio websites call:

```bash
GET /api/public
```

using:

```bash
x-api-key
```

header authentication.

---

# 🌍 Dynamic Portfolio Flow

```text
Portfolio Website
↓
Public API Request
↓
x-api-key Authentication
↓
Backend Fetches User Data
↓
Dynamic Portfolio Rendering
```

---

# 📌 Example Frontend Fetch

```javascript
const response =
  await fetch(
    "https://your-api.com/api/public",
    {
      headers: {
        "x-api-key":
          "USER_API_KEY"
      }
    }
  );

const data =
  await response.json();
```

---

# 🔒 Why API Keys Are Used

Using API Keys provides:

- secure public access
- user identification
- rate limiting
- analytics tracking
- multi-tenant isolation
- scalable API architecture

without exposing internal user authentication tokens.

---

# 📦 Installation

## Clone Repository

```bash
git clone https://github.com/prem-raichura/Portfolio.admin
```

---

## Enter Project

```bash
cd server
```

---

## Install Dependencies

```bash
npm install
```

---

# ⚙️ Environment Variables

Create:

```bash
.env
```

Add:

```env
DATABASE_URL=

REDIS_URL=

JWT_ACCESS_SECRET=

JWT_REFRESH_SECRET=

ACCESS_TOKEN_EXPIRES=15m

REFRESH_TOKEN_EXPIRES=7d

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

PORT=8000
```

---

# 🐳 Docker Setup

## Run Docker Containers

```bash
docker compose up --build
```

---

## Prisma Migration

```bash
npx prisma migrate deploy
```

---

# 🚀 Run Backend

## Development

```bash
npm run dev
```

---

# 📊 API Endpoints

## Auth

```bash
POST /api/auth/register
POST /api/auth/login
POST /api/token/refresh
```

---

## Projects

```bash
GET /api/projects
POST /api/projects
PUT /api/projects/:skug
DELETE /api/projects/:slug
```

---

## Certificates

```bash
GET /api/certificates
POST /api/certificates
PUT /api/certificates/:skug
DELETE /api/certificates/:slug
```

---

## Logs

```bash
GET /api/logs
```

---

## Analytics

```bash
GET /api/analytics
```

---

## Public APIs

```bash
GET /api/public/
Add header x-api-key apikey
```


---

# 🧩 Redis + BullMQ Architecture

```text
Request
↓
Middleware
↓
BullMQ Queue
↓
Worker
↓
Prisma
↓
PostgreSQL
```

---

# 📈 Logging System

Every API request stores:

- route
- method
- request body
- response body
- response time
- IP address
- user info

Logs are processed asynchronously through BullMQ workers.

---

# 🛡️ Security Features

- Helmet
- CORS
- Rate Limiting
- JWT Authentication
- Protected Routes
- User-wise Isolation
- Redis Rate Limiting

---

# 📌 Deployment

Backend deployed successfully on:

- Render
- PostgreSQL Cloud
- Redis Cloud

Public URL:

```bash
https://portfolio-admin-7es8.onrender.com
```

---

# 📌 Future Scope

- React Admin Dashboard
- Dynamic Portfolio Frontend
- Swagger Documentation
- AI Portfolio Generator
- Portfolio Themes
- Real-time Analytics

---

## 🧑‍💻 Developed By

[**Prem Raichura**](https://portfolio-prem-raichura.vercel.app/)
* **GitHub:** [prem-raichura](https://github.com/prem-raichura)
* **LinkedIn:** [prem-raichura](https://www.linkedin.com/in/prem-raichura/)
