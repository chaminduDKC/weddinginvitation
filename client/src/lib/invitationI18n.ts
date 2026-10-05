export type InvitationLanguage = 'en' | 'si';

export interface LocalizedInvitationStrings {
  // Opening & Hero
  weddingInvitation: string;
  youAreInvited: string;
  togetherWithFamilies: string;
  requestHonorOfPresence: string;
  requestPleasureOfCompany: string;
  openInvitation: string;
  openingScreen: string;
  cover: string;
  honoredGuest: string;
  preparedForGuest: (guest: string) => string;
  andConjunction: string;

  // Ceremony Card
  officialInvitation: string;
  ceremonyAndReception: string;
  grandRoyalBanquet: string;
  holyMatrimony: string;
  sunsetReception: string;
  commencingAt: (timeStr: string) => string;
  venueLabel: string;
  openGoogleMaps: string;
  addToCalendar: string;
  appleOutlookIcs: string;

  // Timeline / Programme
  timelineHeader: string;
  timelineSchedule: string;

  // Entourage / Bridal Party
  entourageHeader: string;
  bridalParty: string;
  parentsOfBride: string;
  parentsOfGroom: string;
  maidOfHonor: string;
  bestMan: string;

  // Dress Code
  dressCodeTitle: string;
  defaultDressCode: string;

  // Love Story
  loveStoryTitle: string;

  // Gallery
  momentsTogether: string;

  // Gifts
  giftsTitle: string;

  // RSVP
  rsvpTitle: string;
  kindlyReply: string;
  replyHonored: (guest?: string | null) => string;
  joyfullyAccept: string;
  regretfullyDecline: string;
  numberOfGuests: string;
  sendRsvpWhatsApp: string;
  rsvpOnWhatsApp: string;

  // Sharing
  shareInvitation: string;
  linkCopied: string;

  // Countdown
  countdownPrefix: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;

  // Footer
  footerGreeting: string;
  withLove: string;
}

const EN_STRINGS: LocalizedInvitationStrings = {
  weddingInvitation: 'Wedding Invitation',
  youAreInvited: 'You are cordially invited to the wedding of',
  togetherWithFamilies: 'Together with our families',
  requestHonorOfPresence: 'Request the honor of your distinguished presence',
  requestPleasureOfCompany: 'Request the pleasure of your company',
  openInvitation: 'Open Wedding Invitation',
  openingScreen: 'Opening Screen',
  cover: 'Cover',
  honoredGuest: 'Honored Guest',
  preparedForGuest: (guest: string) => `Prepared with love for ${guest}`,
  andConjunction: '&',

  officialInvitation: 'Official Invitation',
  ceremonyAndReception: 'Ceremony & Wedding Reception',
  grandRoyalBanquet: 'Ceremony & Grand Royal Banquet',
  holyMatrimony: 'Holy Matrimony & Reception',
  sunsetReception: 'Ceremony & Sunset Island Reception',
  commencingAt: (timeStr: string) => `Commencing at ${timeStr}`,
  venueLabel: 'Wedding Venue',
  openGoogleMaps: 'Open in Google Maps',
  addToCalendar: 'Add to Calendar',
  appleOutlookIcs: 'Apple / Outlook (.ics)',

  timelineHeader: 'Wedding Events Timeline',
  timelineSchedule: 'Schedule of the Day',

  entourageHeader: 'Honored Entourage',
  bridalParty: 'The Bridal Party & Entourage',
  parentsOfBride: 'Parents of the Bride',
  parentsOfGroom: 'Parents of the Groom',
  maidOfHonor: 'Maid of Honor',
  bestMan: 'Best Man',

  dressCodeTitle: 'Dress Code & Attire Guidelines',
  defaultDressCode: 'Formal Evening Attire or Traditional Sri Lankan Splendor.',

  loveStoryTitle: 'Our Love Story',
  momentsTogether: 'Moments Together',
  giftsTitle: 'A Note on Gifts',

  rsvpTitle: 'RSVP',
  kindlyReply: 'Kindly Reply',
  replyHonored: (guest?: string | null) =>
    guest
      ? `${guest}, we would be honored by your reply`
      : 'We would be honored by your reply',
  joyfullyAccept: 'Joyfully accept',
  regretfullyDecline: 'Regretfully decline',
  numberOfGuests: 'Number of guests',
  sendRsvpWhatsApp: 'Send RSVP on WhatsApp',
  rsvpOnWhatsApp: 'RSVP on WhatsApp',

  shareInvitation: 'Share Invitation',
  linkCopied: 'Link copied',

  countdownPrefix: 'Until we celebrate together',
  days: 'Days',
  hours: 'Hours',
  minutes: 'Minutes',
  seconds: 'Seconds',

  footerGreeting: 'We eagerly look forward to celebrating with you.',
  withLove: 'With love,',
};

