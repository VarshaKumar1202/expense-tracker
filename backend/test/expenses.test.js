const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');

const testFile = path.join(__dirname, '../data/test-expenses.json');
process.env.EXPENSES_FILE = testFile;

const expensesRouter = require('../routes/expenses');
const app = express();
app.use(express.json());
app.use('/api/expenses', expensesRouter);

beforeEach(() => {
  fs.writeFileSync(testFile, '[]');
});

afterAll(() => {
  try {
    fs.unlinkSync(testFile);
  } catch (error) {
    // ignore cleanup failures
  }
});

test('GET /api/expenses returns an array', async () => {
  const response = await request(app).get('/api/expenses');
  expect(response.statusCode).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});

test('POST /api/expenses creates a new expense', async () => {
  const newExpense = {
    description: 'Test item',
    amount: 12.5,
    date: '2026-06-05',
  };

  const response = await request(app).post('/api/expenses').send(newExpense);

  expect(response.statusCode).toBe(201);
  expect(response.body).toMatchObject(newExpense);
  expect(response.body.id).toBeDefined();

  const listResponse = await request(app).get('/api/expenses');
  expect(listResponse.body).toHaveLength(1);
});
