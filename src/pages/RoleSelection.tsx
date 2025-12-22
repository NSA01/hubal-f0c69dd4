import { useNavigate } from 'react-router-dom';
import { User, Palette } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function RoleSelection() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleRoleSelect = (role: 'customer' | 'designer') => {
    // Mock user for demo
    const mockUser = {
      id: role === 'customer' ? 'c1' : 'd1',
      name: role === 'customer' ? 'محمد العمري' : 'سارة المهندس',
      email: role === 'customer' ? 'customer@hubal.sa' : 'designer@hubal.sa',
      role: role,
      city: 'الرياض',
    };
    
    setUser(mockUser);
    navigate(role === 'customer' ? '/customer' : '/designer');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Logo/Brand */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Palette className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">هُبَل</h1>
        <p className="text-muted-foreground">منصة التصميم الداخلي</p>
      </div>

      {/* Role Selection */}
      <div className="w-full max-w-sm space-y-4">
        <h2 className="text-xl font-semibold text-center text-foreground mb-6">
          اختر طريقة الدخول
        </h2>

        <button
          onClick={() => handleRoleSelect('customer')}
          className="w-full card-premium p-6 flex items-center gap-4 hover:border-primary/30 transition-all duration-300 animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="text-right">
            <h3 className="font-bold text-lg text-foreground">عميل</h3>
            <p className="text-sm text-muted-foreground">
              أبحث عن مصمم داخلي لمشروعي
            </p>
          </div>
        </button>

        <button
          onClick={() => handleRoleSelect('designer')}
          className="w-full card-premium p-6 flex items-center gap-4 hover:border-primary/30 transition-all duration-300 animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Palette className="w-7 h-7 text-accent" />
          </div>
          <div className="text-right">
            <h3 className="font-bold text-lg text-foreground">مصمم داخلي</h3>
            <p className="text-sm text-muted-foreground">
              أقدم خدمات التصميم للعملاء
            </p>
          </div>
        </button>
      </div>

      {/* Footer */}
      <p className="mt-12 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
        بالمتابعة، أنت توافق على شروط الاستخدام
      </p>
    </div>
  );
}
