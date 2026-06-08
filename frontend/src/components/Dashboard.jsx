import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAnalytics, fetchTransactions, fetchTodayAnalytics } from '../api';
import TopBar from './TopBar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const CATEGORY_COLORS = ['#0051d5', '#009668', '#565e74', '#ba1a1a', '#003ea8', '#4edea3'];

const CATEGORY_ICONS = {
  'Food': 'restaurant',
  'Food & Dining': 'restaurant',
  'Transport': 'local_taxi',
  'Transportation': 'local_taxi',
  'Shopping': 'shopping_bag',
  'Utilities': 'bolt',
  'Entertainment': 'movie',
  'Other': 'more_horiz',
  'Uncategorized': 'help',
};

function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || 'receipt_long';
}

const PAYMENT_MODE_ICONS = {
  'Cash': 'payments',
  'Credit': 'credit_card',
  'UPI': 'qr_code_scanner',
};

function getPaymentModeIcon(mode) {
  return PAYMENT_MODE_ICONS[mode] || 'help';
}

let cachedAnalytics = null;
let cachedTodayAnalytics = null;
// NOTE: transactions are NOT cached so the list is always fresh (shows today's expenses)

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(cachedAnalytics);
  const [transactions, setTransactions] = useState([]);
  const [todayAnalytics, setTodayAnalytics] = useState(cachedTodayAnalytics);
  const [loading, setLoading] = useState(!cachedAnalytics);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [a, t, td] = await Promise.all([fetchAnalytics(), fetchTransactions(), fetchTodayAnalytics()]);
        cachedAnalytics = a;
        cachedTodayAnalytics = td;
        setAnalytics(a);
        // Sort newest-first as a client-side safety net
        const sorted = [...t].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setTransactions(sorted);
        setTodayAnalytics(td);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Derive metrics
  const totalSpent = analytics?.total_spent || 0;
  const txnCount = analytics?.transaction_count || 0;
  const byCategory = analytics?.by_category || {};
  const byMonth = analytics?.by_month || {};

  // Top category
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const topCategoryName = topCategory ? topCategory[0] : 'N/A';
  const topCategoryAmount = topCategory ? topCategory[1] : 0;
  const topCategoryPct = totalSpent > 0 ? Math.round((topCategoryAmount / totalSpent) * 100) : 0;

  // Chart data
  const monthData = Object.entries(byMonth)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const categoryData = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const paymentModeData = Object.entries(
    transactions.reduce((acc, txn) => {
      let mode = txn.payment_mode || 'Unknown';
      if (mode === 'Card') mode = 'Credit';
      if (mode === 'Transfer') mode = 'UPI';
      acc[mode] = (acc[mode] || 0) + (txn.amount || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const recentTxns = transactions.slice(0, 5);

  if (loading) {
    return (
      <>
        <TopBar title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-background">
          <div className="flex items-center justify-center h-64">
            <span className="material-symbols-outlined text-secondary animate-spin text-[32px]">progress_activity</span>
          </div>
        </main>
      </>
    );
  }

  // Derive today's metrics
  const todayTotal = todayAnalytics?.total_spent || 0;
  const todayCount = todayAnalytics?.transaction_count || 0;
  const todayByCategory = todayAnalytics?.by_category || {};
  const todayCategoryEntries = Object.entries(todayByCategory).sort((a, b) => b[1] - a[1]);
  const todayTopCategory = todayCategoryEntries[0];

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-background">
        <div className="max-w-7xl mx-auto space-y-gutter">

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
                  ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-body-sm text-on-surface-variant mt-1">All time</div>
              </div>
            </div>

            {/* Monthly Spending */}
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30 flex flex-col justify-between h-[140px] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-label-caps text-on-surface-variant">Monthly Spending</span>
                <div className="p-2 bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant rounded-full">
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                </div>
              </div>
              <div>
                <div className="font-data-mono text-[32px] font-bold text-on-surface" style={{ fontSize: '32px', lineHeight: '40px' }}>
                  ₹{monthData.length > 0 ? monthData[monthData.length - 1].amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                </div>
                <div className="text-body-sm text-on-surface-variant mt-1">Current month</div>
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
                  {transactions.filter(txn => {
                    const d = new Date(txn.created_at);
                    const now = new Date();
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  }).length}
                </div>
                <div className="text-body-sm text-on-surface-variant mt-1">This month</div>
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
                  ₹{topCategoryAmount.toFixed(2)} ({topCategoryPct}%)
                </div>
              </div>
            </div>
          </div>

          {/* ───── Today's Spending Analysis ───── */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-lg pt-lg pb-md flex items-center justify-between border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[20px]">today</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-on-surface" style={{ fontFamily: 'Inter' }}>
                    Today's Spending Analysis
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              {/* Today total pill */}
              <div className="flex items-center gap-2 bg-secondary/8 border border-secondary/20 px-4 py-2 rounded-full">
                <span className="material-symbols-outlined text-secondary text-[18px]">payments</span>
                <span className="font-data-mono font-bold text-secondary text-[18px]">
                  ₹{todayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-body-sm text-on-surface-variant ml-1">
                  · {todayCount} {todayCount === 1 ? 'transaction' : 'transactions'}
                </span>
              </div>
            </div>

            {/* Body */}
            {todayCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] opacity-30">receipt_long</span>
                <p className="text-body-md font-medium">No expenses recorded today</p>
                <button
                  onClick={() => navigate('/add-expense')}
                  className="mt-1 text-body-sm text-secondary font-semibold flex items-center gap-1 hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  Add your first expense today
                </button>
              </div>
            ) : (
              <div className="p-lg grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {/* Left – Category mini breakdown */}
                <div>
                  <p className="text-label-caps text-on-surface-variant mb-3">BY CATEGORY TODAY</p>
                  <div className="space-y-2">
                    {todayCategoryEntries.map(([cat, amt], idx) => {
                      const pct = todayTotal > 0 ? Math.round((amt / todayTotal) * 100) : 0;
                      return (
                        <div key={cat} className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}18`, color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                          >
                            <span className="material-symbols-outlined text-[16px]">{getCategoryIcon(cat)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-body-sm font-medium text-on-surface truncate">{cat}</span>
                              <span className="font-data-mono text-[13px] text-on-surface ml-2 flex-shrink-0">
                                ₹{amt.toFixed(2)}
                              </span>
                            </div>
                            <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                              />
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-on-surface-variant w-8 text-right flex-shrink-0">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right – Stats */}
                <div className="grid grid-cols-2 gap-3 content-start">
                  <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/20 flex flex-col gap-1">
                    <span className="text-label-caps text-on-surface-variant">Today's Total</span>
                    <span className="font-data-mono font-bold text-on-surface text-[22px]">
                      ₹{todayTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/20 flex flex-col gap-1">
                    <span className="text-label-caps text-on-surface-variant">Transactions</span>
                    <span className="font-data-mono font-bold text-on-surface text-[22px]">{todayCount}</span>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/20 flex flex-col gap-1">
                    <span className="text-label-caps text-on-surface-variant">Avg per Txn</span>
                    <span className="font-data-mono font-bold text-on-surface text-[22px]">
                      ₹{todayCount > 0 ? (todayTotal / todayCount).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/20 flex flex-col gap-1">
                    <span className="text-label-caps text-on-surface-variant">Top Category</span>
                    <span className="font-semibold text-on-surface text-[15px] truncate">
                      {todayTopCategory ? todayTopCategory[0] : '—'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
            {/* Bar Chart: Spending Overview */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[20px] font-semibold text-on-surface" style={{ fontFamily: 'Inter' }}>Spending Overview</h3>
                <div className="relative flex items-center">
                  <select className="appearance-none bg-transparent text-on-surface-variant text-body-sm font-medium pr-6 focus:outline-none cursor-pointer hover:text-secondary transition-colors z-10 relative">
                    <option value="all">All Time</option>
                    <option value="year">This Year</option>
                    <option value="month">This Month</option>
                    <option value="week">This Week</option>
                  </select>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute right-0 pointer-events-none z-0">expand_more</span>
                </div>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c6c6cd33" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#45464d', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#45464d', fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      formatter={(v) => [`₹${v.toFixed(2)}`, 'Amount']}
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
                      <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'JetBrains Mono' }} />
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

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-md mb-xl">
            {/* Recent Activity Table */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
              <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center">
                <h3 className="text-[20px] font-semibold text-on-surface" style={{ fontFamily: 'Inter' }}>Recent Activity</h3>
                <button onClick={() => navigate('/transactions')} className="text-body-sm font-medium text-secondary hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto flex-1">
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
                    {recentTxns.map((txn) => (
                      <tr key={txn.id} className="hover:bg-surface-container-low/50 transition-colors group">
                        <td className="py-4 px-6 text-center">
                          <div className="w-10 h-10 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary">
                            <span className="material-symbols-outlined text-[20px]">{getCategoryIcon(txn.category)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-body-md font-medium text-on-surface">{txn.category || 'Expense'}</div>
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
                          -₹{txn.amount?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {recentTxns.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                          No transactions yet. Add your first expense!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Mode Usage */}
            <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-lg flex flex-col">
              <h3 className="text-[20px] font-semibold text-on-surface mb-6" style={{ fontFamily: 'Inter' }}>Payment Modes</h3>
              <div className="flex-1 flex flex-col gap-3 justify-center">
                {paymentModeData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-on-surface-variant text-body-sm">
                    No data available
                  </div>
                ) : (
                  paymentModeData.map((mode, idx) => {
                    const pct = totalSpent > 0 ? Math.round((mode.value / totalSpent) * 100) : 0;
                    return (
                      <div key={mode.name} className="flex items-center gap-4 p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}20`, color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}>
                          <span className="material-symbols-outlined text-[24px]">{getPaymentModeIcon(mode.name)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-on-surface font-semibold text-body-lg">{mode.name}</div>
                          <div className="text-on-surface-variant text-body-sm">{pct}% of total</div>
                        </div>
                        <div className="font-data-mono font-bold text-on-surface text-lg">
                          ₹{mode.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
