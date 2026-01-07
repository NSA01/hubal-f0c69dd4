import React, { useState, useEffect } from 'react';
import { Star, Send, Loader2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateReview, useUpdateReview, useExistingReview } from '@/hooks/useReviews';
import { toast } from 'sonner';

interface ReviewFormProps {
  designerId: string;
  serviceRequestId?: string;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  designerId,
  serviceRequestId,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const { data: existingReview, isLoading: isLoadingExisting } = useExistingReview(designerId);

  const isEditing = !!existingReview;

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    }
  }, [existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('يرجى اختيار تقييم');
      return;
    }

    try {
      if (isEditing && existingReview) {
        await updateReview.mutateAsync({
          reviewId: existingReview.id,
          designerId,
          rating,
          comment: comment.trim() || undefined,
        });
        toast.success('تم تحديث التقييم بنجاح');
      } else {
        await createReview.mutateAsync({
          designerId,
          serviceRequestId,
          rating,
          comment: comment.trim() || undefined,
        });
        toast.success('تم إرسال التقييم بنجاح');
      }
      onSuccess?.();
    } catch (error: any) {
      if (error?.code === '23505') {
        toast.error('لقد قمت بتقييم هذا المصمم مسبقاً');
      } else {
        toast.error('حدث خطأ أثناء إرسال التقييم');
      }
    }
  };

  const isPending = createReview.isPending || updateReview.isPending;

  if (isLoadingExisting) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {isEditing ? (
            <>
              <Edit className="h-5 w-5" />
              تعديل التقييم
            </>
          ) : (
            'تقييم المصمم'
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-muted-foreground">كيف تقيم تجربتك؟</span>
            <div className="flex gap-1" dir="ltr">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="text-sm font-medium text-primary">
                {rating === 5 && 'ممتاز!'}
                {rating === 4 && 'جيد جداً'}
                {rating === 3 && 'جيد'}
                {rating === 2 && 'مقبول'}
                {rating === 1 && 'ضعيف'}
              </span>
            )}
          </div>

          {/* Comment */}
          <div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="أخبرنا المزيد عن تجربتك (اختياري)"
              className="min-h-[80px] resize-none"
              dir="rtl"
              maxLength={500}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={rating === 0 || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                {isEditing ? 'جاري التحديث...' : 'جاري الإرسال...'}
              </>
            ) : (
              <>
                {isEditing ? <Edit className="h-4 w-4 ml-2" /> : <Send className="h-4 w-4 ml-2" />}
                {isEditing ? 'تحديث التقييم' : 'إرسال التقييم'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
