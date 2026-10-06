import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './templateKit';

/* ------------------------------------------------------------------ */
/*  FONTS + KEYFRAMES                                                   */
/*  Script faces match the reference card: Great Vibes / Allura /       */
/*  Pinyon Script for calligraphy, Raleway Light for the caps lines,    */
/*  Cormorant Garamond for refined serif body.                          */
/* ------------------------------------------------------------------ */
const FONT_LINK_ID = 'pk-fonts';
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Allura&family=Great+Vibes&family=Pinyon+Script&family=Raleway:wght@200;300;400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&display=swap';

export const GOLD_GRADIENT = 'linear-gradient(135deg,#9a7b2c,#f3d98b 45%,#9a7b2c)';

const CSS = `
@property --pk-angle{syntax:'<angle>';initial-value:0deg;inherits:false}
.pk-script{font-family:'Great Vibes','Allura',cursive;font-weight:400;line-height:1.2}
.pk-script-alt{font-family:'Allura','Great Vibes',cursive;font-weight:400;line-height:1.2}
.pk-pinyon{font-family:'Pinyon Script','Great Vibes',cursive;font-weight:400;line-height:1.2}
.pk-caps{font-family:'Raleway',system-ui,sans-serif;font-weight:300;text-transform:uppercase;letter-spacing:.28em}
.pk-body{font-family:'Raleway',system-ui,sans-serif;font-weight:300;letter-spacing:.03em}
.pk-serif{font-family:'Cormorant Garamond',Georgia,serif}

.pk-gold-text{background:linear-gradient(100deg,#9a7b2c 0%,#f3d98b 25%,#fff6cf 50%,#f3d98b 75%,#9a7b2c 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;animation:pk-shine 6s linear infinite}
.pk-gold-text .pk-caret{background:#f3d98b}
@keyframes pk-shine{from{background-position:0% 0}to{background-position:200% 0}}

.pk-caret{display:inline-block;width:1px;height:.9em;margin-left:2px;vertical-align:-.08em;background:currentColor;animation:pk-blink .8s steps(1) infinite}
@keyframes pk-blink{50%{opacity:0}}

.pk-twinkle{opacity:.1;animation:pk-twinkle 3s ease-in-out infinite}
@keyframes pk-twinkle{0%,100%{opacity:.08;transform:scale(.6)}50%{opacity:1;transform:scale(1.35)}}

.pk-float{animation:pk-float 7s ease-in-out infinite}
@keyframes pk-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

.pk-sheen{position:relative;overflow:hidden}
.pk-sheen::after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.32) 50%,transparent 60%);transform:translateX(-120%);animation:pk-sweep 6s ease-in-out infinite}
@keyframes pk-sweep{0%,55%{transform:translateX(-120%)}100%{transform:translateX(120%)}}

.pk-orbit{border:1.5px solid transparent;background:linear-gradient(var(--pk-fill,#fff),var(--pk-fill,#fff)) padding-box,conic-gradient(from var(--pk-angle),#8a6a1f,#f3d98b,#8a6a1f,#f3d98b,#8a6a1f) border-box;animation:pk-rot 9s linear infinite}
@keyframes pk-rot{to{--pk-angle:360deg}}

.pk-tick{animation:pk-tick .5s cubic-bezier(.2,.8,.2,1)}
@keyframes pk-tick{from{opacity:0;transform:translateY(55%) scale(.9);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}

.pk-draw path{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 2s ease}
.pk-draw.on path{stroke-dashoffset:0}

.pk-burst{animation:pk-burst 900ms ease-out forwards}
@keyframes pk-burst{from{transform:scale(.7);opacity:.9}to{transform:scale(3.4);opacity:0}}

.pk-curtain-l{animation:pk-cl 1.5s cubic-bezier(.77,0,.18,1) forwards}
.pk-curtain-r{animation:pk-cr 1.5s cubic-bezier(.77,0,.18,1) forwards}
@keyframes pk-cl{to{transform:translateX(-101%)}}
@keyframes pk-cr{to{transform:translateX(101%)}}

.pk-aurora i{position:absolute;border-radius:9999px;filter:blur(80px);opacity:.18;animation:pk-aur 18s ease-in-out infinite alternate}
@keyframes pk-aur{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(10vw,-6vh,0) scale(1.25)}}

@media (prefers-reduced-motion:reduce){
  .pk-gold-text,.pk-sheen::after,.pk-orbit,.pk-twinkle,.pk-float,.pk-aurora i,.pk-caret{animation:none!important}
  .pk-draw path{stroke-dashoffset:0!important;transition:none!important}
}
`;

