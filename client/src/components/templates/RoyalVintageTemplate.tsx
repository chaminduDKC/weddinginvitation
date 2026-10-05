import React, { useState } from 'react';
import { Calendar, MapPin, ExternalLink, Crown, Sparkles, Users, Shirt, Gift } from 'lucide-react';
import { TemplateComponentProps } from './types';
import {
  AddToCalendarButtons,
  FallingParticles,
  Lightbox,
  Reveal,
  RsvpForm,
  ScrollProgress,
  ShareButton,
  TemplateStyles,
  Timeline,
  defaultTimeline,
  getExtras,
  useCountdown,
  getSinhalaFontClass,
} from './templateKit';
import { getInvitationI18n, formatWeddingDate } from '../../lib/invitationI18n';

/**
 * PREMIUM TIER — Royal Vintage
 * Everything in Deluxe, plus: animated wax-seal break, shimmering gold names,
 * drifting gold dust, guest-count RSVP form (WhatsApp), ceremony timeline,
 * dress code, optional gift note, optional gallery with lightbox.
 */
export const RoyalVintageTemplate: React.FC<TemplateComponentProps> = ({
  data,
  hasOpened,
  onOpen,
}) => {
  const extra = getExtras(data);
  const isSi = data.language === 'si';
  const i18n = getInvitationI18n(data.language);

  const { weekday, dayNumber, monthYear, formattedTime } = formatWeddingDate(
    data.eventDate,
    data.language
  );

  const timeLeft = useCountdown(data.eventDate, true);
  const [breaking, setBreaking] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const breakSeal = () => {
    if (breaking) return;
    setBreaking(true);
    setTimeout(onOpen, 700);
  };

  // Monogram initials
  const brideInitial = data.brideName?.charAt(0)?.toUpperCase() || 'B';
  const groomInitial = data.groomName?.charAt(0)?.toUpperCase() || 'G';

  // Royal entourage defaults
  const entourage = data.entourage || {
    parentsOfBride: isSi ? 'විජේසේකර මවුපියවරුන්' : 'Mr. & Mrs. Wijesekara',
    parentsOfGroom: isSi ? 'ජයසුන්දර මවුපියවරුන්' : 'Mr. & Mrs. Jayasundara',
    maidOfHonor: isSi ? 'චමරි පෙරේරා' : 'Chamari Perera',
    bestMan: isSi ? 'නිශාන් ප්‍රනාන්දු' : 'Nishan Fernando',
  };

  const itinerary =
    extra.itinerary && extra.itinerary.length > 0
      ? extra.itinerary
      : defaultTimeline(data.eventDate, undefined, data.language);

  const gallery = extra.galleryImages ?? [];

  const focus =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B132B]';
  const goldGhost = `inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-[#D4AF37]/60 bg-transparent hover:bg-[#D4AF37]/10 text-[#9A7B2C] text-xs font-bold font-sans transition-colors min-h-[44px] ${focus}`;
  const darkGhost = `inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold font-sans transition-colors min-h-[44px] ${focus}`;

  const countdownItems = [
    { v: timeLeft.days, l: i18n.days },
    { v: timeLeft.hours, l: i18n.hours },
    { v: timeLeft.minutes, l: i18n.minutes },
    { v: timeLeft.seconds, l: i18n.seconds },
  ];

  return (
    <div className={`min-h-screen-dvh bg-[#0B132B] text-[#FAF7EE] font-serif antialiased overflow-x-hidden selection:bg-[#D4AF37] selection:text-[#0B132B] ${isSi ? getSinhalaFontClass(data.fontStyle) : ''}`}>
      <TemplateStyles />
      <ScrollProgress className="bg-gradient-to-r from-[#9A7B2C] via-[#FDE047] to-[#9A7B2C]" />
      {hasOpened && <FallingParticles kind="gold" count={20} />}
      {gallery.length > 0 && <Lightbox images={gallery} index={lightbox} onChange={setLightbox} />}

      {/* ROYAL WAX MONOGRAM SEAL OVERLAY */}
      {!hasOpened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060A17] text-white">
          <div className="relative w-full max-w-sm px-8 py-12 text-center rounded-3xl border-2 border-[#D4AF37]/50 bg-[#0B132B] shadow-2xl space-y-6">
            {/* Wax Seal Stamp */}
            <div className="relative mx-auto w-24 h-24">
              {!breaking && (
                <span aria-hidden="true" className="tx-ring absolute inset-0 rounded-full border border-[#D4AF37]" />
              )}
              <div
                className={`${breaking ? 'tx-seal-break' : 'tx-seal-in'} relative w-24 h-24 rounded-full bg-gradient-to-br from-[#A81822] via-[#800E13] to-[#54070B] border-4 border-[#D4AF37] shadow-xl flex items-center justify-center`}
              >
                <div className="text-center">
                  <Crown className="h-5 w-5 text-[#D4AF37] mx-auto mb-0.5" />
                  <span className="font-serif font-bold text-lg text-[#FDE047] tracking-wider drop-shadow-sm">
                    {brideInitial}&amp;{groomInitial}
                  </span>
                </div>
                <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <span className={`text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] font-sans font-bold ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
                {isSi ? 'රාජකීය මංගල නිවේදනය' : 'Royal Wedding Proclamation'}
              </span>
              <h2 className="text-3xl font-bold leading-tight text-white">
                <span className="tx-gold-text">{data.brideName}</span>
                <span className={`block text-xl italic font-normal text-[#D4AF37] my-1 ${isSi ? 'font-sinhala not-italic text-lg' : ''}`}>
                  {i18n.andConjunction}
                </span>
                <span className="tx-gold-text">{data.groomName}</span>
              </h2>
              <p className={`text-xs text-slate-300 font-sans pt-1 ${isSi ? 'font-sinhala' : ''}`}>
                {data.guestName
                  ? (isSi ? `${data.guestName} වෙත ගෞරවයෙන් පුද කෙරේ` : `Formally addressed to ${data.guestName}`)
                  : i18n.youAreInvited}
              </p>
            </div>

            <button
              onClick={breakSeal}
              disabled={breaking}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#D4AF37] hover:brightness-110 text-[#0B132B] font-sans font-bold text-xs tracking-wider uppercase shadow-xl transition-transform active:scale-95 min-h-[48px] disabled:opacity-80"
            >
              <Sparkles className="h-4 w-4" />
              <span className={isSi ? 'font-sinhala normal-case' : ''}>
                {isSi ? 'රාජකීය මුද්‍රාව විවෘත කරන්න' : 'Break the Royal Seal & Enter'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-xl mx-auto px-5 sm:px-8 py-16 sm:py-20 space-y-14">
        {/* Tier Badge */}
        <div className="text-center font-sans">
          <span className={`inline-block px-3 py-1 text-[10px] uppercase tracking-widest font-bold bg-[#D4AF37]/20 text-[#D4AF37] rounded-full border border-[#D4AF37]/40 shadow-xs ${isSi ? 'font-sinhala' : ''}`}>
            {isSi ? 'රාජකීය අභිමානවත් තේමාව • Royal Vintage' : 'Premium Royal Tier • Royal Vintage'}
          </span>
        </div>

        {/* HERO SECTION */}
        <section className="text-center space-y-6">
          <div className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-sans font-semibold ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
            <Crown className="h-4 w-4" />
            <span>{isSi ? 'මංගල ප්‍රකාශනය' : 'Grand Nuptials'}</span>
            <Crown className="h-4 w-4" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            <span className="tx-gold-text">{data.brideName}</span>
            <span className={`block text-2xl sm:text-3xl italic font-normal text-[#D4AF37] my-1.5 ${isSi ? 'font-sinhala not-italic text-xl' : ''}`}>
              {i18n.andConjunction}
            </span>
            <span className="tx-gold-text">{data.groomName}</span>
          </h1>

          <p className={`text-xs sm:text-sm text-slate-300 italic max-w-sm mx-auto ${isSi ? 'font-sinhala not-italic text-sm' : ''}`}>
            {i18n.requestHonorOfPresence}
          </p>

          {/* Royal Frame Couple Photo */}
          <div className="pt-2">
            <div className="relative mx-auto w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden border-4 border-[#D4AF37] p-2 bg-[#1C2541] shadow-2xl">
              <div className="w-full h-full rounded-xl overflow-hidden border border-[#D4AF37]/40">
                <img
                  src={
                    data.heroImageUrl ||
                    'https://images.unsplash.com/photo-1545232979-fbf68fe9f1f8?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={`${data.brideName} & ${data.groomName}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ROYAL BANQUET & CEREMONY CARD */}
        <Reveal>
          <section className="bg-[#FAF7EE] text-[#0B132B] rounded-3xl p-8 sm:p-10 border-2 border-[#D4AF37] shadow-xl text-center space-y-6 relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto text-[#0B132B]">
              <Crown className="h-6 w-6 text-[#9A7B2C]" />
            </div>

            <div className="space-y-1">
              <span className={`text-[11px] uppercase tracking-[0.25em] font-sans font-bold text-[#800E13] ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
                {isSi ? 'සාදර ඇරයුමයි' : 'By Royal Proclamation'}
              </span>
              <h2 className={`text-2xl sm:text-3xl font-bold text-[#0B132B] ${isSi ? 'font-sinhala' : ''}`}>
                {i18n.grandRoyalBanquet}
              </h2>
            </div>

            <div className="py-4 border-y border-[#D4AF37]/30 space-y-1.5 font-sans">
              <p className={`text-xs uppercase tracking-widest text-[#800E13] font-bold ${isSi ? 'font-sinhala text-sm' : ''}`}>
                {weekday}
              </p>
              <p className="text-6xl sm:text-7xl font-serif font-bold text-[#0B132B] leading-none">{dayNumber}</p>
              <p className={`text-sm font-bold text-[#0B132B] ${isSi ? 'font-sinhala' : ''}`}>{monthYear}</p>
              <div className={`flex items-center justify-center gap-1.5 text-xs text-stone-600 pt-1 ${isSi ? 'font-sinhala text-sm' : ''}`}>
                <Calendar className="h-3.5 w-3.5 text-[#9A7B2C]" />
                <span>{i18n.commencingAt(formattedTime)}</span>
              </div>
            </div>

            <div className="space-y-3 font-sans">
              <p className={`text-xs text-[#800E13] uppercase tracking-wider font-bold ${isSi ? 'font-sinhala text-sm' : ''}`}>
                {i18n.venueLabel}
              </p>
              <p className="text-base font-serif font-bold text-[#0B132B] max-w-xs mx-auto">{data.venue}</p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                {data.mapUrl && (
                  <a
                    href={data.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#0B132B] hover:bg-black text-[#D4AF37] text-xs font-bold shadow-md transition-colors min-h-[44px] ${focus}`}
                  >
                    <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
                    <span className={isSi ? 'font-sinhala' : ''}>{i18n.openGoogleMaps}</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
                <AddToCalendarButtons data={data} withIcs className={goldGhost} />
              </div>
            </div>
          </section>
        </Reveal>

        {/* ORDER OF THE DAY */}
        <Reveal>
          <section className="bg-[#1C2541] rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/40 space-y-6">
            <div className="text-center space-y-1">
              <span className={`text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-sans font-bold ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
                {i18n.timelineHeader}
              </span>
              <h3 className={`text-2xl font-bold text-white ${isSi ? 'font-sinhala' : ''}`}>
                {i18n.timelineSchedule}
              </h3>
            </div>
            <Timeline
              items={itinerary}
              classes={{
                time: `text-xs font-sans font-bold text-[#D4AF37] ${isSi ? 'font-sinhala' : ''}`,
                title: `text-base font-serif font-bold text-white ${isSi ? 'font-sinhala' : ''}`,
                desc: `text-xs font-sans text-slate-300 ${isSi ? 'font-sinhala text-[13px]' : ''}`,
                dot: 'bg-[#D4AF37] ring-4 ring-[#D4AF37]/20 shadow-[0_0_8px_rgba(212,175,55,0.5)]',
                line: 'bg-[#D4AF37]/30',
              }}
            />
          </section>
        </Reveal>

        {/* THE ROYAL ENTOURAGE & BRIDAL PARTY */}
        <Reveal>
          <section className="bg-[#1C2541] rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/40 space-y-6">
            <div className="text-center space-y-1">
              <div className={`inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-sans font-bold ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
                <Users className="h-3.5 w-3.5" />
                <span>{i18n.entourageHeader}</span>
              </div>
              <h3 className={`text-2xl font-bold text-white ${isSi ? 'font-sinhala' : ''}`}>
                {i18n.bridalParty}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center sm:text-left">
              {[
                { l: i18n.parentsOfBride, v: entourage.parentsOfBride },
                { l: i18n.parentsOfGroom, v: entourage.parentsOfGroom },
                { l: i18n.maidOfHonor, v: entourage.maidOfHonor },
                { l: i18n.bestMan, v: entourage.bestMan },
              ].map((p) => (
                <div key={p.l} className="p-4 rounded-2xl bg-[#0B132B]/80 border border-[#D4AF37]/20 space-y-1">
                  <span className={`text-[10px] uppercase font-sans font-bold tracking-widest text-[#D4AF37] ${isSi ? 'font-sinhala text-xs tracking-normal' : ''}`}>
                    {p.l}
                  </span>
                  <p className={`text-sm font-serif font-bold text-white ${isSi ? 'font-sinhala' : ''}`}>{p.v}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* DRESS CODE */}
        <Reveal>
          <section className="bg-[#1C2541] text-white rounded-3xl p-6 sm:p-8 text-center border border-[#D4AF37]/40 space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto text-[#D4AF37]">
              <Shirt className="h-5 w-5" />
            </div>
            <h3 className={`text-lg font-bold text-[#D4AF37] ${isSi ? 'font-sinhala' : ''}`}>
              {i18n.dressCodeTitle}
            </h3>
            <p className={`text-xs sm:text-sm text-slate-300 font-sans max-w-sm mx-auto leading-relaxed ${isSi ? 'font-sinhala text-[13px]' : ''}`}>
              {extra.dressCode || i18n.defaultDressCode}
            </p>
          </section>
        </Reveal>

        {/* OPTIONAL GALLERY */}
        {gallery.length > 0 && (
          <section className="space-y-6">
            <div className="text-center space-y-1">
              <span className={`text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-sans font-bold ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
                {i18n.momentsTogether}
              </span>
              <h3 className={`text-2xl font-bold text-white ${isSi ? 'font-sinhala' : ''}`}>
                {i18n.momentsTogether}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightbox(i)}
                  aria-label={`Open portrait ${i + 1}`}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 border-[#D4AF37]/60 bg-[#1C2541] ${focus}`}
                >
                  <img src={img} alt={`Couple portrait ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* GIFT NOTE (only when provided) */}
        {extra.giftNote && (
          <Reveal>
            <section className="bg-[#1C2541] rounded-3xl p-6 sm:p-8 text-center border border-[#D4AF37]/40 space-y-3">
              <Gift className="h-5 w-5 text-[#D4AF37] mx-auto" />
              <h3 className={`text-lg font-bold text-[#D4AF37] ${isSi ? 'font-sinhala' : ''}`}>
                {i18n.giftsTitle}
              </h3>
              <p className={`text-xs sm:text-sm text-slate-300 font-sans max-w-sm mx-auto leading-relaxed ${isSi ? 'font-sinhala' : ''}`}>
                {extra.giftNote}
              </p>
            </section>
          </Reveal>
        )}

        {/* RSVP */}
        <Reveal>
          <section className="bg-[#FAF7EE] text-[#0B132B] rounded-3xl p-6 sm:p-8 border-2 border-[#D4AF37] text-center space-y-5 shadow-xl">
            <div className="space-y-1">
              <span className={`text-[11px] uppercase tracking-[0.25em] font-sans font-bold text-[#800E13] ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
                {isSi ? 'ප්‍රතිචාර දක්වන්න' : 'The Favour of a Reply'}
              </span>
              <h3 className={`text-2xl font-bold ${isSi ? 'font-sinhala' : ''}`}>
                {i18n.kindlyReply}
              </h3>
            </div>

            <RsvpForm
              phone={extra.rsvpPhone}
              data={data}
              classes={{
                wrap: 'space-y-5 font-sans',
                chip: 'px-4 py-2 rounded-full border border-[#9A7B2C]/50 text-[#9A7B2C] text-xs font-bold min-h-[44px] transition-colors',
                chipOn: '!bg-[#0B132B] !text-[#D4AF37] !border-[#0B132B]',
                submit:
                  'w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#D4AF37] text-[#0B132B] text-xs font-bold tracking-wider uppercase shadow-lg transition-transform active:scale-95 min-h-[48px]',
                label: 'text-[10px] uppercase tracking-widest text-[#800E13] font-bold',
              }}
            />
            <div className="flex justify-center">
              <ShareButton data={data} className={goldGhost} />
            </div>
          </section>
        </Reveal>

        {/* OPULENT COUNTDOWN */}
        <Reveal>
          <section className="text-center space-y-4 font-sans">
            <p className={`text-xs uppercase tracking-[0.2em] font-bold text-[#D4AF37] ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
              {i18n.countdownPrefix}
            </p>
            <div className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto">
              {countdownItems.map((t) => (
                <div key={t.l} className="bg-[#1C2541] rounded-2xl p-3 border border-[#D4AF37]/50 shadow-md">
                  <span className="block text-2xl sm:text-3xl font-serif font-bold text-white tabular-nums">{t.v}</span>
                  <span className={`block text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] mt-1 ${isSi ? 'font-sinhala tracking-normal text-xs' : ''}`}>
                    {t.l}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ROYAL FOOTER */}
        <footer className="pt-8 border-t border-[#D4AF37]/30 text-center space-y-2 text-slate-300 text-xs font-sans">
          <p className={`font-serif italic text-sm text-[#FAF7EE] ${isSi ? 'font-sinhala not-italic text-sm' : ''}`}>
            {isSi ? 'ඔබ සැම ගෞරවයෙන් පිළිගැනීමට අපි මහත් ආශාවෙන් බලා සිටිමු.' : 'We eagerly anticipate welcoming you with highest royal honors.'}
          </p>
          <p className={`font-bold text-xs text-[#D4AF37] ${isSi ? 'font-sinhala text-sm' : ''}`}>
            {data.brideName} {i18n.andConjunction} {data.groomName}
          </p>
          <div className="flex justify-center pt-2">
            <AddToCalendarButtons data={data} className={darkGhost} />
          </div>
        </footer>
      </main>
    </div>
  );
};