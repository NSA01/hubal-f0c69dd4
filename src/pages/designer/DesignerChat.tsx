import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ChatRoom } from '@/components/ChatRoom';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function DesignerChat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [chatData, setChatData] = useState<{
    otherUserName: string;
    receiverId: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadChatData() {
      if (!conversationId || !user) return;

      try {
        // Get conversation
        const { data: conv, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single();

        if (convError || !conv) {
          navigate('/designer/messages');
          return;
        }

        // Get customer's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', conv.customer_id)
          .single();

        setChatData({
          otherUserName: profile?.name || 'عميل',
          receiverId: conv.customer_id,
        });
      } catch (error) {
        console.error('Error loading chat:', error);
        navigate('/designer/messages');
      } finally {
        setIsLoading(false);
      }
    }

    loadChatData();
  }, [conversationId, user, navigate]);

  if (isLoading || !chatData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <ChatRoom
      conversationId={conversationId!}
      otherUserName={chatData.otherUserName}
      receiverId={chatData.receiverId}
      backPath="/designer/messages"
    />
  );
}
