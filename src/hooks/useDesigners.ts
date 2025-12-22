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
  name?: string;
  avatar_url?: string | null;
}

export function useDesigners(filters?: { city?: string; minBudget?: number; maxBudget?: number }) {
  return useQuery({
    queryKey: ['designers', filters],
    queryFn: async () => {
      let query = supabase
        .from('designers')
        .select('*')
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

      // Fetch profiles for each designer
      const designers = data || [];
      const userIds = designers.map(d => d.user_id);
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, avatar_url')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        
        return designers.map(d => ({
          ...d,
          name: profileMap.get(d.user_id)?.name || d.business_name || 'مصمم',
          avatar_url: profileMap.get(d.user_id)?.avatar_url,
        })) as Designer[];
      }

      return designers as Designer[];
    },
  });
}

export function useDesigner(id: string) {
  return useQuery({
    queryKey: ['designer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('designers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('user_id', data.user_id)
        .maybeSingle();

      return {
        ...data,
        name: profile?.name || data.business_name || 'مصمم',
        avatar_url: profile?.avatar_url,
      } as Designer;
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
