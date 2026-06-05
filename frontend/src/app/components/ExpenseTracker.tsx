import { useEffect, useMemo, useState } from "react";
import { ExpenseModal, CATEGORIES } from "./ExpenseModal";
import { ExpenseSummary, DEFAULT_BUDGETS } from "./ExpenseSummary";
import { ExpenseTable } from "./ExpenseTable";
import { fetchExpenses, createExpense, deleteExpense, updateExpense, Expense } from "../api";

const fmt = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterRange, setFilterRange] = useState<"this-month" | "last-month" | "all" | "custom">("this-month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [budgets, setBudgets] = useState<Record<string, number>>(DEFAULT_BUDGETS);
  const [editingBudgets, setEditingBudgets] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchExpenses();
        setExpenses(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load expenses";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const today = new Date();
  const currentMonthKey = toMonthKey(today);
  const lastMonthKey = toMonthKey(new Date(today.getFullYear(), today.getMonth() - 1, 1));

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) => filterCategory === "all" || expense.category === filterCategory)
      .filter((expense) => {
        if (filterRange === "this-month") return expense.date.startsWith(currentMonthKey);
        if (filterRange === "last-month") return expense.date.startsWith(lastMonthKey);
        if (filterRange === "custom") {
          if (customStart && expense.date < customStart) return false;
          if (customEnd && expense.date > customEnd) return false;
          return true;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, filterCategory, filterRange, customStart, customEnd, currentMonthKey, lastMonthKey]);

  const filteredTotal = useMemo(
    () => filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [filteredExpenses]
  );

  const startBudgetEdit = () => {
    const draft: Record<string, string> = {};
    CATEGORIES.forEach((category) => {
      draft[category] = String(budgets[category] ?? "");
    });
    setBudgetDraft(draft);
    setEditingBudgets(true);
  };

  const saveBudgets = () => {
    const updated: Record<string, number> = { ...budgets };
    Object.entries(budgetDraft).forEach(([category, value]) => {
      const amount = parseFloat(value);
      if (!isNaN(amount) && amount > 0) {
        updated[category] = amount;
      }
    });
    setBudgets(updated);
    setEditingBudgets(false);
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleDeleteExpense = async (id: string) => {
    setError(null);

    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to delete expense";
      setError(message);
    }
  };

  const handleSaveExpense = async (data: Omit<Expense, "id">) => {
    setError(null);
    setLoading(true);

    try {
      if (editingExpense) {
        const updated = await updateExpense({ ...editingExpense, ...data });
        setExpenses((prev) => prev.map((expense) => (expense.id === updated.id ? updated : expense)));
      } else {
        const created = await createExpense(data);
        setExpenses((prev) => [created, ...prev]);
      }
      setShowModal(false);
      setEditingExpense(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save expense";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Date", "Description", "Category", "Amount", "Note"];
    const rows = filteredExpenses.map((expense) => [
      expense.date,
      `"${expense.name}"`,
      expense.category,
      expense.amount.toFixed(2),
      `"${expense.note ?? ""}"`,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `expenses-${currentMonthKey}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <header className="px-8 pt-8 pb-2 max-w-6xl mx-auto">
        <div className="flex items-end justify-between">
          <div>
            <p style={{ fontSize: "0.85rem" }} className="text-muted-foreground mb-0.5">
              Good morning, John Doe 👋
            </p>
            <h1 className="text-foreground">June 2026</h1>
          </div>
          <button
            onClick={handleAddExpense}
            className="flex items-center gap-2 bg-accent text-accent-foreground rounded-xl px-4 py-2.5 hover:opacity-90 transition-opacity"
          >
            Add Expense
          </button>
        </div>
      </header>

      <main className="px-8 pt-5 pb-10 space-y-5 max-w-6xl mx-auto">
        {error && (
          <div className="rounded-2xl border border-destructive bg-destructive/10 px-6 py-4 text-destructive">
            {error}
          </div>
        )}

        <ExpenseSummary
          expenses={expenses}
          budgets={budgets}
          editingBudgets={editingBudgets}
          budgetDraft={budgetDraft}
          onStartEditBudgets={startBudgetEdit}
          onSaveBudgets={saveBudgets}
          onBudgetDraftChange={(category, value) =>
            setBudgetDraft((draft) => ({ ...draft, [category]: value }))
          }
        />

        <ExpenseTable
          filteredExpenses={filteredExpenses}
          filteredTotal={filteredTotal}
          filterCategory={filterCategory}
          filterRange={filterRange}
          customStart={customStart}
          customEnd={customEnd}
          loading={loading}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          onExport={exportCSV}
          setFilterCategory={setFilterCategory}
          setFilterRange={setFilterRange}
          setCustomStart={setCustomStart}
          setCustomEnd={setCustomEnd}
        />
      </main>

      {showModal && (
        <ExpenseModal
          expense={editingExpense}
          onSave={handleSaveExpense}
          onClose={() => {
            setShowModal(false);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
}
