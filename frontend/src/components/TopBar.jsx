import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TopBar({ title }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full h-16 sticky top-0 z-40 bg-surface border-b border-outline-variant flex justify-between items-center px-margin-mobile md:px-margin-desktop shrink-0">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button className="md:hidden p-2 text-on-surface-variant rounded-full hover:bg-surface-container-low transition-all">
          <span className="material-symbols-outlined">menu</span>
        </button>
        {/* Mobile brand */}
        <h2 className="text-headline-md text-secondary font-bold md:hidden">ExpenseFlow</h2>
        {/* Desktop title */}
        <h2 className="text-headline-lg text-on-surface hidden md:block">{title || 'Dashboard'}</h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-on-surface-variant hover:bg-surface-container-low rounded-full p-2 cursor-pointer active:opacity-80 transition-all">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-on-surface-variant hover:bg-surface-container-low rounded-full p-2 cursor-pointer active:opacity-80 transition-all hidden md:block">
          <span className="material-symbols-outlined">help</span>
        </button>
        <div className="relative group pb-2 pt-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant ml-2 cursor-pointer bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </div>
          {/* Hover Dropdown Menu */}
          <div className="absolute right-0 top-full mt-[-8px] w-48 bg-surface-container-lowest border border-outline-variant shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-outline-variant bg-surface">
              <p className="text-body-sm text-on-surface font-semibold truncate">
                {user?.username || 'User'}
              </p>
              {user?.telegram_username && (
                <p className="text-[12px] text-on-surface-variant truncate">
                  @{user.telegram_username}
                </p>
              )}
            </div>
            <div className="p-1">
              <button 
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-error hover:bg-error-container/30 text-body-sm rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
