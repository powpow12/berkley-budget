import { ResponsiveSankey } from '@nivo/sankey';
import { FlowDataItem } from '../utils/importFlowData';
import { useMemo, useState } from 'react';

interface BudgetFlowSankeyProps {
  data: FlowDataItem[];
}

export function BudgetFlowSankey({ data }: BudgetFlowSankeyProps) {
  const [selectedYear, setSelectedYear] = useState<'fy2025' | 'fy2026'>('fy2026');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  };

  // Prepare Sankey data - LEFT: Revenue sources → CENTER: Budget → RIGHT: Expenses/Backcharges
  const sankeyData = useMemo(() => {
    const result = {
      nodes: [] as Array<{ id: string; color?: string }>,
      links: [] as Array<{ source: string; target: string; value: number }>
    };

    const nodeSet = new Set<string>();
    result.nodes.push({ id: 'Total Budget', color: '#3b82f6' });
    nodeSet.add('Total Budget');

    data.forEach(item => {
      const value = selectedYear === 'fy2026' ? item.fy2026 : item.fy2025;
      if (value > 0) {
        if (item.classification === 'REVENUE') {
          const revenueId = item.description;
          if (!nodeSet.has(revenueId)) {
            nodeSet.add(revenueId);
            result.nodes.push({ id: revenueId, color: '#10b981' });
          }
          result.links.push({ source: revenueId, target: 'Total Budget', value });
        } else {
          const expenseId = item.description;
          if (!nodeSet.has(expenseId)) {
            nodeSet.add(expenseId);
            result.nodes.push({ id: expenseId, color: item.classification === 'EXPENSES' ? '#ef4444' : '#f59e0b' });
          }
          result.links.push({ source: 'Total Budget', target: expenseId, value });
        }
      }
    });

    return result;
  }, [data, selectedYear]);

  const totalRevenue = useMemo(() => data
    .filter(item => item.classification === 'REVENUE')
    .reduce((sum, item) => sum + (selectedYear === 'fy2026' ? item.fy2026 : item.fy2025), 0), [data, selectedYear]);

  const totalExpenses = useMemo(() => data
    .filter(item => item.classification === 'EXPENSES')
    .reduce((sum, item) => sum + (selectedYear === 'fy2026' ? item.fy2026 : item.fy2025), 0), [data, selectedYear]);

  const totalBackcharges = useMemo(() => data
    .filter(item => item.classification === 'BACKCHARGES')
    .reduce((sum, item) => sum + (selectedYear === 'fy2026' ? item.fy2026 : item.fy2025), 0), [data, selectedYear]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Flow Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">Revenue sources and expense allocations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedYear('fy2025')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedYear === 'fy2025'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            FY 2025
          </button>
          <button
            onClick={() => setSelectedYear('fy2026')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedYear === 'fy2026'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            FY 2026
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
          <p className="text-sm font-medium text-green-700">Total Revenue</p>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
          <p className="text-sm font-medium text-red-700">Total Expenses</p>
          <p className="text-2xl font-bold text-red-900">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
          <p className="text-sm font-medium text-amber-700">Backcharges</p>
          <p className="text-2xl font-bold text-amber-900">{formatCurrency(totalBackcharges)}</p>
        </div>
      </div>

      {/* Sankey Diagram */}
      <div style={{ height: '700px' }} className="relative">
        <ResponsiveSankey
          data={sankeyData}
          margin={{ top: 20, right: 200, bottom: 20, left: 200 }}
          align="justify"
          colors={{ datum: 'color' }}
          nodeOpacity={1}
          nodeHoverOpacity={1}
          nodeThickness={20}
          nodeSpacing={12}
          nodeBorderWidth={0}
          nodeBorderRadius={4}
          linkOpacity={0.4}
          linkHoverOpacity={0.7}
          linkContract={4}
          enableLinkGradient={true}
          labelPosition="outside"
          labelOrientation="horizontal"
          labelPadding={12}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.5]] }}
          label={(node) => (node.id === 'Total Budget' ? '' : node.id)}
          nodeTooltip={({ node }) => (
            <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
              <div className="font-semibold text-gray-900">
                {node.id}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formatCurrency(node.value)}
              </div>
            </div>
          )}
          linkTooltip={({ link }) => (
            <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
              <div className="text-base font-semibold text-gray-900">
                {formatCurrency(link.value || 0)}
              </div>
            </div>
          )}
        />
        {/* Prominent centered value for the Total Budget */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">Total Budget</div>
            <div className="text-3xl md:text-4xl font-extrabold text-blue-900">{formatCurrency(totalRevenue)}</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Budget Flow</p>
        <div className="flex gap-8 items-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-sm text-gray-700 font-medium">Revenue Sources (Left)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <span className="text-sm text-gray-700 font-medium">Budget Pool (Center)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-sm text-gray-700 font-medium">Expenses (Right)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500" />
            <span className="text-sm text-gray-700 font-medium">Backcharges (Right)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

