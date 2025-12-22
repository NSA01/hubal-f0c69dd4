import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/ui/BottomNav';
import { RequestCard } from '@/components/RequestCard';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCustomerRequests } from '@/hooks/useServiceRequests';
import { FileText, Loader2, Search } from 'lucide-react';

export default function CustomerRequests() {
  const { user } = useAuthContext();
  const { data: requests = [], isLoading } = useCustomerRequests(user?.id);

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
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">طلباتي</h1>
        <p className="text-muted-foreground mt-1">
          تتبع حالة طلباتك
        </p>
      </header>

      {/* Stats Summary */}
      {requests.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6 animate-slide-up">
          <div className="stat-card">
            <span className="text-2xl font-bold text-foreground">{requests.length}</span>
            <span className="text-xs text-muted-foreground">إجمالي</span>
          </div>
          <div className="stat-card">
            <span className="text-2xl font-bold text-warning">
              {requests.filter(r => r.status === 'pending').length}
            </span>
            <span className="text-xs text-muted-foreground">قيد الانتظار</span>
          </div>
          <div className="stat-card">
            <span className="text-2xl font-bold text-success">
              {requests.filter(r => r.status === 'accepted').length}
            </span>
            <span className="text-xs text-muted-foreground">مقبول</span>
          </div>
        </div>
      )}

      {/* Requests List */}
      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request, idx) => (
            <div
              key={request.id}
              className="animate-slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <RequestCard 
                request={{
                  id: request.id,
                  designerName: request.designer_name || 'مصمم',
                  customerName: request.customer_name,
                  city: request.city,
                  propertyType: request.property_type,
                  budget: request.budget,
                  description: request.description || '',
                  status: request.status,
                  createdAt: request.created_at,
                }}
                variant="customer"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">
            لا توجد طلبات بعد
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            ابدأ بتصفح المصممين وأرسل طلبك الأول
          </p>
          <Link 
            to="/customer/designers" 
            className="btn-primary inline-flex items-center gap-2 px-6 py-3"
          >
            <Search className="w-4 h-4" />
            تصفح المصممين
          </Link>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
