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
import { GlitterField, GoldFrame, LeafSprig, PremiumStyles, Rise, Tick, Typewriter } from './premiumKit';
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
 * STANDARD TIER — Tropical Bliss  (premium level 1)
 * Everything in Basic, plus: drifting palm-leaf ambience, swaying seal icon,
 * animated wave dividers, vertical timeline, Apple/Outlook (.ics) calendar,
 * + calligraphy script fonts, typewriter names/venue, self-drawing gold frame,
 * gold glitter, drawing leaf sprig, animated countdown digits.
 */
export const TropicalBlissTemplate: React.FC<TemplateComponentProps> = ({ data, hasOpened, onOpen }) => {
  const extra = getExtras(data);
  const isSi = data.language === 'si';
  const i18n = getInvitationI18n(data.language);
  const en = (c: string) => (isSi ? '' : c); // English-only typography (Sinhala keeps its own font)

  const { weekday, dayNumber, monthYear, formattedTime } = formatWeddingDate(data.eventDate, data.language);
  const timeLeft = useCountdown(data.eventDate);

  const itinerary =
    extra.itinerary && extra.itinerary.length > 0 ? extra.itinerary : defaultTimeline(data.eventDate, undefined, data.language);

  // Typing choreography: bride → groom → tagline
  const bride = data.brideName || '';
  const groom = data.groomName || '';
  const NAME_MS = 95;
  const brideAt = 500;
  const groomAt = brideAt + bride.length * NAME_MS + 450;
  const taglineAt = groomAt + groom.length * NAME_MS + 350;

  const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86446] focus-visible:ring-offset-2';
  const ghostBtn = `inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-[#0C3826]/25 bg-white hover:bg-[#F6F3EC] text-[#0C3826] text-xs font-semibold transition-colors min-h-[44px] ${focus}`;
  const kicker = (c: string) => `${isSi ? 'font-sinhala text-sm' : 'pk-caps text-[10px]'} ${c}`;

  return (
    <div
      className={`min-h-screen-dvh bg-[#F6F3EC] text-[#1E2E24] font-sans antialiased overflow-x-hidden selection:bg-[#0C3826] selection:text-white ${
        isSi ? getSinhalaFontClass(data.fontStyle) : 'pk-body'
      }`}
    >
      <TemplateStyles />
      <PremiumStyles />
      <ScrollProgress className="bg-gradient-to-r from-[#0C3826] via-[#D4A373] to-[#C86446]" />
      {hasOpened && <FallingParticles kind="leaf" count={8} />}

      {/* INTRO SEAL OVERLAY */}
      {!hasOpened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C3826] text-[#F6F3EC]">
          <GlitterField count={46} seed={11} color="#e8c871" />
          <div className="relative w-full max-w-sm px-8 py-12 text-center rounded-3xl border border-[#D4A373]/30 bg-[#08271A] shadow-2xl space-y-6">
            <GoldFrame inset={10} />
            <div className="w-14 h-14 rounded-full bg-[#D4A373]/20 flex items-center justify-center mx-auto text-[#D4A373]">
              <Palmtree className="tx-sway h-7 w-7" />
            </div>

            <div className="space-y-2">
              <Typewriter
                as="p"
                block
                text={isSi ? 'විවාහ මංගල උත්සවය' : 'An Island Wedding Celebration'}
                speed={40}
                delay={300}
                className={kicker('text-[#D4A373]')}
              />
              <h2 className="text-white leading-tight">
                <Typewriter
                  block
                  text={bride}
                  delay={900}
                  speed={100}
                  className={isSi ? 'text-3xl font-serif font-bold' : 'pk-script text-6xl'}
                />
                <span className={`block my-0.5 text-[#D4A373] ${isSi ? 'font-sinhala text-lg' : 'pk-script-alt text-3xl'}`}>
                  {i18n.andConjunction}
                </span>
                <Typewriter
                  block
                  text={groom}
                  delay={900 + bride.length * 100 + 400}
                  speed={100}
                  className={isSi ? 'text-3xl font-serif font-bold' : 'pk-script text-6xl'}
                />
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
          <span
            className={`inline-block px-3 py-1 text-[10px] uppercase tracking-widest font-semibold bg-emerald-900/10 text-[#0C3826] rounded-full border border-emerald-900/20 ${
              isSi ? 'font-sinhala' : ''
            }`}
          >
            {isSi ? 'දූපත් සුන්දරත්වය තේමාව • Tropical Bliss' : 'Standard Destination Tier • Tropical Bliss'}
          </span>
        </div>

        {/* HERO SECTION */}
        <section className="text-center space-y-6">
          <Rise active={hasOpened} delay={100}>
            <div className={`inline-flex items-center gap-2 text-[#C86446] ${isSi ? 'font-sinhala text-xs' : 'pk-caps text-[10px]'}`}>
              <Palmtree className="h-3.5 w-3.5" />
              <span>{isSi ? 'මංගල සැමරුම' : 'Destination Nuptials'}</span>
              <Palmtree className="h-3.5 w-3.5" />
            </div>
          </Rise>

          <h1 className="text-[#0C3826] leading-tight">
            <Typewriter
              block
              text={bride}
              active={hasOpened}
              delay={brideAt}
              speed={NAME_MS}
              className={isSi ? 'text-4xl sm:text-5xl font-serif font-bold' : 'pk-script text-6xl sm:text-7xl'}
            />
            <Rise as="span" active={hasOpened} delay={brideAt + bride.length * NAME_MS} className="block">
              <span className={`block my-1 text-[#C86446] ${isSi ? 'font-sinhala text-xl' : 'pk-script-alt text-4xl'}`}>{i18n.andConjunction}</span>
            </Rise>
            <Typewriter
              block
              text={groom}
              active={hasOpened}
              delay={groomAt}
              speed={NAME_MS}
              className={isSi ? 'text-4xl sm:text-5xl font-serif font-bold' : 'pk-script text-6xl sm:text-7xl'}
            />
          </h1>

          <Typewriter
            as="p"
            block
            text={i18n.requestHonorOfPresence}
            active={hasOpened}
            delay={taglineAt}
            speed={32}
            className={`text-[#0C3826]/75 ${isSi ? 'font-sinhala text-sm' : 'pk-caps text-[10px] sm:text-xs leading-relaxed'}`}
          />

          {/* Tropical Couple Photo */}
          <Rise active={hasOpened} delay={taglineAt + 300} y={36}>
            <div className="pt-2">
              <div className="relative mx-auto w-full max-w-sm aspect-[4/5] rounded-t-full rounded-b-2xl overflow-hidden border-4 border-[#0C3826]/20 shadow-md bg-stone-200">
                <img
                  src={data.heroImageUrl || 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80'}
                  alt={`${data.brideName} & ${data.groomName}`}
                  className="w-full h-full object-cover"
                  style={{ transform: hasOpened ? 'scale(1)' : 'scale(1.2)', transition: 'transform 3000ms cubic-bezier(.2,.7,.2,1)' }}
                />
                <GlitterField count={22} seed={5} color="#f3d98b" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-4">
                  <span className={`text-white/95 ${isSi ? 'font-sinhala text-xs' : 'pk-script-alt text-2xl'}`}>
                    {isSi ? `සොඳුරු මංගල දිනය • ${monthYear}` : `Paradise Awaits • ${monthYear}`}
                  </span>
                </div>
              </div>
            </div>
          </Rise>
        </section>

        <LeafSprig className="mx-auto h-10 w-32 text-[#0C3826]/60" tone="#0C3826" />
        <WaveDivider />

        {/* CEREMONY & SUNSET RECEPTION CARD */}
        <Reveal>
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#D4A373]/30 shadow-sm text-center space-y-6 relative overflow-hidden">
            <GoldFrame inset={10} />
            <div className="space-y-1">
              <span className={kicker('font-semibold text-[#C86446] block')}>{isSi ? 'සාදර ඇරයුමයි' : 'Island Celebration'}</span>
              <h2 className={`text-[#0C3826] ${isSi ? 'font-sinhala text-2xl sm:text-3xl font-bold' : 'pk-script text-5xl'}`}>{i18n.sunsetReception}</h2>
            </div>

            <div className="py-4 border-y border-[#F6F3EC] space-y-1.5">
              <p className={kicker('text-[#C86446] font-semibold')}>{weekday}</p>
              <p className={`text-6xl sm:text-7xl font-bold leading-none pk-gold-text ${isSi ? 'font-serif' : 'pk-serif'}`}>{dayNumber}</p>
              <p className={`text-sm font-semibold text-[#0C3826] ${isSi ? 'font-sinhala' : ''}`}>{monthYear}</p>
              <div className={`flex items-center justify-center gap-1.5 text-xs text-[#0C3826]/80 pt-1 ${isSi ? 'font-sinhala text-sm' : ''}`}>
                <Calendar className="h-3.5 w-3.5 text-[#C86446]" />
                <span>{i18n.commencingAt(formattedTime)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className={kicker('text-[#C86446] font-semibold')}>{i18n.venueLabel}</p>
              <Typewriter
                as="p"
                block
                text={data.venue}
                speed={34}
                className={`text-[#0C3826] max-w-xs mx-auto ${isSi ? 'font-serif text-base font-semibold' : 'pk-serif text-xl font-semibold'}`}
              />

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
              <span className={kicker('font-semibold text-[#C86446] block')}>{i18n.timelineSchedule}</span>
              <h3 className={`text-[#0C3826] ${isSi ? 'font-sinhala text-xl font-bold' : 'pk-script text-4xl'}`}>{i18n.timelineHeader}</h3>
            </div>

            <Timeline
              items={itinerary}
              classes={{
                time: `text-xs font-mono font-bold text-[#0C3826] ${isSi ? 'font-sinhala' : ''}`,
                title: `text-[#0C3826] ${isSi ? 'font-sinhala text-sm font-bold' : 'pk-serif text-lg font-semibold'}`,
                desc: `text-xs text-[#0C3826]/75 ${isSi ? 'font-sinhala text-[13px]' : ''}`,
                dot: 'bg-[#C86446] ring-4 ring-[#C86446]/15',
                line: 'bg-[#0C3826]/15',
              }}
            />
          </section>
        </Reveal>

        {/* DRESS CODE CARD */}
        <Reveal>
          <section className="relative bg-[#0C3826] text-white rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-sm overflow-hidden">
            <GlitterField count={30} seed={21} color="#e8c871" />
            <div className="relative w-10 h-10 rounded-full bg-[#D4A373]/20 flex items-center justify-center mx-auto text-[#D4A373]">
              <Shirt className="h-5 w-5" />
            </div>
            <h3 className={`relative text-[#D4A373] ${isSi ? 'font-sinhala text-lg font-bold' : 'pk-script text-4xl'}`}>{i18n.dressCodeTitle}</h3>
            <Typewriter
              as="p"
              block
              speed={16}
              text={
                extra.dressCode ||
                (isSi
                  ? 'සැහැල්ලු හා අලංකාර විවාහ මංගල ඇඳුමින් සැරසී පැමිණෙන්න.'
                  : 'Island Formal & Tropical Elegance: Light breathable linens, pastel silk & floral prints. Sand-friendly footwear warmly recommended!')
              }
              className={`relative text-xs sm:text-sm text-emerald-100/90 max-w-sm mx-auto leading-relaxed ${isSi ? 'font-sinhala text-[13px]' : ''}`}
            />
          </section>
        </Reveal>

        {/* RSVP + SHARE */}
        <Reveal>
          <section className="text-center space-y-4">
            <p className={kicker('font-semibold text-[#C86446]')}>{i18n.kindlyReply}</p>
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
            <p className={kicker('font-semibold text-[#C86446]')}>{i18n.countdownPrefix}</p>
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {[
                { v: timeLeft.days, l: i18n.days },
                { v: timeLeft.hours, l: i18n.hours },
                { v: timeLeft.minutes, l: i18n.minutes },
              ].map((t) => (
                <div key={t.l} className="bg-white rounded-2xl p-4 border border-[#D4A373]/40 shadow-2xs">
                  <span className={`block text-3xl font-bold text-[#0C3826] tabular-nums ${isSi ? 'font-serif' : 'pk-serif'}`}>
                    <Tick value={t.v} />
                  </span>
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
          <LeafSprig className="mx-auto h-8 w-24 text-[#0C3826]/50" tone="#0C3826" />
          <p className={`text-[#0C3826] ${isSi ? 'font-sinhala text-sm' : 'pk-serif italic text-lg'}`}>{i18n.footerGreeting}</p>
          <p className={`text-[#C86446] ${isSi ? 'font-sinhala text-sm font-semibold' : 'pk-script text-3xl'}`}>
            {data.brideName} {i18n.andConjunction} {data.groomName}
          </p>
        </footer>
      </main>
    </div>
  );
};
