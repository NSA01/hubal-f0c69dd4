import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Home, Building2, Store, Calendar, Wallet, MessageCircle, Star } from 'lucide-react';
import { getPropertyTypeLabel } from '@/types';
import { useCreateConversation } from '@/hooks/useChat';
import { useHasReviewed } from '@/hooks/useReviews';
import { ReviewForm } from '@/components/ReviewForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface RequestCardProps {
  request: {
    id: string;
    customerName?: string;
    designerName?: string;
    designerId?: string;
    propertyType: string;
    budget: number;
    description?: string | null;
    city: string;
    status: string;
    createdAt: string;
  };
  showActions?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onComplete?: (id: string) => void;
  variant?: 'customer' | 'designer';
}

const propertyIcons: Record<string, typeof Home> = {
  apartment: Home,
  villa: Building2,
  commercial: Store,
  شقة: Home,
  فيلا: Building2,
  تجاري: Store,
};

const statusStyles: Record<string, string> = {
  pending: 'bg-warning/15 text-warning border border-warning/20',
  accepted: 'bg-success/15 text-success border border-success/20',
  rejected: 'bg-destructive/15 text-destructive border border-destructive/20',
  completed: 'bg-primary/15 text-primary border border-primary/20',
  cancelled: 'bg-muted text-muted-foreground border border-border',
};

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  accepted: 'مقبول',
  rejected: 'مرفوض',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export function RequestCard({ request, showActions = false, onAccept, onReject, onComplete, variant = 'designer' }: RequestCardProps) {
  const PropertyIcon = propertyIcons[request.propertyType] || Home;
  const navigate = useNavigate();
  const createConversation = useCreateConversation();
  const { data: hasReviewed } = useHasReviewed(request.designerId, request.id);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  
  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('ar-SA').format(budget) + ' ر.س';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const displayName = variant === 'designer' ? request.customerName : request.designerName;

  const handleStartChat = async () => {
    if (!request.designerId) {
      toast.error('لا يمكن بدء المحادثة');
      return;
    }

    try {
      const conversation = await createConversation.mutateAsync({
        serviceRequestId: request.id,
        designerId: request.designerId,
      });
      
      const basePath = variant === 'customer' ? '/customer' : '/designer';
      navigate(`${basePath}/chat/${conversation.id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error('حدث خطأ أثناء بدء المحادثة');
    }
  };

  const showChatButton = request.status === 'accepted' && variant === 'customer';
  const showReviewButton = request.status === 'completed' && variant === 'customer' && request.designerId && !hasReviewed;

  return (
    <>
    <div className="card-premium p-5 hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <PropertyIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">{displayName || 'مستخدم'}</h4>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(request.createdAt)}</span>
            </div>
          </div>
        </div>
        <span className={`badge-status text-xs px-2.5 py-1 rounded-full ${statusStyles[request.status] || statusStyles.pending}`}>
          {statusLabels[request.status] || request.status}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm bg-secondary/50 rounded-lg p-2.5">
          <Home className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">نوع العقار</p>
            <p className="font-medium text-foreground truncate">
              {getPropertyTypeLabel(request.propertyType)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm bg-secondary/50 rounded-lg p-2.5">
          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">المدينة</p>
            <p className="font-medium text-foreground truncate">{request.city}</p>
          </div>
        </div>
      </div>

      {/* Budget */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
        <Wallet className="w-5 h-5 text-primary" />
        <span className="text-sm text-muted-foreground">الميزانية:</span>
        <span className="font-bold text-primary">{formatBudget(request.budget)}</span>
      </div>

      {/* Description */}
      {request.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {request.description}
        </p>
      )}

      {/* Actions - Pending */}
      {showActions && request.status === 'pending' && onAccept && onReject && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onAccept?.(request.id)}
            className="flex-1 btn-primary py-2.5 text-sm rounded-xl"
          >
            قبول الطلب
          </button>
          <button
            onClick={() => onReject?.(request.id)}
            className="flex-1 btn-secondary py-2.5 text-sm rounded-xl"
          >
            رفض
          </button>
        </div>
      )}

      {/* Actions - Accepted (Mark as Complete) */}
      {showActions && request.status === 'accepted' && onComplete && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onComplete?.(request.id)}
            className="flex-1 btn-primary py-2.5 text-sm rounded-xl"
          >
            إنهاء المشروع
          </button>
        </div>
      )}

      {/* Chat Button for accepted requests */}
      {showChatButton && (
        <button
          onClick={handleStartChat}
          disabled={createConversation.isPending}
          className="w-full btn-primary py-2.5 text-sm rounded-xl flex items-center justify-center gap-2 mt-2"
        >
          <MessageCircle className="w-4 h-4" />
          بدء المحادثة
        </button>
      )}

      {/* Review Button for completed requests */}
      {showReviewButton && (
        <button
          onClick={() => setShowReviewDialog(true)}
          className="w-full btn-primary py-2.5 text-sm rounded-xl flex items-center justify-center gap-2 mt-2"
        >
          <Star className="w-4 h-4" />
          تقييم المصمم
        </button>
      )}

      {/* Already reviewed indicator */}
      {request.status === 'completed' && variant === 'customer' && hasReviewed && (
        <div className="flex items-center justify-center gap-2 mt-2 py-2.5 text-sm text-muted-foreground">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          تم التقييم
        </div>
      )}
    </div>

    {/* Review Dialog */}
    <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تقييم {request.designerName || 'المصمم'}</DialogTitle>
        </DialogHeader>
        {request.designerId && (
          <ReviewForm
            designerId={request.designerId}
            serviceRequestId={request.id}
            onSuccess={() => setShowReviewDialog(false)}
          />
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
