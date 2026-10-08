import React, { useEffect, useRef, useState } from 'react';
import { Calendar, MapPin, ExternalLink, Heart, Sparkles, Shirt, Clock, Gift, MessageCircle } from 'lucide-react';
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
import {
  Curtain,
  GlitterField,
  PremiumStyles,
  Rise as BaseRise,
  SplitWords,
  Tick,
  Tilt,
  Typewriter,
  WriteOn,
  useInView,
} from './premiumKit';
import { getInvitationI18n, formatWeddingDate } from '../../lib/invitationI18n';

const fill = (c: string) => ({ '--pk-fill': c } as React.CSSProperties);

// Noir-only: drop the leftover blur(0px) filter once an entrance has finished
const Rise: React.FC<React.ComponentProps<typeof BaseRise>> = (props) => <BaseRise settle {...props} />;

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
      <path className="corner-path" d="M2 22 V9 A7 7 0 0 1 9 2 H22" stroke="currentColor" strokeWidth="1.2" pathLength={1} strokeDasharray={1} />
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

type CountdownDate = Parameters<typeof useCountdown>[0];

// Ticks every second on its own, so the rest of the page no longer re-renders each second
const NoirCountdown = React.memo(function NoirCountdown({
  eventDate, isSi, days, hours, minutes, seconds,
}: { eventDate: CountdownDate; isSi: boolean; days: string; hours: string; minutes: string; seconds: string }) {
  const t = useCountdown(eventDate, true);
  const items = [
    { v: t.days, l: days },
    { v: t.hours, l: hours },
    { v: t.minutes, l: minutes },
    { v: t.seconds, l: seconds },
  ];
  return (
    <div className="mx-auto grid max-w-sm grid-cols-4 divide-x divide-gold-400/30">
      {items.map((it) => (
        <div key={it.l} className="px-2">
          <span className={`block text-3xl sm:text-4xl font-bold leading-none tabular-nums text-white ${isSi ? 'font-serif' : 'pk-serif'}`}>
            <Tick value={it.v} />
          </span>
          <span className={`block pt-2 text-[11px] text-slate-300 ${isSi ? 'font-sinhala' : ''}`}>{it.l}</span>
        </div>
      ))}
    </div>
  );
});

/**
 * ULTRA-LUXURY TIER — Eternal Noir  (premium level 4)
 * Everything in Premium, plus: cinematic Ken Burns backdrop, scroll parallax on
 * the arch portrait, orchestrated hero entrance after the invitation opens,
 * floating "RSVP" concierge pill, music that starts on open, gold dust,
 * guest-count RSVP form, gift card, and a lightbox gallery,
 * + theatre-curtain opening, drifting gold aurora, cursor spotlight, 3D-tilt arch,
 * pen-stroke Pinyon names with gold shimmer, typed hero lines, word-by-word guest name,
 * orbiting gold card borders with light sheen, self-drawing timeline, flip-in countdown.
 */
