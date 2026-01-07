import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CounterOfferFormProps {
  originalPrice: number;
  originalDays?: number | null;
  onSubmit: (data: { price: number; estimatedDays?: number; message?: string }) => Promise<void>;
  isLoading?: boolean;
}

export const CounterOfferForm: React.FC<CounterOfferFormProps> = ({
  originalPrice,
  originalDays,
  onSubmit,
  isLoading = false,
}) => {
  const [price, setPrice] = useState(originalPrice.toString());
  const [estimatedDays, setEstimatedDays] = useState(originalDays?.toString() || '');
  const [message, setMessage] = useState('');
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
      await onSubmit({
        price: priceNum,
        estimatedDays: estimatedDays ? parseInt(estimatedDays) : undefined,
        message: message.trim() || undefined,
      });
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: error instanceof Error ? error.message : 'فشل في إرسال العرض المضاد',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-muted/50 rounded-lg text-sm">
        <p className="text-muted-foreground">العرض الأصلي:</p>
        <p className="font-bold text-foreground">{originalPrice.toLocaleString()} ر.س</p>
        {originalDays && (
          <p className="text-muted-foreground">المدة: {originalDays} يوم</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="counter-price">السعر الجديد (ر.س)</Label>
          <Input
            id="counter-price"
            type="number"
            min="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="5000"
            required
          />
        </div>
        <div>
          <Label htmlFor="counter-days">مدة التنفيذ (أيام)</Label>
          <Input
            id="counter-days"
            type="number"
            min="1"
            value={estimatedDays}
            onChange={(e) => setEstimatedDays(e.target.value)}
            placeholder="7"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="counter-message">رسالة للعميل</Label>
        <Textarea
          id="counter-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="اشرح للعميل سبب التعديل على العرض..."
          className="min-h-[80px]"
          dir="rtl"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
            جاري الإرسال...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 ml-2" />
            إرسال العرض المضاد
          </>
        )}
      </Button>
    </form>
  );
};
