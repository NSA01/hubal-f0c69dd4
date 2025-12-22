import { useAuthStore } from '@/store/authStore';
import { BottomNav } from '@/components/ui/BottomNav';
import { FileText, CheckCircle, Clock, Star } from 'lucide-react';
import { serviceRequests, designers } from '@/data/mockData';

export default function DesignerDashboard() {
  const { user } = useAuthStore();
  
  // Get designer's stats
  const designerRequests = serviceRequests.filter((r) => r.designerId === '1');
  const pendingCount = designerRequests.filter((r) => r.status === 'pending').length;
  const activeCount = designerRequests.filter((r) => r.status === 'accepted').length;
  const completedCount = designerRequests.filter((r) => r.status === 'completed').length;
  
  const designer = designers[0];

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
      value: designer.rating,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <header className="mb-8 animate-fade-in">
        <p className="text-muted-foreground mb-1">مرحبًا،</p>
        <h1 className="text-2xl font-bold text-foreground">
          {user?.name || designer.name}
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
      <section className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <h2 className="section-title">إجراءات سريعة</h2>
        <div className="space-y-3">
          <div className="card-premium p-4 bg-primary/5">
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
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mt-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <h2 className="section-title">النشاط الأخير</h2>
        <div className="card-premium p-4">
          <div className="space-y-4">
            {designerRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    طلب جديد من {request.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.city} - {new Date(request.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