const SI_STRINGS: LocalizedInvitationStrings = {
  weddingInvitation: 'විවාහ මංගල ආරාධනයයි',
  youAreInvited: 'අපගේ විවාහ මංගල්‍යයට ඔබට ඉතා ආදරයෙන් ඇරයුම් කරමු',
  togetherWithFamilies: 'දෙමවුපිය ආශිර්වාදය මැද',
  requestHonorOfPresence: 'අපගේ විවාහ මංගල්‍යයට ඔබ සැමට ගෞරවයෙන් ආරාධනා කර සිටිමු',
  requestPleasureOfCompany: 'ඔබගේ සහභාගීත්වය ඉතා ආදරයෙන් හා ගෞරවයෙන් අපේක්ෂා කරමු',
  openInvitation: 'ආරාධනා පත්‍රය විවෘත කරන්න',
  openingScreen: 'ආරාධනා කවරය',
  cover: 'කවරය',
  honoredGuest: 'ගරු ආරාධිත අමුත්තා',
  preparedForGuest: (guest: string) => `${guest} වෙනුවෙන් ආදරයෙන් පිළියෙල කරන ලදී`,
  andConjunction: 'සහ',

  officialInvitation: 'නිල මංගල ආරාධනයයි',
  ceremonyAndReception: 'විවාහ මංගල උත්සවය සහ සාදය',
  grandRoyalBanquet: 'විවාහ මංගල උත්සවය සහ රාජකීය සාදය',
  holyMatrimony: 'විවාහ මංගල චාරිත්‍ර සහ සාදය',
  sunsetReception: 'විවාහ මංගල උත්සවය සහ සැඳෑ සාදය',
  commencingAt: (timeStr: string) => `${timeStr} ට ආරම්භ වේ`,
  venueLabel: 'ස්ථානය',
  openGoogleMaps: 'Google Maps මගින් ස්ථානය බලන්න',
  addToCalendar: 'දින දර්ශනයට එක් කරන්න',
  appleOutlookIcs: 'දින දර්ශන ගොනුව (.ics)',

  timelineHeader: 'විවාහ දින කාලසටහන',
  timelineSchedule: 'දවසේ විශේෂ අවස්ථා',

  entourageHeader: 'මංගල පිරිවර',
  bridalParty: 'මංගල පාර්ශ්වය සහ පිරිවර',
  parentsOfBride: 'මනමාලියගේ දෙමවුපියන්',
  parentsOfGroom: 'මනමාලයාගේ දෙමවුපියන්',
  maidOfHonor: 'ප්‍රධාන මනමාලි',
  bestMan: 'දෙවන මනමාලයා',

  dressCodeTitle: 'ඇඳුම් විලාසිතාව සහ උපදෙස් (Dress Code)',
  defaultDressCode: 'සාම්ප්‍රදායික හෝ විධිමත් මංගල ඇඳුමින් සැරසී පැමිණෙන්න.',

  loveStoryTitle: 'අපගේ ආදර අන්දරය',
  momentsTogether: 'අපගේ සොඳුරු මතකයන්',
  giftsTitle: 'තෑගි පිළිබඳ සටහනක්',

  rsvpTitle: 'ප්‍රතිචාර දක්වන්න (RSVP)',
  kindlyReply: 'ඔබගේ පැමිණීම දන්වන්න',
  replyHonored: (guest?: string | null) =>
    guest
      ? `${guest}, ඔබගේ පැමිණීම දැනුම් දීම අපට මහත් ගෞරවයකි`
      : 'ඔබගේ පැමිණීම දැනුම් දීම අපට මහත් ගෞරවයකි',
  joyfullyAccept: 'ප්‍රීතියෙන් සහභාගී වෙමි',
  regretfullyDecline: 'පැමිණීමට නොහැකි වීම කනගාටුවට කරුණකි',
  numberOfGuests: 'සහභාගී වන සංඛ්‍යාව',
  sendRsvpWhatsApp: 'WhatsApp මගින් ප්‍රතිචාර යවන්න',
  rsvpOnWhatsApp: 'WhatsApp මගින් දන්වන්න',

  shareInvitation: 'ආරාධනා පත්‍රය බෙදාගන්න',
  linkCopied: 'සබැඳිය පිටපත් විය',

  countdownPrefix: 'අප එක්ව සමරන තුරු',
  days: 'දින',
  hours: 'පැය',
  minutes: 'මිනිත්තු',
  seconds: 'තත්පර',

  footerGreeting: 'ඔබ සමඟ මෙම සොඳුරු දිනය සැමරීමට අපි මහත් ආශාවෙන් බලා සිටිමු.',
  withLove: 'ස්නේහයෙන්,',
};

export const getInvitationI18n = (lang: InvitationLanguage = 'en'): LocalizedInvitationStrings => {
  return lang === 'si' ? SI_STRINGS : EN_STRINGS;
};

/**
 * Format date & time according to the selected invitation language.
 */
