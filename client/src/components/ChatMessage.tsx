import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy, RefreshCw, Sparkles, User as UserIcon, BookOpen, AlertCircle } from 'lucide-react';
import { Message } from '../types/index.js';
import { CodeBlock } from './CodeBlock.js';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onRetry?: () => void;
  fontSize?: 'small' | 'medium' | 'large';
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming = false,
  onRegenerate,
  onRetry,
  fontSize = 'medium',
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const fontClasses = {
    small: 'text-xs md:text-sm',
    medium: 'text-sm md:text-base',
    large: 'text-base md:text-lg',
  }[fontSize];

  return (
    <div
      className={`group w-full py-4 px-3 md:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-slate-50/50 dark:bg-brand-surface/40 border-y border-slate-200/50 dark:border-brand-border/40'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-3 md:gap-4 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <UserIcon size={16} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Sparkles size={16} className="text-cyan-200 animate-pulse" />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          {/* Header label */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-semibold text-xs text-slate-900 dark:text-slate-200">
              {isUser ? 'You' : 'Aswora AI'}
            </span>
            {message.metadata?.modelId && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                {message.metadata.modelId.replace('ollama/', '')}
              </span>
            )}
            {message.metadata?.latencyMs && (
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {message.metadata.latencyMs}ms
              </span>
            )}
          </div>

          {/* Markdown Output */}
          <div className={`prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed break-words ${fontClasses}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');

                  if (!inline && (match || codeString.includes('\n'))) {
                    return (
                      <CodeBlock
                        language={match ? match[1] : 'code'}
                        code={codeString}
                      />
                    );
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            {isStreaming && <span className="streaming-cursor" />}
          </div>

          {/* RAG sources indicator */}
          {message.metadata?.ragSources && message.metadata.ragSources.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/40">
              <BookOpen size={14} />
              <span>Grounded in knowledge base: <strong>{message.metadata.ragSources.join(', ')}</strong></span>
            </div>
          )}

          {/* Interrupted badge */}
          {message.metadata?.interrupted && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-500">
              <AlertCircle size={13} />
              <span>Generation stopped early by user</span>
            </div>
          )}

          {/* Action buttons (copy, regenerate) */}
          {!isUser && !isStreaming && (
            <div className="mt-3 flex items-center gap-1 opacity-90 transition-opacity">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                title="Copy message"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                  title="Regenerate response"
                >
                  <RefreshCw size={13} />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
