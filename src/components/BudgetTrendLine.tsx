import { YearComparison } from '../types/budget';
import { TrendingUp } from 'lucide-react';

interface BudgetTrendLineProps {
  data: YearComparison[];
}

export function BudgetTrendLine({ data }: BudgetTrendLineProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const maxAmount = Math.max(...data.map(d => d.amount));
  const minAmount = Math.min(...data.map(d => d.amount));
  const range = maxAmount - minAmount;

  // Calculate points for the line
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.amount - minAmount) / range) * 80; // 80% of height, leaving 10% padding top/bottom
    return { x, y, ...d };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Calculate overall growth
  const firstYear = data[0];
  const lastYear = data[data.length - 1];
  const totalGrowth = ((lastYear.amount - firstYear.amount) / firstYear.amount) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Budget Growth Trend</h2>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span className={`text-lg font-bold ${totalGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalGrowth >= 0 ? '+' : ''}{totalGrowth.toFixed(1)}% Total
          </span>
        </div>
      </div>

      <div className="relative h-64">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.2"
            />
          ))}

          {/* Area fill */}
          <path
            d={`${pathD} L 100 100 L 0 100 Z`}
            fill="url(#gradient)"
            opacity="0.3"
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="1.5"
              fill="#2563eb"
              className="hover:r-2 transition-all"
            />
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>

        {/* Labels below the chart */}
        <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-2">
          {data.map((d, i) => (
            <div key={i} className="text-center" style={{ width: `${100 / data.length}%` }}>
              <p className="text-xs font-semibold text-gray-700">{d.year}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-4 gap-4">
        {data.map((d, i) => {
          const growth = i > 0 ? ((d.amount - data[i - 1].amount) / data[i - 1].amount) * 100 : 0;
          return (
            <div key={d.year} className="text-center">
              <p className="text-xs text-gray-600 mb-1">{d.year}</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(d.amount)}</p>
              {i > 0 && (
                <p className={`text-xs font-semibold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

