import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

beforeAll(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

test('renders the app heading and loads initial state', async () => {
  render(<App />);

  expect(screen.getByText(/Expense Tracker/i)).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText(/No expenses added yet/i)).toBeInTheDocument());
});
