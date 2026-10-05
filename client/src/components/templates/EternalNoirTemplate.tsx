import React, { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  MapPin,
  ExternalLink,
  Heart,
  Sparkles,
  Shirt,
  Clock,
  Gift,
  MessageCircle,
} from 'lucide-react';
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
  defaultTimeline,
  getExtras,
  useCountdown,
  usePrefersReducedMotion,
  getSinhalaFontClass,
} from './templateKit';
import { getInvitationI18n, formatWeddingDate } from '../../lib/invitationI18n';

const Lotus: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="-45 -42 90 46" className={`lotus ${className}`} fill="none" aria-hidden="true">
    {[-56, -28, 0, 28, 56].map((deg) => (
      <g key={deg} transform={`rotate(${deg})`}>
        <path
          className="lotus-petal"
          d="M0 0 C -9 -9 -9 -26 0 -37 C 9 -26 9 -9 0 0 Z"
          stroke="currentColor"
          strokeWidth="1.1"
          fill="currentColor"
          fillOpacity="0.1"
        />
      </g>
    ))}
  </svg>
);

const MoonstoneHalo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 400 400" className={className} fill="none" aria-hidden="true">
    <circle cx="200" cy="200" r="196" stroke="currentColor" strokeWidth="1" />
    <g className="halo-dots">
      <circle cx="200" cy="200" r="184" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="0.1 11" />
    </g>
    <circle cx="200" cy="200" r="172" stroke="currentColor" strokeWidth="1" />
    <g className="halo-dash">
      <circle cx="200" cy="200" r="162" stroke="currentColor" strokeWidth="2" strokeDasharray="14 8" />
    </g>
    <circle cx="200" cy="200" r="152" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const InsetFrame: React.FC<{ radius?: string }> = ({ radius = 'rounded-2xl' }) => {
  const corner = (pos: string, rotate: string) => (
    <svg viewBox="0 0 24 24" className={`absolute h-6 w-6 text-gold-500 ${pos} ${rotate}`} fill="none" aria-hidden="true">
      <path
        className="corner-path"
        d="M2 22 V9 A7 7 0 0 1 9 2 H22"
        stroke="currentColor"
        strokeWidth="1.2"
        pathLength={1}
        strokeDasharray={1}
      />
      <circle className="corner-dot" cx="9" cy="9" r="1.6" fill="currentColor" />
    </svg>
  );

  return (
    <>
      <span className={`frame-line pointer-events-none absolute inset-3 border border-gold-400/50 ${radius}`} />
      <span className={`frame-line pointer-events-none absolute inset-4 border border-gold-400/20 ${radius}`} />
      {corner('top-2 left-2', '')}
      {corner('top-2 right-2', 'rotate-90')}
      {corner('bottom-2 right-2', 'rotate-180')}
      {corner('bottom-2 left-2', '-rotate-90')}
    </>
  );
};

const LotusDivider: React.FC<{ light?: boolean }> = ({ light = false }) => (
  <div className="flex items-center justify-center gap-3 py-2" aria-hidden="true">
    <span className={`h-px w-14 sm:w-20 ${light ? 'bg-gold-400/40' : 'bg-gold-400/60'}`} />
    <Lotus className={`h-4 w-7 ${light ? 'text-gold-400' : 'text-gold-600'}`} />
    <span className={`h-px w-14 sm:w-20 ${light ? 'bg-gold-400/40' : 'bg-gold-400/60'}`} />
  </div>
);

/**
 * ULTRA-LUXURY TIER — Eternal Noir
 * Everything in Premium, plus: cinematic Ken Burns backdrop, scroll parallax on
 * the arch portrait, orchestrated hero entrance after the invitation opens,
 * floating "RSVP" concierge pill, music that starts on open, gold dust,
 * guest-count RSVP form, gift card, and a lightbox gallery.
 */
