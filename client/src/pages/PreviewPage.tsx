import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  ArrowLeft,
  ShoppingBag,
  Edit3,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  fetchPublicInvitation,
  fetchUserInvitations,
  fetchTemplates,
  fetchUserOrders,
} from '../lib/api';
import { useAuth } from '../lib/auth';
import {
  WeddingInviteData,
  TropicalBlissTemplate,
  ClassicFloralTemplate,
  RoyalVintageTemplate,
  EternalNoirTemplate,
  InvitationOpeningOverlay,
} from '../components/templates';
import { hasSinhala } from '../lib/sinhalaHelper';
import { SinhalaFontKey } from '../lib/fmFontConverter';

export const PreviewPage: React.FC = () => {
  const { token, templateKey } = useParams<{ token?: string; templateKey?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // If viewing via guest token (/i/:token)
  const isGuestView = !!token;

  // Check URL query parameters for explicit template selection (e.g. /i/:token?template=royal-vintage)
  const searchParams = new URLSearchParams(location.search);
  const queryTemplateKey =
    searchParams.get('template') || searchParams.get('t') || undefined;

  // Guest invitation query
  const { data: publicData, isLoading, error } = useQuery({
    queryKey: ['public-invitation', token, queryTemplateKey],
    queryFn: () => fetchPublicInvitation(token!, queryTemplateKey),
    enabled: isGuestView,
  });

  // Logged-in couple's saved invitations
  const { data: userInvitations } = useQuery({
    queryKey: ['user-invitations'],
    queryFn: fetchUserInvitations,
    enabled: !isGuestView && isAuthenticated,
  });

  // Template list for price and key mapping
  const { data: templates } = useQuery({
    queryKey: ['public-templates'],
    queryFn: fetchTemplates,
    enabled: !isGuestView,
  });

  // User orders to check if this theme or wedding package is already bought
  const { data: userOrders } = useQuery({
    queryKey: ['user-orders'],
    queryFn: fetchUserOrders,
    enabled: !isGuestView && isAuthenticated,
  });

  // Draft customization from state or localStorage
  const localDraft = (() => {
    try {
      const saved = localStorage.getItem('wedding_preview_customization');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const previewSource = (location.state as any) || localDraft || null;
  const userSavedInv = userInvitations?.[0];

  // Determine active template key
  const activeKey =
    (isGuestView
      ? (queryTemplateKey || publicData?.templateKey)
      : (templateKey || previewSource?.templateKey || 'eternal-noir')) || 'eternal-noir';

  const matchedTemplate =
    templates?.find((t) => t.key === activeKey) ||
    templates?.[0] || {
      id: 'default',
      key: activeKey,
      name: 'Wedding Theme',
      priceLkr: 6000,
    };

  const isAlreadyBought =
    !isGuestView &&
    isAuthenticated &&
    !!userOrders?.some(
      (o) =>
        ((matchedTemplate?.id !== 'default' && o.templateId === matchedTemplate?.id) ||
          o.template?.key === activeKey ||
          o.templateId === activeKey) &&
        o.status !== 'REJECTED'
    );

  // Language management: support couple's choice or guest toggle
  const initialLanguage: 'en' | 'si' =
    previewSource?.language ||
    publicData?.language ||
    (previewSource?.brideName && hasSinhala(previewSource.brideName)
      ? 'si'
      : publicData?.brideName && hasSinhala(publicData.brideName)
      ? 'si'
      : 'en');

  const [currentLang, setCurrentLang] = useState<'en' | 'si'>(initialLanguage);

  useEffect(() => {
    if (previewSource?.language) {
      setCurrentLang(previewSource.language);
    } else if (publicData?.language) {
      setCurrentLang(publicData.language);
    }
  }, [previewSource?.language, publicData?.language]);

  // Sinhala Font Style preference (FM Abhaya, FM Gemunu, Royal Serif, Modern Sans)
  const selectedFontStyle: SinhalaFontKey =
    previewSource?.fontStyle || publicData?.fontStyle || 'abhaya';

  // Dynamic preview data fallback hierarchy
  const sampleData: WeddingInviteData & { templateId: string; priceLkr: number } = {
    guestName: previewSource?.guestName || (currentLang === 'si' ? 'කමල් සිල්වා' : 'Kamal Silva'),
    brideName:
      previewSource?.brideName ||
      userSavedInv?.user?.brideName ||
      user?.brideName ||
      (currentLang === 'si' ? 'දුල්‍යානා' : 'Dulyana'),
    groomName:
      previewSource?.groomName ||
      userSavedInv?.user?.groomName ||
      user?.groomName ||
      (currentLang === 'si' ? 'තිසුර' : 'Thisura'),
    venue:
      previewSource?.venue ||
      userSavedInv?.venue ||
      (currentLang === 'si' ? 'සිනමන් ග්‍රෑන්ඩ් හෝටලය, කොළඹ' : 'Grand Ballroom, Cinnamon Grand Colombo'),
    eventDate:
      previewSource?.eventDate ||
      userSavedInv?.eventDate ||
      new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    templateKey: activeKey,
    templateId: previewSource?.templateId || matchedTemplate?.id || 'default',
    priceLkr: previewSource?.priceLkr || matchedTemplate?.priceLkr || 6000,
    heroImageUrl:
      previewSource?.heroImageUrl ||
      userSavedInv?.heroImageUrl ||
      null,
    galleryImages:
      previewSource?.galleryImages ||
      userSavedInv?.galleryImages ||
      [],
    storyText:
      previewSource?.storyText ??
      userSavedInv?.storyText ??
      null,
    mapUrl:
      previewSource?.mapUrl ||
      userSavedInv?.mapUrl ||
      'https://maps.google.com/?q=Cinnamon+Grand+Colombo',
    dressCode: previewSource?.dressCode || undefined,
    itinerary: previewSource?.itinerary || undefined,
    entourage: previewSource?.entourage || undefined,
    musicUrl: null,
    musicTitle: null,
    language: currentLang,
    fontStyle: selectedFontStyle,
  };

  const invite: WeddingInviteData = isGuestView
    ? {
        guestName: publicData?.guestName,
        brideName: publicData?.brideName || (currentLang === 'si' ? 'මනාලිය' : 'Bride'),
        groomName: publicData?.groomName || (currentLang === 'si' ? 'මනාලයා' : 'Groom'),
        venue: publicData?.venue || (currentLang === 'si' ? 'මංගල උත්සව ශාලාව' : 'Wedding Venue'),
        eventDate: publicData?.eventDate || new Date().toISOString(),
        templateKey: activeKey,
        heroImageUrl: publicData?.heroImageUrl,
        galleryImages:
          (publicData?.galleryImages && publicData.galleryImages.length > 0)
            ? publicData.galleryImages
            : (previewSource?.galleryImages || []),
        storyText: publicData?.storyText,
        mapUrl: publicData?.mapUrl,
        dressCode: publicData?.dressCode || previewSource?.dressCode || undefined,
        itinerary: publicData?.itinerary || previewSource?.itinerary || undefined,
        entourage: publicData?.entourage || previewSource?.entourage || undefined,
        musicUrl: null,
        musicTitle: null,
        language: currentLang,
        fontStyle: publicData?.fontStyle || selectedFontStyle,
      }
    : sampleData;

  // Authentic Sri Lankan invitation opening screen state
  const [hasOpened, setHasOpened] = useState(false);

  // Guarantee scroll is at the top on initial mount and route changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, token, templateKey]);

  // Guarantee scroll stays at top whenever envelope opens or closes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [hasOpened]);

  const handleOpenInvitation = async () => {
    // Immediately ensure top scroll before opening begins
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Allow the stately 2000ms double door / curtain opening animation to complete smoothly before unmounting
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      setHasOpened(true);
    }, 2100);
  };

  const handleBuyClick = () => {
    localStorage.setItem('wedding_preview_customization', JSON.stringify(sampleData));
    const targetTemplateId = sampleData.templateId || matchedTemplate?.id;

    if (!isAuthenticated) {
      navigate(`/login?redirect=/upload-slip/${targetTemplateId}`);
    } else {
      navigate(`/upload-slip/${targetTemplateId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen-dvh flex items-center justify-center bg-sand-50">
        <div className="text-center space-y-3">
          <Heart className="h-8 w-8 text-gold-600 animate-pulse mx-auto fill-gold-600/30" />
          <p className="font-serif text-sm font-semibold text-obsidian tracking-wide">
            Loading Wedding Invitation...
          </p>
        </div>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen-dvh flex items-center justify-center bg-sand-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-card">
          <h2 className="text-lg font-serif font-bold text-obsidian">Invitation Notice</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            This invitation link is not active yet or has expired. Please contact the couple directly for wedding details.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-charcoal text-white text-xs font-semibold min-h-[44px]"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen-dvh overflow-x-hidden">
      {/* TOP FLOATING ACTION & CONTROL BAR */}
      <header className="fixed top-0 left-0 right-0 z-40 p-3 sm:p-4 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {!isGuestView ? (
            <>
              <Link
                to={`/customize/${activeKey}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 text-xs font-semibold shadow-md transition-transform active:scale-95 min-h-[44px]"
              >
                <Edit3 className="h-4 w-4 text-gold-400" />
                <span className="hidden xs:inline">Edit Details</span>
                <span className="xs:hidden">Edit</span>
              </Link>
              {hasOpened && (
                <button
                  type="button"
                  onClick={() => setHasOpened(false)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 text-xs font-semibold shadow-md transition-transform active:scale-95 min-h-[44px]"
                  title="Preview Opening Screen Animation"
                >
                  <Sparkles className="h-4 w-4 text-gold-400" />
                  <span className="hidden sm:inline">Opening Screen</span>
                  <span className="sm:hidden">Cover</span>
                </button>
              )}
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 text-xs font-semibold shadow-md min-h-[44px]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              )}
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quick Bilingual Switcher */}
         

          {!isGuestView && !isAlreadyBought && (
            <button
              onClick={handleBuyClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-obsidian text-xs font-bold shadow-md transition-transform active:scale-95 min-h-[44px]"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Buy Theme (Rs. {sampleData.priceLkr.toLocaleString()})</span>
            </button>
          )}

          {!isGuestView && isAlreadyBought && (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900/90 hover:bg-black text-white text-xs font-semibold shadow-md transition-transform active:scale-95 min-h-[44px]"
            >
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Dashboard</span>
            </Link>
          )}

        </div>
      </header>

      {/* AUTHENTIC TRADITIONAL SRI LANKAN INVITATION OPENING SCREEN */}
      {!hasOpened && (
        <InvitationOpeningOverlay
          brideName={invite.brideName}
          groomName={invite.groomName}
          guestName={invite.guestName}
          brideNameSi={invite.brideNameSi}
          groomNameSi={invite.groomNameSi}
          guestNameSi={invite.guestNameSi}
          initialLang={currentLang}
          fontStyle={invite.fontStyle || selectedFontStyle}
          onLanguageChange={setCurrentLang}
          onOpen={handleOpenInvitation}
        />
      )}

      {/* DYNAMIC TEMPLATE RENDERER */}
      {activeKey === 'tropical-bliss' && (
        <TropicalBlissTemplate
          data={invite}
          isGuestView={isGuestView}
          hasOpened={true}
          onOpen={handleOpenInvitation}
        />
      )}

      {activeKey === 'classic-floral' && (
        <ClassicFloralTemplate
          data={invite}
          isGuestView={isGuestView}
          hasOpened={true}
          onOpen={handleOpenInvitation}
        />
      )}

      {activeKey === 'royal-vintage' && (
        <RoyalVintageTemplate
          data={invite}
          isGuestView={isGuestView}
          hasOpened={true}
          onOpen={handleOpenInvitation}
        />
      )}

      {(activeKey === 'eternal-noir' ||
        !['modern-minimalist', 'tropical-bliss', 'classic-floral', 'royal-vintage'].includes(
          activeKey
        )) && (
        <EternalNoirTemplate
          data={invite}
          isGuestView={isGuestView}
          hasOpened={true}
          onOpen={handleOpenInvitation}
        />
      )}
    </div>
  );
};

export default PreviewPage;