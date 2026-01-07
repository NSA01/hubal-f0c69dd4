import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(false);
    
    const updatePosition = () => {
      const targetElement = document.querySelector(step.target);
      if (!targetElement || !tooltipRef.current) return;

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const padding = 16;

      let top = 0;
      let left = 0;
      let arrow: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

      switch (step.position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - padding;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          arrow = 'bottom';
          break;
        case 'bottom':
          top = targetRect.bottom + padding;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          arrow = 'top';
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - padding;
          arrow = 'right';
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + padding;
          arrow = 'left';
          break;
      }

      // Keep tooltip within viewport
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16));
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipRect.height - 16));

      setPosition({ top, left });
      setArrowPosition(arrow);
      
      // Slight delay for smooth animation
      requestAnimationFrame(() => {
        setIsVisible(true);
      });

      // Highlight target element
      targetElement.classList.add('onboarding-highlight');
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(updatePosition, 150);
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      // Remove highlight from previous target
      const targetElement = document.querySelector(step.target);
      targetElement?.classList.remove('onboarding-highlight');
    };
  }, [step]);

  const getArrowStyles = () => {
    const base = 'absolute w-3 h-3 bg-card rotate-45 border-border';
    switch (arrowPosition) {
      case 'top':
        return `${base} -top-1.5 left-1/2 -translate-x-1/2 border-t border-l`;
      case 'bottom':
        return `${base} -bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r`;
      case 'left':
        return `${base} -left-1.5 top-1/2 -translate-y-1/2 border-l border-b`;
      case 'right':
        return `${base} -right-1.5 top-1/2 -translate-y-1/2 border-r border-t`;
    }
  };

  return (
    <>
      {/* Overlay with fade animation */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] animate-fade-in" 
        onClick={onSkip} 
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-[999] w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ top: position.top, left: position.left }}
      >
        {/* Arrow */}
        <div className={getArrowStyles()} />

        {/* Header with gradient */}
        <div className="bg-gradient-to-l from-primary/10 to-primary/5 px-5 py-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">جولة تعريفية</span>
                <h3 className="font-bold text-foreground text-sm">{step.title}</h3>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="p-1.5 rounded-full hover:bg-muted/50 transition-colors"
              aria-label="تخطي"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Footer with navigation */}
        <div className="px-5 py-4 bg-muted/30 border-t border-border/50">
          {/* Progress bar */}
          <div className="flex gap-1 mb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>

            <span className="text-xs text-muted-foreground font-medium">
              {currentIndex + 1} من {totalSteps}
            </span>

            <Button 
              size="sm" 
              onClick={onNext} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1 shadow-md"
            >
              {isLastStep ? 'ابدأ الآن' : 'التالي'}
              {!isLastStep && <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
