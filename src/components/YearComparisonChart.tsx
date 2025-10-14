import { BudgetItem } from '../types/budget';

interface YearComparisonChartProps {
  budgetItems: BudgetItem[];
}

const DEPARTMENT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray for "Other"
];

export function YearComparisonChart({ budgetItems }: YearComparisonChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount);
  };

  // Calculate department totals by year
  const yearlyData = ['fy2023', 'fy2024', 'fy2025', 'fy2026'].map(yearKey => {
    const deptTotals: { [key: string]: number } = {};
    let total = 0;

    budgetItems.forEach(item => {
      const amount = item[`${yearKey}_budget` as keyof BudgetItem] as number;
      const dept = item.fund || 'Other';
      deptTotals[dept] = (deptTotals[dept] || 0) + amount;
      total += amount;
    });

    return {
      year: yearKey.toUpperCase().replace('FY', 'FY'),
      total,
      departments: deptTotals
    };
  });

  // Get top 5 departments by FY2026 budget
  const topDepts = Object.entries(yearlyData[3].departments)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  const maxAmount = Math.max(...yearlyData.map(d => d.total));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Budget Trend (4-Year Comparison)</h2>
      
      <div className="flex items-end justify-between h-96 gap-6">
        {yearlyData.map((year, index) => {
          const isCurrentYear = year.year === 'FY2026';

          // Calculate segments for stacked bar
          const segments: { dept: string; amount: number; color: string }[] = [];
          let otherTotal = 0;

          topDepts.forEach((dept, i) => {
            const amount = year.departments[dept] || 0;
            segments.push({ dept, amount, color: DEPARTMENT_COLORS[i] });
          });

          // Add "Other" category
          Object.entries(year.departments).forEach(([dept, amount]) => {
            if (!topDepts.includes(dept)) {
              otherTotal += amount;
            }
          });
          if (otherTotal > 0) {
            segments.push({ dept: 'Other', amount: otherTotal, color: DEPARTMENT_COLORS[6] });
          }

          const totalHeight = (year.total / maxAmount) * 100;

          return (
            <div key={year.year} className="flex-1 flex flex-col items-center gap-3">
              <div className="text-center mb-2">
                <div className={`text-xl font-bold ${isCurrentYear ? 'text-blue-600' : 'text-gray-900'}`}>
                  {formatCurrency(year.total)}
                </div>
              </div>
              <div className="relative w-full flex items-end" style={{ height: '320px' }}>
                <div
                  className="w-full rounded-t-lg overflow-hidden shadow-lg transition-all duration-700"
                  style={{
                    height: `${totalHeight}%`,
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Stacked segments */}
                  {segments.map((segment, i) => {
                    const segmentPercent = (segment.amount / year.total) * 100;
                    return (
                      <div
                        key={`${year.year}-${segment.dept}`}
                        className="w-full transition-all duration-500 hover:opacity-80"
                        style={{
                          height: `${segmentPercent}%`,
                          backgroundColor: segment.color
                        }}
                        title={`${segment.dept}: ${formatCurrency(segment.amount)}`}
                      />
                    );
                  })}
                </div>
              </div>
              <div className={`text-lg font-semibold ${isCurrentYear ? 'text-blue-600' : 'text-gray-700'}`}>
                {year.year}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend - moved below */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Department Breakdown</p>
        <div className="grid grid-cols-2 gap-3">
          {topDepts.map((dept, i) => (
            <div key={dept} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded shadow-sm flex-shrink-0" style={{ backgroundColor: DEPARTMENT_COLORS[i] }} />
              <span className="text-sm text-gray-700 font-medium truncate">{dept}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded shadow-sm flex-shrink-0" style={{ backgroundColor: DEPARTMENT_COLORS[6] }} />
            <span className="text-sm text-gray-700 font-medium">Other Departments</span>
          </div>
        </div>
      </div>
    </div>
  );
}
