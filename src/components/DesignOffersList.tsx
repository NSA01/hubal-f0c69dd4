import React from 'react';
import { Check, X, Clock, Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useDesignOffers, useUpdateOfferStatus, DesignOffer } from '@/hooks/useRoomDesigns';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface DesignOffersListProps {
  roomDesignId: string;
}

export const DesignOffersList: React.FC<DesignOffersListProps> = ({ roomDesignId }) => {
  const { data: offers, isLoading } = useDesignOffers(roomDesignId);
  const updateStatus = useUpdateOfferStatus();
  const { toast } = useToast();

  const handleAccept = async (offerId: string) => {
    try {
      await updateStatus.mutateAsync({ offerId, status: 'accepted' });
      toast({
        title: 'تم قبول العرض',
        description: 'سيتم التواصل معك من قبل المصمم',
      });
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'فشل في قبول العرض',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (offerId: string) => {
    try {
      await updateStatus.mutateAsync({ offerId, status: 'rejected' });
      toast({
        title: 'تم رفض العرض',
      });
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'فشل في رفض العرض',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!offers?.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">لا توجد عروض بعد</p>
          <p className="text-sm text-muted-foreground mt-1">
            سيتم إشعارك عند استلام عروض من المصممين
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">العروض المستلمة ({offers.length})</h3>
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          onAccept={() => handleAccept(offer.id)}
          onReject={() => handleReject(offer.id)}
          isUpdating={updateStatus.isPending}
        />
      ))}
    </div>
  );
};

interface OfferCardProps {
  offer: DesignOffer;
  onAccept: () => void;
  onReject: () => void;
  isUpdating: boolean;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, onAccept, onReject, isUpdating }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    pending: 'قيد الانتظار',
    accepted: 'مقبول',
    rejected: 'مرفوض',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={offer.designer?.profile?.avatar_url || undefined} />
            <AvatarFallback>
              {offer.designer?.profile?.name?.charAt(0) || 'م'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold">
                  {offer.designer?.business_name || offer.designer?.profile?.name || 'مصمم'}
                </h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {offer.designer?.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {offer.designer.rating.toFixed(1)}
                    </span>
                  )}
                  {offer.designer?.review_count && (
                    <span>({offer.designer.review_count} تقييم)</span>
                  )}
                </div>
              </div>
              <Badge className={statusColors[offer.status]}>
                {statusLabels[offer.status]}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-sm text-muted-foreground">السعر</span>
                <p className="font-bold text-primary">{offer.price.toLocaleString()} ر.س</p>
              </div>
              {offer.estimated_days && (
                <div>
                  <span className="text-sm text-muted-foreground">مدة التنفيذ</span>
                  <p className="font-semibold flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {offer.estimated_days} يوم
                  </p>
                </div>
              )}
            </div>

            {offer.message && (
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg mb-3">
                {offer.message}
              </p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(offer.created_at), { 
                  addSuffix: true, 
                  locale: ar 
                })}
              </span>

              {offer.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onReject}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4 ml-1" />
                    رفض
                  </Button>
                  <Button
                    size="sm"
                    onClick={onAccept}
                    disabled={isUpdating}
                  >
                    <Check className="h-4 w-4 ml-1" />
                    قبول
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
