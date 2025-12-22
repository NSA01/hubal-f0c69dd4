import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewsCount?: number;
}

export function StarRating({ rating, size = 'md', showValue = true, reviewsCount }: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-warning text-warning'
                : 'fill-muted text-muted'
            }`}
          />
        ))}
      </div>
      {showValue && (
        <span className={`${textClasses[size]} font-semibold text-foreground mr-1`}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewsCount !== undefined && (
        <span className={`${textClasses[size]} text-muted-foreground`}>
          ({reviewsCount})
        </span>
      )}
    </div>
  );
}
