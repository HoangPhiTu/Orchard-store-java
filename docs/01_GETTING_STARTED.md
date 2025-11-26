# 🚀 Getting Started - Orchard Store

> **Complete setup guide to run the project locally**

---

## 📚 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [Running the Project](#running-the-project)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| **Java** | 21 LTS | [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) |
| **Maven** | 3.9+ | [Maven](https://maven.apache.org/download.cgi) |
| **Node.js** | 20+ | [Node.js](https://nodejs.org/) |
| **PostgreSQL** | 16 | [PostgreSQL](https://www.postgresql.org/download/) or Supabase |
| **Git** | Latest | [Git](https://git-scm.com/) |

### Optional (Recommended)

- **Docker** - For containerized database
- **IntelliJ IDEA** / **VS Code** - IDEs
- **Postman** / **Thunder Client** - API testing
- **pgAdmin** / **DBeaver** - Database management

---

## 🔧 Backend Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/orchard-store.git
cd orchard-store/orchard-store-backend
```

### 2. Configure Database

**Option A: Supabase (Recommended)**

1. Create account at [Supabase](https://supabase.com/)
2. Create new project
3. Get connection string from Settings → Database
4. Copy to `application-dev.yml`

**Option B: Local PostgreSQL**

```bash
# Create database
createdb orchard_store

# Or using psql
psql -U postgres
CREATE DATABASE orchard_store;
```

### 3. Environment Configuration

**File:** `src/main/resources/application-dev.yml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://your-supabase-host:5432/postgres
    username: postgres
    password: your-password
  
  mail:
    username: your-email@gmail.com
    password: your-app-password

jwt:
  secret: your-secret-key-min-256-bits
  access-token-expiry: 900000      # 15 minutes
  refresh-token-expiry: 604800000  # 7 days
```

### 4. Build & Run

```bash
# Build project
mvn clean install

# Run (dev profile)
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Or run JAR
java -jar target/orchard-store-backend-0.0.1-SNAPSHOT.jar
```

**Backend will start on:** `http://localhost:8080`

### 5. Verify Backend

```bash
# Health check
curl http://localhost:8080/actuator/health

# Should return:
# {"status":"UP"}
```

---

## 🎨 Frontend Setup

### 1. Navigate to Frontend

```bash
cd ../orchard-store-dashboad
```

### 2. Install Dependencies

```bash
# Install with npm
npm install

# Or with yarn
yarn install

# Or with pnpm
pnpm install
```

### 3. Environment Configuration

**File:** `.env.local`

```bash
# API URL (Backend)
NEXT_PUBLIC_API_URL=http://localhost:8080

# App URL (Frontend)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

**Create from example:**
```bash
cp env.local.example .env.local
# Then edit .env.local with your values
```

### 4. Run Development Server

```bash
# Start dev server
npm run dev

# Or
yarn dev

# Or
pnpm dev
```

**Frontend will start on:** `http://localhost:3000`

### 5. Verify Frontend

Open browser: `http://localhost:3000`

Should redirect to `/login`

---

## 🗄️ Database Setup

### Using Flyway (Automatic)

**Migrations run automatically on backend startup:**

1. Backend starts
2. Flyway checks migrations in `src/main/resources/db/migration/`
3. Runs pending migrations
4. Creates schema + default data

**Default data created:**
- 5 Roles (SUPER_ADMIN, ADMIN, MANAGER, STAFF, VIEWER)
- 1 Admin user:
  - Email: `admin@orchard.com`
  - Password: `admin123`

### Manual Database Setup (Optional)

**If you want to run migrations manually:**

```bash
# Check migration status
mvn flyway:info

# Run migrations
mvn flyway:migrate

# Clean database (DEV ONLY!)
mvn flyway:clean
```

---

## ⚙️ Environment Variables

### Backend

**Required:**
```yaml
DATABASE_URL=jdbc:postgresql://host:5432/db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
JWT_SECRET=your-secret-key-min-256-bits
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

**Optional:**
```yaml
SERVER_PORT=8080  # Default: 8080
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend

**Required:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Optional:**
```bash
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
```

---

## 🏃 Running the Project

### Development Mode

**Terminal 1 - Backend:**
```bash
cd orchard-store-backend
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd orchard-store-dashboad
npm run dev
```

### Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | admin@orchard.com / admin123 |
| **Backend API** | http://localhost:8080/api | Bearer token required |
| **Actuator** | http://localhost:8080/actuator/health | Public |
| **Database** | via pgAdmin/DBeaver | Your DB credentials |

---

## ✅ Verification Checklist

### Backend

- [ ] ✅ Backend starts without errors
- [ ] ✅ Database connected successfully
- [ ] ✅ Migrations executed
- [ ] ✅ Default roles created (check `SELECT * FROM roles`)
- [ ] ✅ Default admin created (check `SELECT * FROM users`)
- [ ] ✅ Health endpoint accessible: `http://localhost:8080/actuator/health`

### Frontend

- [ ] ✅ Frontend starts without errors
- [ ] ✅ Can access `http://localhost:3000`
- [ ] ✅ Redirects to `/login` when not authenticated
- [ ] ✅ Can login with `admin@orchard.com` / `admin123`
- [ ] ✅ Dashboard loads after login
- [ ] ✅ Can navigate to Users page
- [ ] ✅ Can see user list

### Integration

- [ ] ✅ Login successful (Frontend → Backend)
- [ ] ✅ User list loads (Frontend query → Backend API)
- [ ] ✅ Can create user (test CRUD)
- [ ] ✅ Errors display in Vietnamese
- [ ] ✅ Toast notifications work

---

## 🔧 Troubleshooting

### Backend Issues

**Problem: Database connection failed**
```
Solution:
1. Check DATABASE_URL in application-dev.yml
2. Verify PostgreSQL is running
3. Check username/password
4. Check network/firewall
```

**Problem: Flyway migration failed**
```
Solution:
1. Check migration files syntax
2. Run: mvn flyway:repair
3. Check database permissions
4. Try: mvn flyway:clean (DEV ONLY!) then flyway:migrate
```

**Problem: Port 8080 already in use**
```
Solution:
1. Change port in application-dev.yml: server.port=8081
2. Update frontend .env.local: NEXT_PUBLIC_API_URL=http://localhost:8081
```

### Frontend Issues

**Problem: Can't connect to backend**
```
Solution:
1. Check NEXT_PUBLIC_API_URL in .env.local
2. Verify backend is running
3. Check CORS settings in backend
4. Check browser console for errors
```

**Problem: Login not working**
```
Solution:
1. Check backend logs
2. Verify default admin exists in database
3. Check JWT_SECRET is configured
4. Check cookies are enabled in browser
```

**Problem: npm install fails**
```
Solution:
1. Delete node_modules and package-lock.json
2. Run: npm cache clean --force
3. Run: npm install
4. Or try: yarn install / pnpm install
```

---

## 📝 Default Credentials

### Admin Account

After initial setup, use these credentials:

```
Email: admin@orchard.com
Password: admin123
```

**⚠️ Important:** Change password after first login in production!

### Default Roles

| Role | Level | Access |
|------|-------|--------|
| SUPER_ADMIN | 10 | Full system access |
| ADMIN | 9 | Manage all modules |
| MANAGER | 7 | Manage products & orders |
| STAFF | 5 | Basic operations |
| VIEWER | 3 | Read-only |

---

## 🎯 Next Steps

After successful setup:

1. **Explore the app:**
   - Login with admin credentials
   - Navigate to Users page
   - Try creating a user
   - View login history

2. **Read documentation:**
   - [Project Roadmap](./02_ROADMAP.md)
   - [Backend Architecture](./backend/ARCHITECTURE.md)
   - [Frontend Structure](./frontend/STRUCTURE.md)

3. **Start developing:**
   - Follow [Coding Rules](./frontend/CODING_RULES.md)
   - Use [Error Handling Guide](./guides/error-handling.md)
   - Reference [API Docs](./backend/API_REFERENCE.md)

---

## 🔗 Related Documentation

- [Documentation Index](./00_INDEX.md) - Master index
- [Project Roadmap](./02_ROADMAP.md) - Project phases
- [Coding Standards](./CODING_STANDARDS_QUICK_REF.md) - Quick reference

---

**Last Updated:** December 2024  
**Version:** 0.2.0  
**Maintainer:** Development Team

**Welcome to Orchard Store! 🎉**

