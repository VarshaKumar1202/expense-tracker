export interface Expense {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  note?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

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
