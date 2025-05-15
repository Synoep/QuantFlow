import React, { ReactNode } from 'react';
import { BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-slate-800 border-b border-slate-700 py-4 px-6">
        <div className="container mx-auto flex items-center">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-blue-400 mr-2" />
            <h1 className="text-xl font-bold text-white">Trade Impact Simulator</h1>
          </div>
          <nav className="ml-auto">
            <ul className="flex space-x-4">
              <li>
                <a 
                  href="https://www.okx.com/docs-v5/en/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  API Docs
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 py-4 px-6">
        <div className="container mx-auto text-center text-slate-400 text-sm">
          © 2025 Trade Impact Simulator | Real-time market data from OKX
        </div>
      </footer>
    </div>
  );
};