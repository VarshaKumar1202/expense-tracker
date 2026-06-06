const express = require('express');
const cors = require('cors');
const expensesRouter = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 4000;

// Parse comma-separated string targets cleanly
const rawFrontendUrls = process.env.FRONTEND_URL || '';
const frontendOrigins = rawFrontendUrls
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

function normalizeOrigin(value) {
  return value.replace(/\/+$|\s+/g, '');
}

function originMatchesPattern(origin, pattern) {
  const normalizedPattern = normalizeOrigin(pattern);
  if (normalizedPattern === '*') return true;

  if (normalizedPattern.includes('*')) {
    const escaped = normalizedPattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    const regexString = `^${escaped.replace(/\\\*/g, '.*')}$`;
    return new RegExp(regexString).test(origin);
  }

  return normalizeOrigin(origin) === normalizedPattern;
}

// Robust CORS initialization block
app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server or postman REST queries seamlessly
      if (!origin) return callback(null, true);

      const normalizedOrigin = normalizeOrigin(origin);
      
      // If FRONTEND_URL environment configuration is explicitly empty, permit access for dev
      if (frontendOrigins.length === 0) return callback(null, true);

      const allowed = frontendOrigins.some((pattern) => originMatchesPattern(normalizedOrigin, pattern));
      if (allowed) return callback(null, true);

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

console.log(
  frontendOrigins.length > 0 
    ? `CORS structured origins: ${frontendOrigins.join(', ')}` 
    : 'CORS permissive default initialization operational.'
);

app.use(express.json());
app.use('/expenses', expensesRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API', endpoints: ['/api/expenses', '/health'] });
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