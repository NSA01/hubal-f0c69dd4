import { BottomNav } from '@/components/ui/BottomNav';
import { StarRating } from '@/components/ui/StarRating';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMyDesignerProfile } from '@/hooks/useDesigners';
import { useDesignerReviews } from '@/hooks/useReviews';
import { Star, Loader2, MessageSquare } from 'lucide-react';

export default function DesignerReviews() {
  const { user } = useAuthContext();
  const { data: designer, isLoading: loadingDesigner } = useMyDesignerProfile(user?.id);
  const { data: reviews = [], isLoading: loadingReviews } = useDesignerReviews(designer?.id);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isLoading = loadingDesigner || loadingReviews;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const rating = designer?.rating ? Number(designer.rating) : 0;
  const reviewCount = designer?.review_count || 0;

  return (
    <div className="page-container">
      {/* Header */}
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">التقييمات</h1>
        <p className="text-muted-foreground mt-1">
          آراء العملاء في خدماتك
        </p>
      </header>

      {/* Rating Summary */}
      <div className="card-premium p-6 mb-6 text-center animate-scale-in">
        <div className="w-20 h-20 rounded-3xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
          <Star className="w-10 h-10 text-warning fill-warning" />
        </div>
        <div className="text-4xl font-bold text-foreground mb-2">
          {rating.toFixed(1)}
        </div>
        <StarRating rating={rating} size="lg" showValue={false} />
        <p className="text-muted-foreground mt-2">
          من {reviewCount} تقييم
        </p>
      </div>

      {/* Reviews List */}
      <section>
        <h2 className="section-title">جميع التقييمات</h2>
        
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review, idx) => (
              <div
                key={review.id}
                className="card-premium p-4 animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {review.customer_avatar ? (
                      <img
                        src={review.customer_avatar}
                        alt={review.customer_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-primary font-bold">
                        {review.customer_name?.charAt(0) || '؟'}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {review.customer_name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                      <StarRating rating={review.rating} size="sm" showValue={false} />
                    </div>
                    {review.comment && (
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              لا توجد تقييمات بعد
            </h3>
            <p className="text-muted-foreground text-sm">
              ستظهر هنا تقييمات العملاء بعد إتمام المشاريع
            </p>
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  );
}
