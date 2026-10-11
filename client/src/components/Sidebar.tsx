import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Pin,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { Conversation } from '../types/index.js';
import { AsworaLogo } from './AsworaLogo.js';
import { useAuth } from '../context/AuthContext.js';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onTogglePin,
}) => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinned = filteredConversations.filter((c) => c.isPinned);
  const unpinned = filteredConversations.filter((c) => !c.isPinned);

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv._id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string, e?: React.FormEvent) => {
    e?.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 md:w-64 bg-slate-50 dark:bg-brand-surface border-r border-slate-200 dark:border-brand-border flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 dark:border-brand-border flex items-center justify-between">
          <AsworaLogo size={32} />
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action: New Chat */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-sm shadow-md shadow-cyan-500/15 transition active:scale-98"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-200/60 dark:bg-brand-dark/60 border border-slate-300/80 dark:border-brand-border text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2">
          {/* Pinned Section */}
          {pinned.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Pin size={10} className="text-cyan-500" />
                <span>Pinned</span>
              </div>
              <div className="space-y-1">
                {pinned.map((conv) => renderItem(conv))}
              </div>
            </div>
          )}

          {/* Recent Section */}
          <div>
            <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Recent Conversations
            </div>
            {unpinned.length === 0 && pinned.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No conversations found.
              </div>
            ) : (
              <div className="space-y-1">
                {unpinned.map((conv) => renderItem(conv))}
              </div>
            )}
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-slate-200 dark:border-brand-border bg-slate-100/50 dark:bg-brand-dark/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user?.name ? user.name[0].toUpperCase() : <UserIcon size={14} />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user?.name || 'Aswora User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || ''}
                </p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );

  function renderItem(conv: Conversation) {
    const isActive = conv._id === activeId;
    const isEditing = editingId === conv._id;

    if (isEditing) {
      return (
        <form
          key={conv._id}
          onSubmit={(e) => saveRename(conv._id, e)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-200 dark:bg-brand-panel"
        >
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          />
          <button
            type="submit"
            className="p-1 text-emerald-500 hover:bg-emerald-500/20 rounded"
          >
            <Check size={13} />
          </button>
          <button
            type="button"
            onClick={cancelRename}
            className="p-1 text-slate-400 hover:bg-slate-700 rounded"
          >
            <X size={13} />
          </button>
        </form>
      );
    }

    return (
      <div
        key={conv._id}
        onClick={() => {
          onSelectConversation(conv._id);
          if (window.innerWidth < 768) onClose();
        }}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition select-none ${
          isActive
            ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-semibold'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-1">
          <MessageSquare
            size={14}
            className={isActive ? 'text-cyan-500 flex-shrink-0' : 'text-slate-400 flex-shrink-0'}
          />
          <span className="truncate">{conv.title}</span>
        </div>

        {/* Hover / Active action tools */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(conv._id, !conv.isPinned);
            }}
            className="p-1 hover:text-cyan-400 rounded"
            title={conv.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin size={12} className={conv.isPinned ? 'fill-cyan-500 text-cyan-500' : ''} />
          </button>
          <button
            onClick={(e) => startRename(conv, e)}
            className="p-1 hover:text-slate-200 rounded"
            title="Rename"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteConversation(conv._id);
            }}
            className="p-1 hover:text-rose-400 rounded"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  }
};
