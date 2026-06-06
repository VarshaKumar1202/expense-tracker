export interface Expense {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  note?: string;
}

// Vite exposes env vars prefixed with `VITE_` to the client. Set `VITE_API_BASE` in Vercel
// to your deployed backend URL (for example, https://expense-tracker-api-gmg8.onrender.com).
// Fallback to local dev proxy path `/api` when the env var is not set.
// Accept several common env var names so deployments are tolerant to naming.
// Preferred name: VITE_API_BASE
const DEFAULT_API_BASE = 'https://expense-tracker-api-gmg8.onrender.com';
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? DEFAULT_API_BASE : '/api');

async function checkResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    let message = response.statusText;

    try {
      const body = JSON.parse(text);
      if (body?.error) {
        message = body.error;
      }
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(message);
  }

  return response;
}

export async function fetchExpenses(): Promise<Expense[]> {
  const response = await fetch(`${API_BASE}/expenses`);
  await checkResponse(response);
  return response.json();
}

export async function createExpense(expense: Omit<Expense, "id">): Promise<Expense> {
  const response = await fetch(`${API_BASE}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  await checkResponse(response);
  return response.json();
}

export async function updateExpense(expense: Expense): Promise<Expense> {
  const response = await fetch(`${API_BASE}/expenses/${expense.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  await checkResponse(response);
  return response.json();
}

export async function deleteExpense(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/expenses/${id}`, {
    method: "DELETE",
  });
  await checkResponse(response);
}
