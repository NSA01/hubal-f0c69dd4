import { useAuthContext } from '@/contexts/AuthContext';
import { CategoryCard } from '@/components/CategoryCard';
import { BottomNav } from '@/components/ui/BottomNav';
import { Sparkles, Wand2, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingTooltip } from '@/components/OnboardingTooltip';
import { Button } from '@/components/ui/button';

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
  const {
    isOnboardingActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    isLastStep,
    hasCompletedOnboarding,
    startOnboarding,
    nextStep,
    prevStep,
    skipOnboarding,
  } = useOnboarding();

  return (
    <div className="page-container">
      {/* Onboarding Tooltip */}
      {isOnboardingActive && currentStep && (
        <OnboardingTooltip
          step={currentStep}
          currentIndex={currentStepIndex}
          totalSteps={totalSteps}
          isLastStep={isLastStep}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipOnboarding}
        />
      )}

      {/* Header */}
      <header className="mb-8 animate-fade-in flex items-start justify-between">
        <div>
          <p className="text-muted-foreground mb-1">أهلاً بك،</p>
          <h1 className="text-2xl font-bold text-foreground">
            {user?.user_metadata?.name || user?.email?.split('@')[0] || 'ضيف'}
          </h1>
        </div>
        {hasCompletedOnboarding && (
          <Button
            variant="ghost"
            size="icon"
            onClick={startOnboarding}
            className="text-muted-foreground hover:text-primary"
            title="إعادة الجولة التعريفية"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        )}
      </header>

      {/* Main Content */}
      <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="section-title">اختر الفئة</h2>
        <p className="text-muted-foreground mb-6">
          اكتشف أفضل المصممين في المملكة
        </p>

        <div className="grid gap-4" data-onboarding="category">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* AI Room Design Feature */}
      <section className="mt-8 animate-slide-up" style={{ animationDelay: '0.15s' }} data-onboarding="ai-design">
        <Link to="/customer/room-design">
          <div className="card-premium p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Wand2 className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground mb-1">
                  صمم غرفتك بالذكاء الاصطناعي
                </h3>
                <p className="text-sm text-muted-foreground">
                  التقط صورة واحصل على تصميم مقترح وعروض من المصممين
                </p>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Featured Section */}
      <section className="mt-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
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
