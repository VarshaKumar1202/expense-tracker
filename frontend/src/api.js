const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export async function fetchExpenses() {
  const response = await fetch(`${API_BASE}/expenses`);

  if (!response.ok) {
    throw new Error('Unable to fetch expenses');
  }

  return response.json();
}

export async function addExpense(expense) {
  const response = await fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    throw new Error('Unable to create expense');
  }

  return response.json();
}

export async function removeExpense(id) {
  const response = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Unable to delete expense');
  }

  return response.json();
}
