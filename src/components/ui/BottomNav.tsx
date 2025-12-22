import { Link, useLocation } from 'react-router-dom';
import { Home, Search, FileText, User, LayoutGrid, MessageSquare, Star } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const customerNavItems = [
  { icon: Home, label: 'الرئيسية', path: '/customer' },
  { icon: Search, label: 'المصممين', path: '/customer/designers' },
  { icon: FileText, label: 'طلباتي', path: '/customer/requests' },
  { icon: User, label: 'حسابي', path: '/customer/profile' },
];

const designerNavItems = [
  { icon: LayoutGrid, label: 'لوحة التحكم', path: '/designer' },
  { icon: MessageSquare, label: 'الطلبات', path: '/designer/requests' },
  { icon: Star, label: 'التقييمات', path: '/designer/reviews' },
  { icon: User, label: 'ملفي', path: '/designer/profile' },
];

export function BottomNav() {
  const location = useLocation();
  const { role } = useAuthStore();
  
  const navItems = role === 'designer' ? designerNavItems : customerNavItems;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-pb">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
