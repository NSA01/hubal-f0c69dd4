import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Clock, Star, MessageSquare, MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDesignOffers, useUpdateOfferStatus, useAcceptCounterOffer, DesignOffer } from '@/hooks/useRoomDesigns';
import { useCreateConversation } from '@/hooks/useChat';
import { useCreateNotification } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface DesignOffersListProps {
  roomDesignId: string;
}

export const DesignOffersList: React.FC<DesignOffersListProps> = ({ roomDesignId }) => {
  const navigate = useNavigate();
  const { data: offers, isLoading } = useDesignOffers(roomDesignId);
  const updateStatus = useUpdateOfferStatus();
  const acceptCounterOffer = useAcceptCounterOffer();
  const createConversation = useCreateConversation();
  const createNotification = useCreateNotification();
  const { toast } = useToast();

  const handleAccept = async (offer: DesignOffer) => {
    try {
      await updateStatus.mutateAsync({ offerId: offer.id, status: 'accepted' });
      
      // Create conversation and navigate to chat
      const conversation = await createConversation.mutateAsync({
        designerId: offer.designer_id,
      });

      // Notify designer
      if (offer.designer?.user_id) {
        await createNotification.mutateAsync({
          userId: offer.designer.user_id,
          type: 'offer_accepted',
          title: 'تم قبول عرضك',
          message: 'قبل العميل عرضك للتصميم. يمكنك الآن بدء المحادثة.',
          data: { offerId: offer.id, roomDesignId: offer.room_design_id },
        });
      }
      
      toast({
        title: 'تم قبول العرض',
        description: 'جاري فتح المحادثة مع المصمم',
      });
      
      navigate(`/customer/chat/${conversation.id}`);
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'فشل في قبول العرض',
        variant: 'destructive',
      });
    }
  };

  const handleAcceptCounterOffer = async (offer: DesignOffer) => {
    try {
      await acceptCounterOffer.mutateAsync(offer.id);
      
      // Create conversation and navigate to chat
      const conversation = await createConversation.mutateAsync({
        designerId: offer.designer_id,
      });

      // Notify designer
      if (offer.designer?.user_id) {
        await createNotification.mutateAsync({
          userId: offer.designer.user_id,
          type: 'counter_offer_accepted',
          title: 'تم قبول العرض المضاد',
          message: `قبل العميل عرضك المضاد بقيمة ${offer.counter_price?.toLocaleString()} ر.س`,
          data: { offerId: offer.id, roomDesignId: offer.room_design_id },
        });
      }
      
      toast({
        title: 'تم قبول العرض المضاد',
        description: 'جاري فتح المحادثة مع المصمم',
      });
      
      navigate(`/customer/chat/${conversation.id}`);
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'فشل في قبول العرض المضاد',
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

  const handleStartChat = async (offer: DesignOffer) => {
    try {
      const conversation = await createConversation.mutateAsync({
        designerId: offer.designer_id,
      });
      navigate(`/customer/chat/${conversation.id}`);
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'فشل في فتح المحادثة',
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
          onAccept={() => handleAccept(offer)}
          onAcceptCounterOffer={() => handleAcceptCounterOffer(offer)}
          onReject={() => handleReject(offer.id)}
          onStartChat={() => handleStartChat(offer)}
          isUpdating={updateStatus.isPending || createConversation.isPending || acceptCounterOffer.isPending}
        />
      ))}
    </div>
  );
};

interface OfferCardProps {
  offer: DesignOffer;
  onAccept: () => void;
  onAcceptCounterOffer: () => void;
  onReject: () => void;
  onStartChat: () => void;
  isUpdating: boolean;
}

const OfferCard: React.FC<OfferCardProps> = ({ 
  offer, 
  onAccept, 
  onAcceptCounterOffer, 
  onReject, 
  onStartChat, 
  isUpdating 
}) => {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    counter_offer: 'bg-blue-100 text-blue-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    accepted: 'مقبول',
    rejected: 'مرفوض',
    counter_offer: 'عرض مضاد',
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
                      {Number(offer.designer.rating).toFixed(1)}
                    </span>
                  )}
                  {offer.designer?.review_count && (
                    <span>({offer.designer.review_count} تقييم)</span>
                  )}
                </div>
              </div>
              <Badge className={statusColors[offer.status] || statusColors.pending}>
                {statusLabels[offer.status] || offer.status}
              </Badge>
            </div>

            {/* Original Offer */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-sm text-muted-foreground">السعر</span>
                <p className={`font-bold ${offer.status === 'counter_offer' ? 'line-through text-muted-foreground' : 'text-primary'}`}>
                  {offer.price.toLocaleString()} ر.س
                </p>
              </div>
              {offer.estimated_days && (
                <div>
                  <span className="text-sm text-muted-foreground">مدة التنفيذ</span>
                  <p className={`font-semibold flex items-center gap-1 ${offer.status === 'counter_offer' ? 'line-through text-muted-foreground' : ''}`}>
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

            {/* Counter Offer Section */}
            {offer.status === 'counter_offer' && offer.counter_price && (
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600">العرض المضاد من المصمم</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-muted-foreground">السعر الجديد</span>
                    <p className="font-bold text-primary">{offer.counter_price.toLocaleString()} ر.س</p>
                  </div>
                  {offer.counter_estimated_days && (
                    <div>
                      <span className="text-sm text-muted-foreground">المدة الجديدة</span>
                      <p className="font-semibold flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {offer.counter_estimated_days} يوم
                      </p>
                    </div>
                  )}
                </div>
                {offer.counter_message && (
                  <p className="text-sm text-foreground bg-blue-50 p-3 rounded-lg mb-3">
                    {offer.counter_message}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(offer.counter_created_at || offer.created_at), { 
                  addSuffix: true, 
                  locale: ar 
                })}
              </span>

              {offer.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onStartChat}
                    disabled={isUpdating}
                  >
                    <MessageCircle className="h-4 w-4 ml-1" />
                    محادثة
                  </Button>
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

              {offer.status === 'counter_offer' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onStartChat}
                    disabled={isUpdating}
                  >
                    <MessageCircle className="h-4 w-4 ml-1" />
                    محادثة
                  </Button>
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
                    onClick={onAcceptCounterOffer}
                    disabled={isUpdating}
                  >
                    <Check className="h-4 w-4 ml-1" />
                    قبول العرض المضاد
                  </Button>
                </div>
              )}

              {offer.status === 'accepted' && (
                <Button
                  size="sm"
                  onClick={onStartChat}
                  disabled={isUpdating}
                >
                  <MessageCircle className="h-4 w-4 ml-1" />
                  محادثة
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
