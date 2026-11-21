import React, { useState, useEffect, useMemo } from 'react';
import {
  Upload,
  Trash2,
  Search,
  Calendar,
  User,
  X,
  Loader2,
} from 'lucide-react';
import { MediaAsset, MediaKind } from '@/types/models';
import { getMedia, uploadMedia, deleteMedia } from '@/services/content';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { formatDate } from '@/lib/format';

export const MediaLibraryTab: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<string>('all');

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadKind, setUploadKind] = useState<MediaKind>('Offer');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await getMedia();
      setMediaList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const filtered = useMemo(() => {
    return mediaList.filter((m) => {
      const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
      const matchesKind = kindFilter === 'all' || m.kind === kindFilter;
      return matchesSearch && matchesKind;
    });
  }, [mediaList, search, kindFilter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size exceeds 5 MB limit.');
        return;
      }
      setUploadError(null);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      setUploadError('Title is required');
      return;
    }
    if (!imagePreview) {
      setUploadError('Please select an image file');
      return;
    }

    setIsSubmitting(true);
    try {
      await uploadMedia({
        title: uploadTitle.trim(),
        kind: uploadKind,
        storage_path: imagePreview,
        uploaded_by: 'Super Admin',
      });
      setIsUploadOpen(false);
      setUploadTitle('');
      setImagePreview('');
      await loadMedia();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete media asset "${title}"?`)) {
      await deleteMedia(id);
      await loadMedia();
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search media by title..."
              className="w-full h-10 pl-10 pr-3 text-xs bg-white border border-border-card rounded-xl text-app-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-brand"
            />
          </div>

          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            className="h-10 px-3 text-xs bg-white border border-border-card rounded-xl text-slate-700"
          >
            <option value="all">All Media Kinds</option>
            <option value="Offer">Offer</option>
            <option value="New Arrival">New Arrival</option>
            <option value="Festival">Festival</option>
            <option value="Greeting">Greeting</option>
          </select>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setUploadError(null);
            setImagePreview('');
            setUploadTitle('');
            setIsUploadOpen(true);
          }}
          className="gap-2 bg-primary-brand"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Media</span>
        </Button>
      </div>

      {/* Grid of Media Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-border-card text-xs text-app-muted">
          No media assets found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-border-card shadow-card overflow-hidden flex flex-col hover:shadow-md transition-all"
            >
              {/* Image Preview Container */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={item.storage_path}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback placeholder
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-3 left-3">
                  {item.kind === 'Offer' && <Pill variant="green">Offer</Pill>}
                  {item.kind === 'New Arrival' && <Pill variant="blue">New Arrival</Pill>}
                  {item.kind === 'Festival' && <Pill variant="amber">Festival</Pill>}
                  {item.kind === 'Greeting' && <Pill variant="purple">Greeting</Pill>}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.title)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Delete image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card Meta */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-app-text leading-snug truncate" title={item.title}>
                    {item.title}
                  </h4>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-app-muted">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{item.uploaded_by}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border-card">
              <h3 className="text-base font-bold text-app-text">Upload Media Asset</h3>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                  {uploadError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-app-text mb-1">
                  Asset Title *
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Pongal Special Suits Offer"
                  className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-text mb-1">
                  Media Category / Kind *
                </label>
                <select
                  value={uploadKind}
                  onChange={(e) => setUploadKind(e.target.value as MediaKind)}
                  className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl"
                >
                  <option value="Offer">Offer</option>
                  <option value="New Arrival">New Arrival</option>
                  <option value="Festival">Festival</option>
                  <option value="Greeting">Greeting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-text mb-1">
                  Image File (JPG, PNG, WebP ≤ 5MB) *
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-brand/10 file:text-primary-brand hover:file:bg-primary-brand/20 cursor-pointer"
                />
              </div>

              {imagePreview && (
                <div className="relative h-40 rounded-xl overflow-hidden border border-border-card bg-slate-50">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="pt-3 border-t border-border-card flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary-brand"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                  <span>Upload</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
