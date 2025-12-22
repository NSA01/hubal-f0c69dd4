import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, X, Camera } from 'lucide-react';
import { BottomNav } from '@/components/ui/BottomNav';
import { designers } from '@/data/mockData';
import { CITIES, BUDGET_RANGES } from '@/types';
import { useAuthStore } from '@/store/authStore';

export default function DesignerProfileEdit() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const designer = designers[0];

  const [formData, setFormData] = useState({
    name: designer.name,
    businessName: designer.businessName || '',
    city: designer.city,
    bio: designer.bio,
    budgetMin: designer.budgetMin,
    budgetMax: designer.budgetMax,
    services: designer.services,
  });

  const [newService, setNewService] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('تم حفظ التغييرات');
    setIsSaving(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="page-container pb-32">
      {/* Header */}
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">ملفي الشخصي</h1>
        <p className="text-muted-foreground mt-1">
          تعديل معلومات حسابك
        </p>
      </header>

      {/* Avatar Section */}
      <div className="flex justify-center mb-8 animate-scale-in">
        <div className="relative">
          <img
            src={designer.avatar}
            alt={designer.name}
            className="w-28 h-28 rounded-3xl object-cover border-4 border-primary/10"
          />
          <button className="absolute -bottom-2 -left-2 w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <Camera className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <label className="block text-sm font-medium text-foreground mb-2">
            الاسم
          </label>
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
          <label className="block text-sm font-medium text-foreground mb-2">
            المدينة
          </label>
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
          <label className="block text-sm font-medium text-foreground mb-2">
            نبذة عنك
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="input-field resize-none"
          />
        </div>

        {/* Budget Range */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <label className="block text-sm font-medium text-foreground mb-2">
            نطاق الميزانية
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">الحد الأدنى</label>
              <select
                value={formData.budgetMin}
                onChange={(e) =>
                  setFormData({ ...formData, budgetMin: Number(e.target.value) })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, budgetMax: Number(e.target.value) })
                }
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
            الخدمات
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.services.map((service) => (
              <div
                key={service}
                className="chip flex items-center gap-2"
              >
                <span>{service}</span>
                <button
                  onClick={() => handleRemoveService(service)}
                  className="text-muted-foreground hover:text-destructive"
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
            <button
              onClick={handleAddService}
              className="btn-secondary px-4"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Portfolio placeholder */}
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <label className="block text-sm font-medium text-foreground mb-2">
            معرض الأعمال
          </label>
          <div className="grid grid-cols-3 gap-2">
            {designer.portfolio.map((img, idx) => (
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
          onClick={handleSave}
          disabled={isSaving}
          className="w-full btn-primary py-4 disabled:opacity-50"
        >
          {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
        <button
          onClick={handleLogout}
          className="w-full btn-secondary py-3 text-destructive"
        >
          تسجيل الخروج
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
