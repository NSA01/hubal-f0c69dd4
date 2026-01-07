import React, { useState } from 'react';
import { ArrowRight, Image as ImageIcon, Send, Eye, RefreshCw, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BottomNav } from '@/components/ui/BottomNav';
import { SendOfferForm } from '@/components/SendOfferForm';
import { CounterOfferForm } from '@/components/CounterOfferForm';
import { useAvailableRoomDesigns, useMyDesignOffers, useSubmitCounterOffer, RoomDesign, DesignOffer } from '@/hooks/useRoomDesigns';
import { useDesigners } from '@/hooks/useDesigners';
import { useCreateConversation } from '@/hooks/useChat';
import { useCreateNotification } from '@/hooks/useNotifications';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const DesignerOffers = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [selectedDesign, setSelectedDesign] = useState<RoomDesign | null>(null);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [showCounterOfferDialog, setShowCounterOfferDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<DesignOffer | null>(null);
  
  const { data: availableDesigns, isLoading: loadingDesigns } = useAvailableRoomDesigns();
  const { data: myOffers, isLoading: loadingOffers } = useMyDesignOffers();
  const { data: designers } = useDesigners();
  const submitCounterOffer = useSubmitCounterOffer();
  const createConversation = useCreateConversation();
  const createNotification = useCreateNotification();

  // Get current designer's ID
  const currentDesigner = designers?.find(d => d.user_id === user?.id);

  const handleViewDesign = (design: RoomDesign) => {
    setSelectedDesign(design);
  };

  const handleSendOffer = (design: RoomDesign) => {
    setSelectedDesign(design);
    setShowOfferDialog(true);
  };

  const handleOpenCounterOffer = (offer: DesignOffer) => {
    setSelectedOffer(offer);
    setShowCounterOfferDialog(true);
  };

  const handleSubmitCounterOffer = async (data: { price: number; estimatedDays?: number; message?: string }) => {
    if (!selectedOffer) return;

    try {
      await submitCounterOffer.mutateAsync({
        offerId: selectedOffer.id,
        counterPrice: data.price,
        counterMessage: data.message,
        counterEstimatedDays: data.estimatedDays,
      });

      // Notify the customer about the counter offer
      if (selectedOffer.room_design?.user_id) {
        await createNotification.mutateAsync({
          userId: selectedOffer.room_design.user_id,
          type: 'counter_offer',
          title: 'عرض مضاد جديد',
          message: `أرسل المصمم عرضاً مضاداً بقيمة ${data.price.toLocaleString()} ر.س`,
          data: { offerId: selectedOffer.id, roomDesignId: selectedOffer.room_design_id },
        });
      }

      toast({
        title: 'تم إرسال العرض المضاد',
        description: 'سيتم إشعار العميل بالعرض الجديد',
      });

      setShowCounterOfferDialog(false);
      setSelectedOffer(null);
    } catch (error) {
      throw error;
    }
  };

  const handleStartChat = async (offer: DesignOffer) => {
    try {
      if (!offer.room_design?.user_id || !currentDesigner) return;
      
      const conversation = await createConversation.mutateAsync({
        designerId: currentDesigner.id,
        customerId: offer.room_design.user_id,
      });
      navigate(`/designer/chat/${conversation.id}`);
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'فشل في فتح المحادثة',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/designer')}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold mr-2">طلبات التصميم</h1>
        </div>
      </header>

      <main className="container px-4 py-6">
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              طلبات متاحة
            </TabsTrigger>
            <TabsTrigger value="my-offers" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              عروضي
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            {loadingDesigns ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : availableDesigns?.length ? (
              <div className="space-y-4">
                {availableDesigns.map((design) => (
                  <Card key={design.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4 mb-4">
                        <img
                          src={design.original_image_url}
                          alt="Room"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-2">متطلبات العميل:</p>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg line-clamp-4">
                            {design.prompt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(design.created_at), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </span>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDesign(design)}
                          >
                            <Eye className="h-4 w-4 ml-1" />
                            عرض
                          </Button>
                          {currentDesigner && (
                            <Button
                              size="sm"
                              onClick={() => handleSendOffer(design)}
                            >
                              <Send className="h-4 w-4 ml-1" />
                              إرسال عرض
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">لا توجد طلبات تصميم متاحة حالياً</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-offers">
            {loadingOffers ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : myOffers?.length ? (
              <div className="space-y-4">
                {myOffers.map((offer) => (
                  <Card key={offer.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="grid grid-cols-2 gap-1 w-24">
                          <img
                            src={offer.room_design?.original_image_url}
                            alt="Original"
                            className="w-full h-12 object-cover rounded"
                          />
                          {offer.room_design?.generated_image_url && (
                            <img
                              src={offer.room_design.generated_image_url}
                              alt="Generated"
                              className="w-full h-12 object-cover rounded"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-bold ${offer.status === 'counter_offer' ? 'line-through text-muted-foreground' : 'text-primary'}`}>
                              {offer.price.toLocaleString()} ر.س
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              offer.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              offer.status === 'counter_offer' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {offer.status === 'accepted' ? 'مقبول' :
                               offer.status === 'rejected' ? 'مرفوض' :
                               offer.status === 'counter_offer' ? 'عرض مضاد' : 'قيد الانتظار'}
                            </span>
                          </div>

                          {/* Counter offer details */}
                          {offer.status === 'counter_offer' && offer.counter_price && (
                            <div className="bg-blue-50 p-2 rounded-lg mb-2">
                              <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
                                <RefreshCw className="h-3 w-3" />
                                <span>العرض المضاد</span>
                              </div>
                              <span className="font-bold text-primary">
                                {offer.counter_price.toLocaleString()} ر.س
                              </span>
                              {offer.counter_estimated_days && (
                                <span className="text-xs text-muted-foreground mr-2">
                                  ({offer.counter_estimated_days} يوم)
                                </span>
                              )}
                            </div>
                          )}

                          {offer.message && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {offer.message}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(offer.counter_created_at || offer.created_at), {
                                addSuffix: true,
                                locale: ar,
                              })}
                            </p>
                            
                            <div className="flex gap-2">
                              {/* Chat button for pending/counter_offer status */}
                              {(offer.status === 'pending' || offer.status === 'counter_offer' || offer.status === 'accepted') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleStartChat(offer as DesignOffer)}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {/* Counter offer button for pending offers */}
                              {offer.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenCounterOffer(offer as DesignOffer)}
                                >
                                  <RefreshCw className="h-4 w-4 ml-1" />
                                  عرض مضاد
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Send className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">لم ترسل أي عروض بعد</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Design View Dialog */}
      <Dialog open={!!selectedDesign && !showOfferDialog} onOpenChange={() => setSelectedDesign(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل طلب التصميم</DialogTitle>
          </DialogHeader>
          {selectedDesign && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">صورة الغرفة</p>
                <img
                  src={selectedDesign.original_image_url}
                  alt="Room"
                  className="w-full rounded-lg"
                />
              </div>
              <div>
                <p className="font-medium mb-2">متطلبات العميل:</p>
                <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                  {selectedDesign.prompt}
                </p>
              </div>
              {currentDesigner && (
                <Button
                  className="w-full"
                  onClick={() => setShowOfferDialog(true)}
                >
                  <Send className="h-4 w-4 ml-2" />
                  إرسال عرض
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Offer Dialog */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إرسال عرض للعميل</DialogTitle>
          </DialogHeader>
          {selectedDesign && currentDesigner && (
            <SendOfferForm
              roomDesignId={selectedDesign.id}
              designerId={currentDesigner.id}
              onSuccess={() => {
                setShowOfferDialog(false);
                setSelectedDesign(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Counter Offer Dialog */}
      <Dialog open={showCounterOfferDialog} onOpenChange={setShowCounterOfferDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إرسال عرض مضاد</DialogTitle>
          </DialogHeader>
          {selectedOffer && (
            <CounterOfferForm
              originalPrice={selectedOffer.price}
              originalDays={selectedOffer.estimated_days}
              onSubmit={handleSubmitCounterOffer}
              isLoading={submitCounterOffer.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default DesignerOffers;
