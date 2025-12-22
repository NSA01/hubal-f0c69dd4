import { useState } from 'react';
import { toast } from 'sonner';
import { BottomNav } from '@/components/ui/BottomNav';
import { RequestCard } from '@/components/RequestCard';
import { serviceRequests } from '@/data/mockData';
import { ServiceRequest } from '@/types';

export default function DesignerRequests() {
  const [requests, setRequests] = useState<ServiceRequest[]>(
    serviceRequests.filter((r) => r.designerId === '1')
  );

  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all');

  const handleAccept = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'accepted' as const } : r))
    );
    toast.success('تم قبول الطلب');
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as const } : r))
    );
    toast.info('تم رفض الطلب');
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

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
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
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
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <RequestCard
                request={request}
                showActions
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
