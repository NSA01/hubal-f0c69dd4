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
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast.error('حدث خطأ في تسجيل الدخول بـ Google');
      setGoogleLoading(false);
    }
  };

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
          // Redirect designer to onboarding, customer to home
          navigate(role === 'customer' ? '/customer' : '/designer/onboarding');
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      {/* Logo */}
      <div className="text-center mb-10 animate-fade-in relative z-10">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-elevated border border-primary/20" style={{ background: 'var(--gradient-primary)' }}>
          <Palette className="w-12 h-12 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">هُبَل</h1>
        <p className="text-muted-foreground mt-2">منصة التصميم الداخلي الأولى</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md card-premium p-8 animate-slide-up relative z-10 backdrop-blur-sm border-primary/10">
        {/* Mode Tabs */}
        <div className="flex gap-2 mb-8 p-1.5 bg-secondary/60 rounded-2xl">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              mode === 'login'
                ? 'bg-card text-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              mode === 'signup'
                ? 'bg-card text-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            حساب جديد
          </button>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border-2 border-border bg-card hover:bg-secondary/50 hover:border-primary/30 transition-all duration-300 mb-6 group disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium text-foreground">
                {mode === 'login' ? 'الدخول بـ Google' : 'التسجيل بـ Google'}
              </span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">أو</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <>
              {/* Name Input */}
              <div className="relative group">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field pr-12 py-4"
                />
              </div>

              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-sm font-semibold ${
                    role === 'customer'
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5'
                  }`}
                >
                  <span className="text-lg mb-1 block">👤</span>
                  عميل
                </button>
                <button
                  type="button"
                  onClick={() => setRole('designer')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-sm font-semibold ${
                    role === 'designer'
                      ? 'border-accent bg-accent/10 text-accent shadow-sm'
                      : 'border-border text-muted-foreground hover:border-accent/40 hover:bg-accent/5'
                  }`}
                >
                  <span className="text-lg mb-1 block">🎨</span>
                  مصمم داخلي
                </button>
              </div>
            </>
          )}

          {/* Email Input */}
          <div className="relative group">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field pr-12 py-4"
              dir="ltr"
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="input-field pr-12 py-4"
              dir="ltr"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50 text-base font-bold shadow-elevated"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'login' ? (
              'تسجيل الدخول'
            ) : (
              'إنشاء حساب جديد'
            )}
          </button>
        </form>
      </div>

      <p className="mt-8 text-sm text-muted-foreground animate-fade-in text-center max-w-xs relative z-10" style={{ animationDelay: '0.3s' }}>
        بالمتابعة، أنت توافق على{' '}
        <span className="text-primary hover:underline cursor-pointer">شروط الاستخدام</span>
        {' '}و{' '}
        <span className="text-primary hover:underline cursor-pointer">سياسة الخصوصية</span>
      </p>
    </div>
  );
}
