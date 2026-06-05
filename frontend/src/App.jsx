import { useEffect, useState } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ConfirmModal from './components/ConfirmModal';
import { addExpense, fetchExpenses, removeExpense } from './api';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmPending, setConfirmPending] = useState(null);

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
      setError('');
    } catch (err) {
      setError('Unable to add expense.');
    }
  };

  const requestDelete = (expense) => {
    setConfirmPending(expense);
  };

  const handleCancelDelete = () => {
    setConfirmPending(null);
  };

  const handleConfirmDelete = async () => {
    if (!confirmPending) {
      return;
    }

    try {
      await removeExpense(confirmPending.id);
      setExpenses((current) => current.filter((expense) => expense.id !== confirmPending.id));
      setError('');
    } catch (err) {
      setError('Unable to delete expense.');
    } finally {
      setConfirmPending(null);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="badge">NEW</div>
        <h1>Expense Tracker</h1>
        <p>Track purchases, delete with confidence, and pick dates from a custom calendar.</p>
      </header>

      <ExpenseForm onSave={handleAddExpense} />

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="status-panel">Loading expenses…</div>
      ) : (
        <ExpenseList expenses={expenses} onRequestDelete={requestDelete} />
      )}

      <ConfirmModal
        open={Boolean(confirmPending)}
        title="Confirm delete"
        message={
          confirmPending
            ? `Delete “${confirmPending.description}” for $${confirmPending.amount.toFixed(2)}?`
            : ''
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default App;
