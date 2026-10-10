export interface User {
  id: string;
  brideName: string;
  groomName: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  emailVerifiedAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Template {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  priceLkr: number;
  thumbnailUrl?: string | null;
  isActive: boolean;
}

export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BankAccount {
  label?: string;
  bankName: string;
  accountNumber: string;
  accountName?: string;
  branch?: string;
}

export interface BankDetails {
  accounts: BankAccount[];
  note?: string;
}

export interface DevelopedBy {
  name: string;
  role: string;
  website?: string;
  description?: string;
}

export interface ContactDetails {
  companyName: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp?: string;
  email: string;
  address?: string;
  businessHours?: string;
  developedBy: DevelopedBy;
  socialLinks?: {
    whatsapp?: string;
    facebook?: string;
    instagram?: string;
  };
  supportNotice?: string;
}

export interface Order {
  id: string;
  templateId: string;
  status: OrderStatus;
  note?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  template: {
    id: string;
    key: string;
    name: string;
    priceLkr: number;
    thumbnailUrl?: string | null;
  };
}

export interface AdminOrder extends Order {
  slipUrl?: string | null;
  signedSlipUrl?: string;
  user: {
    id: string;
    brideName: string;
    groomName: string;
    email: string;
    phone: string;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  phone: string;
  brideName: string;
  groomName: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  _count?: {
    orders: number;
    invitations: number;
    guests: number;
  };
}

export interface Invitation {
  id: string;
  userId: string;
  templateId: string;
  venue: string;
  eventDate: string;
  language?: 'en' | 'si';
  fontStyle?:
    | 'abhaya'
    | 'gemunu'
    | 'arjuna'
    | 'bindumathi'
    | 'emanee'
    | 'rajantha'
    | 'noto-serif'
    | 'noto-sans';
  heroImageUrl?: string | null;
  galleryImages: string[];
  storyText?: string | null;
  mapUrl?: string | null;
  template?: Template;
  user?: {
    id: string;
    brideName: string;
    groomName: string;
  };
}

export interface Guest {
  id: string;
  userId: string;
  name: string;
  phone: string;
  token: string;
  viewedAt?: string | null;
  createdAt: string;
}

export interface PublicInvitation {
  guestName: string;
  brideName: string;
  groomName: string;
  venue: string;
  eventDate: string;
  templateKey: string;
  language?: 'en' | 'si';
  fontStyle?:
    | 'abhaya'
    | 'gemunu'
    | 'arjuna'
    | 'bindumathi'
    | 'emanee'
    | 'rajantha'
    | 'noto-serif'
    | 'noto-sans';
  heroImageUrl: string | null;
  galleryImages: string[];
  storyText: string | null;
  mapUrl: string | null;
  dressCode?: string | null;
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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}
