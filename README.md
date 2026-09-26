# Studio Billing — React + Bootstrap

This is a React + Bootstrap frontend conversion of the supplied Studio Billing project.
The existing Node.js + Express + MongoDB backend is included separately.

## Requirements
- Node.js 20+ (Node 22 recommended)
- MongoDB Atlas connection in `backend/.env`

## 1. Backend
Open a terminal in `backend`:

```bash
npm install
node server.js
```

The API runs on:
`http://localhost:5000`

Create `backend/.env` from `.env.example` and put your existing MongoDB URI, JWT secret and Master Activation Key there.
Never put these secrets in the React frontend.

## 2. React frontend
Open another terminal in `frontend`:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

Optional frontend API override:
Create `frontend/.env` with:
`VITE_API_BASE_URL=http://localhost:5000/api`

## Existing backend features preserved
- Register / Login / JWT
- Master Activation Key
- MongoDB customer records
- Customer ownership protection
- Payments
- Receipts / PDF
- Reports

The frontend has been rebuilt with React Router, Bootstrap 5 and Bootstrap Icons.
