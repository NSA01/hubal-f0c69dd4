import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import { BottomNav } from '@/components/ui/BottomNav';
import { designers } from '@/data/mockData';
import { PROPERTY_TYPES, CITIES, BUDGET_RANGES } from '@/types';

export default function ServiceRequest() {
  const { designerId } = useParams<{ designerId: string }>();
  const navigate = useNavigate();
  
  const designer = designers.find((d) => d.id === designerId);
  
  const [formData, setFormData] = useState({
    propertyType: '' as keyof typeof PROPERTY_TYPES | '',
    city: '',
    budget: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!designer) {
    return (
      <div className="page-container flex items-center justify-center">
        <p className="text-muted-foreground">المصمم غير موجود</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.propertyType || !formData.city || !formData.budget || !formData.description) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast.success('تم إرسال الطلب بنجاح');
    navigate('/customer/requests');
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <Link to={`/customer/designer/${designerId}`} className="p-2 -mr-2">
          <ArrowRight className="w-6 h-6 text-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">طلب خدمة</h1>
          <p className="text-sm text-muted-foreground">
            {designer.businessName || designer.name}
          </p>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Type */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <label className="block text-sm font-medium text-foreground mb-3">
            نوع العقار
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(PROPERTY_TYPES) as [keyof typeof PROPERTY_TYPES, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({ ...formData, propertyType: key })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.propertyType === key
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card'
                  }`}
                >
                  <span className="font-medium text-foreground">{label}</span>
                  {formData.propertyType === key && (
                    <Check className="w-4 h-4 text-primary mx-auto mt-1" />
                  )}
                </button>
              )
            )}
          </div>
        </div>

        {/* City */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <label className="block text-sm font-medium text-foreground mb-2">
            المدينة
          </label>
          <select
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="input-field"
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
          <label className="block text-sm font-medium text-foreground mb-2">
            الميزانية المتوقعة
          </label>
          <select
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            className="input-field"
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
          <label className="block text-sm font-medium text-foreground mb-2">
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
        </div>

        {/* Submit Button */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-4 text-lg disabled:opacity-50"
          >
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </button>
        </div>
      </form>

      <BottomNav />
    </div>
  );
}
