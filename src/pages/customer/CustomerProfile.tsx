import { useNavigate } from 'react-router-dom';
import { User, MapPin, Mail, LogOut, ChevronLeft } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/ui/BottomNav';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { icon: User, label: 'تعديل الملف الشخصي', action: () => {} },
    { icon: MapPin, label: 'العناوين المحفوظة', action: () => {} },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <header className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">حسابي</h1>
      </header>

      {/* Profile Card */}
      <div className="card-premium p-6 mb-6 animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{user?.user_metadata?.name || user?.email?.split('@')[0]}</h2>
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-3 mb-8">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            className="w-full card-premium p-4 flex items-center justify-between animate-slide-up"
            style={{ animationDelay: `${(idx + 1) * 0.1}s` }}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">{item.label}</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
      </div>

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
