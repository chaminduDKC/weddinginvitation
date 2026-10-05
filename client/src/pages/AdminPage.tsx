import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Shield,
  Layers,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Check,
  X,
  Edit2,
  Eye,
  RefreshCw,
  ShoppingBag,
  Users,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import {
  fetchAdminTemplates,
  updateAdminTemplate,
  uploadAdminTemplateThumbnail,
  fetchAdminOrders,
  reviewAdminOrder,
  fetchAdminUsers,
  toggleAdminUserStatus,
} from '../lib/api';
import { Template, AdminOrder, AdminUser } from '../types';
import { Modal } from '../components/Modal';

// Luxury Preset Thumbnails for quick selection by admin
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

export const AdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'templates' | 'orders' | 'users'>('templates');

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Template Edit Modal State
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editName, setEditName] = useState('');
  const [editThumbnailUrl, setEditThumbnailUrl] = useState('');
  const [editPriceLkr, setEditPriceLkr] = useState<number>(0);
  const [editDescription, setEditDescription] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Thumbnail upload vs URL mode in modal
  const [thumbnailMode, setThumbnailMode] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick single-card upload input ref
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const [quickUploadTemplateId, setQuickUploadTemplateId] = useState<string | null>(null);

  // Order inspection modal
  const [inspectSlipUrl, setInspectSlipUrl] = useState<string | null>(null);
  const [reviewModalOrder, setReviewModalOrder] = useState<AdminOrder | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // 1. Queries
  const {
    data: templates,
    isLoading: templatesLoading,
    refetch: refetchTemplates,
  } = useQuery({
    queryKey: ['admin-templates'],
    queryFn: fetchAdminTemplates,
  });

  const {
    data: orders,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchAdminOrders,
  });

  const {
    data: users,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsers,
  });

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
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  // Handle local file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WEBP, or GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image file size must be less than 5MB.');
      return;
    }

    setErrorMessage(null);
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
      setErrorMessage('Template name cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let finalThumbnailUrl = editThumbnailUrl.trim() || null;

      // If user uploaded a new image file, upload it first
      if (thumbnailMode === 'upload' && selectedFile) {
        const uploadRes = await uploadAdminTemplateThumbnail(editingTemplate.id, selectedFile);
        finalThumbnailUrl = uploadRes.thumbnailUrl;
      }

      // Update template details
      await updateAdminTemplate(editingTemplate.id, {
        name: editName.trim(),
        thumbnailUrl: finalThumbnailUrl,
        priceLkr: Number(editPriceLkr),
        description: editDescription.trim() || null,
        isActive: editIsActive,
      });

      // Invalidate queries so public catalog, customizer, and admin table immediately refresh
      await queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
      await queryClient.invalidateQueries({ queryKey: ['public-templates'] });

      setSuccessMessage(`Template "${editName.trim()}" updated successfully!`);
      setTimeout(() => {
        setEditingTemplate(null);
        setSuccessMessage(null);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update template.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Card Thumbnail Upload Handler
  const handleQuickUploadClick = (templateId: string) => {
    setQuickUploadTemplateId(templateId);
    quickFileInputRef.current?.click();
  };

  const handleQuickFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quickUploadTemplateId) return;

    try {
      await uploadAdminTemplateThumbnail(quickUploadTemplateId, file);
      await queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
      await queryClient.invalidateQueries({ queryKey: ['public-templates'] });
    } catch (err: any) {
      alert(`Thumbnail upload failed: ${err.message}`);
    } finally {
      if (quickFileInputRef.current) quickFileInputRef.current.value = '';
      setQuickUploadTemplateId(null);
    }
  };

  // Order Review Actions
  const handleReviewOrder = async (orderId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await reviewAdminOrder(orderId, status, reviewNote.trim() || undefined);
      await queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setReviewModalOrder(null);
      setReviewNote('');
    } catch (err: any) {
      alert(`Order review failed: ${err.message}`);
    }
  };

  // User Status Toggle
  const handleToggleUser = async (userId: string, currentActive: boolean) => {
    try {
      await toggleAdminUserStatus(userId, !currentActive);
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (err: any) {
      alert(`User status update failed: ${err.message}`);
    }
  };

  // Filter templates
  const filteredTemplates = templates?.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen-dvh bg-sand-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hidden Quick File Input */}
        <input
          type="file"
          ref={quickFileInputRef}
          onChange={handleQuickFileChange}
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
        />

        {/* Page Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
              <Shield className="h-3.5 w-3.5 text-gold-600" />
              <span>Platform Administration</span>
            </div>
            <h1 className="text-fluid-h1 font-serif font-bold text-obsidian tracking-tight">
              Management Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Update invitation template names and thumbnails, approve customer bank slips, and manage user accounts.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-sand-100 hover:bg-sand-200 transition-colors min-h-[40px] flex items-center"
            >
              Couple View
            </Link>
            <Link
              to="/"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-black transition-colors min-h-[40px] flex items-center gap-1.5 shadow-xs"
            >
              <Eye className="h-3.5 w-3.5 text-gold-400" />
              <span>Public Catalog</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6 rounded-2xl shadow-2xs gap-4 sm:gap-8 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`py-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'templates'
                ? 'border-gold-600 text-obsidian'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="h-4 w-4 text-gold-600" />
            <span>Templates &amp; Thumbnails</span>
            {templates && (
              <span className="px-2 py-0.5 rounded-full bg-sand-100 text-[11px] text-slate-700 font-semibold">
                {templates.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'border-gold-600 text-obsidian'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="h-4 w-4 text-amber-600" />
            <span>Payment Slips &amp; Orders</span>
            {orders && (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  orders.some((o) => o.status === 'PENDING')
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {orders.filter((o) => o.status === 'PENDING').length} pending
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`py-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'border-gold-600 text-obsidian'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="h-4 w-4 text-slate-600" />
            <span>Registered Couples</span>
            {users && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] text-slate-600 font-semibold">
                {users.length}
              </span>
            )}
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: TEMPLATE NAMES & THUMBNAILS MANAGEMENT (PRIMARY TASK) */}
        {/* ============================================================== */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Filter & Stats Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search template name or key..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-sand-50/50 text-xs sm:text-sm text-obsidian focus:bg-white focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>
                  Showing <strong className="text-slate-800">{filteredTemplates?.length || 0}</strong> of{' '}
                  <strong className="text-slate-800">{templates?.length || 0}</strong> templates
                </span>
                <button
                  type="button"
                  onClick={() => refetchTemplates()}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Refresh list"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Template Grid */}
            {templatesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : filteredTemplates && filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-card transition-all duration-200 group"
                  >
                    <div>
                      {/* Thumbnail Container */}
                      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                        {template.thumbnailUrl ? (
                          <img
                            src={template.thumbnailUrl}
                            alt={template.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 bg-sand-100/50">
                            <ImageIcon className="h-10 w-10 text-slate-300" />
                            <span className="text-xs font-semibold">No Thumbnail Uploaded</span>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono tracking-wider font-semibold">
                            {template.key}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs ${
                              template.isActive
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-400 text-white'
                            }`}
                          >
                            {template.isActive ? 'Active' : 'Draft'}
                          </span>
                        </div>

                        {/* Quick Thumbnail Hover Overlay Button */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuickUploadClick(template.id)}
                            className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-md hover:bg-gold-50 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                          >
                            <Upload className="h-3.5 w-3.5 text-gold-600" />
                            <span>Replace Thumbnail</span>
                          </button>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-base sm:text-lg font-serif font-bold text-obsidian leading-snug">
                              {template.name}
                            </h3>
                            <span className="text-xs font-bold text-gold-700 block mt-0.5">
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

                    {/* Bottom Actions */}
                    <div className="p-4 bg-sand-50/60 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/preview/${template.key}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-obsidian transition-colors py-1 px-2"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-400" />
                        <span>Preview Live</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(template)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-gold-400" />
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
                  Try adjusting your search query or check database seeds.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: ORDERS REVIEW (BANK TRANSFERS) */}
        {/* ============================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-obsidian">Payment Slips for Review</h3>
                  <p className="text-xs text-slate-500">
                    Verify customer bank transfers and approve template activations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => refetchOrders()}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {ordersLoading ? (
                <div className="p-12 text-center text-xs text-slate-400">Loading orders...</div>
              ) : orders && orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-sand-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">Customer / Couple</th>
                        <th className="px-5 py-3.5">Template</th>
                        <th className="px-5 py-3.5">Bank Slip</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-sand-50/40 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-obsidian">
                              {o.user.brideName} &amp; {o.user.groomName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {o.user.email} • {o.user.phone}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-medium text-slate-900">{o.template.name}</span>
                            <span className="block text-[11px] text-slate-500 font-semibold">
                              Rs. {o.template.priceLkr.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {o.signedSlipUrl || o.slipUrl ? (
                              <button
                                type="button"
                                onClick={() => setInspectSlipUrl(o.signedSlipUrl || o.slipUrl || null)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-[11px] font-semibold cursor-pointer"
                              >
                                <FileText className="h-3.5 w-3.5 text-gold-600" />
                                <span>View Slip</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 italic">No slip attached</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                o.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : o.status === 'REJECTED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-500 text-[11px]">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-right">
                            {o.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleReviewOrder(o.id, 'APPROVED')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="h-3 w-3" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReviewModalOrder(o);
                                    setReviewNote('');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <X className="h-3 w-3" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">Reviewed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">No customer orders yet.</div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: REGISTERED USERS MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-obsidian">Registered Couples</h3>
                <p className="text-xs text-slate-500">
                  Manage registered users and control account access.
                </p>
              </div>
              <button
                type="button"
                onClick={() => refetchUsers()}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {usersLoading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading users...</div>
            ) : users && users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sand-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Couple</th>
                      <th className="px-5 py-3.5">Contact</th>
                      <th className="px-5 py-3.5">Role</th>
                      <th className="px-5 py-3.5">Stats</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-sand-50/40 transition-colors">
                        <td className="px-5 py-4 font-semibold text-obsidian">
                          {u.brideName} &amp; {u.groomName}
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-mono text-[11px]">
                          {u.email}
                          <span className="block text-slate-400 font-sans">{u.phone}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-900'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[11px] text-slate-500">
                          {u._count ? (
                            <span>
                              {u._count.orders} orders • {u._count.guests} guests
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {u.role !== 'ADMIN' && (
                            <button
                              type="button"
                              onClick={() => handleToggleUser(u.id, u.isActive)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                                u.isActive
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">No users found.</div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TEMPLATE EDIT MODAL (PRIMARY WORKFLOW FOR TEMPLATE NAME & THUMBNAIL) */}
        {/* ============================================================== */}
        {editingTemplate && (
          <Modal
            isOpen={!!editingTemplate}
            onClose={() => setEditingTemplate(null)}
            title="Edit Template Details"
            description={`Update template name and thumbnail for ${editingTemplate.key}`}
          >
            <form onSubmit={handleSaveTemplate} className="space-y-5">
              {/* Alert Feedback */}
              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. TEMPLATE NAME (USER REQUEST) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-obsidian uppercase tracking-wider">
                  Template Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Eternal Noir Luxury Editorial"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-obsidian focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                />
                <span className="text-[11px] text-slate-500">
                  This title appears across the public catalog, theme cards, customizer header, and customer invoices.
                </span>
              </div>

              {/* 2. TEMPLATE THUMBNAIL (USER REQUEST) */}
              <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-sand-50/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-obsidian uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-gold-600" />
                    <span>Template Thumbnail</span>
                  </label>

                  {/* Mode Toggle */}
                  <div className="flex items-center p-0.5 rounded-lg bg-slate-200 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setThumbnailMode('upload')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        thumbnailMode === 'upload'
                          ? 'bg-white text-obsidian shadow-2xs'
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
                          ? 'bg-white text-obsidian shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {/* Live Thumbnail Preview */}
                <div className="flex items-center gap-4">
                  <div className="relative w-28 h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 shadow-2xs">
                    {filePreviewUrl ? (
                      <img
                        src={filePreviewUrl}
                        alt="New thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    ) : editThumbnailUrl ? (
                      <img
                        src={editThumbnailUrl}
                        alt="Current thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 leading-snug">
                    <span className="font-semibold text-slate-800 block">Thumbnail Live Preview</span>
                    Recommended size: 800x600 (4:3 ratio). Supported formats: JPG, PNG, WEBP up to 5MB.
                  </div>
                </div>

                {/* Upload File Input */}
                {thumbnailMode === 'upload' ? (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-gold-500 rounded-xl bg-white cursor-pointer transition-colors group">
                      <Upload className="h-6 w-6 text-slate-400 group-hover:text-gold-600 mb-1 transition-colors" />
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-gold-700">
                        {selectedFile ? selectedFile.name : 'Click or drag image to upload'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        JPG, PNG, or WEBP (Max 5MB)
                      </span>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  /* Custom URL Input */
                  <div className="space-y-2">
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="url"
                        value={editThumbnailUrl}
                        onChange={(e) => setEditThumbnailUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono text-obsidian focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    {/* Quick Luxury Presets */}
                    <div className="pt-1">
                      <span className="text-[10px] text-slate-400 block mb-1">
                        Or select a luxury preset photo:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_THUMBNAILS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => {
                              setEditThumbnailUrl(p.url);
                              setSelectedFile(null);
                              setFilePreviewUrl(null);
                            }}
                            className="px-2 py-1 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 hover:border-gold-500 hover:bg-gold-50/50 transition-colors cursor-pointer"
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. PRICE & STATUS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-obsidian uppercase tracking-wider">
                    Price (LKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={editPriceLkr}
                    onChange={(e) => setEditPriceLkr(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-obsidian focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-obsidian uppercase tracking-wider">
                    Catalog Status
                  </label>
                  <select
                    value={editIsActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditIsActive(e.target.value === 'active')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-obsidian focus:outline-none focus:border-gold-500"
                  >
                    <option value="active">Active (Visible in Catalog)</option>
                    <option value="inactive">Inactive / Draft</option>
                  </select>
                </div>
              </div>

              {/* 4. DESCRIPTION */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-obsidian uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Template description..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-obsidian focus:outline-none focus:border-gold-500 leading-relaxed"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-obsidian text-xs font-bold shadow-md flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Save Template</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* INSPECT SLIP MODAL */}
        {inspectSlipUrl && (
          <Modal
            isOpen={!!inspectSlipUrl}
            onClose={() => setInspectSlipUrl(null)}
            title="Customer Bank Transfer Slip"
            description="Verified customer payment deposit receipt"
          >
            <div className="space-y-4">
              <div className="max-h-[70vh] overflow-auto rounded-xl bg-slate-900 flex items-center justify-center p-2">
                <img
                  src={inspectSlipUrl}
                  alt="Customer Payment Slip"
                  className="max-h-[65vh] w-auto object-contain rounded-lg shadow-lg"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectSlipUrl(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* REJECT NOTE MODAL */}
        {reviewModalOrder && (
          <Modal
            isOpen={!!reviewModalOrder}
            onClose={() => setReviewModalOrder(null)}
            title="Reject Bank Transfer Order"
            description={`Customer: ${reviewModalOrder.user.brideName} & ${reviewModalOrder.user.groomName}`}
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-obsidian uppercase tracking-wider">
                  Reason / Rejection Note (Sent to Couple)
                </label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="e.g. Deposit slip image is unreadable, please re-upload a clear receipt."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewOrder(reviewModalOrder.id, 'REJECTED')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
