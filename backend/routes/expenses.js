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

let expenses = loadExpenses();

router.get('/', (req, res) => {
  res.json(expenses);
});

router.post('/', (req, res) => {
  const { description, amount, date } = req.body;

  if (!description || typeof amount !== 'number' || !date) {
    return res.status(400).json({ error: 'description, amount, and date are required' });
  }

  const newExpense = {
    id: Date.now().toString(),
    description,
    amount,
    date,
  };

  expenses.unshift(newExpense);
  saveExpenses(expenses);

  res.status(201).json(newExpense);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = expenses.findIndex((expense) => expense.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  const deletedExpense = expenses.splice(index, 1)[0];
  saveExpenses(expenses);

  res.json(deletedExpense);
});

module.exports = router;
