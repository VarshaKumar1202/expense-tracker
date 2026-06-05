import type { ComponentType, CSSProperties } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Home,
  Music,
  ShoppingCart,
  Sandwich,
  Tag,
  Zap,
  Car,
  Pencil,
  Trash2,
  Download,
  X,
} from "lucide-react";

export {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Home,
  Music,
  ShoppingCart,
  Sandwich,
  Tag,
  Zap,
  Car,
  Pencil,
  Trash2,
  Download,
  X,
};

export const CATEGORY_COLORS: Record<string, string> = {
  Food: "#4f6ef7",
  Transport: "#f59e0b",
  Bills: "#7c9ef5",
  Entertainment: "#a78bfa",
  Housing: "#22c55e",
  Shopping: "#ef4444",
  Other: "#94a3b8",
};

export const CATEGORY_ICONS: Record<string, ComponentType<{ size?: number; style?: CSSProperties }>> = {
  Food: Sandwich,
  Transport: Car,
  Bills: Home,
  Entertainment: Music,
  Housing: ShoppingCart,
  Shopping: ShoppingCart,
  Other: Tag,
};
