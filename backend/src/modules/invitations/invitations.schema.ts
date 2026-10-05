import { z } from "zod";

export const upsertInvitationSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  venue: z
    .string()
    .trim()
    .min(2, "Venue must be at least 2 characters")
    .max(255, "Venue cannot exceed 255 characters"),
  eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Event date must be a valid ISO date or timestamp",
  }),
  heroImageUrl: z.string().optional().nullable(),
  galleryImages: z.array(z.string()).optional().default([]),
  storyText: z.string().optional().nullable(),
  mapUrl: z.string().optional().nullable(),
  brideName: z.string().trim().min(1).max(100).optional(),
  groomName: z.string().trim().min(1).max(100).optional(),
});

export type UpsertInvitationInput = z.infer<typeof upsertInvitationSchema>;
