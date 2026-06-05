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
    name: 'Test item',
    category: 'Other',
    amount: 12.5,
    date: '2026-06-05',
    note: 'Unit test expense',
  };

  const response = await request(app).post('/api/expenses').send(newExpense);

  expect(response.statusCode).toBe(201);
  expect(response.body).toMatchObject(newExpense);
  expect(response.body.id).toBeDefined();

  const listResponse = await request(app).get('/api/expenses');
  expect(listResponse.body).toHaveLength(1);
});

test('PUT /api/expenses/:id updates an expense', async () => {
  const createResponse = await request(app).post('/api/expenses').send({
    name: 'Initial item',
    category: 'Food',
    amount: 10,
    date: '2026-06-05',
  });

  const expenseId = createResponse.body.id;
  const updateResponse = await request(app)
    .put(`/api/expenses/${expenseId}`)
    .send({
      name: 'Updated item',
      category: 'Food',
      amount: 15,
      date: '2026-06-06',
    });

  expect(updateResponse.statusCode).toBe(200);
  expect(updateResponse.body.name).toBe('Updated item');
  expect(updateResponse.body.amount).toBe(15);
});

test('DELETE /api/expenses/:id removes an expense', async () => {
  const createResponse = await request(app).post('/api/expenses').send({
    name: 'To remove',
    category: 'Bills',
    amount: 5,
    date: '2026-06-05',
  });

  const expenseId = createResponse.body.id;
  const deleteResponse = await request(app).delete(`/api/expenses/${expenseId}`);

  expect(deleteResponse.statusCode).toBe(200);
  expect(deleteResponse.body.id).toBe(expenseId);

  const listResponse = await request(app).get('/api/expenses');
  expect(listResponse.body).toHaveLength(0);
});

test('POST /api/expenses returns 400 for invalid payload', async () => {
  const response = await request(app).post('/api/expenses').send({
    name: '',
    category: '',
    amount: 'not-a-number',
    date: 'invalid-date',
  });

  expect(response.statusCode).toBe(400);
  expect(response.body.error).toBeDefined();
});
