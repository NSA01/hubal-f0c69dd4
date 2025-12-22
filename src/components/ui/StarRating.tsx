import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewsCount?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({ 
  rating, 
  size = 'md', 
  showValue = true, 
  reviewsCount,
  interactive = false,
  onRatingChange
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-6 h-6',
  };
  
  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const gapClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5',
  };

  // Ensure rating is a valid number
  const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
  const displayRating = Math.min(5, Math.max(0, safeRating));

  const handleStarClick = (starValue: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center ${gapClasses[size]}`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          const isPartial = star > displayRating && star - 1 < displayRating;
          
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => handleStarClick(star)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
            >
              <Star
                className={`${sizeClasses[size]} transition-colors duration-200 ${
                  isFilled
                    ? 'fill-warning text-warning drop-shadow-sm'
                    : isPartial
                    ? 'fill-warning/50 text-warning'
                    : 'fill-muted/30 text-muted-foreground/30'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showValue && displayRating > 0 && (
        <span className={`${textClasses[size]} font-bold text-foreground`}>
          {displayRating.toFixed(1)}
        </span>
      )}
      {reviewsCount !== undefined && reviewsCount > 0 && (
        <span className={`${textClasses[size]} text-muted-foreground`}>
          ({reviewsCount} تقييم)
        </span>
      )}
      {showValue && displayRating === 0 && reviewsCount === 0 && (
        <span className={`${textClasses[size]} text-muted-foreground`}>
          لا توجد تقييمات
        </span>
      )}
    </div>
  );
}
