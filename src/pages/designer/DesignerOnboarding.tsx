import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Building2, MapPin, FileText, Briefcase, Loader2, ChevronLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CITIES } from '@/types';

const SERVICES_OPTIONS = [
  'تصميم داخلي كامل',
  'تصميم غرف المعيشة',
  'تصميم غرف النوم',
  'تصميم المطابخ',
  'تصميم الحمامات',
  'تصميم المكاتب',
  'تصميم المحلات التجارية',
  'استشارات تصميمية',
];

export default function DesignerOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    city: 'الرياض',
    bio: '',
    services: [] as string[],
    minBudget: 5000,
    maxBudget: 50000,
  });

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    if (!formData.bio.trim()) {
      toast.error('يرجى كتابة نبذة تعريفية');
      return;
    }

    if (formData.services.length === 0) {
      toast.error('يرجى اختيار خدمة واحدة على الأقل');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('designers')
        .update({
          business_name: formData.businessName.trim() || null,
          city: formData.city,
          bio: formData.bio.trim(),
          services: formData.services,
          min_budget: formData.minBudget,
          max_budget: formData.maxBudget,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('تم حفظ ملفك الشخصي بنجاح');
      navigate('/designer');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('حدث خطأ في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.bio.trim().length >= 20;
    if (step === 2) return formData.services.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen px-6 py-8" style={{ background: 'var(--gradient-hero)' }}>
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Palette className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">أكمل ملفك الشخصي</h1>
        <p className="text-muted-foreground text-sm">
          عرّف نفسك للعملاء المحتملين
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8 max-w-sm mx-auto">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              s <= step ? 'bg-primary' : 'bg-secondary'
            }`}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="max-w-sm mx-auto">
        {step === 1 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Building2 className="w-4 h-4 inline ml-1" />
                اسم المكتب أو الشركة (اختياري)
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="مثال: استديو التصميم الإبداعي"
                className="input-field"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <MapPin className="w-4 h-4 inline ml-1" />
                المدينة
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="input-field"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <FileText className="w-4 h-4 inline ml-1" />
                نبذة تعريفية عنك *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="اكتب نبذة مختصرة عن خبرتك وأسلوبك في التصميم..."
                className="input-field min-h-[120px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.bio.length}/500 حرف (الحد الأدنى 20 حرف)
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                اختر الخدمات التي تقدمها *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {SERVICES_OPTIONS.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => handleServiceToggle(service)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium text-right transition-all ${
                      formData.services.includes(service)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-foreground hover:border-primary/30'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                تم اختيار {formData.services.length} خدمة
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                <Briefcase className="w-4 h-4 inline ml-1" />
                نطاق الميزانية (ر.س)
              </label>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">الحد الأدنى</label>
                  <input
                    type="number"
                    value={formData.minBudget}
                    onChange={(e) => setFormData(prev => ({ ...prev, minBudget: Number(e.target.value) }))}
                    className="input-field"
                    min={0}
                    step={1000}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">الحد الأقصى</label>
                  <input
                    type="number"
                    value={formData.maxBudget}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxBudget: Number(e.target.value) }))}
                    className="input-field"
                    min={formData.minBudget}
                    step={1000}
                  />
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-sm text-foreground">
                  نطاق ميزانيتك: {formData.minBudget.toLocaleString('ar-SA')} - {formData.maxBudget.toLocaleString('ar-SA')} ر.س
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              السابق
            </button>
          )}
          
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              التالي
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'حفظ والمتابعة'
              )}
            </button>
          )}
        </div>

        {/* Skip Option */}
        <button
          type="button"
          onClick={() => navigate('/designer')}
          className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          تخطي الآن وإكمال لاحقاً
        </button>
      </div>
    </div>
  );
}
