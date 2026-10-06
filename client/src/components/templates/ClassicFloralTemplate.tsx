import React, { useState } from 'react';
import { Calendar, MapPin, ExternalLink, Heart, Sparkles, Flower2 } from 'lucide-react';
import { TemplateComponentProps } from './types';
import {
  AddToCalendarButtons,
  FallingParticles,
  Lightbox,
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
import { GlitterField, GoldFrame, LeafSprig, PremiumStyles, Rise, Tick, Typewriter, WriteOn } from './premiumKit';
import { getInvitationI18n, formatWeddingDate } from '../../lib/invitationI18n';

const ROSE_GOLD = 'linear-gradient(135deg,#B76E79,#E8C9A0 45%,#B76E79)';

/**
 * DELUXE TIER — Classic Floral  (premium level 2)
 * Everything in Standard, plus: falling petals, photo lightbox with swipe/keys,
 * love story, live seconds countdown, ceremony timeline, music toggle,
 * + calligraphy "pen-stroke" names, typewriter story/tagline, rose-gold diamond-corner frames,
 * rose-gold glitter, slow-zoom hero, staggered gallery reveal, flip-in countdown digits.
 */
export const ClassicFloralTemplate: React.FC<TemplateComponentProps> = ({ data, hasOpened, onOpen }) => {
  const extra = getExtras(data);
  const isSi = data.language === 'si';
  const i18n = getInvitationI18n(data.language);

  const { weekday, dayNumber, monthYear, formattedTime } = formatWeddingDate(data.eventDate, data.language);

  const timeLeft = useCountdown(data.eventDate, true);
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Gallery images with curated fallbacks for Deluxe Romance
  const gallery =
    data.galleryImages && data.galleryImages.length > 0
      ? data.galleryImages
      : [
          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1545232979-fbf68fe9f1f8?auto=format&fit=crop&w=600&q=80',
        ];

  const itinerary =
    extra.itinerary && extra.itinerary.length > 0 ? extra.itinerary : defaultTimeline(data.eventDate, undefined, data.language);

  const bride = data.brideName || '';
  const groom = data.groomName || '';
  const taglineAt = 3600;

  const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B76E79] focus-visible:ring-offset-2';
  const ghostBtn = `inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-[#B76E79]/40 bg-white hover:bg-[#FAF6F2] text-[#B76E79] text-xs font-semibold transition-colors min-h-[44px] ${focus}`;
  const kicker = (c: string) => `${isSi ? 'font-sinhala text-sm' : 'pk-caps text-[10px]'} ${c}`;
  const heading = (c = '') => `${isSi ? 'font-sinhala text-2xl font-bold' : 'pk-script text-5xl'} ${c}`;

  const countdownItems = [
    { v: timeLeft.days, l: i18n.days },
    { v: timeLeft.hours, l: i18n.hours },
    { v: timeLeft.minutes, l: i18n.minutes },
    { v: timeLeft.seconds, l: i18n.seconds },
  ];

  return (
    <div
      className={`min-h-screen-dvh bg-[#FAF6F2] text-[#3D332A] antialiased overflow-x-hidden selection:bg-[#B76E79] selection:text-white ${
        isSi ? `font-serif ${getSinhalaFontClass(data.fontStyle)}` : 'pk-body'
      }`}
    >
      <TemplateStyles />
      <PremiumStyles />
      <ScrollProgress className="bg-gradient-to-r from-[#B76E79] to-[#C5A880]" />
      {hasOpened && <FallingParticles kind="petal" count={14} />}
      <Lightbox images={gallery} index={lightbox} onChange={setLightbox} />

      {/* INTRO SEAL OVERLAY */}
      {!hasOpened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C221E] text-white">
          <GlitterField count={50} seed={31} color="#E8C9A0" />
          <div className="relative w-full max-w-sm px-8 py-12 text-center rounded-3xl border border-[#C5A880]/30 bg-[#352B26] shadow-2xl space-y-6">
            <GoldFrame inset={10} gradient={ROSE_GOLD} corners />
            <div className="w-14 h-14 rounded-full bg-[#B76E79]/20 flex items-center justify-center mx-auto text-[#B76E79]">
              <Flower2 className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <Typewriter
                as="p"
                block
                text={i18n.togetherWithFamilies}
                speed={38}
                delay={300}
                className={kicker('text-[#C5A880] font-semibold')}
              />
              <h2 className="leading-tight">
                <WriteOn block delay={900} duration={1800}>
                  <span className={isSi ? 'text-3xl font-bold' : 'pk-script text-6xl'}>{bride}</span>
                </WriteOn>
                <span className={`block my-0.5 text-[#B76E79] ${isSi ? 'font-sinhala text-lg' : 'pk-script-alt text-3xl'}`}>{i18n.andConjunction}</span>
                <WriteOn block delay={2300} duration={1800}>
                  <span className={isSi ? 'text-3xl font-bold' : 'pk-script text-6xl'}>{groom}</span>
                </WriteOn>
              </h2>
              <p className={`text-xs text-stone-300 pt-1 ${isSi ? 'font-sinhala text-sm' : ''}`}>
                {data.guestName ? i18n.preparedForGuest(data.guestName) : i18n.requestPleasureOfCompany}
              </p>
            </div>

            <button
              onClick={onOpen}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#B76E79] to-[#C5A880] hover:from-[#C5A880] hover:to-[#B76E79] text-white font-semibold text-xs tracking-wider uppercase shadow-lg transition-transform active:scale-95 min-h-[48px]"
            >
              <Sparkles className="h-4 w-4" />
              <span className={isSi ? 'font-sinhala normal-case' : ''}>{i18n.openInvitation}</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-xl mx-auto px-5 sm:px-8 py-16 sm:py-20 space-y-14">
        {/* Tier Badge */}
        <div className="text-center">
          <span
            className={`inline-block px-3 py-1 text-[10px] uppercase tracking-widest font-semibold bg-[#B76E79]/10 text-[#B76E79] rounded-full border border-[#B76E79]/20 ${
              isSi ? 'font-sinhala' : ''
            }`}
          >
            {isSi ? 'රොමෑන්ටික් මල් සැරසිලි තේමාව • Classic Floral' : 'Deluxe Romance Tier • Classic Floral'}
          </span>
        </div>

        {/* HERO SECTION */}
        <section className="text-center space-y-5">
          <Rise active={hasOpened} delay={100}>
            <div className={`inline-flex items-center gap-2 text-[#B76E79] ${isSi ? 'font-sinhala text-xs' : 'pk-caps text-[10px]'}`}>
              <Flower2 className="h-3.5 w-3.5" />
              <span>{isSi ? 'මංගල සැමරුම' : 'Nuptial Celebration'}</span>
              <Flower2 className="h-3.5 w-3.5" />
            </div>
          </Rise>

          <h1 className="text-[#2C221E] leading-tight">
            <WriteOn block active={hasOpened} delay={500} duration={2000}>
              <span className={isSi ? 'text-4xl sm:text-5xl font-bold' : 'pk-script text-6xl sm:text-7xl'}>{bride}</span>
            </WriteOn>
            <Rise as="span" active={hasOpened} delay={1500} className="block">
              <span className={`block my-1 text-[#B76E79] ${isSi ? 'font-sinhala text-xl' : 'pk-script-alt text-4xl'}`}>{i18n.andConjunction}</span>
            </Rise>
            <WriteOn block active={hasOpened} delay={2000} duration={2000}>
              <span className={isSi ? 'text-4xl sm:text-5xl font-bold' : 'pk-script text-6xl sm:text-7xl'}>{groom}</span>
            </WriteOn>
          </h1>

          <Typewriter
            as="p"
            block
            text={i18n.requestHonorOfPresence}
            active={hasOpened}
            delay={taglineAt}
            speed={32}
            className={`text-stone-600 ${isSi ? 'font-sinhala text-sm' : 'pk-caps text-[10px] sm:text-xs leading-relaxed'}`}
          />

          {/* Floral Arch Couple Photo */}
          <Rise active={hasOpened} delay={taglineAt + 400} y={36}>
            <div className="pt-2">
              <div className="pk-float relative mx-auto w-full max-w-sm aspect-[4/5] rounded-full overflow-hidden border-4 border-[#C5A880]/30 shadow-md bg-stone-100 p-2">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <img
                    src={data.heroImageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'}
                    alt={`${data.brideName} & ${data.groomName}`}
                    className="w-full h-full object-cover"
                    style={{ transform: hasOpened ? 'scale(1)' : 'scale(1.2)', transition: 'transform 3200ms cubic-bezier(.2,.7,.2,1)' }}
                  />
                  <GlitterField count={26} seed={9} color="#F3D9B5" bias="even" />
                </div>
              </div>
            </div>
          </Rise>
        </section>

        {/* BOTANICAL CEREMONY & RECEPTION CARD */}
        <Reveal>
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#C5A880]/40 shadow-sm text-center space-y-6 relative overflow-hidden">
            <GoldFrame inset={10} gradient={ROSE_GOLD} corners />
            <div className="w-10 h-10 rounded-full bg-[#B76E79]/10 flex items-center justify-center mx-auto text-[#B76E79]">
              <Flower2 className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <span className={kicker('font-semibold text-[#B76E79] block')}>{i18n.holyMatrimony}</span>
              <h2 className={heading('text-[#2C221E]')}>{i18n.ceremonyAndReception}</h2>
            </div>

            <div className="py-4 border-y border-[#FAF6F2] space-y-1.5">
              <p className={kicker('text-[#B76E79] font-semibold')}>{weekday}</p>
              <p className={`text-6xl sm:text-7xl font-bold leading-none pk-gold-text ${isSi ? 'font-serif' : 'pk-serif'}`}>{dayNumber}</p>
              <p className={`text-sm font-semibold text-[#2C221E] ${isSi ? 'font-sinhala' : ''}`}>{monthYear}</p>
              <div className={`flex items-center justify-center gap-1.5 text-xs text-stone-600 pt-1 ${isSi ? 'font-sinhala text-sm' : ''}`}>
                <Calendar className="h-3.5 w-3.5 text-[#B76E79]" />
                <span>{i18n.commencingAt(formattedTime)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className={kicker('text-[#B76E79] font-semibold')}>{i18n.venueLabel}</p>
              <Typewriter
                as="p"
                block
                text={data.venue}
                speed={34}
                className={`text-[#2C221E] max-w-xs mx-auto ${isSi ? 'font-serif text-base font-semibold' : 'pk-serif text-xl font-semibold'}`}
              />

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                {data.mapUrl && (
                  <a
                    href={data.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#B76E79] hover:bg-[#A35D68] text-white text-xs font-semibold shadow-xs transition-colors min-h-[44px] ${focus}`}
                  >
                    <MapPin className="h-3.5 w-3.5 text-rose-200" />
                    <span className={isSi ? 'font-sinhala' : ''}>{i18n.openGoogleMaps}</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
                <AddToCalendarButtons data={data} withIcs className={ghostBtn} />
              </div>
            </div>
          </section>
        </Reveal>

        {/* OUR LOVE STORY */}
        <Reveal>
          <section className="relative bg-[#FAF0E6]/70 rounded-3xl p-8 sm:p-10 border border-[#C5A880]/30 text-center space-y-4 overflow-hidden">
            <GlitterField count={18} seed={13} color="#C5A880" bias="even" />
            <Heart className="relative h-6 w-6 text-[#B76E79] mx-auto fill-[#B76E79]/20" />
            <h3 className={`relative ${heading('text-[#2C221E]')}`}>{i18n.loveStoryTitle}</h3>
            <LeafSprig className="relative mx-auto h-8 w-24 text-[#B76E79]/70" tone="#B76E79" />
            <Typewriter
              as="p"
              block
              speed={24}
              text={
                data.storyText ||
                (isSi
                  ? 'අපගේ දෙමවුපියන්ගේ ආශිර්වාදය ඇතිව, අපගේ විවාහ මංගල්‍යයට ඔබ සැමට ඉතා ආදරයෙන් ආරාධනා කර සිටිමු.'
                  : 'From our first quiet conversations to this cherished moment, our path together has been guided by patience, unconditional joy, and deep devotion. We are overjoyed to welcome you into this next chapter.')
              }
              className={`relative text-stone-700 leading-relaxed max-w-md mx-auto ${isSi ? 'font-sinhala text-base' : 'pk-serif italic text-xl'}`}
            />
          </section>
        </Reveal>

        {/* CEREMONY TIMELINE */}
        <Reveal>
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A880]/30 space-y-6">
            <div className="text-center space-y-1">
              <span className={kicker('font-semibold text-[#B76E79] block')}>{i18n.timelineHeader}</span>
              <h3 className={heading('text-[#2C221E]')}>{i18n.timelineSchedule}</h3>
            </div>
            <Timeline
              items={itinerary}
              classes={{
                time: `text-xs font-semibold text-[#B76E79] ${isSi ? 'font-sinhala' : ''}`,
                title: `text-[#2C221E] ${isSi ? 'font-sinhala text-sm font-bold' : 'pk-serif text-lg font-semibold'}`,
                desc: `text-xs text-stone-600 ${isSi ? 'font-sinhala text-[13px]' : ''}`,
                dot: 'bg-[#B76E79] ring-4 ring-[#B76E79]/15',
                line: 'bg-[#C5A880]/40',
              }}
            />
          </section>
        </Reveal>

        {/* PHOTO MOMENTS GALLERY */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className={heading('text-[#2C221E]')}>{i18n.momentsTogether}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {gallery.map((img, i) => (
              <Rise key={i} delay={(i % 2) * 150} y={30}>
                <button
                  type="button"
                  onClick={() => setLightbox(i)}
                  aria-label={`Open couple moment ${i + 1}`}
                  className={`block w-full aspect-square rounded-2xl overflow-hidden border border-[#C5A880]/30 shadow-2xs bg-stone-100 ${focus}`}
                >
                  <img
                    src={img}
                    alt={`Couple moment ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                </button>
              </Rise>
            ))}
          </div>
        </section>

        {/* RSVP + SHARE */}
        <Reveal>
          <section className="text-center space-y-4">
            <p className={kicker('font-semibold text-[#B76E79]')}>{i18n.kindlyReply}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <RsvpButton
                phone={extra.rsvpPhone}
                data={data}
                className={`inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#B76E79] to-[#C5A880] text-white text-xs font-semibold shadow-md transition-transform active:scale-95 min-h-[44px] ${focus}`}
              />
              <ShareButton data={data} className={ghostBtn} />
            </div>
          </section>
        </Reveal>

        {/* ROMANTIC COUNTDOWN */}
        <Reveal>
          <section className="text-center space-y-4">
            <p className={kicker('font-semibold text-[#B76E79]')}>{i18n.countdownPrefix}</p>
            <div className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto">
              {countdownItems.map((t) => (
                <div key={t.l} className="bg-white rounded-2xl p-3 border border-[#C5A880]/30 shadow-2xs">
                  <span className={`block text-2xl sm:text-3xl font-bold text-[#2C221E] tabular-nums ${isSi ? 'font-serif' : 'pk-serif'}`}>
                    <Tick value={t.v} />
                  </span>
                  <span className={`block text-[10px] uppercase font-bold tracking-wider text-[#B76E79] mt-1 ${isSi ? 'font-sinhala tracking-normal text-xs' : ''}`}>
                    {t.l}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* FLORAL FOOTER */}
        <footer className="pt-8 border-t border-[#C5A880]/20 text-center space-y-2 text-stone-600 text-xs">
          <LeafSprig className="mx-auto h-8 w-24 text-[#B76E79]/60" tone="#B76E79" />
          <p className={`text-[#2C221E] ${isSi ? 'font-sinhala text-sm' : 'pk-serif italic text-lg'}`}>{i18n.footerGreeting}</p>
          <p className={`text-[#B76E79] ${isSi ? 'font-sinhala text-sm font-semibold' : 'pk-script text-3xl'}`}>
            {data.brideName} {i18n.andConjunction} {data.groomName}
          </p>
        </footer>
      </main>
    </div>
  );
};
