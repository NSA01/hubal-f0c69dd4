import { BottomNav } from '@/components/ui/BottomNav';
import { StarRating } from '@/components/ui/StarRating';
import { reviews, designers } from '@/data/mockData';
import { Star } from 'lucide-react';

export default function DesignerReviews() {
  const designer = designers[0];
  const designerReviews = reviews.filter((r) => r.designerId === '1');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
          {designer.rating}
        </div>
        <StarRating rating={designer.rating} size="lg" showValue={false} />
        <p className="text-muted-foreground mt-2">
          من {designer.reviewsCount} تقييم
        </p>
      </div>

      {/* Reviews List */}
      <section>
        <h2 className="section-title">جميع التقييمات</h2>
        
        {designerReviews.length > 0 ? (
          <div className="space-y-4">
            {designerReviews.map((review, idx) => (
              <div
                key={review.id}
                className="card-premium p-4 animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {review.customerName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(review.date)}
                    </p>
                  </div>
                  <StarRating rating={review.rating} size="sm" showValue={false} />
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-muted-foreground">
              لا توجد تقييمات بعد
            </p>
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  );
}
