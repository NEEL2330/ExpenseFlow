import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const CATEGORY_COLORS = ['#0051d5', '#009668', '#565e74', '#ba1a1a', '#003ea8', '#4edea3'];

const CATEGORY_ICONS = {
  'Food & Dining': 'restaurant',
  'Transport': 'local_taxi',
  'Shopping': 'shopping_bag',
  'Utilities': 'bolt',
  'Entertainment': 'movie',
  'Other': 'more_horiz',
};

function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || 'receipt_long';
}

const MOCK_DATASETS = {
  year: {
    analytics: {
      total_spent: 45230.50,
      transaction_count: 420,
      by_category: {
        'Food & Dining': 12500,
        'Transport': 6200,
        'Shopping': 15000,
        'Utilities': 4800,
        'Entertainment': 3500,
        'Other': 3230.50
      },
      by_time: [
        { name: 'Jan', amount: 3200 },
        { name: 'Feb', amount: 2800 },
        { name: 'Mar', amount: 3500 },
        { name: 'Apr', amount: 3100 },
        { name: 'May', amount: 4200 },
        { name: 'Jun', amount: 3800 },
        { name: 'Jul', amount: 5100 },
        { name: 'Aug', amount: 4500 },
        { name: 'Sep', amount: 3600 },
        { name: 'Oct', amount: 3900 },
        { name: 'Nov', amount: 4800 },
        { name: 'Dec', amount: 2730.50 },
      ]
    },
    transactions: [
      { id: 1, category: 'Shopping', amount: 1200.00, created_at: '2023-11-24', description: 'MacBook Pro' },
      { id: 2, category: 'Transport', amount: 450.00, created_at: '2023-11-15', description: 'Flight Tickets' },
      { id: 3, category: 'Food & Dining', amount: 120.50, created_at: '2023-11-10', description: 'Anniversary Dinner' },
      { id: 4, category: 'Utilities', amount: 200.00, created_at: '2023-10-05', description: 'Electricity Bill' },
      { id: 5, category: 'Entertainment', amount: 85.00, created_at: '2023-09-20', description: 'Concert Tickets' },
    ]
  },
  month: {
    analytics: {
      total_spent: 3850.25,
      transaction_count: 45,
      by_category: {
        'Food & Dining': 1200,
        'Transport': 450,
        'Shopping': 850,
        'Utilities': 350,
        'Entertainment': 600,
        'Other': 400.25
      },
      by_time: [
        { name: 'Week 1', amount: 850 },
        { name: 'Week 2', amount: 1100 },
        { name: 'Week 3', amount: 750 },
        { name: 'Week 4', amount: 1150.25 },
      ]
    },
    transactions: [
      { id: 1, category: 'Shopping', amount: 250.00, created_at: '2023-10-24', description: 'Clothes' },
      { id: 2, category: 'Food & Dining', amount: 65.50, created_at: '2023-10-22', description: 'Dinner with friends' },
      { id: 3, category: 'Utilities', amount: 120.00, created_at: '2023-10-18', description: 'Internet Bill' },
      { id: 4, category: 'Entertainment', amount: 45.00, created_at: '2023-10-15', description: 'Movie night' },
      { id: 5, category: 'Transport', amount: 35.00, created_at: '2023-10-10', description: 'Uber Rides' },
    ]
  },
  week: {
    analytics: {
      total_spent: 850.50,
      transaction_count: 12,
      by_category: {
        'Food & Dining': 350,
        'Transport': 120,
        'Shopping': 200,
        'Utilities': 0,
        'Entertainment': 180.50,
      },
      by_time: [
        { name: 'Mon', amount: 45 },
        { name: 'Tue', amount: 120 },
        { name: 'Wed', amount: 65 },
        { name: 'Thu', amount: 210 },
        { name: 'Fri', amount: 180.50 },
        { name: 'Sat', amount: 150 },
        { name: 'Sun', amount: 80 },
      ]
    },
    transactions: [
      { id: 1, category: 'Shopping', amount: 120.00, created_at: '2023-10-28', description: 'Groceries' },
      { id: 2, category: 'Entertainment', amount: 85.50, created_at: '2023-10-27', description: 'Game purchase' },
      { id: 3, category: 'Food & Dining', amount: 45.00, created_at: '2023-10-26', description: 'Lunch' },
      { id: 4, category: 'Transport', amount: 25.00, created_at: '2023-10-25', description: 'Train ticket' },
      { id: 5, category: 'Food & Dining', amount: 15.00, created_at: '2023-10-24', description: 'Coffee' },
    ]
  }
};

