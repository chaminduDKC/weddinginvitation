export interface WeddingInviteData {
  guestName?: string;
  brideName: string;
  groomName: string;
  brideNameSi?: string | null;
  groomNameSi?: string | null;
  guestNameSi?: string | null;
  venue: string;
  eventDate: string;
  heroImageUrl?: string | null;
  galleryImages?: string[];
  storyText?: string | null;
  mapUrl?: string | null;
  templateKey?: string;
  language?: 'en' | 'si';
  fontStyle?: 'abhaya' | 'gemunu' | 'noto-serif' | 'noto-sans';
  // Tier-specific extended fields
  dressCode?: string;
  itinerary?: Array<{ time: string; title: string; desc?: string }>;
  entourage?: {
    parentsOfBride?: string;
    parentsOfGroom?: string;
    maidOfHonor?: string;
    bestMan?: string;
  };
  musicUrl?: string | null;
  musicTitle?: string | null;
}

export interface TemplateComponentProps {
  data: WeddingInviteData;
  isGuestView?: boolean;
  hasOpened: boolean;
  onOpen: () => void;
  musicPlaying?: boolean;
  onToggleMusic?: () => void;
}
