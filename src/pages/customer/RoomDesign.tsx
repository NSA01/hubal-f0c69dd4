import React, { useState } from 'react';
import { ArrowRight, Image as ImageIcon, Send, Sparkles, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DesignRequestForm } from '@/components/DesignRequestForm';
import { DesignOffersList } from '@/components/DesignOffersList';
import { BottomNav } from '@/components/ui/BottomNav';
import { useRoomDesigns } from '@/hooks/useRoomDesigns';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'open':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">مفتوح للعروض</Badge>;
    case 'accepted':
      return <Badge variant="secondary" className="bg-green-100 text-green-700">تم قبول عرض</Badge>;
    case 'in_progress':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">قيد التنفيذ</Badge>;
    case 'completed':
      return <Badge variant="secondary" className="bg-green-100 text-green-700">مكتمل</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const RoomDesign = () => {
  const navigate = useNavigate();
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const { data: designs, isLoading } = useRoomDesigns();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/customer')}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold mr-2">طلب تصميم</h1>
        </div>
      </header>

      <main className="container px-4 py-6">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              طلب جديد
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              طلباتي
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">أرسل طلب تصميم</h2>
                <p className="text-muted-foreground">
                  شارك صورة غرفتك ووصف ما تريده، وسيقوم المصممون بإرسال عروضهم لك
                </p>
              </div>

              {/* Coming Soon - AI Feature */}
              <Card className="border-dashed border-primary/30 bg-primary/5">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-primary">قريباً</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    التصميم بالذكاء الاصطناعي - احصل على تصميم مقترح فورياً
                  </p>
                </CardContent>
              </Card>
              
              <DesignRequestForm
                onRequestCreated={(id) => setSelectedDesignId(id)}
              />

              {selectedDesignId && (
                <div className="mt-8">
                  <DesignOffersList roomDesignId={selectedDesignId} />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : designs?.length ? (
              <div className="space-y-4">
                {designs.map((design) => (
                  <Card
                    key={design.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedDesignId === design.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedDesignId(design.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={design.original_image_url}
                          alt="Room"
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium line-clamp-2 mb-2">{design.prompt}</p>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            {getStatusBadge(design.status)}
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(design.created_at), {
                                addSuffix: true,
                                locale: ar,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Show offers for selected design */}
                {selectedDesignId && (
                  <div className="mt-6 pt-6 border-t">
                    <DesignOffersList roomDesignId={selectedDesignId} />
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">لم تقم بإرسال أي طلبات بعد</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      const tab = document.querySelector('[value="create"]');
                      if (tab) (tab as HTMLButtonElement).click();
                    }}
                  >
                    أرسل طلب تصميم جديد
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default RoomDesign;
