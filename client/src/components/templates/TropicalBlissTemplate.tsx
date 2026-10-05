import React from 'react';
import { Calendar, MapPin, ExternalLink, Palmtree, Sparkles, Shirt } from 'lucide-react';
import { TemplateComponentProps } from './types';
import {
  AddToCalendarButtons,
  FallingParticles,
  Reveal,
  RsvpButton,
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

const WaveDivider: React.FC = () => (
  <div className="overflow-hidden h-6 -mx-5 sm:-mx-8" aria-hidden="true">
    <svg className="tx-wave w-[200%] h-6 text-[#0C3826]/20" viewBox="0 0 1200 24" preserveAspectRatio="none" fill="none">
      <path
        d="M0 12 Q 37.5 0 75 12 T 150 12 T 225 12 T 300 12 T 375 12 T 450 12 T 525 12 T 600 12 T 675 12 T 750 12 T 825 12 T 900 12 T 975 12 T 1050 12 T 1125 12 T 1200 12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  </div>
);

/**
 * STANDARD TIER — Tropical Bliss
 * Everything in Basic, plus: drifting palm-leaf ambience, swaying seal icon,
 * animated wave dividers, vertical timeline, Apple/Outlook (.ics) calendar,
 * background music toggle.
 */
export const TropicalBlissTemplate: React.FC<TemplateComponentProps> = ({
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

  const timeLeft = useCountdown(data.eventDate);

  // Default tropical itinerary if not customized
  const itinerary =
    extra.itinerary && extra.itinerary.length > 0
      ? extra.itinerary
      : defaultTimeline(data.eventDate, undefined, data.language);

  const focus =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86446] focus-visible:ring-offset-2';
  const ghostBtn = `inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-[#0C3826]/25 bg-white hover:bg-[#F6F3EC] text-[#0C3826] text-xs font-semibold transition-colors min-h-[44px] ${focus}`;

  return (
    <div className={`min-h-screen-dvh bg-[#F6F3EC] text-[#1E2E24] font-sans antialiased overflow-x-hidden selection:bg-[#0C3826] selection:text-white ${isSi ? getSinhalaFontClass(data.fontStyle) : ''}`}>
      <TemplateStyles />
      <ScrollProgress className="bg-gradient-to-r from-[#0C3826] via-[#D4A373] to-[#C86446]" />
      {hasOpened && <FallingParticles kind="leaf" count={8} />}

      {/* INTRO SEAL OVERLAY */}
      {!hasOpened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C3826] text-[#F6F3EC]">
          <div className="relative w-full max-w-sm px-8 py-12 text-center rounded-3xl border border-[#D4A373]/40 bg-[#08271A] shadow-2xl space-y-6">
            <div className="w-14 h-14 rounded-full bg-[#D4A373]/20 flex items-center justify-center mx-auto text-[#D4A373]">
              <Palmtree className="tx-sway h-7 w-7" />
            </div>

            <div className="space-y-2">
              <span className={`text-[11px] uppercase tracking-[0.25em] text-[#D4A373] font-semibold ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
                {isSi ? 'විවාහ මංගල උත්සවය' : 'An Island Wedding Celebration'}
              </span>
              <h2 className="text-3xl font-serif font-bold text-white leading-tight">
                {data.brideName}
                <span className={`block text-xl font-serif italic text-[#D4A373] my-1 ${isSi ? 'font-sinhala not-italic text-lg' : ''}`}>
                  {i18n.andConjunction}
                </span>
                {data.groomName}
              </h2>
              <p className={`text-xs text-emerald-200/80 pt-1 ${isSi ? 'font-sinhala text-sm' : ''}`}>
                {data.guestName ? i18n.preparedForGuest(data.guestName) : i18n.requestPleasureOfCompany}
              </p>
            </div>

            <button
              onClick={onOpen}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#D4A373] to-[#C86446] hover:from-[#C86446] hover:to-[#D4A373] text-white font-semibold text-xs tracking-wider uppercase shadow-lg transition-transform active:scale-95 min-h-[48px]"
            >
              <Sparkles className="h-4 w-4" />
              <span className={isSi ? 'font-sinhala normal-case' : ''}>{i18n.openInvitation}</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-xl mx-auto px-5 sm:px-8 py-16 sm:py-20 space-y-12">
        {/* Tier Badge */}
        <div className="text-center">
          <span className={`inline-block px-3 py-1 text-[10px] uppercase tracking-widest font-semibold bg-emerald-900/10 text-[#0C3826] rounded-full border border-emerald-900/20 ${isSi ? 'font-sinhala' : ''}`}>
            {isSi ? 'දූපත් සුන්දරත්වය තේමාව • Tropical Bliss' : 'Standard Destination Tier • Tropical Bliss'}
          </span>
        </div>

        {/* HERO SECTION */}
        <section className="text-center space-y-6">
          <div className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-medium text-[#C86446] ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
            <Palmtree className="h-3.5 w-3.5" />
            <span>{isSi ? 'මංගල සැමරුම' : 'Destination Nuptials'}</span>
            <Palmtree className="h-3.5 w-3.5" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-[#0C3826] leading-tight">
            <span>{data.brideName}</span>
            <span className={`block text-2xl sm:text-3xl font-serif italic font-normal text-[#C86446] my-1.5 ${isSi ? 'font-sinhala not-italic text-xl' : ''}`}>
              {i18n.andConjunction}
            </span>
            <span>{data.groomName}</span>
          </h1>

          <p className={`text-xs sm:text-sm text-[#0C3826]/75 italic font-serif ${isSi ? 'font-sinhala not-italic text-sm' : ''}`}>
            {i18n.requestHonorOfPresence}
          </p>

          {/* Tropical Couple Photo */}
          <div className="pt-2">
            <div className="relative mx-auto w-full max-w-sm aspect-[4/5] rounded-t-full rounded-b-2xl overflow-hidden border-4 border-[#0C3826]/20 shadow-md bg-stone-200">
              <img
                src={
                  data.heroImageUrl ||
                  'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80'
                }
                alt={`${data.brideName} & ${data.groomName}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-4">
                <span className={`text-xs font-serif italic text-white/95 ${isSi ? 'font-sinhala not-italic' : ''}`}>
                  {isSi ? `සොඳුරු මංගල දිනය • ${monthYear}` : `Paradise Awaits • ${monthYear}`}
                </span>
              </div>
            </div>
          </div>
        </section>

        <WaveDivider />

        {/* CEREMONY & SUNSET RECEPTION CARD */}
        <Reveal>
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#D4A373]/30 shadow-sm text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#0C3826] via-[#D4A373] to-[#C86446]" />

            <div className="space-y-1">
              <span className={`text-[11px] uppercase tracking-[0.25em] font-semibold text-[#C86446] ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
                {isSi ? 'සාදර ඇරයුමයි' : 'Island Celebration'}
              </span>
              <h2 className={`text-2xl sm:text-3xl font-serif font-bold text-[#0C3826] ${isSi ? 'font-sinhala' : ''}`}>
                {i18n.sunsetReception}
              </h2>
            </div>

            <div className="py-4 border-y border-[#F6F3EC] space-y-1.5">
              <p className={`text-xs uppercase tracking-widest text-[#C86446] font-semibold ${isSi ? 'font-sinhala text-sm' : ''}`}>
                {weekday}
              </p>
              <p className="text-6xl sm:text-7xl font-serif font-bold text-[#0C3826] leading-none">
                {dayNumber}
              </p>
              <p className={`text-sm font-semibold text-[#0C3826] ${isSi ? 'font-sinhala' : ''}`}>{monthYear}</p>
              <div className={`flex items-center justify-center gap-1.5 text-xs text-[#0C3826]/80 pt-1 ${isSi ? 'font-sinhala text-sm' : ''}`}>
                <Calendar className="h-3.5 w-3.5 text-[#C86446]" />
                <span>{i18n.commencingAt(formattedTime)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className={`text-xs text-[#C86446] uppercase tracking-wider font-semibold ${isSi ? 'font-sinhala text-sm' : ''}`}>
                {i18n.venueLabel}
              </p>
              <p className="text-base font-serif font-semibold text-[#0C3826] max-w-xs mx-auto">
                {data.venue}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                {data.mapUrl && (
                  <a
                    href={data.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#0C3826] hover:bg-[#08271A] text-white text-xs font-semibold shadow-xs transition-colors min-h-[44px] ${focus}`}
                  >
                    <MapPin className="h-3.5 w-3.5 text-[#D4A373]" />
                    <span className={isSi ? 'font-sinhala' : ''}>{i18n.openGoogleMaps}</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
                <AddToCalendarButtons data={data} withIcs className={ghostBtn} />
              </div>
            </div>
          </section>
        </Reveal>

        <WaveDivider />

        {/* WEDDING DAY ITINERARY */}
        <Reveal>
          <section className="bg-white/80 backdrop-blur-xs rounded-3xl p-6 sm:p-8 border border-emerald-900/10 space-y-6">
            <div className="text-center space-y-1">
              <span className={`text-[11px] uppercase tracking-[0.25em] font-semibold text-[#C86446] ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
                {i18n.timelineSchedule}
              </span>
              <h3 className={`text-xl font-serif font-bold text-[#0C3826] ${isSi ? 'font-sinhala' : ''}`}>
                {i18n.timelineHeader}
              </h3>
            </div>

            <Timeline
              items={itinerary}
              classes={{
                time: `text-xs font-mono font-bold text-[#0C3826] ${isSi ? 'font-sinhala' : ''}`,
                title: `text-sm font-serif font-bold text-[#0C3826] ${isSi ? 'font-sinhala' : ''}`,
                desc: `text-xs text-[#0C3826]/75 ${isSi ? 'font-sinhala text-[13px]' : ''}`,
                dot: 'bg-[#C86446] ring-4 ring-[#C86446]/15',
                line: 'bg-[#0C3826]/15',
              }}
            />
          </section>
        </Reveal>

        {/* DRESS CODE CARD */}
        <Reveal>
          <section className="bg-[#0C3826] text-white rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#D4A373]/20 flex items-center justify-center mx-auto text-[#D4A373]">
              <Shirt className="h-5 w-5" />
            </div>
            <h3 className={`text-lg font-serif font-bold text-[#D4A373] ${isSi ? 'font-sinhala' : ''}`}>
              {i18n.dressCodeTitle}
            </h3>
            <p className={`text-xs sm:text-sm text-emerald-100/90 max-w-sm mx-auto leading-relaxed ${isSi ? 'font-sinhala text-[13px]' : ''}`}>
              {extra.dressCode ||
                (isSi
                  ? 'සැහැල්ලු හා අලංකාර විවාහ මංගල ඇඳුමින් සැරසී පැමිණෙන්න.'
                  : 'Island Formal & Tropical Elegance: Light breathable linens, pastel silk & floral prints. Sand-friendly footwear warmly recommended!')}
            </p>
          </section>
        </Reveal>

        {/* RSVP + SHARE */}
        <Reveal>
          <section className="text-center space-y-4">
            <p className={`text-xs uppercase tracking-[0.2em] font-semibold text-[#C86446] ${isSi ? 'font-sinhala tracking-normal text-sm' : ''}`}>
              {i18n.kindlyReply}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <RsvpButton
                phone={extra.rsvpPhone}
                data={data}
                className={`inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4A373] to-[#C86446] text-white text-xs font-semibold shadow-md transition-transform active:scale-95 min-h-[44px] ${focus}`}
              />
              <ShareButton data={data} className={ghostBtn} />
            </div>
          </section>
        </Reveal>

        {/* ISLAND COUNTDOWN CLOCK */}
        <Reveal>
          <section className="text-center space-y-4">
            <p className={`text-xs uppercase tracking-[0.2em] font-semibold text-[#C86446] ${isSi ? 'font-sinhala tracking-normal text-sm' : ''}`}>
              {i18n.countdownPrefix}
            </p>
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {[
                { v: timeLeft.days, l: i18n.days },
                { v: timeLeft.hours, l: i18n.hours },
                { v: timeLeft.minutes, l: i18n.minutes },
              ].map((t) => (
                <div key={t.l} className="bg-white rounded-2xl p-4 border border-[#D4A373]/40 shadow-2xs">
                  <span className="block text-3xl font-serif font-bold text-[#0C3826] tabular-nums">{t.v}</span>
                  <span className={`block text-[10px] uppercase font-bold tracking-wider text-[#C86446] mt-1 ${isSi ? 'font-sinhala tracking-normal text-xs' : ''}`}>
                    {t.l}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* TROPICAL FOOTER */}
        <footer className="pt-8 border-t border-emerald-900/10 text-center space-y-2 text-[#0C3826]/70 text-xs">
          <p className={`font-serif italic text-sm text-[#0C3826] ${isSi ? 'font-sinhala not-italic text-sm' : ''}`}>
            {i18n.footerGreeting}
          </p>
          <p className={`font-semibold text-xs text-[#C86446] ${isSi ? 'font-sinhala text-sm' : ''}`}>
            {data.brideName} {i18n.andConjunction} {data.groomName}
          </p>
        </footer>
      </main>
    </div>
  );
};