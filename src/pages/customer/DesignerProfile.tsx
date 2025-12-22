import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { BottomNav } from '@/components/ui/BottomNav';
import { useDesigner } from '@/hooks/useDesigners';
import { useDesignerReviews } from '@/hooks/useReviews';

export default function DesignerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: designer, isLoading } = useDesigner(id || '');
  const { data: designerReviews = [] } = useDesignerReviews(id);

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">المصمم غير موجود</p>
        <Link to="/customer/designers" className="btn-primary px-6 py-2">
          العودة للقائمة
        </Link>
      </div>
    );
  }

  const formatBudget = (min: number, max: number) => {
    const format = (n: number) => new Intl.NumberFormat('ar-SA').format(n);
    return `${format(min)} - ${format(max)} ر.س`;
  };

  return (
    <div className="page-container pb-32">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <Link to="/customer/designers" className="p-2 -mr-2">
          <ArrowRight className="w-6 h-6 text-foreground" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">ملف المصمم</h1>
      </header>

      {/* Profile Card */}
      <div className="card-premium p-6 mb-6 animate-fade-in">
        <div className="flex gap-4 mb-4">
          {designer.avatar_url ? (
            <img
              src={designer.avatar_url}
              alt={designer.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/10"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {designer.name?.charAt(0) || 'م'}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {designer.business_name || designer.name}
            </h2>
            {designer.business_name && (
              <p className="text-sm text-muted-foreground">{designer.name}</p>
            )}
            <div className="flex items-center gap-1 mt-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{designer.city}</span>
            </div>
            <div className="mt-2">
              <StarRating
                rating={designer.rating}
                reviewsCount={designer.review_count}
              />
            </div>
          </div>
        </div>

        <div className="chip chip-primary">
          {formatBudget(designer.min_budget, designer.max_budget)}
        </div>
      </div>

      {/* Bio */}
      {designer.bio && (
        <section className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="section-title">نبذة</h3>
          <p className="text-muted-foreground leading-relaxed">
            {designer.bio}
          </p>
        </section>
      )}

      {/* Services */}
      {designer.services && designer.services.length > 0 && (
        <section className="mb-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <h3 className="section-title">الخدمات</h3>
          <div className="flex flex-wrap gap-2">
            {designer.services.map((service, idx) => (
              <div key={idx} className="flex items-center gap-1 chip">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>{service}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Portfolio */}
      {designer.portfolio_images && designer.portfolio_images.length > 0 && (
        <section className="mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="section-title">معرض الأعمال</h3>
          <div className="grid grid-cols-2 gap-3">
            {designer.portfolio_images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`عمل ${idx + 1}`}
                className="w-full aspect-square object-cover rounded-2xl"
              />
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mb-6 animate-slide-up" style={{ animationDelay: '0.25s' }}>
        <h3 className="section-title">التقييمات</h3>
        {designerReviews.length > 0 ? (
          <div className="space-y-3">
            {designerReviews.map((review) => (
              <div key={review.id} className="card-premium p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-foreground">
                    {review.customer_name || 'عميل'}
                  </span>
                  <StarRating rating={review.rating} size="sm" showValue={false} />
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            لا توجد تقييمات بعد
          </p>
        )}
      </section>

      {/* CTA Button */}
      <div className="fixed bottom-20 left-4 right-4 z-40">
        <button
          onClick={() => navigate(`/customer/request/${designer.id}`)}
          className="w-full btn-primary py-4 text-lg"
        >
          طلب تصميم
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
