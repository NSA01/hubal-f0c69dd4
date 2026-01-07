import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'customer_onboarding_completed';

export interface OnboardingStep {
  id: string;
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export const customerOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    target: '[data-onboarding="category"]',
    title: 'اختر الفئة المناسبة',
    description: 'ابدأ رحلتك باختيار فئة الخدمة التي تحتاجها. ستجد أفضل المصممين المتخصصين في كل مجال.',
    position: 'bottom',
  },
  {
    id: 'ai-design',
    target: '[data-onboarding="ai-design"]',
    title: 'تصميم ذكي بنقرة واحدة ✨',
    description: 'التقط صورة لأي غرفة واحصل على تصميم مقترح بالذكاء الاصطناعي خلال ثوانٍ. جرّب الآن!',
    position: 'top',
  },
  {
    id: 'designers',
    target: '[data-onboarding="nav-designers"]',
    title: 'تصفح المصممين',
    description: 'اكتشف مجموعة متنوعة من المصممين المحترفين، واطلع على أعمالهم وتقييمات العملاء السابقين.',
    position: 'top',
  },
  {
    id: 'messages',
    target: '[data-onboarding="nav-messages"]',
    title: 'تواصل مباشر',
    description: 'تحدث مع المصممين مباشرة، ناقش أفكارك واحصل على عروض مخصصة لمشروعك.',
    position: 'top',
  },
  {
    id: 'requests',
    target: '[data-onboarding="nav-requests"]',
    title: 'تتبع طلباتك',
    description: 'تابع جميع طلباتك ومراحل تنفيذها من مكان واحد. ستبقى على اطلاع دائم.',
    position: 'top',
  },
];

export function useOnboarding() {
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  });

  const currentStep = customerOnboardingSteps[currentStepIndex];
  const totalSteps = customerOnboardingSteps.length;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const startOnboarding = () => {
    setCurrentStepIndex(0);
    setIsOnboardingActive(true);
  };

  const nextStep = () => {
    if (isLastStep) {
      completeOnboarding();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    setIsOnboardingActive(false);
    setHasCompletedOnboarding(true);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setHasCompletedOnboarding(false);
    setCurrentStepIndex(0);
  };

  // Auto-start onboarding for new users
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => {
        startOnboarding();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding]);

  return {
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
    resetOnboarding,
  };
}
