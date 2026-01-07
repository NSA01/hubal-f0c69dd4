import { useState, useEffect, useCallback } from 'react';
import { Home, Wand2, Users, MessageCircle, FileText, Rocket } from 'lucide-react';

const ONBOARDING_KEY = 'customer_onboarding_completed';

export interface OnboardingStep {
  id: string;
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  icon: React.ComponentType<{ className?: string }>;
}

export const customerOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    target: '[data-onboarding="category"]',
    title: 'اختر الفئة المناسبة',
    description: 'ابدأ رحلتك باختيار فئة الخدمة التي تحتاجها. ستجد أفضل المصممين المتخصصين في كل مجال.',
    position: 'bottom',
    icon: Home,
  },
  {
    id: 'ai-design',
    target: '[data-onboarding="ai-design"]',
    title: 'تصميم ذكي بنقرة واحدة ✨',
    description: 'التقط صورة لأي غرفة واحصل على تصميم مقترح بالذكاء الاصطناعي خلال ثوانٍ. جرّب الآن!',
    position: 'top',
    icon: Wand2,
  },
  {
    id: 'designers',
    target: '[data-onboarding="nav-designers"]',
    title: 'تصفح المصممين',
    description: 'اكتشف مجموعة متنوعة من المصممين المحترفين، واطلع على أعمالهم وتقييمات العملاء السابقين.',
    position: 'top',
    icon: Users,
  },
  {
    id: 'messages',
    target: '[data-onboarding="nav-messages"]',
    title: 'تواصل مباشر',
    description: 'تحدث مع المصممين مباشرة، ناقش أفكارك واحصل على عروض مخصصة لمشروعك.',
    position: 'top',
    icon: MessageCircle,
  },
  {
    id: 'requests',
    target: '[data-onboarding="nav-requests"]',
    title: 'تتبع طلباتك',
    description: 'تابع جميع طلباتك ومراحل تنفيذها من مكان واحد. ستبقى على اطلاع دائم.',
    position: 'top',
    icon: FileText,
  },
];

export type OnboardingPhase = 'idle' | 'welcome' | 'tour' | 'complete';

export function useOnboarding() {
  const [phase, setPhase] = useState<OnboardingPhase>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  });

  const currentStep = customerOnboardingSteps[currentStepIndex];
  const totalSteps = customerOnboardingSteps.length;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isOnboardingActive = phase === 'tour';

  const startOnboarding = useCallback(() => {
    setCurrentStepIndex(0);
    setPhase('welcome');
  }, []);

  const beginTour = useCallback(() => {
    setPhase('tour');
  }, []);

  const nextStep = useCallback(() => {
    if (isLastStep) {
      setPhase('complete');
      setTimeout(() => {
        completeOnboarding();
      }, 2500);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [isLastStep]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const skipOnboarding = useCallback(() => {
    completeOnboarding();
  }, []);

  const completeOnboarding = () => {
    setPhase('idle');
    setHasCompletedOnboarding(true);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY);
    setHasCompletedOnboarding(false);
    setCurrentStepIndex(0);
    setPhase('idle');
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (phase !== 'tour') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'Enter') {
        nextStep();
      } else if (e.key === 'ArrowRight') {
        prevStep();
      } else if (e.key === 'Escape') {
        skipOnboarding();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, nextStep, prevStep, skipOnboarding]);

  // Auto-start onboarding for new users
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => {
        startOnboarding();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, startOnboarding]);

  return {
    phase,
    isOnboardingActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    isLastStep,
    hasCompletedOnboarding,
    startOnboarding,
    beginTour,
    nextStep,
    prevStep,
    skipOnboarding,
    resetOnboarding,
  };
}
