import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Palette, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function RoleSelection() {
  const navigate = useNavigate();
  const { user, refetchRole } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = async (selectedRole: 'customer' | 'designer') => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/');
      return;
    }

    setIsLoading(true);

    try {
      // Insert role into user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: selectedRole,
        });

      if (roleError) {
        // If role already exists, refetch and navigate
        if (roleError.code === '23505') {
          await refetchRole();
          navigate(selectedRole === 'customer' ? '/customer' : '/designer/onboarding');
          return;
        }
        throw roleError;
      }

      // Refetch the role so AuthContext knows about it
      await refetchRole();
      
      toast.success('تم اختيار الدور بنجاح');
      
      // Navigate based on role
      if (selectedRole === 'designer') {
        navigate('/designer/onboarding');
      } else {
        navigate('/customer');
      }
    } catch (error) {
      console.error('Error setting role:', error);
      toast.error('حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--gradient-hero)' }}>
      {/* Logo/Brand */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Palette className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">هُبَل</h1>
        <p className="text-muted-foreground">منصة التصميم الداخلي</p>
      </div>

      {/* Role Selection */}
      <div className="w-full max-w-sm space-y-4">
        <h2 className="text-xl font-semibold text-center text-foreground mb-6">
          اختر نوع حسابك
        </h2>

        <button
          onClick={() => handleRoleSelect('customer')}
          disabled={isLoading}
          className="w-full card-premium p-6 flex items-center gap-4 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-slide-up disabled:opacity-50"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            {isLoading ? (
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            ) : (
              <User className="w-7 h-7 text-primary" />
            )}
          </div>
          <div className="text-right flex-1">
            <h3 className="font-bold text-lg text-foreground">عميل</h3>
            <p className="text-sm text-muted-foreground">
              أبحث عن مصمم داخلي لمشروعي
            </p>
          </div>
        </button>

        <button
          onClick={() => handleRoleSelect('designer')}
          disabled={isLoading}
          className="w-full card-premium p-6 flex items-center gap-4 hover:border-accent/30 hover:shadow-lg transition-all duration-300 animate-slide-up disabled:opacity-50"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            {isLoading ? (
              <Loader2 className="w-7 h-7 text-accent animate-spin" />
            ) : (
              <Palette className="w-7 h-7 text-accent" />
            )}
          </div>
          <div className="text-right flex-1">
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
