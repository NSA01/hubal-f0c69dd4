import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  designer_id: string;
  customer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_name?: string;
  customer_avatar?: string | null;
}

export function useDesignerReviews(designerId?: string) {
  return useQuery({
    queryKey: ['designer-reviews', designerId],
    queryFn: async () => {
      if (!designerId) return [];
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('designer_id', designerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch customer profiles
      const reviews = data || [];
      const customerIds = [...new Set(reviews.map(r => r.customer_id))];
      
      if (customerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, avatar_url')
          .in('user_id', customerIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        return reviews.map(r => ({
          ...r,
          customer_name: profileMap.get(r.customer_id)?.name || 'عميل',
          customer_avatar: profileMap.get(r.customer_id)?.avatar_url,
        })) as Review[];
      }

      return reviews as Review[];
    },
    enabled: !!designerId,
  });
}
