import type { Expense } from "../api";
import { CATEGORIES } from "./ExpenseModal";
import { CATEGORY_COLORS, CATEGORY_ICONS, Pencil, Tag, Trash2, Download } from "./icons";

interface ExpenseTableProps {
  filteredExpenses: Expense[];
  filteredTotal: number;
  filterCategory: string;
  filterRange: "this-month" | "last-month" | "all" | "custom";
  customStart: string;
  customEnd: string;
  loading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  setFilterCategory: (value: string) => void;
  setFilterRange: (value: "this-month" | "last-month" | "all" | "custom") => void;
  setCustomStart: (value: string) => void;
  setCustomEnd: (value: string) => void;
}

const fmt = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export function ExpenseTable({
  filteredExpenses,
  filteredTotal,
  filterCategory,
  filterRange,
  customStart,
  customEnd,
  loading,
  onEdit,
  onDelete,
  onExport,
  setFilterCategory,
  setFilterRange,
  setCustomStart,
  setCustomEnd,
}: ExpenseTableProps) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center gap-2.5 px-6 py-4 border-b border-border">
        <h2 className="text-foreground mr-auto">All Expenses</h2>

        <select
          value={filterCategory}
          onChange={(event) => setFilterCategory(event.target.value)}
          className="w-full sm:w-auto bg-muted border-0 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
          style={{ fontSize: "0.82rem" }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={filterRange}
          onChange={(event) => setFilterRange(event.target.value as ExpenseTableProps["filterRange"])}
          className="w-full sm:w-auto bg-muted border-0 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
          style={{ fontSize: "0.82rem" }}
        >
          <option value="this-month">This Month</option>
          <option value="last-month">Last Month</option>
          <option value="all">All Time</option>
          <option value="custom">Custom Range</option>
        </select>

        <button
          onClick={onExport}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-muted hover:bg-secondary transition-colors rounded-lg px-3 py-1.5"
          style={{ fontSize: "0.82rem" }}
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {filterRange === "custom" && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center px-6 py-3 bg-muted/40 border-b border-border">
          <span style={{ fontSize: "0.82rem" }} className="text-muted-foreground">
            From
          </span>
          <input
            type="date"
            value={customStart}
            onChange={(event) => setCustomStart(event.target.value)}
            className="w-full sm:w-auto bg-card border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/30"
            style={{ fontSize: "0.82rem" }}
          />
          <span style={{ fontSize: "0.82rem" }} className="text-muted-foreground">
            to
          </span>
          <input
            type="date"
            value={customEnd}
            onChange={(event) => setCustomEnd(event.target.value)}
            className="w-full sm:w-auto bg-card border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/30"
            style={{ fontSize: "0.82rem" }}
          />
        </div>
      )}

      {loading ? (
        <div className="px-6 py-16 text-center text-muted-foreground">Loading expenses...</div>
      ) : filteredExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Tag size={28} className="opacity-30 mb-2" />
          <p style={{ fontSize: "0.9rem" }}>No expenses match your filters</p>
        </div>
      ) : (
        <> 
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/40 transition-colors border-b border-border last:border-0"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: CATEGORY_COLORS[expense.category] ? `${CATEGORY_COLORS[expense.category]}20` : "rgba(79, 110, 247, 0.12)" }}
              >
                {(() => {
                  const CategoryIcon = CATEGORY_ICONS[expense.category] ?? Tag;
                  return <CategoryIcon size={15} style={{ color: CATEGORY_COLORS[expense.category] ?? "#4f6ef7" }} />;
                })()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p style={{ fontSize: "0.88rem", fontWeight: 500 }} className="text-foreground truncate">
                    {expense.name}
                  </p>
                  <span
                    className="shrink-0 px-2 py-0.5 rounded-full"
                    style={{ fontSize: "0.68rem", background: "rgba(79, 110, 247, 0.12)", color: "#4f6ef7" }}
                  >
                    {expense.category}
                  </span>
                </div>
                <p style={{ fontSize: "0.75rem" }} className="text-muted-foreground">
                  {fmtDate(expense.date)}
                  {expense.note && <> · {expense.note}</>}
                </p>
              </div>

              <p style={{ fontSize: "0.9rem", fontWeight: 500 }} className="text-foreground shrink-0 mr-2">
                -{fmt(expense.amount)}
              </p>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => onEdit(expense)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <p style={{ fontSize: "0.78rem" }} className="text-muted-foreground">
              {filteredExpenses.length} {filteredExpenses.length === 1 ? "expense" : "expenses"}
            </p>
            <p style={{ fontSize: "0.82rem", fontWeight: 500 }} className="text-foreground">
              Total: {fmt(filteredTotal)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
