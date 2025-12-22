import { Link, useLocation } from 'react-router-dom';
import { Home, Search, FileText, User, LayoutGrid, MessageSquare, Star, MessageCircle } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const customerNavItems = [
  { icon: Home, label: 'الرئيسية', path: '/customer' },
  { icon: Search, label: 'المصممين', path: '/customer/designers' },
  { icon: MessageCircle, label: 'الرسائل', path: '/customer/messages' },
  { icon: FileText, label: 'طلباتي', path: '/customer/requests' },
  { icon: User, label: 'حسابي', path: '/customer/profile' },
];

const designerNavItems = [
  { icon: LayoutGrid, label: 'لوحة التحكم', path: '/designer' },
  { icon: MessageSquare, label: 'الطلبات', path: '/designer/requests' },
  { icon: MessageCircle, label: 'الرسائل', path: '/designer/messages' },
  { icon: Star, label: 'التقييمات', path: '/designer/reviews' },
  { icon: User, label: 'ملفي', path: '/designer/profile' },
];

export function BottomNav() {
  const location = useLocation();
  const { role } = useAuthContext();
  
  const navItems = role === 'designer' ? designerNavItems : customerNavItems;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 safe-area-pb">
      <div className="flex justify-around items-center py-2 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path.includes('messages') && location.pathname.includes('chat'));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item flex-1 ${isActive ? 'active' : ''}`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
