import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Eye,
  Calendar,
  MapPin,
  Image as ImageIcon,
  User,
  ArrowLeft,
  ShoppingBag,
  UploadCloud,
  Check,
  Crown,
  Palmtree,
  Flower2,
  Users,
  Shirt,
  Clock,
  Heart,
  Plus,
  Trash2,
  Globe,
  Type,
  Copy,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { fetchTemplates, fetchUserOrders } from '../lib/api';
import { useAuth } from '../lib/auth';
import { SinglishInput } from '../components/SinglishInput';
import { singlishToSinhala, containsSinhala } from '../lib/singlishConverter';
import {
  SINHALA_FONTS,
  SinhalaFontKey,
  unicodeToFmAbhaya,
} from '../lib/fmFontConverter';

// Curated luxury preset photos
const PHOTO_PRESETS = [
  {
    label: 'Sunset Beach',
    url: 'https://images.unsplash.com/photo-1617376431454-8195cf1fd668?auto=format&fit=crop&w=1200&q=85',
  },
  {
    label: 'Classic Ballroom',
    url: 'https://images.unsplash.com/photo-1608145640433-937abd82a4e1?auto=format&fit=crop&w=1200&q=85',
  },
  {
    label: 'Garden Romance',
    url: 'https://images.unsplash.com/photo-1784729249196-90f42f34fa08?auto=format&fit=crop&w=1200&q=85',
  },
  {
    label: 'Modern Minimal',
    url: 'https://images.unsplash.com/photo-1627964464837-6328f5931576?auto=format&fit=crop&w=1200&q=85',
  },
];

// Curated Moments Together defaults for Eternal Noir & Classic Floral
export const DEFAULT_MOMENTS_PRESETS = [
  {
    id: 'first-dance',
    label: 'First Dance',
    labelSi: 'පළමු නැටුම',
    url: 'https://images.unsplash.com/photo-1617376431454-8195cf1fd668?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'garden-romance',
    label: 'Garden Romance',
    labelSi: 'උද්‍යාන ප්‍රේමය',
    url: 'https://images.unsplash.com/photo-1627964464837-6328f5931576?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'sunset-beach',
    label: 'Sunset Beach',
    labelSi: 'වෙරළේ සැඳෑව',
    url: 'https://images.unsplash.com/photo-1720960531459-f94a5b5ba17f?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'regal-arch',
    label: 'Floral Nuptial Arch',
    labelSi: 'මල් වියන යට',
    url: 'https://images.unsplash.com/photo-1760172551854-3ef5e0bf186d?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'golden-hour',
    label: 'Golden Hour Silhouette',
    labelSi: 'රන්වන් සැඳෑ සේයාව',
    url: 'https://images.unsplash.com/photo-1688422763790-93430fabf0de?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'candlelit-night',
    label: 'Candlelit Evening',
    labelSi: 'පහන් ආලෝකය',
    url: 'https://images.unsplash.com/photo-1618566864264-fb013f791da4?auto=format&fit=crop&w=800&q=85',
  },
];

