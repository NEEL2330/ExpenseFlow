import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { generateLinkToken, checkLinkStatus } from '../api';

export default function SignUpPage() {
  const [token, setToken] = useState(null);
  const [telegramLink, setTelegramLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleConnectTelegram = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const data = await generateLinkToken();
      setToken(data.token);
      setTelegramLink(data.telegram_link);
      setIsPolling(true);
    } catch (err) {
      setError('Failed to generate connection link. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    let intervalId;
    
    if (isPolling && token) {
      intervalId = setInterval(async () => {
        try {
          const status = await checkLinkStatus(token);
          if (status.linked) {
            clearInterval(intervalId);
            // Navigate to create account page, passing the token
            navigate('/create-account', { state: { token, telegramUser: status.telegram_username || status.telegram_id } });
          }
        } catch (err) {
          // 404 means token expired or invalid
          if (err.response?.status === 404 || err.response?.status === 400) {
            clearInterval(intervalId);
            setIsPolling(false);
            setToken(null);
            setError('Connection request expired. Please try again.');
          }
        }
      }, 3000); // Poll every 3 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPolling, token, navigate]);

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 relative overflow-hidden" style={{ width: '100%' }}>
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-fixed blur-[100px] opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-tertiary-fixed blur-[100px] opacity-60"></div>

      <div className="mx-auto w-full max-w-md relative z-10 px-4 sm:px-0" style={{ width: '100%', maxWidth: '28rem' }}>
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center font-bold text-headline-lg shadow-lg">
            E
          </div>
        </div>
        <h2 className="mt-6 text-center text-display-lg font-bold text-on-surface tracking-tight">
          Join ExpenseFlow
        </h2>
        <p className="mt-2 text-center text-body-lg text-on-surface-variant">
          Connect your Telegram to start tracking expenses
        </p>
      </div>

      <div className="mt-8 mx-auto w-full max-w-md relative z-10 px-4 sm:px-0" style={{ width: '100%', maxWidth: '28rem' }}>
        <div className="bg-surface-container-lowest py-10 px-4 shadow-xl ring-1 ring-outline-variant/30 sm:rounded-2xl sm:px-10 backdrop-blur-sm bg-opacity-90">
          
          {error && (
            <div className="mb-6 bg-error-container text-on-error-container p-4 rounded-xl flex items-start gap-3 border border-error/20">
              <span className="material-symbols-outlined text-error">error</span>
              <p className="text-body-sm font-medium">{error}</p>
            </div>
          )}

          {!isPolling ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-[#0088cc]/10 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#0088cc]" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-headline-md font-bold text-on-surface">Step 1: Link Telegram</h3>
                <p className="mt-2 text-body-sm text-on-surface-variant">
                  We use Telegram to make logging expenses as easy as sending a text.
                </p>
              </div>
              <button
                onClick={handleConnectTelegram}
                disabled={isGenerating}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-body-md font-medium text-white bg-[#0088cc] hover:bg-[#0077b3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0088cc] disabled:opacity-70 transition-all hover:shadow-lg active:scale-[0.98]"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined">link</span>
                )}
                Connect Telegram
              </button>
            </div>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="mx-auto flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-outline-variant/50 max-w-[200px]">
                <QRCodeSVG 
                  value={telegramLink} 
                  size={160} 
                  bgColor={"#ffffff"}
                  fgColor={"#191c1e"}
                  level={"M"}
                  includeMargin={false}
                />
              </div>
              
              <div>
                <h3 className="text-headline-md font-bold text-on-surface">Scan to Connect</h3>
                <p className="mt-2 text-body-sm text-on-surface-variant">
                  Open your phone's camera to scan this code, then tap <strong>Start</strong> in Telegram.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-body-sm">
                <span className="px-2 bg-surface-container-lowest text-on-surface-variant">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border border-outline rounded-xl shadow-sm text-body-md font-medium text-on-surface bg-transparent hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all active:scale-[0.98]"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
