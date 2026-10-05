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
import { getInvitationI18n, formatWeddingDate } from '../../lib/invitationI18n';

/**
 * DELUXE TIER — Classic Floral
 * Everything in Standard, plus: falling petals, photo lightbox with swipe/keys,
 * love story, live seconds countdown, ceremony timeline, music toggle.
 */
export const ClassicFloralTemplate: React.FC<TemplateComponentProps> = ({
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
    extra.itinerary && extra.itinerary.length > 0
      ? extra.itinerary
      : defaultTimeline(data.eventDate, undefined, data.language);

  const focus =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B76E79] focus-visible:ring-offset-2';
  const ghostBtn = `inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-[#B76E79]/40 bg-white hover:bg-[#FAF6F2] text-[#B76E79] text-xs font-semibold transition-colors min-h-[44px] ${focus}`;

  const countdownItems = [
    { v: timeLeft.days, l: i18n.days },
    { v: timeLeft.hours, l: i18n.hours },
    { v: timeLeft.minutes, l: i18n.minutes },
    { v: timeLeft.seconds, l: i18n.seconds },
  ];

  return (
    <div className={`min-h-screen-dvh bg-[#FAF6F2] text-[#3D332A] font-serif antialiased overflow-x-hidden selection:bg-[#B76E79] selection:text-white ${isSi ? getSinhalaFontClass(data.fontStyle) : ''}`}>
      <TemplateStyles />
      <ScrollProgress className="bg-gradient-to-r from-[#B76E79] to-[#C5A880]" />
      {hasOpened && <FallingParticles kind="petal" count={14} />}
      <Lightbox images={gallery} index={lightbox} onChange={setLightbox} />

      {/* INTRO SEAL OVERLAY */}
      {!hasOpened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C221E] text-white">
          <div className="relative w-full max-w-sm px-8 py-12 text-center rounded-3xl border border-[#C5A880]/40 bg-[#352B26] shadow-2xl space-y-6">
            <div className="w-14 h-14 rounded-full bg-[#B76E79]/20 flex items-center justify-center mx-auto text-[#B76E79]">
              <Flower2 className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <span className={`text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-sans font-semibold ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
                {i18n.togetherWithFamilies}
              </span>
              <h2 className="text-3xl font-bold leading-tight">
                {data.brideName}
                <span className={`block text-xl italic font-normal text-[#B76E79] my-1 ${isSi ? 'font-sinhala not-italic text-lg' : ''}`}>
                  {i18n.andConjunction}
                </span>
                {data.groomName}
              </h2>
              <p className={`text-xs text-stone-300 font-sans pt-1 ${isSi ? 'font-sinhala text-sm' : ''}`}>
                {data.guestName ? i18n.preparedForGuest(data.guestName) : i18n.requestPleasureOfCompany}
              </p>
            </div>

            <button
              onClick={onOpen}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#B76E79] to-[#C5A880] hover:from-[#C5A880] hover:to-[#B76E79] text-white font-sans font-semibold text-xs tracking-wider uppercase shadow-lg transition-transform active:scale-95 min-h-[48px]"
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
        <div className="text-center font-sans">
          <span className={`inline-block px-3 py-1 text-[10px] uppercase tracking-widest font-semibold bg-[#B76E79]/10 text-[#B76E79] rounded-full border border-[#B76E79]/20 ${isSi ? 'font-sinhala' : ''}`}>
            {isSi ? 'රොමෑන්ටික් මල් සැරසිලි තේමාව • Classic Floral' : 'Deluxe Romance Tier • Classic Floral'}
          </span>
        </div>

        {/* HERO SECTION */}
        <section className="text-center space-y-5">
          <div className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#B76E79] font-sans font-medium ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
            <Flower2 className="h-3.5 w-3.5" />
            <span>{isSi ? 'මංගල සැමරුම' : 'Nuptial Celebration'}</span>
            <Flower2 className="h-3.5 w-3.5" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#2C221E] leading-tight">
            <span>{data.brideName}</span>
            <span className={`block text-2xl sm:text-3xl italic font-normal text-[#B76E79] my-1.5 ${isSi ? 'font-sinhala not-italic text-xl' : ''}`}>
              {i18n.andConjunction}
            </span>
            <span>{data.groomName}</span>
          </h1>

          <p className={`text-xs sm:text-sm text-stone-600 italic ${isSi ? 'font-sinhala not-italic text-sm' : ''}`}>
            {i18n.requestHonorOfPresence}
          </p>

          {/* Floral Arch Couple Photo */}
          <div className="pt-2">
            <div className="relative mx-auto w-full max-w-sm aspect-[4/5] rounded-full overflow-hidden border-4 border-[#C5A880]/30 shadow-md bg-stone-100 p-2">
              <div className="w-full h-full rounded-full overflow-hidden">
                <img
                  src={
                    data.heroImageUrl ||
                    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={`${data.brideName} & ${data.groomName}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* BOTANICAL CEREMONY & RECEPTION CARD */}
        <Reveal>
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#C5A880]/40 shadow-sm text-center space-y-6 relative overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-[#B76E79]/10 flex items-center justify-center mx-auto text-[#B76E79]">
              <Flower2 className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <span className={`text-[11px] uppercase tracking-[0.25em] font-sans font-semibold text-[#B76E79] ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
                {i18n.holyMatrimony}
              </span>
              <h2 className={`text-2xl sm:text-3xl font-bold text-[#2C221E] ${isSi ? 'font-sinhala' : ''}`}>
                {i18n.ceremonyAndReception}
              </h2>
            </div>

            <div className="py-4 border-y border-[#FAF6F2] space-y-1.5 font-sans">
              <p className={`text-xs uppercase tracking-widest text-[#B76E79] font-semibold ${isSi ? 'font-sinhala text-sm' : ''}`}>
                {weekday}
              </p>
              <p className="text-6xl sm:text-7xl font-serif font-bold text-[#2C221E] leading-none">{dayNumber}</p>
              <p className={`text-sm font-semibold text-[#2C221E] ${isSi ? 'font-sinhala' : ''}`}>{monthYear}</p>
              <div className={`flex items-center justify-center gap-1.5 text-xs text-stone-600 pt-1 ${isSi ? 'font-sinhala text-sm' : ''}`}>
                <Calendar className="h-3.5 w-3.5 text-[#B76E79]" />
                <span>{i18n.commencingAt(formattedTime)}</span>
              </div>
            </div>

            <div className="space-y-3 font-sans">
              <p className={`text-xs text-[#B76E79] uppercase tracking-wider font-semibold ${isSi ? 'font-sinhala text-sm' : ''}`}>
                {i18n.venueLabel}
              </p>
              <p className="text-base font-serif font-semibold text-[#2C221E] max-w-xs mx-auto">{data.venue}</p>

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
          <section className="bg-[#FAF0E6]/70 rounded-3xl p-8 sm:p-10 border border-[#C5A880]/30 text-center space-y-4">
            <Heart className="h-6 w-6 text-[#B76E79] mx-auto fill-[#B76E79]/20" />
            <h3 className={`text-2xl font-bold text-[#2C221E] ${isSi ? 'font-sinhala' : ''}`}>
              {i18n.loveStoryTitle}
            </h3>
            <p className={`text-sm sm:text-base italic text-stone-700 leading-relaxed max-w-md mx-auto ${isSi ? 'font-sinhala not-italic text-base' : ''}`}>
              &ldquo;
              {data.storyText ||
                (isSi
                  ? 'අපගේ දෙමවුපියන්ගේ ආශිර්වාදය ඇතිව, අපගේ විවාහ මංගල්‍යයට ඔබ සැමට ඉතා ආදරයෙන් ආරාධනා කර සිටිමු.'
                  : 'From our first quiet conversations to this cherished moment, our path together has been guided by patience, unconditional joy, and deep devotion. We are overjoyed to welcome you into this next chapter.')}
              &rdquo;
            </p>
          </section>
        </Reveal>

        {/* CEREMONY TIMELINE */}
        <Reveal>
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A880]/30 space-y-6 font-sans">
            <div className="text-center space-y-1">
              <span className={`text-[11px] uppercase tracking-[0.25em] font-semibold text-[#B76E79] ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
                {i18n.timelineHeader}
              </span>
              <h3 className={`text-2xl font-serif font-bold text-[#2C221E] ${isSi ? 'font-sinhala' : ''}`}>
                {i18n.timelineSchedule}
              </h3>
            </div>
            <Timeline
              items={itinerary}
              classes={{
                time: `text-xs font-semibold text-[#B76E79] ${isSi ? 'font-sinhala' : ''}`,
                title: `text-sm font-serif font-bold text-[#2C221E] ${isSi ? 'font-sinhala' : ''}`,
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
            <span className={`text-[11px] uppercase tracking-[0.25em] font-sans font-semibold text-[#B76E79] ${isSi ? 'font-sinhala tracking-normal' : ''}`}>
              {i18n.momentsTogether}
            </span>
            <h3 className={`text-2xl font-bold text-[#2C221E] ${isSi ? 'font-sinhala' : ''}`}>
              {i18n.momentsTogether}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {gallery.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightbox(i)}
                aria-label={`Open couple moment ${i + 1}`}
                className={`aspect-square rounded-2xl overflow-hidden border border-[#C5A880]/30 shadow-2xs bg-stone-100 ${focus}`}
              >
                <img
                  src={img}
                  alt={`Couple moment ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </button>
            ))}
          </div>
        </section>

        {/* RSVP + SHARE */}
        <Reveal>
          <section className="text-center space-y-4 font-sans">
            <p className={`text-xs uppercase tracking-[0.2em] font-semibold text-[#B76E79] ${isSi ? 'font-sinhala tracking-normal text-sm' : ''}`}>
              {i18n.kindlyReply}
            </p>
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
          <section className="text-center space-y-4 font-sans">
            <p className={`text-xs uppercase tracking-[0.2em] font-semibold text-[#B76E79] ${isSi ? 'font-sinhala tracking-normal text-sm' : ''}`}>
              {i18n.countdownPrefix}
            </p>
            <div className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto">
              {countdownItems.map((t) => (
                <div key={t.l} className="bg-white rounded-2xl p-3 border border-[#C5A880]/30 shadow-2xs">
                  <span className="block text-2xl sm:text-3xl font-serif font-bold text-[#2C221E] tabular-nums">
                    {t.v}
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
        <footer className="pt-8 border-t border-[#C5A880]/20 text-center space-y-2 text-stone-600 text-xs font-sans">
          <p className={`font-serif italic text-sm text-[#2C221E] ${isSi ? 'font-sinhala not-italic text-sm' : ''}`}>
            {i18n.footerGreeting}
          </p>
          <p className={`font-semibold text-xs text-[#B76E79] ${isSi ? 'font-sinhala text-sm' : ''}`}>
            {data.brideName} {i18n.andConjunction} {data.groomName}
          </p>
        </footer>
      </main>
    </div>
  );
};