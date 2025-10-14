import { DollarSign, TrendingUp, Building2 } from 'lucide-react';

interface DashboardStatsProps {
  totalBudget: number;
  yearOverYearChange: number;
  departmentCount: number;
  lineItemCount?: number;
}

export function DashboardStats(
  { totalBudget, yearOverYearChange, departmentCount }: DashboardStatsProps
) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">FY26 Total Budget</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">YoY Change</p>
            <p className={`text-2xl font-bold ${yearOverYearChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(yearOverYearChange)}
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Departments</p>
            <p className="text-2xl font-bold text-gray-900">{departmentCount}</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-lg">
            <Building2 className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Line Items tile removed */}
    </div>
  );
}
