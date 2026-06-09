import React, { useState, useEffect } from 'react';
import { fetchAnalytics } from '../api';
import { useAuth } from '../context/AuthContext';
import TopBar from './TopBar';
const CARD_THEMES = [
  { bg: 'bg-[#ffe1df]', text: 'text-[#8c1d18]', circle: 'bg-[#8c1d18]/10' }, // Pink
  { bg: 'bg-[#34d399]', text: 'text-[#064e3b]', circle: 'bg-[#064e3b]/10' }, // Green
  { bg: 'bg-[#e0e7ff]', text: 'text-[#312e81]', circle: 'bg-[#312e81]/10' }, // Blue
  { bg: 'bg-[#fef08a]', text: 'text-[#78350f]', circle: 'bg-[#78350f]/10' }, // Yellow
  { bg: 'bg-[#f3e8ff]', text: 'text-[#4c1d95]', circle: 'bg-[#4c1d95]/10' }, // Purple
  { bg: 'bg-[#ffedd5]', text: 'text-[#7c2d12]', circle: 'bg-[#7c2d12]/10' }, // Orange
];

function getCategoryTheme(categoryName) {
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CARD_THEMES.length;
  return CARD_THEMES[index];
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customCategories, setCustomCategories] = useState([]);

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`customCategories_${user.username}`);
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
          <div className="mb-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-[28px] font-bold text-on-surface leading-tight">Categories Overview</h2>
              <p className="text-body-md text-on-surface-variant mt-1">Organize and review your spending across different categories.</p>
            </div>
            <button className="bg-[#2563eb] text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Category
            </button>
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
                <>
                  {categoryData.map((cat) => {
                    const pct = totalSpent > 0 ? Math.round((cat.value / totalSpent) * 100) : 0;
                    const theme = getCategoryTheme(cat.name);
                    
                    return (
                      <div key={cat.name} className={`relative overflow-hidden rounded-[20px] p-6 h-[180px] flex flex-col justify-between transition-transform hover:scale-[1.02] cursor-pointer ${theme.bg} ${theme.text}`}>
                        {/* Top Right: Percentage */}
                        <div className="flex flex-col items-end relative z-10">
                          <span className="text-[10px] font-bold tracking-widest uppercase opacity-80 mb-0.5">Percentage</span>
                          <span className="text-[32px] leading-none font-bold">{pct}%</span>
                        </div>
                        
                        {/* Bottom Left: Info */}
                        <div className="relative z-10">
                          <h3 className="text-[20px] font-bold mb-1">{cat.name}</h3>
                          <p className="text-[17px] opacity-90 font-medium">
                            ${cat.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>

                        {/* Decorative Circle */}
                        <div className={`absolute -bottom-10 -right-10 w-36 h-36 rounded-full ${theme.circle}`}></div>
                      </div>
                    );
                  })}
                  
                  {/* Manage Categories Card */}
                  <div className="border-2 border-dashed border-outline-variant/60 rounded-[20px] h-[180px] flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-lowest hover:border-[#2563eb] hover:text-[#2563eb] transition-colors cursor-pointer group">
                    <span className="material-symbols-outlined text-[28px] mb-3 transition-colors">add</span>
                    <span className="font-semibold text-sm transition-colors">Manage Categories</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
