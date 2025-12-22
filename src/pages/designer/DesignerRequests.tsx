import { useState } from 'react';
import { toast } from 'sonner';
import { BottomNav } from '@/components/ui/BottomNav';
import { RequestCard } from '@/components/RequestCard';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMyDesignerProfile } from '@/hooks/useDesigners';
import { useDesignerRequests, useUpdateRequestStatus } from '@/hooks/useServiceRequests';
import { Loader2 } from 'lucide-react';

export default function DesignerRequests() {
  const { user } = useAuthContext();
  const { data: designer, isLoading: loadingDesigner } = useMyDesignerProfile(user?.id);
  const { data: requests = [], isLoading: loadingRequests } = useDesignerRequests(designer?.id);
  const updateStatus = useUpdateRequestStatus();

  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all');

  const handleAccept = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'accepted' });
      toast.success('تم قبول الطلب');
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'rejected' });
      toast.info('تم رفض الطلب');
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

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
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">الطلبات</h1>
        <p className="text-muted-foreground mt-1">
          إدارة طلبات التصميم الواردة
        </p>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 animate-slide-up">
        {[
          { key: 'all', label: 'الكل' },
          { key: 'pending', label: 'قيد الانتظار' },
          { key: 'accepted', label: 'مقبولة' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === tab.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((request, idx) => (
            <div
              key={request.id}
              className="animate-slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <RequestCard
                request={{
                  id: request.id,
                  customerName: request.customer_name || 'عميل',
                  city: request.city,
                  propertyType: request.property_type,
                  budget: request.budget,
                  description: request.description || '',
                  status: request.status,
                  createdAt: request.created_at,
                }}
                showActions={request.status === 'pending'}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 animate-fade-in">
          <p className="text-muted-foreground">
            لا توجد طلبات في هذه الفئة
          </p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
