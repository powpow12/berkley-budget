import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { importBudgetData, checkDataExists, getBudgetData } from './utils/importBudgetData';
import { importFlowData, checkFlowDataExists, getFlowData, FlowDataItem } from './utils/importFlowData';
import { BudgetItem, DepartmentSummary } from './types/budget';
import { DashboardStats } from './components/DashboardStats';
import { BudgetChart } from './components/BudgetChart';
import { YearComparisonChart } from './components/YearComparisonChart';
import { DepartmentDetail } from './components/DepartmentDetail';
import { TopBudgetChanges } from './components/TopBudgetChanges';
import { TopLineItems } from './components/TopLineItems';
const BudgetFlowSankey = lazy(() =>
  import('./components/BudgetFlowSankey').then(mod => ({ default: mod.BudgetFlowSankey }))
);
import { Loader2, BarChart3, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortColumn = 'department' | 'fy26' | null;
type SortDirection = 'asc' | 'desc';

function App() {
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [flowData, setFlowData] = useState<FlowDataItem[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'flow'>('overview');
  const [sortColumn, setSortColumn] = useState<SortColumn>('fy26');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    loadData();
  }, []);

  // URL ↔ tab + department syncing
  const slugify = (value: string) =>
    (value || '')
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  function getTabFromPath(pathname: string): 'overview' | 'departments' | 'flow' {
    if (pathname === '/departments' || pathname.startsWith('/departments/')) return 'departments';
    if (pathname === '/flow') return 'flow';
    return 'overview';
  }

  function getPathForTab(tab: 'overview' | 'departments' | 'flow'): string {
    switch (tab) {
      case 'departments':
        return '/departments';
      case 'flow':
        return '/flow';
      default:
        return '/';
    }
  }

  function getDepartmentSlugFromPath(pathname: string): string | null {
    const m = pathname.match(/^\/departments\/([^/]+)$/);
    return m ? m[1] : null;
  }

  function findDepartmentBySlug(slug: string | null): string | null {
    if (!slug) return null;
    const uniqueFunds = Array.from(new Set(budgetItems.map(i => i.fund).filter(Boolean))) as string[];
    const match = uniqueFunds.find(fund => slugify(fund) === slug);
    return match || null;
  }

  function navigateToTab(tab: 'overview' | 'departments' | 'flow') {
    setActiveTab(tab);
    // Ensure department list view shows when navigating to departments tab
    if (tab === 'departments') {
      setSelectedDepartment(null);
    } else {
      setSelectedDepartment(null);
    }
    const path = getPathForTab(tab);
    if (window.location.pathname !== path) {
      window.history.pushState({ tab }, '', path);
    }
  }

  function navigateToDepartment(fund: string) {
    const slug = slugify(fund);
    setActiveTab('departments');
    setSelectedDepartment(fund);
    const path = `/departments/${slug}`;
    if (window.location.pathname !== path) {
      window.history.pushState({ tab: 'departments', fund }, '', path);
    }
  }

  useEffect(() => {
    // initialize from current URL and listen for back/forward
    const path = window.location.pathname;
    setActiveTab(getTabFromPath(path));
    setSelectedDepartment(findDepartmentBySlug(getDepartmentSlugFromPath(path)));
    const onPopState = () => {
      const p = window.location.pathname;
      setActiveTab(getTabFromPath(p));
      setSelectedDepartment(findDepartmentBySlug(getDepartmentSlugFromPath(p)));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // When budgetItems load/update, ensure URL department slug resolves to a proper fund label
  useEffect(() => {
    const slug = getDepartmentSlugFromPath(window.location.pathname);
    if (slug) {
      const resolved = findDepartmentBySlug(slug);
      setSelectedDepartment(resolved);
    }
  }, [budgetItems]);

  async function loadData() {
    setLoading(true);

    // Load budget items
    const hasData = await checkDataExists();
    if (!hasData && import.meta.env.DEV) {
      setImporting(true);
      try {
        await importBudgetData();
      } catch (error) {
        console.error('Failed to import data:', error);
      }
      setImporting(false);
    }

    const data = await getBudgetData();
    if (import.meta.env.DEV) {
      console.log('📊 Loaded budget items:', data.length);
    }
    
    // Sort by fund
    const sortedData = data.sort((a, b) => {
      const fundA = a.fund || '';
      const fundB = b.fund || '';
      return fundA.localeCompare(fundB);
    });
    
    setBudgetItems(sortedData);

    // Load flow data
    const hasFlowData = await checkFlowDataExists();
    if (!hasFlowData && import.meta.env.DEV) {
      try {
        await importFlowData();
      } catch (error) {
        console.error('Failed to import flow data:', error);
      }
    }

    const flowItems = await getFlowData();
    if (import.meta.env.DEV) {
      console.log('💰 Loaded flow items:', flowItems.length);
    }
    setFlowData(flowItems);
    
    setLoading(false);
  }

  // Reload button removed; keep helper here if needed in future

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with default direction
      setSortColumn(column);
      setSortDirection(column === 'department' ? 'asc' : 'desc');
    }
  };

  const getSortedDepartments = () => {
    const sorted = [...departmentSummaries];
    
    if (sortColumn === 'department') {
      sorted.sort((a, b) => {
        const nameA = a.fund || 'Other';
        const nameB = b.fund || 'Other';
        return sortDirection === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    } else if (sortColumn === 'fy26') {
      sorted.sort((a, b) => {
        return sortDirection === 'asc'
          ? a.fy2026_total - b.fy2026_total
          : b.fy2026_total - a.fy2026_total;
      });
    }
    
    return sorted;
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const departmentSummaries: DepartmentSummary[] = useMemo(() => {
    const summaries = budgetItems.reduce((acc, item) => {
      const fund = item.fund || 'Other';
      const existing = acc.find(d => d.fund === fund);

      if (existing) {
        existing.fy2026_total += item.fy2026_budget;
        existing.fy2025_total += item.fy2025_budget;
        existing.itemCount += 1;
      } else {
        acc.push({
          fund,
          fy2026_total: item.fy2026_budget,
          fy2025_total: item.fy2025_budget,
          change: 0,
          changePercent: 0,
          itemCount: 1
        });
      }

      return acc;
    }, [] as DepartmentSummary[]);

    summaries.forEach(dept => {
      dept.change = dept.fy2026_total - dept.fy2025_total;
      dept.changePercent = dept.fy2025_total !== 0
        ? (dept.change / dept.fy2025_total) * 100
        : 0;
    });

    return summaries;
  }, [budgetItems]);

  const totalBudget2026 = useMemo(() => budgetItems.reduce((sum, item) => sum + item.fy2026_budget, 0), [budgetItems]);
  const totalBudget2025 = useMemo(() => budgetItems.reduce((sum, item) => sum + item.fy2025_budget, 0), [budgetItems]);
  const yearOverYearChange = totalBudget2025 !== 0
    ? ((totalBudget2026 - totalBudget2025) / totalBudget2025) * 100
    : 0;

  const uniqueDepartments = useMemo(() => new Set(budgetItems.map(item => item.fund).filter(Boolean)), [budgetItems]);

  // Removed unused `yearComparison` in favor of computing inside charts as needed

  const selectedDepartmentItems = selectedDepartment
    ? budgetItems.filter(item => item.fund === selectedDepartment)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700">
            {importing ? 'Importing budget data...' : 'Loading dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notice Banner */}
        <div className="mb-6">
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-900">
              <span className="font-semibold">Note:</span> This is an experimental tool still in progress. For the official FY2026 budget, see{' '}
              <a
                href="https://berkleymabudget.com/wp-content/uploads/sites/2/2025/05/FY2026-ATM-Presentation-Budget-05.22.25.xlsx"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium text-yellow-900 hover:text-yellow-800"
              >
                the published document
              </a>
              . Questions? Email{' '}
              <a
                href="mailto:selectmen@berkleyma.us"
                className="underline font-medium text-yellow-900 hover:text-yellow-800"
              >
                selectmen@berkleyma.us
              </a>
              .
            </p>
          </div>
        </div>

        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <BarChart3 className="w-10 h-10 text-blue-600" />
                <h1 className="text-4xl font-bold text-gray-900">Community Budget Dashboard</h1>
              </div>
              <p className="text-lg text-gray-600 ml-14">
                Fiscal Year 2026 Budget Overview
              </p>
            </div>
            {/* Reload button removed */}
          </div>
        </header>

        {selectedDepartment ? (
          <DepartmentDetail
            department={selectedDepartment}
            items={selectedDepartmentItems}
            onBack={() => navigateToTab('departments')}
          />
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <a
                  href={getPathForTab('overview')}
                  onClick={(e) => { e.preventDefault(); navigateToTab('overview'); }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'overview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </a>
                <button
                  onClick={() => navigateToTab('departments')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'departments'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Department Summary
                </button>
                <a
                  href={getPathForTab('flow')}
                  onClick={(e) => { e.preventDefault(); navigateToTab('flow'); }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'flow'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Budget Flow
                </a>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'flow' ? (
              <Suspense fallback={<div className="bg-white rounded-lg shadow-md p-6 text-gray-700">Loading flow…</div>}>
                <BudgetFlowSankey data={flowData} />
              </Suspense>
            ) : activeTab === 'overview' ? (
              <>
                <DashboardStats
                  totalBudget={totalBudget2026}
                  yearOverYearChange={yearOverYearChange}
                  departmentCount={uniqueDepartments.size}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <YearComparisonChart budgetItems={budgetItems} />
                  <BudgetChart
                    data={departmentSummaries}
                    onDepartmentClick={navigateToDepartment}
                    onViewAll={() => navigateToTab('departments')}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <TopBudgetChanges data={departmentSummaries} />
                  <TopLineItems data={budgetItems} />
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Department Summary</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th 
                          className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('department')}
                        >
                          <div className="flex items-center gap-2">
                            Department
                            <SortIcon column="department" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('fy26')}
                        >
                          <div className="flex items-center justify-end gap-2">
                            FY26 Budget
                            <SortIcon column="fy26" />
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                          YoY Change
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getSortedDepartments().map(dept => (
                        <tr
                          key={dept.fund}
                          onClick={() => navigateToDepartment(dept.fund)}
                          title="Click the row to see more details"
                          className="cursor-pointer hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {dept.fund || 'Other'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              minimumFractionDigits: 0
                            }).format(dept.fy2026_total)}
                          </td>
                          <td className={`px-6 py-4 text-sm font-semibold text-right ${
                            dept.changePercent > 0 ? 'text-green-600' : dept.changePercent < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {dept.changePercent > 0 ? '+' : ''}{dept.changePercent.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
