import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  FileText,
  Copy,
  Check,
  Trash2,
  Share2,
  ArrowLeft,
  AlertCircle,
  Search,
  MessageCircle,
  Lock,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  Layers,
  Send,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  RotateCcw,
  CheckSquare,
  Square,
  Pencil,
  Clock,
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react';
import { fetchGuests, createGuest, updateGuest, deleteGuest, fetchUserOrders } from '../lib/api';
import { GuestSkeleton } from '../components/SkeletonLoader';
import { Modal } from '../components/Modal';
import { useAuth } from '../lib/auth';
import { Guest } from '../types';
import { copyToClipboard } from '../lib/clipboard';

export const GuestListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check if couple has bought and activated a template
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: fetchUserOrders,
  });

  const hasAnyOrder = Boolean(orders && orders.length > 0 && orders.some((o) => o.status !== 'REJECTED'));
  const isApproved = Boolean(orders?.some((o) => o.status === 'APPROVED'));

  // Extract approved orders and distinct templates bought by user
  const approvedOrders = orders?.filter((o) => o.status === 'APPROVED') || [];
  const approvedTemplates = React.useMemo(() => {
    const map = new Map<
      string,
      { id: string; key: string; name: string; priceLkr: number; thumbnailUrl?: string | null }
    >();
    approvedOrders.forEach((o) => {
      if (o.template && !map.has(o.template.key)) {
        map.set(o.template.key, o.template);
      }
    });
    return Array.from(map.values());
  }, [approvedOrders]);

  const hasMultipleTemplates = approvedTemplates.length > 1;

  // Selected template for guest links
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(() => {
    try {
      return localStorage.getItem('wedding_active_guest_template') || '';
    } catch {
      return '';
    }
  });

  // Ensure selectedTemplateKey is always valid among approved templates
  useEffect(() => {
    if (approvedTemplates.length > 0) {
      const exists = approvedTemplates.some((t) => t.key === selectedTemplateKey);
      if (!exists) {
        const fallback = approvedTemplates[0].key;
        setSelectedTemplateKey(fallback);
        try {
          localStorage.setItem('wedding_active_guest_template', fallback);
        } catch {
          // ignore
        }
      }
    }
  }, [approvedTemplates, selectedTemplateKey]);

  const handleSelectTemplate = (key: string) => {
    setSelectedTemplateKey(key);
    try {
      localStorage.setItem('wedding_active_guest_template', key);
    } catch {
      // ignore
    }
  };

  const activeSelectedTemplate =
    approvedTemplates.find((t) => t.key === selectedTemplateKey) || approvedTemplates[0];

  const getInvitationUrl = (token: string) => {
    const origin = window.location.origin;
    const targetKey = selectedTemplateKey || (approvedTemplates[0]?.key ?? '');
    return targetKey ? `${origin}/i/${token}?template=${encodeURIComponent(targetKey)}` : `${origin}/i/${token}`;
  };

  // Fetch guest list
  const { data: guests, isLoading: guestsLoading } = useQuery({
    queryKey: ['guests'],
    queryFn: fetchGuests,
  });

  // Track "Sent" state in localStorage so couples never message anyone twice
  const [sentMap, setSentMap] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('wedding_guests_sent_map');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const toggleSent = (guestId: string) => {
    setSentMap((prev) => {
      const updated = { ...prev, [guestId]: !prev[guestId] };
      try {
        localStorage.setItem('wedding_guests_sent_map', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Modals state
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Multi-Select & Send-All State
  const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(new Set());
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendQueueIndex, setSendQueueIndex] = useState(0);
  const [sendModalTab, setSendModalTab] = useState<'queue' | 'bulk'>('queue');
  const [bulkCopiedType, setBulkCopiedType] = useState<'messages' | 'links' | null>(null);

  const handleOpenSingleModal = () => {
    if (!isApproved) return;
    setIsSingleModalOpen(true);
  };

  const handleCloseSingleModal = () => {
    setIsSingleModalOpen(false);
    setSingleError('');
  };

  const handleOpenBulkModal = () => {
    if (!isApproved) return;
    setIsBulkModalOpen(true);
  };

  const handleCloseBulkModal = () => {
    setIsBulkModalOpen(false);
    setBulkError('');
  };

  // Single guest form
  const [singleName, setSingleName] = useState('');
  const [singlePhone, setSinglePhone] = useState('');
  const [singleError, setSingleError] = useState('');

  // Bulk guest form
  const [bulkText, setBulkText] = useState('');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkError, setBulkError] = useState('');

  // Search filter
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Guest delete confirmation modal state
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);

  // Guest edit modal state
  const [guestToEdit, setGuestToEdit] = useState<Guest | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editError, setEditError] = useState('');

  // Update guest mutation
  const updateGuestMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; phone: string } }) =>
      updateGuest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setGuestToEdit(null);
      setEditError('');
    },
    onError: (err: any) => {
      setEditError(err.message || 'Failed to update guest');
    },
  });

  const handleOpenEditModal = (guest: Guest) => {
    setGuestToEdit(guest);
    setEditName(guest.name);
    setEditPhone(guest.phone);
    setEditError('');
  };

  const handleCloseEditModal = () => {
    if (updateGuestMutation.isPending) return;
    setGuestToEdit(null);
    setEditError('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestToEdit) return;
    if (!editName.trim() || !editPhone.trim()) {
      setEditError('Please provide both guest name and phone number.');
      return;
    }
    updateGuestMutation.mutate({
      id: guestToEdit.id,
      data: { name: editName.trim(), phone: editPhone.trim() },
    });
  };

  // Add single guest mutation
  const addGuestMutation = useMutation({
    mutationFn: (newGuest: { name: string; phone: string }) => createGuest(newGuest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setIsSingleModalOpen(false);
      setSingleName('');
      setSinglePhone('');
      setSingleError('');
    },
    onError: (err: any) => {
      setSingleError(err.message || 'Failed to add guest');
    },
  });

  // Delete guest mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGuest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setGuestToDelete(null);
    },
  });

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApproved) {
      setSingleError('You must have an approved wedding template purchase before adding guests.');
      return;
    }
    if (!singleName.trim() || !singlePhone.trim()) {
      setSingleError('Please provide both guest name and phone number.');
      return;
    }
    addGuestMutation.mutate({ name: singleName.trim(), phone: singlePhone.trim() });
  };

  // Bulk add: Parse multiple lines
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApproved) {
      setBulkError('You must have an approved wedding template purchase before adding guests.');
      return;
    }
    if (!bulkText.trim()) return;

    setBulkProcessing(true);
    setBulkError('');

    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsedGuests: { name: string; phone: string }[] = [];

    for (const line of lines) {
      const parts = line.split(/[,;\-\/]+/).map((p) => p.trim());
      if (parts.length >= 2) {
        parsedGuests.push({ name: parts[0], phone: parts[1] });
      } else {
        const words = line.split(/\s+/);
        const lastWord = words[words.length - 1];
        if (/\d{7,}/.test(lastWord)) {
          const name = words.slice(0, -1).join(' ');
          parsedGuests.push({ name: name || 'Guest', phone: lastWord });
        }
      }
    }

    if (parsedGuests.length === 0) {
      setBulkError('Could not identify names and phone numbers. Please enter one guest per line, e.g. "Kasun Silva, 0771234567"');
      setBulkProcessing(false);
      return;
    }

    try {
      for (const g of parsedGuests) {
        await createGuest(g);
      }
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setIsBulkModalOpen(false);
      setBulkText('');
    } catch (err: any) {
      setBulkError(err.message || 'Some guests could not be added.');
    } finally {
      setBulkProcessing(false);
    }
  };

  const copyInviteLink = async (token: string, guestId: string) => {
    const url = getInvitationUrl(token);
    const copied = await copyToClipboard(url);
    if (copied) {
      setCopiedId(guestId);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const getWhatsAppShareUrl = (guest: { name: string; phone: string; token: string }) => {
    const link = getInvitationUrl(guest.token);
    const cleanPhone = guest.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('0')
      ? '94' + cleanPhone.slice(1)
      : cleanPhone.startsWith('94')
      ? cleanPhone
      : '94' + cleanPhone;

    const coupleSignoff = user?.brideName
      ? `${user.brideName} & ${user.groomName}`
      : 'The Happy Couple';

    const message = encodeURIComponent(
      `Dear ${guest.name},\n\nWe warmly invite you to celebrate our special wedding day with us!\n\nPlease open your personalized digital invitation here:\n${link}\n\nWith love,\n${coupleSignoff}`
    );

    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  // Delivery status filter: 'all' | 'unsent' | 'sent'
  const [statusFilter, setStatusFilter] = useState<'all' | 'unsent' | 'sent'>('all');

  const totalGuests = guests?.length || 0;
  const sentCount = (guests || []).filter((g) => sentMap[g.id]).length;
  const unsentCount = Math.max(0, totalGuests - sentCount);

  const filteredGuests = (guests || []).filter((g) => {
    // 1. Search text match
    const matchesSearch =
      !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.includes(search);

    if (!matchesSearch) return false;

    // 2. Delivery status filter ('unsent' filters out already sent guests)
    const isSent = !!sentMap[g.id];
    if (statusFilter === 'unsent') return !isSent;
    if (statusFilter === 'sent') return isSent;
    return true;
  });

  // Selection calculations
  const isAllFilteredSelected =
    filteredGuests.length > 0 &&
    filteredGuests.every((g) => selectedGuestIds.has(g.id));

  const isSomeFilteredSelected =
    filteredGuests.some((g) => selectedGuestIds.has(g.id)) && !isAllFilteredSelected;

  const toggleSelectGuest = (guestId: string) => {
    setSelectedGuestIds((prev) => {
      const next = new Set(prev);
      if (next.has(guestId)) {
        next.delete(guestId);
      } else {
        next.add(guestId);
      }
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedGuestIds((prev) => {
        const next = new Set(prev);
        filteredGuests.forEach((g) => next.delete(g.id));
        return next;
      });
    } else {
      setSelectedGuestIds((prev) => {
        const next = new Set(prev);
        filteredGuests.forEach((g) => next.add(g.id));
        return next;
      });
    }
  };

  const selectAllUnsentFiltered = () => {
    setSelectedGuestIds((prev) => {
      const next = new Set(prev);
      filteredGuests.filter((g) => !sentMap[g.id]).forEach((g) => next.add(g.id));
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedGuestIds(new Set());
  };

  // Open Multi-Send Modal
  const handleOpenSendModal = () => {
    if (!isApproved) return;
    // If no guests selected yet, default to all unsent guests (or all guests if none unsent)
    if (selectedGuestIds.size === 0) {
      const unsent = (guests || []).filter((g) => !sentMap[g.id]);
      const target = unsent.length > 0 ? unsent : (guests || []);
      if (target.length === 0) return;
      setSelectedGuestIds(new Set(target.map((g) => g.id)));
    }
    setSendQueueIndex(0);
    setIsSendModalOpen(true);
  };

  // Selected guests list array
  const selectedGuestsList = useMemo(() => {
    return (guests || []).filter((g) => selectedGuestIds.has(g.id));
  }, [guests, selectedGuestIds]);

  const currentQueueGuest = selectedGuestsList[sendQueueIndex] || null;
  const isQueueFinished = selectedGuestsList.length > 0 && sendQueueIndex >= selectedGuestsList.length;

  // Bulk copy operations
  const handleCopyAllMessages = async () => {
    const coupleSignoff = user?.brideName
      ? `${user.brideName} & ${user.groomName}`
      : 'The Happy Couple';

    const text = selectedGuestsList
      .map((g) => {
        const link = getInvitationUrl(g.token);
        return `Dear ${g.name},\n\nWe warmly invite you to celebrate our special wedding day with us!\n\nPlease open your personalized digital invitation here:\n${link}\n\nWith love,\n${coupleSignoff}`;
      })
      .join('\n\n' + '─'.repeat(30) + '\n\n');

    const ok = await copyToClipboard(text);
    if (ok) {
      setBulkCopiedType('messages');
      setTimeout(() => setBulkCopiedType(null), 3000);
    }
  };

  const handleCopyAllLinks = async () => {
    const text = selectedGuestsList
      .map((g) => `${g.name} (${g.phone}): ${getInvitationUrl(g.token)}`)
      .join('\n');

    const ok = await copyToClipboard(text);
    if (ok) {
      setBulkCopiedType('links');
      setTimeout(() => setBulkCopiedType(null), 3000);
    }
  };

  const handleMarkAllSelectedSent = (markAsSent: boolean) => {
    setSentMap((prev) => {
      const updated = { ...prev };
      selectedGuestsList.forEach((g) => {
        updated[g.id] = markAsSent;
      });
      try {
        localStorage.setItem('wedding_guests_sent_map', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <div className="min-h-screen-dvh bg-sand-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation back */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-obsidian transition-colors min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-fluid-h1 font-serif font-bold text-obsidian tracking-tight">
              {user?.brideName ? `${user.brideName} & ${user.groomName}'s Guest List` : 'Guest List & WhatsApp Invites'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Send personalized invitation links to guests individually or all at once.
            </p>
          </div>

          {/* Action buttons (Disabled if user hasn't bought/activated a template) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Send All / Send Selected Button */}
            {/* <button
              onClick={handleOpenSendModal}
              disabled={!isApproved || totalGuests === 0}
              title={
                !isApproved
                  ? 'Locked until your template order is approved'
                  : totalGuests === 0
                  ? 'Add guests first before sending'
                  : 'Send invitations to selected guests or all guests'
              }
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors min-h-[44px] ${
                !isApproved || totalGuests === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                  : selectedGuestIds.size > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              <Send className="h-4 w-4" />
              <span>
                {selectedGuestIds.size > 0
                  ? `Send Selected (${selectedGuestIds.size})`
                  : 'Send All Invites'}
              </span>
            </button> */}

            <button
              onClick={handleOpenSingleModal}
              disabled={!isApproved}
              title={
                !hasAnyOrder
                  ? 'Please purchase a wedding template to unlock adding guests'
                  : !isApproved
                  ? 'Locked until your template order is approved by admin'
                  : 'Add Guest'
              }
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors min-h-[44px] ${
                !isApproved
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                  : 'bg-slate-900 hover:bg-black text-white'
              }`}
            >
              {!isApproved ? (
                <Lock className="h-4 w-4 text-slate-400" />
              ) : (
                <UserPlus className="h-4 w-4 text-gold-400" />
              )}
              <span>Add Guest</span>
            </button>

            <button
              onClick={handleOpenBulkModal}
              disabled={!isApproved}
              title={
                !hasAnyOrder
                  ? 'Please purchase a wedding template to unlock adding guests'
                  : !isApproved
                  ? 'Locked until your template order is approved by admin'
                  : 'Bulk Paste'
              }
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold shadow-2xs transition-colors min-h-[44px] ${
                !isApproved
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed shadow-none'
                  : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
              }`}
            >
              {!isApproved ? (
                <Lock className="h-4 w-4 text-slate-400" />
              ) : (
                <FileText className="h-4 w-4 text-gold-600" />
              )}
              <span>Bulk Paste</span>
            </button>
          </div>
        </div>

        {/* Notice Banner: If user hasn't bought a template yet */}
        {!ordersLoading && !hasAnyOrder && (
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-amber-100 text-amber-600 p-2 shrink-0 mt-0.5">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-amber-900">
                  Template Purchase Required
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed max-w-xl">
                  You haven't bought a wedding template yet. The Add Guest button will automatically unlock once you purchase a template and your order is approved.
                </p>
              </div>
            </div>

            <Link
              to="/themes"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 transition-colors min-h-[40px]"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Browse Themes</span>
            </Link>
          </div>
        )}

        {/* Notice Banner: If user placed an order awaiting admin approval */}
        {!ordersLoading && hasAnyOrder && !isApproved && (
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-amber-100 text-amber-600 p-2 shrink-0 mt-0.5">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-amber-900">
                  Payment Verification Pending
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed max-w-xl">
                  Your template order is awaiting admin verification. The Add Guest button will automatically unlock as soon as your bank slip is approved.
                </p>
              </div>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 transition-colors min-h-[40px]"
            >
              <span>View Order Status</span>
              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
            </Link>
          </div>
        )}

        {/* TEMPLATE CHOOSER CARD (when user has bought > 1 template) */}
        {hasMultipleTemplates && (
          <div className="bg-white border-2 border-gold-300/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gold-50 text-gold-700 shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-serif font-bold text-obsidian tracking-tight">
                      Choose Active Invitation Template
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold-100 text-gold-800 font-semibold">
                      {approvedTemplates.length} Themes Owned
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select which template will open when guests click your copied links or WhatsApp invites.
                  </p>
                </div>
              </div>

              {activeSelectedTemplate && (
                <Link
                  to={`/preview/${activeSelectedTemplate.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sand-50 hover:bg-sand-100 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs shrink-0 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-gold-600" />
                  <span>Preview &ldquo;{activeSelectedTemplate.name}&rdquo;</span>
                </Link>
              )}
            </div>

            {/* Template options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {approvedTemplates.map((template) => {
                const isSelected = (selectedTemplateKey || approvedTemplates[0].key) === template.key;
                return (
                  <button
                    key={template.key}
                    type="button"
                    onClick={() => handleSelectTemplate(template.key)}
                    className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 relative cursor-pointer ${
                      isSelected
                        ? 'border-gold-600 bg-gold-50/30 ring-2 ring-gold-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'border-gold-600 bg-gold-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-obsidian truncate">
                          {template.name}
                        </h4>
                        {isSelected && (
                          <span className="text-[10px] font-semibold text-gold-700 bg-gold-100 px-1.5 py-0.5 rounded-md">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 capitalize mt-0.5 truncate">
                        Theme: {template.key.replace('-', ' ')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-sand-50/80 rounded-xl px-3.5 py-2 text-[11px] text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-200/60">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>
                  All copied links and WhatsApp invites will open in <strong>{activeSelectedTemplate?.name}</strong>.
                </span>
              </span>
              <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">
                ?template={selectedTemplateKey || approvedTemplates[0]?.key}
              </span>
            </div>
          </div>
        )}

        {/* Active Guest Manager Content */}
        <div className="space-y-4">
          {/* Stats, Filter & Search Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
            {/* Top row: Summary stats + Search bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filter Pills / Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-white text-obsidian shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All Guests ({totalGuests})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('unsent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'unsent'
                      ? 'bg-amber-500 text-white shadow-2xs font-bold'
                      : 'text-amber-800 hover:bg-amber-100/60'
                  }`}
                  title="Show only guests who haven't received their link yet"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Unsent / Pending</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      statusFilter === 'unsent'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-100 text-amber-900 font-bold'
                    }`}
                  >
                    {unsentCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('sent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'sent'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'text-emerald-800 hover:bg-emerald-100/60'
                  }`}
                  title="Show guests whose links have already been sent"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Sent</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      statusFilter === 'sent'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-100 text-emerald-900 font-bold'
                    }`}
                  >
                    {sentCount}
                  </span>
                </button>
              </div>

              {/* Search input with clear button */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search guest or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-gold-500 min-h-[40px]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-md"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Status Bar / Info Banner */}
            {statusFilter === 'unsent' && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-3.5 py-2 text-xs text-amber-800 flex items-center justify-between gap-2 animate-in fade-in duration-150">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    Showing <strong>{filteredGuests.length} unsent {filteredGuests.length === 1 ? 'guest' : 'guests'}</strong> who haven't received their invitation link yet.
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className="text-xs font-semibold text-amber-900 hover:underline shrink-0 cursor-pointer"
                >
                  Show All ({totalGuests})
                </button>
              </div>
            )}

            {statusFilter === 'sent' && (
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-3.5 py-2 text-xs text-emerald-800 flex items-center justify-between gap-2 animate-in fade-in duration-150">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Showing <strong>{filteredGuests.length} invited {filteredGuests.length === 1 ? 'guest' : 'guests'}</strong> whose invitations have already been sent.
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className="text-xs font-semibold text-emerald-900 hover:underline shrink-0 cursor-pointer"
                >
                  Show All ({totalGuests})
                </button>
              </div>
            )}
          </div>

          {/* Guest List */}
          {guestsLoading ? (
            <GuestSkeleton />
          ) : filteredGuests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-2xs">
              {statusFilter === 'unsent' && totalGuests > 0 ? (
                <div className="space-y-3 py-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-obsidian">All Invitations Sent! 🎉</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Great job! You have sent digital invitation links to all {totalGuests} guests on your list.
                    </p>
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors min-h-[40px] cursor-pointer"
                    >
                      View All Guests ({totalGuests})
                    </button>
                  </div>
                </div>
              ) : statusFilter === 'sent' && totalGuests > 0 ? (
                <div className="space-y-3 py-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Clock className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-obsidian">No Invitations Sent Yet</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      You haven't marked any invitations as sent yet. Switch to "Unsent" to start inviting your guests!
                    </p>
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('unsent')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors min-h-[40px] cursor-pointer"
                    >
                      View Unsent Guests ({unsentCount})
                    </button>
                  </div>
                </div>
              ) : search ? (
                <div className="space-y-3 py-2">
                  <Search className="mx-auto h-10 w-10 text-slate-300" />
                  <div>
                    <h4 className="text-sm font-bold text-obsidian">No Matching Guests</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No guests match "{search}"
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-sand-50 text-xs font-semibold transition-colors min-h-[40px] cursor-pointer"
                  >
                    Clear Search Filter
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Users className="mx-auto h-10 w-10 text-slate-300" />
                  <div>
                    <h4 className="text-sm font-bold text-obsidian">No Guests Found</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {!isApproved
                        ? 'Please buy and activate a wedding template to unlock adding guests and sending invites.'
                        : 'Add individual guests or paste your entire list at once!'}
                    </p>
                  </div>
                  {!search && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    onClick={handleOpenSingleModal}
                    disabled={!isApproved}
                    title={
                      !hasAnyOrder
                        ? 'Please purchase a wedding template to unlock adding guests'
                        : !isApproved
                        ? 'Locked until your template order is approved by admin'
                        : 'Add First Guest'
                    }
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors min-h-[44px] ${
                      !isApproved
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                        : 'bg-slate-900 hover:bg-black text-white'
                    }`}
                  >
                    {!isApproved ? (
                      <Lock className="h-4 w-4 text-slate-400" />
                    ) : (
                      <UserPlus className="h-4 w-4 text-gold-400" />
                    )}
                    <span>Add First Guest</span>
                  </button>
                  <button
                    onClick={handleOpenBulkModal}
                    disabled={!isApproved}
                    title={
                      !hasAnyOrder
                        ? 'Please purchase a wedding template to unlock adding guests'
                        : !isApproved
                        ? 'Locked until your template order is approved by admin'
                        : 'Paste Guest Numbers'
                    }
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-2xs transition-colors min-h-[44px] ${
                      !isApproved
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed shadow-none'
                        : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    {!isApproved ? (
                      <Lock className="h-4 w-4 text-slate-400" />
                    ) : (
                      <FileText className="h-4 w-4 text-gold-600" />
                    )}
                    <span>Paste Guest Numbers</span>
                  </button>
                </div>
              )}
              {!hasAnyOrder && (
                <div className="pt-2">
                  <Link
                    to="/themes"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white text-xs font-semibold shadow-xs transition-colors min-h-[40px]"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Browse & Buy Wedding Themes</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
            <div className="space-y-2.5">
              {filteredGuests.map((guest) => {
                const isSent = !!sentMap[guest.id];
                const isSelected = selectedGuestIds.has(guest.id);

                return (
                  <div
                    key={guest.id}
                    className={`bg-white rounded-2xl border p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'border-gold-500 bg-gold-50/25 ring-1 ring-gold-500/30'
                        : isSent
                        ? 'border-emerald-200/80 bg-emerald-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Guest Selection Checkbox & Guest Info */}
                    <div className="flex items-center gap-3">
                      {/* Checkbox for Multi-Select */}
                      <button
                        type="button"
                        onClick={() => toggleSelectGuest(guest.id)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                            : 'border-slate-300 hover:border-slate-400 bg-white text-transparent'
                        }`}
                        aria-label={isSelected ? `Deselect ${guest.name}` : `Select ${guest.name}`}
                        title={isSelected ? 'Selected' : 'Select for sending'}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-obsidian">{guest.name}</h4>
                          {isSent && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Sent
                            </span>
                          )}
                          {guest.viewedAt && (
                            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                              Opened
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-mono mt-0.5 block">{guest.phone}</span>
                      </div>
                    </div>

                    {/* Action buttons (Toggle Sent, WhatsApp, Copy Link, Preview, Delete) */}
                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                      {/* Toggle Sent Button */}
                      <button
                        type="button"
                        onClick={() => toggleSent(guest.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors min-h-[36px] ${
                          isSent
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-slate-200 bg-sand-50/80 text-slate-600 hover:bg-sand-100'
                        }`}
                        title={isSent ? 'Click to mark as unsent' : 'Click to mark as sent'}
                      >
                        <Check className={`h-3.5 w-3.5 ${isSent ? 'text-emerald-600 stroke-[3]' : 'text-slate-400'}`} />
                        <span>{isSent ? 'Sent' : 'Mark Sent'}</span>
                      </button>

                      {/* Direct WhatsApp Invite */}
                      <a
                        href={getWhatsAppShareUrl(guest)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          if (!isSent) toggleSent(guest.id);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors min-h-[38px]"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>WhatsApp</span>
                      </a>

                      {/* Copy Link */}
                      <button
                        onClick={() => copyInviteLink(guest.token, guest.id)}
                        className="flex items-center justify-center px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-sand-50 text-xs font-semibold transition-colors min-h-[38px]"
                        aria-label="Copy invitation link"
                        title={`Copy invitation link (${activeSelectedTemplate?.name || 'chosen theme'})`}
                      >
                        {copiedId === guest.id ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Check className="h-3.5 w-3.5 stroke-[3]" /> Copied
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy className="h-3.5 w-3.5" /> Link
                          </span>
                        )}
                      </button>

                      {/* Direct Preview Guest Link */}
                      <a
                        href={getInvitationUrl(guest.token)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-gold-600 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                        aria-label={`Preview ${guest.name}'s invitation (${activeSelectedTemplate?.name || 'chosen theme'})`}
                        title={`Preview ${guest.name}'s invitation (${activeSelectedTemplate?.name || 'chosen theme'})`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>

                      {/* Edit Guest Details Button */}
                      <button
                        onClick={() => handleOpenEditModal(guest)}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                        aria-label={`Edit ${guest.name}'s details`}
                        title={`Edit ${guest.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => setGuestToDelete(guest)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                        aria-label={`Remove ${guest.name}`}
                        title={`Remove ${guest.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Modal
          isOpen={isSingleModalOpen}
          onClose={handleCloseSingleModal}
          title="Add Single Wedding Guest"
          description="Enter the guest's name and contact number for personal invitation delivery."
        >
          <form onSubmit={handleSingleSubmit} className="space-y-4 pt-1">
            {singleError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {singleError}
              </div>
            )}
            <div>
              <label htmlFor="guestName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Guest / Family Name
              </label>
              <input
                id="guestName"
                type="text"
                required
                placeholder="E.g., Dr. & Mrs. Wickramasinghe"
                value={singleName}
                onChange={(e) => setSingleName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm focus:outline-none focus:border-gold-500 min-h-[44px]"
              />
            </div>
            <div>
              <label htmlFor="guestPhone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp Phone Number
              </label>
              <input
                id="guestPhone"
                type="tel"
                inputMode="tel"
                required
                placeholder="0771234567 or +94771234567"
                value={singlePhone}
                onChange={(e) => setSinglePhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm focus:outline-none focus:border-gold-500 min-h-[44px]"
              />
            </div>
            {!isApproved && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                Notice: You must have an approved template purchase before adding guests.
              </div>
            )}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isApproved || addGuestMutation.isPending}
                className="w-full flex items-center justify-center rounded-xl bg-slate-900 hover:bg-black text-white py-3 text-sm font-semibold shadow-xs transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isApproved ? 'Template Purchase Required' : addGuestMutation.isPending ? 'Generating Link...' : 'Save Guest & Generate Link'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Bulk Add by Pasting */}
        <Modal
          isOpen={isBulkModalOpen}
          onClose={handleCloseBulkModal}
          title="Bulk Add Guests by Pasting"
          description="Copy and paste a list of names and numbers from Excel, Google Sheets, or WhatsApp."
        >
          <form onSubmit={handleBulkSubmit} className="space-y-4 pt-1">
            {bulkError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {bulkError}
              </div>
            )}
            {!isApproved && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                Notice: You must have an approved template purchase before adding guests.
              </div>
            )}
            <div>
              <label htmlFor="bulkInput" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Paste Guest List (One per line)
              </label>
              <textarea
                id="bulkInput"
                rows={7}
                placeholder={`Kasun & Dinithi, 0771234567\nDr. Sunil Silva, 0719876543\nNimal Perera, +94775554321`}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm font-mono focus:outline-none focus:border-gold-500 shadow-2xs leading-relaxed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Format: <code>Name, Phone</code> or <code>Name Phone</code>
              </span>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isApproved || bulkProcessing || !bulkText.trim()}
                className="w-full flex items-center justify-center rounded-xl bg-slate-900 hover:bg-black text-white py-3 text-sm font-semibold shadow-xs transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isApproved ? 'Template Purchase Required' : bulkProcessing ? 'Importing Guests...' : 'Import & Generate Links'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: SEND ALL / SEND SELECTED INVITATIONS */}
        <Modal
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          title={`Send Invitations (${selectedGuestsList.length} Guests)`}
          description="Send personalized digital invitation links to your selected guests via WhatsApp or bulk copy."
        >
          <div className="space-y-4 pt-1">
            {/* Tab selection */}
            <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSendModalTab('queue')}
                className={`pb-2.5 transition-colors relative cursor-pointer ${
                  sendModalTab === 'queue'
                    ? 'text-emerald-700 border-b-2 border-emerald-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp Queue (1-by-1)</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSendModalTab('bulk')}
                className={`pb-2.5 transition-colors relative cursor-pointer ${
                  sendModalTab === 'bulk'
                    ? 'text-emerald-700 border-b-2 border-emerald-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Copy className="h-4 w-4" />
                  <span>Bulk Copy & Export</span>
                </span>
              </button>
            </div>

            {/* TAB 1: WhatsApp Queue Runner */}
            {sendModalTab === 'queue' && (
              <div>
                {isQueueFinished ? (
                  /* Queue completed */
                  <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
                    <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Check className="h-8 w-8 stroke-[3]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-serif font-bold text-obsidian">
                        All {selectedGuestsList.length} Invites Processed!
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                        You have gone through your selected guest queue. Sent statuses have been updated in your dashboard.
                      </p>
                    </div>
                    <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSendModalOpen(false);
                          clearSelection();
                        }}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors min-h-[44px]"
                      >
                        Done & Close
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendQueueIndex(0)}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors min-h-[44px] flex items-center gap-1.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Restart Queue</span>
                      </button>
                    </div>
                  </div>
                ) : currentQueueGuest ? (
                  /* Active queue guest */
                  <div className="space-y-4">
                    {/* Progress indicator */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span className="font-semibold text-obsidian">
                          Guest {sendQueueIndex + 1} of {selectedGuestsList.length}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {Math.round(((sendQueueIndex) / selectedGuestsList.length) * 100)}% Completed
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.round(((sendQueueIndex) / selectedGuestsList.length) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Current Guest Card */}
                    <div className="bg-sand-50/80 border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-obsidian">{currentQueueGuest.name}</h4>
                          <span className="text-xs font-mono text-slate-500">{currentQueueGuest.phone}</span>
                        </div>
                        {sentMap[currentQueueGuest.id] ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="h-3 w-3" /> Already Sent
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Message preview */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          Personalized Message Preview
                        </label>
                        <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap font-sans">
                          {`Dear ${currentQueueGuest.name},\n\nWe warmly invite you to celebrate our special wedding day with us!\n\nPlease open your personalized digital invitation here:\n${getInvitationUrl(currentQueueGuest.token)}\n\nWith love,\n${user?.brideName ? `${user.brideName} & ${user.groomName}` : 'The Happy Couple'}`}
                        </div>
                      </div>
                    </div>

                    {/* Primary action: Open WhatsApp & Next */}
                    <button
                      type="button"
                      onClick={() => {
                        window.open(getWhatsAppShareUrl(currentQueueGuest), '_blank', 'noopener,noreferrer');
                        if (!sentMap[currentQueueGuest.id]) {
                          toggleSent(currentQueueGuest.id);
                        }
                        setSendQueueIndex((prev) => prev + 1);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition-colors min-h-[48px]"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>Open WhatsApp & Next Guest ➔</span>
                    </button>

                    {/* Secondary Navigation Controls */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        type="button"
                        disabled={sendQueueIndex === 0}
                        onClick={() => setSendQueueIndex((prev) => Math.max(0, prev - 1))}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:hover:text-slate-500 transition-colors py-2 px-2.5 rounded-lg"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!sentMap[currentQueueGuest.id]) {
                              toggleSent(currentQueueGuest.id);
                            }
                            setSendQueueIndex((prev) => prev + 1);
                          }}
                          className="text-slate-600 hover:text-slate-900 py-2 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                          title="Mark this guest as sent and move to next"
                        >
                          Mark Sent & Next
                        </button>

                        <button
                          type="button"
                          onClick={() => setSendQueueIndex((prev) => prev + 1)}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 py-2 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          Skip ➔
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* TAB 2: Bulk Copy & Export */}
            {sendModalTab === 'bulk' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Export all selected invitation messages or links at once to paste into WhatsApp Web, desktop broadcast lists, or spreadsheets.
                </p>

                {/* Bulk Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyAllMessages}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 bg-white hover:bg-sand-50 text-slate-800 text-xs font-semibold shadow-2xs transition-colors min-h-[44px]"
                  >
                    {bulkCopiedType === 'messages' ? (
                      <span className="text-emerald-600 flex items-center gap-1.5">
                        <Check className="h-4 w-4 stroke-[3]" /> All Messages Copied!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Copy className="h-4 w-4 text-gold-600" /> Copy All Messages ({selectedGuestsList.length})
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyAllLinks}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 bg-white hover:bg-sand-50 text-slate-800 text-xs font-semibold shadow-2xs transition-colors min-h-[44px]"
                  >
                    {bulkCopiedType === 'links' ? (
                      <span className="text-emerald-600 flex items-center gap-1.5">
                        <Check className="h-4 w-4 stroke-[3]" /> All Links Copied!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-gold-600" /> Copy Links List ({selectedGuestsList.length})
                      </span>
                    )}
                  </button>
                </div>

                {/* Mark All Sent / Unsent Actions */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500">
                    Update status for all {selectedGuestsList.length} selected guests:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMarkAllSelectedSent(true)}
                      className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium transition-colors"
                    >
                      Mark All as Sent
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkAllSelectedSent(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-sand-50 hover:bg-sand-100 text-slate-700 font-medium transition-colors"
                    >
                      Mark All as Unsent
                    </button>
                  </div>
                </div>

                {/* Selected Guests Summary Preview */}
                <div className="pt-2 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Selected Guests ({selectedGuestsList.length})
                  </span>
                  <div className="max-h-48 overflow-y-auto space-y-1 bg-sand-50/60 p-2.5 rounded-xl border border-slate-200 text-xs">
                    {selectedGuestsList.map((g) => (
                      <div key={g.id} className="flex items-center justify-between py-1 px-2 rounded-lg bg-white border border-slate-100">
                        <span className="font-medium text-obsidian">{g.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-mono text-[11px]">{g.phone}</span>
                          {sentMap[g.id] ? (
                            <span className="text-[10px] text-emerald-600 font-bold">Sent</span>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-medium">Pending</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Modal: Edit Guest Details */}
        <Modal
          isOpen={!!guestToEdit}
          onClose={handleCloseEditModal}
          title="Edit Guest Details"
          description="Update guest name or phone number. Their personalized invitation link remains active."
        >
          {guestToEdit && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-1">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {editError}
                </div>
              )}
              <div>
                <label htmlFor="editGuestName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Guest / Family Name
                </label>
                <input
                  id="editGuestName"
                  type="text"
                  required
                  placeholder="E.g., Dr. & Mrs. Wickramasinghe"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm focus:outline-none focus:border-gold-500 min-h-[44px]"
                />
              </div>
              <div>
                <label htmlFor="editGuestPhone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp Phone Number
                </label>
                <input
                  id="editGuestPhone"
                  type="tel"
                  inputMode="tel"
                  required
                  placeholder="0771234567 or +94771234567"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm focus:outline-none focus:border-gold-500 min-h-[44px]"
                />
              </div>
              <div className="bg-sand-50/80 rounded-xl p-3 border border-slate-200/80 text-xs text-slate-500 flex items-center justify-between gap-2">
                <span className="truncate">Invitation Token:</span>
                <span className="font-mono text-[11px] text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {guestToEdit.token}
                </span>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={updateGuestMutation.isPending}
                  onClick={handleCloseEditModal}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateGuestMutation.isPending}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors min-h-[44px] disabled:opacity-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>{updateGuestMutation.isPending ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* Modal: Customized Delete Guest Confirmation */}
        <Modal
          isOpen={!!guestToDelete}
          onClose={() => {
            if (!deleteMutation.isPending) setGuestToDelete(null);
          }}
          title="Remove Wedding Guest"
          description="Confirm removal of this guest from your digital invitation list."
        >
          {guestToDelete && (
            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm space-y-1.5">
                  <p className="font-bold text-rose-950 text-sm">
                    Are you sure you want to remove this guest?
                  </p>
                  <p className="text-rose-800 leading-relaxed">
                    Removing <strong className="text-rose-950">{guestToDelete.name}</strong> ({guestToDelete.phone}) will immediately deactivate their personalized invitation link.
                  </p>
                  <p className="text-xs text-rose-700">
                    They will no longer be able to open the digital wedding invitation or submit an RSVP.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => setGuestToDelete(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(guestToDelete.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors min-h-[44px]"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{deleteMutation.isPending ? 'Removing...' : 'Remove Guest'}</span>
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
