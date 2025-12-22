import React, { useState } from 'react';
import { ArrowRight, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoomDesignGenerator } from '@/components/RoomDesignGenerator';
import { DesignOffersList } from '@/components/DesignOffersList';
import { BottomNav } from '@/components/ui/BottomNav';
import { useRoomDesigns } from '@/hooks/useRoomDesigns';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

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
          <h1 className="text-lg font-bold mr-2">تصميم الغرفة بالذكاء الاصطناعي</h1>
        </div>
      </header>

      <main className="container px-4 py-6">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              تصميم جديد
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              تصاميمي
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">صمم غرفتك بالذكاء الاصطناعي</h2>
                <p className="text-muted-foreground">
                  التقط صورة لغرفتك واحصل على تصميم مقترح، ثم استقبل عروض من المصممين
                </p>
              </div>
              
              <RoomDesignGenerator
                onDesignGenerated={(id) => setSelectedDesignId(id)}
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
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedDesignId(design.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="grid grid-cols-2 gap-2 w-32">
                          <img
                            src={design.original_image_url}
                            alt="Original"
                            className="w-full h-16 object-cover rounded"
                          />
                          {design.generated_image_url ? (
                            <img
                              src={design.generated_image_url}
                              alt="Generated"
                              className="w-full h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-16 bg-muted rounded flex items-center justify-center">
                              <Sparkles className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium line-clamp-2 mb-1">{design.prompt}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              design.status === 'completed' ? 'bg-green-100 text-green-700' :
                              design.status === 'generating' ? 'bg-yellow-100 text-yellow-700' :
                              design.status === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {design.status === 'completed' ? 'مكتمل' :
                               design.status === 'generating' ? 'جاري الإنشاء' :
                               design.status === 'failed' ? 'فشل' : 'في الانتظار'}
                            </span>
                            <span>
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
                  <p className="text-muted-foreground">لم تقم بإنشاء أي تصاميم بعد</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      const tab = document.querySelector('[value="create"]');
                      if (tab) (tab as HTMLButtonElement).click();
                    }}
                  >
                    ابدأ بإنشاء تصميم جديد
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
