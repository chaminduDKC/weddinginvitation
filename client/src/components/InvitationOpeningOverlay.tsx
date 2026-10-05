import React, { useState, useEffect } from 'react';
import {
  formatCoupleNames,
  formatGuestName,
  hasSinhala,
} from '../lib/sinhalaHelper';
import { getSinhalaFontClass, SinhalaFontKey } from '../lib/fmFontConverter';

interface InvitationOpeningOverlayProps {
  brideName: string;
  groomName: string;
  guestName?: string | null;
  brideNameSi?: string | null;
  groomNameSi?: string | null;
  guestNameSi?: string | null;
  initialLang?: 'si' | 'en';
  fontStyle?: SinhalaFontKey;
  onLanguageChange?: (lang: 'si' | 'en') => void;
  onOpen: () => void | Promise<void>;
}

/**
 * Traditional Sri Lankan Sacred Mandala SVG component
 */
const MandalaWatermark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 600 600"
    className={`anim-mandala w-full h-full ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Concentric rings */}
    <circle cx="300" cy="300" r="285" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 5" />
    <circle cx="300" cy="300" r="275" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="300" cy="300" r="250" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" />
    <circle cx="300" cy="300" r="235" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="300" cy="300" r="195" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="300" cy="300" r="155" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" />
    <circle cx="300" cy="300" r="120" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="300" cy="300" r="75" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="300" cy="300" r="35" stroke="currentColor" strokeWidth="1.5" />

    {/* 24 Scalloped Outer Lotus Petals */}
    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 360) / 24;
      return (
        <g key={`petal-${i}`} transform={`rotate(${angle} 300 300)`}>
          <path
            d="M 300 25 C 290 45, 275 60, 300 75 C 325 60, 310 45, 300 25 Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle cx="300" cy="40" r="2" fill="currentColor" />
        </g>
      );
    })}

    {/* 36 Traditional radiating spokes */}
    {Array.from({ length: 36 }).map((_, i) => {
      const angle = (i * 360) / 36;
      return (
        <line
          key={`spoke-${i}`}
          x1="300"
          y1="105"
          x2="300"
          y2="145"
          stroke="currentColor"
          strokeWidth="1"
          transform={`rotate(${angle} 300 300)`}
        />
      );
    })}

    {/* 16 Middle Bo Leaves / Petal Flourishes */}
    {Array.from({ length: 16 }).map((_, i) => {
      const angle = (i * 360) / 16;
      return (
        <g key={`leaf-${i}`} transform={`rotate(${angle} 300 300)`}>
          <path
            d="M 300 160 C 285 180, 285 200, 300 215 C 315 200, 315 180, 300 160 Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle cx="300" cy="188" r="2.5" fill="currentColor" />
        </g>
      );
    })}

    {/* 8 Inner Core Petals */}
    {Array.from({ length: 8 }).map((_, i) => {
      const angle = (i * 360) / 8;
      return (
        <path
          key={`inner-${i}`}
          d="M 300 230 C 290 250, 290 260, 300 270 C 310 250, 310 250, 300 230 Z"
          stroke="currentColor"
          strokeWidth="1.2"
          transform={`rotate(${angle} 300 300)`}
        />
      );
    })}
  </svg>
);

/**
 * Golden Sacred Lotus Crest SVG with Liyawela flourishes
 */
const LotusCrest: React.FC = () => (
  <svg
    viewBox="0 0 240 120"
    className="w-36 sm:w-40 h-auto"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="lotusGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F9DF88" />
        <stop offset="35%" stopColor="#E2A138" />
        <stop offset="70%" stopColor="#C97E1C" />
        <stop offset="100%" stopColor="#965507" />
      </linearGradient>
      <linearGradient id="wingGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#B87319" />
        <stop offset="50%" stopColor="#FADF8B" />
        <stop offset="100%" stopColor="#B87319" />
      </linearGradient>
    </defs>

    {/* LOTUS FLOWER PETALS */}
    {/* Center Tall Petal */}
    <path
      d="M 120 10 C 114 26, 110 44, 120 62 C 130 44, 126 26, 120 10 Z"
      fill="url(#lotusGoldGrad)"
    />
    {/* Inner Left Petal */}
    <path
      d="M 120 22 C 108 30, 102 46, 114 62 C 118 48, 122 36, 120 22 Z"
      fill="url(#lotusGoldGrad)"
    />
    {/* Inner Right Petal */}
    <path
      d="M 120 22 C 132 30, 138 46, 126 62 C 122 48, 118 36, 120 22 Z"
      fill="url(#lotusGoldGrad)"
    />
    {/* Outer Left Petal */}
    <path
      d="M 115 34 C 98 42, 94 56, 109 63 C 113 52, 116 42, 115 34 Z"
      fill="url(#lotusGoldGrad)"
    />
    {/* Outer Right Petal */}
    <path
      d="M 125 34 C 142 42, 146 56, 131 63 C 127 52, 124 42, 125 34 Z"
      fill="url(#lotusGoldGrad)"
    />
    {/* Bottom Flare Left */}
    <path
      d="M 110 48 C 88 56, 86 68, 104 68 C 111 62, 114 55, 110 48 Z"
      fill="url(#lotusGoldGrad)"
    />
    {/* Bottom Flare Right */}
    <path
      d="M 130 48 C 152 56, 154 68, 136 68 C 129 62, 126 55, 130 48 Z"
      fill="url(#lotusGoldGrad)"
    />

    {/* LOTUS BASE ORNAMENT */}
    <ellipse cx="120" cy="65" rx="14" ry="3.5" fill="url(#lotusGoldGrad)" />

    {/* ORNATE LIYAWELA SCROLLWORK (WING FLOURISHES) */}
    {/* Left Scroll Wing */}
    <path
      d="M 108 67 C 92 68, 76 64, 60 70 C 46 75, 34 86, 20 82 C 16 80, 17 73, 24 73 C 34 73, 44 65, 56 63 C 72 61, 88 64, 106 65 Z"
      fill="url(#wingGoldGrad)"
    />
    <path
      d="M 72 66 C 58 72, 45 80, 32 86 C 26 89, 21 86, 23 83 C 28 78, 38 74, 49 70 C 60 67, 70 66, 72 66 Z"
      fill="url(#wingGoldGrad)"
    />
    <circle cx="21" cy="77" r="3" fill="url(#lotusGoldGrad)" />

    {/* Right Scroll Wing */}
    <path
      d="M 132 67 C 148 68, 164 64, 180 70 C 194 75, 206 86, 220 82 C 224 80, 223 73, 216 73 C 206 73, 196 65, 184 63 C 168 61, 152 64, 134 65 Z"
      fill="url(#wingGoldGrad)"
    />
    <path
      d="M 168 66 C 182 72, 195 80, 208 86 C 214 89, 219 86, 217 83 C 212 78, 202 74, 191 70 C 180 67, 170 66, 168 66 Z"
      fill="url(#wingGoldGrad)"
    />
    <circle cx="219" cy="77" r="3" fill="url(#lotusGoldGrad)" />

    {/* Central flourish teardrop beneath lotus */}
    <path
      d="M 120 68 C 117 74, 114 78, 120 85 C 126 78, 123 74, 120 68 Z"
      fill="url(#lotusGoldGrad)"
    />
  </svg>
);

/**
 * Traditional Sri Lankan Wedding Invitation Opening Overlay
 * with cinematic 3D double door / opening curtain parting animation.
 */
export const InvitationOpeningOverlay: React.FC<InvitationOpeningOverlayProps> = ({
  brideName,
  groomName,
  guestName,
  brideNameSi,
  groomNameSi,
  guestNameSi,
  initialLang = 'si',
  fontStyle,
  onLanguageChange,
  onOpen,
}) => {
  const [lang, setLang] = useState<'si' | 'en'>(initialLang);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    setLang(initialLang);
  }, [initialLang]);

  const handleLangSelect = (newLang: 'si' | 'en') => {
    setLang(newLang);
    onLanguageChange?.(newLang);
  };

  // Lock body scroll and guarantee viewport is at the top while envelope is closed
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
  }, []);

  // Compute displayed names based on language selection
  const isInputSinhala = hasSinhala(brideName) || hasSinhala(groomName);

  const displayedCouple = (() => {
    if (lang === 'si') {
      if (brideNameSi && groomNameSi) {
        return `${groomNameSi} සහ ${brideNameSi}`;
      }
      if (isInputSinhala) {
        return `${groomName} සහ ${brideName}`;
      }
      return formatCoupleNames(groomName, brideName, 'si');
    }
    return formatCoupleNames(groomName, brideName, 'en');
  })();

  const displayedGuest = (() => {
    if (lang === 'si') {
      if (guestNameSi) return guestNameSi;
      return formatGuestName(guestName, 'si');
    }
    return formatGuestName(guestName, 'en');
  })();

  const handleOpenClick = () => {
    if (isOpening) return;
    setIsOpening(true);

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    try {
      onOpen();
    } catch {
      // ignore
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Wedding Invitation Envelope"
      className={`fixed inset-0 z-50 overflow-hidden select-none ${
        isOpening ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      style={{
        perspective: '1400px',
        perspectiveOrigin: '50% 50%',
      }}
    >
      {/* 0. GOLDEN LIGHT BURST (Beams radiant light from behind the doors as they part, then gracefully dissolves) */}
      {isOpening && (
        <>
          {/* Ambient radial gold bloom */}
          <div
            className="anim-gold-light-burst absolute inset-0 pointer-events-none z-0 flex items-center justify-center"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(254, 243, 199, 0.9) 0%, rgba(251, 191, 36, 0.38) 42%, transparent 75%)',
            }}
          />

          {/* Center seam vertical ray of light */}
          <div
            className="anim-gold-seam-ray absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-16 pointer-events-none z-0"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(254, 240, 138, 0.95) 0%, rgba(245, 158, 11, 0.35) 45%, transparent 80%)',
            }}
          />
        </>
      )}

      {/* 1. LEFT DOOR / CURTAIN PANEL */}
      <div
        className="absolute top-0 bottom-0 left-0 w-1/2 overflow-hidden z-10"
        style={{
          transformOrigin: 'left center',
          transform: isOpening
            ? 'perspective(1600px) rotateY(-98deg) translateX(-14%)'
            : 'perspective(1600px) rotateY(0deg) translateX(0%)',
          opacity: isOpening ? 0 : 1,
          transition: isOpening
            ? 'transform 1900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 1700ms cubic-bezier(0.4, 0, 0.2, 1) 300ms'
            : 'none',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {/* Parchment background with lighting highlight toward meeting edge */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 100% 40%, #FFFDF9 0%, #FAF0E6 45%, #F4E2D2 90%, #E6CCA8 100%)',
          }}
        />

        {/* Vertical silk drapery / curtain pleats texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0) 24px, rgba(184,115,25,0.06) 48px, rgba(255,255,255,0.3) 72px)',
          }}
        />

        {/* Traditional carved door molding frame on Left Panel */}
        <div className="absolute inset-4 sm:inset-6 md:inset-8 border border-[#D4912D]/25 rounded-l-2xl pointer-events-none shadow-[inset_0_0_20px_rgba(212,145,45,0.05)]">
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#D4912D]/40 rounded-tl-sm" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#D4912D]/40 rounded-bl-sm" />
        </div>

        {/* Left half mandala watermark centered on meeting edge */}
        <div
          className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-20"
          style={{
            width: 'min(120vw, 620px)',
            height: 'min(120vw, 620px)',
            marginTop: '-3%',
          }}
        >
          <MandalaWatermark className="text-[#C88A53]" />
        </div>

        {/* Center meeting edge gold trim & shadow */}
        <div
          className="absolute top-0 bottom-0 right-0 w-[2px]"
          style={{
            background:
              'linear-gradient(to bottom, rgba(212,145,45,0.15) 0%, rgba(212,145,45,0.85) 50%, rgba(212,145,45,0.15) 100%)',
            boxShadow: '-2px 0 10px rgba(184, 115, 25, 0.25)',
          }}
        />
      </div>

      {/* 2. RIGHT DOOR / CURTAIN PANEL */}
      <div
        className="absolute top-0 bottom-0 right-0 w-1/2 overflow-hidden z-10"
        style={{
          transformOrigin: 'right center',
          transform: isOpening
            ? 'perspective(1600px) rotateY(98deg) translateX(14%)'
            : 'perspective(1600px) rotateY(0deg) translateX(0%)',
          opacity: isOpening ? 0 : 1,
          transition: isOpening
            ? 'transform 1900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 1700ms cubic-bezier(0.4, 0, 0.2, 1) 300ms'
            : 'none',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {/* Parchment background with lighting highlight toward meeting edge */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 0% 40%, #FFFDF9 0%, #FAF0E6 45%, #F4E2D2 90%, #E6CCA8 100%)',
          }}
        />

        {/* Vertical silk drapery / curtain pleats texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0px, rgba(184,115,25,0.06) 24px, rgba(255,255,255,0) 48px, rgba(255,255,255,0.5) 72px)',
          }}
        />

        {/* Traditional carved door molding frame on Right Panel */}
        <div className="absolute inset-4 sm:inset-6 md:inset-8 border border-[#D4912D]/25 rounded-r-2xl pointer-events-none shadow-[inset_0_0_20px_rgba(212,145,45,0.05)]">
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#D4912D]/40 rounded-tr-sm" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#D4912D]/40 rounded-br-sm" />
        </div>

        {/* Right half mandala watermark centered on meeting edge */}
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 pointer-events-none opacity-20"
          style={{
            width: 'min(120vw, 620px)',
            height: 'min(120vw, 620px)',
            marginTop: '-3%',
          }}
        >
          <MandalaWatermark className="text-[#C88A53]" />
        </div>

        {/* Center meeting edge gold trim & shadow */}
        <div
          className="absolute top-0 bottom-0 left-0 w-[2px]"
          style={{
            background:
              'linear-gradient(to bottom, rgba(212,145,45,0.15) 0%, rgba(212,145,45,0.85) 50%, rgba(212,145,45,0.15) 100%)',
            boxShadow: '2px 0 10px rgba(184, 115, 25, 0.25)',
          }}
        />
      </div>

      {/* 3. VERTICAL CENTER SEAM LATCH LINE */}
      <div
        className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] z-15 pointer-events-none transition-opacity duration-500 ${
          isOpening ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(212,145,45,0.5) 15%, rgba(212,145,45,0.95) 50%, rgba(212,145,45,0.5) 85%, transparent 100%)',
          boxShadow: '0 0 6px rgba(212, 145, 45, 0.4)',
        }}
      />

      {/* 4. CENTER EMBLEM & TYPOGRAPHY CONTENT (Sacred Lotus Crest & Calligraphy) */}
      <div
        className={`relative z-20 flex flex-col items-center justify-between h-full w-full pointer-events-auto transition-all ${
          isOpening
            ? 'opacity-0 scale-95 pointer-events-none -translate-y-4 duration-600 ease-out'
            : 'opacity-100 scale-100 duration-300'
        }`}
      >
        {/* Top Empty Spacer for System Notch / Safe Area */}
        <div className="w-full pt-safe min-h-[30px]" />

        {/* Center Invitation Emblem & Typography */}
        <main className="relative w-full max-w-sm px-6 flex flex-col items-center text-center space-y-6 my-auto">
          {/* Golden Lotus Crest */}
          <div
            className="anim-lotus-float"
            style={{
              filter: 'drop-shadow(0 4px 14px rgba(212, 145, 45, 0.32))',
            }}
          >
            <LotusCrest />
          </div>

          {/* Invitation Typography */}
          <div className={`space-y-3 px-2 ${lang === 'si' ? getSinhalaFontClass(fontStyle) : ''}`}>
            {/* Main Greeting */}
            <h1
              className={`text-3xl sm:text-4xl font-semibold tracking-wide text-[#8F4218] ${
                lang === 'si' ? 'leading-relaxed' : 'font-serif text-2xl sm:text-3xl'
              }`}
              style={{
                textShadow: '0 1px 3px rgba(180, 100, 30, 0.15)',
              }}
            >
              {lang === 'si' ? 'සාදර ඇරයුමයි !' : 'You Are Cordially Invited!'}
            </h1>

            {/* Couple Names */}
            <p
              className={`font-sinhala text-xl sm:text-2xl font-medium tracking-normal text-[#B56722] ${
                lang === 'si' ? '' : 'font-serif'
              }`}
            >
              {displayedCouple}
            </p>

            {/* Guest Name */}
            <p className="font-sinhala text-sm sm:text-base font-normal text-[#6B5547] tracking-normal pt-1">
              {displayedGuest}
            </p>
          </div>

          {/* Actions: Open Button & Bilingual Switcher */}
          <div className="w-full pt-4 space-y-4 flex flex-col items-center">
            {/* Open Button with Breathing Ring */}
            <div className="relative inline-flex items-center justify-center">
              <span
                aria-hidden="true"
                className="anim-btn-pulse absolute inset-0 rounded-full border-2 border-[#D28227]"
              />

              <button
                type="button"
                onClick={handleOpenClick}
                disabled={isOpening}
                className="relative z-10 inline-flex items-center justify-center px-10 py-3 rounded-full text-white font-sinhala text-base sm:text-lg font-semibold tracking-wide shadow-lg transition-transform active:scale-95 hover:brightness-105 min-h-[46px] cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #DF9740 0%, #D07B21 50%, #B8620F 100%)',
                  boxShadow: '0 8px 24px -2px rgba(208, 123, 33, 0.45)',
                }}
              >
                {isOpening ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>{lang === 'si' ? 'විවෘත වෙමින්...' : 'Opening...'}</span>
                  </span>
                ) : (
                  <span>{lang === 'si' ? 'විවෘත කරන්න' : 'Open Invitation'}</span>
                )}
              </button>
            </div>

            {/* Language Switcher Pill (සිං | EN) */}
            <div
              className="inline-flex items-center gap-1 p-1 rounded-full bg-white/85 border border-[#DEBFA8]/60 shadow-xs"
              role="radiogroup"
              aria-label="Language"
            >
              {/* Sinhala option */}
              <button
                type="button"
                role="radio"
                aria-checked={lang === 'si'}
                onClick={() => handleLangSelect('si')}
                className={`flex items-center justify-center min-w-[34px] h-7 px-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  lang === 'si'
                    ? 'bg-gradient-to-r from-[#DF9740] to-[#C9721D] text-white shadow-xs'
                    : 'text-[#8A6A52] hover:text-[#5B3E29]'
                }`}
              >
                <span className="font-sinhala text-[13px] leading-none pt-0.5">සිං</span>
              </button>

              {/* English option */}
              <button
                type="button"
                role="radio"
                aria-checked={lang === 'en'}
                onClick={() => handleLangSelect('en')}
                className={`flex items-center justify-center min-w-[34px] h-7 px-2.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-gradient-to-r from-[#DF9740] to-[#C9721D] text-white shadow-xs'
                    : 'text-[#8A6A52] hover:text-[#5B3E29]'
                }`}
              >
                <span>EN</span>
              </button>
            </div>
          </div>
        </main>

        {/* Bottom Safe Area Branding */}
        <footer className="w-full pb-safe py-3 text-center pointer-events-none">
          <p className="text-[11px] font-sans tracking-widest text-[#B59682]/70 uppercase">
            invitation.lk
          </p>
        </footer>
      </div>
    </div>
  );
};

export default InvitationOpeningOverlay;