export const ThemeCustomizePage: React.FC = () => {
  const { templateKey } = useParams<{ templateKey: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const { data: templates } = useQuery({
    queryKey: ['public-templates'],
    queryFn: fetchTemplates,
  });

  const { data: userOrders } = useQuery({
    queryKey: ['user-orders'],
    queryFn: fetchUserOrders,
    enabled: isAuthenticated,
  });

  const activeTemplate =
    templates?.find((t) => t.key === templateKey) ||
    templates?.[0] || {
      id: 'default',
      key: templateKey || 'eternal-noir',
      name: 'Modern Minimalist',
      priceLkr: 6000,
      description: 'Elegant invitation experience.',
      thumbnailUrl: null,
      isActive: true,
    };

  const matchingOrders =
    isAuthenticated && userOrders
      ? userOrders.filter(
          (o) =>
            (activeTemplate.id !== 'default' && o.templateId === activeTemplate.id) ||
            o.template?.key === activeTemplate.key ||
            o.templateId === activeTemplate.key
        )
      : [];

  const isApproved = matchingOrders.some((o) => o.status === 'APPROVED');
  const isPendingApproval = !isApproved && matchingOrders.some((o) => o.status === 'PENDING');
  const isAlreadyBought = isApproved || isPendingApproval;

  // Check if we have an existing draft in localStorage
  const existingDraft = (() => {
    try {
      localStorage.removeItem("wedding_preview_customization")
      const saved = localStorage.getItem('wedding_preview_customization');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  // Language Selection: 'en' (English) or 'si' (Sinhala with live Singlish converter)
  const [language, setLanguage] = useState<'en' | 'si'>(
    existingDraft?.language || 'en'
  );

  // Sinhala Font Style / FM Font Selection ('abhaya' | 'gemunu' | 'noto-serif' | 'noto-sans')
  const [fontStyle, setFontStyle] = useState<SinhalaFontKey>(
    existingDraft?.fontStyle || 'abhaya'
  );
  const [showFmExport, setShowFmExport] = useState(false);
  const [copiedFmText, setCopiedFmText] = useState(false);

  // Form State
  const [brideName, setBrideName] = useState(
    existingDraft?.brideName || user?.brideName || 'Dulyana'
  );
  const [groomName, setGroomName] = useState(
    existingDraft?.groomName || user?.groomName || 'Thisura'
  );
  const [brideNameSi, setBrideNameSi] = useState(
    existingDraft?.brideNameSi || 'දුල්‍යානා'
  );
  const [groomNameSi, setGroomNameSi] = useState(
    existingDraft?.groomNameSi || 'තිසුර'
  );
  const [receiverName, setReceiverName] = useState(
    existingDraft?.guestName || 'Kamal Silva'
  );
  const [receiverNameSi, setReceiverNameSi] = useState(
    existingDraft?.guestNameSi || 'කමල් සිල්වා'
  );
  const [venue, setVenue] = useState(
    existingDraft?.venue || 'Grand Ballroom, Cinnamon Grand Colombo'
  );

  // Switch language and intelligently convert fields
  const handleLanguageChange = (newLang: 'en' | 'si') => {
    setLanguage(newLang);
    if (newLang === 'si') {
      // Transition to Sinhala
      if (brideName && !containsSinhala(brideName)) {
        setBrideName(singlishToSinhala(brideName));
      } else if (!brideName) {
        setBrideName('දුල්‍යානා');
      }

      if (groomName && !containsSinhala(groomName)) {
        setGroomName(singlishToSinhala(groomName));
      } else if (!groomName) {
        setGroomName('තිසුර');
      }

      if (receiverName && !containsSinhala(receiverName)) {
        setReceiverName(singlishToSinhala(receiverName));
      } else if (!receiverName) {
        setReceiverName('කමල් සිල්වා');
      }

      if (venue && !containsSinhala(venue)) {
        if (venue.includes('Cinnamon') || venue.includes('Grand Ballroom')) {
          setVenue('ග්‍රෑන්ඩ් බෝල්රූම්, සිනමන් ග්‍රෑන්ඩ් කොළඹ');
        } else {
          setVenue(singlishToSinhala(venue));
        }
      }

      if (storyText && storyText.includes('Together with our families')) {
        setStoryText('අපගේ දෙමවුපියන්ගේ ආශිර්වාදය ඇතිව, අපගේ විවාහ මංගල්‍යයට ඔබ සැමට ඉතා ආදරයෙන් ආරාධනා කර සිටිමු.');
      } else if (storyText && !containsSinhala(storyText)) {
        setStoryText(singlishToSinhala(storyText));
      }

      if (dressCode && !containsSinhala(dressCode)) {
        setDressCode('සාම්ප්‍රදායික හෝ විධිමත් ඇඳුමින් සැරසී පැමිණෙන්න');
      }
    } else {
      // Transition to English
      if (brideName === 'දුල්‍යානා' || !brideName) setBrideName('Dulyana');
      if (groomName === 'තිසුර' || !groomName) setGroomName('Thisura');
      if (receiverName === 'කමල් සිල්වා' || !receiverName) setReceiverName('Kamal Silva');
      if (venue === 'ග්‍රෑන්ඩ් බෝල්රූම්, සිනමන් ග්‍රෑන්ඩ් කොළඹ') setVenue('Grand Ballroom, Cinnamon Grand Colombo');
      if (storyText.includes('අපගේ දෙමවුපියන්ගේ')) {
        setStoryText('Together with our families, we joyfully invite you to celebrate our love and begin this new journey together.');
      }
      if (dressCode.includes('සාම්ප්‍රදායික')) {
        setDressCode('Formal / Black Tie');
      }
    }
  };

  const defaultDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
  const [eventDate, setEventDate] = useState(
    existingDraft?.eventDate
      ? new Date(existingDraft.eventDate).toISOString().slice(0, 16)
      : defaultDate
  );

  const [heroImageUrl, setHeroImageUrl] = useState(
    existingDraft?.heroImageUrl || PHOTO_PRESETS[0].url
  );
  const [mapUrl, setMapUrl] = useState(
    existingDraft?.mapUrl || 'https://maps.google.com/?q=Cinnamon+Grand+Colombo'
  );

  // Extended Tier-Specific State
  const [storyText, setStoryText] = useState(
    existingDraft?.storyText ||
      'Together with our families, we joyfully invite you to celebrate our love and begin this new journey together.'
  );

  const [dressCode, setDressCode] = useState(
    existingDraft?.dressCode || ''
  );

  const [itinerary, setItinerary] = useState<Array<{ time: string; title: string; desc?: string }>>(
    existingDraft?.itinerary || [
      { time: '03:30 PM', title: 'Auspicious Ceremony / Vows', desc: 'Traditional blessing' },
      { time: '05:00 PM', title: 'Sunset Cocktails & Refreshments', desc: 'Canapés & celebration' },
      { time: '07:00 PM', title: 'Dinner Reception & Dancing', desc: 'Banquet feast & music' },
    ]
  );

  const [entourage, setEntourage] = useState(
    existingDraft?.entourage || {
      parentsOfBride: 'Mr. & Mrs. Wijesekara',
      parentsOfGroom: 'Mr. & Mrs. Jayasundara',
      maidOfHonor: 'Chamari Perera',
      bestMan: 'Nishan Fernando',
    }
  );

  // Moments Together Gallery State (Eternal Noir & Classic Floral)
  const [galleryImages, setGalleryImages] = useState<string[]>(
    Array.isArray(existingDraft?.galleryImages) && existingDraft.galleryImages.length > 0
      ? existingDraft.galleryImages
      : [DEFAULT_MOMENTS_PRESETS[0].url, DEFAULT_MOMENTS_PRESETS[1].url]
  );
  const [customMomentUrl, setCustomMomentUrl] = useState<string>('');

  // Sync user names if logged in
  useEffect(() => {
    if (user) {
      if (!existingDraft?.brideName && user.brideName) setBrideName(user.brideName);
      if (!existingDraft?.groomName && user.groomName) setGroomName(user.groomName);
    }
  }, [user]);

  // Handle image upload from user device
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setHeroImageUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddItineraryItem = () => {
    setItinerary([...itinerary, { time: '06:00 PM', title: 'New Event Activity', desc: '' }]);
  };

  const handleRemoveItineraryItem = (index: number) => {
    setItinerary(itinerary.filter((_, i) => i !== index));
  };

  // Moments Together Gallery Handlers
  const handleTogglePresetMoment = (url: string) => {
    if (galleryImages.includes(url)) {
      setGalleryImages(galleryImages.filter((img) => img !== url));
    } else {
      setGalleryImages([...galleryImages, url]);
    }
  };

  const handleRemoveMomentImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleAddCustomMomentUrl = () => {
    const trimmed = customMomentUrl.trim();
    if (!trimmed) return;
    if (!galleryImages.includes(trimmed)) {
      setGalleryImages([...galleryImages, trimmed]);
    }
    setCustomMomentUrl('');
  };

  const handleMomentsFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          const dataUrl = event.target.result;
          setGalleryImages((prev) => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleResetMomentsToDefault = () => {
    setGalleryImages([DEFAULT_MOMENTS_PRESETS[0].url, DEFAULT_MOMENTS_PRESETS[1].url]);
  };

  const constructPayload = () => {
    const parsedDate = eventDate ? new Date(eventDate).toISOString() : new Date().toISOString();
    const isSinhala = language === 'si';

    const finalBride = isSinhala
      ? (brideName ? singlishToSinhala(brideName) : 'දුල්‍යානා')
      : (brideName.trim() || 'Dulyana');
    const finalGroom = isSinhala
      ? (groomName ? singlishToSinhala(groomName) : 'තිසුර')
      : (groomName.trim() || 'Thisura');
    const finalGuest = isSinhala
      ? (receiverName ? singlishToSinhala(receiverName) : 'කමල් සිල්වා')
      : (receiverName.trim() || 'Kamal Silva');
    const finalVenue = isSinhala
      ? (venue ? singlishToSinhala(venue) : 'ග්‍රෑන්ඩ් බෝල්රූම්, කොළඹ')
      : (venue.trim() || 'Grand Ballroom, Colombo');
    const finalStory = isStorySupported
      ? (isSinhala && storyText ? singlishToSinhala(storyText) : storyText.trim() || null)
      : null;
    const finalDress = isDressCodeSupported
      ? (isSinhala && dressCode ? singlishToSinhala(dressCode) : dressCode.trim() || null)
      : null;

    const finalEntourage = entourage && isEntourageSupported
      ? {
          parentsOfBride: isSinhala && entourage.parentsOfBride ? singlishToSinhala(entourage.parentsOfBride) : entourage.parentsOfBride,
          parentsOfGroom: isSinhala && entourage.parentsOfGroom ? singlishToSinhala(entourage.parentsOfGroom) : entourage.parentsOfGroom,
          maidOfHonor: isSinhala && entourage.maidOfHonor ? singlishToSinhala(entourage.maidOfHonor) : entourage.maidOfHonor,
          bestMan: isSinhala && entourage.bestMan ? singlishToSinhala(entourage.bestMan) : entourage.bestMan,
        }
      : undefined;

    const finalItinerary = isItinerarySupported
      ? itinerary.map((item) => ({
          ...item,
          title: isSinhala && item.title ? singlishToSinhala(item.title) : item.title,
          desc: isSinhala && item.desc ? singlishToSinhala(item.desc) : item.desc,
        }))
      : undefined;

    return {
      templateKey: activeTemplate.key,
      templateId: activeTemplate.id,
      templateName: activeTemplate.name,
      priceLkr: activeTemplate.priceLkr,
      language,
      fontStyle: fontStyle || 'abhaya',
      brideName: finalBride,
      groomName: finalGroom,
      brideNameSi: isSinhala ? finalBride : (brideNameSi.trim() || undefined),
      groomNameSi: isSinhala ? finalGroom : (groomNameSi.trim() || undefined),
      guestName: finalGuest,
      guestNameSi: isSinhala ? finalGuest : (receiverNameSi.trim() || undefined),
      venue: finalVenue,
      eventDate: parsedDate,
      heroImageUrl: heroImageUrl || PHOTO_PRESETS[0].url,
      mapUrl: mapUrl.trim() || null,
      storyText: finalStory,
      dressCode: finalDress,
      itinerary: finalItinerary,
      entourage: finalEntourage,
      musicUrl: null,
      musicTitle: null,
      galleryImages:
        galleryImages.length > 0
          ? galleryImages
          : [DEFAULT_MOMENTS_PRESETS[0].url, DEFAULT_MOMENTS_PRESETS[1].url],
    };
  };

  const handlePreview = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const payload = constructPayload();
    localStorage.setItem('wedding_preview_customization', JSON.stringify(payload));
    navigate(`/preview/${activeTemplate.key}`, { state: payload });
  };

  const handleBuyNow = () => {
    const payload = constructPayload();
    localStorage.setItem('wedding_preview_customization', JSON.stringify(payload));

    if (!isAuthenticated) {
      navigate('/login?redirect=/upload-slip/' + activeTemplate.id);
    } else {
      navigate(`/upload-slip/${activeTemplate.id}`);
    }
  };

  // Tier flags
  const isBasic = activeTemplate.key === 'modern-minimalist';
  const isTropical = activeTemplate.key === 'tropical-bliss';
  const isFloral = activeTemplate.key === 'classic-floral';
  const isRoyal = activeTemplate.key === 'royal-vintage';
  const isNoir = activeTemplate.key === 'eternal-noir';

  const isStorySupported = isFloral || isRoyal || isNoir;
  const isDressCodeSupported = isTropical || isNoir;
  const isItinerarySupported = isTropical || isNoir;
  const isEntourageSupported = isRoyal;
  const isGallerySupported = isNoir || isFloral;

  return (
    <div className="min-h-screen-dvh bg-sand-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation back to Catalog */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-obsidian transition-colors min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Themes
        </Link>

        {/* Page Heading */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-100 text-gold-600 text-xs font-semibold">
            Customize Your Wedding Invitation
          </div>
          <h1 className="text-fluid-h1 font-serif font-bold text-obsidian tracking-tight">
            Invitation Details &amp; Options
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Each template provides options and curated soundtrack tailored to its tier. Customize your details below and press{' '}
            <strong className="text-slate-800 font-semibold">Preview Wedding Invitation</strong> to see your design live.
          </p>
        </div>

        {/* Selected Theme Switcher Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
              <img
                src={
                  activeTemplate.thumbnailUrl ||
                  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80'
                }
                alt={activeTemplate.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-bold text-gold-600 tracking-wider">
                  Selected Theme
                </span>
                {isApproved && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Purchased
                  </span>
                )}
                {isPendingApproval && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-600" />
                    Pending Admin Approval
                  </span>
                )}
              </div>
              <h3 className="text-base font-serif font-bold text-obsidian">
                {activeTemplate.name}
              </h3>
              <span className="text-xs font-semibold text-slate-700">
                {isApproved
                  ? 'Owned Theme'
                  : isPendingApproval
                  ? 'Slip Submitted • Waiting for Approval'
                  : `Rs. ${activeTemplate.priceLkr.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Theme Switcher Dropdown */}
          {templates && templates.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">Switch Theme:</span>
              <select
                value={activeTemplate.key}
                onChange={(e) => navigate(`/customize/${e.target.value}`)}
                className="text-xs rounded-xl border border-slate-300 py-2 px-3 bg-white text-obsidian focus:outline-none focus:border-gold-500 min-h-[40px]"
              >
                {templates.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.name} (Rs. {t.priceLkr.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* TIER HIGHLIGHT BANNER */}
        <div
          className={`p-5 rounded-2xl border ${
            isBasic
              ? 'bg-stone-50 border-stone-200 text-stone-800'
              : isTropical
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : isFloral
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : isRoyal
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-purple-50 border-purple-200 text-purple-950'
          }`}
        >
          <div className="flex items-start gap-3">
            {isBasic && <Check className="h-5 w-5 text-stone-600 mt-0.5 shrink-0" />}
            {isTropical && <Palmtree className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />}
            {isFloral && <Flower2 className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />}
            {isRoyal && <Crown className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />}
            {isNoir && <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider">
                  {isBasic && 'Basic Tier • Modern Minimalist'}
                  {isTropical && 'Standard Destination Tier • Tropical Bliss'}
                  {isFloral && 'Deluxe Romance Tier • Classic Floral'}
                  {isRoyal && 'Premium Royal Tier • Royal Vintage'}
                  {isNoir && 'Ultra-Luxury Editorial Tier • Eternal Noir'}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                  Rs. {activeTemplate.priceLkr.toLocaleString()}
                </span>
              </div>
              <p className="text-xs mt-1 text-slate-600 leading-relaxed">
                {isBasic &&
                  'Includes core wedding details, ceremony card, countdown clock, Google Maps link, and direct instant access.'}
                {isTropical &&
                  'Includes destination ceremony card, wedding day itinerary schedule, island dress code tips, and countdown clock.'}
                {isFloral &&
                  'Includes romantic botanical wreath styling, falling petals, love story narrative, and couple moments photo gallery.'}
                {isRoyal &&
                  'Includes interactive royal wax monogram seal opening, bridal party & entourage honors, and royal banquet schedule.'}
                {isNoir &&
                  'Full Luxury Suite: Sacred Lotus & Moonstone celestial seal, split-character motion, love story chapters, curated moments archive, and black-tie concierge.'}
              </p>
            </div>
          </div>
        </div>

        {/* Customization Form */}
        <form onSubmit={handlePreview} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card space-y-8">
          {/* LANGUAGE SELECTOR */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-gold-300/80 bg-gradient-to-br from-amber-50/70 via-sand-50/60 to-white space-y-3.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gold-500/10 text-gold-600 border border-gold-500/20">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-obsidian flex items-center gap-2">
                    <span>Invitation Language</span>
                    <span className="text-slate-400 font-normal">/</span>
                    <span className="font-sinhala text-sm text-gold-700">භාෂාව තෝරන්න</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Select English or Sinhala. When Sinhala is selected, Singlish auto-conversion turns your phonetic typing into Sinhala script!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  language === 'en'
                    ? 'border-gold-500 bg-white shadow-xs ring-2 ring-gold-400/25'
                    : 'border-slate-200 bg-white/70 hover:bg-white text-slate-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    language === 'en' ? 'border-gold-600 bg-gold-600' : 'border-slate-300'
                  }`}
                >
                  {language === 'en' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-obsidian flex items-center gap-1.5">
                    <span className="text-base">🇬🇧</span>
                    <span>English Invitation</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Standard English letters with no typing interference 
                  </span>
                </div>
              </button>

              <button
              disabled           
                type="button"
                onClick={() => handleLanguageChange('si')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  language === 'si'
                    ? 'border-gold-500 bg-white shadow-xs ring-2 ring-gold-400/25'
                    : 'border-slate-200 bg-white/70 hover:bg-white text-slate-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    language === 'si' ? 'border-gold-600 bg-gold-600' : 'border-slate-300'
                  }`}
                >
                  {language === 'si' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-obsidian flex items-center gap-1.5">
                    <span className="text-base">🇱🇰</span>
                    <span className="font-sinhala text-[14px]">සිංහල ආරාධනා පත්‍රය</span>
                  </div>
                  <span className="text-[11px] text-amber-700 font-semibold block">
                    Singlish to Sinhala auto-convert enabled <br /> <span className='text-red-500'>(Currently Unavailable)</span>
                  </span>
                </div>
              </button>
            </div>

            
          </div>

          {/* SINHALA TYPOGRAPHY & FM FONT STYLE CHOOSER */}
          {language === 'si' && (
            <div className="p-4 sm:p-5 rounded-2xl border-2 border-gold-300/80 bg-gradient-to-br from-amber-50/70 via-sand-50/50 to-white space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gold-500/10 text-gold-600 border border-gold-500/20">
                    <Type className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-obsidian flex items-center gap-2">
                      <span>Sinhala Typography / Font Style</span>
                      <span className="text-slate-400 font-normal">/</span>
                      <span className="font-sinhala text-sm text-gold-700">අකුරු මෝස්තරය තෝරන්න</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Choose your preferred Sinhala typeface. Includes authentic FM Abhaya and FM Gemunu remasters by Pushpananda Ekanayake.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1 rounded-full bg-amber-100/90 border border-amber-300/80 text-[10px] font-bold text-amber-800">
                  <Sparkles className="h-3 w-3 text-gold-600" />
                  <span>FM Fonts Supported</span>
                </div>
              </div>

              {/* 4 Typography Choice Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {SINHALA_FONTS.map((font) => {
                  const isSelected = fontStyle === font.key;
                  const sampleBride = brideName ? (containsSinhala(brideName) ? brideName : singlishToSinhala(brideName)) : 'දුල්‍යානා';
                  const sampleGroom = groomName ? (containsSinhala(groomName) ? groomName : singlishToSinhala(groomName)) : 'තිසුර';

                  return (
                    <button
                      key={font.key}
                      type="button"
                      onClick={() => setFontStyle(font.key)}
                      className={`relative flex flex-col justify-between p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-gold-500 bg-white shadow-sm ring-2 ring-gold-400/30'
                          : 'border-slate-200 bg-white/70 hover:bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="space-y-2.5 w-full">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-gold-600 bg-gold-600' : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-obsidian">
                              {font.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sand-100 text-slate-600">
                            {font.badge.split('•')[0].trim()}
                          </span>
                        </div>

                        {/* Real-time typography sample rendered in this font */}
                        <div className={`p-3 rounded-lg bg-amber-50/50 border border-amber-200/50 ${font.cssClass}`}>
                          <div className="text-lg sm:text-xl font-bold text-obsidian tracking-wide leading-tight">
                            {sampleBride} සහ {sampleGroom}
                          </div>
                          <div className="text-xs text-amber-800/80 mt-1 leading-snug">
                            අපගේ විවාහ මංගල්‍යයට සාදරයෙන් ඇරයුම් කරමු
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {font.descriptionSi}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* FM Font Photoshop / Print Export Utility */}
              <div className="pt-2 border-t border-amber-200/60">
                <button
                  type="button"
                  onClick={() => setShowFmExport(!showFmExport)}
                  className="flex items-center justify-between w-full text-left text-xs font-semibold text-amber-900 hover:text-amber-950 transition-colors py-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-gold-600" />
                    <span>මුද්‍රිත කාඩ්පත් හෝ Photoshop සඳහා FM අකුරු කේතය (Export for FM Fonts Print)</span>
                  </span>
                  <span className="text-[11px] text-amber-700 underline font-normal">
                    {showFmExport ? 'වසන්න (Hide)' : 'පෙන්වන්න (Show)'}
                  </span>
                </button>

                {showFmExport && (
                  <div className="mt-3 p-3.5 rounded-xl bg-white border border-amber-200/90 space-y-2.5">
                    <div className="text-[11px] text-slate-600 leading-relaxed">
                      Adobe Photoshop, Illustrator හෝ InDesign මගින් මංගල කාඩ්පත් මුද්‍රණය කිරීමට අවශ්‍ය නම්, පහත FM අකුරු කේතය කොපි කරගන්න:
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs break-all select-all">
                      {unicodeToFmAbhaya(
                        `${brideName ? (containsSinhala(brideName) ? brideName : singlishToSinhala(brideName)) : 'දුල්‍යානා'} iy ${groomName ? (containsSinhala(groomName) ? groomName : singlishToSinhala(groomName)) : 'තිසුර'} - wmf.a újdy ux.,Hhg idorfhka we/hqï`
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400">
                        Paste into Photoshop with FM-Arjuna, FM-Bindumathi, FM-Emanee, FM-Rajantha, or FM-Abhaya font selected
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const fmText = unicodeToFmAbhaya(
                            `${brideName ? (containsSinhala(brideName) ? brideName : singlishToSinhala(brideName)) : 'දුල්‍යානා'} iy ${groomName ? (containsSinhala(groomName) ? groomName : singlishToSinhala(groomName)) : 'තිසුර'} - wmf.a újdy ux.,Hhg idorfhka we/hqï`
                          );
                          navigator.clipboard.writeText(fmText);
                          setCopiedFmText(true);
                          setTimeout(() => setCopiedFmText(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedFmText ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy FM Text</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 1: CORE NAMES */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Couple &amp; Receiver Names
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SinglishInput
                id="brideName"
                label="Bride's Name"
                required
                placeholder={language === 'si' ? 'e.g. dulyaanaa / sanduni' : 'e.g. Sanduni'}
                value={brideName}
                onChange={setBrideName}
                isSinhalaMode={language === 'si'}
                icon={<User className="h-4 w-4" />}
              />

              <SinglishInput
                id="groomName"
                label="Groom's Name"
                required
                placeholder={language === 'si' ? 'e.g. thisura / kasun' : 'e.g. Kasun'}
                value={groomName}
                onChange={setGroomName}
                isSinhalaMode={language === 'si'}
                icon={<User className="h-4 w-4" />}
              />
            </div>

            <SinglishInput
            
              id="receiverName"
              label="Sample Receiver / Guest Name"
              required
              placeholder={language === 'si' ? 'e.g. kamal silva / garu aaraadhitha amuththaa' : 'e.g. Honored Guest & Family'}
              value={receiverName}
              onChange={setReceiverName}
              isSinhalaMode={language === 'si'}
              helperText="Shown on the preview invitation. When you add guests later, each guest gets their personalized invitation link."
            />

            {/* OPTIONAL SINHALA CALLIGRAPHY OVERRIDES FOR OPENING UI */}
            {language == 'si' && (
              <div className="pt-2">
                <details className="group rounded-xl border border-slate-200 bg-sand-50/50 p-3.5 transition-colors open:bg-sand-50">
                  <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-2">
                      <span className="font-sinhala text-sm text-gold-600 font-bold">සාදර ඇරයුමයි</span>
                      <span>Sinhala Names for Traditional Opening Cover (Optional)</span>
                    </span>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-3">
                    <p className="text-[11px] text-slate-500">
                      If left blank, names are intelligently transliterated automatically (e.g. <em>Thisura &amp; Dulyana</em> ➔ <em>තිසුර සහ දුල්‍යානා</em>). You can also type Singlish below and it will convert automatically.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <SinglishInput
                        id="brideNameSi"
                        label="Bride's Name in Sinhala"
                        placeholder="e.g. dulyaanaa / sanduni"
                        value={brideNameSi}
                        onChange={setBrideNameSi}
                        isSinhalaMode={true}
                      />
                      <SinglishInput
                        id="groomNameSi"
                        label="Groom's Name in Sinhala"
                        placeholder="e.g. thisura / kasun"
                        value={groomNameSi}
                        onChange={setGroomNameSi}
                        isSinhalaMode={true}
                      />
                    </div>
                    <SinglishInput
                      id="receiverNameSi"
                      label="Guest Name in Sinhala (Optional sample)"
                      placeholder="e.g. kamal silva / garu aaraadhitha amuththaa"
                      value={receiverNameSi}
                      onChange={setReceiverNameSi}
                      isSinhalaMode={true}
                    />
                  </div>
                </details>
              </div>
            )}
          </div>

          {/* SECTION 2: VENUE & TIME */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Venue &amp; Commencing Time
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SinglishInput
                id="venue"
                label="Wedding Venue & City"
                required
                placeholder={
                  language === 'si'
                    ? 'e.g. cinnamon grand colombo / shangri-la'
                    : 'Grand Ballroom, Cinnamon Grand Colombo'
                }
                value={venue}
                onChange={setVenue}
                isSinhalaMode={language === 'si'}
                icon={<MapPin className="h-4 w-4" />}
              />

              <div>
                <label
                  htmlFor="eventDate"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Date &amp; Commencing Time *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    id="eventDate"
                    type="datetime-local"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-base sm:text-sm focus:border-gold-500 focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="mapUrl"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Google Maps Location URL (Optional)
              </label>
              <input
                id="mapUrl"
                type="url"
                placeholder="https://maps.google.com/?q=Cinnamon+Grand+Colombo"
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-gold-500 focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          {/* SECTION 3: COUPLE HERO PHOTO */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Picture of the Couple (Hero Portrait)
            </h2>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-sand-50 hover:bg-sand-100 text-slate-800 text-xs font-semibold cursor-pointer transition-colors min-h-[44px]">
                <UploadCloud className="h-4 w-4 text-gold-600" />
                <span>Choose Photo from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-400">or enter image link below</span>
            </div>

            <div className="relative">
              <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-base sm:text-sm focus:border-gold-500 focus:outline-none min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {PHOTO_PRESETS.map((preset) => {
                const isSelected = heroImageUrl === preset.url;
                return (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => setHeroImageUrl(preset.url)}
                    className={`relative rounded-xl overflow-hidden border-2 text-left transition-all ${
                      isSelected
                        ? 'border-gold-500 ring-2 ring-gold-400/30'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="aspect-4/3 w-full bg-slate-100">
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-1.5 bg-white text-center">
                      <span className="text-[11px] font-semibold text-slate-700 block truncate">
                        {preset.label}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-gold-500 text-white rounded-full p-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: TIER-SPECIFIC OPTIONS */}

          {/* BASIC TIER NOTICE */}
          {isBasic && (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
              <p className="font-semibold text-stone-800">
                Basic Tier Options Completed
              </p>
              <p>
                The Modern Minimalist theme keeps things streamlined and essential. Love stories, multi-photo galleries, dress code cards, and royal entourage sections are included in higher tiers.
              </p>
            </div>
          )}

          {/* TROPICAL / ITINERARY SECTION */}
          {isItinerarySupported && (
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span>Wedding Day Itinerary Timeline</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Provide the schedule of your special day.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItineraryItem}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Event</span>
                </button>
              </div>

              <div className="space-y-3">
                {itinerary.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <input
                      type="text"
                      value={item.time}
                      onChange={(e) => {
                        const updated = [...itinerary];
                        updated[index].time = e.target.value;
                        setItinerary(updated);
                      }}
                      className="w-28 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono font-bold bg-white"
                      placeholder="03:30 PM"
                    />
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...itinerary];
                        updated[index].title = e.target.value;
                        setItinerary(updated);
                      }}
                      className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold bg-white"
                      placeholder="Ceremony / Cocktail / Dinner"
                    />
                    <input
                      type="text"
                      value={item.desc || ''}
                      onChange={(e) => {
                        const updated = [...itinerary];
                        updated[index].desc = e.target.value;
                        setItinerary(updated);
                      }}
                      className="hidden md:block flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-600 bg-white"
                      placeholder="Optional notes / details"
                    />
                    {itinerary.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItineraryItem(index)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DRESS CODE SECTION */}
          {isDressCodeSupported && (
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <SinglishInput
                id="dressCode"
                label="Dress Code & Guest Attire Guidelines"
                isTextarea
                rows={2}
                placeholder={
                  language === 'si'
                    ? 'e.g. saampraadaayika ho vidhimath aendumin saerasii paeminenna'
                    : isTropical
                    ? 'e.g. Island Formal / Tropical Elegance: Linen suits and floral dresses warmly encouraged.'
                    : 'e.g. Black Tie Optional or Traditional Sri Lankan Splendor.'
                }
                value={dressCode}
                onChange={setDressCode}
                isSinhalaMode={language === 'si'}
                icon={<Shirt className="h-4 w-4 text-emerald-600" />}
              />
            </div>
          )}

          {/* LOVE STORY SECTION */}
          {isStorySupported && (
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <SinglishInput
                id="storyText"
                label="Our Love Story / Greeting Note"
                isTextarea
                rows={3}
                placeholder={
                  language === 'si'
                    ? 'e.g. apage demavupiyange aashiirvaadaya aethiva, apage vivaaha mangalyayata oba saemata...'
                    : 'Together with our families, we joyfully request the pleasure of your company...'
                }
                value={storyText}
                onChange={setStoryText}
                isSinhalaMode={language === 'si'}
                icon={<Heart className="h-4 w-4 text-rose-500" />}
              />
            </div>
          )}

          {/* ROYAL ENTOURAGE SECTION */}
          {isEntourageSupported && (
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-amber-600" />
                <span>The Royal Bridal Party &amp; Entourage</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SinglishInput
                  id="parentsOfBride"
                  label="Parents of the Bride"
                  placeholder={language === 'si' ? 'e.g. vijesekara mavupiyavan' : 'Mr. & Mrs. Wijesekara'}
                  value={entourage.parentsOfBride || ''}
                  onChange={(val) => setEntourage({ ...entourage, parentsOfBride: val })}
                  isSinhalaMode={language === 'si'}
                />
                <SinglishInput
                  id="parentsOfGroom"
                  label="Parents of the Groom"
                  placeholder={language === 'si' ? 'e.g. jayasundara mavupiyavan' : 'Mr. & Mrs. Jayasundara'}
                  value={entourage.parentsOfGroom || ''}
                  onChange={(val) => setEntourage({ ...entourage, parentsOfGroom: val })}
                  isSinhalaMode={language === 'si'}
                />
                <SinglishInput
                  id="maidOfHonor"
                  label="Maid of Honor"
                  placeholder={language === 'si' ? 'e.g. chamari perera' : 'Chamari Perera'}
                  value={entourage.maidOfHonor || ''}
                  onChange={(val) => setEntourage({ ...entourage, maidOfHonor: val })}
                  isSinhalaMode={language === 'si'}
                />
                <SinglishInput
                  id="bestMan"
                  label="Best Man"
                  placeholder={language === 'si' ? 'e.g. nishan fernando' : 'Nishan Fernando'}
                  value={entourage.bestMan || ''}
                  onChange={(val) => setEntourage({ ...entourage, bestMan: val })}
                  isSinhalaMode={language === 'si'}
                />
              </div>
            </div>
          )}

          {/* MOMENTS TOGETHER PHOTO ARCHIVE (ETERNAL NOIR & CLASSIC FLORAL) */}
          {isGallerySupported && (
            <div className="space-y-5 pt-6 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-gold-500" />
                    <span>
                      {language === 'si'
                        ? 'අපේ සොඳුරු මතකයන් ඡායාරූප එකතුව (Moments Together)'
                        : 'Moments Together Photo Archive'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'si'
                      ? 'ආරාධනා පත්‍රයේ දිස්වන සොඳුරු ඡායාරූප එකතුව සකසන්න. පෙරනිමි ඡායාරූප තෝරන්න හෝ ඔබේම ඡායාරූප එක්කරන්න.'
                      : 'Curate the romantic memories shown in your invitation archive with an interactive full-screen lightbox.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-gold-700 bg-sand-100 px-2.5 py-1 rounded-full border border-gold-200/50">
                    {galleryImages.length} {galleryImages.length === 1 ? 'Photo' : 'Photos'} Selected
                  </span>
                  <button
                    type="button"
                    onClick={handleResetMomentsToDefault}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 transition-colors cursor-pointer"
                    title="Reset to default photos"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* CURRENT ACTIVE MOMENTS LIST */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Active Photos in Invitation ({galleryImages.length})
                </label>

                {galleryImages.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 text-center text-xs text-amber-800">
                    No moments selected yet. Choose from the curated presets below or upload your own photos.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {galleryImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-2xs aspect-4/5"
                      >
                        <img
                          src={imgUrl}
                          alt={`Moment ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                        {/* Photo Number Tag */}
                        <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/20">
                          #{idx + 1}
                        </span>

                        {/* Remove Action Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveMomentImage(idx)}
                          aria-label={`Remove moment ${idx + 1}`}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white backdrop-blur-xs transition-colors shadow-xs cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CURATED PRESETS PICKER */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Choose from Curated Defaults
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {DEFAULT_MOMENTS_PRESETS.map((preset) => {
                    const isSelected = galleryImages.includes(preset.url);
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => handleTogglePresetMoment(preset.url)}
                        className={`group relative rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-gold-500 ring-2 ring-gold-400/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="aspect-square w-full bg-slate-100">
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-1.5 bg-white text-center">
                          <span className="text-[10px] font-semibold text-slate-700 block truncate">
                            {language === 'si' ? preset.labelSi : preset.label}
                          </span>
                        </div>
                        {isSelected ? (
                          <div className="absolute top-1 right-1 bg-gold-500 text-white rounded-full p-0.5 shadow-xs">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ADD CUSTOM PHOTOS SECTION */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Add Custom Photos
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload from Device */}
                  <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-slate-300 hover:border-gold-500 bg-sand-50/70 hover:bg-sand-100/70 text-slate-800 text-xs font-semibold cursor-pointer transition-colors min-h-[44px]">
                    <UploadCloud className="h-4 w-4 text-gold-600" />
                    <span>Upload Photos from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMomentsFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* URL Input */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="url"
                        placeholder="Paste image URL (https://...)"
                        value={customMomentUrl}
                        onChange={(e) => setCustomMomentUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomMomentUrl();
                          }
                        }}
                        className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs focus:border-gold-500 focus:outline-none min-h-[44px]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomMomentUrl}
                      disabled={!customMomentUrl.trim()}
                      className="inline-flex items-center gap-1 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 min-h-[44px] cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold shadow-md transition-all active:scale-95 min-h-[48px]"
            >
              <span>Preview Wedding Invitation</span>
            </button>

            {isPendingApproval ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-obsidian text-sm font-bold shadow-sm transition-all active:scale-95 min-h-[48px]"
              >
                <Clock className="h-4 w-4" />
                <span>Waiting for Admin Approval • View Status</span>
              </Link>
            ) : isApproved ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold shadow-sm transition-all active:scale-95 min-h-[48px]"
              >
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Theme Already Bought • Open Dashboard</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-obsidian text-sm font-bold shadow-sm transition-all active:scale-95 min-h-[48px]"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Buy This Theme (Rs. {activeTemplate.priceLkr.toLocaleString()})</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
