import { Link } from 'react-router-dom';
import { MapPin, Briefcase, BadgeCheck, ChevronLeft } from 'lucide-react';
import { Designer } from '@/hooks/useDesigners';
import { StarRating } from './ui/StarRating';

interface DesignerCardProps {
  designer: Designer;
}

export function DesignerCard({ designer }: DesignerCardProps) {
  const formatBudget = (min: number | null, max: number | null) => {
    const minVal = min || 0;
    const maxVal = max || 0;
    
    const formatNum = (n: number) => {
      if (n >= 1000) {
        return `${(n / 1000).toFixed(0)}k`;
      }
      return n.toString();
    };
    return `${formatNum(minVal)} - ${formatNum(maxVal)} ر.س`;
  };

  const avatarUrl = designer.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(designer.name || designer.business_name || 'D')}&background=c9a962&color=fff&size=128`;
  const rating = typeof designer.rating === 'number' ? designer.rating : Number(designer.rating) || 0;
  const reviewCount = designer.review_count || 0;

  return (
    <Link to={`/customer/designer/${designer.id}`} className="block">
      <div className="card-premium p-5 hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 group">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/10 shadow-sm">
              <img
                src={avatarUrl}
                alt={designer.name || designer.business_name || 'مصمم'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            {designer.is_verified && (
              <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                <BadgeCheck className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-foreground text-lg truncate group-hover:text-primary transition-colors">
                  {designer.business_name || designer.name}
                </h3>
                
                {designer.business_name && designer.name && (
                  <p className="text-sm text-muted-foreground truncate">
                    {designer.name}
                  </p>
                )}
              </div>
              <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>

            <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary/70" />
              <span className="text-sm">{designer.city}</span>
            </div>

            <div className="mt-2.5">
              <StarRating
                rating={rating}
                reviewsCount={reviewCount}
                size="sm"
              />
            </div>

            <div className="flex items-center gap-2 mt-3">
              <span className="chip chip-primary text-xs flex items-center gap-1.5 px-3 py-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                {formatBudget(designer.min_budget, designer.max_budget)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
