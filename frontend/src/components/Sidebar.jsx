import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: 'dashboard', label: 'Dashboard' },
  { to: '/transactions', icon: 'receipt_long', label: 'Transactions' },
  { to: '/add-expense', icon: 'add_circle', label: 'Add Expense' },
  { to: '/reports', icon: 'leaderboard', label: 'Reports' },
  { to: '/categories', icon: 'category', label: 'Categories' },
];

const bottomItems = [
  { to: '/profile', icon: 'person', label: 'Profile' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-[280px] h-screen sticky top-0 left-0 bg-surface-container-lowest border-r border-outline-variant shrink-0 py-md">
      {/* Logo */}
      <div className="px-gutter mb-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-headline-md">
          E
        </div>
        <div>
          <h1 className="text-headline-md font-bold text-on-surface" style={{fontSize: '24px', lineHeight: '32px'}}>ExpenseFlow</h1>
          <p className="text-body-sm text-on-surface-variant">Fintech Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-sm flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-4 py-3 bg-primary-fixed text-on-primary-fixed border-l-4 border-secondary font-medium text-body-sm rounded-r-lg transition-transform duration-150'
                : 'flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high text-body-sm rounded-lg transition-all active:scale-[0.98] duration-150'
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}

        {/* Bottom nav items */}
        <div className="mt-auto flex flex-col gap-1">
          {bottomItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-3 px-4 py-3 bg-primary-fixed text-on-primary-fixed border-l-4 border-secondary font-medium text-body-sm rounded-r-lg transition-transform duration-150'
                  : 'flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high text-body-sm rounded-lg transition-all active:scale-[0.98] duration-150'
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
}