export const PremiumStyles: React.FC = () => {
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);
  return <style>{CSS}</style>;
};

/* ------------------------------------------------------------------ */
/*  HOOKS / HELPERS                                                     */
/* ------------------------------------------------------------------ */
export function useInView<T extends Element>(opts?: { threshold?: number; once?: boolean }) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const once = opts?.once ?? true;
  const threshold = opts?.threshold ?? 0.3;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, threshold]);

  return [ref, inView] as const;
}

// Grapheme-safe splitting so Sinhala conjuncts never break mid-glyph while typing
const splitGraphemes = (s: string): string[] => {
  const Seg = (Intl as unknown as { Segmenter?: new (l?: string, o?: object) => { segment: (t: string) => Iterable<{ segment: string }> } }).Segmenter;
  if (Seg) return Array.from(new Seg(undefined, { granularity: 'grapheme' }).segment(s), (x) => x.segment);
  return Array.from(s);
};

const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

/* ------------------------------------------------------------------ */
/*  TYPING EFFECT                                                       */
/* ------------------------------------------------------------------ */
interface TypewriterProps {
  text: string;
  active?: boolean;
  delay?: number;
  speed?: number;
  caret?: boolean;
  gold?: boolean;
  block?: boolean;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3';
  className?: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  active = true,
  delay = 0,
  speed = 55,
  caret = true,
  gold = false,
  block = false,
  as = 'span',
  className = '',
}) => {
  const Tag = as as React.ElementType;
  const chars = useMemo(() => splitGraphemes(text || ''), [text]);
  const reduced = usePrefersReducedMotion();
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.4 });
  const [count, setCount] = useState(0);
  const go = active && inView;

  useEffect(() => {
    if (!go) return;
    if (reduced) {
      setCount(chars.length);
      return;
    }
    setCount(0);
    let i = 0;
    let iv = 0;
    const start = window.setTimeout(() => {
      iv = window.setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= chars.length) window.clearInterval(iv);
      }, speed);
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(iv);
    };
  }, [go, chars, speed, delay, reduced]);

  const typing = caret && go && !reduced && count < chars.length;

  return (
    <Tag ref={ref} aria-label={text} className={`relative ${block ? 'block' : 'inline-block'} ${className}`}>
      {/* invisible copy reserves the final size so nothing jumps while typing */}
      <span aria-hidden="true" className="invisible">
        {text}
      </span>
      <span aria-hidden="true" className={`absolute inset-0 ${gold ? 'pk-gold-text' : ''}`}>
        {chars.slice(0, count).join('')}
        {typing && <span className="pk-caret" />}
      </span>
    </Tag>
  );
};

/* Calligraphy "pen stroke" wipe for script names */
export const WriteOn: React.FC<{
  active?: boolean;
  delay?: number;
  duration?: number;
  block?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ active = true, delay = 0, duration = 2000, block = false, className = '', children }) => {
  // The observed wrapper is never clipped; only the inner span is. Observing a
  // zero-width clipped element can leave the observer from ever firing.
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.1 });
  const reduced = usePrefersReducedMotion();
  const on = (active && inView) || reduced;
  return (
    <span ref={ref} className={`${block ? 'block' : 'inline-block'} ${className}`}>
      <span
        className="block"
        style={{
          clipPath: on ? 'inset(-30% -8% -30% -8%)' : 'inset(-30% 108% -30% -8%)',
          transition: reduced ? 'none' : `clip-path ${duration}ms cubic-bezier(.65,.05,.25,1) ${delay}ms`,
        }}
      >
        {children}
      </span>
    </span>
  );
};

