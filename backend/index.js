const express = require('express');
const cors = require('cors');
const expensesRouter = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 4000;

// Configure CORS using an environment variable `FRONTEND_URL`.
// Set one or more allowed frontend origins, comma-separated.
// Example:
// FRONTEND_URL=https://example.com
// FRONTEND_URL=https://example.com,https://preview.example.vercel.app
// FRONTEND_URL=https://*.vercel.app
// You can also set FRONTEND_URL=* to allow all origins.
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
  if (normalizedPattern === '*') {
    return true;
  }

  if (normalizedPattern.includes('*')) {
    const escaped = normalizedPattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    const regexString = `^${escaped.replace(/\\\*/g, '.*')}$`;
    return new RegExp(regexString).test(origin);
  }

  return normalizeOrigin(origin) === normalizedPattern;
}

if (frontendOrigins.length > 0) {
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          return callback(null, true);
        }

        const normalizedOrigin = normalizeOrigin(origin);
        const allowed = frontendOrigins.some((pattern) => originMatchesPattern(normalizedOrigin, pattern));
        if (allowed) {
          return callback(null, true);
        }

        callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    })
  );
  console.log('CORS allowed for:', frontendOrigins.join(', '));
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
