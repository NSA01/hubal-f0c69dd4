export interface Designer {
  id: string;
  name: string;
  businessName?: string;
  city: string;
  rating: number;
  reviewsCount: number;
  budgetMin: number;
  budgetMax: number;
  avatar: string;
  bio: string;
  services: string[];
  portfolio: string[];
}

export interface Review {
  id: string;
  designerId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  designerId?: string;
  propertyType: 'apartment' | 'villa' | 'commercial';
  budget: number;
  description: string;
  city: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
}

export const PROPERTY_TYPES = {
  apartment: 'شقة',
  villa: 'فيلا',
  commercial: 'تجاري',
} as const;

export const CITIES = [
  'الرياض',
  'جدة',
  'الدمام',
  'مكة المكرمة',
  'المدينة المنورة',
  'الخبر',
  'الظهران',
  'تبوك',
  'أبها',
  'القصيم',
] as const;

export const BUDGET_RANGES = [
  { min: 0, max: 10000, label: 'أقل من ١٠,٠٠٠ ر.س' },
  { min: 10000, max: 25000, label: '١٠,٠٠٠ - ٢٥,٠٠٠ ر.س' },
  { min: 25000, max: 50000, label: '٢٥,٠٠٠ - ٥٠,٠٠٠ ر.س' },
  { min: 50000, max: 100000, label: '٥٠,٠٠٠ - ١٠٠,٠٠٠ ر.س' },
  { min: 100000, max: Infinity, label: 'أكثر من ١٠٠,٠٠٠ ر.س' },
] as const;
