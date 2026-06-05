function ExpenseList({ expenses, onRequestDelete }) {
  if (!expenses.length) {
    return <p className="status-message">No expenses added yet.</p>;
  }

  return (
    <div className="expense-list">
      {expenses.map((expense) => (
        <article className="expense-card" key={expense.id}>
          <div>
            <div className="chip">{expense.date}</div>
            <h2>{expense.description}</h2>
          </div>
          <div className="expense-details">
            <span className="expense-value">${expense.amount.toFixed(2)}</span>
            <button className="danger-button" onClick={() => onRequestDelete(expense)}>
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default ExpenseList;
