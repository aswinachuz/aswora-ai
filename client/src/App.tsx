import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.js';
import { ChatPage } from './pages/ChatPage.js';
import { AuthPage } from './pages/AuthPage.js';
import { OnboardingPage } from './pages/OnboardingPage.js';
import { Loader2 } from 'lucide-react';
import { AsworaLogo } from './components/AsworaLogo.js';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasStarted, setHasStarted] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-dark text-slate-100">
        <AsworaLogo size={56} />
        <div className="mt-6 flex items-center gap-2.5 text-xs text-cyan-400 font-mono">
          <Loader2 size={16} className="animate-spin" />
          <span>INITIALIZING ASWORA AI ENGINE...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <ChatPage />;
  }

  if (!hasStarted) {
    return <OnboardingPage onGetStarted={() => setHasStarted(true)} />;
  }

  return <AuthPage />;
};
