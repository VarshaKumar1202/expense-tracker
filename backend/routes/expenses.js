const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dataFile = process.env.EXPENSES_FILE || path.join(__dirname, '../data/expenses.json');

function loadExpenses() {
  try {
    const fileContent = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    return [];
  }
}

function saveExpenses(expenses) {
  fs.writeFileSync(dataFile, JSON.stringify(expenses, null, 2));
}

router.get('/', (req, res) => {
  const expenses = loadExpenses();
  res.json(expenses);
});

router.post('/', (req, res) => {
  const { name, category, date, amount, note } = req.body;

  if (!name || !category || typeof amount !== 'number' || !date) {
    return res.status(400).json({ error: 'name, category, amount, and date are required' });
  }

  const expenses = loadExpenses();
  const newExpense = {
    id: Date.now().toString(),
    name,
    category,
    date,
    amount,
    note,
  };

  expenses.unshift(newExpense);
  saveExpenses(expenses);

  res.status(201).json(newExpense);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, category, date, amount, note } = req.body;

  if (!name || !category || typeof amount !== 'number' || !date) {
    return res.status(400).json({ error: 'name, category, amount, and date are required' });
  }

  const expenses = loadExpenses();
  const index = expenses.findIndex((expense) => expense.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  const updatedExpense = {
    ...expenses[index],
    name,
    category,
    date,
    amount,
    note,
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
