import { Button } from '@/components/ui/button';
import { Rocket, Sparkles, X } from 'lucide-react';

interface WelcomeModalProps {
  onStart: () => void;
  onSkip: () => void;
}

export function WelcomeModal({ onStart, onSkip }: WelcomeModalProps) {
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] animate-fade-in" />

      {/* Modal */}
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
          {/* Close button */}
          <button
            onClick={onSkip}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-muted/50 transition-colors z-10"
            aria-label="تخطي"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Hero section */}
          <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 px-6 pt-10 pb-8">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-4 right-8 w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
              <div className="absolute top-12 left-12 w-3 h-3 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-8 right-16 w-2 h-2 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            
            <div className="relative flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 shadow-lg">
                <Rocket className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                أهلاً بك في هُبَّل! 👋
              </h2>
              <p className="text-muted-foreground text-sm">
                منصة التصميم الداخلي الأولى
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <p className="text-center text-muted-foreground leading-relaxed mb-6">
              دعنا نأخذك في جولة سريعة لاكتشاف كيف يمكنك الاستفادة من جميع مميزات التطبيق
            </p>

            {/* Features preview */}
            <div className="flex justify-center gap-6 mb-6">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">تصميم ذكي</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs text-muted-foreground">مصممين محترفين</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-xs text-muted-foreground">تواصل مباشر</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={onStart} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg h-12 text-base font-semibold"
              >
                ابدأ الجولة التعريفية
              </Button>
              <Button 
                variant="ghost" 
                onClick={onSkip}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                تخطي الآن
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
