import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import type { Expense } from "../api";

export const CATEGORIES = ["Food", "Transport", "Bills", "Entertainment", "Housing", "Shopping", "Other"] as const;

interface FormValues {
  name: string;
  amount: string;
  category: string;
  date: string;
  note: string;
}

interface Props {
  expense: Expense | null;
  onSave: (data: Omit<Expense, "id">) => void;
  onClose: () => void;
}

export function ExpenseModal({ expense, onSave, onClose }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    reset({
      name: expense?.name ?? "",
      amount: expense ? String(expense.amount) : "",
      category: expense?.category ?? "",
      date: expense?.date ?? today,
      note: expense?.note ?? "",
    });
  }, [expense, reset, today]);

  const onSubmit = (data: FormValues) => {
    onSave({
      name: data.name.trim(),
      amount: parseFloat(data.amount),
      category: data.category,
      date: data.date,
      note: data.note.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-foreground">{expense ? "Edit Expense" : "Add Expense"}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Description */}
          <div>
            <label
              style={{ fontSize: "0.82rem" }}
              className="block text-muted-foreground mb-1.5"
            >
              Description
            </label>
            <input
              {...register("name", { required: "Description is required" })}
              placeholder="e.g. Coffee at Starbucks"
              className="w-full bg-input-background rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/40 border-0"
              style={{ fontSize: "0.9rem" }}
            />
            {errors.name && (
              <p className="text-destructive mt-1" style={{ fontSize: "0.75rem" }}>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label
              style={{ fontSize: "0.82rem" }}
              className="block text-muted-foreground mb-1.5"
            >
              Amount
            </label>
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                style={{ fontSize: "0.9rem" }}
              >
                $
              </span>
              <input
                {...register("amount", {
                  required: "Amount is required",
                  validate: (v) => {
                    const n = parseFloat(v);
                    if (isNaN(n)) return "Enter a valid number";
                    if (n <= 0) return "Amount must be greater than 0";
                    return true;
                  },
                })}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="w-full bg-input-background rounded-xl px-4 py-2.5 pl-8 focus:outline-none focus:ring-2 focus:ring-accent/40 border-0"
                style={{ fontSize: "0.9rem" }}
              />
            </div>
            {errors.amount && (
              <p className="text-destructive mt-1" style={{ fontSize: "0.75rem" }}>
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label
              style={{ fontSize: "0.82rem" }}
              className="block text-muted-foreground mb-1.5"
            >
              Category
            </label>
            <select
              {...register("category", { required: "Category is required" })}
              className="w-full bg-input-background rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/40 border-0"
              style={{ fontSize: "0.9rem" }}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-destructive mt-1" style={{ fontSize: "0.75rem" }}>
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label
              style={{ fontSize: "0.82rem" }}
              className="block text-muted-foreground mb-1.5"
            >
              Date
            </label>
            <input
              {...register("date", {
                required: "Date is required",
                validate: (v) =>
                  v > today ? "Date cannot be in the future" : true,
              })}
              type="date"
              max={today}
              className="w-full bg-input-background rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/40 border-0"
              style={{ fontSize: "0.9rem" }}
            />
            {errors.date && (
              <p className="text-destructive mt-1" style={{ fontSize: "0.75rem" }}>
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label
              style={{ fontSize: "0.82rem" }}
              className="block text-muted-foreground mb-1.5"
            >
              Note {" "}
              <span className="opacity-50">(optional)</span>
            </label>
            <textarea
              {...register("note")}
              placeholder="Any additional details…"
              rows={2}
              className="w-full bg-input-background rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/40 border-0 resize-none"
              style={{ fontSize: "0.9rem" }}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
              style={{ fontSize: "0.88rem" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
              style={{ fontSize: "0.88rem", fontWeight: 500 }}
            >
              {expense ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
