import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { OnboardingStep } from '@/hooks/useOnboarding';

interface OnboardingTooltipProps {
  step: OnboardingStep;
  currentIndex: number;
  totalSteps: number;
  isLastStep: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export function OnboardingTooltip({
  step,
  currentIndex,
  totalSteps,
  isLastStep,
  onNext,
  onPrev,
  onSkip,
}: OnboardingTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const targetElement = document.querySelector(step.target);
      if (!targetElement || !tooltipRef.current) return;

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const padding = 12;

      let top = 0;
      let left = 0;

      switch (step.position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - padding;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + padding;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - padding;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + padding;
          break;
      }

      // Keep tooltip within viewport
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16));
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipRect.height - 16));

      setPosition({ top, left });
      setIsVisible(true);

      // Highlight target element
      targetElement.classList.add('onboarding-highlight');
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      // Remove highlight from previous target
      const targetElement = document.querySelector(step.target);
      targetElement?.classList.remove('onboarding-highlight');
    };
  }, [step]);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[998]" onClick={onSkip} />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-[999] w-72 bg-card border border-border rounded-xl shadow-xl p-4 transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ top: position.top, left: position.left }}
      >
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-2 left-2 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="تخطي"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="pr-2">
          <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-4 mb-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="text-muted-foreground"
          >
            <ChevronRight className="w-4 h-4 ml-1" />
            السابق
          </Button>

          <span className="text-xs text-muted-foreground">
            {currentIndex + 1} / {totalSteps}
          </span>

          <Button size="sm" onClick={onNext} className="bg-primary text-primary-foreground">
            {isLastStep ? 'إنهاء' : 'التالي'}
            {!isLastStep && <ChevronLeft className="w-4 h-4 mr-1" />}
          </Button>
        </div>
      </div>
    </>
  );
}
