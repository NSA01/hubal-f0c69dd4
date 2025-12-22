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
  customer_name?: string;
  designer_name?: string;
}

export function useCustomerRequests(customerId?: string) {
  return useQuery({
    queryKey: ['customer-requests', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch designer info
      const requests = data || [];
      const designerIds = [...new Set(requests.map(r => r.designer_id))];
      
      if (designerIds.length > 0) {
        const { data: designers } = await supabase
          .from('designers')
          .select('id, business_name, user_id')
          .in('id', designerIds);

        const userIds = designers?.map(d => d.user_id) || [];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        const designerMap = new Map(designers?.map(d => [d.id, {
          name: profileMap.get(d.user_id)?.name || d.business_name || 'مصمم'
        }]) || []);

        return requests.map(r => ({
          ...r,
          status: r.status as ServiceRequest['status'],
          designer_name: designerMap.get(r.designer_id)?.name,
        })) as ServiceRequest[];
      }

      return requests.map(r => ({
        ...r,
        status: r.status as ServiceRequest['status'],
      })) as ServiceRequest[];
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
        .select('*')
        .eq('designer_id', designerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch customer profiles
      const requests = data || [];
      const customerIds = [...new Set(requests.map(r => r.customer_id))];
      
      if (customerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name')
          .in('user_id', customerIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        return requests.map(r => ({
          ...r,
          status: r.status as ServiceRequest['status'],
          customer_name: profileMap.get(r.customer_id)?.name || 'عميل',
        })) as ServiceRequest[];
      }

      return requests.map(r => ({
        ...r,
        status: r.status as ServiceRequest['status'],
      })) as ServiceRequest[];
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
