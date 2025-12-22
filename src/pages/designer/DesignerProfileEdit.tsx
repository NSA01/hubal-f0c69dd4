import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, X, Camera, Check, Loader2 } from 'lucide-react';
import { BottomNav } from '@/components/ui/BottomNav';
import { CITIES, BUDGET_RANGES } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useMyDesignerProfile } from '@/hooks/useDesigners';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ProfileData {
  name: string;
  avatar_url: string | null;
}

export default function DesignerProfileEdit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const { data: designer, isLoading } = useMyDesignerProfile(user?.id);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    city: 'الرياض',
    bio: '',
    budgetMin: 5000,
    budgetMax: 50000,
    services: [] as string[],
  });

  const [newService, setNewService] = useState('');

  // Fetch profile data
  useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    }
  }, [user?.id]);

  // Populate form when designer data loads
  useEffect(() => {
    if (designer) {
      setFormData({
        name: profile?.name || '',
        businessName: designer.business_name || '',
        city: designer.city || 'الرياض',
        bio: designer.bio || '',
        budgetMin: designer.min_budget || 5000,
        budgetMax: designer.max_budget || 50000,
        services: designer.services || [],
      });
    }
  }, [designer, profile]);

  // Calculate profile completion percentage
  const completionPercentage = useMemo(() => {
    if (!designer) return 0;
    
    const fields = [
      { value: formData.name, weight: 15 },
      { value: formData.businessName, weight: 10 },
      { value: formData.city, weight: 10 },
      { value: formData.bio && formData.bio.length >= 20, weight: 20 },
      { value: formData.services.length >= 1, weight: 15 },
      { value: formData.services.length >= 3, weight: 10 },
      { value: profile?.avatar_url, weight: 10 },
      { value: designer.portfolio_images?.length >= 1, weight: 10 },
    ];

    const completed = fields.reduce((acc, field) => {
      return acc + (field.value ? field.weight : 0);
    }, 0);

    return Math.min(100, completed);
  }, [formData, designer, profile]);

  // Get completion status text and color
  const completionStatus = useMemo(() => {
    if (completionPercentage < 40) return { text: 'مبتدئ', color: 'text-destructive' };
    if (completionPercentage < 70) return { text: 'جيد', color: 'text-amber-500' };
    if (completionPercentage < 100) return { text: 'ممتاز', color: 'text-primary' };
    return { text: 'مكتمل', color: 'text-green-500' };
  }, [completionPercentage]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !designer?.id) throw new Error('لم يتم العثور على الحساب');

      // Update profile name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name: formData.name })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update designer data
      const { error: designerError } = await supabase
        .from('designers')
        .update({
          business_name: formData.businessName || null,
          city: formData.city,
          bio: formData.bio || null,
          min_budget: formData.budgetMin,
          max_budget: formData.budgetMax,
          services: formData.services,
        })
        .eq('id', designer.id);

      if (designerError) throw designerError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-designer-profile'] });
      toast.success('تم حفظ التغييرات بنجاح');
    },
    onError: (error) => {
      toast.error('حدث خطأ أثناء الحفظ');
      console.error(error);
    },
  });

  const handleAddService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData({
        ...formData,
        services: [...formData.services, newService.trim()],
      });
      setNewService('');
    }
  };

  const handleRemoveService = (service: string) => {
    setFormData({
      ...formData,
      services: formData.services.filter((s) => s !== service),
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">لم يتم العثور على ملف المصمم</p>
        <button onClick={() => navigate('/designer/onboarding')} className="btn-primary">
          إنشاء ملف شخصي
        </button>
      </div>
    );
  }

  return (
    <div className="page-container pb-32">
      {/* Header */}
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">ملفي الشخصي</h1>
        <p className="text-muted-foreground mt-1">تعديل معلومات حسابك</p>
      </header>

      {/* Profile Completion Card */}
      <div className="bg-card rounded-2xl p-5 border border-border mb-6 animate-scale-in">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">اكتمال الملف الشخصي</span>
          <span className={`text-sm font-bold ${completionStatus.color}`}>
            {completionStatus.text}
          </span>
        </div>
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            أكمل ملفك لجذب المزيد من العملاء
          </span>
          <span className="text-lg font-bold text-foreground">{completionPercentage}%</span>
        </div>

        {/* Completion Tips */}
        {completionPercentage < 100 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">نصائح لإكمال ملفك:</p>
            <div className="flex flex-wrap gap-2">
              {!formData.bio || formData.bio.length < 20 ? (
                <span className="text-xs bg-muted px-2 py-1 rounded-md">أضف نبذة تعريفية</span>
              ) : null}
              {formData.services.length < 3 ? (
                <span className="text-xs bg-muted px-2 py-1 rounded-md">أضف المزيد من الخدمات</span>
              ) : null}
              {!profile?.avatar_url ? (
                <span className="text-xs bg-muted px-2 py-1 rounded-md">أضف صورة شخصية</span>
              ) : null}
              {!designer.portfolio_images?.length ? (
                <span className="text-xs bg-muted px-2 py-1 rounded-md">أضف أعمال للمعرض</span>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Avatar Section */}
      <div className="flex justify-center mb-8 animate-scale-in">
        <div className="relative">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={formData.name}
              className="w-28 h-28 rounded-3xl object-cover border-4 border-primary/10"
            />
          ) : (
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border-4 border-primary/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {formData.name?.charAt(0) || 'م'}
              </span>
            </div>
          )}
          <button className="absolute -bottom-2 -left-2 w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
            <Camera className="w-5 h-5 text-primary-foreground" />
          </button>
          {completionPercentage === 100 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <label className="block text-sm font-medium text-foreground mb-2">الاسم</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
          />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <label className="block text-sm font-medium text-foreground mb-2">
            اسم المكتب / الشركة (اختياري)
          </label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            className="input-field"
            placeholder="مثال: استوديو التصميم"
          />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <label className="block text-sm font-medium text-foreground mb-2">المدينة</label>
          <select
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="input-field"
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <label className="block text-sm font-medium text-foreground mb-2">نبذة عنك</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="input-field resize-none"
            placeholder="اكتب نبذة عن خبراتك ومجالات تخصصك..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.bio.length}/20 حرف على الأقل
          </p>
        </div>

        {/* Budget Range */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <label className="block text-sm font-medium text-foreground mb-2">نطاق الميزانية</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">الحد الأدنى</label>
              <select
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: Number(e.target.value) })}
                className="input-field mt-1"
              >
                {BUDGET_RANGES.map((range) => (
                  <option key={range.min} value={range.min}>
                    {new Intl.NumberFormat('ar-SA').format(range.min)} ر.س
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">الحد الأقصى</label>
              <select
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: Number(e.target.value) })}
                className="input-field mt-1"
              >
                {BUDGET_RANGES.map((range) => (
                  <option key={range.max} value={range.max === Infinity ? 999999 : range.max}>
                    {range.max === Infinity
                      ? 'غير محدد'
                      : new Intl.NumberFormat('ar-SA').format(range.max) + ' ر.س'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <label className="block text-sm font-medium text-foreground mb-2">
            الخدمات ({formData.services.length})
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.services.map((service) => (
              <div key={service} className="chip flex items-center gap-2">
                <span>{service}</span>
                <button
                  onClick={() => handleRemoveService(service)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="أضف خدمة جديدة"
              className="input-field flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
            />
            <button onClick={handleAddService} className="btn-secondary px-4">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Portfolio */}
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <label className="block text-sm font-medium text-foreground mb-2">
            معرض الأعمال ({designer.portfolio_images?.length || 0})
          </label>
          <div className="grid grid-cols-3 gap-2">
            {designer.portfolio_images?.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`عمل ${idx + 1}`}
                className="w-full aspect-square object-cover rounded-xl"
              />
            ))}
            <button className="w-full aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-card hover:border-primary/50 transition-colors">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Save & Logout Buttons */}
      <div className="fixed bottom-20 left-4 right-4 z-40 space-y-3">
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full btn-primary py-4 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            'حفظ التغييرات'
          )}
        </button>
        <button onClick={handleLogout} className="w-full btn-secondary py-3 text-destructive">
          تسجيل الخروج
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
