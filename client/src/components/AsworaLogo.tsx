import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const AsworaLogo: React.FC<LogoProps> = ({ className = '', size = 32, showText = true }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-indigo-600 shadow-md shadow-cyan-500/20"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5"
        >
          <path
            d="M50 16L78 74H62L50 48L38 74H22L50 16Z"
            fill="white"
          />
          <circle cx="50" cy="48" r="5" fill="#06b6d4" />
          <path
            d="M34 56H66"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold tracking-tight text-slate-900 dark:text-white leading-none text-base">
            ASWORA<span className="text-cyan-500 font-bold ml-1">AI</span>
          </span>
          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium tracking-widest uppercase">
            Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
