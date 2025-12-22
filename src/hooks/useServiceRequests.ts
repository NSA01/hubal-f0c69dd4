import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceRequest {
  id: string;
  customer_id: string;
  designer_id: string;
  property_type: string;
  city: string;
  budget: number;
  description: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  customer_profile?: {
    name: string;
    avatar_url: string | null;
  };
  designer?: {
    business_name: string | null;
    profile?: {
      name: string;
    };
  };
}

export function useCustomerRequests(customerId?: string) {
  return useQuery({
    queryKey: ['customer-requests', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          designer:designers(
            business_name,
            profile:profiles!designers_user_id_fkey(name)
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ServiceRequest[];
    },
    enabled: !!customerId,
  });
}

export function useDesignerRequests(designerId?: string) {
  return useQuery({
    queryKey: ['designer-requests', designerId],
    queryFn: async () => {
      if (!designerId) return [];
      
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          customer_profile:profiles!service_requests_customer_id_fkey(name, avatar_url)
        `)
        .eq('designer_id', designerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ServiceRequest[];
    },
    enabled: !!designerId,
  });
}

export function useCreateServiceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: {
      designer_id: string;
      property_type: string;
      city: string;
      budget: number;
      description?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          customer_id: user.id,
          designer_id: request.designer_id,
          property_type: request.property_type,
          city: request.city,
          budget: request.budget,
          description: request.description,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-requests'] });
      queryClient.invalidateQueries({ queryKey: ['designer-requests'] });
    },
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('service_requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designer-requests'] });
      queryClient.invalidateQueries({ queryKey: ['customer-requests'] });
    },
  });
}
