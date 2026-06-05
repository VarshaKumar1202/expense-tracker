import { useState } from 'react';
import DatePicker from './DatePicker';

function ExpenseForm({ onSave }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!description || !amount || !date) {
      return;
    }

    onSave({
      description: description.trim(),
      amount: Number(amount),
      date,
    });

    setDescription('');
    setAmount('');
    setDate('');
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="field-row">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="e.g. Coffee, groceries"
        />
      </div>
      <div className="field-row half-grid">
        <div>
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            step="0.01"
            min="0"
            placeholder="0.00"
          />
        </div>
        <div>
          <label>Date</label>
          <DatePicker selectedDate={date} onDateChange={setDate} />
        </div>
      </div>
      <button type="submit" className="primary-button large-button">
        Add Expense
      </button>
    </form>
  );
}

export default ExpenseForm;
