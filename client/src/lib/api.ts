import api from './axios';
import {
  Template,
  Order,
  AdminOrder,
  AdminUser,
  Invitation,
  Guest,
  PublicInvitation,
  ApiResponse,
} from '../types';

// Templates
export const fetchTemplates = async (): Promise<Template[]> => {
  const { data } = await api.get<ApiResponse<{ templates: Template[] }>>('/api/templates');
  if (!data.success) throw new Error(data.error || 'Failed to fetch templates');
  return data.data?.templates || [];
};

export const fetchTemplate = async (idOrKey: string): Promise<Template> => {
  const { data } = await api.get<ApiResponse<{ template: Template }>>(`/api/templates/${idOrKey}`);
  if (!data.success) throw new Error(data.error || 'Failed to fetch template');
  return data.data!.template;
};

// Orders
export const fetchUserOrders = async (): Promise<Order[]> => {
  const { data } = await api.get<ApiResponse<{ orders: Order[] }>>('/api/orders');
  if (!data.success) throw new Error(data.error || 'Failed to fetch orders');
  return data.data?.orders || [];
};

export const submitOrder = async (
  templateId: string,
  slipFile: File,
  onUploadProgress?: (progress: number) => void
): Promise<Order> => {
  const formData = new FormData();
  formData.append('templateId', templateId);
  formData.append('slip', slipFile);

  const { data } = await api.post<ApiResponse<{ order: Order }>>('/api/orders', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onUploadProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  });

  if (!data.success) throw new Error(data.error || 'Failed to submit payment slip');
  return data.data!.order;
};

// Invitations (Customizer)
export const fetchUserInvitations = async (): Promise<Invitation[]> => {
  const { data } = await api.get<ApiResponse<{ invitations: Invitation[] }>>('/api/invitations');
  if (!data.success) throw new Error(data.error || 'Failed to fetch invitations');
  return data.data?.invitations || [];
};

export const saveInvitation = async (invitationData: {
  templateId: string;
  venue: string;
  eventDate: string;
  heroImageUrl?: string;
  galleryImages?: string[];
  storyText?: string;
  mapUrl?: string;
  brideName?: string;
  groomName?: string;
}): Promise<Invitation> => {
  const { data } = await api.post<ApiResponse<{ invitation: Invitation }>>('/api/invitations', invitationData);
  if (!data.success) throw new Error(data.error || 'Failed to save invitation');
  return data.data!.invitation;
};

// Guests
export const fetchGuests = async (): Promise<Guest[]> => {
  const { data } = await api.get<ApiResponse<{ guests: Guest[] }>>('/api/guests');
  if (!data.success) throw new Error(data.error || 'Failed to fetch guest list');
  return data.data?.guests || [];
};

export const createGuest = async (guest: { name: string; phone: string }): Promise<Guest> => {
  const { data } = await api.post<ApiResponse<{ guest: Guest }>>('/api/guests', guest);
  if (!data.success) throw new Error(data.error || 'Failed to add guest');
  return data.data!.guest;
};

export const updateGuest = async (id: string, guest: { name?: string; phone?: string }): Promise<Guest> => {
  const { data } = await api.patch<ApiResponse<{ guest: Guest }>>(`/api/guests/${id}`, guest);
  if (!data.success) throw new Error(data.error || 'Failed to update guest');
  return data.data!.guest;
};

export const deleteGuest = async (id: string): Promise<void> => {
  const { data } = await api.delete<ApiResponse>(`/api/guests/${id}`);
  if (!data.success) throw new Error(data.error || 'Failed to delete guest');
};

// Public Invitation
export const fetchPublicInvitation = async (
  token: string,
  templateKey?: string
): Promise<PublicInvitation> => {
  const url = templateKey
    ? `/api/public/invitations/${token}?template=${encodeURIComponent(templateKey)}`
    : `/api/public/invitations/${token}`;
  const { data } = await api.get<ApiResponse<{ invitation: PublicInvitation }>>(url);
  if (!data.success) throw new Error(data.error || 'Failed to load wedding invitation');
  return data.data!.invitation;
};

// ==========================================
// Administrative API Endpoints
// ==========================================

export const fetchAdminTemplates = async (): Promise<Template[]> => {
  const { data } = await api.get<ApiResponse<{ templates: Template[] }>>('/api/admin/templates');
  if (!data.success) throw new Error(data.error || 'Failed to fetch admin templates');
  return data.data?.templates || [];
};

export const updateAdminTemplate = async (
  id: string,
  updateData: {
    name?: string;
    thumbnailUrl?: string | null;
    description?: string | null;
    priceLkr?: number;
    isActive?: boolean;
  }
): Promise<Template> => {
  const { data } = await api.patch<ApiResponse<{ template: Template }>>(
    `/api/admin/templates/${id}`,
    updateData
  );
  if (!data.success) throw new Error(data.error || 'Failed to update template');
  return data.data!.template;
};

export const uploadAdminTemplateThumbnail = async (
  id: string,
  file: File
): Promise<{ template: Template; thumbnailUrl: string }> => {
  const formData = new FormData();
  formData.append('thumbnail', file);

  const { data } = await api.post<ApiResponse<{ template: Template; thumbnailUrl: string }>>(
    `/api/admin/templates/${id}/thumbnail`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  if (!data.success) throw new Error(data.error || 'Failed to upload template thumbnail');
  return data.data!;
};

export const fetchAdminOrders = async (): Promise<AdminOrder[]> => {
  const { data } = await api.get<ApiResponse<{ orders: AdminOrder[] }>>('/api/admin/orders');
  if (!data.success) throw new Error(data.error || 'Failed to fetch admin orders');
  return data.data?.orders || [];
};

export const reviewAdminOrder = async (
  id: string,
  status: 'APPROVED' | 'REJECTED',
  note?: string
): Promise<AdminOrder> => {
  const { data } = await api.patch<ApiResponse<{ order: AdminOrder }>>(
    `/api/admin/orders/${id}/review`,
    { status, note }
  );
  if (!data.success) throw new Error(data.error || 'Failed to review order');
  return data.data!.order;
};

export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  const { data } = await api.get<ApiResponse<{ users: AdminUser[] }>>('/api/admin/users');
  if (!data.success) throw new Error(data.error || 'Failed to fetch admin users');
  return data.data?.users || [];
};

export const toggleAdminUserStatus = async (
  id: string,
  isActive: boolean
): Promise<AdminUser> => {
  const { data } = await api.patch<ApiResponse<{ user: AdminUser }>>(
    `/api/admin/users/${id}/status`,
    { isActive }
  );
  if (!data.success) throw new Error(data.error || 'Failed to toggle user account status');
  return data.data!.user;
};
