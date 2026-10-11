import React from 'react';
import { Menu, Settings, ChevronDown, Wifi, WifiOff } from 'lucide-react';
import { AsworaLogo } from './AsworaLogo.js';
import { ModelInfo } from '../types/index.js';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  models: ModelInfo[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenSettings,
  models,
  selectedModel,
  onSelectModel,
  isOnline,
}) => {
  const currentModel = models.find((m) => m.id === selectedModel);

  return (
    <header className="h-14 border-b border-slate-200 dark:border-brand-border bg-white/80 dark:bg-brand-surface/80 backdrop-blur-md px-3 md:px-5 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-3">
        {/* Toggle Sidebar (Hamburger on mobile) */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <AsworaLogo size={28} showText={false} />

        {/* Model Selector Pill Dropdown */}
        <div className="relative group">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-brand-dark/80 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-cyan-500/50 cursor-pointer transition">
            <span className="truncate max-w-[130px] sm:max-w-[180px]">
              {currentModel?.name || 'Llama 3.3 70B'}
            </span>
            <ChevronDown size={13} className="text-slate-400" />
          </div>

          {/* Dropdown Menu */}
          <div className="absolute left-0 mt-1 w-64 rounded-2xl bg-white dark:bg-brand-panel border border-slate-200 dark:border-brand-border shadow-2xl p-2 hidden group-hover:block hover:block z-50 animate-fade-in">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
              Select Inference Model
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onSelectModel(m.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition flex flex-col gap-0.5 ${
                    m.id === selectedModel
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{m.name}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                      {m.provider}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">
                    {m.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Connectivity status pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
            isOnline
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
              : 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
          }`}
          title={isOnline ? 'Connected to AI Engine' : 'Offline / Disconnected'}
        >
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          title="Settings & Profile"
        >
          <Settings size={19} />
        </button>
      </div>
    </header>
  );
};
