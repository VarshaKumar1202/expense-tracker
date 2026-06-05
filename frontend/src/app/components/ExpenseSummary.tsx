import type { ComponentType, CSSProperties } from "react";
import type { Expense } from "../api";
import { useMemo } from "react";
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
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Tag,
  Zap,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from "./icons";
import { CATEGORIES } from "./ExpenseModal";

export const DEFAULT_BUDGETS: Record<string, number> = {
  Food: 800,
  Transport: 400,
  Bills: 600,
  Entertainment: 300,
  Housing: 1500,
  Shopping: 500,
  Other: 200,
};

const fmt = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

interface ExpenseSummaryProps {
  expenses: Expense[];
  budgets: Record<string, number>;
  editingBudgets: boolean;
  budgetDraft: Record<string, string>;
  onStartEditBudgets: () => void;
  onSaveBudgets: () => void;
  onBudgetDraftChange: (category: string, value: string) => void;
}

export function ExpenseSummary({
  expenses,
  budgets,
  editingBudgets,
  budgetDraft,
  onStartEditBudgets,
  onSaveBudgets,
  onBudgetDraftChange,
}: ExpenseSummaryProps) {
  const today = new Date();
  const currentMonthKey = toMonthKey(today);
  const lastMonthKey = toMonthKey(new Date(today.getFullYear(), today.getMonth() - 1, 1));

  const thisMonthExpenses = useMemo(
    () => expenses.filter((expense) => expense.date.startsWith(currentMonthKey)),
    [expenses, currentMonthKey]
  );

  const lastMonthExpenses = useMemo(
    () => expenses.filter((expense) => expense.date.startsWith(lastMonthKey)),
    [expenses, lastMonthKey]
  );

  const totalThisMonth = useMemo(
    () => thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [thisMonthExpenses]
  );

  const totalLastMonth = useMemo(
    () => lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [lastMonthExpenses]
  );

  const monthChange = totalLastMonth > 0 ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 : 0;

  const highestExpense = useMemo(
    () =>
      thisMonthExpenses.length
        ? thisMonthExpenses.reduce((max, expense) => (expense.amount > max.amount ? expense : max), thisMonthExpenses[0])
        : null,
    [thisMonthExpenses]
  );

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    thisMonthExpenses.forEach((expense) => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return totals;
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

  return (
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

      <div className="col-span-3 grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-card rounded-2xl p-6 border border-border">
          <div className="mb-6">
            <h2 className="text-foreground">Monthly Spending</h2>
            <p style={{ fontSize: "0.8rem" }} className="text-muted-foreground">
              Last 6 months
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={Array.from({ length: 6 }, (_, index) => {
                const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
                const key = toMonthKey(date);
                const label = date.toLocaleString("default", { month: "short" });
                const total = expenses
                  .filter((expense) => expense.date.startsWith(key))
                  .reduce((sum, expense) => sum + expense.amount, 0);
                return { month: label, total };
              })}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#7a7a8c" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: "#7a7a8c" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 12,
                  fontSize: 13,
                }}
                formatter={(value: number) => [fmt(value), "Spent"]}
              />
              <Area type="monotone" dataKey="total" stroke="#4f6ef7" strokeWidth={2} fill="url(#spendGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-2 bg-card rounded-2xl p-6 border border-border overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-foreground">By Category</h2>
            <button
              onClick={editingBudgets ? onSaveBudgets : onStartEditBudgets}
              className="flex items-center gap-1 text-accent hover:opacity-75 transition-opacity"
              style={{ fontSize: "0.78rem" }}
            >
              {editingBudgets ? (
                <>
                  <Check size={13} /> Save
                </>
              ) : (
                <>
                  <Zap size={13} /> Budgets
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
                  <Pie data={categoryChartData} cx={65} cy={65} innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value">
                    {categoryChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </div>

              <div className="space-y-2.5 mt-1 overflow-y-auto max-h-44">
                {categoryChartData.map((category) => {
                  const budget = budgets[category.name] ?? 0;
                  const pct = budget ? Math.min((category.value / budget) * 100, 100) : 0;
                  const over = budget > 0 && category.value > budget;
                  const Icon = CATEGORY_ICONS[category.name] ?? Tag;

                  return (
                    <div key={category.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <Icon size={16} style={{ color: category.color }} />
                            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: category.color }} />
                            <span style={{ fontSize: "0.78rem" }} className="text-foreground">
                              {category.name}
                            </span>
                          </div>
                        {editingBudgets ? (
                          <div className="flex items-center gap-1">
                            <span style={{ fontSize: "0.72rem" }} className="text-muted-foreground">
                              {fmt(category.value)} /
                            </span>
                            <input
                              value={budgetDraft[category.name] ?? ""}
                              onChange={(event) => onBudgetDraftChange(category.name, event.target.value)}
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
                            {fmt(category.value)}
                            {budget > 0 && ` / ${fmt(budget)}`}
                          </span>
                        )}
                      </div>
                      {budget > 0 && !editingBudgets && (
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: over ? "#e05252" : category.color }}
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
              <Zap size={28} className="opacity-30 mb-2" />
              <p style={{ fontSize: "0.85rem" }}>No expenses this month</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className={`rounded-2xl p-6 border ${highlight ? "bg-accent border-accent" : "bg-card border-border"}`}>
      <p style={{ fontSize: "0.8rem" }} className={highlight ? "text-accent-foreground/70" : "text-muted-foreground"}>
        {label}
      </p>
      <p style={{ fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.2, marginTop: 6 }} className={highlight ? "text-accent-foreground" : "text-foreground"}>
        {value}
      </p>
      {change !== undefined ? (
        <div className="flex items-center gap-1.5 mt-3">
          {changePositive ? (
            <ArrowUpRight size={14} className={highlight ? "text-accent-foreground/80" : "text-green-600"} />
          ) : (
            <ArrowDownRight size={14} className="text-destructive" />
          )}
          <span
            style={{ fontSize: "0.8rem", fontWeight: 500 }}
            className={changePositive ? (highlight ? "text-accent-foreground/80" : "text-green-600") : "text-destructive"}
          >
            {change}
          </span>
          {subText && (
            <span style={{ fontSize: "0.8rem" }} className={highlight ? "text-accent-foreground/60" : "text-muted-foreground"}>
              {subText}
            </span>
          )}
        </div>
      ) : (
        subText && (
          <p style={{ fontSize: "0.8rem" }} className={`mt-2 truncate ${highlight ? "text-accent-foreground/60" : "text-muted-foreground"}`}>
            {subText}
          </p>
        )
      )}
    </div>
  );
}
