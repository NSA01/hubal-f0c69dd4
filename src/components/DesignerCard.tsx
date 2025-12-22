import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Designer } from '@/types';
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

  return (
    <Link to={`/customer/designer/${designer.id}`}>
      <div className="card-premium p-4 animate-fade-in">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={designer.avatar}
              alt={designer.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/10"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-lg truncate">
              {designer.businessName || designer.name}
            </h3>
            
            {designer.businessName && (
              <p className="text-sm text-muted-foreground truncate">
                {designer.name}
              </p>
            )}

            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{designer.city}</span>
            </div>

            <div className="mt-2">
              <StarRating
                rating={designer.rating}
                reviewsCount={designer.reviewsCount}
                size="sm"
              />
            </div>

            <div className="mt-2">
              <span className="chip chip-primary text-xs">
                {formatBudget(designer.budgetMin, designer.budgetMax)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
