# Deployment Guide — Consider It Done

This project is a full-stack React + tRPC + Drizzle ORM application backed by **Neon (PostgreSQL)**, deployable on **Vercel**.

---

## Environment Variables

Set the following in your Vercel project settings (or in a local `.env` file for development):

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `JWT_SECRET` | Long random string used to sign session tokens | Yes |
| `ADMIN_EMAIL` | Email that automatically receives admin role on signup | Optional |
| `NODE_ENV` | Set to `production` on Vercel | Auto-set |

### Getting your Neon connection string
1. Go to [neon.tech](https://neon.tech) and open your project.
2. Click **Connection Details** and copy the **Connection string** (pooled or direct).
3. It will look like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`

---

## Database Migration

After connecting your Neon database, run the Drizzle migration to create all tables:

```bash
# Install dependencies
pnpm install

# Generate and push schema to Neon
pnpm drizzle-kit push
```

This will create the following tables: `users`, `employees`, `tasks`, `timeLogs`, `shifts`.

---

## Deploying to Vercel

1. Push this repository to GitHub (or fork it).
2. Go to [vercel.com](https://vercel.com) and click **New Project**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add `DATABASE_URL`, `JWT_SECRET`, and optionally `ADMIN_EMAIL`.
5. Click **Deploy**.

Vercel will automatically use the `vercel.json` configuration:
- The frontend is built with Vite and served from `client/dist`.
- All `/api/*` requests are routed to the Express server in `api/index.ts`.

---

## First Admin Account

The **first user to sign up** automatically receives the `admin` role.

Alternatively, set `ADMIN_EMAIL=your@email.com` in your environment variables — any account registered with that email will be granted admin access.

---

## Authentication Flow

This project uses **simple email/password authentication** with JWT cookies:

1. User registers at `/login` (sign up tab) with email, password, and optional name.
2. A JWT is issued and stored in an `httpOnly` cookie.
3. On subsequent requests, the cookie is verified server-side.
4. Admins are redirected to `/admin`; employees are redirected to `/dashboard`.

---

## Role System

| Role | Access |
|---|---|
| `admin` | Full access: Admin Panel, Analytics, Task Management |
| `employee` | Dashboard, own tasks, time tracker (requires an employee record) |
| `user` | No dashboard access until promoted to employee by admin |

To promote a user to employee, add them via the Admin Panel using their email address.

