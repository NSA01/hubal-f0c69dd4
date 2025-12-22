import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  designer_id: string;
  customer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_profile?: {
    name: string;
    avatar_url: string | null;
  };
}

export function useDesignerReviews(designerId?: string) {
  return useQuery({
    queryKey: ['designer-reviews', designerId],
    queryFn: async () => {
      if (!designerId) return [];
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          customer_profile:profiles!reviews_customer_id_fkey(name, avatar_url)
        `)
        .eq('designer_id', designerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
    enabled: !!designerId,
  });
}
