import { DepartmentSummary } from '../types/budget';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TopBudgetChangesProps {
  data: DepartmentSummary[];
}

export function TopBudgetChanges({ data }: TopBudgetChangesProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get top 3 increases and top 3 decreases
  const sorted = [...data].sort((a, b) => b.change - a.change);
  const topIncreases = sorted.slice(0, 3).filter(d => d.change > 0);
  const topDecreases = sorted.slice(-3).reverse().filter(d => d.change < 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Biggest Budget Changes (FY25 → FY26)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Increases */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-gray-700">Top Increases</h3>
          </div>
          <div className="space-y-3">
            {topIncreases.length > 0 ? (
              topIncreases.map((dept, i) => (
                <div key={dept.fund} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {dept.fund || 'Other'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatCurrency(dept.change)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      +{dept.changePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No increases</p>
            )}
          </div>
        </div>

        {/* Top Decreases */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-gray-700">Top Decreases</h3>
          </div>
          <div className="space-y-3">
            {topDecreases.length > 0 ? (
              topDecreases.map((dept, i) => (
                <div key={dept.fund} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {dept.fund || 'Other'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatCurrency(dept.change)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {dept.changePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No decreases</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

