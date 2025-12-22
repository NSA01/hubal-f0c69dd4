import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useCreateDesignOffer } from '@/hooks/useRoomDesigns';
import { useToast } from '@/hooks/use-toast';

interface SendOfferFormProps {
  roomDesignId: string;
  designerId: string;
  onSuccess?: () => void;
}

export const SendOfferForm: React.FC<SendOfferFormProps> = ({
  roomDesignId,
  designerId,
  onSuccess,
}) => {
  const [price, setPrice] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [message, setMessage] = useState('');
  const createOffer = useCreateDesignOffer();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال سعر صحيح',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createOffer.mutateAsync({
        roomDesignId,
        designerId,
        price: priceNum,
        message: message.trim() || undefined,
        estimatedDays: estimatedDays ? parseInt(estimatedDays) : undefined,
      });

      toast({
        title: 'تم إرسال العرض',
        description: 'سيتم إشعارك عند الرد على عرضك',
      });

      setPrice('');
      setEstimatedDays('');
      setMessage('');
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: error instanceof Error ? error.message : 'فشل في إرسال العرض',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">إرسال عرض</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">السعر (ر.س)</Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="5000"
                required
              />
            </div>
            <div>
              <Label htmlFor="days">مدة التنفيذ (أيام)</Label>
              <Input
                id="days"
                type="number"
                min="1"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                placeholder="7"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="message">رسالة (اختياري)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالة للعميل توضح فيها خبرتك وما ستقدمه..."
              className="min-h-[80px]"
              dir="rtl"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createOffer.isPending}
          >
            {createOffer.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 ml-2" />
                إرسال العرض
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
