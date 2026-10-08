import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  CalendarPlus,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

import {
  getInvitationI18n,
  formatWeddingDate,
  getDefaultItinerary,
  formatWhatsAppMessage,
  InvitationLanguage,
} from '../../lib/invitationI18n';
import { getSinhalaFontClass, getSinhalaFontOption, SinhalaFontKey } from '../../lib/fmFontConverter';

export { getSinhalaFontClass, getSinhalaFontOption };

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface TimelineItem {
  time: string;
  title: string;
  desc?: string;
}

export interface InviteData {
  brideName: string;
  groomName: string;
  guestName?: string | null;
  eventDate: string | number | Date;
  venue: string;
  language?: 'en' | 'si';
  fontStyle?: SinhalaFontKey;
}

/**
 * Optional fields the premium features read. None are required, so the
 * templates keep working even if your TemplateComponentProps type does not
 * declare them yet (see the snippet in the chat for adding them to types.ts).
 */
export interface Extras {
  rsvpPhone?: string; // WhatsApp number with country code, e.g. "94771234567"
  musicUrl?: string; // direct audio file URL (mp3 / m4a)
  giftNote?: string; // short note about gifts / blessings
  itinerary?: TimelineItem[];
  dressCode?: string;
  galleryImages?: string[];
}

export const getExtras = (data: unknown): Extras => (data ?? {}) as Extras;

/* ------------------------------------------------------------------ */
/* Global keyframes (one <style> per template, uniquely prefixed)      */
/* ------------------------------------------------------------------ */

const CSS = `
.tx-pre,.tx-in{transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)}
.tx-pre{opacity:0;transform:translate3d(0,18px,0)}
.tx-in{opacity:1;transform:none}

@keyframes tx-fall{
  0%{transform:translate3d(0,-8vh,0) rotate(0deg);opacity:0}
  8%{opacity:var(--tx-o,.8)}
  92%{opacity:var(--tx-o,.8)}
  100%{transform:translate3d(var(--sway,0px),108vh,0) rotate(540deg);opacity:0}
}
.tx-particle{position:absolute;top:0;animation-name:tx-fall;animation-timing-function:linear;animation-iteration-count:infinite;will-change:transform}

@keyframes tx-shimmer{to{background-position:-200% center}}
.tx-gold-text{
  background-image:linear-gradient(100deg,#b8902a 0%,#f6e27a 25%,#d4af37 50%,#f6e27a 75%,#b8902a 100%);
  background-size:200% auto;-webkit-background-clip:text;background-clip:text;
  -webkit-text-fill-color:transparent;color:transparent;animation:tx-shimmer 7s linear infinite
}

@keyframes tx-kenburns{
  from{transform:scale(1.04) translate3d(0,0,0)}
  to{transform:scale(1.16) translate3d(-1.5%,-1%,0)}
}
.tx-kenburns{animation:tx-kenburns 26s ease-in-out infinite alternate;will-change:transform}

@keyframes tx-sway{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
.tx-sway{transform-origin:50% 100%;animation:tx-sway 4s ease-in-out infinite}

@keyframes tx-wave{to{transform:translate3d(-50%,0,0)}}
.tx-wave{animation:tx-wave 14s linear infinite}

@keyframes tx-seal-in{
  0%{transform:scale(.4) rotate(-20deg);opacity:0}
  60%{transform:scale(1.1) rotate(4deg);opacity:1}
  100%{transform:scale(1) rotate(0)}
}
.tx-seal-in{animation:tx-seal-in .9s cubic-bezier(.2,.8,.2,1) both}

@keyframes tx-seal-break{
  0%{transform:scale(1);filter:brightness(1)}
  35%{transform:scale(.88) rotate(-6deg)}
  100%{transform:scale(1.5) rotate(10deg);opacity:0;filter:brightness(1.6)}
}
.tx-seal-break{animation:tx-seal-break .7s ease-in forwards}

@keyframes tx-ring{0%{transform:scale(.9);opacity:.55}100%{transform:scale(1.55);opacity:0}}
.tx-ring{animation:tx-ring 2.4s ease-out infinite}

@media (prefers-reduced-motion:reduce){
  .tx-pre{opacity:1;transform:none}
  .tx-pre,.tx-in{transition:none}
  .tx-particle{display:none}
  .tx-kenburns,.tx-sway,.tx-wave,.tx-seal-in,.tx-ring{animation:none!important}
  .tx-gold-text{animation:none;background-position:0 center}
  .tx-seal-break{animation-duration:.01s}
}
`;

