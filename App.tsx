import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import DocumentGenerator from './components/DocumentGenerator';
import DocumentAnalyzer from './components/DocumentAnalyzer';
import About from './components/About';
import { AppView, DocumentTemplate } from './types';
import { Scale, Info, Sun, Moon } from 'lucide-react'; // Import Sun and Moon icons

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Initialize theme from localStorage or default to 'light'
    const storedTheme = localStorage.getItem('theme');
    return storedTheme === 'dark' ? 'dark' : 'light';
  });

  // Apply theme class to HTML element
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <Dashboard
            onSelectTemplate={(template) => {
              setSelectedTemplate(template);
              setCurrentView(AppView.GENERATOR);
            }}
            onAnalyze={() => setCurrentView(AppView.ANALYZER)}
          />
        );
      case AppView.GENERATOR:
        return (
          selectedTemplate && (
            <DocumentGenerator
              template={selectedTemplate}
              onBack={() => {
                setSelectedTemplate(null);
                setCurrentView(AppView.DASHBOARD);
              }}
            />
          )
        );
      case AppView.ANALYZER:
        return (
          <DocumentAnalyzer
            onBack={() => setCurrentView(AppView.DASHBOARD)}
          />
        );
      case AppView.ABOUT:
        return (
          <About 
            onBack={() => setCurrentView(AppView.DASHBOARD)} 
          />
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 no-print transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => setCurrentView(AppView.DASHBOARD)}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white group-hover:bg-blue-700 transition-colors">
                <Scale className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Lexi</span>
          </div>
          <nav className="flex gap-4 items-center">
             <button 
                onClick={() => setCurrentView(AppView.ABOUT)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === AppView.ABOUT 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-700'
                }`}
             >
                <Info className="w-4 h-4" />
                About
             </button>
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-700 transition-colors"
                title="Toggle theme"
             >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
             </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12 py-8 no-print transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 dark:text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Lexi Legal AI. Powered by Gemini.</p>
          <p className="mt-2">Disclaimer: Lexi is an AI tool and not a substitute for professional legal advice.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;