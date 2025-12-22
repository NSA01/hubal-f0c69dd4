import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Send, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMessages, useSendMessage, useMarkAsRead } from '@/hooks/useChat';
import { supabase } from '@/integrations/supabase/client';

interface ChatRoomProps {
  conversationId: string;
  otherUserName: string;
  receiverId: string;
  backPath: string;
}

export function ChatRoom({ conversationId, otherUserName, receiverId, backPath }: ChatRoomProps) {
  const { user } = useAuthContext();
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mark messages as read when viewing
  useEffect(() => {
    if (conversationId) {
      markAsRead.mutate(conversationId);
    }
  }, [conversationId, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId) return;

    try {
      await sendMessage.mutateAsync({
        conversationId,
        receiverId,
        content: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'اليوم';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'أمس';
    }
    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, typeof messages>);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-border bg-card shadow-sm">
        <Link to={backPath} className="p-2 -mr-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowRight className="w-6 h-6 text-foreground" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">
              {otherUserName.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="font-bold text-foreground">{otherUserName}</h1>
            <p className="text-xs text-muted-foreground">متصل</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ background: 'var(--gradient-hero)' }}>
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex justify-center mb-4">
              <span className="px-3 py-1 bg-secondary rounded-full text-xs text-muted-foreground">
                {formatDate(dateMessages[0].created_at)}
              </span>
            </div>

            {/* Messages for this date */}
            <div className="space-y-2">
              {dateMessages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-card border border-border rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card safe-area-pb">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك..."
            className="flex-1 input-field py-3 rounded-full"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sendMessage.isPending}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