export const TemplateStyles: React.FC = () => <style>{CSS}</style>;

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

export const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
};

export const useCountdown = (eventDate: InviteData['eventDate'], withSeconds = false) => {
  const target = new Date(eventDate).getTime();
  const calc = useCallback(() => {
    const diff = Math.max(0, target - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      done: diff === 0,
    };
  }, [target]);

  const [time, setTime] = useState(calc);
  useEffect(() => {
    setTime(calc());
    const id = setInterval(() => setTime(calc()), withSeconds ? 1000 : 60000);
    return () => clearInterval(id);
  }, [calc, withSeconds]);
  return time;
};

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */

export const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} ${shown ? 'tx-in' : 'tx-pre'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

type ParticleKind = 'petal' | 'gold' | 'leaf';

const PARTICLE_STYLE: Record<ParticleKind, (size: number) => React.CSSProperties> = {
  petal: (s) => ({
    width: s,
    height: s * 1.3,
    background: 'linear-gradient(135deg,#f7cfd6,#e9a3b0)',
    borderRadius: '150% 0 150% 0',
    ['--tx-o' as string]: '0.75',
  }),
  leaf: (s) => ({
    width: s * 0.8,
    height: s * 1.7,
    background: 'linear-gradient(135deg,#2f7d57,#0C3826)',
    borderRadius: '0 100% 0 100%',
    ['--tx-o' as string]: '0.45',
  }),
  gold: (s) => ({
    width: Math.max(2, s / 4),
    height: Math.max(2, s / 4),
    background: 'radial-gradient(circle,#fff3b0 0%,#d4af37 60%,transparent 100%)',
    borderRadius: '9999px',
    boxShadow: '0 0 6px rgba(212,175,55,.8)',
    ['--tx-o' as string]: '0.85',
  }),
};

export const FallingParticles: React.FC<{ kind: ParticleKind; count?: number }> = ({
  kind,
  count = 14,
}) => {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (n: number) => {
          const x = Math.sin((i + 1) * n) * 10000;
          return x - Math.floor(x);
        };
        return {
          left: r(12.9898) * 100,
          size: 10 + r(4.1414) * 12,
          delay: -r(78.233) * 22,
          duration: kind === 'gold' ? 14 + r(9.1) * 14 : 12 + r(9.1) * 12,
          sway: (r(39.346) - 0.5) * 180,
        };
      }),
    [count, kind]
  );

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      {items.map((p, i) => (
        <span
          key={i}
          className="tx-particle"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ['--sway' as string]: `${p.sway}px`,
            ...PARTICLE_STYLE[kind](p.size),
          }}
        />
      ))}
    </div>
  );
};

export const ScrollProgress: React.FC<{ className?: string }> = ({ className = 'bg-stone-900' }) => {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setP(max > 0 ? el.scrollTop / max : 0);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, []);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-40 h-0.5">
      <div className={`h-full origin-left ${className}`} style={{ transform: `scaleX(${p})` }} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Calendar / share / RSVP                                             */
/* ------------------------------------------------------------------ */

const toStamp = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
const weddingTitle = (d: InviteData) =>
  d.language === 'si'
    ? `${d.brideName} සහ ${d.groomName} ගේ විවාහ මංගල්‍යය`
    : `${d.brideName} & ${d.groomName}'s Wedding`;

