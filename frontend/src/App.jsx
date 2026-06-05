import { useEffect, useState } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import { addExpense, fetchExpenses, removeExpense } from './api';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadExpenses() {
      try {
        const data = await fetchExpenses();
        setExpenses(data);
      } catch (err) {
        setError('Failed to load expenses.');
      } finally {
        setLoading(false);
      }
    }

    loadExpenses();
  }, []);

  const handleAddExpense = async (expense) => {
    try {
      const created = await addExpense(expense);
      setExpenses((current) => [created, ...current]);
    } catch (err) {
      setError('Unable to add expense.');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await removeExpense(id);
      setExpenses((current) => current.filter((expense) => expense.id !== id));
    } catch (err) {
      setError('Unable to delete expense.');
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Expense Tracker</h1>
        <p>Track purchases and see your recent expenses.</p>
      </header>

      <ExpenseForm onSave={handleAddExpense} />

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p className="status-message">Loading expenses…</p>
      ) : (
        <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
      )}
    </div>
  );
}

export default App;
