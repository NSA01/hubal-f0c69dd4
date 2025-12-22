import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Loader2, Home, Building2, Store } from 'lucide-react';
import { toast } from 'sonner';
import { BottomNav } from '@/components/ui/BottomNav';
import { useDesigner } from '@/hooks/useDesigners';
import { useCreateServiceRequest } from '@/hooks/useServiceRequests';
import { useAuthContext } from '@/contexts/AuthContext';
import { PROPERTY_TYPES, CITIES, BUDGET_RANGES, PropertyTypeKey } from '@/types';

const propertyIcons: Record<string, typeof Home> = {
  apartment: Home,
  villa: Building2,
  commercial: Store,
};

export default function ServiceRequest() {
  const { designerId } = useParams<{ designerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  const { data: designer, isLoading } = useDesigner(designerId || '');
  const createRequest = useCreateServiceRequest();
  const [formData, setFormData] = useState({
    propertyType: '' as PropertyTypeKey | '',
    city: '',
    budget: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="page-container flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">المصمم غير موجود</p>
        <Link to="/customer/designers" className="btn-primary px-6 py-2">
          تصفح المصممين
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.propertyType || !formData.city || !formData.budget || !formData.description) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createRequest.mutateAsync({
        designer_id: designer.id,
        property_type: formData.propertyType,
        city: formData.city,
        budget: Number(formData.budget),
        description: formData.description,
      });
      
      toast.success('تم إرسال الطلب بنجاح');
      navigate('/customer/requests');
    } catch (error) {
      toast.error('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <Link to={`/customer/designer/${designerId}`} className="p-2 -mr-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowRight className="w-6 h-6 text-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">طلب خدمة</h1>
          <p className="text-sm text-muted-foreground">
            {designer.business_name || designer.name}
          </p>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Type */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <label className="block text-sm font-semibold text-foreground mb-3">
            نوع العقار
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(PROPERTY_TYPES) as [PropertyTypeKey, string][]).map(
              ([key, label]) => {
                const Icon = propertyIcons[key] || Home;
                const isSelected = formData.propertyType === key;
                
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, propertyType: key })}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`font-medium text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {label}
                    </span>
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* City */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <label className="block text-sm font-semibold text-foreground mb-2">
            المدينة
          </label>
          <select
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="input-field cursor-pointer"
          >
            <option value="">اختر المدينة</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <label className="block text-sm font-semibold text-foreground mb-2">
            الميزانية المتوقعة
          </label>
          <select
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            className="input-field cursor-pointer"
          >
            <option value="">اختر نطاق الميزانية</option>
            {BUDGET_RANGES.map((range, idx) => (
              <option key={idx} value={range.min}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <label className="block text-sm font-semibold text-foreground mb-2">
            وصف المشروع
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="صف مشروعك ومتطلباتك بالتفصيل..."
            rows={5}
            className="input-field resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            كلما كان الوصف أكثر تفصيلاً، كلما كان التواصل أسهل
          </p>
        </div>

        {/* Submit Button */}
        <div className="animate-slide-up pt-2" style={{ animationDelay: '0.3s' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-4 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              'إرسال الطلب'
            )}
          </button>
        </div>
      </form>

      <BottomNav />
    </div>
  );
}
