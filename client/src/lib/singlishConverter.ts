/**
 * Real-time Singlish (Romanized Sinhala) to Sinhala Unicode Transliteration Engine
 * Compatible with Helakuru and UCSC Unicode standards.
 */

// Popular wedding-related terms and names for instant, natural translation
const WEDDING_DICTIONARY: Record<string, string> = {
  // Names
  kasun: 'කසුන්',
  sanduni: 'සඳුනි',
  thisura: 'තිසුර',
  dulyana: 'දුල්‍යානා',
  kamal: 'කමල්',
  silva: 'සිල්වා',
  perera: 'පෙරේරා',
  fernando: 'ප්‍රනාන්දු',
  de_silva: 'ද සිල්වා',
  desilva: 'ද සිල්වා',
  bandara: 'බණ්ඩාර',
  rajapaksa: 'රාජපක්ෂ',
  jayasinghe: 'ජයසිංහ',
  wickramasinghe: 'වික්‍රමසිංහ',
  dissanayake: 'දිසානායක',
  senanayake: 'සේනානායක',
  karunaratne: 'කරුණාරත්න',
  herath: 'හේරත්',
  gunasekara: 'ගුණසේකර',
  alwis: 'අල්විස්',
  chamindu: 'චමිඳු',
  kavindi: 'කවින්දි',
  sahan: 'සහන්',
  dinithi: 'දිනිති',
  nadeesha: 'නදීෂා',
  amaya: 'අමායා',
  shenal: 'ශෙනාල්',
  dulani: 'දුලානි',
  isuru: 'ඉසුරු',
  tharindu: 'තරිඳු',
  nimal: 'නිමාල්',
  sunil: 'සුනිල්',
  anura: 'අනුර',
  malith: 'මලිත්',
  chathura: 'චතුර',
  hiruni: 'හිරුනි',
  dilshan: 'දිල්ෂාන්',
  sachini: 'සචිනි',
  dasun: 'දසුන්',
  hashini: 'හෂිනි',
  ruwan: 'රුවන්',

  // Wedding & Event Terms
  saha: 'සහ',
  samaga: 'සමඟ',
  subha: 'සුභ',
  mangalam: 'මංගලම්',
  mangala: 'මංගල',
  arayuma: 'ඇරයුම',
  arayumai: 'ඇරයුමයි',
  sadara: 'සාදර',
  saadara: 'සාදර',
  dinaya: 'දිනය',
  welawa: 'වේලාව',
  velava: 'වේලාව',
  sthaanaya: 'ස්ථානය',
  sthanaya: 'ස්ථානය',
  thanaya: 'තැන',
  gedara: 'ගෙදර',
  asapuwa: 'අසපුව',
  poruwa: 'පෝරුව',
  aadarayen: 'ආදරයෙන්',
  adarayen: 'ආදරයෙන්',
  aaraadhanaa: 'ආරාධනා',
  aaradhana: 'ආරාධනා',
  aradhana: 'ආරාධනා',
  karamu: 'කරමු',
  karanna: 'කරන්න',
  paminenna: 'පැමිණෙන්න',
  obata: 'ඔබට',
  oba: 'ඔබ',
  mithurani: 'මිතුරනි',
  aashirwada: 'ආශිර්වාද',
  ashirwada: 'ආශිර්වාද',
  pawula: 'පවුල',
  pawule: 'පවුලේ',
  samata: 'සැමට',
  sema: 'සැම',
  apage: 'අපගේ',
  apata: 'අපට',

  // Venues & Cities
  grand: 'ග්‍රෑන්ඩ්',
  ballroom: 'බෝල්රූම්',
  cinnamon: 'සිනමන්',
  hotel: 'හෝටලය',
  resort: 'රිසෝර්ට්',
  colombo: 'කොළඹ',
  kandy: 'නුවර',
  nuwara: 'නුවර',
  galle: 'ගාල්ල',
  negombo: 'මීගමුව',
  meegamuwa: 'මීගමුව',
  matara: 'මාතර',
  kurunegala: 'කුරුණෑගල',
  jaffna: 'යාපනය',
  kalutara: 'කළුතර',
  panadura: 'පානදුර',
  gampaha: 'ගම්පහ',
  moratuwa: 'මොරටුව',
  rathnapura: 'රත්නපුර',
  anuradhapura: 'අනුරාධපුර',
  kingsbury: 'කිංග්ස්බරි',
  shangrila: 'ෂැංග්‍රි-ලා',
  hilton: 'හිල්ටන්',
  galadari: 'ගලදාරි',
  mount: 'ගල්කිස්ස',
  lavinia: 'ලැවීනියා',
  taj: 'තාජ්',
  samudra: 'සමුද්‍රා',
};

// Consonant definition table (Ordered by length descending so longer clusters match first)
interface ConsonantRule {
  en: string;
  si: string;
}

