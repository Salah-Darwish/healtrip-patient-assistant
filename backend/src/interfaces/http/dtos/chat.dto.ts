import { z } from 'zod';

export const PostChatMessageSchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message exceeds 2000 characters limit'),
  language: z.enum(['en', 'ar']).default('en'),
});

export type PostChatMessageDto = z.infer<typeof PostChatMessageSchema>;

export const GetDoctorsQuerySchema = z.object({
  specialty: z.string().optional(),
  countryCode: z.string().optional(),
  acceptsSecondOpinion: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  search: z.string().optional(),
});

export const GetHospitalsQuerySchema = z.object({
  countryCode: z.string().optional(),
  city: z.string().optional(),
  hasEmergency: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  search: z.string().optional(),
});