export const EternalNoirTemplate: React.FC<TemplateComponentProps> = ({ data, hasOpened, onOpen }) => {
  const extra = getExtras(data);
  const isSi = data.language === 'si';
  const i18n = getInvitationI18n(data.language);
  const reduced = usePrefersReducedMotion();

  const { weekday, dayNumber, monthYear, formattedTime } = formatWeddingDate(data.eventDate, data.language);

  const [lightbox, setLightbox] = useState<number | null>(null);
  const [rsvpInView, setRsvpInView] = useState(false);
  const archRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const spotRaf = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const [tlRef, tlIn] = useInView<HTMLOListElement>({ threshold: 0.15 });

  const bride = data.brideName || '';
  const groom = data.groomName || '';

  const itinerary =
    extra.itinerary && extra.itinerary.length > 0 ? extra.itinerary : defaultTimeline(data.eventDate, undefined, data.language);

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

  // Soft gold spotlight that follows the cursor (desktop only)
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType === 'touch' || !spotRef.current) return;
    const { clientX: x, clientY: y } = e;
    cancelAnimationFrame(spotRaf.current);
    spotRaf.current = requestAnimationFrame(() => {
      if (spotRef.current) spotRef.current.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
    });
  };

  // Pause the endless CSS animations (orbit borders, sheen, gold shimmer) while they're off-screen
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced || typeof IntersectionObserver === 'undefined') return;
    const els = root.querySelectorAll<HTMLElement>('.pk-orbit, .pk-sheen, .pk-gold-text');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.target.classList.toggle('nr-paused', !en.isIntersecting)),
      { rootMargin: '80px' }
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      els.forEach((el) => el.classList.remove('nr-paused'));
      cancelAnimationFrame(spotRaf.current);
    };
  }, [hasOpened, reduced, data.storyText, extra.giftNote]);

  const focus =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian';
  const goldGhost = `inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-gold-400/60 hover:bg-gold-500/10 text-gold-600 text-xs font-semibold transition-colors min-h-[44px] ${focus}`;
  const darkGhost = `inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-gold-400/50 hover:bg-gold-500/10 text-gold-300 text-xs font-semibold transition-colors min-h-[44px] ${focus}`;
  const heading = (c = '') => `${isSi ? 'font-sinhala text-2xl font-bold' : 'pk-pinyon text-5xl sm:text-6xl'} ${c}`;
  const nameCls = isSi ? 'text-4xl font-serif font-bold' : 'pk-pinyon text-6xl sm:text-7xl';

  return (
    <div
      ref={rootRef}
      onPointerMove={onPointerMove}
      className={`min-h-screen-dvh bg-sand-50 text-obsidian antialiased overflow-x-hidden selection:bg-gold-500 selection:text-obsidian ${
        isSi ? `font-sans ${getSinhalaFontClass(data.fontStyle)}` : 'pk-body'
      }`}
    >
      <TemplateStyles />
      <PremiumStyles />
      <style>{'.nr-paused,.nr-paused::after{animation-play-state:paused!important}'}</style>
      <ScrollProgress className="bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />
      {hasOpened && <FallingParticles kind="gold" count={16} />}
      <Lightbox images={gallery} index={lightbox} onChange={setLightbox} />
      <Curtain show={hasOpened} />
      <div
        ref={spotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[5] h-[600px] w-[600px] will-change-transform"
        style={{ transform: 'translate3d(-2000px,-2000px,0)', background: 'radial-gradient(circle, rgba(212,175,55,0.13), transparent 65%)' }}
      />

      {/* FIXED LUXURY EDITORIAL BACKGROUND (slow cinematic push-in + drifting aurora) */}
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
        <div className="pk-aurora absolute inset-0">
          <i style={{ left: '-10%', top: '8%', width: '45vw', height: '45vw', filter: 'none', opacity: 0.5, willChange: 'transform', background: 'radial-gradient(circle, rgba(212,175,55,0.45), transparent 65%)' }} />
          <i style={{ right: '-15%', top: '55%', width: '50vw', height: '50vw', filter: 'none', opacity: 0.5, willChange: 'transform', animationDelay: '-7s', background: 'radial-gradient(circle, rgba(138,106,31,0.5), transparent 65%)' }} />
        </div>
      </div>

      {/* INTRO SEAL OVERLAY */}
      {!hasOpened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian text-white">
          <GlitterField count={40} seed={101} glow={false} />
          <div className="relative w-full max-w-sm px-8 py-14 text-center">
            <InsetFrame radius="rounded-3xl" />

            <div className="relative space-y-6">
              <Lotus className="intro-lotus mx-auto h-8 w-14 text-gold-400" />

              <div className="space-y-3">
                <Typewriter
                  as="p"
                  block
                  text={i18n.youAreInvited}
                  speed={60}
                  delay={400}
                  className={`text-gold-400 ${isSi ? 'font-sinhala text-base' : 'pk-serif italic text-lg'}`}
                />
                <h2 className="leading-tight text-white">
                  <WriteOn block delay={1300} duration={2000}>
                    <span className={`pk-gold-text ${isSi ? 'text-3xl font-serif font-bold' : 'pk-pinyon text-5xl'}`}>{bride}</span>
                  </WriteOn>
                  <span className={`block my-0.5 text-gold-400 ${isSi ? 'font-sinhala text-xl' : 'pk-script-alt text-3xl'}`}>{i18n.andConjunction}</span>
                  <WriteOn block delay={2900} duration={2000}>
                    <span className={`pk-gold-text ${isSi ? 'text-3xl font-serif font-bold' : 'pk-pinyon text-5xl'}`}>{groom}</span>
                  </WriteOn>
                </h2>
                <Typewriter
                  as="p"
                  block
                  delay={5000}
                  speed={40}
                  text={data.guestName ? i18n.preparedForGuest(data.guestName) : i18n.requestPleasureOfCompany}
                  className={`text-xs text-slate-300 max-w-xs mx-auto pt-1 ${isSi ? 'font-sinhala' : ''}`}
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpen}
                  className="pk-sheen w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-obsidian font-serif font-bold text-sm tracking-wide shadow-lg transition-transform active:scale-95 min-h-[48px]"
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
          className={`pk-sheen fixed bottom-4 left-1/2 z-40 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 px-5 py-3 text-xs font-serif font-bold tracking-wide text-obsidian shadow-xl min-h-[44px] ${focus}`}
        >
          <MessageCircle className="h-4 w-4" />
          <span className={isSi ? 'font-sinhala' : ''}>{i18n.rsvpTitle}</span>
        </button>
      )}

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-20 space-y-14">
        {/* HERO SECTION — choreographed after the curtain parts */}
        <section className="relative flex flex-col items-center justify-center text-center text-white py-12 space-y-7">
          <GlitterField count={32} seed={202} glow={false} className="-mx-6" />

          <Typewriter
            as="p"
            block
            text={i18n.requestHonorOfPresence}
            active={hasOpened}
            delay={1300}
            speed={42}
            className={`relative text-gold-400 mb-10 max-w-xs ${isSi ? 'font-sinhala text-sm' : 'pk-caps text-[10px] sm:text-xs leading-relaxed'}`}
          />

          <Rise active={hasOpened} delay={1800} y={40} className="relative w-60 sm:w-64">
            <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[22rem] pointer-events-none">
              <MoonstoneHalo className="block w-full text-gold-400/50" />
            </div>
            <div ref={archRef} className="relative will-change-transform">
              <Tilt max={9}>
                <div className="pk-sheen relative aspect-3/4 rounded-t-full border border-gold-400/70 p-1.5 bg-black/40">
                  <div className="h-full w-full overflow-hidden rounded-t-full">
                    <img
                      src={data.heroImageUrl || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85'}
                      alt={`${data.brideName} and ${data.groomName}`}
                      className="h-full w-full object-cover"
                      style={{ transform: hasOpened ? 'scale(1)' : 'scale(1.25)', transition: 'transform 4000ms cubic-bezier(.2,.7,.2,1)' }}
                    />
                  </div>
                </div>
              </Tilt>
            </div>
          </Rise>

          <h1 className="relative leading-tight">
            <WriteOn block active={hasOpened} delay={2800} duration={2400}>
              <span className={`pk-gold-text ${nameCls}`}>{bride}</span>
            </WriteOn>
            <Rise as="span" active={hasOpened} delay={4000} className="block">
              <span className={`block my-1 text-gold-400 ${isSi ? 'font-sinhala text-xl' : 'pk-script-alt text-4xl'}`}>{i18n.andConjunction}</span>
            </Rise>
            <WriteOn block active={hasOpened} delay={4600} duration={2400}>
              <span className={`pk-gold-text ${nameCls}`}>{groom}</span>
            </WriteOn>
          </h1>

          <div className="relative space-y-3 w-full">
            <Rise active={hasOpened} delay={6500}>
              <LotusDivider light />
            </Rise>
            <p className={`text-white ${isSi ? 'font-sinhala text-lg' : 'pk-serif text-2xl sm:text-3xl'}`}>
              <SplitWords text={data.guestName || i18n.honoredGuest} active={hasOpened} delay={6800} step={120} />
            </p>
            <Typewriter
              as="p"
              block
              text={i18n.requestPleasureOfCompany}
              active={hasOpened}
              delay={7600}
              speed={38}
              className={`text-slate-200 ${isSi ? 'font-sinhala text-sm' : 'pk-serif italic text-base'}`}
            />
          </div>
        </section>

        {/* INVITATION CARD */}
        <Reveal>
          <section className="pk-orbit pk-sheen relative rounded-3xl px-6 sm:px-10 py-14 shadow-card text-center text-obsidian" style={fill('#ffffff')}>
            <InsetFrame radius="rounded-2xl" />
            <GlitterField count={12} seed={303} bias="top" glow={false} />

            <div className="relative space-y-8">
              <div className="space-y-3">
                <Lotus className="mx-auto h-8 w-14 text-gold-600" />
                <h2 className={heading('text-obsidian')}>
                  <SplitWords text={i18n.ceremonyAndReception} />
                </h2>
              </div>

              <div className="space-y-1">
                <p className={`text-slate-600 ${isSi ? 'font-sinhala text-base' : 'pk-caps text-[10px]'}`}>{weekday}</p>
                <p className={`font-bold text-7xl sm:text-8xl leading-none pk-gold-text ${isSi ? 'font-serif' : 'pk-serif'}`}>{dayNumber}</p>
                <p className={`text-lg tracking-wide text-slate-700 ${isSi ? 'font-sinhala' : 'pk-serif'}`}>{monthYear}</p>
                <p className={`flex items-center justify-center gap-2 text-xs text-slate-600 pt-2 font-mono ${isSi ? 'font-sinhala font-normal text-sm' : ''}`}>
                  <Calendar className="h-4 w-4 text-gold-600" />
                  {i18n.commencingAt(formattedTime)}
                </p>
              </div>

              <LotusDivider />

              <div className="space-y-3">
                <p className={`text-slate-600 ${isSi ? 'font-sinhala' : 'pk-serif italic text-lg'}`}>{i18n.venueLabel}</p>
                <Typewriter
                  as="p"
                  block
                  text={data.venue}
                  speed={36}
                  className={`font-semibold leading-snug max-w-xs mx-auto ${isSi ? 'font-serif text-lg' : 'pk-serif text-2xl'}`}
                />

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
            <section className="pk-orbit relative rounded-3xl p-6 sm:p-9 text-white shadow-xl space-y-6" style={fill('#0b0b0f')}>
              <div className="text-center space-y-1.5">
                <div className={`inline-flex items-center gap-1.5 text-gold-400 font-bold ${isSi ? 'font-sinhala text-xs' : 'pk-caps text-[10px]'}`}>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{i18n.timelineHeader}</span>
                </div>
                <h3 className={heading('text-white')}>{i18n.timelineSchedule}</h3>
                <LotusDivider light />
              </div>

              <div className="pt-2">
                <ol ref={tlRef} className="text-left space-y-6 relative ml-4 sm:ml-8 pl-6 sm:pl-8">
                  {/* line that draws itself down the page */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 bottom-0 w-px bg-gold-400/40"
                    style={{
                      transformOrigin: 'top',
                      transform: tlIn || reduced ? 'scaleY(1)' : 'scaleY(0)',
                      transition: reduced ? 'none' : 'transform 1800ms cubic-bezier(.65,0,.25,1)',
                    }}
                  />
                  {itinerary.map((event, idx) => (
                    <li key={idx} className="relative group">
                      <Rise delay={idx * 140} y={16}>
                        {/* Glowing Gold Ring Node */}
                        <span className="absolute -left-[31px] sm:-left-[39px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-obsidian border-2 border-gold-400 shadow-[0_0_8px_rgba(212,175,55,0.4)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-gold-400 group-hover:scale-125 transition-transform" />
                        </span>
                        <div className="space-y-0.5">
                          <span className="inline-block text-xs font-mono font-bold tracking-wider text-gold-400 uppercase">{event.time}</span>
                          <h4 className={`text-white ${isSi ? 'font-sinhala text-base font-bold' : 'pk-serif text-xl font-semibold'}`}>{event.title}</h4>
                          {event.desc && (
                            <p className={`text-xs text-slate-300 leading-relaxed ${isSi ? 'font-sinhala text-[13px]' : ''}`}>{event.desc}</p>
                          )}
                        </div>
                      </Rise>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </Reveal>
        )}

        {/* DRESS CODE CARD */}
        <Reveal>
          <section className="relative bg-obsidian/90 text-white rounded-3xl p-6 sm:p-8 text-center border border-gold-400/30 space-y-3 shadow-lg overflow-hidden">
            <GlitterField count={14} seed={404} glow={false} />
            <div className="relative w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto text-gold-400">
              <Shirt className="h-5 w-5" />
            </div>
            <h3 className={`relative ${heading('text-gold-300')}`}>{i18n.dressCodeTitle}</h3>
            <Typewriter
              as="p"
              block
              text={extra.dressCode || i18n.defaultDressCode}
              speed={18}
              className={`relative text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed ${isSi ? 'font-sinhala text-[13px]' : ''}`}
            />
          </section>
        </Reveal>

        {/* COUNTDOWN */}
        <Reveal>
          <section className="py-8 text-center text-white space-y-6">
            <p className={`text-gold-400 ${isSi ? 'font-sinhala' : 'pk-serif italic text-xl'}`}>{i18n.countdownPrefix}</p>
            <NoirCountdown
              eventDate={data.eventDate}
              isSi={isSi}
              days={i18n.days}
              hours={i18n.hours}
              minutes={i18n.minutes}
              seconds={i18n.seconds}
            />
          </section>
        </Reveal>

        {/* STORY */}
        {data.storyText && (
          <Reveal>
            <section className="pk-orbit pk-sheen relative rounded-3xl px-6 sm:px-10 py-14 shadow-card text-center text-obsidian" style={fill('#ffffff')}>
              <InsetFrame radius="rounded-2xl" />
              <div className="relative space-y-5">
                <Heart className="mx-auto h-5 w-5 text-rose-500 fill-rose-500/20" />
                <h2 className={heading('text-obsidian')}>{i18n.loveStoryTitle}</h2>
                <Typewriter
                  as="p"
                  block
                  text={data.storyText}
                  speed={24}
                  className={`text-slate-600 leading-loose max-w-md mx-auto ${isSi ? 'font-sinhala text-base' : 'pk-serif italic text-xl'}`}
                />
              </div>
            </section>
          </Reveal>
        )}

        {/* GALLERY ARCHIVE */}
        {gallery.length > 0 && (
          <section className="space-y-6">
            <div className="text-center space-y-2 text-white">
              <h2 className={heading('text-white')}>{i18n.momentsTogether}</h2>
              <LotusDivider light />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {gallery.map((img: string, i: number) => (
                <Rise key={i} delay={(i % 2) * 180} y={36} className={i % 2 === 1 ? 'mt-8' : ''}>
                  <button
                    type="button"
                    onClick={() => setLightbox(i)}
                    aria-label={`Open gallery photo ${i + 1}`}
                    className={`pk-sheen block w-full aspect-4/5 rounded-t-full border border-gold-400/60 p-1 bg-black/40 ${focus}`}
                  >
                    <div className="h-full w-full overflow-hidden rounded-t-full">
                      <img src={img} alt="Couple gallery archive" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
                    </div>
                  </button>
                </Rise>
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
              <h3 className={heading('text-gold-300')}>{i18n.giftsTitle}</h3>
              <Typewriter
                as="p"
                block
                text={extra.giftNote}
                speed={20}
                className={`text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed ${isSi ? 'font-sinhala' : ''}`}
              />
            </section>
          </Reveal>
        )}

        {/* RSVP CONCIERGE */}
        <Reveal>
          <section id="rsvp" className="pk-orbit pk-sheen relative rounded-3xl px-6 sm:px-10 py-14 shadow-card text-center text-obsidian" style={fill('#ffffff')}>
            <InsetFrame radius="rounded-2xl" />
            <div className="relative space-y-6">
              <div className="space-y-2">
                <Lotus className="mx-auto h-8 w-14 text-gold-600" />
                <h2 className={heading('text-obsidian')}>{i18n.kindlyReply}</h2>
                <p className={`text-sm text-slate-600 ${isSi ? 'font-sinhala' : 'pk-serif italic text-lg'}`}>{i18n.replyHonored(data.guestName)}</p>
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

              {/* <div className="flex justify-center pt-1">
                <ShareButton data={data} className={goldGhost} />
              </div> */}
            </div>
          </section>
        </Reveal>

        {/* FOOTER */}
        <footer className="text-center space-y-4 pt-12 pb-20 text-white/85">
          <LotusDivider light />
          <p className={`text-lg ${isSi ? 'font-sinhala' : 'pk-serif'}`}>{i18n.footerGreeting}</p>
          <p className={`text-gold-400 ${isSi ? 'font-sinhala text-sm' : 'pk-script-alt text-3xl'}`}>
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