const express = require('express');
const cors = require('cors');
const expensesRouter = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 4000;

// Simplified CORS setup to prevent header duplication
app.use(cors({
  origin: true, // This automatically reflects the request origin instead of using '*'
  credentials: true
}));

app.use(express.json());

// Mount router directly on /expenses to match your frontend requests
app.use('/expenses', expensesRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API', endpoints: ['/expenses', '/health'] });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Expense tracker API is running on http://localhost:${PORT}`);
});