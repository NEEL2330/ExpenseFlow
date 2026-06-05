import React, { useState, useEffect } from 'react';
import { fetchAnalytics } from '../api';
import TopBar from './TopBar';

const CATEGORY_COLORS = {
  'Food': 'bg-secondary-fixed text-on-secondary-fixed',
  'Food & Dining': 'bg-secondary-fixed text-on-secondary-fixed',
  'Transport': 'bg-error-container text-on-error-container',
  'Transportation': 'bg-error-container text-on-error-container',
  'Shopping': 'bg-surface-variant text-on-surface-variant',
  'Utilities': 'bg-surface-variant text-on-surface-variant',
  'Entertainment': 'bg-primary-fixed text-on-primary-fixed',
  'Other': 'bg-surface-variant text-on-surface-variant',
};

const CATEGORY_ICONS = {
  'Food': 'restaurant',
  'Food & Dining': 'restaurant',
  'Transport': 'local_taxi',
  'Transportation': 'local_taxi',
  'Shopping': 'shopping_bag',
  'Utilities': 'bolt',
  'Entertainment': 'movie',
  'Other': 'more_horiz',
};

function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || 'category';
}

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || 'bg-surface-container-high text-on-surface-variant';
}

export default function CategoriesPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customCategories, setCustomCategories] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('customCategories');
    if (saved) {
      try {
        setCustomCategories(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    const load = async () => {
      try {
        const data = await fetchAnalytics();
        setAnalytics(data);
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

  const allCategoriesMap = { ...byCategory };
  customCategories.forEach(cat => {
    if (!(cat in allCategoriesMap)) {
      allCategoriesMap[cat] = 0;
    }
  });

  const categoryData = Object.entries(allCategoriesMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <TopBar title="Categories" />
      <main className="flex-1 p-margin-mobile md:p-margin-desktop overflow-y-auto bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-xl">
            <h2 className="text-headline-lg text-on-surface">Categories Overview</h2>
            <p className="text-body-md text-on-surface-variant mt-xs">Breakdown of your spending across different categories.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <span className="material-symbols-outlined text-secondary animate-spin text-[32px]">progress_activity</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              {categoryData.length === 0 ? (
                <div className="col-span-full p-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
                  No categories found. Start by adding some expenses!
                </div>
              ) : (
                categoryData.map((cat) => {
                  const pct = totalSpent > 0 ? Math.round((cat.value / totalSpent) * 100) : 0;
                  
                  return (
                    <div key={cat.name} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[180px]">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getCategoryColor(cat.name)}`}>
                          <span className="material-symbols-outlined text-[24px]">{getCategoryIcon(cat.name)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-label-caps text-on-surface-variant block mb-1">Percentage</span>
                          <span className="font-data-mono font-bold text-on-surface text-lg">{pct}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-headline-md text-on-surface truncate mb-1">{cat.name}</h3>
                        <p className="font-data-mono text-body-lg text-secondary font-medium">
                          ${cat.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
