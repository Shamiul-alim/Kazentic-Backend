# Kazentic - Backend API

A NestJS-based backend API with PostgreSQL database and TypeORM.

## **Prerequisites**
- Node.js (v16 or higher)
- PostgreSQL
- pnpm

## **Installation**

**Clone the repository**
```bash
-git clone https://github.com/Shamiul-alim/Event-Buddy-API.git
-cd Event-Buddy-API
```
**Install dependencies**
```bash
pnpm i
```

**Environment Setup**
Create a `.env` file in the root directory and configure your environment variables.

**Database Setup**
Run migrations:
```bash
pnpm migration:run
```

## **Available Scripts**

**Development**
```bash
pnpm start:dev 
pnpm start
```       

**Building**
```bash
pnpm build    
```

**Database Operations**
```bash
pnpm migration:create    
pnpm migration:run  
```

## **Configuration**

**Environment Variables**
```bash
-NODE_ENV=development
-PORT=5000
```
# Database
```bash
-DB_CLIENT=pg
-DB_DATABASE=event_buddy
-DB_USER=postgres
-DB_PASSWORD=your_password
-DB_HOST=localhost
-DB_PORT=5432
```
# JWT
```bash
-JWT_SECRET=your_jwt_secret
-JWT_BEARER_SECRET=your_bearer_secret
-JWT_REFRESH_SECRET=your_refresh_secret
```
## **Development**

**Run Migrations**
```bash
pnpm migration:run
```
**Start Development Server**
```bash
pnpm start:dev
```

**Key Dependencies Used**

-NestJS & Core Libraries: @nestjs/common, @nestjs/core, @nestjs/platform-express, @nestjs/typeorm

-Authentication & Authorization: @nestjs/jwt, argon2

-Database & ORM: typeorm, pg (PostgreSQL), class-transformer, class-validator

-Utilities: lodash, moment, uuid

-File Uploads & Processing: multer, sharp