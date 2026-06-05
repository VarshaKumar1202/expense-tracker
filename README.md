# Expense Tracker

A simple expense tracker project with a React frontend and Node.js/Express backend.

## Features

- REST API for listing, adding, and deleting expenses
- Persistent JSON storage in the backend
- React hooks and functional components
- Plain CSS styling
- Basic tests for backend and frontend

## Run locally

### Backend

1. Open a terminal in `backend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the API server:
   ```bash
   npm run dev
   ```
4. The backend will be available at `http://localhost:4000`

### Frontend

1. Open a terminal in `frontend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development site:
   ```bash
   npm run dev
   ```
4. Open the URL shown by Vite. It will use the backend at `http://localhost:4000/api`.

## Testing

### Backend tests

```bash
cd backend
npm test
```

### Frontend tests

```bash
cd frontend
npm test
```

## API Endpoints

- `GET /api/expenses` — list expenses
- `POST /api/expenses` — add expense
- `DELETE /api/expenses/:id` — remove expense
