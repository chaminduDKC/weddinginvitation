import { z } from "zod";

export const reviewOrderSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"], {
    errorMap: () => ({ message: "Status must be either APPROVED or REJECTED" }),
  }),
  note: z.string().trim().max(500, "Note cannot exceed 500 characters").optional(),
});

export const toggleUserStatusSchema = z.object({
  isActive: z.boolean({
    required_error: "isActive boolean is required",
  }),
});

export const updateTemplateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Template name cannot be empty")
    .max(100, "Template name cannot exceed 100 characters")
    .optional(),
  thumbnailUrl: z.string().trim().nullable().optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  priceLkr: z.number().int().min(0, "Price must be non-negative").optional(),
  isActive: z.boolean().optional(),
});

export type ReviewOrderInput = z.infer<typeof reviewOrderSchema>;
export type ToggleUserStatusInput = z.infer<typeof toggleUserStatusSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
