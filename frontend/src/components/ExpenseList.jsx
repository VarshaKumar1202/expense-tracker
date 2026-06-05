function ExpenseList({ expenses, onDelete }) {
  if (!expenses.length) {
    return <p className="status-message">No expenses added yet.</p>;
  }

  return (
    <div className="expense-list">
      {expenses.map((expense) => (
        <article className="expense-card" key={expense.id}>
          <div>
            <h2>{expense.description}</h2>
            <p>{expense.date}</p>
          </div>
          <div className="expense-details">
            <span>${expense.amount.toFixed(2)}</span>
            <button className="danger-button" onClick={() => onDelete(expense.id)}>
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default ExpenseList;