const CONSONANTS: ConsonantRule[] = [
  // 4-letter clusters
  { en: 'shna', si: 'ෂ්ණ' },
  { en: 'shwa', si: 'ශ්ව' },
  { en: 'thva', si: 'ත්ව' },
  { en: 'thwa', si: 'ත්ව' },
  { en: 'dhva', si: 'ධ්ව' },

  // 3-letter clusters (Rakaranshaya, Yanshaya, Bandi Akuru)
  { en: 'shn', si: 'ෂ්ණ' },
  { en: 'ndh', si: 'න්ධ' },
  { en: 'nnd', si: 'ඳ' },
  { en: 'mmb', si: 'ඹ' },
  { en: 'nng', si: 'ඟ' },
  { en: 'nch', si: 'ඤ්ච' },
  { en: 'nth', si: 'න්ථ' },
  { en: 'kya', si: 'ක්‍ය' },
  { en: 'tya', si: 'ට්‍ය' },
  { en: 'thya', si: 'ත්‍ය' },
  { en: 'dya', si: 'ද්‍ය' },
  { en: 'dhya', si: 'ධ්‍ය' },
  { en: 'mya', si: 'ම්‍ය' },
  { en: 'rya', si: 'ර්‍ය' },
  { en: 'lya', si: 'ල්‍ය' },
  { en: 'vya', si: 'ව්‍ය' },
  { en: 'wya', si: 'ව්‍ය' },
  { en: 'sya', si: 'ස්‍ය' },
  { en: 'shya', si: 'ශ්‍ය' },
  { en: 'pya', si: 'ප්‍ය' },
  { en: 'bya', si: 'බ්‍ය' },
  { en: 'gya', si: 'ග්‍ය' },
  { en: 'kra', si: 'ක්‍ර' },
  { en: 'gra', si: 'ග්‍ර' },
  { en: 'chra', si: 'ච්‍ර' },
  { en: 'tra', si: 'ට්‍ර' },
  { en: 'thra', si: 'ත්‍ර' },
  { en: 'dra', si: 'ද්‍ර' },
  { en: 'dhra', si: 'ධ්‍ර' },
  { en: 'pra', si: 'ප්‍ර' },
  { en: 'bra', si: 'බ්‍ර' },
  { en: 'mra', si: 'ම්‍ර' },
  { en: 'sra', si: 'ස්‍ර' },
  { en: 'shra', si: 'ශ්‍ර' },

  // 2-letter consonants
  { en: 'th', si: 'ත' },
  { en: 'Th', si: 'ථ' },
  { en: 'dh', si: 'ද' },
  { en: 'Dh', si: 'ධ' },
  { en: 'sh', si: 'ශ' },
  { en: 'Sh', si: 'ෂ' },
  { en: 'ch', si: 'ච' },
  { en: 'Ch', si: 'ඡ' },
  { en: 'ph', si: 'ඵ' },
  { en: 'bh', si: 'භ' },
  { en: 'gh', si: 'ඝ' },
  { en: 'jh', si: 'ඣ' },
  { en: 'nd', si: 'ඳ' },
  { en: 'mb', si: 'ඹ' },
  { en: 'ng', si: 'ඟ' },
  { en: 'gn', si: 'ඥ' },
  { en: 'kn', si: 'ඤ' },

  // Single consonants
  { en: 'k', si: 'ක' },
  { en: 'K', si: 'ඛ' },
  { en: 'g', si: 'ග' },
  { en: 'G', si: 'ඝ' },
  { en: 't', si: 'ට' },
  { en: 'T', si: 'ඨ' },
  { en: 'd', si: 'ද' },
  { en: 'D', si: 'ඩ' },
  { en: 'n', si: 'න' },
  { en: 'N', si: 'ණ' },
  { en: 'p', si: 'ප' },
  { en: 'P', si: 'ඵ' },
  { en: 'b', si: 'බ' },
  { en: 'B', si: 'භ' },
  { en: 'm', si: 'ම' },
  { en: 'M', si: 'ම' },
  { en: 'y', si: 'ය' },
  { en: 'Y', si: 'ය' },
  { en: 'r', si: 'ර' },
  { en: 'R', si: 'ඍ' },
  { en: 'l', si: 'ල' },
  { en: 'L', si: 'ළ' },
  { en: 'v', si: 'ව' },
  { en: 'w', si: 'ව' },
  { en: 's', si: 'ස' },
  { en: 'S', si: 'ස' },
  { en: 'h', si: 'හ' },
  { en: 'H', si: 'හ' },
  { en: 'f', si: 'ෆ' },
  { en: 'F', si: 'ෆ' },
  { en: 'j', si: 'ජ' },
  { en: 'J', si: 'ඣ' },
  { en: 'c', si: 'ස' },
];

// Dependent vowel signs (Pili) attached to consonants
interface VowelStroke {
  en: string;
  pilla: string;
}

