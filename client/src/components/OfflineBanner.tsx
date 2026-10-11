import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineBannerProps {
  onRetry: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onRetry }) => {
  return (
    <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2 flex items-center justify-between text-xs text-rose-500 animate-slide-up">
      <div className="flex items-center gap-2">
        <WifiOff size={15} />
        <span>You are currently offline. Check your network connection.</span>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1 font-semibold underline hover:text-rose-400 transition"
      >
        <RefreshCw size={12} />
        <span>Retry</span>
      </button>
    </div>
  );
};