export function formatWeddingDate(
  dateInput: string | Date | number,
  lang: InvitationLanguage = 'en'
) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return {
      weekday: '',
      dayNumber: '',
      monthYear: '',
      formattedTime: '',
      fullDateText: '',
    };
  }

  const dayNumber = d.getDate().toString();
  const year = d.getFullYear().toString();

  if (lang === 'si') {
    const sinhalaWeekdays = ['ඉරිදා', 'සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා', 'සිකුරාදා', 'සෙනසුරාදා'];
    const sinhalaMonths = [
      'ජනවාරි',
      'පෙබරවාරි',
      'මාර්තු',
      'අප්‍රේල්',
      'මැයි',
      'ජූනි',
      'ජූලි',
      'අගෝස්තු',
      'සැප්තැම්බර්',
      'ඔක්තෝබර්',
      'නොවැම්බර්',
      'දෙසැම්බර්',
    ];

    const weekday = sinhalaWeekdays[d.getDay()];
    const month = sinhalaMonths[d.getMonth()];
    const monthYear = `${year} ${month}`;

    // Sinhala 12-hour formatted time
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'ප.ව.' : 'පෙ.ව.';
    hours = hours % 12 || 12;
    const formattedTime = `${period} ${hours.toString().padStart(2, '0')}:${minutes}`;

    return {
      weekday,
      dayNumber,
      monthYear,
      formattedTime,
      fullDateText: `${year} ${month} ${dayNumber} වන ${weekday}`,
    };
  }

  // English
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const monthYear = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const formattedTime = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return {
    weekday,
    dayNumber,
    monthYear,
    formattedTime,
    fullDateText: `${weekday}, ${monthYear}`,
  };
}

/**
 * Returns default timeline items in English or Sinhala.
 */
export function getDefaultItinerary(
  eventDate: string | Date | number,
  lang: InvitationLanguage = 'en'
) {
  const base = new Date(eventDate);
  const addMin = (min: number) => {
    const t = new Date(base.getTime() + min * 60000);
    const hours = t.getHours();
    const minutes = t.getMinutes().toString().padStart(2, '0');
    if (lang === 'si') {
      const p = hours >= 12 ? 'ප.ව.' : 'පෙ.ව.';
      const h = hours % 12 || 12;
      return `${p} ${h.toString().padStart(2, '0')}:${minutes}`;
    }
    const p = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${h.toString().padStart(2, '0')}:${minutes} ${p}`;
  };

  if (lang === 'si') {
    return [
      {
        time: addMin(0),
        title: 'මංගල පෝරු චාරිත්‍ර සහ ආශිර්වාදය',
        desc: 'සාම්ප්‍රදායික පෝරු මස්තකාරූඪ චාරිත්‍ර සහ මුදු පැළඳවීම',
      },
      {
        time: addMin(90),
        title: 'සැඳෑ සාදය සහ තේ පැන් සංග්‍රහය',
        desc: 'ආගන්තුක සත්කාරය, ඡායාරූප සහ ප්‍රණීත කෙටි ආහාර සංග්‍රහය',
      },
      {
        time: addMin(210),
        title: 'රාත්‍රී මංගල භෝජන සංග්‍රහය',
        desc: 'ප්‍රණීත රාත්‍රී භෝජන සංග්‍රහය, සුබපැතුම් සහ ප්‍රීති සාදය',
      },
    ];
  }

  return [
    {
      time: addMin(0),
      title: 'Auspicious Ceremony / Vows',
      desc: 'Sacred blessings and exchange of vows',
    },
    {
      time: addMin(90),
      title: 'Sunset Cocktails & Refreshments',
      desc: 'Canapés, champagne & ambient music',
    },
    {
      time: addMin(210),
      title: 'Grand Banquet & Dancing',
      desc: 'Evening banquet, celebratory toasts & revelry',
    },
  ];
}

/**
 * Pre-filled WhatsApp message for RSVP.
 */
export function formatWhatsAppMessage({
  brideName,
  groomName,
  guestName,
  attending,
  guests,
  lang = 'en',
}: {
  brideName: string;
  groomName: string;
  guestName?: string | null;
  attending: boolean;
  guests: number;
  lang?: InvitationLanguage;
}) {
  if (lang === 'si') {
    const who = guestName ? `මම ${guestName}. ` : '';
    if (attending) {
      return `ආයුබෝවන්! ${who}මම ${brideName} සහ ${groomName} ගේ විවාහ මංගල්‍යයට ප්‍රීතියෙන් සහභාගී වෙමි. සහභාගී වන සංඛ්‍යාව: ${guests}.`;
    }
    return `ආයුබෝවන්! ${who}කනගාටුවෙන් වුවද මට ${brideName} සහ ${groomName} ගේ විවාහ මංගල්‍යයට සහභාගී වීමට නොහැකි බව දන්වමි. ඔබ දෙපලට වාසනාවන්ත යුග දිවියකට හදවතින්ම සුබ පතමි!`;
  }

  const who = guestName ? `This is ${guestName}. ` : '';
  if (attending) {
    return `Hello! ${who}I will be attending the wedding of ${brideName} & ${groomName}. Number of guests: ${guests}.`;
  }
  return `Hello! ${who}Unfortunately I will not be able to attend the wedding of ${brideName} & ${groomName}. Wishing you both all the best!`;
}
