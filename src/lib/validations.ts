import { z } from 'zod';

// Service Request validation schema
export const ServiceRequestSchema = z.object({
  designer_id: z.string().uuid('معرف المصمم غير صالح'),
  property_type: z.string().min(1, 'نوع العقار مطلوب').max(50, 'نوع العقار طويل جداً'),
  city: z.string().min(2, 'المدينة مطلوبة').max(50, 'اسم المدينة طويل جداً'),
  budget: z.number().min(1, 'الميزانية يجب أن تكون أكبر من صفر').max(100000000, 'الميزانية كبيرة جداً'),
  description: z.string().max(2000, 'الوصف يجب أن يكون أقل من 2000 حرف').optional(),
});

export type ServiceRequestInput = z.infer<typeof ServiceRequestSchema>;

// Message validation schema
export const MessageSchema = z.object({
  conversationId: z.string().uuid('معرف المحادثة غير صالح'),
  receiverId: z.string().uuid('معرف المستقبل غير صالح'),
  content: z.string()
    .min(1, 'الرسالة لا يمكن أن تكون فارغة')
    .max(5000, 'الرسالة يجب أن تكون أقل من 5000 حرف')
    .transform(val => val.trim()),
});

export type MessageInput = z.infer<typeof MessageSchema>;

// Designer Profile validation schema
export const DesignerProfileSchema = z.object({
  business_name: z.string().max(100, 'اسم المكتب يجب أن يكون أقل من 100 حرف').optional().nullable(),
  bio: z.string().max(1000, 'النبذة يجب أن تكون أقل من 1000 حرف').optional().nullable(),
  city: z.string().min(2, 'المدينة مطلوبة').max(50, 'اسم المدينة طويل جداً'),
  min_budget: z.number().min(0, 'الحد الأدنى للميزانية لا يمكن أن يكون سالباً').max(100000000, 'الميزانية كبيرة جداً'),
  max_budget: z.number().min(0, 'الحد الأقصى للميزانية لا يمكن أن يكون سالباً').max(100000000, 'الميزانية كبيرة جداً'),
  services: z.array(z.string().max(100)).min(1, 'يجب إضافة خدمة واحدة على الأقل').max(20, 'الحد الأقصى 20 خدمة'),
}).refine(data => data.min_budget <= data.max_budget, {
  message: 'الحد الأدنى للميزانية يجب أن يكون أقل من الحد الأقصى',
  path: ['min_budget'],
});

export type DesignerProfileInput = z.infer<typeof DesignerProfileSchema>;

// Profile Update validation schema
export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100, 'الاسم يجب أن يكون أقل من 100 حرف'),
  phone: z.string().max(20, 'رقم الهاتف طويل جداً').optional().nullable(),
  city: z.string().max(50, 'اسم المدينة طويل جداً').optional().nullable(),
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

// Status Update validation schema
export const StatusUpdateSchema = z.object({
  id: z.string().uuid('معرف الطلب غير صالح'),
  status: z.enum(['pending', 'accepted', 'rejected', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'حالة الطلب غير صالحة' }),
  }),
});

export type StatusUpdateInput = z.infer<typeof StatusUpdateSchema>;
