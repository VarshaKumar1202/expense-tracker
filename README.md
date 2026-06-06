# Expense Tracker

## Project Overview

This is a full-stack expense tracking application that helps you manage and visualize your spending habits. The app displays a dashboard with spending summaries, monthly trends, and category breakdowns. You can add new expenses, filter by category, edit or delete entries, and export your data as CSV. Built with modern web technologies, this project demonstrates a complete REST API with persistent storage and a responsive, interactive frontend.

## Live Demo

Currently running locally. Deployment coming soon.

## Tech Stack

**Frontend:**
- **React 18** - Component-based UI with hooks for state management
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first styling for responsive design
- **Lucide React** - Beautiful, lightweight icon library
- **Recharts** - Charting library for expense visualizations
- **React Hook Form** - Efficient form validation and handling

**Backend:**
- **Express** - Lightweight Node.js web framework
- **CORS** - Cross-origin resource sharing for frontend-backend communication
- **Jest** - Testing framework for API routes
- **JSON file storage** - Simple persistence without database setup

**Why These Choices:**
- React + TypeScript provides scalability and fewer runtime errors
- Tailwind CSS makes responsive design straightforward
- Vite offers fast development experience with HMR
- Express keeps the backend lean while handling all CRUD operations
- Jest ensures API reliability with automated tests

## How to Run Locally

Ensure you have Node.js installed. Then:

### Start the Backend

```bash
cd backend
npm install
npm run dev
```

The API server runs on `http://localhost:4000`

### Start the Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite in your browser (typically `http://localhost:5173`). The frontend automatically proxies API requests to the backend.

## API Documentation

### GET /api/expenses
Returns all expenses.
- **Response:** `Expense[]`
```json
[
  {
    "id": "1717593600000",
    "name": "Coffee",
    "category": "Food",
    "date": "2026-06-05",
    "amount": 5.00,
    "note": "Starbucks"
  }
]
```

### POST /api/expenses
Creates a new expense.
- **Request Body:**
```json
{
  "name": "Coffee",
  "category": "Food",
  "date": "2026-06-05",
  "amount": 5.00,
  "note": "Starbucks"
}
```
- **Response:** `201 Created`
```json
{
  "id": "1717593600000",
  "name": "Coffee",
  "category": "Food",
  "date": "2026-06-05",
  "amount": 5.00,
  "note": "Starbucks"
}
```

### PUT /api/expenses/:id
Updates an existing expense.
- **Request Body:** Same as POST
- **Response:** `200 OK` with updated expense object

### DELETE /api/expenses/:id
Deletes an expense.
- **Response:** `200 OK` with deleted expense object

## Project Structure

```
expense-tracker/
├── backend/
│   ├── routes/
│   │   └── expenses.js          # CRUD routes and validation
│   ├── test/
│   │   └── expenses.test.js     # Jest tests (5 passing)
│   ├── data/
│   │   └── expenses.json        # Persistent storage
│   ├── index.js                 # Express server setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── ExpenseTracker.tsx      # Main dashboard
│   │   │   │   ├── ExpenseTable.tsx        # Expense list with filters
│   │   │   │   ├── ExpenseSummary.tsx      # Summary cards & charts
│   │   │   │   ├── ExpenseModal.tsx        # Add/edit form
│   │   │   │   └── icons.tsx               # Shared icon library
│   │   │   ├── api.ts                      # API client
│   │   │   └── App.tsx                     # Root component
│   │   ├── main.tsx                        # React entry point
│   │   └── index.css                       # Global styles
│   ├── index.html
│   ├── vite.config.js                      # Vite configuration
│   ├── tailwind.config.cjs                 # Tailwind setup
│   ├── tsconfig.json                       # TypeScript config
│   └── package.json
│
├── README.md
└── .gitignore
```

## Next Steps

**Not Implemented (Yet):**
- User authentication and accounts
- Budget limits and alerts
- Recurring expenses
- PDF export
- Dark mode toggle
- Mobile app (React Native)

**What I'd Build Next:**
1. **Database integration** - Replace JSON files with PostgreSQL for scalability
2. **User authentication** - Add login/signup with JWT tokens
3. **Budget tracking** - Set category budgets and alert when exceeded
4. **Search & advanced filtering** - Better expense discovery
5. **Recurring expenses** - Auto-generate monthly bills
6. **Charts export** - Save reports as PDF
7. **Mobile responsiveness** - Full mobile app experience
8. **Analytics dashboard** - Spending trends over time

## Testing

### Run Backend Tests
```bash
cd backend
npm test
```
All 5 tests pass: GET list, POST create, PUT update, DELETE remove, and invalid payload validation.

### Run Frontend Build
```bash
cd frontend
npm run build
```
Production-ready build outputs to `dist/` folder.
