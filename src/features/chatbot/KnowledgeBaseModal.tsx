import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Search,
  Check,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { KBArticle, ChatSettings } from '@/types/models';
import { chatService } from '@/services/chat';
import { Button } from '@/components/ui/Button';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'settings'>('articles');
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [settings, setSettings] = useState<ChatSettings | null>(null);
  const [search, setSearch] = useState('');

  // Editing article state
  const [editingArticle, setEditingArticle] = useState<Partial<KBArticle> | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Settings form state
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [offlineMsg, setOfflineMsg] = useState('');
  const [handoverMsg, setHandoverMsg] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    const arts = await chatService.getKBArticles();
    const sets = await chatService.getChatSettings();
    setArticles(arts);
    setSettings(sets);
    setWelcomeMsg(sets.welcome_message);
    setOfflineMsg(sets.offline_message);
    setHandoverMsg(sets.handover_message);
  };

  if (!isOpen) return null;

  const handleToggleActive = async (id: string, currentState: boolean) => {
    await chatService.updateKBArticle(id, { is_active: !currentState });
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this Knowledge Base article?')) {
      await chatService.deleteKBArticle(id);
      await loadData();
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle?.title || !editingArticle?.content) return;

    if (editingArticle.id) {
      await chatService.updateKBArticle(editingArticle.id, editingArticle);
    } else {
      await chatService.createKBArticle({
        title: editingArticle.title,
        category: editingArticle.category || 'General',
        content: editingArticle.content,
        keywords: editingArticle.keywords || [],
        branch_id: editingArticle.branch_id || 'all',
        is_active: editingArticle.is_active ?? true,
      });
    }

    setIsEditorOpen(false);
    setEditingArticle(null);
    await loadData();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      await chatService.updateChatSettings({
        welcome_message: welcomeMsg,
        offline_message: offlineMsg,
        handover_message: handoverMsg,
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#0F4C3A]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Knowledge Base & AI Chat Settings
              </h2>
              <p className="text-xs text-gray-500">
                Configure approved AI knowledge answers, store policies, and bot behavior
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200">
              <button
                onClick={() => setActiveTab('articles')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'articles'
                    ? 'bg-[#0F4C3A] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Articles ({articles.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'settings'
                    ? 'bg-[#0F4C3A] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Chat Settings
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {activeTab === 'articles' ? (
            <div className="space-y-4">
              {/* Search & Add Bar */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search articles by title or keyword..."
                    className="w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
                  />
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingArticle({
                      title: '',
                      category: 'Store Info',
                      keywords: [],
                      content: '',
                      branch_id: 'all',
                      is_active: true,
                    });
                    setIsEditorOpen(true);
                  }}
                  className="bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white text-xs h-9"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Article
                </Button>
              </div>

              {/* Articles Table */}
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4">Title & Category</th>
                      <th className="py-3 px-4">Applicable Branch</th>
                      <th className="py-3 px-4">Keywords</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredArticles.map((art) => (
                      <tr key={art.id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900">{art.title}</div>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                            {art.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 capitalize">
                          {art.branch_id === 'all' ? 'All Branches' : art.branch_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {art.keywords.slice(0, 4).map((kw, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-emerald-50 text-[#0F4C3A] text-[10px] font-medium"
                              >
                                {kw}
                              </span>
                            ))}
                            {art.keywords.length > 4 && (
                              <span className="text-[10px] text-gray-400">
                                +{art.keywords.length - 4}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleActive(art.id, art.is_active)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                              art.is_active
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}
                          >
                            {art.is_active ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingArticle(art);
                                setIsEditorOpen(true);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(art.id)}
                              className="p-1 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Chat Settings Form */
            <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6">
              {/* Mandatory AI Safety Rule Callout (Shown, Not Editable) */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-amber-900 mb-1">
                    Strict AI Rule: No Stock/Price/Delivery Guarantees (Non-Editable)
                  </h4>
                  <p className="text-amber-800 leading-relaxed">
                    "{settings?.disclaimer_text}"
                  </p>
                  <p className="text-amber-700 mt-1 font-medium">
                    The AI responder will never confirm live physical inventory lock, hold reservation, or promise delivery dates without offering handover to store staff.
                  </p>
                </div>
              </div>

              {/* Welcome Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Default Welcome Greeting
                </label>
                <textarea
                  rows={2}
                  value={welcomeMsg}
                  onChange={(e) => setWelcomeMsg(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A] focus:bg-white resize-none"
                />
              </div>

              {/* Handover Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Staff Handover Transition Message
                </label>
                <textarea
                  rows={2}
                  value={handoverMsg}
                  onChange={(e) => setHandoverMsg(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A] focus:bg-white resize-none"
                />
              </div>

              {/* Offline Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Night Hours / Offline Message
                </label>
                <textarea
                  rows={2}
                  value={offlineMsg}
                  onChange={(e) => setOfflineMsg(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A] focus:bg-white resize-none"
                />
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSavingSettings}
                  className="bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white text-xs h-9"
                >
                  Save Settings
                </Button>
                {settingsSuccess && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Settings saved successfully!
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Article Editor Sub-Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingArticle?.id ? 'Edit Knowledge Base Article' : 'New Knowledge Base Article'}
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingArticle?.title || ''}
                  onChange={(e) => setEditingArticle((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Store Timings & Working Days"
                  className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={editingArticle?.category || ''}
                    onChange={(e) =>
                      setEditingArticle((p) => ({ ...p, category: e.target.value }))
                    }
                    placeholder="e.g. Store Info, Policy"
                    className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Branch</label>
                  <select
                    value={editingArticle?.branch_id || 'all'}
                    onChange={(e) =>
                      setEditingArticle((p) => ({ ...p, branch_id: e.target.value }))
                    }
                    className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
                  >
                    <option value="all">All Branches</option>
                    <option value="branch_1">Branch 1 (Rajahmundry)</option>
                    <option value="branch_2">Branch 2 (Kakinada)</option>
                    <option value="branch_3">Branch 3 (Vijayawada)</option>
                    <option value="branch_4">Branch 4 (Guntur)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Trigger Keywords (Comma separated)
                </label>
                <input
                  type="text"
                  value={editingArticle?.keywords?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingArticle((p) => ({
                      ...p,
                      keywords: e.target.value
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean),
                    }))
                  }
                  placeholder="e.g. timings, hours, sunday, opening"
                  className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Article Content</label>
                <textarea
                  rows={4}
                  required
                  value={editingArticle?.content || ''}
                  onChange={(e) => setEditingArticle((p) => ({ ...p, content: e.target.value }))}
                  placeholder="The exact response message returned by the AI assistant..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditorOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white"
                >
                  Save Article
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
