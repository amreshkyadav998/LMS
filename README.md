# LoanFlow — Loan Management System

A full-stack lending platform where **borrowers** apply for personal loans through a guided multi-step portal, and **internal teams** move each loan through its lifecycle — *Applied → Sanctioned → Disbursed → Closed* — from a role-based operations dashboard.

| Layer    | Stack                                                       |
| -------- | ----------------------------------------------------------- |
| Frontend | Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · SWR |
| Backend  | Node.js · Express 5 · TypeScript · Zod                       |
| Database | MongoDB · Mongoose                                           |
| Auth     | JWT (httpOnly cookie) · bcrypt                               |

---

## Contents

- [Quick start](#quick-start)
- [Demo credentials](#demo-credentials)
- [Features](#features)
- [Architecture](#architecture)
- [Data model](#data-model)
- [Loan lifecycle](#loan-lifecycle)
- [Business rules & loan math](#business-rules--loan-math)
- [Role-based access control](#role-based-access-control)
- [API reference](#api-reference)
- [Project structure](#project-structure)

---

## Quick start

**Prerequisites:** Node.js 20+ and a MongoDB database. MongoDB Atlas works as is; a local MongoDB must run as a replica set, because payments are recorded in a transaction.

```bash
git clone https://github.com/amreshkyadav998/LMS.git
cd LMS
```

### 1. Backend (API on http://localhost:5000)

```bash
cd backend
cp .env.example .env        # then fill in MONGODB_URI and JWT_SECRET
npm install
npm run seed                # creates one account per role (see below)
npm run dev
```

### 2. Frontend (app on http://localhost:3000)

```bash
cd frontend
cp .env.example .env.local  # API_URL defaults to http://localhost:5000
npm install
npm run dev
```

Open **http://localhost:3000**.

### Environment variables

| File                   | Variable          | Description                                         |
| ---------------------- | ----------------- | --------------------------------------------------- |
| `backend/.env`         | `MONGODB_URI`     | MongoDB connection string                           |
|                        | `MONGODB_DB_NAME` | Database name (default `lms`)                       |
|                        | `JWT_SECRET`      | Secret used to sign tokens (at least 32 characters) |
|                        | `JWT_EXPIRES_IN`  | Token lifetime (default `1d`)                       |
|                        | `CLIENT_URL`      | Frontend origin for CORS (default `http://localhost:3000`) |
|                        | `UPLOAD_DIR`      | Folder where salary slips are stored (default `uploads`) |
| `frontend/.env.local`  | `API_URL`         | Base URL of the Express API                         |

### Scripts

| Location   | Command             | Purpose                              |
| ---------- | ------------------- | ------------------------------------ |
| `backend`  | `npm run dev`       | Start the API with hot reload        |
|            | `npm run build && npm start` | Compile and run in production |
|            | `npm run seed`      | Create or reset the role accounts     |
|            | `npm run typecheck` | Type-check the API                    |
| `frontend` | `npm run dev`       | Start Next.js in development          |
|            | `npm run build && npm start` | Production build             |
|            | `npm run lint`      | ESLint                                |

---

## Demo credentials

`npm run seed` creates (or resets) these accounts. They are also listed under **Demo accounts** on the login page, where one click fills in the form.

| Role         | Email                  | Password       | Lands on                  |
| ------------ | ---------------------- | -------------- | ------------------------- |
| Admin        | `admin@lms.dev`        | `Admin@123`    | Overview (all modules)    |
| Sales        | `sales@lms.dev`        | `Sales@123`    | Sales                     |
| Sanction     | `sanction@lms.dev`     | `Sanction@123` | Sanction                  |
| Disbursement | `disbursement@lms.dev` | `Disburse@123` | Disbursement              |
| Collection   | `collection@lms.dev`   | `Collect@123`  | Collection                |
| Borrower     | `borrower@lms.dev`     | `Borrower@123` | Borrower portal           |

New borrowers can also sign up from the landing page. Public sign-up always creates a **borrower**; staff accounts come only from the seed script.

---

## Features

### Borrower portal

1. **Sign up / log in.** Passwords are hashed with bcrypt (12 rounds). Every other page is protected.
2. **Personal details and eligibility check.** The form collects full name, PAN, date of birth, monthly salary and employment mode. It shows hints as you type (current age, PAN format), and the server-side BRE makes the final decision. If the applicant is ineligible, every failed rule is listed.
3. **Salary slip upload.** Drag and drop or browse. Only PDF, JPG or PNG files up to 5 MB are accepted, checked both in the browser and on the server.
4. **Loan configuration.** Sliders set the amount (₹50K–₹5L) and tenure (30–365 days). A live panel shows interest and total repayment as you move them. **Apply** creates the loan in `APPLIED` status.
5. **Loan tracker.** Shows a status timeline, the loan terms, repayment progress once disbursed, and the history of past and rejected loans along with rejection reasons.

### Operations dashboard

| Module           | Shows                                                         | Actions                                          |
| ---------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| **Overview** (Admin) | Portfolio KPIs (disbursed, collected, outstanding), a pipeline by status, recent activity | — |
| **Sales**        | Leads: borrowers who registered but never applied, with their funnel stage (*Registered → Details submitted → Slip uploaded*) | Filter by stage, search |
| **Sanction**     | The `APPLIED` queue, oldest first, with full applicant details and the salary slip | Approve, or reject with a mandatory reason |
| **Disbursement** | The `SANCTIONED` queue                                          | Mark as disbursed (funds released)               |
| **Collection**   | Active (`DISBURSED`) and closed loans, with repayment progress  | Record payments (UTR, amount, date) and view payment history. A loan **closes automatically** once it is fully repaid |

All lists are paginated on the server and searchable. The UI is responsive, with a sidebar that becomes a drawer on mobile.

---

## Architecture

```
Browser ──► Next.js (localhost:3000)
              │  proxy.ts      → optimistic route guard (role from JWT cookie)
              │  /api/* rewrite → same-origin proxy to the API
              ▼
           Express API (localhost:5000)
              │  authenticate  → verifies JWT, loads the user   (401)
              │  authorize     → checks the role for the module  (403)
              │  validateBody  → Zod schemas                     (400)
              ▼
           Services ──► Mongoose models ──► MongoDB
```

- **Same-origin API.** The frontend calls `/api/*`, and Next.js rewrites those calls to Express. As a result, the JWT lives in an **httpOnly, SameSite=Lax cookie** that JavaScript cannot read (which protects it from XSS), and `proxy.ts` can still see it to redirect users. The API also accepts an `Authorization: Bearer` header, which is convenient for Postman.
- **Thin controllers, fat services.** Routes handle wiring, controllers translate HTTP, and services hold the business logic.
- **Centralised errors.** Services throw a typed `ApiError`. One error handler maps `ApiError`, Zod, Multer, duplicate-key (409) and cast errors to a consistent `{ success: false, message, details? }` response. Successful responses are `{ success: true, data }`.

---

## Data model

```
User 1───1 BorrowerProfile           (latest eligibility-approved details + salary slip)
User 1───* Loan                       (applicant + salary-slip snapshot, terms, status, history)
Loan 1───* Payment                    (UTR unique across all payments)
```

| Collection        | Key fields                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| `users`           | `name`, `email` (unique), `password` (bcrypt hash, `select: false`), `role`                           |
| `borrowerprofiles`| `user` (unique), `fullName`, `pan`, `dateOfBirth`, `monthlySalary`, `employmentMode`, `salarySlip{fileName, originalName, mimeType, size}` |
| `loans`           | `borrower`, `applicant{…snapshot}`, `salarySlip{…}`, `principal`, `tenureDays`, `interestRate`, `simpleInterest`, `totalRepayment`, `amountPaid`, `status`, `rejectionReason`, `statusHistory[{status, changedBy, note, changedAt}]`, `sanctionedAt/rejectedAt/disbursedAt/closedAt` |
| `payments`        | `loan`, `utr` (unique index), `amount`, `paymentDate`, `recordedBy`                                    |

**Design notes**

- A loan **snapshots** the applicant details and salary slip at the moment of applying. Later profile edits never change what was reviewed.
- `outstandingAmount` is a virtual (`totalRepayment − amountPaid`). `amountPaid` is a running total kept in the same transaction as each payment insert, so the balance never needs a recalculation.
- `statusHistory` gives a complete audit trail (who did what, and when). It is rendered as the activity timeline.

---

## Loan lifecycle

```
            ┌──────────► REJECTED            (Sanction / Admin, reason required)
            │
APPLIED ────┴──► SANCTIONED ──► DISBURSED ──► CLOSED
 (Borrower)      (Sanction)    (Disbursement)  (automatic when fully repaid)
```

- Allowed moves live in one table (`LOAN_STATUS_TRANSITIONS`). Who may make each move is enforced by the RBAC of the module that owns it.
- Transitions are **atomic**: the current status is part of the update filter (`findOneAndUpdate({ _id, status: from })`). If two executives act on the same loan at once, the second gets **409 Conflict** instead of a double approval.
- A borrower can hold only **one active loan** (`APPLIED`, `SANCTIONED` or `DISBURSED`) at a time.

---

## Business rules & loan math

### Business Rule Engine (BRE)

An application is rejected if **any** rule fails, and all failed rules are returned together:

| Rule       | Rejected when                         |
| ---------- | ------------------------------------- |
| Age        | Not between 23 and 50 (completed years) |
| Salary     | Below ₹25,000 per month               |
| PAN        | Does not match the PAN format         |
| Employment | Applicant is unemployed               |

**PAN regex:** `^[A-Z]{3}[ABCFGHLJPT][A-Z][0-9]{4}[A-Z]$`. A PAN is 5 letters, 4 digits and 1 letter. The 4th character encodes the holder type (`P` = individual, `C` = company, `H` = HUF, …), so the regex validates that character as well as the general pattern. Example of a valid PAN: `ABCPE1234F`.

**Where does the BRE run? Both, but the server decides.**
The client runs the same rules for instant feedback. The client can be bypassed, though (anyone can call the API directly), so the authoritative check is on the server. It runs when personal details are saved, and **again when the loan is submitted**, because the applicant's age may have crossed a limit in between. The thresholds are defined once per side, in constants.

### Simple interest

```
SI    = (P × R × T) / (365 × 100)     R = 12 (% p.a.), T = tenure in days
Total = P + SI
```

Example: ₹1,00,000 for 365 days → SI ₹12,000 → total ₹1,12,000. Amounts are rounded to paise. The **server computes the quote itself** and ignores any interest or total sent by the client.

### Payment validation (Collection)

- **UTR** must be 12–22 alphanumeric characters (IMPS/NEFT/RTGS formats). It is stored in upper case and must be **unique across all payments**, enforced by a unique index plus a pre-check that returns a clear 409.
- **Amount** must be greater than 0, have at most 2 decimals, and **not exceed the outstanding balance**, so a loan can never be over-collected.
- **Date** cannot be in the future or before the disbursement date.
- Payments can be recorded only for `DISBURSED` loans.
- The payment insert and the balance update run in a **MongoDB transaction**. Concurrent payments on the same loan conflict on the loan document and are retried, so the outstanding-balance check cannot be raced. When `amountPaid` reaches `totalRepayment`, the loan moves to `CLOSED` in the same transaction.

---

## Role-based access control

Roles: `admin`, `sales`, `sanction`, `disbursement`, `collection`, `borrower`. Each user stores a single `role` string. The role is also a claim in the JWT, but the API reloads the user on every request, so a changed role or deleted account takes effect immediately.

| Area            | Admin | Sales | Sanction | Disbursement | Collection | Borrower |
| --------------- | :---: | :---: | :------: | :----------: | :--------: | :------: |
| Overview        | ✅ | | | | | |
| Sales           | ✅ | ✅ | | | | |
| Sanction        | ✅ | | ✅ | | | |
| Disbursement    | ✅ | | | ✅ | | |
| Collection      | ✅ | | | | ✅ | |
| Borrower portal | | | | | | ✅ |

Enforced at **both** layers:

- **Backend (the real guard).** `authenticate` → **401 Unauthorized** when the token is missing, invalid or expired. `authorize(...roles)` / `authorizeModule(role)` → **403 Forbidden** when the user is logged in but lacks the role. Every module router applies these guards to all of its routes.
- **Frontend (user experience).** `proxy.ts` redirects users away from pages they cannot use (for example, a Collection executive opening `/dashboard/sanction` lands back on Collection, and a borrower is kept out of `/dashboard`). The sidebar renders only the permitted modules. If the API ever answers 401, the client sends the user to the login page.

---

## API reference

Base URL: `/api`. Responses are `{ success: true, data }` or `{ success: false, message, details? }`.

| Method | Endpoint                                   | Access              | Description |
| ------ | ------------------------------------------ | ------------------- | ----------- |
| POST   | `/auth/signup`                             | Public              | Register a borrower `{ name, email, password }` → 201 |
| POST   | `/auth/login`                              | Public              | `{ email, password }` → sets the cookie, returns `{ user, token }` |
| POST   | `/auth/logout`                             | Public              | Clears the session cookie |
| GET    | `/auth/me`                                 | Authenticated       | Current user |
| GET    | `/borrower/overview`                       | Borrower            | `{ profile, loans, activeLoan }` |
| PUT    | `/borrower/profile`                        | Borrower            | Personal details + BRE → 200, or **422** `{ details: { failures[] } }` |
| POST   | `/borrower/salary-slip`                    | Borrower            | `multipart/form-data`, field `salarySlip` |
| POST   | `/borrower/loans`                          | Borrower            | `{ principal, tenureDays }` → 201 loan in `APPLIED` |
| GET    | `/loans/:loanId`                           | Staff               | Loan with borrower and history |
| GET    | `/loans/:loanId/salary-slip`               | Staff, owner        | Streams the slip inline |
| GET    | `/sales/leads?page&limit&search&stage`     | Sales, Admin        | Paginated leads + `stageCounts` |
| GET    | `/sanction/loans?page&limit&search`        | Sanction, Admin     | `APPLIED` queue |
| PATCH  | `/sanction/loans/:loanId/approve`          | Sanction, Admin     | `APPLIED → SANCTIONED` |
| PATCH  | `/sanction/loans/:loanId/reject`           | Sanction, Admin     | `{ reason }`, `APPLIED → REJECTED` |
| GET    | `/disbursement/loans?page&limit&search`    | Disbursement, Admin | `SANCTIONED` queue |
| PATCH  | `/disbursement/loans/:loanId/disburse`     | Disbursement, Admin | `SANCTIONED → DISBURSED` |
| GET    | `/collection/loans?status&page&limit&search` | Collection, Admin | `status` = `DISBURSED` (default) or `CLOSED` |
| GET    | `/collection/loans/:loanId/payments`       | Collection, Admin   | Payment history |
| POST   | `/collection/loans/:loanId/payments`       | Collection, Admin   | `{ utr, amount, paymentDate }` → 201 `{ payment, loan }`; auto-closes when fully repaid |
| GET    | `/admin/overview`                          | Admin               | Portfolio KPIs and recent loans |
| GET    | `/health`                                  | Public              | Health check |

**Status codes:** `200/201` success · `400` validation error · `401` not authenticated · `403` wrong role · `404` not found · `409` conflict (duplicate email or UTR, invalid status transition, existing active loan) · `422` business-rule failure (BRE, over-payment) · `500` unexpected error.

---

## Project structure

```
LMS/
├── backend/
│   └── src/
│       ├── config/          # env validation (Zod), MongoDB connection
│       ├── constants/       # roles, loan statuses & transitions, business limits, regexes
│       ├── middleware/      # authenticate/authorize, validation, uploads, error handler
│       ├── models/          # User, BorrowerProfile, Loan, Payment
│       ├── modules/         # feature modules: routes → controller → service (+ schema)
│       │   ├── auth/  borrower/  loans/  sales/  sanction/  disbursement/  collection/  admin/
│       ├── scripts/seed.ts  # one account per role
│       ├── utils/           # ApiError, money (SI math), dates, pagination
│       ├── app.ts           # Express app
│       └── server.ts        # bootstrap & graceful shutdown
└── frontend/
    └── src/
        ├── app/             # routes: landing, (auth), portal, dashboard/{overview,sales,…}
        ├── components/
        │   ├── ui/          # design system: Button, Field, Card, Badge, Modal, Table, …
        │   ├── loan/        # calculator sliders & quote panel, progress tracker
        │   ├── portal/      # borrower overview & 3-step application wizard
        │   └── dashboard/   # shell, data table, loan details, one component per module
        ├── hooks/           # useCurrentUser, usePaginatedList
        ├── lib/             # API client, access rules, constants, formatting, loan math
        ├── types/           # shared domain types
        └── proxy.ts         # route guard
```
