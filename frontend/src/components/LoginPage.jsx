import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await login(username, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 relative overflow-hidden" style={{ width: '100%' }}>
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-fixed blur-[100px] opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-tertiary-fixed blur-[100px] opacity-60"></div>

      <div className="mx-auto w-full max-w-md relative z-10 px-4 sm:px-0" style={{ width: '100%', maxWidth: '28rem' }}>
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center font-bold text-headline-lg shadow-lg">
            E
          </div>
        </div>
        <h2 className="mt-6 text-center text-display-lg font-bold text-on-surface tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-body-lg text-on-surface-variant">
          Sign in to your ExpenseFlow account
        </p>
      </div>

      <div className="mt-8 mx-auto w-full max-w-md relative z-10 px-4 sm:px-0" style={{ width: '100%', maxWidth: '28rem' }}>
        <div className="bg-surface-container-lowest py-8 px-4 shadow-xl ring-1 ring-outline-variant/30 sm:rounded-2xl sm:px-10 backdrop-blur-sm bg-opacity-90">
          
          {error && (
            <div className="mb-6 bg-error-container text-on-error-container p-4 rounded-xl flex items-start gap-3 border border-error/20">
              <span className="material-symbols-outlined text-error">error</span>
              <p className="text-body-sm font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-body-sm font-medium text-on-surface">
                Username
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">person</span>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-outline-variant rounded-xl shadow-sm placeholder-outline focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary sm:text-body-md transition-all bg-surface-container-lowest text-on-surface"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-body-sm font-medium text-on-surface">
                Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">lock</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-outline-variant rounded-xl shadow-sm placeholder-outline focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary sm:text-body-md transition-all bg-surface-container-lowest text-on-surface"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-body-md font-medium text-on-primary bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-body-sm">
                <span className="px-2 bg-surface-container-lowest text-on-surface-variant">
                  New to ExpenseFlow?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/signup"
                className="w-full flex justify-center py-3 px-4 border border-outline rounded-xl shadow-sm text-body-md font-medium text-on-surface bg-transparent hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all active:scale-[0.98]"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