/* Blur + rise entrance (gated by `active` so it waits for the seal to open) */
export const Rise: React.FC<{
  as?: 'div' | 'span';
  active?: boolean;
  delay?: number;
  y?: number;
  blur?: boolean;
  settle?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ as = 'div', active = true, delay = 0, y = 24, blur = true, settle = false, className = '', children }) => {
  const Tag = as as React.ElementType;
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.15 });
  const reduced = usePrefersReducedMotion();
  const on = (active && inView) || reduced;
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? 'none' : `translateY(${y}px)`,
        filter: blur ? (on ? (settle ? 'none' : 'blur(0px)') : 'blur(6px)') : undefined,
        transition: reduced
          ? 'none'
          : `opacity 900ms ease ${delay}ms, transform 900ms cubic-bezier(.2,.7,.2,1) ${delay}ms, filter 900ms ease ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
};

/* Word-by-word blur-in */
export const SplitWords: React.FC<{
  text: string;
  active?: boolean;
  delay?: number;
  step?: number;
  className?: string;
}> = ({ text, active = true, delay = 0, step = 70, className = '' }) => {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.3 });
  const reduced = usePrefersReducedMotion();
  const on = (active && inView) || reduced;
  const words = (text || '').split(' ');
  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block"
          style={{
            opacity: on ? 1 : 0,
            transform: on ? 'none' : 'translateY(14px)',
            filter: on ? 'none' : 'blur(8px)',
            transition: reduced ? 'none' : `all 800ms cubic-bezier(.2,.7,.2,1) ${delay + i * step}ms`,
          }}
        >
          {w}
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  );
};

/* Countdown digit that re-animates every time the value changes */
export const Tick: React.FC<{ value: number | string }> = ({ value }) => (
  <span key={String(value)} className="pk-tick inline-block">
    {value}
  </span>
);

/* ------------------------------------------------------------------ */
/*  DECORATION                                                          */
/* ------------------------------------------------------------------ */
/* Twinkling glitter, like the gold dust on the reference menu card */
export const GlitterField: React.FC<{
  count?: number;
  seed?: number;
  color?: string;
  bias?: 'top' | 'even';
  glow?: boolean;
  className?: string;
}> = ({ count = 40, seed = 7, color = '#e8c871', bias = 'top', glow = true, className = '' }) => {
  const dots = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({
      x: r() * 100,
      y: bias === 'top' ? Math.pow(r(), 1.9) * 100 : r() * 100,
      s: 1 + r() * 2.4,
      d: 2 + r() * 4,
      dl: r() * 5,
    }));
  }, [count, seed, bias]);

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {dots.map((d, i) => (
        <span
          key={i}
          className="pk-twinkle absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.s,
            height: d.s,
            background: color,
            boxShadow: glow ? `0 0 ${d.s * 3}px ${color}` : undefined,
            animationDuration: `${d.d}s`,
            animationDelay: `${d.dl}s`,
          }}
        />
      ))}
    </div>
  );
};

/* Thin gold double frame that draws itself edge by edge (like the card border) */
export const GoldFrame: React.FC<{
  inset?: number;
  double?: boolean;
  corners?: boolean;
  active?: boolean;
  delay?: number;
  gradient?: string;
  className?: string;
}> = ({ inset = 12, double = true, corners = false, active = true, delay = 0, gradient = GOLD_GRADIENT, className = '' }) => {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.1 });
  const reduced = usePrefersReducedMotion();
  const on = (active && inView) || reduced;

  const edge = (style: React.CSSProperties, origin: string, axis: 'X' | 'Y', d: number, op: number) => (
    <span
      style={{
        position: 'absolute',
        background: gradient,
        opacity: op,
        transformOrigin: origin,
        transform: on ? 'none' : `scale${axis}(0)`,
        transition: reduced ? 'none' : `transform 800ms cubic-bezier(.65,0,.25,1) ${delay + d}ms`,
        ...style,
      }}
    />
  );

  const ring = (o: number, op: number, d: number) => (
    <>
      {edge({ left: o, right: o, top: o, height: 1 }, 'left', 'X', d, op)}
      {edge({ top: o, bottom: o, right: o, width: 1 }, 'top', 'Y', d + 300, op)}
      {edge({ left: o, right: o, bottom: o, height: 1 }, 'right', 'X', d + 600, op)}
      {edge({ top: o, bottom: o, left: o, width: 1 }, 'bottom', 'Y', d + 900, op)}
    </>
  );

  const diamond = (pos: React.CSSProperties) => (
    <span
      style={{
        position: 'absolute',
        width: 7,
        height: 7,
        border: '1px solid #d4af37',
        background: '#0000',
        transform: 'rotate(45deg)',
        opacity: on ? 1 : 0,
        transition: reduced ? 'none' : `opacity 700ms ease ${delay + 1500}ms`,
        ...pos,
      }}
    />
  );

  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {ring(inset, 1, 0)}
      {double && ring(inset + 5, 0.45, 150)}
      {corners && (
        <>
          {diamond({ left: inset - 3, top: inset - 3 })}
          {diamond({ right: inset - 3, top: inset - 3 })}
          {diamond({ left: inset - 3, bottom: inset - 3 })}
          {diamond({ right: inset - 3, bottom: inset - 3 })}
        </>
      )}
    </div>
  );
};

/* Watercolour-style leaf sprig that draws itself (echoes the sprig on the reference menu) */
export const LeafSprig: React.FC<{ className?: string; tone?: string }> = ({ className = '', tone = 'currentColor' }) => {
  const [ref, inView] = useInView<SVGSVGElement>({ threshold: 0.5 });
  const leaves: [number, number, number][] = [
    [28, 37, -40], [28, 37, 40], [54, 34, -38], [54, 34, 38], [80, 29, -36],
    [80, 29, 36], [106, 23, -34], [106, 23, 34], [130, 17, -30],
  ];
  return (
    <svg ref={ref} viewBox="0 0 160 60" className={`pk-draw ${inView ? 'on' : ''} ${className}`} fill="none" aria-hidden="true">
      <path d="M6 40 C40 38 80 31 150 14" pathLength={1} stroke={tone} strokeWidth="1.2" strokeLinecap="round" />
      {leaves.map(([x, y, r], i) => (
        <path
          key={i}
          d="M0 0 C6 -9 17 -11 24 -7 C17 3 6 4 0 0 Z"
          pathLength={1}
          transform={`translate(${x} ${y}) rotate(${r})`}
          stroke={tone}
          strokeWidth="1"
          fill={tone}
          fillOpacity="0.14"
          style={{ transitionDelay: `${0.4 + i * 0.18}s` }}
        />
      ))}
    </svg>
  );
};

/* Pointer-follow 3D tilt */
export const Tilt: React.FC<{ max?: number; className?: string; children: React.ReactNode }> = ({ max = 8, className = '', children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType === 'touch' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg)`;
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  };
  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={`transition-transform duration-300 ease-out will-change-transform ${className}`}>
      {children}
    </div>
  );
};

/* Theatre curtain that parts when the invitation is opened */
export const Curtain: React.FC<{ show: boolean; color?: string; edge?: string }> = ({ show, color = '#050505', edge = '#D4AF37' }) => {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(() => setGone(true), 1700);
    return () => window.clearTimeout(t);
  }, [show]);
  if (!show || gone) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] flex">
      <div className="pk-curtain-l h-full w-1/2" style={{ background: color, borderRight: `1px solid ${edge}` }} />
      <div className="pk-curtain-r h-full w-1/2" style={{ background: color, borderLeft: `1px solid ${edge}` }} />
    </div>
  );
};