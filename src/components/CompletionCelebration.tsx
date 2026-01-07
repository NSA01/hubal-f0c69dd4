import { useEffect, useState } from 'react';
import { CheckCircle2, PartyPopper } from 'lucide-react';

interface CompletionCelebrationProps {
  onComplete?: () => void;
}

export function CompletionCelebration({ onComplete }: CompletionCelebrationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; duration: number; color: string }>>([]);

  useEffect(() => {
    // Generate confetti
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfetti(particles);
  }, []);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]" />

      {/* Confetti */}
      <div className="fixed inset-0 z-[999] pointer-events-none overflow-hidden">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-3 h-3 rounded-sm"
            style={{
              left: `${particle.left}%`,
              top: '-20px',
              backgroundColor: particle.color,
              animation: `confetti-fall ${particle.duration}s ease-out ${particle.delay}s forwards`,
            }}
          />
        ))}
      </div>

      {/* Celebration modal */}
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="w-full max-w-xs bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-scale-in text-center p-8">
          <div className="relative mb-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 animate-bounce" style={{ animationDelay: '0.2s' }}>
              <PartyPopper className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-2">
            أنت جاهز الآن! 🎉
          </h2>
          <p className="text-muted-foreground text-sm">
            استمتع باستخدام التطبيق واكتشف عالم التصميم الداخلي
          </p>
        </div>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
