const express = require('express');
const cors = require('cors');
const expensesRouter = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 4000;

// Configure CORS using an environment variable `FRONTEND_URL` (set this to your Vercel URL).
// In production set FRONTEND_URL=https://your-frontend-project.vercel.app
// During development, if FRONTEND_URL is not set, allow all origins.
if (process.env.FRONTEND_URL) {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    })
  );
  console.log('CORS enabled for:', process.env.FRONTEND_URL);
} else {
  app.use(cors());
  console.log('CORS enabled for all origins (development)');
}

app.use(express.json());
app.use('/api/expenses', expensesRouter);

// Root route: provide a friendly message and link to the API
app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API', endpoints: ['/api/expenses', '/health'] });
});

// Health check for Render or other platforms
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Expense tracker API is running on http://localhost:${PORT}`);
});
