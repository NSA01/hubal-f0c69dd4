import { useAuthContext } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/ui/BottomNav';
import { FileText, CheckCircle, Clock, Star, Loader2 } from 'lucide-react';
import { useMyDesignerProfile } from '@/hooks/useDesigners';
import { useDesignerRequests } from '@/hooks/useServiceRequests';

export default function DesignerDashboard() {
  const { user } = useAuthContext();
  const { data: designer, isLoading: loadingDesigner } = useMyDesignerProfile(user?.id);
  const { data: requests = [], isLoading: loadingRequests } = useDesignerRequests(designer?.id);
  
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const activeCount = requests.filter((r) => r.status === 'accepted').length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;

  const stats = [
    {
      icon: Clock,
      label: 'طلبات جديدة',
      value: pendingCount,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      icon: FileText,
      label: 'طلبات نشطة',
      value: activeCount,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: CheckCircle,
      label: 'مشاريع مكتملة',
      value: completedCount,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: Star,
      label: 'متوسط التقييم',
      value: designer?.rating ? Number(designer.rating).toFixed(1) : '0',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  const isLoading = loadingDesigner || loadingRequests;

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
        <p className="text-muted-foreground mb-1">مرحبًا،</p>
        <h1 className="text-2xl font-bold text-foreground">
          {user?.user_metadata?.name || designer?.business_name || user?.email?.split('@')[0]}
        </h1>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={stat.label}
            className="stat-card animate-scale-in"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <span className="text-2xl font-bold text-foreground">
              {stat.value}
            </span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Quick Actions */}
      {pendingCount > 0 && (
        <section className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="section-title">إجراءات سريعة</h2>
          <div className="card-premium p-4 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">
                  لديك {pendingCount} طلبات جديدة
                </h4>
                <p className="text-sm text-muted-foreground">
                  راجعها واتخذ إجراءً
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Activity */}
      {requests.length > 0 && (
        <section className="mt-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="section-title">النشاط الأخير</h2>
          <div className="card-premium p-4">
            <div className="space-y-4">
              {requests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    request.status === 'pending' ? 'bg-warning' :
                    request.status === 'accepted' ? 'bg-primary' :
                    request.status === 'completed' ? 'bg-success' : 'bg-muted'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      طلب جديد من {request.customer_name || 'عميل'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {request.city} - {new Date(request.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <BottomNav />
    </div>
  );
}
