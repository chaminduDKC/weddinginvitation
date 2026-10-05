import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Image,
  Users,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Save,
  Lock,
  ShoppingBag,
  Shield,
} from 'lucide-react';
import { fetchUserOrders, fetchUserInvitations, saveInvitation } from '../lib/api';
import { OrderTimeline } from '../components/OrderTimeline';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../lib/auth';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch couple's orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: fetchUserOrders,
  });

  const latestOrder = orders?.[0] || null;
  const isApproved = latestOrder?.status === 'APPROVED';

  // Fetch invitation customizations
  const { data: invitations, isLoading: invLoading } = useQuery({
    queryKey: ['user-invitations'],
    queryFn: fetchUserInvitations,
  });

  const existingInv = invitations?.[0] || null;

  // Customizer form state
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [venue, setVenue] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [storyText, setStoryText] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Populate form when data loads
  useEffect(() => {
    if (existingInv) {
      setBrideName(existingInv.user?.brideName || user?.brideName || '');
      setGroomName(existingInv.user?.groomName || user?.groomName || '');
      setVenue(existingInv.venue || '');
      setEventDate(
        existingInv.eventDate
          ? new Date(existingInv.eventDate).toISOString().slice(0, 16)
          : ''
      );
      setHeroImageUrl(existingInv.heroImageUrl || '');
      setStoryText(existingInv.storyText || '');
      setMapUrl(existingInv.mapUrl || '');
    } else if (user) {
      setBrideName(user.brideName || '');
      setGroomName(user.groomName || '');
    }
  }, [existingInv, user]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => saveInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
      setSaveSuccess(true);
      setSaveError('');
      setTimeout(() => setSaveSuccess(false), 4000);
    },
    onError: (err: any) => {
      setSaveError(err.message || 'Failed to save changes');
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!latestOrder) {
      setSaveError('Please select a template and place an order before saving customizations.');
      return;
    }

    saveMutation.mutate({
      templateId: latestOrder.templateId,
      brideName: brideName || undefined,
      groomName: groomName || undefined,
      venue: venue || 'The Kingsbury, Colombo',
      eventDate: eventDate || new Date().toISOString(),
      heroImageUrl: heroImageUrl || undefined,
      storyText: storyText || undefined,
      mapUrl: mapUrl || undefined,
    });
  };

  if (ordersLoading || invLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <DashboardSkeleton />
      </div>
    );
  }

  const coupleTitle = user?.brideName
    ? `${user.brideName} & ${user.groomName}`
    : 'Welcome Couple';

  return (
    <div className="min-h-screen-dvh bg-sand-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Administrator Quick Hub Notice */}
        {user?.role === 'ADMIN' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-200/80 text-amber-900 shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold text-amber-800 tracking-wider">Administrator Mode</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-[10px] font-bold text-amber-900">Admin</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">Template &amp; System Management Active</h3>
                <p className="text-xs text-amber-800">
                  Update template names &amp; thumbnails, review client payment slips, and manage accounts.
                </p>
              </div>
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shrink-0 shadow-xs transition-colors"
            >
              <span>Manage Templates &amp; Admin</span>
              <ArrowRight className="h-3.5 w-3.5 text-gold-400" />
            </Link>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-100 text-gold-600 text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Couple Dashboard
            </div>
            <h1 className="text-fluid-h1 font-sans font-bold text-obsidian tracking-tight">
              {coupleTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Design your invitation details, monitor approval status, and share personalized links with wedding guests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/preview/${latestOrder?.template?.key || 'eternal-noir'}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-obsidian text-xs font-semibold transition-colors min-h-[44px]"
            >
              <Eye className="h-4 w-4 text-gold-600" />
              Preview Invitation
            </Link>
          </div>
        </div>

        {/* Order Status Timeline */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Order & Verification Status</h2>
          <OrderTimeline
            order={latestOrder}
            onReupload={() => {
              if (latestOrder) {
                navigate(`/upload-slip/${latestOrder.templateId}`);
              }
            }}
          />
        </section>

        {/* Quick Hub Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guest List Access Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-sand-100 text-gold-600 w-fit">
                  <Users className="h-5 w-5" />
                </div>
                {isApproved ? (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Ready
                  </span>
                ) : !latestOrder ? (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Template Required
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Locked until approval
                  </span>
                )}
              </div>
              <h3 className="text-base font-sans font-bold text-obsidian">Guest List & WhatsApp Invites</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add your guests, paste phone lists from WhatsApp or Excel, send one-click WhatsApp invitations, and track sent invites so you never message anyone twice.
              </p>
            </div>

            {isApproved ? (
              <Link
                to="/guests"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-black text-white shadow-xs transition-colors min-h-[44px]"
              >
                <Users className="h-4 w-4 text-gold-400" />
                <span>Open Guest List & WhatsApp Invites</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : !latestOrder ? (
              <Link
                to="/themes"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-gold-600 hover:bg-gold-700 text-white shadow-xs transition-colors min-h-[44px]"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Buy a Theme to Unlock Guests</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/guests"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors min-h-[44px]"
              >
                <Lock className="h-4 w-4 text-slate-400" />
                <span>Guest List Locked (Pending Approval)</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            )}
          </div>

          {/* Invitation Live View Card */}
          {/* <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-sand-100 text-gold-600 w-fit">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="text-base font-sans font-bold text-obsidian">Whole-Page Invitation Preview</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Experience your wedding invitation exactly as your guests will on mobile: full screen, opening animation, countdown clock, story chapters, and venue map.
              </p>
            </div>

            <Link
              to={`/preview/${latestOrder?.template?.key || 'eternal-noir'}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sand-100 hover:bg-sand-200 text-obsidian text-xs font-semibold transition-colors min-h-[44px]"
            >
              <span>Open Full Screen Preview</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div> */}
        </div>

        {/* Invitation Customization Form */}
  
      </div>
    </div>
  );
};
