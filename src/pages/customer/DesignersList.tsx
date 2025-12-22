import { useState, useMemo } from 'react';
import { ArrowRight, Filter, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DesignerCard } from '@/components/DesignerCard';
import { BottomNav } from '@/components/ui/BottomNav';
import { designers } from '@/data/mockData';
import { CITIES, BUDGET_RANGES } from '@/types';

type SortOption = 'rating' | 'reviews';

export default function DesignersList() {
  const [cityFilter, setCityFilter] = useState<string>('');
  const [budgetFilter, setBudgetFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [showFilters, setShowFilters] = useState(false);

  const filteredDesigners = useMemo(() => {
    let result = [...designers];

    if (cityFilter) {
      result = result.filter((d) => d.city === cityFilter);
    }

    if (budgetFilter !== null) {
      const range = BUDGET_RANGES[budgetFilter];
      result = result.filter(
        (d) => d.budgetMin <= range.max && d.budgetMax >= range.min
      );
    }

    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return result;
  }, [cityFilter, budgetFilter, sortBy]);

  return (
    <div className="page-container">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <Link to="/customer" className="p-2 -mr-2">
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
        className="w-full btn-secondary mb-4 flex items-center justify-center gap-2"
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
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                  sortBy === 'rating'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                الأعلى تقييمًا
              </button>
              <button
                onClick={() => setSortBy('reviews')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                  sortBy === 'reviews'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
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
      <div className="space-y-4">
        {filteredDesigners.map((designer, idx) => (
          <div
            key={designer.id}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <DesignerCard designer={designer} />
          </div>
        ))}

        {filteredDesigners.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              لا يوجد مصممين يطابقون معايير البحث
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
