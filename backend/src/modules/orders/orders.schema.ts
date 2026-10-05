import { z } from "zod";

export const createOrderSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
