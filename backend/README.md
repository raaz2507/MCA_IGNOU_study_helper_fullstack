# GyanPath Node.js Backend

The backend uses Node.js 26, Express 5, TypeScript, Prisma and PostgreSQL in a
modular-monolith architecture.

## Run

From the repository root:

```text
npm.cmd install
npm.cmd run prisma:generate
npm.cmd run prisma:migrate
npm.cmd run prisma:seed
npm.cmd run dev
```

Open `http://127.0.0.1:3000`.

Production-style commands:

```text
npm.cmd run build
npm.cmd start
```

## Backend-owned features

- Frontend page and static-asset serving
- Subject and paper catalog APIs
- Question-bank manifest and question APIs
- Bcrypt password hashing
- JWT access and refresh tokens in cookies
- Refresh sessions stored in PostgreSQL
- Role-based authorization
- Student progress, bookmarks and revision persistence
- Banner, lecture and contributor persistence
- Protected Admin/Editor content operations
- Socket.IO and optional Redis/BullMQ foundation
- Validation, rate limiting, security headers, logging and centralized errors

The application uses the locally installed Windows PostgreSQL server through
Prisma. Docker is not used by this project. Configure the connection in
`backend/.env` using `backend/.env.example` as the safe template.