export const openGoogleCalendar = (data: InviteData) => {
  const start = new Date(data.eventDate);
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  const isSi = data.language === 'si';
  const desc = isSi
    ? `${data.brideName} සහ ${data.groomName} ගේ විවාහ මංගල උත්සවය — ${data.venue}`
    : `Wedding celebration of ${data.brideName} & ${data.groomName} at ${data.venue}`;
  const url =
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(weddingTitle(data))}` +
    `&details=${encodeURIComponent(desc)}` +
    `&location=${encodeURIComponent(data.venue)}` +
    `&dates=${toStamp(start)}/${toStamp(end)}`;
  window.open(url, '_blank');
};

export const downloadIcs = (data: InviteData) => {
  const start = new Date(data.eventDate);
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  const isSi = data.language === 'si';
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const desc = isSi
    ? `${data.brideName} සහ ${data.groomName} ගේ විවාහ මංගල උත්සවය — ${data.venue}`
    : `Wedding celebration of ${data.brideName} & ${data.groomName}`;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation//EN',
    'BEGIN:VEVENT',
    `UID:${toStamp(start)}-${esc(data.brideName)}-${esc(data.groomName)}@invitation`,
    `DTSTAMP:${toStamp(new Date())}`,
    `DTSTART:${toStamp(start)}`,
    `DTEND:${toStamp(end)}`,
    `SUMMARY:${esc(weddingTitle(data))}`,
    `LOCATION:${esc(data.venue)}`,
    `DESCRIPTION:${esc(desc)}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Wedding tomorrow',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wedding-invitation.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const AddToCalendarButtons: React.FC<{
  data: InviteData;
  className: string;
  withIcs?: boolean;
}> = ({ data, className, withIcs = false }) => {
  const i18n = getInvitationI18n(data.language);
  return (
    <>
      <button type="button" onClick={() => openGoogleCalendar(data)} className={className}>
        <CalendarPlus className="h-3.5 w-3.5" />
        <span className={data.language === 'si' ? 'font-sinhala' : ''}>{i18n.addToCalendar}</span>
      </button>
      {withIcs && (
        <button type="button" onClick={() => downloadIcs(data)} className={className}>
          <Download className="h-3.5 w-3.5" />
          <span className={data.language === 'si' ? 'font-sinhala' : ''}>{i18n.appleOutlookIcs}</span>
        </button>
      )}
    </>
  );
};

