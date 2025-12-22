import { Link } from 'react-router-dom';
import { MapPin, Briefcase, BadgeCheck } from 'lucide-react';
import { Designer } from '@/hooks/useDesigners';
import { StarRating } from './ui/StarRating';

interface DesignerCardProps {
  designer: Designer;
}

export function DesignerCard({ designer }: DesignerCardProps) {
  const formatBudget = (min: number, max: number) => {
    const formatNum = (n: number) => {
      if (n >= 1000) {
        return `${(n / 1000).toFixed(0)}k`;
      }
      return n.toString();
    };
    return `${formatNum(min)} - ${formatNum(max)} ر.س`;
  };

  const avatarUrl = designer.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(designer.name || designer.business_name || 'D')}&background=c9a962&color=fff&size=128`;

  return (
    <Link to={`/customer/designer/${designer.id}`}>
      <div className="card-premium p-4 hover:shadow-elevated transition-all duration-300">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 relative">
            <img
              src={avatarUrl}
              alt={designer.name || designer.business_name || 'مصمم'}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/10"
            />
            {designer.is_verified && (
              <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-lg truncate">
              {designer.business_name || designer.name}
            </h3>
            
            {designer.business_name && designer.name && (
              <p className="text-sm text-muted-foreground truncate">
                {designer.name}
              </p>
            )}

            <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{designer.city}</span>
            </div>

            <div className="mt-2">
              <StarRating
                rating={Number(designer.rating) || 0}
                reviewsCount={designer.review_count || 0}
                size="sm"
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="chip chip-primary text-xs flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {formatBudget(designer.min_budget, designer.max_budget)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
