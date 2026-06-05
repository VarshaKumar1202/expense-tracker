import { useState, useMemo } from "react";
import type { ComponentType, CSSProperties } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  Home,
  ShoppingCart,
  Car,
  Zap,
  Music,
  ShoppingBag,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Settings2,
  TrendingDown,
  Check,
} from "lucide-react";
import { ExpenseModal, CATEGORIES } from "./ExpenseModal";

export interface Expense {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  note?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#4f6ef7",
  Transport: "#f59e0b",
  Bills: "#7c9ef5",
  Entertainment: "#a78bfa",
  Housing: "#22c55e",
  Shopping: "#ef4444",
  Other: "#94a3b8",
};

const CATEGORY_ICONS: Record<string, ComponentType<{ size?: number; style?: CSSProperties }>> = {
  Food: ShoppingCart,
  Transport: Car,
  Bills: Zap,
  Entertainment: Music,
  Housing: Home,
  Shopping: ShoppingBag,
  Other: Tag,
};

const DEFAULT_BUDGETS: Record<string, number> = {
  Food: 800,
  Transport: 400,
  Bills: 600,
  Entertainment: 300,
  Housing: 1500,
  Shopping: 500,
  Other: 200,
};

const initialExpenses: Expense[] = [
  { id: "1", name: "Whole Foods Market", category: "Food", date: "2026-06-05", amount: 124.5 },
  { id: "2", name: "Netflix Subscription", category: "Entertainment", date: "2026-06-05", amount: 15.99 },
  { id: "3", name: "Blue Bottle Coffee", category: "Food", date: "2026-06-04", amount: 8.75 },
  { id: "4", name: "Shell Gas Station", category: "Transport", date: "2026-06-03", amount: 67.2 },
  { id: "5", name: "Amazon Purchase", category: "Shopping", date: "2026-06-02", amount: 89.99, note: "Headphones" },
  { id: "6", name: "Spotify Premium", category: "Entertainment", date: "2026-06-01", amount: 9.99 },
  { id: "7", name: "Uber Ride", category: "Transport", date: "2026-06-01", amount: 22.5 },
  { id: "8", name: "Electricity Bill", category: "Bills", date: "2026-05-28", amount: 145.0 },
  { id: "9", name: "Rent", category: "Housing", date: "2026-05-01", amount: 1450.0 },
  { id: "10", name: "Gym Membership", category: "Entertainment", date: "2026-05-15", amount: 45.0 },
  { id: "11", name: "Internet Bill", category: "Bills", date: "2026-05-10", amount: 65.0 },
  { id: "12", name: "Grocery Run", category: "Food", date: "2026-05-20", amount: 98.3 },
  { id: "13", name: "Bus Pass", category: "Transport", date: "2026-04-30", amount: 55.0 },
  { id: "14", name: "Dinner Out", category: "Food", date: "2026-04-22", amount: 74.0, note: "Birthday dinner" },
  { id: "15", name: "Phone Bill", category: "Bills", date: "2026-04-15", amount: 89.0 },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

let _id = 100;
const genId = () => String(++_id);

function toMonthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterRange, setFilterRange] = useState<"this-month" | "last-month" | "all" | "custom">("this-month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [budgets, setBudgets] = useState<Record<string, number>>(DEFAULT_BUDGETS);
  const [editingBudgets, setEditingBudgets] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState<Record<string, string>>({});

  const today = new Date();
  const currentMonthKey = toMonthKey(today);
  const lastMonthKey = toMonthKey(new Date(today.getFullYear(), today.getMonth() - 1, 1));

  // ── Summary stats (always current month) ──────────────────────────────────
  const thisMonthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(currentMonthKey)),
    [expenses, currentMonthKey]
  );

  const lastMonthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(lastMonthKey)),
    [expenses, lastMonthKey]
  );

  const totalThisMonth = useMemo(
    () => thisMonthExpenses.reduce((s, e) => s + e.amount, 0),
    [thisMonthExpenses]
  );

  const totalLastMonth = useMemo(
    () => lastMonthExpenses.reduce((s, e) => s + e.amount, 0),
    [lastMonthExpenses]
  );

  const monthChange =
    totalLastMonth > 0 ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 : 0;

  const highestExpense = useMemo(
    () =>
      thisMonthExpenses.length
        ? thisMonthExpenses.reduce((max, e) => (e.amount > max.amount ? e : max), thisMonthExpenses[0])
        : null,
    [thisMonthExpenses]
  );

  const categoryTotals = useMemo(() => {
    const t: Record<string, number> = {};
    thisMonthExpenses.forEach((e) => {
      t[e.category] = (t[e.category] || 0) + e.amount;
    });
    return t;
  }, [thisMonthExpenses]);

  const topCategory = useMemo(() => {
    const entries = Object.entries(categoryTotals);
    return entries.length ? entries.sort(([, a], [, b]) => b - a)[0] : null;
  }, [categoryTotals]);

  const categoryChartData = useMemo(
    () =>
      Object.entries(categoryTotals)
        .map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] ?? "#94a3b8" }))
        .sort((a, b) => b.value - a.value),
    [categoryTotals]
  );

  // ── Monthly spending chart (last 6 months) ────────────────────────────────
  const monthlyChartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      const key = toMonthKey(d);
      const label = d.toLocaleString("default", { month: "short" });
      const total = expenses
        .filter((e) => e.date.startsWith(key))
        .reduce((s, e) => s + e.amount, 0);
      return { month: label, total };
    });
  }, [expenses]);

  // ── Filtered expense list ─────────────────────────────────────────────────
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => filterCategory === "all" || e.category === filterCategory)
      .filter((e) => {
        if (filterRange === "this-month") return e.date.startsWith(currentMonthKey);
        if (filterRange === "last-month") return e.date.startsWith(lastMonthKey);
        if (filterRange === "custom") {
          if (customStart && e.date < customStart) return false;
          if (customEnd && e.date > customEnd) return false;
          return true;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, filterCategory, filterRange, customStart, customEnd, currentMonthKey, lastMonthKey]);

  const filteredTotal = useMemo(
    () => filteredExpenses.reduce((s, e) => s + e.amount, 0),
    [filteredExpenses]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAdd = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleDelete = (id: string) =>
    setExpenses((prev) => prev.filter((e) => e.id !== id));

  const handleSave = (data: Omit<Expense, "id">) => {
    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((e) => (e.id === editingExpense.id ? { ...data, id: e.id } : e))
      );
    } else {
      setExpenses((prev) => [...prev, { ...data, id: genId() }]);
    }
    setShowModal(false);
    setEditingExpense(null);
  };

  const exportCSV = () => {
    const headers = ["Date", "Description", "Category", "Amount", "Note"];
    const rows = filteredExpenses.map((e) => [
      e.date,
      `"${e.name}"`,
      e.category,
      e.amount.toFixed(2),
      `"${e.note ?? ""}"`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${currentMonthKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startEditBudgets = () => {
    const draft: Record<string, string> = {};
    CATEGORIES.forEach((c) => {
      draft[c] = String(budgets[c] ?? "");
    });
    setBudgetDraft(draft);
    setEditingBudgets(true);
  };

  const saveBudgets = () => {
    const updated: Record<string, number> = { ...budgets };
    Object.entries(budgetDraft).forEach(([k, v]) => {
      const n = parseFloat(v);
      if (!isNaN(n) && n > 0) updated[k] = n;
    });
    setBudgets(updated);
    setEditingBudgets(false);
  };

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Header */}
      <header className="px-8 pt-8 pb-2 max-w-6xl mx-auto">
        <div className="flex items-end justify-between">
          <div>
            <p style={{ fontSize: "0.85rem" }} className="text-muted-foreground mb-0.5">
              Good morning, Alex 👋
            </p>
            <h1 className="text-foreground">June 2026</h1>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-accent text-accent-foreground rounded-xl px-4 py-2.5 hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>Add Expense</span>
          </button>
        </div>
      </header>

      <main className="px-8 pt-5 pb-10 space-y-5 max-w-6xl mx-auto">
        {/* ── Summary Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <SummaryCard
            label="Total This Month"
            value={fmt(totalThisMonth)}
            change={`${monthChange >= 0 ? "+" : ""}${monthChange.toFixed(1)}%`}
            changePositive={monthChange <= 0}
            subText="vs last month"
            highlight
          />
          <SummaryCard
            label="Highest Expense"
            value={highestExpense ? fmt(highestExpense.amount) : "—"}
            subText={highestExpense ? highestExpense.name : "No expenses yet"}
          />
          <SummaryCard
            label="Top Category"
            value={topCategory ? topCategory[0] : "—"}
            subText={topCategory ? `${fmt(topCategory[1])} spent` : "No data"}
          />
        </div>

        {/* ── Charts Row ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-5 gap-4">
          {/* Monthly Spending Area Chart */}
          <div className="col-span-3 bg-card rounded-2xl p-6 border border-border">
            <div className="mb-6">
              <h2 className="text-foreground">Monthly Spending</h2>
              <p style={{ fontSize: "0.8rem" }} className="text-muted-foreground">
                Last 6 months
              </p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={monthlyChartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#7a7a8c" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#7a7a8c" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                  formatter={(val: number) => [fmt(val), "Spent"]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#4f6ef7"
                  strokeWidth={2}
                  fill="url(#spendGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown + Budgets */}
          <div className="col-span-2 bg-card rounded-2xl p-6 border border-border overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-foreground">By Category</h2>
              <button
                onClick={editingBudgets ? saveBudgets : startEditBudgets}
                className="flex items-center gap-1 text-accent hover:opacity-75 transition-opacity"
                style={{ fontSize: "0.78rem" }}
              >
                {editingBudgets ? (
                  <>
                    <Check size={13} /> Save
                  </>
                ) : (
                  <>
                    <Settings2 size={13} /> Budgets
                  </>
                )}
              </button>
            </div>
            <p style={{ fontSize: "0.8rem" }} className="text-muted-foreground mb-3">
              June spending
            </p>

            {categoryChartData.length > 0 ? (
              <>
                <div className="flex justify-center">
                  <PieChart width={140} height={140}>
                    <Pie
                      data={categoryChartData}
                      cx={65}
                      cy={65}
                      innerRadius={42}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>

                <div className="space-y-2.5 mt-1 overflow-y-auto max-h-44">
                  {categoryChartData.map((c) => {
                    const budget = budgets[c.name] ?? 0;
                    const pct = budget ? Math.min((c.value / budget) * 100, 100) : 0;
                    const over = budget > 0 && c.value > budget;
                    return (
                      <div key={c.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-sm shrink-0"
                              style={{ background: c.color }}
                            />
                            <span style={{ fontSize: "0.78rem" }} className="text-foreground">
                              {c.name}
                            </span>
                          </div>
                          {editingBudgets ? (
                            <div className="flex items-center gap-1">
                              <span style={{ fontSize: "0.72rem" }} className="text-muted-foreground">
                                {fmt(c.value)} /
                              </span>
                              <input
                                value={budgetDraft[c.name] ?? ""}
                                onChange={(e) =>
                                  setBudgetDraft((d) => ({ ...d, [c.name]: e.target.value }))
                                }
                                className="w-14 bg-muted rounded px-1.5 py-0.5 text-right focus:outline-none focus:ring-1 focus:ring-accent/40"
                                style={{ fontSize: "0.75rem" }}
                                type="number"
                                min="0"
                                placeholder="budget"
                              />
                            </div>
                          ) : (
                            <span
                              style={{ fontSize: "0.75rem" }}
                              className={over ? "text-destructive" : "text-muted-foreground"}
                            >
                              {fmt(c.value)}
                              {budget > 0 && ` / ${fmt(budget)}`}
                            </span>
                          )}
                        </div>
                        {budget > 0 && !editingBudgets && (
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                background: over ? "#e05252" : c.color,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <TrendingDown size={28} className="opacity-30 mb-2" />
                <p style={{ fontSize: "0.85rem" }}>No expenses this month</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Expense Manager ───────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2.5 px-6 py-4 border-b border-border">
            <h2 className="text-foreground mr-auto">All Expenses</h2>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-muted border-0 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
              style={{ fontSize: "0.82rem" }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={filterRange}
              onChange={(e) => setFilterRange(e.target.value as typeof filterRange)}
              className="bg-muted border-0 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
              style={{ fontSize: "0.82rem" }}
            >
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Range</option>
            </select>

            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 bg-muted hover:bg-secondary transition-colors rounded-lg px-3 py-1.5"
              style={{ fontSize: "0.82rem" }}
            >
              <Download size={13} />
              Export CSV
            </button>
          </div>

          {/* Custom date range */}
          {filterRange === "custom" && (
            <div className="flex items-center gap-3 px-6 py-3 bg-muted/40 border-b border-border">
              <span style={{ fontSize: "0.82rem" }} className="text-muted-foreground">
                From
              </span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-card border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/30"
                style={{ fontSize: "0.82rem" }}
              />
              <span style={{ fontSize: "0.82rem" }} className="text-muted-foreground">
                to
              </span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-card border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/30"
                style={{ fontSize: "0.82rem" }}
              />
            </div>
          )}

          {/* Expense rows */}
          {filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Tag size={28} className="opacity-30 mb-2" />
              <p style={{ fontSize: "0.9rem" }}>No expenses match your filters</p>
            </div>
          ) : (
            filteredExpenses.map((tx) => {
              const Icon = CATEGORY_ICONS[tx.category] ?? Tag;
              const color = CATEGORY_COLORS[tx.category] ?? "#94a3b8";
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/40 transition-colors border-b border-border last:border-0"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: color + "18" }}
                  >
                    <Icon size={15} style={{ color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        style={{ fontSize: "0.88rem", fontWeight: 500 }}
                        className="text-foreground truncate"
                      >
                        {tx.name}
                      </p>
                      <span
                        className="shrink-0 px-2 py-0.5 rounded-full"
                        style={{ fontSize: "0.68rem", background: color + "18", color }}
                      >
                        {tx.category}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.75rem" }} className="text-muted-foreground">
                      {fmtDate(tx.date)}
                      {tx.note && <> · {tx.note}</>}
                    </p>
                  </div>

                  <p
                    style={{ fontSize: "0.9rem", fontWeight: 500 }}
                    className="text-foreground shrink-0 mr-2"
                  >
                    -{fmt(tx.amount)}
                  </p>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => handleEdit(tx)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <p style={{ fontSize: "0.78rem" }} className="text-muted-foreground">
              {filteredExpenses.length}{" "}
              {filteredExpenses.length === 1 ? "expense" : "expenses"}
            </p>
            <p style={{ fontSize: "0.82rem", fontWeight: 500 }} className="text-foreground">
              Total: {fmt(filteredTotal)}
            </p>
          </div>
        </div>
      </main>

      {showModal && (
        <ExpenseModal
          expense={editingExpense}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
}

// ── SummaryCard ─────────────────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  subText,
  change,
  changePositive,
  highlight,
}: {
  label: string;
  value: string;
  subText?: string;
  change?: string;
  changePositive?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 border ${
        highlight ? "bg-accent border-accent" : "bg-card border-border"
      }`}
    >
      <p
        style={{ fontSize: "0.8rem" }}
        className={highlight ? "text-accent-foreground/70" : "text-muted-foreground"}
      >
        {label}
      </p>
      <p
        style={{ fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.2, marginTop: 6 }}
        className={highlight ? "text-accent-foreground" : "text-foreground"}
      >
        {value}
      </p>
      {change !== undefined ? (
        <div className="flex items-center gap-1.5 mt-3">
          {changePositive ? (
            <ArrowUpRight
              size={14}
              className={highlight ? "text-accent-foreground/80" : "text-green-600"}
            />
          ) : (
            <ArrowDownRight size={14} className="text-destructive" />
          )}
          <span
            style={{ fontSize: "0.8rem", fontWeight: 500 }}
            className={
              changePositive
                ? highlight
                  ? "text-accent-foreground/80"
                  : "text-green-600"
                : "text-destructive"
            }
          >
            {change}
          </span>
          {subText && (
            <span
              style={{ fontSize: "0.8rem" }}
              className={highlight ? "text-accent-foreground/60" : "text-muted-foreground"}
            >
              {subText}
            </span>
          )}
        </div>
      ) : (
        subText && (
          <p
            style={{ fontSize: "0.8rem" }}
            className={`mt-2 truncate ${
              highlight ? "text-accent-foreground/60" : "text-muted-foreground"
            }`}
          >
            {subText}
          </p>
        )
      )}
    </div>
  );
}
