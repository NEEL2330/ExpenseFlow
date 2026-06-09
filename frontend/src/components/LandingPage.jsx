import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-surface overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center font-bold text-xl shadow-md">
              E
            </div>
            <span className="text-xl font-bold text-on-surface tracking-tight">ExpenseFlow</span>
          </div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="px-5 py-2 bg-secondary text-on-secondary font-medium rounded-xl hover:bg-secondary-container transition-all shadow-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-5 py-2 text-on-surface font-medium hover:bg-surface-container-low rounded-xl transition-all">
                  Sign In
                </Link>
                <Link to="/signup" className="px-5 py-2 bg-[#0088cc] text-white font-medium rounded-xl hover:bg-[#0077b3] transition-all shadow-sm">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center flex flex-col items-center">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-fixed blur-[120px] opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-tertiary-fixed blur-[120px] opacity-60 pointer-events-none"></div>
        
        <h1 className="relative z-10 text-5xl md:text-7xl font-bold text-on-surface tracking-tight leading-[1.1] max-w-4xl mb-6">
          Track Expenses with a <span className="text-[#0088cc]">Simple Message</span>
        </h1>
        <p className="relative z-10 text-xl text-on-surface-variant max-w-3xl mb-10 leading-relaxed">
          ExpenseFlow automatically records, categorizes, and analyzes your expenses from WhatsApp and Telegram messages. No spreadsheets. No manual entry. Just chat naturally.
        </p>
        <div className="relative z-10 flex flex-wrap justify-center gap-4">
          <Link to="/signup" className="px-8 py-4 bg-surface-container-highest text-on-surface text-lg font-semibold rounded-2xl hover:bg-surface-container-highest/80 transition-colors shadow-sm flex items-center justify-center">
            Get Started Free
          </Link>
          <Link to="/signup" className="px-8 py-4 bg-[#0088cc] text-white text-lg font-semibold rounded-2xl hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">send</span>
            Connect Telegram
          </Link>
          <a href="#how-it-works" className="px-8 py-4 bg-surface-container text-on-surface text-lg font-semibold rounded-2xl hover:bg-surface-container-high transition-colors flex items-center justify-center">
            How It Works
          </a>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-on-surface mb-4">How ExpenseFlow Works</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Connect Your Account', desc: 'Link your Telegram or WhatsApp account securely in seconds.', icon: 'link' },
              { step: '2', title: 'Send Expenses Naturally', desc: 'Simply message:\n"Spent ₹250 on lunch"\n"Paid ₹1200 for electricity bill"\n"Uber ride ₹350"', icon: 'chat' },
              { step: '3', title: 'Let AI Do the Rest', desc: 'ExpenseFlow automatically extracts:\n• Amount\n• Category\n• Payment Method\n• Date & Time\nand stores everything securely.', icon: 'smart_toy' },
              { step: '4', title: 'Get Insights', desc: 'Ask questions like:\n"How much did I spend this month?"\n"Compare May and June spending."\n"Show my food expenses."\n"Where am I overspending?"', icon: 'query_stats' }
            ].map(item => (
              <div key={item.step} className="bg-surface rounded-3xl p-8 border border-outline-variant/30 shadow-sm relative pt-12">
                <div className="absolute -top-6 left-8 w-12 h-12 bg-secondary text-on-secondary rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-on-surface mb-4">{item.title}</h3>
                <p className="text-on-surface-variant whitespace-pre-line leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-on-surface mb-4">Everything You Need to Manage Money</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'AI-Powered Expense Tracking', desc: 'No forms. No manual categorization. Just chat naturally.', icon: 'psychology' },
              { title: 'Automatic Categorization', desc: 'Food, Transport, Shopping, Bills, Entertainment, Health, and more.', icon: 'category' },
              { title: 'Smart Analytics', desc: 'Understand spending patterns with AI-generated insights.', icon: 'analytics' },
              { title: 'Monthly Reports', desc: 'Track monthly spending trends and savings opportunities.', icon: 'calendar_month' },
              { title: 'Search & Filter', desc: 'Find transactions instantly using natural language.', icon: 'search' },
              { title: 'Secure & Private', desc: 'Your financial data remains encrypted and protected.', icon: 'lock' },
            ].map(feature => (
              <div key={feature.title} className="p-6 rounded-2xl border border-outline-variant/30 hover:bg-surface-container-lowest transition-colors flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">{feature.icon}</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-on-surface mb-2">{feature.title}</h4>
                  <p className="text-on-surface-variant">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Conversation Section */}
      <section className="py-24 bg-surface-container-lowest overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-on-surface mb-6">Expense Tracking as Easy as Chatting</h2>
            <p className="text-xl text-on-surface-variant mb-8">
              Forget clunky interfaces. Just talk to ExpenseFlow the same way you'd text a friend. Our AI understands context, currencies, and categories instantly.
            </p>
          </div>
          
          <div className="bg-[#E4DDD6] p-4 sm:p-8 rounded-3xl shadow-xl border border-outline-variant/20">
            <div className="flex flex-col gap-4">
              {/* User Msg */}
              <div className="self-end bg-[#DCF8C6] px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%]">
                <p className="text-[#111111]">Spent ₹450 on dinner at McDonald's</p>
              </div>
              
              {/* Bot Msg */}
              <div className="self-start bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%]">
                <p className="text-[#111111] font-bold mb-2">✅ Expense Recorded</p>
                <div className="font-mono text-sm space-y-1">
                  <p>Amount: ₹450</p>
                  <p>Category: Food</p>
                  <p>Payment: UPI</p>
                  <p>Date: Today</p>
                </div>
              </div>
              
              {/* User Msg */}
              <div className="self-end bg-[#DCF8C6] px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%] mt-4">
                <p className="text-[#111111]">How much did I spend on food this month?</p>
              </div>
              
              {/* Bot Msg */}
              <div className="self-start bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%]">
                <p className="text-[#111111] font-bold mb-2">🍔 Food Expenses This Month</p>
                <div className="font-mono text-sm space-y-1">
                  <p>Total: ₹8,420</p>
                  <p>Transactions: 24</p>
                  <p>Average per meal: ₹350</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-on-surface mb-6">Get More Than Just Expense Tracking</h2>
          <p className="text-xl text-on-surface-variant max-w-3xl mx-auto mb-16">
            ExpenseFlow helps you understand your spending habits.
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Spending Trends', desc: 'See how your expenses change over time.' },
              { title: 'Category Breakdown', desc: 'Know exactly where your money goes.' },
              { title: 'Budget Monitoring', desc: 'Stay on track with monthly spending goals.' },
              { title: 'AI Recommendations', desc: 'Receive personalized suggestions to save money.' },
            ].map(item => (
              <div key={item.title} className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
                <h4 className="text-xl font-bold text-on-surface mb-3">{item.title}</h4>
                <p className="text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose & Testimonials */}
      <section className="py-24 bg-surface-container-lowest border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16">
          
          {/* Why Choose */}
          <div>
            <h2 className="text-4xl font-bold text-on-surface mb-8">Why Users Love ExpenseFlow</h2>
            <ul className="space-y-4">
              {[
                'No spreadsheets',
                'No complex finance apps',
                'Works through Telegram & WhatsApp',
                'Natural language expense entry',
                'AI-powered insights',
                'Fast and effortless',
              ].map(reason => (
                <li key={reason} className="flex items-center gap-3 text-lg text-on-surface-variant">
                  <span className="material-symbols-outlined text-green-500">check_circle</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Testimonials */}
          <div>
            <h2 className="text-4xl font-bold text-on-surface mb-8">What Early Users Say</h2>
            <div className="space-y-6">
              {[
                "I stopped maintaining Excel sheets completely.",
                "Recording expenses now takes less than 5 seconds.",
                "The AI summaries helped me identify unnecessary spending."
              ].map((quote, idx) => (
                <div key={idx} className="p-6 bg-surface rounded-2xl border border-outline-variant/30 shadow-sm relative">
                  <span className="material-symbols-outlined absolute text-secondary/20 text-6xl -top-2 -left-2">format_quote</span>
                  <p className="text-lg text-on-surface relative z-10 font-medium italic">"{quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden flex flex-col items-center text-center px-6">
        <div className="absolute inset-0 bg-secondary-container opacity-30"></div>
        <h2 className="relative z-10 text-5xl font-bold text-on-surface mb-6 tracking-tight">Take Control of Your Finances Today</h2>
        <p className="relative z-10 text-xl text-on-surface-variant mb-10 max-w-2xl">
          Start tracking expenses the easiest way possible.
        </p>
        <div className="relative z-10 flex flex-wrap justify-center gap-4">
          <Link to="/signup" className="px-8 py-4 bg-[#0088cc] text-white text-lg font-semibold rounded-2xl hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">send</span>
            Connect Telegram
          </Link>
          <Link to="/signup" className="px-8 py-4 bg-surface text-on-surface border border-outline-variant text-lg font-semibold rounded-2xl hover:bg-surface-container-low transition-colors shadow-sm flex items-center justify-center">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-surface-container-lowest border-t border-outline-variant/30 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-secondary text-on-secondary flex items-center justify-center font-bold text-sm">
              E
            </div>
            <span className="font-bold text-on-surface">ExpenseFlow</span>
          </div>
          <p className="text-on-surface-variant text-sm">
            ExpenseFlow — Your Personal AI Expense Assistant.
          </p>
        </div>
      </footer>
    </div>
  );
}