const VOWEL_STROKES: VowelStroke[] = [
  { en: 'aae', pilla: 'ෑ' },
  { en: 'Ae', pilla: 'ෑ' },
  { en: 'ae', pilla: 'ැ' },
  { en: 'aa', pilla: 'ා' },
  { en: 'A', pilla: 'ා' },
  { en: 'a', pilla: '' }, // Inherent vowel (al-lakuna drops)
  { en: 'ii', pilla: 'ී' },
  { en: 'I', pilla: 'ී' },
  { en: 'i', pilla: 'ි' },
  { en: 'uu', pilla: 'ූ' },
  { en: 'U', pilla: 'ූ' },
  { en: 'u', pilla: 'ු' },
  { en: 'ee', pilla: 'ේ' },
  { en: 'E', pilla: 'ේ' },
  { en: 'ei', pilla: 'ේ' },
  { en: 'ea', pilla: 'ේ' },
  { en: 'e', pilla: 'ෙ' },
  { en: 'ai', pilla: 'ෛ' },
  { en: 'oo', pilla: 'ෝ' },
  { en: 'O', pilla: 'ෝ' },
  { en: 'o', pilla: 'ො' },
  { en: 'au', pilla: 'ෞ' },
  { en: 'ou', pilla: 'ෞ' },
];

// Independent Vowels (Standalone at word start or after another vowel)
interface IndependentVowel {
  en: string;
  si: string;
}

const INDEPENDENT_VOWELS: IndependentVowel[] = [
  { en: 'aae', si: 'ඈ' },
  { en: 'Ae', si: 'ඈ' },
  { en: 'ae', si: 'ඇ' },
  { en: 'aa', si: 'ආ' },
  { en: 'A', si: 'ආ' },
  { en: 'a', si: 'අ' },
  { en: 'ii', si: 'ඊ' },
  { en: 'I', si: 'ඊ' },
  { en: 'i', si: 'ඉ' },
  { en: 'uu', si: 'ඌ' },
  { en: 'U', si: 'ඌ' },
  { en: 'u', si: 'උ' },
  { en: 'ee', si: 'ඒ' },
  { en: 'E', si: 'ඒ' },
  { en: 'ei', si: 'ඒ' },
  { en: 'e', si: 'එ' },
  { en: 'ai', si: 'ඓ' },
  { en: 'oo', si: 'ඕ' },
  { en: 'O', si: 'ඕ' },
  { en: 'o', si: 'ඔ' },
  { en: 'au', si: 'ඖ' },
  { en: 'ou', si: 'ඖ' },
];

/**
 * Checks if a string contains any Sinhala Unicode characters
 */
export const containsSinhala = (text?: string | null): boolean => {
  if (!text) return false;
  return /[\u0D80-\u0DFF]/.test(text);
};

/**
 * Translates a single word from Singlish to Sinhala
 */
export const convertSinglishWord = (word: string): string => {
  if (!word) return '';

  // If already contains Sinhala, preserve it
  if (containsSinhala(word)) return word;

  const lower = word.toLowerCase();
  if (WEDDING_DICTIONARY[lower]) {
    return WEDDING_DICTIONARY[lower];
  }

  let result = '';
  let i = 0;

  while (i < word.length) {
    // 1. Try matching a consonant
    let matchedC: ConsonantRule | null = null;
    for (const c of CONSONANTS) {
      if (word.startsWith(c.en, i)) {
        matchedC = c;
        break;
      }
    }

    if (matchedC) {
      i += matchedC.en.length;

      // Check if a vowel stroke follows this consonant
      let matchedV: VowelStroke | null = null;
      for (const v of VOWEL_STROKES) {
        if (word.startsWith(v.en, i)) {
          matchedV = v;
          break;
        }
      }

      if (matchedV) {
        i += matchedV.en.length;
        result += matchedC.si + matchedV.pilla;
      } else {
        // Pure consonant with halanth (al-lakuna)
        result += matchedC.si + '\u0DCA';
      }
    } else {
      // 2. Try matching an independent vowel
      let matchedIV: IndependentVowel | null = null;
      for (const iv of INDEPENDENT_VOWELS) {
        if (word.startsWith(iv.en, i)) {
          matchedIV = iv;
          break;
        }
      }

      if (matchedIV) {
        i += matchedIV.en.length;
        result += matchedIV.si;
      } else {
        // Passthrough unrecognized characters (numbers, punctuation, symbols)
        result += word[i];
        i++;
      }
    }
  }

  return result;
};

/**
 * Converts a full text string from Singlish to real Sinhala Unicode.
 * Preserves spaces, line breaks, punctuation, numbers, and existing Sinhala words.
 */
export const singlishToSinhala = (text: string): string => {
  if (!text) return '';

  // Tokenize by whitespace and standard punctuation delimiters while keeping delimiters intact
  const tokens = text.split(/(\s+|[.,!?:;()\[\]"'/\\&-])/);

  return tokens
    .map((token) => {
      // If whitespace or punctuation delimiter, keep as is
      if (!token || /^(\s+|[.,!?:;()\[\]"'/\\&]+)$/.test(token)) {
        return token;
      }

      // If token is an email or url, keep as is
      if (token.includes('@') || token.startsWith('http') || token.startsWith('www.')) {
        return token;
      }

      // Convert word
      return convertSinglishWord(token);
    })
    .join('');
};
