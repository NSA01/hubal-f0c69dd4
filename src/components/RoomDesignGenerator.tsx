import React, { useState, useRef } from 'react';
import { Camera, Upload, Wand2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCreateRoomDesign } from '@/hooks/useRoomDesigns';

interface RoomDesignGeneratorProps {
  onDesignGenerated?: (designId: string) => void;
}

export const RoomDesignGenerator: React.FC<RoomDesignGeneratorProps> = ({ onDesignGenerated }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const createDesign = useCreateRoomDesign();

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

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) {
      toast({
        title: 'معلومات ناقصة',
        description: 'يرجى اختيار صورة وإدخال وصف التصميم المطلوب',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload image first
      const imageUrl = await uploadImage();

      // Generate design
      const result = await createDesign.mutateAsync({
        imageUrl,
        prompt: prompt.trim(),
      });

      setGeneratedImage(result.generated_image_url);
      onDesignGenerated?.(result.id);

      toast({
        title: 'تم إنشاء التصميم',
        description: 'يمكنك الآن استلام عروض من المصممين',
      });
    } catch (error) {
      console.error('Error generating design:', error);
      toast({
        title: 'حدث خطأ',
        description: error instanceof Error ? error.message : 'فشل في إنشاء التصميم',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setImageFile(null);
    setGeneratedImage(null);
    setPrompt('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Image */}
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-foreground">صورة الغرفة الأصلية</h3>
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

        {/* Generated Image */}
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-foreground">التصميم المقترح</h3>
            {isUploading || createDesign.isPending ? (
              <div className="w-full h-64 bg-muted rounded-lg flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
                <p className="text-muted-foreground">جاري إنشاء التصميم...</p>
              </div>
            ) : generatedImage ? (
              <img
                src={generatedImage}
                alt="Generated design"
                className="w-full h-64 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-64 bg-muted rounded-lg flex flex-col items-center justify-center">
                <Wand2 className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-center">
                  سيظهر التصميم المقترح هنا
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prompt Input */}
      <Card>
        <CardContent className="p-4">
          <label className="block font-semibold mb-2 text-foreground">
            وصف التصميم المطلوب
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="مثال: أريد تصميم عصري بألوان دافئة مع إضاءة طبيعية وأثاث مريح..."
            className="min-h-[100px] resize-none"
            dir="rtl"
          />
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!selectedImage || !prompt.trim() || isUploading || createDesign.isPending}
        className="w-full"
        size="lg"
      >
        {isUploading || createDesign.isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin ml-2" />
            جاري الإنشاء...
          </>
        ) : (
          <>
            <Wand2 className="h-5 w-5 ml-2" />
            إنشاء التصميم
          </>
        )}
      </Button>
    </div>
  );
};
