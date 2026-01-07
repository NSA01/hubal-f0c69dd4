import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface RoomDesign {
  id: string;
  user_id: string;
  original_image_url: string;
  generated_image_url: string | null;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'open' | 'accepted' | 'in_progress';
  created_at: string;
  updated_at: string;
}

export interface DesignOffer {
  id: string;
  room_design_id: string;
  designer_id: string;
  price: number;
  message: string | null;
  estimated_days: number | null;
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offer';
  created_at: string;
  updated_at: string;
  counter_price: number | null;
  counter_message: string | null;
  counter_estimated_days: number | null;
  counter_created_at: string | null;
  designer?: {
    id: string;
    business_name: string | null;
    rating: number | null;
    review_count: number | null;
    user_id: string;
    profile?: {
      name: string;
      avatar_url: string | null;
    };
  };
  room_design?: RoomDesign;
}

export function useRoomDesigns() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ['room-designs', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('room_designs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RoomDesign[];
    },
    enabled: !!user,
  });
}

export function useCreateRoomDesign() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: async ({ imageUrl, prompt }: { imageUrl: string; prompt: string }) => {
      if (!user) throw new Error('Not authenticated');

      // Create room design record
      const { data: roomDesign, error: insertError } = await supabase
        .from('room_designs')
        .insert({
          user_id: user.id,
          original_image_url: imageUrl,
          prompt,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Call edge function to generate design
      const { data, error } = await supabase.functions.invoke('generate-room-design', {
        body: { imageUrl, prompt, roomDesignId: roomDesign.id },
      });

      if (error) throw error;

      return { ...roomDesign, generated_image_url: data.generatedImageUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-designs'] });
    },
  });
}

export function useDesignOffers(roomDesignId?: string) {
  return useQuery({
    queryKey: ['design-offers', roomDesignId],
    queryFn: async () => {
      if (!roomDesignId) return [];

      const { data, error } = await supabase
        .from('design_offers')
        .select(`
          *,
          designer:designers(
            id,
            business_name,
            rating,
            review_count,
            user_id
          )
        `)
        .eq('room_design_id', roomDesignId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for each designer
      const offersWithProfiles = await Promise.all(
        (data || []).map(async (offer) => {
          if (offer.designer?.user_id) {
            const { data: profile } = await supabase
              .from('public_profiles')
              .select('name, avatar_url')
              .eq('user_id', offer.designer.user_id)
              .single();
            
            return {
              ...offer,
              designer: {
                ...offer.designer,
                profile,
              },
            };
          }
          return offer;
        })
      );

      return offersWithProfiles as DesignOffer[];
    },
    enabled: !!roomDesignId,
  });
}

export function useAvailableRoomDesigns() {
  return useQuery({
    queryKey: ['available-room-designs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_designs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RoomDesign[];
    },
  });
}

export function useCreateDesignOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomDesignId,
      designerId,
      price,
      message,
      estimatedDays,
    }: {
      roomDesignId: string;
      designerId: string;
      price: number;
      message?: string;
      estimatedDays?: number;
    }) => {
      const { data, error } = await supabase
        .from('design_offers')
        .insert({
          room_design_id: roomDesignId,
          designer_id: designerId,
          price,
          message,
          estimated_days: estimatedDays,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['design-offers', variables.roomDesignId] });
      queryClient.invalidateQueries({ queryKey: ['my-design-offers'] });
    },
  });
}

export function useUpdateOfferStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      offerId,
      status,
    }: {
      offerId: string;
      status: 'accepted' | 'rejected' | 'counter_offer';
    }) => {
      const { data, error } = await supabase
        .from('design_offers')
        .update({ status })
        .eq('id', offerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design-offers'] });
      queryClient.invalidateQueries({ queryKey: ['my-design-offers'] });
    },
  });
}

export function useSubmitCounterOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      offerId,
      counterPrice,
      counterMessage,
      counterEstimatedDays,
    }: {
      offerId: string;
      counterPrice: number;
      counterMessage?: string;
      counterEstimatedDays?: number;
    }) => {
      const { data, error } = await supabase
        .from('design_offers')
        .update({
          status: 'counter_offer',
          counter_price: counterPrice,
          counter_message: counterMessage || null,
          counter_estimated_days: counterEstimatedDays || null,
          counter_created_at: new Date().toISOString(),
        })
        .eq('id', offerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design-offers'] });
      queryClient.invalidateQueries({ queryKey: ['my-design-offers'] });
    },
  });
}

export function useAcceptCounterOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId: string) => {
      // Get the offer to update price with counter price
      const { data: offer, error: fetchError } = await supabase
        .from('design_offers')
        .select('counter_price, counter_estimated_days')
        .eq('id', offerId)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('design_offers')
        .update({
          status: 'accepted',
          price: offer.counter_price || undefined,
          estimated_days: offer.counter_estimated_days || undefined,
        })
        .eq('id', offerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design-offers'] });
      queryClient.invalidateQueries({ queryKey: ['my-design-offers'] });
    },
  });
}

export function useMyDesignOffers() {
  return useQuery({
    queryKey: ['my-design-offers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get designer id for current user
      const { data: designer } = await supabase
        .from('designers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!designer) return [];

      const { data, error } = await supabase
        .from('design_offers')
        .select(`
          *,
          room_design:room_designs(*)
        `)
        .eq('designer_id', designer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
