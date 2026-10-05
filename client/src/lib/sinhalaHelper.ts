/**
 * Helper utilities for Sri Lankan Sinhala wedding invitation typography and transliteration.
 */

// Dictionary of popular Sri Lankan names for high-accuracy translation
const NAME_MAP: Record<string, string> = {
  // First names
  thisura: 'තිසුර',
  dulyana: 'දුල්‍යානා',
  kasun: 'කසුන්',
  sanduni: 'සඳුනි',
  kamal: 'කමල්',
  nimal: 'නිමාල්',
  chamindu: 'චමිඳු',
  kavindi: 'කවින්දි',
  shenal: 'ශෙනාල්',
  dulani: 'දුලානි',
  isuru: 'ඉසුරු',
  tharindu: 'තරිඳු',
  sahan: 'සහන්',
  dinithi: 'දිනිති',
  nadeesha: 'නදීෂා',
  amaya: 'අමායා',
  kaveen: 'කවීන්',
  oshadi: 'ඕෂධී',
  malith: 'මලිත්',
  chathura: 'චතුර',
  hiruni: 'හිරුනි',
  dilshan: 'දිල්ෂාන්',
  sachini: 'සචිනි',
  dasun: 'දසුන්',
  hashini: 'හෂිනි',
  ruwan: 'රුවන්',
  anuki: 'අනුකි',
  lahiru: 'ලහිරු',
  piyumi: 'පියුමි',
  mahesh: 'මහේෂ්',
  oshada: 'ඕෂධ',
  chathuri: 'චතුරි',
  dimuthu: 'දිමුත්',
  harini: 'හරිනි',
  danushka: 'ධනුෂ්ක',
  shalini: 'ශාලිනි',
  lakshan: 'ලක්ෂාන්',
  tharushi: 'තරුෂි',
  pramod: 'ප්‍රමෝද්',
  nipuni: 'නිපුණි',
  sunil: 'සුනිල්',
  mala: 'මාලා',
  anura: 'අනුර',
  kusum: 'කුසුම්',

  // Surnames
  silva: 'සිල්වා',
  perera: 'පෙරේරා',
  fernando: 'ප්‍රනාන්දු',
  desilva: 'ද සිල්වා',
  de_silva: 'ද සිල්වා',
  rajapaksa: 'රාජපක්ෂ',
  bandara: 'බණ්ඩාර',
  jayasinghe: 'ජයසිංහ',
  wickramasinghe: 'වික්‍රමසිංහ',
  dissanayake: 'දිසානායක',
  senanayake: 'සේනානායක',
  karunaratne: 'කරුණාරත්න',
  herath: 'හේරත්',
  gunasekara: 'ගුණසේකර',
  alwis: 'අල්විස්',
  fonseka: 'ෆොන්සේකා',
  peiris: 'පීරිස්',
  rathnayake: 'රත්නායක',
  kariyawasam: 'කාරියවසම්',
  ranasinghe: 'රණසිංහ',
  gunawardena: 'ගුණවර්ධන',
  weerasinghe: 'වීරසිංහ',
  kumara: 'කුමාර',
  menike: 'මැණිකේ',

  // Common titles & phrases
  'honored guest & family': 'ගරු ආරාධිත අමුත්තා සහ පවුලේ සැම',
  'honored guest': 'ගරු ආරාධිත අමුත්තා',
  guest: 'ආරාධිත අමුත්තා',
  family: 'පවුලේ සැම',
  and: 'සහ',
};

/** Checks if a string already contains Sinhala unicode characters */
export const hasSinhala = (str?: string | null): boolean => {
  if (!str) return false;
  return /[\u0D80-\u0DFF]/.test(str);
};

/** Transliterates an English word/name to Sinhala */
export const toSinhalaWord = (word: string): string => {
  const clean = word.trim().toLowerCase();
  if (NAME_MAP[clean]) {
    return NAME_MAP[clean];
  }
  return word;
};

/**
 * Converts a full name or phrase to Sinhala:
 * - If already Sinhala, returns as-is.
 * - Checks whole phrase in dictionary.
 * - Otherwise translates word-by-word with dictionary matches.
 */
export const toSinhalaText = (text?: string | null, fallback = ''): string => {
  if (!text || !text.trim()) return fallback;
  if (hasSinhala(text)) return text;

  const phraseKey = text.trim().toLowerCase().replace(/\s+/g, ' ');
  if (NAME_MAP[phraseKey]) {
    return NAME_MAP[phraseKey];
  }

  // Translate word-by-word
  const words = text.split(/\s+/);
  const translated = words.map((w) => {
    if (w === '&' || w.toLowerCase() === 'and') return 'සහ';
    return toSinhalaWord(w);
  });

  return translated.join(' ');
};

/**
 * Formats couple names according to language:
 * - Sinhala: "තිසුර සහ දුල්‍යානා"
 * - English: "Thisura & Dulyana"
 */
export const formatCoupleNames = (
  groomName: string,
  brideName: string,
  lang: 'si' | 'en'
): string => {
  if (lang === 'si') {
    const groomSi = toSinhalaText(groomName, groomName);
    const brideSi = toSinhalaText(brideName, brideName);
    return `${groomSi} සහ ${brideSi}`;
  }
  return `${groomName} & ${brideName}`;
};

/**
 * Formats guest name according to language:
 * - Sinhala: "කමල් සිල්වා" (or default "ගරු ආරාධිත අමුත්තා")
 * - English: "Kamal Silva" (or default "Honored Guest & Family")
 */
export const formatGuestName = (guestName?: string | null, lang: 'si' | 'en' = 'si'): string => {
  if (lang === 'si') {
    if (!guestName || !guestName.trim()) {
      return 'ගරු ආරාධිත අමුත්තා';
    }
    return toSinhalaText(guestName, guestName);
  }
  return guestName?.trim() || 'Honored Guest & Family';
};
