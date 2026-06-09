import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { registerUser } from '../api';

export default function CreateAccountPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Protect this route - must have token from step 1
  const token = location.state?.token;
  const telegramUser = location.state?.telegramUser;
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If accessed directly without going through step 1
  if (!token) {
    return <Navigate to="/signup" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await registerUser({
        token,
        username: formData.username,
        password: formData.password,
        confirm_password: formData.confirm_password
      });
      
      // Success! Redirect to login with success message
      navigate('/login', { state: { message: 'Account created successfully! Please log in.' } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 relative overflow-hidden" style={{ width: '100%' }}>
      {/* Background decoration */}
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-secondary-fixed blur-[100px] opacity-40"></div>
      
      <div className="mx-auto w-full max-w-md relative z-10 px-4 sm:px-0" style={{ width: '100%', maxWidth: '28rem' }}>
        <h2 className="mt-6 text-center text-display-lg font-bold text-on-surface tracking-tight">
          Create Account
        </h2>
        <p className="mt-2 text-center text-body-lg text-on-surface-variant">
          Step 2: Setup your login details
        </p>
      </div>

      <div className="mt-8 mx-auto w-full max-w-md relative z-10 px-4 sm:px-0" style={{ width: '100%', maxWidth: '28rem' }}>
        <div className="bg-surface-container-lowest py-8 px-4 shadow-xl ring-1 ring-outline-variant/30 sm:rounded-2xl sm:px-10 backdrop-blur-sm bg-opacity-90">
          
          <div className="mb-6 flex items-center justify-center gap-2 p-3 bg-tertiary-fixed/30 text-tertiary rounded-lg border border-tertiary/20">
            <span className="material-symbols-outlined text-tertiary">check_circle</span>
            <span className="text-body-sm font-medium">Telegram linked{telegramUser ? ` (${telegramUser})` : ''}</span>
          </div>

          {error && (
            <div className="mb-6 bg-error-container text-on-error-container p-4 rounded-xl flex items-start gap-3 border border-error/20">
              <span className="material-symbols-outlined text-error">error</span>
              <p className="text-body-sm font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-body-sm font-medium text-on-surface">
                Choose a Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">person</span>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-outline-variant rounded-xl shadow-sm placeholder-outline focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary sm:text-body-md transition-all bg-surface-container-lowest text-on-surface"
                  placeholder="e.g. john_doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-body-sm font-medium text-on-surface">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">lock</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-outline-variant rounded-xl shadow-sm placeholder-outline focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary sm:text-body-md transition-all bg-surface-container-lowest text-on-surface"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-body-sm font-medium text-on-surface">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">lock_reset</span>
                </div>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-outline-variant rounded-xl shadow-sm placeholder-outline focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary sm:text-body-md transition-all bg-surface-container-lowest text-on-surface"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-body-md font-medium text-on-primary bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-70 transition-all hover:shadow-lg active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
