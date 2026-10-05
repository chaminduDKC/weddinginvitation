import { z } from "zod";

export const createGuestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Guest name is required")
    .max(100, "Guest name cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .min(8, "Phone number must be at least 8 digits")
    .max(20, "Phone number cannot exceed 20 characters")
    .regex(/^[+0-9\s-]+$/, "Phone number must contain only numbers and optional symbols"),
});

export const updateGuestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Guest name is required")
    .max(100, "Guest name cannot exceed 100 characters")
    .optional(),
  phone: z
    .string()
    .trim()
    .min(8, "Phone number must be at least 8 digits")
    .max(20, "Phone number cannot exceed 20 characters")
    .regex(/^[+0-9\s-]+$/, "Phone number must contain only numbers and optional symbols")
    .optional(),
});

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
