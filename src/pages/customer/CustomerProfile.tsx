import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Mail, LogOut, ChevronLeft, Phone, Edit3, Loader2, Camera } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { BottomNav } from '@/components/ui/BottomNav';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CITIES } from '@/types';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const { data: profile, isLoading } = useProfile(user?.id);
  const updateProfile = useUpdateProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const startEditing = () => {
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      city: profile?.city || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: {
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
        },
      });
      toast.success('تم حفظ التغييرات');
      setIsEditing(false);
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار صورة صالحة');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('designer-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('designer-images')
        .getPublicUrl(fileName);

      await updateProfile.mutateAsync({
        userId: user.id,
        updates: { avatar_url: publicUrl },
      });

      toast.success('تم تحديث الصورة');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('حدث خطأ أثناء رفع الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">حسابي</h1>
      </header>

      {/* Profile Card */}
      <div className="card-premium p-6 mb-6 animate-slide-up">
        <div className="flex items-center gap-4">
          {/* Avatar with upload */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-primary" />
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors">
              {isUploading ? (
                <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-primary-foreground" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {profile?.name || user?.email?.split('@')[0]}
            </h2>
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{user?.email}</span>
            </div>
            {profile?.city && (
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{profile.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form or Menu */}
      {isEditing ? (
        <div className="card-premium p-6 mb-6 animate-slide-up space-y-4">
          <h3 className="font-bold text-foreground mb-4">تعديل البيانات</h3>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">الاسم</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="أدخل اسمك"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">رقم الجوال</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field"
              placeholder="05xxxxxxxx"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">المدينة</label>
            <select
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="input-field cursor-pointer"
            >
              <option value="">اختر المدينة</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="flex-1 btn-primary py-3"
            >
              {updateProfile.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 btn-secondary py-3"
            >
              إلغاء
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          <button
            onClick={startEditing}
            className="w-full card-premium p-4 flex items-center justify-between animate-slide-up"
          >
            <div className="flex items-center gap-3">
              <Edit3 className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">تعديل الملف الشخصي</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>

          {profile?.phone && (
            <div className="card-premium p-4 flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <Phone className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">{profile.phone}</span>
            </div>
          )}
        </div>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full btn-secondary flex items-center justify-center gap-2 text-destructive animate-slide-up"
        style={{ animationDelay: '0.3s' }}
      >
        <LogOut className="w-5 h-5" />
        <span>تسجيل الخروج</span>
      </button>

      <BottomNav />
    </div>
  );
}
