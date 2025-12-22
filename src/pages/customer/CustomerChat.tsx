import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ChatRoom } from '@/components/ChatRoom';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function CustomerChat() {
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
          navigate('/customer/messages');
          return;
        }

        // Get designer's user_id
        const { data: designer } = await supabase
          .from('designers')
          .select('user_id')
          .eq('id', conv.designer_id)
          .single();

        if (!designer) {
          navigate('/customer/messages');
          return;
        }

        // Get designer's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', designer.user_id)
          .single();

        setChatData({
          otherUserName: profile?.name || 'مصمم',
          receiverId: designer.user_id,
        });
      } catch (error) {
        console.error('Error loading chat:', error);
        navigate('/customer/messages');
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
      backPath="/customer/messages"
    />
  );
}
