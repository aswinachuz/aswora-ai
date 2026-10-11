import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Code2, PenTool, GraduationCap, Compass, AlertCircle } from 'lucide-react';
import { api, streamMessage } from '../services/api.js';
import { Conversation, Message, ModelInfo } from '../types/index.js';
import { Header } from '../components/Header.js';
import { Sidebar } from '../components/Sidebar.js';
import { ChatMessage } from '../components/ChatMessage.js';
import { MessageComposer } from '../components/MessageComposer.js';
import { PromptLibraryModal } from '../components/PromptLibraryModal.js';
import { KnowledgeBaseModal } from '../components/KnowledgeBaseModal.js';
import { SettingsModal } from '../components/SettingsModal.js';
import { OfflineBanner } from '../components/OfflineBanner.js';
import { useAuth } from '../context/AuthContext.js';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(
    user?.preferences?.defaultModel || 'llama-3.3-70b-versatile'
  );
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(
    user?.preferences?.fontSize || 'medium'
  );

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingMetadata, setStreamingMetadata] = useState<any>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [promptLibraryOpen, setPromptLibraryOpen] = useState(false);
  const [knowledgeBaseOpen, setKnowledgeBaseOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [includeRag, setIncludeRag] = useState(false);
  const [hasRagDocs, setHasRagDocs] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch approved models catalog
  useEffect(() => {
    async function loadModels() {
      try {
        const data = await api.models.list();
        setModels(data.models);
      } catch (err) {
        console.warn('[Aswora] Failed to fetch models:', err);
      }
    }
    loadModels();
  }, []);

  // Check RAG documents count
  useEffect(() => {
    async function checkDocs() {
      try {
        const data = await api.rag.list();
        setHasRagDocs(data.documents.length > 0);
      } catch {
        // ignore
      }
    }
    checkDocs();
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await api.conversations.list();
      setConversations(data.conversations);
      if (data.conversations.length > 0 && !activeConversationId) {
        selectConversation(data.conversations[0]._id);
      }
    } catch (err: any) {
      console.error('[Aswora] Error loading conversations:', err);
    }
  };

  const selectConversation = async (id: string) => {
    setActiveConversationId(id);
    setErrorMessage(null);
    try {
      const data = await api.conversations.get(id);
      setMessages(data.messages);
      if (data.conversation.modelId) {
        setSelectedModel(data.conversation.modelId);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load conversation history');
    }
  };

  const handleNewChat = async () => {
    try {
      const data = await api.conversations.create({ modelId: selectedModel });
      setConversations((prev) => [data.conversation, ...prev]);
      setActiveConversationId(data.conversation._id);
      setMessages([]);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create new chat');
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.conversations.delete(id);
      const remaining = conversations.filter((c) => c._id !== id);
      setConversations(remaining);
      if (activeConversationId === id) {
        if (remaining.length > 0) {
          selectConversation(remaining[0]._id);
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete conversation');
    }
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      const data = await api.conversations.update(id, { title: newTitle });
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, title: data.conversation.title } : c))
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to rename conversation');
    }
  };

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      const data = await api.conversations.update(id, { isPinned });
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isPinned: data.conversation.isPinned } : c))
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update pin status');
    }
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Send message and stream response
  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isStreaming) return;

    let targetConvId = activeConversationId;
    if (!targetConvId) {
      // Auto-create conversation if none is active
      try {
        const newConv = await api.conversations.create({ modelId: selectedModel });
        targetConvId = newConv.conversation._id;
        setActiveConversationId(targetConvId);
        setConversations((prev) => [newConv.conversation, ...prev]);
      } catch (err: any) {
        setErrorMessage('Failed to initiate conversation');
        return;
      }
    }

    // Add user message optimistically
    const tempUserMsg: Message = {
      _id: `temp-user-${Date.now()}`,
      conversationId: targetConvId,
      role: 'user',
      content: promptText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setIsStreaming(true);
    setStreamingText('');
    setStreamingMetadata(null);
    setErrorMessage(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let accumulated = '';
    let currentMeta: any = null;

    try {
      await streamMessage(
        targetConvId,
        promptText,
        {
          modelId: selectedModel,
          includeRag,
          signal: abortController.signal,
        },
        {
          onMeta: (meta) => {
            currentMeta = meta;
            setStreamingMetadata(meta);
            // Update conversation title in list if updated
            if (meta.title) {
              setConversations((prev) =>
                prev.map((c) => (c._id === targetConvId ? { ...c, title: meta.title } : c))
              );
            }
          },
          onToken: (token) => {
            accumulated += token;
            setStreamingText(accumulated);
          },
          onDone: (doneData) => {
            setIsStreaming(false);
            setStreamingText('');
            // Add completed assistant message to list
            if (accumulated.trim()) {
              const assistantMsg: Message = {
                _id: `msg-${Date.now()}`,
                conversationId: targetConvId!,
                role: 'assistant',
                content: accumulated,
                metadata: {
                  latencyMs: doneData.latencyMs,
                  modelId: currentMeta?.model || selectedModel,
                  provider: currentMeta?.provider,
                  interrupted: doneData.interrupted,
                  ragSources: currentMeta?.ragSources,
                },
                createdAt: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, assistantMsg]);
            }
          },
          onError: (err) => {
            setIsStreaming(false);
            setErrorMessage(err);
          },
        }
      );
    } catch (err: any) {
      setIsStreaming(false);
      setErrorMessage(err.message || 'Stream connection interrupted');
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      // Remove last assistant message
      setMessages((prev) => {
        const lastIdx = prev.length - 1;
        if (prev[lastIdx]?.role === 'assistant') {
          return prev.slice(0, lastIdx);
        }
        return prev;
      });
      handleSendMessage(lastUserMsg.content);
    }
  };

  // Starter Prompts for Empty Chat
  const starterPrompts = [
    {
      icon: <Code2 size={16} className="text-cyan-400" />,
      title: 'Write a TypeScript API',
      desc: 'Build an Express endpoint with Zod validation & rate limits',
    },
    {
      icon: <PenTool size={16} className="text-indigo-400" />,
      title: 'Draft Executive Summary',
      desc: 'Craft a structured status report for stakeholders',
    },
    {
      icon: <GraduationCap size={16} className="text-emerald-400" />,
      title: 'Explain Quantum Computing',
      desc: 'Break down qubits and superposition simply',
    },
    {
      icon: <Compass size={16} className="text-amber-400" />,
      title: 'Debug React State',
      desc: 'Find why component state is resetting on navigation',
    },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-100 dark:bg-brand-dark text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onTogglePin={handleTogglePin}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSettings={() => setSettingsOpen(true)}
          models={models}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          isOnline={isOnline}
        />

        {/* Offline Banner */}
        {!isOnline && <OfflineBanner onRetry={() => setIsOnline(navigator.onLine)} />}

        {/* Error notification */}
        {errorMessage && (
          <div className="bg-rose-500/10 border-b border-rose-500/30 px-4 py-2 flex items-center justify-between text-xs text-rose-500 animate-slide-up">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs hover:underline font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Message Stream Scroll Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !isStreaming ? (
            /* Empty State / Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center p-6 max-w-2xl mx-auto text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20 mb-4">
                <Sparkles size={28} className="text-cyan-200" />
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                How can Aswora AI help you today?
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
                Select an open-weight model, upload reference documents, or choose a starter workflow below.
              </p>

              {/* Starter Grid */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {starterPrompts.map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(starter.title + ': ' + starter.desc)}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-brand-border bg-white dark:bg-brand-surface hover:border-cyan-500/50 hover:bg-cyan-500/5 transition flex items-start gap-3 group text-left shadow-sm"
                  >
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 group-hover:scale-110 transition-transform">
                      {starter.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-500 transition">
                        {starter.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {starter.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message List */
            <div className="py-4 space-y-1">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg._id}
                  message={msg}
                  fontSize={fontSize}
                  onRegenerate={handleRegenerate}
                />
              ))}

              {/* Streaming in-progress Assistant bubble */}
              {isStreaming && (
                <ChatMessage
                  message={{
                    _id: 'active-streaming',
                    conversationId: activeConversationId || '',
                    role: 'assistant',
                    content: streamingText || 'Thinking...',
                    metadata: {
                      modelId: streamingMetadata?.model || selectedModel,
                      ragSources: streamingMetadata?.ragSources,
                    },
                    createdAt: new Date().toISOString(),
                  }}
                  isStreaming={true}
                  fontSize={fontSize}
                />
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Composer Dock */}
        <MessageComposer
          input={input}
          setInput={setInput}
          onSend={() => handleSendMessage()}
          onStop={handleStopStreaming}
          isStreaming={isStreaming}
          onOpenPromptLibrary={() => setPromptLibraryOpen(true)}
          onOpenKnowledgeBase={() => setKnowledgeBaseOpen(true)}
          hasRagDocuments={hasRagDocs}
          includeRag={includeRag}
          setIncludeRag={setIncludeRag}
        />
      </div>

      {/* Modals */}
      <PromptLibraryModal
        isOpen={promptLibraryOpen}
        onClose={() => setPromptLibraryOpen(false)}
        onSelectPrompt={(p) => setInput(p)}
      />

      <KnowledgeBaseModal
        isOpen={knowledgeBaseOpen}
        onClose={() => setKnowledgeBaseOpen(false)}
        onDocumentsUpdated={async () => {
          const res = await api.rag.list();
          setHasRagDocs(res.documents.length > 0);
        }}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        models={models}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />
    </div>
  );
};
