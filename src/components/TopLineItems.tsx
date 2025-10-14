import { BudgetItem } from '../types/budget';
import { Receipt } from 'lucide-react';

interface TopLineItemsProps {
  data: BudgetItem[];
}

export function TopLineItems({ data }: TopLineItemsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get top 5 line items by FY26 budget
  const topItems = [...data]
    .filter(item => item.fy2026_budget > 0)
    .sort((a, b) => b.fy2026_budget - a.fy2026_budget)
    .slice(0, 5);

  const maxAmount = topItems[0]?.fy2026_budget || 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Receipt className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Largest Budget Line Items (FY26)</h2>
      </div>

      <div className="space-y-4">
        {topItems.map((item, i) => {
          const widthPercent = (item.fy2026_budget / maxAmount) * 100;
          const change = item.fy2026_budget - item.fy2025_budget;
          const changePercent = item.fy2025_budget !== 0
            ? (change / item.fy2025_budget) * 100
            : 0;

          return (
            <div key={item.id} className="group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-sm font-semibold text-gray-900">
                      {item.description}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 ml-8 mt-0.5">
                    {item.fund} {item.object_code && `• ${item.object_code}`}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4 text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(item.fy2026_budget)}
                  </p>
                  {change !== 0 && (
                    <p className={`text-xs font-semibold ${
                      change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {change > 0 ? '+' : ''}{changePercent.toFixed(1)}% YoY
                    </p>
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden ml-8">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <p className="text-gray-600">
            Top 5 items represent{' '}
            <span className="font-semibold text-gray-900">
              {formatCurrency(topItems.reduce((sum, item) => sum + item.fy2026_budget, 0))}
            </span>
          </p>
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">
              {((topItems.reduce((sum, item) => sum + item.fy2026_budget, 0) / 
                 data.reduce((sum, item) => sum + item.fy2026_budget, 0)) * 100).toFixed(1)}%
            </span>
            {' '}of total budget
          </p>
        </div>
      </div>
    </div>
  );
}