export const EternalNoirTemplate: React.FC<TemplateComponentProps> = ({
  data,
  hasOpened,
  onOpen,
}) => {
  const extra = getExtras(data);
  const isSi = data.language === 'si';
  const i18n = getInvitationI18n(data.language);
  const reduced = usePrefersReducedMotion();

  const { weekday, dayNumber, monthYear, formattedTime } = formatWeddingDate(
    data.eventDate,
    data.language
  );

  const timeLeft = useCountdown(data.eventDate, true);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [rsvpInView, setRsvpInView] = useState(false);
  const archRef = useRef<HTMLDivElement>(null);

  const itinerary =
    extra.itinerary && extra.itinerary.length > 0
      ? extra.itinerary
      : defaultTimeline(data.eventDate, undefined, data.language);

  const gallery =
    data.galleryImages && data.galleryImages.length > 0
      ? data.galleryImages
      : extra.galleryImages && extra.galleryImages.length > 0
      ? extra.galleryImages
      : [
          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
        ];

  // Gentle parallax on the arch portrait
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (archRef.current) {
          archRef.current.style.transform = `translate3d(0, ${Math.min(window.scrollY, 700) * 0.12}px, 0)`;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reduced]);

  // Hide the floating RSVP pill while the RSVP card is on screen
  useEffect(() => {
    const el = document.getElementById('rsvp');
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setRsvpInView(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [hasOpened]);

  // Re-keyed on open so the hero entrance plays after the seal, not behind it
  const stage = (delay: number, node: React.ReactNode, className = '') => (
    <Reveal key={`${hasOpened}-${delay}`} delay={delay} className={className}>
      {node}
    </Reveal>
  );

  const focus =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian';
  const goldGhost = `inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-gold-400/60 hover:bg-gold-500/10 text-gold-600 text-xs font-semibold transition-colors min-h-[44px] ${focus}`;
  const darkGhost = `inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-gold-400/50 hover:bg-gold-500/10 text-gold-300 text-xs font-semibold transition-colors min-h-[44px] ${focus}`;

  const countdownItems = [
    { v: timeLeft.days, l: i18n.days },
    { v: timeLeft.hours, l: i18n.hours },
    { v: timeLeft.minutes, l: i18n.minutes },
    { v: timeLeft.seconds, l: i18n.seconds },
  ];

  return (
    <div className={`min-h-screen-dvh bg-sand-50 text-obsidian font-sans antialiased overflow-x-hidden selection:bg-gold-500 selection:text-obsidian ${isSi ? getSinhalaFontClass(data.fontStyle) : ''}`}>
      <TemplateStyles />
      <ScrollProgress className="bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />
      {hasOpened && <FallingParticles kind="gold" count={26} />}
      <Lightbox images={gallery} index={lightbox} onChange={setLightbox} />

      {/* FIXED LUXURY EDITORIAL BACKGROUND (slow cinematic push-in) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="tx-kenburns absolute inset-0"
          style={{
            backgroundImage: `url('${data.heroImageUrl || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85'}')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-black/95" />
      </div>

      {/* INTRO SEAL OVERLAY */}
      {!hasOpened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian text-white">
          <div className="relative w-full max-w-sm px-8 py-14 text-center">
            <InsetFrame radius="rounded-3xl" />

            <div className="relative space-y-6">
              <Lotus className="intro-lotus mx-auto h-8 w-14 text-gold-400" />

              <div className="space-y-3">
                <p className={`font-serif italic text-sm text-gold-400 ${isSi ? 'font-sinhala not-italic text-base' : ''}`}>
                  {i18n.youAreInvited}
                </p>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-wide leading-tight">
                  <span className="tx-gold-text">{data.brideName}</span>
                  <span className={`block font-serif italic font-normal text-gold-400 text-2xl my-1 ${isSi ? 'font-sinhala not-italic text-xl' : ''}`}>
                    {i18n.andConjunction}
                  </span>
                  <span className="tx-gold-text">{data.groomName}</span>
                </h2>
                <p className={`text-xs text-slate-300 max-w-xs mx-auto pt-1 ${isSi ? 'font-sinhala' : ''}`}>
                  {data.guestName
                    ? i18n.preparedForGuest(data.guestName)
                    : i18n.youAreInvited}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpen}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-obsidian font-serif font-bold text-sm tracking-wide shadow-lg transition-transform active:scale-95 min-h-[48px]"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className={isSi ? 'font-sinhala' : ''}>{i18n.openInvitation}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING RSVP CONCIERGE PILL */}
      {hasOpened && extra.rsvpPhone && !rsvpInView && (
        <button
          type="button"
          onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })}
          className={`fixed bottom-4 left-1/2 z-40 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 px-5 py-3 text-xs font-serif font-bold tracking-wide text-obsidian shadow-xl min-h-[44px] ${focus}`}
        >
          <MessageCircle className="h-4 w-4" />
          <span className={isSi ? 'font-sinhala' : ''}>{i18n.rsvpTitle}</span>
        </button>
      )}

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-20 space-y-14">
        {/* Tier Badge */}
        <div className="text-center">
          <span className="inline-block px-3.5 py-1 text-[10px] uppercase tracking-widest font-bold bg-gold-500/20 text-gold-300 rounded-full border border-gold-400/40 shadow-xs">
            {isSi ? 'රාජකීය අතිවිශිෂ්ට මංගල ආරාධනය • Eternal Noir' : 'Ultra-Luxury Editorial Tier • Eternal Noir'}
          </span>
        </div>

        {/* HERO SECTION */}
        <section className="relative flex flex-col items-center justify-center text-center text-white py-12 space-y-7">
          {stage(
            0,
            <p className={`font-serif italic text-sm sm:text-base text-gold-400 max-w-xs ${isSi ? 'font-sinhala not-italic' : ''}`}>
              {i18n.requestHonorOfPresence}
            </p>
          )}

          {stage(
            250,
            <div className="relative w-60 sm:w-64">
              <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[22rem] pointer-events-none">
                <MoonstoneHalo className="block w-full text-gold-400/50" />
              </div>
              <div ref={archRef} className="relative will-change-transform">
                <div className="relative aspect-3/4 rounded-t-full border border-gold-400/70 p-1.5 bg-black/40">
                  <div className="h-full w-full overflow-hidden rounded-t-full">
                    <img
                      src={
                        data.heroImageUrl ||
                        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85'
                      }
                      alt={`${data.brideName} and ${data.groomName}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {stage(
            550,
            <h1 className="text-fluid-display font-serif font-bold tracking-tight leading-[1.05] drop-shadow-md">
              <span className="block tx-gold-text">{data.brideName}</span>
              <span className={`block font-serif italic font-normal text-gold-400 text-[0.55em] leading-none my-1 ${isSi ? 'font-sinhala not-italic text-lg' : ''}`}>
                {i18n.andConjunction}
              </span>
              <span className="block tx-gold-text">{data.groomName}</span>
            </h1>
          )}

          {stage(
            800,
            <div className="space-y-3">
              <div className="w-full">
                <LotusDivider light />
              </div>
              <p className={`font-serif text-lg sm:text-xl text-white ${isSi ? 'font-sinhala' : ''}`}>
                {data.guestName || i18n.honoredGuest}
              </p>
              <p className={`font-serif italic text-sm text-slate-200 ${isSi ? 'font-sinhala not-italic' : ''}`}>
                {i18n.requestPleasureOfCompany}
              </p>
            </div>,
            'w-full'
          )}
        </section>

        {/* INVITATION CARD */}
        <Reveal>
          <section className="relative bg-white rounded-3xl px-6 sm:px-10 py-14 shadow-card text-center text-obsidian">
            <InsetFrame radius="rounded-2xl" />

            <div className="relative space-y-8">
              <div className="space-y-3">
                <Lotus className="mx-auto h-8 w-14 text-gold-600" />
                <h2 className={`text-fluid-h2 font-serif font-bold ${isSi ? 'font-sinhala' : ''}`}>
                  {i18n.ceremonyAndReception}
                </h2>
              </div>

              <div className="space-y-1">
                <p className={`font-serif italic text-slate-600 ${isSi ? 'font-sinhala not-italic text-base' : ''}`}>
                  {weekday}
                </p>
                <p className="font-serif font-bold text-7xl sm:text-8xl leading-none text-obsidian">{dayNumber}</p>
                <p className={`font-serif text-lg tracking-wide text-slate-700 ${isSi ? 'font-sinhala' : ''}`}>
                  {monthYear}
                </p>
                <p className={`flex items-center justify-center gap-2 text-xs text-slate-600 pt-2 font-mono ${isSi ? 'font-sinhala font-normal text-sm' : ''}`}>
                  <Calendar className="h-4 w-4 text-gold-600" />
                  {i18n.commencingAt(formattedTime)}
                </p>
              </div>

              <LotusDivider />

              <div className="space-y-3">
                <p className={`font-serif italic text-slate-600 ${isSi ? 'font-sinhala not-italic' : ''}`}>
                  {i18n.venueLabel}
                </p>
                <p className="font-serif text-lg font-semibold leading-snug max-w-xs mx-auto">{data.venue}</p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  {data.mapUrl && (
                    <a
                      href={data.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-charcoal hover:bg-obsidian text-white text-xs font-semibold shadow-2xs transition-all hover:-translate-y-0.5 active:scale-95 min-h-[44px]"
                    >
                      <MapPin className="h-3.5 w-3.5 text-gold-400" />
                      <span className={isSi ? 'font-sinhala' : ''}>{i18n.openGoogleMaps}</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  )}
                  <AddToCalendarButtons data={data} withIcs className={goldGhost} />
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* WEDDING EVENTS TIMELINE / ITINERARY */}
        {itinerary.length > 0 && (
          <Reveal>
            <section className="relative bg-obsidian/95 text-white rounded-3xl p-6 sm:p-9 border border-gold-400/40 shadow-xl space-y-6">
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-gold-400 font-bold">
                  <Clock className="h-3.5 w-3.5" />
                  <span className={isSi ? 'font-sinhala' : ''}>{i18n.timelineHeader}</span>
                </div>
                <h3 className={`text-xl sm:text-2xl font-serif font-bold text-white tracking-wide ${isSi ? 'font-sinhala' : ''}`}>
                  {i18n.timelineSchedule}
                </h3>
                <LotusDivider light />
              </div>

              <div className="pt-2">
                <ol className="text-left space-y-6 relative border-l border-gold-400/30 ml-4 sm:ml-8 pl-6 sm:pl-8">
                  {itinerary.map((event, idx) => (
                    <li key={idx} className="relative group">
                      {/* Glowing Gold Ring Node */}
                      <span className="absolute -left-[31px] sm:-left-[39px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-obsidian border-2 border-gold-400 shadow-[0_0_8px_rgba(212,175,55,0.4)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold-400 group-hover:scale-125 transition-transform" />
                      </span>
                      <div className="space-y-0.5">
                        <span className="inline-block text-xs font-mono font-bold tracking-wider text-gold-400 uppercase">
                          {event.time}
                        </span>
                        <h4 className={`text-base font-serif font-bold text-white tracking-wide ${isSi ? 'font-sinhala' : ''}`}>
                          {event.title}
                        </h4>
                        {event.desc && (
                          <p className={`text-xs text-slate-300 leading-relaxed font-sans ${isSi ? 'font-sinhala text-[13px]' : ''}`}>
                            {event.desc}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </Reveal>
        )}

        {/* DRESS CODE CARD */}
        <Reveal>
          <section className="bg-obsidian/90 text-white rounded-3xl p-6 sm:p-8 text-center border border-gold-400/30 space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto text-gold-400">
              <Shirt className="h-5 w-5" />
            </div>
            <h3 className={`text-lg font-serif font-bold text-gold-300 ${isSi ? 'font-sinhala' : ''}`}>
              {i18n.dressCodeTitle}
            </h3>
            <p className={`text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed ${isSi ? 'font-sinhala text-[13px]' : ''}`}>
              {extra.dressCode || i18n.defaultDressCode}
            </p>
          </section>
        </Reveal>

        {/* COUNTDOWN */}
        <Reveal>
          <section className="py-8 text-center text-white space-y-6">
            <p className={`font-serif italic text-gold-400 ${isSi ? 'font-sinhala not-italic' : ''}`}>
              {i18n.countdownPrefix}
            </p>
            <div className="mx-auto grid max-w-sm grid-cols-4 divide-x divide-gold-400/30">
              {countdownItems.map((t) => (
                <div key={t.l} className="px-2">
                  <span className="block font-serif text-3xl sm:text-4xl font-bold leading-none tabular-nums text-white">
                    {t.v}
                  </span>
                  <span className={`block pt-2 text-[11px] text-slate-300 ${isSi ? 'font-sinhala' : ''}`}>
                    {t.l}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* STORY */}
        {data.storyText && (
          <Reveal>
            <section className="relative bg-white rounded-3xl px-6 sm:px-10 py-14 shadow-card text-center text-obsidian">
              <InsetFrame radius="rounded-2xl" />
              <div className="relative space-y-5">
                <Heart className="mx-auto h-5 w-5 text-rose-500 fill-rose-500/20" />
                <h2 className={`text-fluid-h2 font-serif font-bold ${isSi ? 'font-sinhala' : ''}`}>
                  {i18n.loveStoryTitle}
                </h2>
                <p className={`text-sm sm:text-base text-slate-600 leading-loose max-w-md mx-auto italic font-serif ${isSi ? 'font-sinhala not-italic text-base' : ''}`}>
                  &ldquo;{data.storyText}&rdquo;
                </p>
              </div>
            </section>
          </Reveal>
        )}

        {/* GALLERY ARCHIVE */}
        {gallery.length > 0 && (
          <section className="space-y-6">
            <div className="text-center space-y-2 text-white">
              <h2 className={`text-2xl sm:text-3xl font-serif font-bold ${isSi ? 'font-sinhala' : ''}`}>
                {i18n.momentsTogether}
              </h2>
              <LotusDivider light />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {gallery.map((img: string, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightbox(i)}
                  aria-label={`Open gallery photo ${i + 1}`}
                  className={`aspect-4/5 rounded-t-full border border-gold-400/60 p-1 bg-black/40 ${focus} ${
                    i % 2 === 1 ? 'mt-8' : ''
                  }`}
                >
                  <div className="h-full w-full overflow-hidden rounded-t-full">
                    <img
                      src={img}
                      alt="Couple gallery archive"
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* GIFT NOTE (only when provided) */}
        {extra.giftNote && (
          <Reveal>
            <section className="bg-obsidian/90 text-white rounded-3xl p-6 sm:p-8 text-center border border-gold-400/30 space-y-3 shadow-lg">
              <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto text-gold-400">
                <Gift className="h-5 w-5" />
              </div>
              <h3 className={`text-lg font-serif font-bold text-gold-300 ${isSi ? 'font-sinhala' : ''}`}>
                {i18n.giftsTitle}
              </h3>
              <p className={`text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed ${isSi ? 'font-sinhala' : ''}`}>
                {extra.giftNote}
              </p>
            </section>
          </Reveal>
        )}

        {/* RSVP CONCIERGE */}
        <Reveal>
          <section id="rsvp" className="relative bg-white rounded-3xl px-6 sm:px-10 py-14 shadow-card text-center text-obsidian">
            <InsetFrame radius="rounded-2xl" />
            <div className="relative space-y-6">
              <div className="space-y-2">
                <Lotus className="mx-auto h-8 w-14 text-gold-600" />
                <h2 className={`text-fluid-h2 font-serif font-bold ${isSi ? 'font-sinhala' : ''}`}>
                  {i18n.kindlyReply}
                </h2>
                <p className={`font-serif italic text-sm text-slate-600 ${isSi ? 'font-sinhala not-italic' : ''}`}>
                  {i18n.replyHonored(data.guestName)}
                </p>
              </div>

              <RsvpForm
                phone={extra.rsvpPhone}
                data={data}
                classes={{
                  wrap: 'space-y-5',
                  chip: 'px-4 py-2 rounded-full border border-gold-400/70 text-gold-700 text-xs font-semibold min-h-[44px] transition-colors',
                  chipOn: '!bg-obsidian !text-gold-300 !border-obsidian',
                  submit:
                    'w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-obsidian font-serif font-bold text-sm tracking-wide shadow-lg transition-transform active:scale-95 min-h-[48px]',
                  label: 'text-[11px] uppercase tracking-widest text-slate-500 font-semibold',
                }}
              />

              <div className="flex justify-center pt-1">
                <ShareButton data={data} className={goldGhost} />
              </div>
            </div>
          </section>
        </Reveal>

        {/* FOOTER */}
        <footer className="text-center space-y-4 pt-12 pb-20 text-white/85">
          <LotusDivider light />
          <p className={`font-serif text-base ${isSi ? 'font-sinhala' : ''}`}>{i18n.footerGreeting}</p>
          <p className={`font-serif italic text-sm text-gold-400 ${isSi ? 'font-sinhala not-italic' : ''}`}>
            {i18n.withLove} {data.brideName} {i18n.andConjunction} {data.groomName}
          </p>
          <div className="flex justify-center pt-2">
            <AddToCalendarButtons data={data} className={darkGhost} />
          </div>
        </footer>
      </main>
    </div>
  );
};