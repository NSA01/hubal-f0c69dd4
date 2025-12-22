import { useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMyDesignerProfile } from '@/hooks/useDesigners';
import { useAvailableRoomDesigns, useMyDesignOffers } from '@/hooks/useRoomDesigns';
import { SendOfferForm } from '@/components/SendOfferForm';
import { Loader2, Image, Calendar, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function DesignerRequests() {
  const { user } = useAuthContext();
  const { data: designer, isLoading: loadingDesigner } = useMyDesignerProfile(user?.id);
  const { data: roomDesigns = [], isLoading: loadingDesigns } = useAvailableRoomDesigns();
  const { data: myOffers = [], isLoading: loadingOffers } = useMyDesignOffers();
  
  const [selectedDesign, setSelectedDesign] = useState<typeof roomDesigns[0] | null>(null);
  const [showOfferDialog, setShowOfferDialog] = useState(false);

  // Filter out designs where this designer has already sent an offer
  const myOfferRoomIds = new Set(myOffers.map((offer: any) => offer.room_design_id));
  const availableDesigns = roomDesigns.filter((design) => !myOfferRoomIds.has(design.id));

  const isLoading = loadingDesigner || loadingDesigns || loadingOffers;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const handleOpenOffer = (design: typeof roomDesigns[0]) => {
    setSelectedDesign(design);
    setShowOfferDialog(true);
  };

  const handleOfferSuccess = () => {
    setShowOfferDialog(false);
    setSelectedDesign(null);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">طلبات التصميم</h1>
        <p className="text-muted-foreground mt-1">
          تصفح طلبات العملاء وأرسل عروضك
        </p>
      </header>

      {/* Requests List */}
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
                    
                    <Button
                      size="sm"
                      onClick={() => handleOpenOffer(design)}
                      className="gap-2"
                    >
                      <Send className="w-4 h-4" />
                      إرسال عرض سعر
                    </Button>
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
