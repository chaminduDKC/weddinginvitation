export interface User {
  id: string;
  brideName: string;
  groomName: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'USER';
  emailVerifiedAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUser extends User {
  _count: {
    orders: number;
    invitations: number;
    guests: number;
  };
}

export interface Template {
  id: string;
  key: string;
  name: string;
  description?: string;
  priceLkr: number;
  thumbnailUrl?: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  userId: string;
  templateId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  slipUrl?: string;
  slipPublicId?: string;
  note?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id' | 'brideName' | 'groomName' | 'email' | 'phone'>;
  template: Pick<Template, 'id' | 'key' | 'name' | 'priceLkr'>;
  signedSlipUrl: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}
