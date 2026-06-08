import React, { useState, useEffect, useMemo } from 'react';
import { fetchTransactions } from '../api';
import TopBar from './TopBar';

const CATEGORY_BADGE_STYLES = {
  'Software': 'bg-secondary-fixed text-on-secondary-fixed',
  'Travel': 'bg-error-container text-on-error-container',
  'Food': 'bg-tertiary-fixed text-on-tertiary-fixed',
  'Food & Dining': 'bg-tertiary-fixed text-on-tertiary-fixed',
  'Meals & Ent': 'bg-tertiary-fixed text-on-tertiary-fixed',
  'Office': 'bg-surface-variant text-on-surface-variant',
  'Transport': 'bg-error-container text-on-error-container',
  'Shopping': 'bg-surface-variant text-on-surface-variant',
  'Utilities': 'bg-surface-variant text-on-surface-variant',
  'Entertainment': 'bg-primary-fixed text-on-primary-fixed',
};

const MODE_ICONS = {
  'Card': 'credit_card',
  'card': 'credit_card',
  'Cash': 'payments',
  'cash': 'payments',
  'UPI': 'qr_code_scanner',
  'upi': 'qr_code_scanner',
  'Transfer': 'qr_code_scanner',
  'transfer': 'qr_code_scanner',
};

const PAGE_SIZE = 10;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const params = {};
        if (categoryFilter) params.category = categoryFilter;
        if (modeFilter) params.mode = modeFilter;
        if (fromDate) params.from_date = fromDate;
        if (toDate) params.to_date = toDate;
        const data = await fetchTransactions(params);
        setTransactions(data);
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categoryFilter, modeFilter, fromDate, toDate]);

  const filtered = useMemo(() => {
    if (!search) return transactions;
    return transactions.filter(t =>
      (t.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.payment_mode || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [transactions, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getBadgeClass = (cat) => CATEGORY_BADGE_STYLES[cat] || 'bg-surface-variant text-on-surface-variant';
  const getModeIcon = (mode) => MODE_ICONS[mode] || 'payments';

  return (
    <>
      <TopBar title="Transactions" />
      <main className="flex-1 p-margin-mobile md:p-margin-desktop overflow-y-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-xl gap-md">
          <div>
            <h2 className="text-headline-lg text-on-surface">Transactions</h2>
            <p className="text-body-md text-on-surface-variant mt-xs">Manage and track your recent financial activities.</p>
          </div>
          <button className="bg-secondary text-on-primary text-body-sm font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg flex flex-wrap gap-md items-end shadow-sm">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-label-caps text-on-surface-variant mb-xs">Search</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search description..."
                className="w-full pl-10 pr-3 py-2 border border-outline-variant rounded-md text-body-sm focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
              />
            </div>
          </div>
          <div className="w-full sm:w-auto min-w-[150px]">
            <label className="block text-label-caps text-on-surface-variant mb-xs">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 border border-outline-variant rounded-md text-body-sm focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none bg-white"
            >
              <option value="">All Categories</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="w-full sm:w-auto min-w-[150px]">
            <label className="block text-label-caps text-on-surface-variant mb-xs">Payment Mode</label>
            <select
              value={modeFilter}
              onChange={(e) => { setModeFilter(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 border border-outline-variant rounded-md text-body-sm focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none bg-white"
            >
              <option value="">All Modes</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>
          <div className="w-full sm:w-auto min-w-[200px]">
            <label className="block text-label-caps text-on-surface-variant mb-xs">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="flex-1 py-2 px-3 border border-outline-variant rounded-md text-body-sm focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="flex-1 py-2 px-3 border border-outline-variant rounded-md text-body-sm focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="py-3 px-4 text-label-caps text-outline whitespace-nowrap">Date</th>
                  <th className="py-3 px-4 text-label-caps text-outline min-w-[200px]">Description</th>
                  <th className="py-3 px-4 text-label-caps text-outline">Category</th>
                  <th className="py-3 px-4 text-label-caps text-outline">Payment Mode</th>
                  <th className="py-3 px-4 text-label-caps text-outline text-right">Amount</th>
                  <th className="py-3 px-4 text-label-caps text-outline text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr><td colSpan={6} className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-secondary text-[28px]">progress_activity</span>
                  </td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-on-surface-variant">No transactions found.</td></tr>
                ) : paginated.map((txn) => (
                  <tr key={txn.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="py-3 px-4 text-body-sm text-on-surface whitespace-nowrap">
                      {new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-body-sm font-medium text-on-surface">{txn.category || 'Expense'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeClass(txn.category)}`}>
                        {txn.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-body-sm text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-outline">{getModeIcon(txn.payment_mode)}</span>
                      {txn.payment_mode || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 font-data-mono text-on-surface text-right whitespace-nowrap">
                      -₹{txn.amount?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-on-surface-variant hover:text-secondary transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button className="text-on-surface-variant hover:text-error transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-outline-variant bg-surface-container-lowest px-4 py-3 flex items-center justify-between sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <p className="text-body-sm text-on-surface-variant">
                  Showing <span className="font-medium text-on-surface">{(page - 1) * PAGE_SIZE + 1}</span> to{' '}
                  <span className="font-medium text-on-surface">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of{' '}
                  <span className="font-medium text-on-surface">{filtered.length}</span> results
                </p>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`relative inline-flex items-center px-4 py-2 border border-outline-variant text-body-sm font-medium transition-colors ${
                        p === page ? 'bg-surface-container-high border-secondary text-on-surface z-10' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  {totalPages > 5 && (
                    <>
                      <span className="relative inline-flex items-center px-4 py-2 border border-outline-variant bg-surface-container-lowest text-body-sm font-medium text-on-surface-variant">...</span>
                      <button
                        onClick={() => setPage(totalPages)}
                        className={`relative inline-flex items-center px-4 py-2 border border-outline-variant text-body-sm font-medium transition-colors ${
                          totalPages === page ? 'bg-surface-container-high border-secondary text-on-surface z-10' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
