import React from 'react';
import { ArrowRight, Sparkles, Shield, Cpu, BookOpen } from 'lucide-react';
import { AsworaLogo } from '../components/AsworaLogo.js';

interface OnboardingPageProps {
  onGetStarted: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: <Cpu className="text-cyan-400" size={22} />,
      title: 'Open-Weight Inference',
      desc: 'Powered by Meta Llama 3.3 70B, Llama 3.1 8B, and Mixtral via low-latency cloud inference.',
    },
    {
      icon: <Shield className="text-indigo-400" size={22} />,
      title: 'Privacy & Security First',
      desc: 'Strict resource isolation, protected sessions, and local-first architecture with optional Ollama.',
    },
    {
      icon: <BookOpen className="text-emerald-400" size={22} />,
      title: 'Grounded RAG Knowledge',
      desc: 'Upload code and reference documents to give Aswora specialized context with anti-injection defense.',
    },
    {
      icon: <Sparkles className="text-amber-400" size={22} />,
      title: 'Native Android Polish',
      desc: 'Fluid touch gestures, dark mode, code copy, and adaptive mobile keyboard controls.',
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-6 md:p-12 bg-gradient-to-br from-[#070a12] via-[#0d1222] to-[#141b30] text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <AsworaLogo size={36} />
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          v1.0.0
        </span>
      </div>

      {/* Hero Section */}
      <div className="max-w-3xl mx-auto w-full my-auto text-center py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-6 animate-pulse-slow">
          <Sparkles size={14} />
          <span>Next-Generation Autonomous Assistant</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Intelligent AI engineered for{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            builders, creators & students
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Aswora AI unites the power of premier open-weight models, high-speed streaming, document retrieval, and deep programming help into an Android and web experience.
        </p>

        {/* Feature Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-800 bg-brand-surface/60 backdrop-blur-md flex items-start gap-3.5"
            >
              <div className="p-2.5 rounded-xl bg-slate-800/80 flex-shrink-0">
                {feat.icon}
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">{feat.title}</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition active:scale-95 flex items-center justify-center gap-2.5"
          >
            <span>Launch Aswora AI</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto w-full text-center text-xs text-slate-500 pt-6">
        © 2026 Aswora AI. Open-Weight Cloud & Local Ecosystem.
      </div>
    </div>
  );
};
