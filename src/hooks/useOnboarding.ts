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
    title: 'اختر الفئة',
    description: 'ابدأ باختيار فئة الخدمة التي تريدها للوصول لأفضل المصممين',
    position: 'bottom',
  },
  {
    id: 'ai-design',
    target: '[data-onboarding="ai-design"]',
    title: 'تصميم بالذكاء الاصطناعي',
    description: 'التقط صورة لغرفتك واحصل على تصميم مقترح فوري',
    position: 'top',
  },
  {
    id: 'designers',
    target: '[data-onboarding="nav-designers"]',
    title: 'تصفح المصممين',
    description: 'استكشف قائمة المصممين وتعرف على أعمالهم وتقييماتهم',
    position: 'top',
  },
  {
    id: 'messages',
    target: '[data-onboarding="nav-messages"]',
    title: 'الرسائل',
    description: 'تواصل مباشرة مع المصممين وتابع محادثاتك',
    position: 'top',
  },
  {
    id: 'requests',
    target: '[data-onboarding="nav-requests"]',
    title: 'طلباتك',
    description: 'تابع جميع طلباتك وحالتها من هنا',
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
