import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api.js';
import { DocumentItem } from '../types/index.js';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentsUpdated?: () => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  onDocumentsUpdated,
}) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.rag.list();
      setDocuments(data.documents);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.rag.upload(file);
      setSuccess(`"${file.name}" ingested and indexed for RAG retrieval.`);
      await loadDocuments();
      onDocumentsUpdated?.();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.rag.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      onDocumentsUpdated?.();
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-brand-surface border border-slate-200 dark:border-brand-border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Knowledge Base & RAG Documents
              </h2>
              <p className="text-xs text-slate-400">
                Ground Aswora AI responses with your custom reference documents
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

        {/* Upload Drop Area */}
        <div className="p-4 border-b border-slate-200 dark:border-brand-border bg-slate-50 dark:bg-brand-panel/40">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.json,.csv,.js,.ts,.py,.html"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-brand-border hover:border-cyan-500 dark:hover:border-cyan-500 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
          >
            <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-500 group-hover:scale-110 transition-transform">
              {uploading ? <Loader2 size={22} className="animate-spin" /> : <Upload size={22} />}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {uploading ? 'Processing & Indexing Document...' : 'Tap or drop document to upload'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports TXT, MD, JSON, CSV, TS, JS, Python (Max 10MB)
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
              <CheckCircle2 size={15} />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Uploaded Documents ({documents.length})
          </div>

          {loading ? (
            <div className="flex justify-center p-6 text-slate-400">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No reference documents uploaded yet. Upload a text or code document above to ground your chats!
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-brand-border bg-slate-50 dark:bg-brand-panel/60"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <FileText size={16} className="text-cyan-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {doc.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {doc.chunkCount} chunks • {Math.round(doc.fileSizeBytes / 1024)} KB
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition flex-shrink-0"
                  title="Remove document"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
