import React, { useState } from 'react';
import { X, Sparkles, Code2, PenTool, GraduationCap, Compass } from 'lucide-react';
import { PromptTemplate } from '../types/index.js';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

const DEFAULT_PROMPTS: PromptTemplate[] = [
  // Coding
  {
    id: 'code-debug',
    title: 'Debug & Fix Errors',
    category: 'Coding',
    iconName: 'Code2',
    prompt: 'Here is my code snippet that produces an error:\n\n```\n// paste code here\n```\n\nPlease identify the root cause, provide the corrected code, and explain the fix.',
  },
  {
    id: 'code-refactor',
    title: 'Refactor for Performance',
    category: 'Coding',
    iconName: 'Code2',
    prompt: 'Review the following function for algorithmic complexity and propose a high-performance refactored version with TypeScript types:',
  },
  {
    id: 'code-architecture',
    title: 'System Design Architecture',
    category: 'Coding',
    iconName: 'Code2',
    prompt: 'Design a scalable, secure backend architecture for an application with real-time requirements. Include data flow diagrams and tech stack rationale.',
  },

  // Writing
  {
    id: 'write-email',
    title: 'Executive Professional Email',
    category: 'Writing',
    iconName: 'PenTool',
    prompt: 'Draft a polite, concise executive email proposing a strategic partnership with the following key bullet points:',
  },
  {
    id: 'write-summary',
    title: 'Bullet Point Executive Summary',
    category: 'Writing',
    iconName: 'PenTool',
    prompt: 'Summarize the following document into 5 high-impact bullet points and a concluding recommendation for executive leadership:',
  },

  // Learning
  {
    id: 'learn-explain',
    title: 'Explain Complex Concept',
    category: 'Learning',
    iconName: 'GraduationCap',
    prompt: 'Explain how neural network backpropagation works using an intuitive analogy, mathematical formula, and step-by-step walkthrough.',
  },
  {
    id: 'learn-study',
    title: 'Create Study Guide & Quiz',
    category: 'Learning',
    iconName: 'GraduationCap',
    prompt: 'Create a comprehensive study guide on distributed databases (CAP theorem, consensus, replication) followed by 5 practice questions with answers.',
  },

  // Productivity
  {
    id: 'prod-plan',
    title: 'Project Sprint Roadmap',
    category: 'Productivity',
    iconName: 'Compass',
    prompt: 'Generate a 2-week agile sprint backlog with user stories, acceptance criteria, and estimation points for building:',
  },
];

export const PromptLibraryModal: React.FC<PromptLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const categories = ['All', 'Coding', 'Writing', 'Learning', 'Productivity'];

  const filtered = DEFAULT_PROMPTS.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.prompt.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-brand-surface border border-slate-200 dark:border-brand-border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Prompt Library
              </h2>
              <p className="text-xs text-slate-400">
                Curated high-performance templates for Aswora AI
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

        {/* Filter Tabs & Search */}
        <div className="p-4 border-b border-slate-200 dark:border-brand-border flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompt templates..."
            className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-brand-dark border border-slate-200 dark:border-brand-border text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectPrompt(item.prompt);
                onClose();
              }}
              className="p-3 rounded-xl border border-slate-200 dark:border-brand-border bg-slate-50 dark:bg-brand-panel/60 hover:border-cyan-500/50 hover:bg-cyan-500/5 cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition">
                    {item.title}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 font-sans">
                  {item.prompt}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-end">
                <span className="text-[11px] text-cyan-500 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Use Prompt →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
