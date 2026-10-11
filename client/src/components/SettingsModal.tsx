import React from 'react';
import { X, Moon, Sun, Type, Sliders, LogOut, ShieldCheck, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { ModelInfo } from '../types/index.js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: ModelInfo[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  models,
  selectedModel,
  onSelectModel,
  fontSize,
  setFontSize,
}) => {
  const { user, logout, updatePreferences } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!isOpen) return null;

  const handleFontSizeChange = async (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    await updatePreferences({ fontSize: size });
  };

  const handleModelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onSelectModel(val);
    await updatePreferences({ defaultModel: val });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-brand-surface border border-slate-200 dark:border-brand-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Settings & Preferences
              </h2>
              <p className="text-xs text-slate-400">
                Aswora AI Configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Theme setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? <Moon size={18} className="text-cyan-400" /> : <Sun size={18} className="text-amber-500" />}
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Theme Appearance
                </p>
                <p className="text-[11px] text-slate-400">
                  Switch between Dark Space and Light mode
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-brand-panel border border-slate-200 dark:border-brand-border hover:border-cyan-500 text-slate-800 dark:text-slate-200 transition"
            >
              {theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
            </button>
          </div>

          {/* Font size */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Type size={16} className="text-cyan-400" />
              <span className="text-xs font-semibold">Chat Font Size</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={`py-1.5 rounded-xl text-xs font-medium capitalize transition ${
                    fontSize === size
                      ? 'bg-cyan-500 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-brand-panel text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Default Model */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Cpu size={16} className="text-cyan-400" />
              <span className="text-xs font-semibold">Preferred AI Model</span>
            </div>
            <select
              value={selectedModel}
              onChange={handleModelChange}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-brand-panel border border-slate-200 dark:border-brand-border text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>

          {/* User Account Info */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-brand-border bg-slate-50 dark:bg-brand-panel/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {user?.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Verified Account
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{user?.email}</p>
          </div>

          {/* System metadata */}
          <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center">
            <ShieldCheck size={13} className="text-cyan-500" />
            <span>Aswora AI • Open-Weight Engine • v1.0.0</span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold transition"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
