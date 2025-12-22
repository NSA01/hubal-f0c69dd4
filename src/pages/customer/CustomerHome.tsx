import { useAuthStore } from '@/store/authStore';
import { CategoryCard } from '@/components/CategoryCard';
import { categories } from '@/data/mockData';
import { BottomNav } from '@/components/ui/BottomNav';

export default function CustomerHome() {
  const { user } = useAuthStore();

  return (
    <div className="page-container">
      {/* Header */}
      <header className="mb-8 animate-fade-in">
        <p className="text-muted-foreground mb-1">أهلاً بك،</p>
        <h1 className="text-2xl font-bold text-foreground">
          {user?.name || 'ضيف'}
        </h1>
      </header>

      {/* Main Content */}
      <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="section-title">اختر الفئة</h2>
        <p className="text-muted-foreground mb-6">
          اكتشف أفضل المصممين في المملكة
        </p>

        <div className="grid gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className="mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="card-premium p-6 bg-primary/5">
          <h3 className="font-bold text-lg text-foreground mb-2">
            ✨ نصيحة اليوم
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            اختيار المصمم المناسب يبدأ بمراجعة أعماله السابقة وتقييمات العملاء. 
            تواصل مع أكثر من مصمم قبل اتخاذ القرار النهائي.
          </p>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
