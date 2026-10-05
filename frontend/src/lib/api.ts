import api from './axios';
import { Order, AdminUser, Template, ApiResponse } from '../types';

export const fetchTemplates = async (): Promise<{ templates: Template[] }> => {
  const { data } = await api.get<ApiResponse<{ templates: Template[] }>>('/api/admin/templates');
  if (!data.success) throw new Error(data.error || 'Failed to fetch templates');
  return data.data!;
};

export const updateTemplate = async (
  id: string,
  updateData: {
    name?: string;
    thumbnailUrl?: string | null;
    description?: string | null;
    priceLkr?: number;
    isActive?: boolean;
  }
): Promise<{ template: Template }> => {
  const { data } = await api.patch<ApiResponse<{ template: Template }>>(
    `/api/admin/templates/${id}`,
    updateData
  );
  if (!data.success) throw new Error(data.error || 'Failed to update template');
  return data.data!;
};

export const uploadTemplateThumbnail = async (
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
  if (!data.success) throw new Error(data.error || 'Failed to upload thumbnail');
  return data.data!;
};

export const fetchOrders = async (): Promise<{ orders: Order[] }> => {
  const { data } = await api.get<ApiResponse<{ orders: Order[] }>>('/api/admin/orders');
  if (!data.success) throw new Error(data.error);
  return data.data!;
};

export const reviewOrder = async (id: string, status: 'APPROVED' | 'REJECTED', note?: string) => {
  const { data } = await api.patch<ApiResponse>(`/api/admin/orders/${id}/review`, { status, note });
  if (!data.success) throw new Error(data.error);
  return data;
};

export const fetchUsers = async (search?: string): Promise<{ users: AdminUser[] }> => {
  const { data } = await api.get<ApiResponse<{ users: AdminUser[] }>>('/api/admin/users', { params: { search } });
  if (!data.success) throw new Error(data.error);
  return data.data!;
};

export const toggleUserStatus = async (id: string, isActive: boolean) => {
  const { data } = await api.patch<ApiResponse>(`/api/admin/users/${id}/status`, { isActive });
  if (!data.success) throw new Error(data.error);
  return data;
};

export const deleteUser = async (id: string) => {
  const { data } = await api.delete<ApiResponse>(`/api/admin/users/${id}`);
  if (!data.success) throw new Error(data.error);
  return data;
};
