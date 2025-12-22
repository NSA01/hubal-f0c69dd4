import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Designer {
  id: string;
  user_id: string;
  business_name: string | null;
  bio: string | null;
  city: string;
  min_budget: number;
  max_budget: number;
  services: string[];
  portfolio_images: string[];
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  profile?: {
    name: string;
    avatar_url: string | null;
  };
}

export function useDesigners(filters?: { city?: string; minBudget?: number; maxBudget?: number }) {
  return useQuery({
    queryKey: ['designers', filters],
    queryFn: async () => {
      let query = supabase
        .from('designers')
        .select(`
          *,
          profile:profiles!designers_user_id_fkey(name, avatar_url)
        `)
        .eq('is_active', true);

      if (filters?.city && filters.city !== 'all') {
        query = query.eq('city', filters.city);
      }

      if (filters?.minBudget) {
        query = query.gte('max_budget', filters.minBudget);
      }

      if (filters?.maxBudget) {
        query = query.lte('min_budget', filters.maxBudget);
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (error) throw error;
      return data as Designer[];
    },
  });
}

export function useDesigner(id: string) {
  return useQuery({
    queryKey: ['designer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('designers')
        .select(`
          *,
          profile:profiles!designers_user_id_fkey(name, avatar_url)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Designer | null;
    },
    enabled: !!id,
  });
}

export function useMyDesignerProfile(userId?: string) {
  return useQuery({
    queryKey: ['my-designer-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('designers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as Designer | null;
    },
    enabled: !!userId,
  });
}