export const ShareButton: React.FC<{ data: InviteData; className: string; label?: string }> = ({
  data,
  className,
  label,
}) => {
  const isSi = data.language === 'si';
  const i18n = getInvitationI18n(data.language);
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    const url = window.location.href;
    const title = weddingTitle(data);
    const text = isSi
      ? `${data.brideName} සහ ${data.groomName} ගේ විවාහ මංගල්‍යයට ඔබට ආරාධනා කෙරේ.`
      : `You're invited to the wedding of ${data.brideName} & ${data.groomName}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled share sheet */
    }
  };
  return (
    <button type="button" onClick={onClick} className={className}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
      <span className={isSi ? 'font-sinhala' : ''}>
        {copied ? i18n.linkCopied : (label || i18n.shareInvitation)}
      </span>
    </button>
  );
};

const waLink = (phone: string, message: string) =>
  `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

export const RsvpButton: React.FC<{
  phone?: string;
  data: InviteData;
  className: string;
  label?: string;
}> = ({ phone, data, className, label }) => {
  if (!phone) return null;
  const isSi = data.language === 'si';
  const i18n = getInvitationI18n(data.language);
  const message = formatWhatsAppMessage({
    brideName: data.brideName,
    groomName: data.groomName,
    guestName: data.guestName,
    attending: true,
    guests: 1,
    lang: data.language,
  });
  return (
    <a href={waLink(phone, message)} target="_blank" rel="noopener noreferrer" className={className}>
      <MessageCircle className="h-3.5 w-3.5" />
      <span className={isSi ? 'font-sinhala' : ''}>{label || i18n.rsvpOnWhatsApp}</span>
    </a>
  );
};

export interface RsvpFormClasses {
  wrap: string;
  chip: string;
  chipOn: string;
  submit: string;
  label: string;
}

export const RsvpForm: React.FC<{
  phone?: string;
  data: InviteData;
  classes: RsvpFormClasses;
  maxGuests?: number;
}> = ({ phone, data, classes, maxGuests = 4 }) => {
  const [attending, setAttending] = useState(true);
  const [guests, setGuests] = useState(1);
  if (!phone) return null;

  const isSi = data.language === 'si';
  const i18n = getInvitationI18n(data.language);

  const send = () => {
    const msg = formatWhatsAppMessage({
      brideName: data.brideName,
      groomName: data.groomName,
      guestName: data.guestName,
      attending,
      guests,
      lang: data.language,
    });
    window.open(waLink(phone, msg), '_blank');
  };

  return (
    <div className={classes.wrap}>
      <div className="flex justify-center gap-2" role="group" aria-label="Attendance">
        <button
          type="button"
          aria-pressed={attending}
          onClick={() => setAttending(true)}
          className={`${classes.chip} ${attending ? classes.chipOn : ''} ${isSi ? 'font-sinhala' : ''}`}
        >
          {i18n.joyfullyAccept}
        </button>
        <button
          type="button"
          aria-pressed={!attending}
          onClick={() => setAttending(false)}
          className={`${classes.chip} ${!attending ? classes.chipOn : ''} ${isSi ? 'font-sinhala' : ''}`}
        >
          {i18n.regretfullyDecline}
        </button>
      </div>

      {attending && (
        <div className="space-y-2">
          <p className={`${classes.label} ${isSi ? 'font-sinhala text-xs' : ''}`}>{i18n.numberOfGuests}</p>
          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Number of guests">
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={guests === n}
                onClick={() => setGuests(n)}
                className={`${classes.chip} !min-w-[44px] ${guests === n ? classes.chipOn : ''}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      <button type="button" onClick={send} className={`${classes.submit} ${isSi ? 'font-sinhala' : ''}`}>
        <MessageCircle className="h-4 w-4" />
        <span>{i18n.sendRsvpWhatsApp}</span>
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Music (Disabled)                                                   */
/* ------------------------------------------------------------------ */

export const MusicToggle: React.FC<{ src?: string; autoPlay?: boolean; className?: string }> = () => null;

/* ------------------------------------------------------------------ */
/* Gallery lightbox                                                    */
/* ------------------------------------------------------------------ */

export const Lightbox: React.FC<{
  images: string[];
  index: number | null;
  onChange: (i: number | null) => void;
}> = ({ images, index, onChange }) => {
  useEffect(() => {
    if (index === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange(null);
      if (e.key === 'ArrowRight') onChange((index + 1) % images.length);
      if (e.key === 'ArrowLeft') onChange((index - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [index, images.length, onChange]);

  if (index === null) return null;
  const btn =
    'absolute flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
      onClick={() => onChange(null)}
    >
      <button type="button" aria-label="Close" className={`${btn} right-4 top-4`} onClick={() => onChange(null)}>
        <X className="h-5 w-5" />
      </button>
      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            className={`${btn} left-3 top-1/2 -translate-y-1/2`}
            onClick={(e) => {
              e.stopPropagation();
              onChange((index - 1 + images.length) % images.length);
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            className={`${btn} right-3 top-1/2 -translate-y-1/2`}
            onClick={(e) => {
              e.stopPropagation();
              onChange((index + 1) % images.length);
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
      <img
        src={images[index]}
        alt={`Couple moment ${index + 1}`}
        className="max-h-[85vh] max-w-full rounded-xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <span className="absolute bottom-5 text-xs text-white/70">
        {index + 1} / {images.length}
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

const fmtTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

/** Builds a default schedule whose times are derived from the event time. */
export const defaultTimeline = (
  eventDate: InviteData['eventDate'],
  steps?: { offsetMin: number; title: string; desc?: string }[],
  lang: InvitationLanguage = 'en'
): TimelineItem[] => {
  if (steps && steps.length > 0) {
    const base = new Date(eventDate).getTime();
    return steps.map((s) => ({
      time: fmtTime(new Date(base + s.offsetMin * 60000)),
      title: s.title,
      desc: s.desc,
    }));
  }
  return getDefaultItinerary(eventDate, lang);
};

export const Timeline: React.FC<{
  items: TimelineItem[];
  classes: { time: string; title: string; desc: string; dot: string; line: string };
}> = ({ items, classes }) => (
  <ol className="text-left">
    {items.map((item, i) => (
      <li key={i} className="grid grid-cols-[4.75rem_1rem_1fr] gap-x-3 pb-6 last:pb-0">
        <span className={`pt-0.5 text-right ${classes.time}`}>{item.time}</span>
        <div className="relative flex justify-center">
          <span className={`relative z-10 mt-1.5 h-2.5 w-2.5 rounded-full ${classes.dot}`} />
          {i < items.length - 1 && (
            <span className={`absolute bottom-[-1.5rem] top-3.5 w-px ${classes.line}`} />
          )}
        </div>
        <div>
          <p className={classes.title}>{item.title}</p>
          {item.desc && <p className={`mt-0.5 ${classes.desc}`}>{item.desc}</p>}
        </div>
      </li>
    ))}
  </ol>
);
