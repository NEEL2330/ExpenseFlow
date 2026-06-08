import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchAnalytics } from '../api';
import TopBar from './TopBar';

export default function AddExpensePage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [customCategories, setCustomCategories] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('customCategories');
    if (saved) {
      try {
        setCustomCategories(JSON.parse(saved));
      } catch(e) {}
    }
    const loadAPI = async () => {
      try {
        const data = await fetchAnalytics();
        const cats = Object.keys(data.by_category || {}).filter(c => c.trim() !== '');
        setApiCategories(cats);
      } catch(e) {}
    };
    loadAPI();
  }, []);

  const allCategories = Array.from(new Set([...apiCategories, ...customCategories]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCategory = isCreatingCategory ? newCategoryName.trim() : category;
    if (!amount || !finalCategory) return;

    setSaving(true);
    setError(null);
    
    if (isCreatingCategory && finalCategory) {
      const updated = Array.from(new Set([...customCategories, finalCategory]));
      localStorage.setItem('customCategories', JSON.stringify(updated));
    }

    try {
      await axios.post('/api/transactions/', {
        telegram_user_id: import.meta.env.VITE_TELEGRAM_USER_ID || '',
        amount: parseFloat(amount),
        category: finalCategory,
        payment_mode: paymentMode,
      });
      navigate('/');
    } catch (err) {
      console.error('Failed to save expense:', err);
      setError('Failed to save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TopBar title="Add Expense" />
      <main className="flex-1 overflow-y-auto bg-background p-margin-mobile md:p-margin-desktop">
        <div className="max-w-4xl mx-auto w-full">
          {/* Page Header */}
          <div className="mb-xl">
            <h1 className="text-headline-lg text-primary mb-2">Record Transaction</h1>
            <p className="text-body-md text-on-surface-variant">Enter the details below to manually record a new expense.</p>
          </div>

          {/* Form Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg ambient-shadow">
            <form onSubmit={handleSubmit} className="space-y-xl">
              {error && (
                <div className="bg-error-container text-on-error-container p-3 rounded-lg text-body-sm">
                  {error}
                </div>
              )}

              {/* Amount & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <div className="space-y-sm">
                  <label className="block text-label-caps text-on-surface-variant" htmlFor="amount">Amount</label>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="font-data-mono text-on-surface-variant">₹</span>
                    </div>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                      className="block w-full pl-8 pr-12 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-data-mono text-primary text-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-outline"
                      style={{ fontFamily: 'JetBrains Mono' }}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <select className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-on-surface-variant text-body-sm focus:ring-0 rounded-r-lg outline-none cursor-pointer">
                        <option>INR</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-sm">
                  <label className="block text-label-caps text-on-surface-variant" htmlFor="date">Transaction Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant">calendar_today</span>
                    </div>
                    <input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="block w-full pl-10 pr-3 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Payment Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <div className="space-y-sm">
                  <label className="block text-label-caps text-on-surface-variant" htmlFor="category">Category</label>
                  {isCreatingCategory ? (
                    <div className="flex gap-2 h-[50px]">
                      <input 
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Type new category..."
                        autoFocus
                        required
                        className="block w-full px-3 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsCreatingCategory(false);
                          setNewCategoryName('');
                          setCategory('');
                        }}
                        className="bg-surface-container-high text-on-surface px-3 rounded-lg hover:bg-surface-container-highest transition-colors flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    </div>
                  ) : (
                    <div className="relative h-[50px]">
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => {
                          if (e.target.value === 'CREATE_NEW') {
                            setIsCreatingCategory(true);
                            setCategory('');
                          } else {
                            setCategory(e.target.value);
                          }
                        }}
                        required
                        className="block w-full h-full pl-3 pr-10 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-primary appearance-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all cursor-pointer"
                      >
                        <option disabled value="">Select a category</option>
                        {allCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="CREATE_NEW" className="font-semibold text-secondary">+ Create New Category</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
                        <span className="material-symbols-outlined">expand_more</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-sm">
                  <label className="block text-label-caps text-on-surface-variant">Payment Mode</label>
                  <div className="flex gap-sm">
                    {[
                      { value: 'Cash', icon: 'payments', label: 'Cash' },
                      { value: 'Credit', icon: 'credit_card', label: 'Credit' },
                      { value: 'UPI', icon: 'qr_code_scanner', label: 'UPI' },
                    ].map((mode) => (
                      <label key={mode.value} className="flex-1 relative cursor-pointer group">
                        <input
                          type="radio"
                          name="payment_mode"
                          value={mode.value}
                          checked={paymentMode === mode.value}
                          onChange={(e) => setPaymentMode(e.target.value)}
                          className="peer sr-only"
                        />
                        <div className="w-full text-center py-2 px-3 border border-outline-variant rounded-lg text-body-sm text-on-surface-variant peer-checked:border-secondary peer-checked:bg-secondary-fixed/20 peer-checked:text-secondary hover:bg-surface-container transition-all">
                          <span className="material-symbols-outlined block mb-1 text-[20px]">{mode.icon}</span>
                          {mode.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-sm">
                <label className="block text-label-caps text-on-surface-variant" htmlFor="description">
                  Description & Notes <span className="font-normal normal-case text-outline ml-1">(Optional)</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief details about this expense..."
                  rows={3}
                  className="block w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-outline"
                ></textarea>
              </div>

              {/* Upload Area */}
              <div className="space-y-sm">
                <label className="block text-label-caps text-on-surface-variant">Attachment</label>
                <div className="w-full border-2 border-dashed border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center text-center hover:bg-surface-container-lowest hover:border-secondary transition-all cursor-pointer group bg-surface">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-3 group-hover:bg-secondary-fixed/30 transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary transition-colors">upload_file</span>
                  </div>
                  <span className="text-body-md text-primary font-medium">Click to upload receipt</span>
                  <span className="text-body-sm text-on-surface-variant mt-1">SVG, PNG, JPG or PDF (max. 5MB)</span>
                </div>
              </div>

              {/* Divider */}
              <hr className="border-outline-variant/50" />

              {/* Actions */}
              <div className="flex items-center justify-end gap-md pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-body-md font-medium text-primary px-6 py-2.5 rounded-lg hover:bg-surface-container transition-colors outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="text-body-md font-semibold bg-secondary text-on-secondary px-8 py-2.5 rounded-lg hover:bg-secondary-container hover:text-on-secondary-container hover:shadow-md transition-all outline-none flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  {saving ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="h-xl"></div>
      </main>
    </>
  );
}
