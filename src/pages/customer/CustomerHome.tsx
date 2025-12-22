import { useAuthContext } from '@/contexts/AuthContext';
import { CategoryCard } from '@/components/CategoryCard';
import { BottomNav } from '@/components/ui/BottomNav';
import { Sparkles } from 'lucide-react';

const categories = [
  {
    id: '1',
    name: 'interior_design',
    nameAr: 'التصميم الداخلي',
    description: 'تصميم وتنسيق المساحات الداخلية للمنازل والمكاتب',
    icon: 'home',
    isActive: true,
  },
];

export default function CustomerHome() {
  const { user } = useAuthContext();

  return (
    <div className="page-container">
      {/* Header */}
      <header className="mb-8 animate-fade-in">
        <p className="text-muted-foreground mb-1">أهلاً بك،</p>
        <h1 className="text-2xl font-bold text-foreground">
          {user?.user_metadata?.name || user?.email?.split('@')[0] || 'ضيف'}
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
        <div className="card-premium p-6 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground mb-2">
                نصيحة اليوم
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                اختيار المصمم المناسب يبدأ بمراجعة أعماله السابقة وتقييمات العملاء. 
                تواصل مع أكثر من مصمم قبل اتخاذ القرار النهائي.
              </p>
            </div>
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
