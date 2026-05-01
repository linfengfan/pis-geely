import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化 Y 轴数值 (Financial Charts)
export function formatYAxis(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`
  if (value >= 1e8) return `${(value / 1e8).toFixed(1)}亿`
  if (value >= 1e4) return `${(value / 1e4).toFixed(1)}万`
  return value.toFixed(0)
}
