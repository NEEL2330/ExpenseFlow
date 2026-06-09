import React, { useState, useEffect } from 'react';
import { fetchAnalytics, fetchMonthAnalytics } from '../api';
import TopBar from './TopBar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const PIE_COLORS = ['#0051d5', '#009668', '#565e74', '#ba1a1a', '#003ea8', '#4edea3'];

// Returns a YYYY-MM string for a month offset from today
// offset=0 → current month, offset=-1 → previous month, etc.
function getYearMonth(offset = 0) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7); // "YYYY-MM"
}

// Format a YYYY-MM string to a friendly label like "May 2026"
function formatMonth(ym) {
  const [year, month] = ym.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function ReportsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [currentMonthData, setCurrentMonthData] = useState(null);
  const [prevMonthData, setPrevMonthData] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentYM = getYearMonth(0);
  const prevYM = getYearMonth(-1);

  useEffect(() => {
    const load = async () => {
      try {
        const [data, curr, prev] = await Promise.all([
          fetchAnalytics(),
          fetchMonthAnalytics(currentYM),
          fetchMonthAnalytics(prevYM),
        ]);
        setAnalytics(data);
        setCurrentMonthData(curr);
        setPrevMonthData(prev);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalSpent = analytics?.total_spent || 0;
  const byCategory = analytics?.by_category || {};
  const byMonth = analytics?.by_month || {};

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const topCatName = topCategory ? topCategory[0] : 'N/A';
  const topCatAmount = topCategory ? topCategory[1] : 0;
  const topCatPct = totalSpent > 0 ? Math.round((topCatAmount / totalSpent) * 100) : 0;

  const monthData = Object.entries(byMonth)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const categoryData = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Month-over-month comparison
  const currTotal = currentMonthData?.total_spent || 0;
  const prevTotal = prevMonthData?.total_spent || 0;
  const momDiff = currTotal - prevTotal;
  const momPct = prevTotal > 0 ? ((momDiff / prevTotal) * 100) : null;
  const momIsUp = momDiff > 0;
  const momIsFlat = momDiff === 0;

  if (loading) {
    return (
      <>
        <TopBar title="Analytics & Reports" />
        <main className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop">
          <div className="flex items-center justify-center h-64">
            <span className="material-symbols-outlined text-secondary animate-spin text-[32px]">progress_activity</span>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar title="Analytics & Reports" />
      <main className="flex-1 p-margin-mobile md:p-margin-desktop overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-lg">

          {/* Subtitle */}
          <div className="mb-lg flex flex-wrap items-center gap-3">
            <p className="text-body-lg text-on-surface-variant">Deep spending insights.</p>
            {!momIsFlat && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-body-sm font-semibold ${
                  momIsUp
                    ? 'bg-error/10 text-error'
                    : 'bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {momIsUp ? 'arrow_upward' : 'arrow_downward'}
                </span>
                {momPct !== null
                  ? `${Math.abs(momPct).toFixed(1)}% ${momIsUp ? 'up' : 'down'} vs ${formatMonth(prevYM)}`
                  : `₹${Math.abs(momDiff).toFixed(2)} ${momIsUp ? 'more' : 'less'} vs ${formatMonth(prevYM)}`}
              </span>
            )}
            {momIsFlat && prevTotal > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-body-sm font-semibold bg-surface-container text-on-surface-variant">
                <span className="material-symbols-outlined text-[15px]">remove</span>
                Same as {formatMonth(prevYM)}
              </span>
            )}
          </div>

          {/* ────── Month-over-Month Comparison Banner ────── */}
          <div
            className={`rounded-xl border shadow-sm p-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              momIsFlat
                ? 'bg-surface-container-low border-outline-variant/30'
                : momIsUp
                ? 'bg-error-container/10 border-error/20'
                : 'bg-tertiary-fixed-dim/10 border-tertiary-fixed-dim/30'
            }`}
          >
            {/* Left – Icon + message */}
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  momIsFlat
                    ? 'bg-surface-container text-on-surface-variant'
                    : momIsUp
                    ? 'bg-error/10 text-error'
                    : 'bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {momIsFlat ? 'remove' : momIsUp ? 'trending_up' : 'trending_down'}
                </span>
              </div>
              <div>
                <p className="text-label-caps text-on-surface-variant mb-1">MONTH-OVER-MONTH COMPARISON</p>
                <p className="text-[17px] font-semibold text-on-surface" style={{ fontFamily: 'Inter' }}>
                  {momIsFlat
                    ? `Same spending as last month (${formatMonth(prevYM)})`
                    : momIsUp
                    ? (
                        <>
                          You spent{' '}
                          <span className="text-error">
                            {momPct !== null
                              ? `${Math.abs(momPct).toFixed(1)}% more`
                              : `₹${Math.abs(momDiff).toFixed(2)} more`}
                          </span>{' '}
                          than {formatMonth(prevYM)}
                        </>
                      )
                    : (
                        <>
                          You spent{' '}
                          <span className="text-on-tertiary-fixed-variant">
                            {momPct !== null
                              ? `${Math.abs(momPct).toFixed(1)}% less`
                              : `₹${Math.abs(momDiff).toFixed(2)} less`}
                          </span>{' '}
                          than {formatMonth(prevYM)}
                        </>
                      )
                  }
                </p>
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  {formatMonth(currentYM)}:{' '}
                  <span className="font-data-mono font-semibold text-on-surface">
                    ₹{currTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  {'  ·  '}
                  {formatMonth(prevYM)}:{' '}
                  <span className="font-data-mono font-semibold text-on-surface">
                    ₹{prevTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </p>
              </div>
            </div>

            {/* Right – Big percentage badge */}
            {momPct !== null && !momIsFlat && (
              <div
                className={`flex-shrink-0 px-5 py-3 rounded-xl font-data-mono font-bold text-[28px] leading-none ${
                  momIsUp
                    ? 'bg-error/10 text-error'
                    : 'bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant'
                }`}
              >
                {momIsUp ? '+' : '-'}{Math.abs(momPct).toFixed(1)}%
              </div>
            )}
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">

            {/* Top Spending Category Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-[16px] p-lg flex flex-col justify-between shadow-sm lg:col-span-1">
              <div>
                <h3 className="text-label-caps text-on-surface-variant mb-sm">Top Spending Category</h3>
                <div className="flex items-center gap-sm mb-md">
                  <div>
                    <h4 className="text-headline-md text-primary">{topCatName}</h4>
                    <p className="text-body-sm text-on-surface-variant">{topCatPct}% of total expenses</p>
                  </div>
                </div>
              </div>
              <div className="mt-auto">
                <p className="font-data-mono text-[32px] font-bold text-primary leading-tight" style={{ fontFamily: 'JetBrains Mono' }}>
                  ₹{topCatAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-body-sm text-on-tertiary-container mt-xs flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">trending_down</span>
                  vs last month
                </p>
              </div>
            </div>

            {/* Spending Trends Line Chart */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-[16px] p-lg shadow-sm lg:col-span-2 flex flex-col">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="text-label-caps text-on-surface-variant">Spending Trends ({monthData.length} Months)</h3>
                <select className="bg-surface-container border border-outline-variant text-body-sm rounded-lg px-3 py-1 text-on-surface focus:ring-secondary focus:border-secondary">
                  <option>All Time</option>
                  <option>Last 6 Months</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c6c6cd33" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#45464d', fontSize: 12, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#45464d', fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(v) => [`₹${v.toFixed(2)}`, 'Spent']} contentStyle={{ borderRadius: '8px', border: '1px solid #c6c6cd', fontFamily: 'JetBrains Mono' }} />
                    <Line type="monotone" dataKey="amount" stroke="#0051d5" strokeWidth={2} dot={{ r: 4, fill: '#0051d5' }} activeDot={{ r: 6, fill: '#0051d5' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Distribution Pie */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-[16px] p-lg shadow-sm lg:col-span-1">
              <h3 className="text-label-caps text-on-surface-variant mb-lg">Category Distribution</h3>
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-lg">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} contentStyle={{ borderRadius: '8px', border: 'none', fontFamily: 'JetBrains Mono' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-body-sm text-on-surface-variant">Total</span>
                    <span className="font-data-mono font-bold text-primary text-lg">₹{(totalSpent / 1000).toFixed(1)}k</span>
                  </div>
                </div>
                {/* Legend */}
                <div className="w-full space-y-3">
                  {categoryData.map((entry, idx) => (
                    <div key={entry.name} className="flex justify-between items-center text-body-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                        <span className="text-on-surface">{entry.name}</span>
                      </div>
                      <span className="font-data-mono">{totalSpent > 0 ? Math.round((entry.value / totalSpent) * 100) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Expenditure Comparison Bar Chart */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-[16px] p-lg shadow-sm lg:col-span-2">
              <h3 className="text-label-caps text-on-surface-variant mb-lg">Monthly Expenditure Comparison</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c6c6cd33" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#45464d', fontSize: 12, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#45464d', fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(v) => [`₹${v.toFixed(2)}`, 'Spent']} contentStyle={{ borderRadius: '8px', border: '1px solid #c6c6cd', fontFamily: 'JetBrains Mono' }} />
                    <Bar dataKey="amount" fill="#0051d5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
