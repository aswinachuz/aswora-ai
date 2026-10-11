import React, { useRef, useEffect } from 'react';
import { ArrowUp, Square, Sparkles, Paperclip } from 'lucide-react';

interface MessageComposerProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  onOpenPromptLibrary: () => void;
  onOpenKnowledgeBase: () => void;
  hasRagDocuments?: boolean;
  includeRag: boolean;
  setIncludeRag: (val: boolean) => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isStreaming,
  disabled = false,
  onOpenPromptLibrary,
  onOpenKnowledgeBase,
  hasRagDocuments = false,
  includeRag,
  setIncludeRag,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && input.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 md:px-6 pb-4 pt-1">
      {/* RAG Context indicator chip */}
      {hasRagDocuments && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeRag}
              onChange={(e) => setIncludeRag(e.target.checked)}
              className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
            />
            <span className={includeRag ? 'text-cyan-500 font-medium' : ''}>
              Ground responses using uploaded Knowledge Base
            </span>
          </label>
        </div>
      )}

      {/* Composer Input Box */}
      <div className="relative flex flex-col rounded-2xl border border-slate-300 dark:border-brand-border bg-white dark:bg-brand-surface shadow-xl shadow-black/10 dark:shadow-black/40 focus-within:border-cyan-500 dark:focus-within:border-cyan-500 transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Aswora AI anything... (Shift+Enter for new line)"
          rows={1}
          disabled={disabled}
          className="w-full resize-none bg-transparent px-4 py-3.5 text-sm md:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none min-h-[50px] max-h-[200px]"
        />

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-slate-100 dark:border-brand-border/40">
          <div className="flex items-center gap-1.5">
            {/* Prompt Library */}
            <button
              type="button"
              onClick={onOpenPromptLibrary}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
              title="Open Prompt Library"
            >
              <Sparkles size={15} className="text-cyan-500" />
              <span className="hidden sm:inline">Prompts</span>
            </button>

            {/* Knowledge Base */}
            <button
              type="button"
              onClick={onOpenKnowledgeBase}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
              title="Attach Document / Knowledge Base"
            >
              <Paperclip size={15} className="text-indigo-500" />
              <span className="hidden sm:inline">Documents</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/30 font-medium text-xs transition active:scale-95 shadow-sm"
              >
                <Square size={13} className="fill-current animate-pulse" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onSend}
                disabled={!input.trim() || disabled}
                className="p-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white disabled:opacity-40 disabled:pointer-events-none hover:shadow-lg hover:shadow-cyan-500/20 transition active:scale-95"
                title="Send Message"
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Aswora AI can make mistakes. Verify critical technical or factual information.
        </p>
      </div>
    </div>
  );
};
