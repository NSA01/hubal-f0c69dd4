import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BottomNav } from '@/components/ui/BottomNav';
import { RequestCard } from '@/components/RequestCard';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMyDesignerProfile } from '@/hooks/useDesigners';
import { useDesignerRequests, useUpdateRequestStatus } from '@/hooks/useServiceRequests';
import { useAvailableRoomDesigns, useMyDesignOffers } from '@/hooks/useRoomDesigns';
import { useCreateConversation } from '@/hooks/useChat';
import { SendOfferForm } from '@/components/SendOfferForm';
import { Loader2, Image, Calendar, Send, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function DesignerRequests() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { data: designer, isLoading: loadingDesigner } = useMyDesignerProfile(user?.id);
  const { data: serviceRequests = [], isLoading: loadingRequests } = useDesignerRequests(designer?.id);
  const { data: roomDesigns = [], isLoading: loadingDesigns } = useAvailableRoomDesigns();
  const { data: myOffers = [], isLoading: loadingOffers } = useMyDesignOffers();
  const updateStatus = useUpdateRequestStatus();
  const createConversation = useCreateConversation();
  
  const [selectedDesign, setSelectedDesign] = useState<typeof roomDesigns[0] | null>(null);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [serviceFilter, setServiceFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');

  // Filter out room designs where this designer has already sent an offer
  const myOfferRoomIds = new Set(myOffers.map((offer: any) => offer.room_design_id));
  const availableDesigns = roomDesigns.filter((design) => !myOfferRoomIds.has(design.id));

  // Filter service requests
  const filteredServiceRequests = serviceRequests.filter((r) => {
    if (serviceFilter === 'all') return true;
    return r.status === serviceFilter;
  });

  const isLoading = loadingDesigner || loadingRequests || loadingDesigns || loadingOffers;

  const handleAccept = async (id: string) => {
    try {
      const request = serviceRequests.find(r => r.id === id);
      await updateStatus.mutateAsync({ id, status: 'accepted' });
      
      // Create conversation and navigate to chat
      if (request && designer) {
        const conversation = await createConversation.mutateAsync({
          serviceRequestId: id,
          designerId: designer.id,
          customerId: request.customer_id,
        });
        toast.success('تم قبول الطلب');
        navigate(`/designer/chat/${conversation.id}`);
      }
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'rejected' });
      toast.info('تم رفض الطلب');
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleStartChat = async (customerId: string) => {
    try {
      if (!designer) return;
      const conversation = await createConversation.mutateAsync({
        designerId: designer.id,
        customerId: customerId,
      });
      navigate(`/designer/chat/${conversation.id}`);
    } catch (error) {
      toast.error('فشل في فتح المحادثة');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'completed' });
      toast.success('تم إنهاء المشروع بنجاح');
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleOpenOffer = (design: typeof roomDesigns[0]) => {
    setSelectedDesign(design);
    setShowOfferDialog(true);
  };

  const handleOfferSuccess = () => {
    setShowOfferDialog(false);
    setSelectedDesign(null);
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
        <h1 className="text-2xl font-bold text-foreground">الطلبات</h1>
        <p className="text-muted-foreground mt-1">
          إدارة طلبات التصميم الواردة
        </p>
      </header>

      {/* Main Tabs */}
      <Tabs defaultValue="designs" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="designs" className="flex-1">
            طلبات تصميم
            {availableDesigns.length > 0 && (
              <span className="mr-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {availableDesigns.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="direct" className="flex-1">
            طلبات واردة
            {serviceRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="mr-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {serviceRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Room Design Requests Tab */}
        <TabsContent value="designs" className="mt-0">
          {availableDesigns.length > 0 ? (
            <div className="space-y-4">
              {availableDesigns.map((design, idx) => (
                <Card
                  key={design.id}
                  className="overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <CardContent className="p-0">
                    <div className="flex gap-4">
                      {/* Image Preview */}
                      <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                        <img
                          src={design.original_image_url}
                          alt="صورة الغرفة"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 py-3 pr-0 pl-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {format(new Date(design.created_at), 'dd MMM yyyy', { locale: ar })}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-foreground line-clamp-2 mb-3">
                          {design.prompt}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartChat(design.user_id)}
                            className="gap-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            محادثة
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleOpenOffer(design)}
                            className="gap-2"
                          >
                            <Send className="w-4 h-4" />
                            إرسال عرض
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Image className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                لا توجد طلبات تصميم جديدة حالياً
              </p>
            </div>
          )}
        </TabsContent>

        {/* Direct Service Requests Tab */}
        <TabsContent value="direct" className="mt-0">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'pending', label: 'قيد الانتظار' },
              { key: 'accepted', label: 'جارية' },
              { key: 'completed', label: 'مكتملة' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setServiceFilter(tab.key as typeof serviceFilter)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  serviceFilter === tab.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredServiceRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredServiceRequests.map((request, idx) => (
                <div
                  key={request.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <RequestCard
                    request={{
                      id: request.id,
                      customerName: request.customer_name || 'عميل',
                      city: request.city,
                      propertyType: request.property_type,
                      budget: request.budget,
                      description: request.description || '',
                      status: request.status,
                      createdAt: request.created_at,
                    }}
                    showActions={request.status === 'pending' || request.status === 'accepted'}
                    onAccept={request.status === 'pending' ? handleAccept : undefined}
                    onReject={request.status === 'pending' ? handleReject : undefined}
                    onComplete={request.status === 'accepted' ? handleComplete : undefined}
                    variant="designer"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <p className="text-muted-foreground">
                لا توجد طلبات في هذه الفئة
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Send Offer Dialog */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إرسال عرض سعر</DialogTitle>
          </DialogHeader>
          
          {selectedDesign && (
            <div className="space-y-4">
              {/* Design Preview */}
              <div className="rounded-lg overflow-hidden">
                <img
                  src={selectedDesign.original_image_url}
                  alt="صورة الغرفة"
                  className="w-full h-48 object-cover"
                />
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-foreground">{selectedDesign.prompt}</p>
              </div>
              
              {designer && (
                <SendOfferForm
                  roomDesignId={selectedDesign.id}
                  designerId={designer.id}
                  onSuccess={handleOfferSuccess}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
