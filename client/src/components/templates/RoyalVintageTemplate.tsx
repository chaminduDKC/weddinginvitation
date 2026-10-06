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
import { GlitterField, GoldFrame, LeafSprig, PremiumStyles, Rise, SplitWords, Tick, Tilt, Typewriter, WriteOn } from './premiumKit';
import { getInvitationI18n, formatWeddingDate } from '../../lib/invitationI18n';

/** helper: rotating gold border colour-fill var for .pk-orbit */
const fill = (c: string) => ({ '--pk-fill': c } as React.CSSProperties);

/**
 * PREMIUM TIER — Royal Vintage  (premium level 3)
 * Everything in Deluxe, plus: animated wax-seal break, shimmering gold names,
 * drifting gold dust, guest-count RSVP form (WhatsApp), ceremony timeline,
 * dress code, optional gift note, optional gallery with lightbox,
 * + Pinyon calligraphy names written with a pen stroke, gold-burst seal break,
 * 3D-tilt portrait, rotating gold-orbit card borders, light-sheen sweep,
 * word-by-word headings, sequentially typed entourage, dense gold glitter.
 */
export const RoyalVintageTemplate: React.FC<TemplateComponentProps> = ({ data, hasOpened, onOpen }) => {
  const extra = getExtras(data);
  const isSi = data.language === 'si';
  const i18n = getInvitationI18n(data.language);

  const { weekday, dayNumber, monthYear, formattedTime } = formatWeddingDate(data.eventDate, data.language);

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
  const bride = data.brideName || '';
  const groom = data.groomName || '';

  // Royal entourage defaults
  const entourage = data.entourage || {
    parentsOfBride: isSi ? 'විජේසේකර මවුපියවරුන්' : 'Mr. & Mrs. Wijesekara',
    parentsOfGroom: isSi ? 'ජයසුන්දර මවුපියවරුන්' : 'Mr. & Mrs. Jayasundara',
    maidOfHonor: isSi ? 'චමරි පෙරේරා' : 'Chamari Perera',
    bestMan: isSi ? 'නිශාන් ප්‍රනාන්දු' : 'Nishan Fernando',
  };

  const itinerary =
    extra.itinerary && extra.itinerary.length > 0 ? extra.itinerary : defaultTimeline(data.eventDate, undefined, data.language);

  const gallery = extra.galleryImages ?? [];

  const focus =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B132B]';
  const goldGhost = `inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-[#D4AF37]/60 bg-transparent hover:bg-[#D4AF37]/10 text-[#9A7B2C] text-xs font-bold transition-colors min-h-[44px] ${focus}`;
  const darkGhost = `inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold transition-colors min-h-[44px] ${focus}`;
  const kicker = (c: string) => `${isSi ? 'font-sinhala text-xs' : 'pk-caps text-[10px]'} ${c}`;
  const heading = (c = '') => `${isSi ? 'font-sinhala text-2xl font-bold' : 'pk-pinyon text-5xl'} ${c}`;

  const countdownItems = [
    { v: timeLeft.days, l: i18n.days },
    { v: timeLeft.hours, l: i18n.hours },
    { v: timeLeft.minutes, l: i18n.minutes },
    { v: timeLeft.seconds, l: i18n.seconds },
  ];

  const nameCls = isSi ? 'text-4xl sm:text-5xl font-bold' : 'pk-pinyon text-6xl sm:text-7xl';

  return (
    <div
      className={`min-h-screen-dvh bg-[#0B132B] text-[#FAF7EE] antialiased overflow-x-hidden selection:bg-[#D4AF37] selection:text-[#0B132B] ${
        isSi ? `font-serif ${getSinhalaFontClass(data.fontStyle)}` : 'pk-body'
      }`}
    >
      <TemplateStyles />
      <PremiumStyles />
      <ScrollProgress className="bg-gradient-to-r from-[#9A7B2C] via-[#FDE047] to-[#9A7B2C]" />
      {hasOpened && <FallingParticles kind="gold" count={20} />}
      {gallery.length > 0 && <Lightbox images={gallery} index={lightbox} onChange={setLightbox} />}

      {/* ROYAL WAX MONOGRAM SEAL OVERLAY */}
      {!hasOpened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060A17] text-white">
          <GlitterField count={70} seed={41} />
          <div className="relative w-full max-w-sm px-8 py-12 text-center rounded-3xl border-2 border-[#D4AF37]/50 bg-[#0B132B] shadow-2xl space-y-6">
            <GoldFrame inset={9} corners />
            {/* Wax Seal Stamp */}
            <div className="relative mx-auto w-24 h-24">
              {!breaking && <span aria-hidden="true" className="tx-ring absolute inset-0 rounded-full border border-[#D4AF37]" />}
              {breaking && <span aria-hidden="true" className="pk-burst absolute inset-0 rounded-full border-2 border-[#FDE047]" />}
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
              <Typewriter
                as="p"
                block
                text={isSi ? 'රාජකීය මංගල නිවේදනය' : 'Royal Wedding Proclamation'}
                speed={55}
                delay={400}
                className={kicker('text-[#D4AF37] font-bold')}
              />
              <h2 className="leading-tight text-white">
                <WriteOn block delay={1200} duration={1900}>
                  <span className={`pk-gold-text ${isSi ? 'text-3xl font-bold' : 'pk-pinyon text-5xl'}`}>{bride}</span>
                </WriteOn>
                <span className={`block my-0.5 text-[#D4AF37] ${isSi ? 'font-sinhala text-lg' : 'pk-script-alt text-3xl'}`}>{i18n.andConjunction}</span>
                <WriteOn block delay={2700} duration={1900}>
                  <span className={`pk-gold-text ${isSi ? 'text-3xl font-bold' : 'pk-pinyon text-5xl'}`}>{groom}</span>
                </WriteOn>
              </h2>
              <p className={`text-xs text-slate-300 pt-1 ${isSi ? 'font-sinhala' : ''}`}>
                {data.guestName ? (isSi ? `${data.guestName} වෙත ගෞරවයෙන් පුද කෙරේ` : `Formally addressed to ${data.guestName}`) : i18n.youAreInvited}
              </p>
            </div>

            <button
              onClick={breakSeal}
              disabled={breaking}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#D4AF37] hover:brightness-110 text-[#0B132B] font-bold text-xs tracking-wider uppercase shadow-xl transition-transform active:scale-95 min-h-[48px] disabled:opacity-80"
            >
              <Sparkles className="h-4 w-4" />
              <span className={isSi ? 'font-sinhala normal-case' : ''}>{isSi ? 'රාජකීය මුද්‍රාව විවෘත කරන්න' : 'Break the Royal Seal & Enter'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-xl mx-auto px-5 sm:px-8 py-16 sm:py-20 space-y-14">
        {/* Tier Badge */}
       

        {/* HERO SECTION */}
        <section className="relative text-center space-y-6">
          <GlitterField count={60} seed={77} className="-mx-8" />
          <Rise active={hasOpened} delay={100}>
            <div className={`relative inline-flex items-center gap-2 text-[#D4AF37] ${isSi ? 'font-sinhala text-xs' : 'pk-caps text-[10px]'}`}>
              <Crown className="h-4 w-4" />
              <span>{isSi ? 'මංගල ප්‍රකාශනය' : 'Grand Nuptials'}</span>
              <Crown className="h-4 w-4" />
            </div>
          </Rise>

          <h1 className="relative leading-tight text-white">
            <WriteOn block active={hasOpened} delay={600} duration={2200}>
              <span className={`pk-gold-text ${nameCls}`}>{bride}</span>
            </WriteOn>
            <Rise as="span" active={hasOpened} delay={1700} className="block">
              <span className={`block my-1 text-[#D4AF37] ${isSi ? 'font-sinhala text-xl' : 'pk-script-alt text-4xl'}`}>{i18n.andConjunction}</span>
            </Rise>
            <WriteOn block active={hasOpened} delay={2300} duration={2200}>
              <span className={`pk-gold-text ${nameCls}`}>{groom}</span>
            </WriteOn>
          </h1>

          <Typewriter
            as="p"
            block
            text={i18n.requestHonorOfPresence}
            active={hasOpened}
            delay={4300}
            speed={30}
            className={`relative text-slate-300 max-w-sm mx-auto ${isSi ? 'font-sinhala text-sm' : 'pk-caps text-[10px] sm:text-xs leading-relaxed'}`}
          />

          {/* Royal Frame Couple Photo */}
          <Rise active={hasOpened} delay={4700} y={40}>
            <div className="pt-2">
              <Tilt max={7}>
                <div className="pk-sheen relative mx-auto w-full max-w-sm aspect-[4/5] rounded-2xl border-4 border-[#D4AF37] p-2 bg-[#1C2541] shadow-2xl">
                  <div className="w-full h-full rounded-xl overflow-hidden border border-[#D4AF37]/40">
                    <img
                      src={data.heroImageUrl || 'https://images.unsplash.com/photo-1545232979-fbf68fe9f1f8?auto=format&fit=crop&w=800&q=80'}
                      alt={`${data.brideName} & ${data.groomName}`}
                      className="w-full h-full object-cover"
                      style={{ transform: hasOpened ? 'scale(1)' : 'scale(1.2)', transition: 'transform 3500ms cubic-bezier(.2,.7,.2,1)' }}
                    />
                  </div>
                </div>
              </Tilt>
            </div>
          </Rise>
        </section>

        {/* ROYAL BANQUET & CEREMONY CARD */}
        <Reveal>
          <section className="pk-orbit pk-sheen bg-[#FAF7EE] text-[#0B132B] rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6 relative" style={fill('#FAF7EE')}>
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto">
              <Crown className="h-6 w-6 text-[#9A7B2C]" />
            </div>

            <div className="space-y-1">
              <span className={kicker('font-bold text-[#800E13] block')}>{isSi ? 'සාදර ඇරයුමයි' : 'By Royal Proclamation'}</span>
              <h2 className={heading('text-[#0B132B]')}>
                <SplitWords text={i18n.grandRoyalBanquet} />
              </h2>
            </div>

            <div className="py-4 border-y border-[#D4AF37]/30 space-y-1.5">
              <p className={kicker('text-[#800E13] font-bold')}>{weekday}</p>
              <p className={`text-6xl sm:text-7xl font-bold leading-none pk-gold-text ${isSi ? 'font-serif' : 'pk-serif'}`}>{dayNumber}</p>
              <p className={`text-sm font-bold text-[#0B132B] ${isSi ? 'font-sinhala' : ''}`}>{monthYear}</p>
              <div className={`flex items-center justify-center gap-1.5 text-xs text-stone-600 pt-1 ${isSi ? 'font-sinhala text-sm' : ''}`}>
                <Calendar className="h-3.5 w-3.5 text-[#9A7B2C]" />
                <span>{i18n.commencingAt(formattedTime)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className={kicker('text-[#800E13] font-bold')}>{i18n.venueLabel}</p>
              <Typewriter
                as="p"
                block
                text={data.venue}
                speed={34}
                className={`text-[#0B132B] max-w-xs mx-auto ${isSi ? 'font-serif text-base font-bold' : 'pk-serif text-xl font-semibold'}`}
              />

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
          <section className="pk-orbit bg-[#1C2541] rounded-3xl p-6 sm:p-8 space-y-6" style={fill('#1C2541')}>
            <div className="text-center space-y-1">
              <span className={kicker('text-[#D4AF37] font-bold block')}>{i18n.timelineHeader}</span>
              <h3 className={heading('text-white')}>{i18n.timelineSchedule}</h3>
            </div>
            <Timeline
              items={itinerary}
              classes={{
                time: `text-xs font-bold text-[#D4AF37] ${isSi ? 'font-sinhala' : ''}`,
                title: `text-white ${isSi ? 'font-sinhala text-base font-bold' : 'pk-serif text-xl font-semibold'}`,
                desc: `text-xs text-slate-300 ${isSi ? 'font-sinhala text-[13px]' : ''}`,
                dot: 'bg-[#D4AF37] ring-4 ring-[#D4AF37]/20 shadow-[0_0_8px_rgba(212,175,55,0.5)]',
                line: 'bg-[#D4AF37]/30',
              }}
            />
          </section>
        </Reveal>

        {/* THE ROYAL ENTOURAGE & BRIDAL PARTY */}
        <Reveal>
          <section className="pk-orbit bg-[#1C2541] rounded-3xl p-6 sm:p-8 space-y-6" style={fill('#1C2541')}>
            <div className="text-center space-y-1">
              <div className={`inline-flex items-center gap-1.5 text-[#D4AF37] font-bold ${isSi ? 'font-sinhala text-xs' : 'pk-caps text-[10px]'}`}>
                <Users className="h-3.5 w-3.5" />
                <span>{i18n.entourageHeader}</span>
              </div>
              <h3 className={heading('text-white')}>{i18n.bridalParty}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center sm:text-left">
              {[
                { l: i18n.parentsOfBride, v: entourage.parentsOfBride },
                { l: i18n.parentsOfGroom, v: entourage.parentsOfGroom },
                { l: i18n.maidOfHonor, v: entourage.maidOfHonor },
                { l: i18n.bestMan, v: entourage.bestMan },
              ].map((p:any, i) => (
                <div key={p.l} className="p-4 rounded-2xl bg-[#0B132B]/80 border border-[#D4AF37]/20 space-y-1">
                  <span className={`block text-[#D4AF37] font-bold ${isSi ? 'font-sinhala text-xs' : 'pk-caps text-[9px]'}`}>{p.l}</span>
                  <Typewriter
                    as="p"
                    block
                    text={p.v}
                    delay={i * 450}
                    speed={45}
                    className={`text-white ${isSi ? 'font-sinhala text-sm font-bold' : 'pk-serif text-lg font-semibold'}`}
                  />
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* DRESS CODE */}
        <Reveal>
          <section className="relative bg-[#1C2541] text-white rounded-3xl p-6 sm:p-8 text-center border border-[#D4AF37]/40 space-y-3 shadow-lg overflow-hidden">
            <GlitterField count={26} seed={53} />
            <div className="relative w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto text-[#D4AF37]">
              <Shirt className="h-5 w-5" />
            </div>
            <h3 className={`relative ${heading('text-[#D4AF37]')}`}>{i18n.dressCodeTitle}</h3>
            <Typewriter
              as="p"
              block
              text={extra.dressCode || i18n.defaultDressCode}
              speed={18}
              className={`relative text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed ${isSi ? 'font-sinhala text-[13px]' : ''}`}
            />
          </section>
        </Reveal>

        {/* OPTIONAL GALLERY */}
        {gallery.length > 0 && (
          <section className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className={heading('text-white')}>{i18n.momentsTogether}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              {gallery.map((img, i) => (
                <Rise key={i} delay={(i % 2) * 150} y={30}>
                  <button
                    type="button"
                    onClick={() => setLightbox(i)}
                    aria-label={`Open portrait ${i + 1}`}
                    className={`pk-sheen block w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#D4AF37]/60 bg-[#1C2541] ${focus}`}
                  >
                    <img src={img} alt={`Couple portrait ${i + 1}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                  </button>
                </Rise>
              ))}
            </div>
          </section>
        )}

        {/* GIFT NOTE (only when provided) */}
        {extra.giftNote && (
          <Reveal>
            <section className="bg-[#1C2541] rounded-3xl p-6 sm:p-8 text-center border border-[#D4AF37]/40 space-y-3">
              <Gift className="h-5 w-5 text-[#D4AF37] mx-auto" />
              <h3 className={heading('text-[#D4AF37]')}>{i18n.giftsTitle}</h3>
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

        {/* RSVP */}
        <Reveal>
          <section className="pk-orbit pk-sheen bg-[#FAF7EE] text-[#0B132B] rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-xl" style={fill('#FAF7EE')}>
            <div className="space-y-1">
              <span className={kicker('font-bold text-[#800E13] block')}>{isSi ? 'ප්‍රතිචාර දක්වන්න' : 'The Favour of a Reply'}</span>
              <h3 className={heading('text-[#0B132B]')}>{i18n.kindlyReply}</h3>
            </div>

            <RsvpForm
              phone={extra.rsvpPhone}
              data={data}
              classes={{
                wrap: 'space-y-5',
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
          <section className="text-center space-y-4">
            <p className={kicker('font-bold text-[#D4AF37]')}>{i18n.countdownPrefix}</p>
            <div className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto">
              {countdownItems.map((t) => (
                <div key={t.l} className="bg-[#1C2541] rounded-2xl p-3 border border-[#D4AF37]/50 shadow-md">
                  <span className={`block text-2xl sm:text-3xl font-bold text-white tabular-nums ${isSi ? 'font-serif' : 'pk-serif'}`}>
                    <Tick value={t.v} />
                  </span>
                  <span className={`block text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] mt-1 ${isSi ? 'font-sinhala tracking-normal text-xs' : ''}`}>
                    {t.l}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ROYAL FOOTER */}
        <footer className="pt-8 border-t border-[#D4AF37]/30 text-center space-y-2 text-slate-300 text-xs">
          <LeafSprig className="mx-auto h-8 w-24 text-[#D4AF37]/70" tone="#D4AF37" />
          <p className={`text-[#FAF7EE] ${isSi ? 'font-sinhala text-sm' : 'pk-serif italic text-lg'}`}>
            {isSi ? 'ඔබ සැම ගෞරවයෙන් පිළිගැනීමට අපි මහත් ආශාවෙන් බලා සිටිමු.' : 'We eagerly anticipate welcoming you with highest royal honors.'}
          </p>
          <p className={`${isSi ? 'font-sinhala text-sm font-bold text-[#D4AF37]' : 'pk-pinyon pk-gold-text text-4xl'}`}>
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