export default function DashboardPreview() {
  const [viewMode, setViewMode] = useState('year');
  const navigate = useNavigate();

  const data = MOCK_DATASETS[viewMode];
  const analytics = data.analytics;
  const transactions = data.transactions;

  // Derive metrics
  const totalSpent = analytics.total_spent;
  const txnCount = analytics.transaction_count;
  const byCategory = analytics.by_category;

  // Top category
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const topCategoryName = topCategory ? topCategory[0] : 'N/A';
  const topCategoryAmount = topCategory ? topCategory[1] : 0;
  const topCategoryPct = totalSpent > 0 ? Math.round((topCategoryAmount / totalSpent) * 100) : 0;

  // Chart data
  const timeData = analytics.by_time;
  const categoryData = Object.entries(byCategory)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <TopBar title="Dashboard Data Preview" />
      <main className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-background">
        <div className="max-w-7xl mx-auto space-y-gutter">

          {/* Test Controls (Preview Only) */}
          <div className="bg-secondary-fixed/30 border border-secondary p-4 rounded-xl flex items-center justify-between mb-8 shadow-sm">
            <div>
              <h3 className="text-secondary font-bold text-lg mb-1">Test Data Preview Mode</h3>
              <p className="text-body-sm text-on-surface-variant">Switch between different data views to see how the charts and metrics adapt.</p>
            </div>
            <div className="flex gap-2 bg-surface-container-lowest p-1 rounded-lg border border-outline-variant">
              <button 
                onClick={() => setViewMode('year')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'year' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                Yearly Data
              </button>
              <button 
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'month' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                Monthly Data
              </button>
              <button 
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'week' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                Weekly Data
              </button>
            </div>
          </div>

          {/* Action Header */}
          <div className="flex justify-between items-center mb-xl">
            <h2 className="text-headline-md text-on-surface font-semibold md:hidden">Dashboard Overview</h2>
            <div className="hidden md:block"></div>
            <button
              onClick={() => navigate('/add-expense')}
              className="bg-secondary text-on-secondary px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-secondary-container transition-colors shadow-sm"
              style={{ fontSize: '16px' }}
            >
              <span className="material-symbols-outlined">add</span>
              Add Expense
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
            {/* Total Expenses */}
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30 flex flex-col justify-between h-[140px] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-label-caps text-on-surface-variant">Total Expenses</span>
                <div className="p-2 bg-error-container/20 text-error rounded-full">
                  <span className="material-symbols-outlined text-[20px]">trending_up</span>
                </div>
              </div>
              <div>
                <div className="font-data-mono text-[32px] font-bold text-on-surface" style={{ fontSize: '32px', lineHeight: '40px' }}>
                  ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-body-sm text-on-surface-variant mt-1">In this period</div>
              </div>
            </div>

            {/* Current Period Spending */}
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30 flex flex-col justify-between h-[140px] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-label-caps text-on-surface-variant">Current {viewMode === 'year' ? 'Month' : viewMode === 'month' ? 'Week' : 'Day'}</span>
                <div className="p-2 bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant rounded-full">
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                </div>
              </div>
              <div>
                <div className="font-data-mono text-[32px] font-bold text-on-surface" style={{ fontSize: '32px', lineHeight: '40px' }}>
                  ${timeData.length > 0 ? timeData[timeData.length - 1].amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                </div>
                <div className="text-body-sm text-on-surface-variant mt-1">vs previous</div>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30 flex flex-col justify-between h-[140px] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-label-caps text-on-surface-variant">Transactions</span>
                <div className="p-2 bg-primary-fixed-dim/20 text-secondary rounded-full">
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                </div>
              </div>
              <div>
                <div className="font-data-mono text-[32px] font-bold text-on-surface" style={{ fontSize: '32px', lineHeight: '40px' }}>
                  {txnCount}
                </div>
                <div className="text-body-sm text-on-surface-variant mt-1">In this period</div>
              </div>
            </div>

            {/* Top Category */}
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30 flex flex-col justify-between h-[140px] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-label-caps text-on-surface-variant">Top Category</span>
                <div className="p-2 bg-secondary-fixed/50 text-secondary rounded-full">
                  <span className="material-symbols-outlined text-[20px]">{getCategoryIcon(topCategoryName)}</span>
                </div>
              </div>
              <div>
                <div className="text-[24px] font-bold text-on-surface truncate" style={{ fontFamily: 'Inter' }}>
                  {topCategoryName}
                </div>
                <div className="text-body-sm text-on-surface-variant mt-1 font-data-mono">
                  ${topCategoryAmount.toFixed(2)} ({topCategoryPct}%)
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
            {/* Bar Chart: Spending Overview */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[20px] font-semibold text-on-surface" style={{ fontFamily: 'Inter' }}>Spending Overview</h3>
                <div className="relative flex items-center">
                  <select 
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="appearance-none bg-transparent text-on-surface-variant text-body-sm font-medium pr-6 focus:outline-none cursor-pointer hover:text-secondary transition-colors z-10 relative"
                  >
                    <option value="year">This Year</option>
                    <option value="month">This Month</option>
                    <option value="week">This Week</option>
                  </select>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute right-0 pointer-events-none z-0">expand_more</span>
                </div>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c6c6cd33" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#45464d', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#45464d', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(v) => [`$${v.toFixed(2)}`, 'Amount']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #c6c6cd', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'JetBrains Mono' }}
                    />
                    <Bar dataKey="amount" fill="#316bf3" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Category Breakdown */}
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[20px] font-semibold text-on-surface" style={{ fontFamily: 'Inter' }}>Category Breakdown</h3>
                <button className="text-on-surface-variant p-1 rounded-full hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-4">
                <div className="w-[160px] h-[160px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `$${v.toFixed(2)}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'JetBrains Mono' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="w-full space-y-3">
                  {categoryData.slice(0, 3).map((entry, idx) => (
                    <div key={entry.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}></div>
                        <span className="text-body-sm text-on-surface-variant">{entry.name}</span>
                      </div>
                      <span className="font-data-mono text-[13px] font-medium text-on-surface">
                        {totalSpent > 0 ? Math.round((entry.value / totalSpent) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden mb-xl">
            <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="text-[20px] font-semibold text-on-surface" style={{ fontFamily: 'Inter' }}>Recent Activity</h3>
              <button onClick={() => navigate('/transactions')} className="text-body-sm font-medium text-secondary hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-outline-variant/30">
                    <th className="py-3 px-6 text-label-caps text-outline font-medium w-12"></th>
                    <th className="py-3 px-6 text-label-caps text-outline font-medium">Description</th>
                    <th className="py-3 px-6 text-label-caps text-outline font-medium hidden sm:table-cell">Category</th>
                    <th className="py-3 px-6 text-label-caps text-outline font-medium hidden md:table-cell">Date</th>
                    <th className="py-3 px-6 text-label-caps text-outline font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="py-4 px-6 text-center">
                        <div className="w-10 h-10 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary">
                          <span className="material-symbols-outlined text-[20px]">{getCategoryIcon(txn.category)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-body-md font-medium text-on-surface">{txn.description}</div>
                        <div className="text-[12px] text-on-surface-variant sm:hidden">
                          {txn.category || 'Uncategorized'} • {new Date(txn.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6 hidden sm:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-surface-container text-on-surface-variant border border-outline-variant/20">
                          {txn.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-body-sm text-on-surface-variant hidden md:table-cell">
                        {new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6 text-right font-data-mono font-medium text-on-surface">
                        -${txn.amount?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
