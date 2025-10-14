import { DepartmentSummary } from '../types/budget';

interface BudgetChartProps {
  data: DepartmentSummary[];
  onDepartmentClick: (fund: string) => void;
  onViewAll?: () => void;
}

export function BudgetChart({ data, onDepartmentClick, onViewAll }: BudgetChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const sortedData = [...data].sort((a, b) => b.fy2026_total - a.fy2026_total);
  const topTen = sortedData.slice(0, 10);
  const maxAmount = Math.max(...topTen.map(d => d.fy2026_total));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Budget by Department - FY26</h2>
        {data.length > 10 && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            View All Departments →
          </button>
        )}
      </div>
      <div className="divide-y divide-gray-100">
        {topTen.map((dept) => {
          const isPositiveChange = dept.change >= 0;

          return (
            <button
              key={dept.fund}
              onClick={() => onDepartmentClick(dept.fund)}
              className="w-full text-left py-3 px-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 group-hover:text-blue-600">
                  {dept.fund || 'Other'}
                </span>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositiveChange ? '+' : ''}{dept.changePercent.toFixed(1)}%
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(dept.fy2026_total)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {data.length > 10 && (
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Showing top 10 of {data.length} departments
          </p>
        </div>
      )}
    </div>
  );
}
