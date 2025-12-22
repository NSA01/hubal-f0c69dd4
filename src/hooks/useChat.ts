import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSchema } from '@/lib/validations';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  service_request_id: string | null;
  customer_id: string;
  designer_id: string;
  last_message_at: string;
  created_at: string;
  other_user_name?: string;
  other_user_avatar?: string;
  last_message?: string;
  unread_count?: number;
}

export function useConversations(userId?: string, userRole?: 'customer' | 'designer') {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const conversations = data || [];
      
      // Fetch other user info and last message for each conversation
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          // Get other user's info
          const otherUserId = userRole === 'customer' 
            ? await getDesignerUserId(conv.designer_id)
            : conv.customer_id;

          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('user_id', otherUserId)
            .single();

          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('receiver_id', userId)
            .eq('is_read', false);

          return {
            ...conv,
            other_user_name: profile?.name || 'مستخدم',
            other_user_avatar: profile?.avatar_url,
            last_message: lastMsg?.content,
            unread_count: count || 0,
          } as Conversation;
        })
      );

      return enrichedConversations;
    },
    enabled: !!userId,
  });
}

async function getDesignerUserId(designerId: string): Promise<string> {
  const { data } = await supabase
    .from('designers')
    .select('user_id')
    .eq('id', designerId)
    .single();
  return data?.user_id || '';
}

export function useMessages(conversationId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return query;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: {
      conversationId: string;
      receiverId?: string; // Keep for backwards compatibility but not used
      content: string;
    }) => {
      // Validate content with Zod
      const trimmedContent = content.trim();
      if (trimmedContent.length < 1 || trimmedContent.length > 2000) {
        throw new Error('Message content must be between 1 and 2000 characters');
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Use secure RPC function that validates conversation participation
      const { data, error } = await supabase.rpc('send_message', {
        p_conversation_id: conversationId,
        p_content: trimmedContent,
      });

      if (error) throw error;

      return { id: data };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceRequestId,
      designerId,
      customerId,
    }: {
      serviceRequestId?: string;
      designerId: string;
      customerId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Determine customer_id - either passed in or current user
      const customerIdToUse = customerId || user.id;

      // Check if conversation already exists for this designer and customer
      let query = supabase
        .from('conversations')
        .select('*')
        .eq('designer_id', designerId)
        .eq('customer_id', customerIdToUse);

      if (serviceRequestId) {
        query = query.eq('service_request_id', serviceRequestId);
      }

      const { data: existing } = await query.maybeSingle();

      if (existing) return existing;

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          service_request_id: serviceRequestId || null,
          customer_id: customerIdToUse,
          designer_id: designerId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
