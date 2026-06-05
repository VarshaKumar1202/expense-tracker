const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dataFile = process.env.EXPENSES_FILE || path.join(__dirname, '../data/expenses.json');

function loadExpenses() {
  try {
    if (!fs.existsSync(dataFile)) {
      return [];
    }

    const fileContent = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Failed to load expenses:', error.message);
    return [];
  }
}

function saveExpenses(expenses) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(expenses, null, 2));
  } catch (error) {
    console.error('Failed to save expenses:', error.message);
    throw error;
  }
}

function validateExpensePayload(payload) {
  const { name, category, date, amount } = payload;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return 'name is required';
  }

  if (!category || typeof category !== 'string' || !category.trim()) {
    return 'category is required';
  }

  if (typeof amount !== 'number' || Number.isNaN(amount) || !Number.isFinite(amount) || amount <= 0) {
    return 'amount must be a valid number greater than 0';
  }

  if (!date || typeof date !== 'string' || Number.isNaN(Date.parse(date))) {
    return 'date is required and must be valid';
  }

  return null;
}

router.get('/', (req, res) => {
  const expenses = loadExpenses();
  res.json(expenses);
});

router.post('/', (req, res) => {
  const validationError = validateExpensePayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { name, category, date, amount, note } = req.body;
  const expenses = loadExpenses();
  const newExpense = {
    id: Date.now().toString(),
    name: name.trim(),
    category: category.trim(),
    date,
    amount,
    note: typeof note === 'string' ? note.trim() : undefined,
  };

  expenses.unshift(newExpense);
  saveExpenses(expenses);

  res.status(201).json(newExpense);
});

router.put('/:id', (req, res) => {
  const validationError = validateExpensePayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { id } = req.params;
  const { name, category, date, amount, note } = req.body;
  const expenses = loadExpenses();
  const index = expenses.findIndex((expense) => expense.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  const updatedExpense = {
    ...expenses[index],
    name: name.trim(),
    category: category.trim(),
    date,
    amount,
    note: typeof note === 'string' ? note.trim() : undefined,
  };

  expenses[index] = updatedExpense;
  saveExpenses(expenses);

  res.json(updatedExpense);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const expenses = loadExpenses();
  const index = expenses.findIndex((expense) => expense.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  const deletedExpense = expenses.splice(index, 1)[0];
  saveExpenses(expenses);

  res.json(deletedExpense);
});

module.exports = router;
