import { z } from 'zod';

const uuid = z.string().uuid();

/* ================= AUTH ================= */

// 🔥 FIXED REGISTER SCHEMA (يتوافق مع الفرونت)
export const registerBodySchema = z.object({
  firstName: z.string().min(2).max(120),
  lastName: z.string().min(2).max(120),
  email: z.string().email().max(200),
  password: z.string().min(8).max(128),
  phone: z.string().min(7).max(30).optional(),
});

export const loginBodySchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(128),
});

/* ================= PETS ================= */

export const petCreateBodySchema = z.object({
  name: z.string().min(1).max(80),
  type: z.string().min(1).max(50),
  breed: z.string().min(1).max(80),
  gender: z.string().min(1).max(20),
  age: z.coerce.number().int().min(0).max(60),
  description: z.string().max(2000).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  imageUrls: z.array(z.string().min(1)).optional(),
});

export const petUpdateBodySchema = petCreateBodySchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field is required for update',
  });

export const idParamSchema = z.object({
  id: uuid,
});

export const petIdParamSchema = z.object({
  petId: uuid,
});

export const conversationIdParamSchema = z.object({
  conversationId: uuid,
});

/* ================= MATCHING ================= */

export const matchRequestBodySchema = z.object({
  senderPetId: uuid,
  targetPetId: uuid,
  message: z.string().max(2000).optional(),
});

/* ================= CHAT ================= */

export const startConversationBodySchema = z.object({
  user2Id: uuid,
});

export const sendMessageBodySchema = z
  .object({
    conversationId: uuid,
    text: z.string().trim().max(4000).optional(),
    image: z.string().url().optional(),
  })
  .refine((val) => Boolean(val.text || val.image), {
    message: 'Either text or image is required',
    path: ['text'],
  });

export const aiAssistantChatBodySchema = z.object({
  message: z.string().trim().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().trim().min(1).max(4000),
      })
    )
    .max(20)
    .optional()
    .default([]),
});

/* ================= HEALTH ================= */

export const healthRecordBodySchema = z.object({
  petId: uuid,
  vaccine: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  vetName: z.string().max(200).optional(),
  date: z.string().datetime().optional(),
});

/* ================= PAYMENT ================= */

export const uploadPaymentBodySchema = z.object({
  amount: z.coerce.number().positive().max(1000000),
  method: z.string().min(1).max(80),
});

export const activateSubscriptionBodySchema = z.object({
  planId: uuid,
});

export const confirmPaymentBodySchema = z.object({
  paymentId: uuid,
});

/* ================= ADMIN ================= */

export const verifyUserBodySchema = z.object({
  userId: uuid,
});

export const banUserBodySchema = z.object({
  userId: uuid,
});

/* ================= SUPPORT ================= */

export const supportTicketCategorySchema = z.enum([
  'TECHNICAL',
  'ACCOUNT',
  'PAYMENT',
  'MATCHING',
  'SAFETY',
  'FEEDBACK',
  'OTHER',
]);

export const supportTicketPrioritySchema = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']);

export const supportTicketStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'REPLIED', 'CLOSED']);

export const supportTicketCreateBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(200),
  subject: z.string().trim().min(2).max(200),
  category: supportTicketCategorySchema,
  message: z.string().trim().min(2).max(10000),
  priority: supportTicketPrioritySchema.optional().default('NORMAL'),
});

export const supportTicketReplyBodySchema = z.object({
  message: z.string().trim().min(1).max(10000),
});

export const supportTicketStatusBodySchema = z.object({
  status: supportTicketStatusSchema,
});

/* ================= MARKETPLACE ================= */

export const marketplaceCategorySchema = z.enum([
  'FOOD',
  'TOYS',
  'ACCESSORIES',
  'MEDICAL',
  'GROOMING',
]);

export const marketplaceOrderStatusSchema = z.enum([
  'pending',
  'paid',
  'shipped',
  'delivered',
]);

export const becomeSellerBodySchema = z.object({
  storeName: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).optional(),
});

export const productCreateBodySchema = z.object({
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).optional(),
  price: z.coerce.number().positive().max(10000000),
  category: z
    .string()
    .trim()
    .transform((val) => val.toUpperCase())
    .pipe(marketplaceCategorySchema),
  stock: z.coerce.number().int().min(0).max(1000000),
  images: z.array(z.string().url()).max(20).optional().default([]),
});

export const productUpdateBodySchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  price: z.coerce.number().positive().max(10000000).optional(),
  category: z
    .string()
    .trim()
    .transform((val) => val.toUpperCase())
    .pipe(marketplaceCategorySchema)
    .optional(),
  stock: z.coerce.number().int().min(0).max(1000000).optional(),
  images: z.array(z.string().url()).max(20).optional(),
  isActive: z.boolean().optional(),
});

export const productListQuerySchema = z.object({
  category: z
    .string()
    .trim()
    .transform((val) => val.toUpperCase())
    .pipe(marketplaceCategorySchema)
    .optional(),
  sellerId: uuid.optional(),
  q: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).max(1000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const cartAddItemBodySchema = z.object({
  productId: uuid,
  quantity: z.coerce.number().int().min(1).max(1000),
});

export const cartUpdateItemBodySchema = z.object({
  quantity: z.coerce.number().int().min(1).max(1000),
});

export const updateOrderStatusBodySchema = z.object({
  status: marketplaceOrderStatusSchema,
});