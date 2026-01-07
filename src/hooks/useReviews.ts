import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      designerId,
      serviceRequestId,
      rating,
      comment,
    }: {
      designerId: string;
      serviceRequestId?: string;
      rating: number;
      comment?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          designer_id: designerId,
          customer_id: user.id,
          service_request_id: serviceRequestId,
          rating,
          comment: comment?.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['designer-reviews', variables.designerId] });
      queryClient.invalidateQueries({ queryKey: ['customer-requests'] });
      queryClient.invalidateQueries({ queryKey: ['designers'] });
      queryClient.invalidateQueries({ queryKey: ['existing-review', variables.designerId] });
      queryClient.invalidateQueries({ queryKey: ['has-reviewed', variables.designerId] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      designerId,
      rating,
      comment,
    }: {
      reviewId: string;
      designerId: string;
      rating: number;
      comment?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating,
          comment: comment?.trim() || null,
        })
        .eq('id', reviewId)
        .eq('customer_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['designer-reviews', variables.designerId] });
      queryClient.invalidateQueries({ queryKey: ['customer-requests'] });
      queryClient.invalidateQueries({ queryKey: ['designers'] });
      queryClient.invalidateQueries({ queryKey: ['existing-review', variables.designerId] });
      queryClient.invalidateQueries({ queryKey: ['has-reviewed', variables.designerId] });
    },
  });
}

export function useExistingReview(designerId?: string) {
  return useQuery({
    queryKey: ['existing-review', designerId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !designerId) return null;

      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('designer_id', designerId)
        .eq('customer_id', user.id)
        .maybeSingle();

      return data as Review | null;
    },
    enabled: !!designerId,
  });
}

export function useHasReviewed(designerId?: string) {
  return useQuery({
    queryKey: ['has-reviewed', designerId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !designerId) return false;

      // Check if customer already reviewed this designer (unique constraint: customer_id + designer_id)
      const { data } = await supabase
        .from('reviews')
        .select('id')
        .eq('designer_id', designerId)
        .eq('customer_id', user.id)
        .maybeSingle();

      return !!data;
    },
    enabled: !!designerId,
  });
}
