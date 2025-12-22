import { useState, useMemo } from 'react';
import { ArrowRight, Filter, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DesignerCard } from '@/components/DesignerCard';
import { BottomNav } from '@/components/ui/BottomNav';
import { useDesigners, Designer } from '@/hooks/useDesigners';
import { CITIES, BUDGET_RANGES } from '@/types';

type SortOption = 'rating' | 'reviews';

// Adapter to convert database designer to card format
function adaptDesigner(d: Designer) {
  return {
    id: d.id,
    user_id: d.user_id,
    name: d.name || d.business_name || 'مصمم',
    business_name: d.business_name,
    city: d.city,
    rating: Number(d.rating) || 0,
    review_count: d.review_count || 0,
    min_budget: d.min_budget,
    max_budget: d.max_budget,
    avatar_url: d.avatar_url,
    services: d.services || [],
    portfolio_images: d.portfolio_images || [],
    bio: d.bio,
    is_verified: d.is_verified,
    is_active: d.is_active,
    created_at: d.created_at,
  };
}

export default function DesignersList() {
  const [cityFilter, setCityFilter] = useState<string>('');
  const [budgetFilter, setBudgetFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [showFilters, setShowFilters] = useState(false);

  const { data: designers = [], isLoading, error } = useDesigners();

  const filteredDesigners = useMemo(() => {
    let result = designers.map(adaptDesigner);

    if (cityFilter) {
      result = result.filter((d) => d.city === cityFilter);
    }

    if (budgetFilter !== null) {
      const range = BUDGET_RANGES[budgetFilter];
      result = result.filter(
        (d) => d.min_budget <= range.max && d.max_budget >= range.min
      );
    }

    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => b.review_count - a.review_count);
    }

    return result;
  }, [designers, cityFilter, budgetFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6 animate-fade-in">
        <Link to="/customer" className="p-2 -mr-2 hover:bg-secondary rounded-xl transition-colors">
          <ArrowRight className="w-6 h-6 text-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">المصممين</h1>
          <p className="text-sm text-muted-foreground">
            التصميم الداخلي
          </p>
        </div>
      </header>

      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
          showFilters ? 'bg-primary text-primary-foreground' : 'btn-secondary'
        }`}
      >
        <Filter className="w-5 h-5" />
        <span>الفلاتر والترتيب</span>
        <SlidersHorizontal className="w-4 h-4" />
      </button>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card-premium p-4 mb-4 space-y-4 animate-slide-up">
          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              المدينة
            </label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="input-field"
            >
              <option value="">جميع المدن</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              الميزانية
            </label>
            <select
              value={budgetFilter ?? ''}
              onChange={(e) =>
                setBudgetFilter(e.target.value ? Number(e.target.value) : null)
              }
              className="input-field"
            >
              <option value="">جميع الميزانيات</option>
              {BUDGET_RANGES.map((range, idx) => (
                <option key={idx} value={idx}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              ترتيب حسب
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('rating')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                  sortBy === 'rating'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
                }`}
              >
                الأعلى تقييمًا
              </button>
              <button
                onClick={() => setSortBy('reviews')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                  sortBy === 'reviews'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
                }`}
              >
                الأكثر تقييمًا
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <p className="text-sm text-muted-foreground mb-4">
        {filteredDesigners.length} مصمم متاح
      </p>

      {/* Designers List */}
      {error ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">حدث خطأ في تحميل المصممين</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDesigners.map((designer, idx) => (
            <div
              key={designer.id}
              className="animate-slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <DesignerCard designer={designer} />
            </div>
          ))}

          {filteredDesigners.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                لا يوجد مصممين متاحين حالياً
              </p>
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
