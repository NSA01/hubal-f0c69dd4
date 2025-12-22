import React, { useState, useRef } from 'react';
import { Camera, X, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

interface DesignRequestFormProps {
  onRequestCreated?: (designId: string) => void;
}

export const DesignRequestForm: React.FC<DesignRequestFormProps> = ({ onRequestCreated }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'الملف كبير جداً',
          description: 'يجب أن يكون حجم الصورة أقل من 10 ميجابايت',
          variant: 'destructive',
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) throw new Error('No image selected');

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `room-designs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('designer-images')
      .upload(filePath, imageFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('designer-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!selectedImage || !prompt.trim() || !user) {
      toast({
        title: 'معلومات ناقصة',
        description: 'يرجى اختيار صورة وإدخال وصف التصميم المطلوب',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const imageUrl = await uploadImage();

      const { data, error } = await supabase
        .from('room_designs')
        .insert({
          user_id: user.id,
          original_image_url: imageUrl,
          prompt: prompt.trim(),
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['room-designs'] });
      onRequestCreated?.(data.id);

      toast({
        title: 'تم إرسال طلبك',
        description: 'سيتمكن المصممون من رؤية طلبك وتقديم عروضهم',
      });

      // Clear form
      setSelectedImage(null);
      setImageFile(null);
      setPrompt('');
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: 'حدث خطأ',
        description: error instanceof Error ? error.message : 'فشل في إرسال الطلب',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setImageFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-foreground">صورة الغرفة</h3>
          {selectedImage ? (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Selected room"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="w-full h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-center">
                اضغط لالتقاط صورة<br />أو اختيار من المعرض
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Description Input */}
      <Card>
        <CardContent className="p-4">
          <label className="block font-semibold mb-2 text-foreground">
            وصف التصميم المطلوب
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="مثال: أريد تصميم عصري لغرفة المعيشة بألوان دافئة مع إضاءة طبيعية..."
            className="min-h-[120px] resize-none"
            dir="rtl"
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!selectedImage || !prompt.trim() || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin ml-2" />
            جاري الإرسال...
          </>
        ) : (
          <>
            <Send className="h-5 w-5 ml-2" />
            أرسل طلب التصميم
          </>
        )}
      </Button>
    </div>
  );
};
