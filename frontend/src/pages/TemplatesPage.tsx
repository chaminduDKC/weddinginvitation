import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Check,
  Edit2,
  RefreshCw,
  Search,
  AlertCircle,
} from 'lucide-react';
import { fetchTemplates, updateTemplate, uploadTemplateThumbnail } from '../lib/api';
import { Template } from '../types';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

// Curated luxury preset photos for quick selection
const PRESET_THUMBNAILS = [
  {
    name: 'Eternal Noir / Dark Romance',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Classic Ballroom & Florals',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Modern Minimalist Pure',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Royal Heritage Golden',
    url: 'https://images.unsplash.com/photo-1545232979-fbf68fe9f1f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Tropical Destination Beach',
    url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Botanical Garden Romance',
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
  },
];

export const TemplatesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Editing State
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editName, setEditName] = useState('');
  const [editThumbnailUrl, setEditThumbnailUrl] = useState('');
  const [editPriceLkr, setEditPriceLkr] = useState<number>(0);
  const [editDescription, setEditDescription] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Thumbnail mode in modal: 'upload' or 'url'
  const [thumbnailMode, setThumbnailMode] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick single-card upload input ref
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const [quickUploadTemplateId, setQuickUploadTemplateId] = useState<string | null>(null);

  // Query templates
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-templates'],
    queryFn: fetchTemplates,
  });

  const templates = data?.templates || [];

  // Filter templates by name or key
  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: templates.length,
    active: templates.filter((t) => t.isActive).length,
    inactive: templates.filter((t) => !t.isActive).length,
  };

  // Open Edit Modal
  const handleOpenEditModal = (t: Template) => {
    setEditingTemplate(t);
    setEditName(t.name);
    setEditThumbnailUrl(t.thumbnailUrl || '');
    setEditPriceLkr(t.priceLkr);
    setEditDescription(t.description || '');
    setEditIsActive(t.isActive);
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setThumbnailMode('upload');
  };

  // Handle local file selection in modal
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WEBP, or GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save Template Changes
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    if (!editName.trim()) {
      toast.error('Template name cannot be empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalThumbnailUrl = editThumbnailUrl.trim() || null;

      // If a new image file was picked in upload mode, upload it first
      if (thumbnailMode === 'upload' && selectedFile) {
        const uploadRes = await uploadTemplateThumbnail(editingTemplate.id, selectedFile);
        finalThumbnailUrl = uploadRes.thumbnailUrl;
      }

      await updateTemplate(editingTemplate.id, {
        name: editName.trim(),
        thumbnailUrl: finalThumbnailUrl,
        priceLkr: Number(editPriceLkr),
        description: editDescription.trim() || null,
        isActive: editIsActive,
      });

      await queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
      toast.success(`Template "${editName.trim()}" updated successfully!`);
      setEditingTemplate(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update template');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click Quick Card Thumbnail Upload
  const handleQuickUploadClick = (templateId: string) => {
    setQuickUploadTemplateId(templateId);
    quickFileInputRef.current?.click();
  };

  const handleQuickFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quickUploadTemplateId) return;

    try {
      await uploadTemplateThumbnail(quickUploadTemplateId, file);
      await queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
      toast.success('Thumbnail updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload thumbnail');
    } finally {
      if (quickFileInputRef.current) quickFileInputRef.current.value = '';
      setQuickUploadTemplateId(null);
    }
  };

  if (isLoading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Hidden Quick File Input */}
      <input
        type="file"
        ref={quickFileInputRef}
        onChange={handleQuickFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />

      {/* Header & Refresh */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Template Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage invitation template names, descriptions, pricing, and thumbnail images
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {[
          { label: 'Total Templates', value: stats.total, color: 'text-slate-900', bg: 'bg-white' },
          { label: 'Active in Catalog', value: stats.active, color: 'text-emerald-600', bg: 'bg-emerald-50/40' },
          { label: 'Inactive / Draft', value: stats.inactive, color: 'text-slate-500', bg: 'bg-slate-50' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} p-3 sm:p-5 rounded-xl shadow-2xs border border-slate-100 flex flex-col justify-between`}
          >
            <dt className="text-xs sm:text-sm font-medium text-slate-500 truncate">{stat.label}</dt>
            <dd className={`mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold tracking-tight ${stat.color}`}>
              {stat.value}
            </dd>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search template by name or key..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs sm:text-sm text-slate-900 focus:outline-none bg-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200 group"
            >
              <div>
                {/* Thumbnail Display with Hover Actions */}
                <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  {template.thumbnailUrl ? (
                    <img
                      src={template.thumbnailUrl}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5 bg-slate-50">
                      <ImageIcon className="h-8 w-8 text-slate-300" />
                      <span className="text-xs font-medium">No Thumbnail</span>
                    </div>
                  )}

                  {/* Key Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono tracking-wider font-semibold">
                      {template.key}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs ${
                        template.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
                      }`}
                    >
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Quick Thumbnail Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickUploadClick(template.id)}
                      className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-md hover:bg-slate-50 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Change Thumbnail</span>
                    </button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {template.name}
                      </h3>
                      <span className="text-xs font-bold text-indigo-600 block mt-0.5">
                        Rs. {template.priceLkr.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {template.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(template)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5 text-indigo-300" />
                  <span>Edit Name &amp; Thumbnail</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
          <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Templates Found</h3>
          <p className="text-xs text-slate-500">
            {searchTerm ? `No templates match "${searchTerm}".` : 'No templates currently configured.'}
          </p>
        </div>
      )}

      {/* Edit Template Modal */}
      {editingTemplate && (
        <Modal
          isOpen={!!editingTemplate}
          onClose={() => setEditingTemplate(null)}
          title={`Edit Template: ${editingTemplate.name}`}
        >
          <form onSubmit={handleSaveTemplate} className="space-y-4">
            {/* Template Name (USER REQUEST) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Eternal Noir Luxury Editorial"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400">
                Shown to customers in the catalog and customizable invitations.
              </span>
            </div>

            {/* Template Thumbnail (USER REQUEST) */}
            <div className="space-y-2.5 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-indigo-600" />
                  <span>Thumbnail Image</span>
                </label>

                {/* Switch between Upload File & Image URL */}
                <div className="flex items-center p-0.5 rounded-lg bg-slate-200 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setThumbnailMode('upload')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      thumbnailMode === 'upload'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbnailMode('url')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      thumbnailMode === 'url'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="flex items-center gap-3">
                <div className="relative w-24 h-16 rounded-lg bg-slate-200 overflow-hidden border border-slate-300 shrink-0">
                  {filePreviewUrl ? (
                    <img src={filePreviewUrl} alt="New upload" className="w-full h-full object-cover" />
                  ) : editThumbnailUrl ? (
                    <img src={editThumbnailUrl} alt="Current thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-700 block">Thumbnail Live Preview</span>
                  Recommended aspect ratio 4:3 (JPG, PNG, WEBP max 5MB).
                </div>
              </div>

              {/* Mode: Upload File */}
              {thumbnailMode === 'upload' ? (
                <div>
                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl bg-white cursor-pointer transition-colors group">
                    <Upload className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 mb-1" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700">
                      {selectedFile ? selectedFile.name : 'Click to select image file from computer'}
                    </span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WEBP up to 5MB</span>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                /* Mode: Custom URL & Presets */
                <div className="space-y-2">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="url"
                      value={editThumbnailUrl}
                      onChange={(e) => setEditThumbnailUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">
                      Or pick a luxury preset photo:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {PRESET_THUMBNAILS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setEditThumbnailUrl(p.url);
                            setSelectedFile(null);
                            setFilePreviewUrl(null);
                          }}
                          className="px-2 py-1 rounded text-[10px] font-medium bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price & Active Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Price (LKR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={editPriceLkr}
                  onChange={(e) => setEditPriceLkr(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={editIsActive ? 'active' : 'inactive'}
                  onChange={(e) => setEditIsActive(e.target.value === 'active')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Description
              </label>
              <textarea
                rows={2}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Template description..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                disabled={isSubmitting}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TemplatesPage;
