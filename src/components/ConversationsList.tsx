import { Link } from 'react-router-dom';
import { MessageCircle, Loader2 } from 'lucide-react';
import { BottomNav } from '@/components/ui/BottomNav';
import { useAuthContext } from '@/contexts/AuthContext';
import { useConversations } from '@/hooks/useChat';

interface ConversationsListProps {
  basePath: string;
  userRole: 'customer' | 'designer';
}

export function ConversationsList({ basePath, userRole }: ConversationsListProps) {
  const { user } = useAuthContext();
  const { data: conversations = [], isLoading } = useConversations(user?.id, userRole);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 48) {
      return 'أمس';
    }
    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">المحادثات</h1>
        <p className="text-muted-foreground mt-1">
          تواصل مع {userRole === 'customer' ? 'المصممين' : 'العملاء'}
        </p>
      </header>

      {/* Conversations List */}
      {conversations.length > 0 ? (
        <div className="space-y-3">
          {conversations.map((conv, idx) => (
            <Link
              key={conv.id}
              to={`${basePath}/chat/${conv.id}`}
              className="block animate-slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="card-premium p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {conv.other_user_avatar ? (
                        <img
                          src={conv.other_user_avatar}
                          alt={conv.other_user_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-primary font-bold text-lg">
                          {conv.other_user_name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    {(conv.unread_count || 0) > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-[10px] text-primary-foreground font-bold">
                          {conv.unread_count}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-foreground truncate">
                        {conv.other_user_name}
                      </h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {conv.last_message || 'لا توجد رسائل'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">
            لا توجد محادثات بعد
          </h3>
          <p className="text-muted-foreground text-sm">
            {userRole === 'customer' 
              ? 'أرسل طلبًا لمصمم لبدء المحادثة'
              : 'اقبل طلبًا من عميل لبدء المحادثة'}
          </p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
