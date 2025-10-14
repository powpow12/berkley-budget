export interface BudgetItem {
  id: string;
  org_code: string;
  fund: string;
  object_code: string;
  description: string;
  fy2023_budget: number;
  fy2024_budget: number;
  fy2025_budget: number;
  fy2026_budget: number;
  created_at: string;
  updated_at: string;
}

export interface DepartmentSummary {
  fund: string;
  fy2026_total: number;
  fy2025_total: number;
  change: number;
  changePercent: number;
  itemCount: number;
}

export interface YearComparison {
  year: string;
  amount: number;
}
