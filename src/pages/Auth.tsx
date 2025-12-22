import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Mail, Lock, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AuthMode = 'login' | 'signup';
type RoleType = 'customer' | 'designer';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<RoleType>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { name }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Insert user role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: data.user.id, role });

          if (roleError) throw roleError;

          // If designer, create designer profile
          if (role === 'designer') {
            const { error: designerError } = await supabase
              .from('designers')
              .insert({ 
                user_id: data.user.id,
                business_name: name,
                city: 'الرياض'
              });

            if (designerError) throw designerError;
          }

          toast.success('تم إنشاء الحساب بنجاح');
          navigate(role === 'customer' ? '/customer' : '/designer');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Get user role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .maybeSingle();

          const userRole = roleData?.role || 'customer';
          toast.success('مرحبًا بعودتك');
          navigate(userRole === 'customer' ? '/customer' : '/designer');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      if (error.message?.includes('User already registered')) {
        toast.error('البريد الإلكتروني مسجل مسبقًا');
      } else if (error.message?.includes('Invalid login credentials')) {
        toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else {
        toast.error(error.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--gradient-hero)' }}>
      {/* Logo */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 shadow-soft">
          <Palette className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">هُبَل</h1>
        <p className="text-muted-foreground text-sm mt-1">منصة التصميم الداخلي</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-sm card-premium p-6 animate-slide-up">
        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-secondary/50 rounded-xl">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'login'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'signup'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            حساب جديد
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              {/* Name Input */}
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field pr-11"
                />
              </div>

              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    role === 'customer'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  عميل
                </button>
                <button
                  type="button"
                  onClick={() => setRole('designer')}
                  className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    role === 'designer'
                      ? 'border-accent bg-accent/5 text-accent'
                      : 'border-border text-muted-foreground hover:border-accent/30'
                  }`}
                >
                  مصمم داخلي
                </button>
              </div>
            </>
          )}

          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field pr-11"
              dir="ltr"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="input-field pr-11"
              dir="ltr"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'login' ? (
              'دخول'
            ) : (
              'إنشاء حساب'
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
        بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية
      </p>
    </div>
  );
}
