import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { BudgetItem } from '../types/budget';

interface DepartmentDetailProps {
  department: string;
  items: BudgetItem[];
  onBack: () => void;
}

export function DepartmentDetail({ department, items, onBack }: DepartmentDetailProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const total2026 = items.reduce((sum, item) => sum + item.fy2026_budget, 0);
  const total2025 = items.reduce((sum, item) => sum + item.fy2025_budget, 0);
  const change = total2026 - total2025;
  const changePercent = total2025 !== 0 ? (change / total2025) * 100 : 0;

  const sortedItems = [...items].sort((a, b) => b.fy2026_budget - a.fy2026_budget);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Departments
        </button>
        <h2 className="text-3xl font-bold text-gray-900">{department}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600 mb-2">FY26 Total</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(total2026)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400">
          <p className="text-sm font-medium text-gray-600 mb-2">FY25 Total</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(total2025)}</p>
        </div>

        <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${change >= 0 ? 'border-green-600' : 'border-red-600'}`}>
          <p className="text-sm font-medium text-gray-600 mb-2">Year-over-Year Change</p>
          <div className="flex items-center gap-2">
            {change >= 0 ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
            <p className={`text-3xl font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                  FY2023
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                  FY2024
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                  FY2025
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                  FY2026
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedItems.map((item) => {
                const itemChange = item.fy2026_budget - item.fy2025_budget;
                const itemChangePercent = item.fy2025_budget !== 0
                  ? (itemChange / item.fy2025_budget) * 100
                  : 0;

                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {item.description}
                      {item.object_code && (
                        <span className="block text-xs text-gray-500 mt-1">
                          Code: {item.object_code}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-right">
                      {formatCurrency(item.fy2023_budget)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-right">
                      {formatCurrency(item.fy2024_budget)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-right">
                      {formatCurrency(item.fy2025_budget)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                      {formatCurrency(item.fy2026_budget)}
                    </td>
                    <td className={`px-6 py-4 text-sm font-semibold text-right ${
                      itemChange > 0 ? 'text-green-600' : itemChange < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {itemChange !== 0 && (itemChange > 0 ? '+' : '')}
                      {itemChangePercent.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 uppercase">
                  Total
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {formatCurrency(items.reduce((sum, item) => sum + item.fy2023_budget, 0))}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {formatCurrency(items.reduce((sum, item) => sum + item.fy2024_budget, 0))}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {formatCurrency(total2025)}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {formatCurrency(total2026)}
                </td>
                <td className={`px-6 py-4 text-sm font-bold text-right ${
                  change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {change !== 0 && (change > 0 ? '+' : '')}
                  {changePercent.toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
