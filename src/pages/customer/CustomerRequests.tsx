import { BottomNav } from '@/components/ui/BottomNav';
import { RequestCard } from '@/components/RequestCard';
import { serviceRequests } from '@/data/mockData';
import { FileText } from 'lucide-react';

export default function CustomerRequests() {
  // Filter for current customer's requests
  const customerRequests = serviceRequests.filter((r) => r.customerId === 'c1');

  return (
    <div className="page-container">
      {/* Header */}
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">طلباتي</h1>
        <p className="text-muted-foreground mt-1">
          تتبع حالة طلباتك
        </p>
      </header>

      {/* Requests List */}
      {customerRequests.length > 0 ? (
        <div className="space-y-4">
          {customerRequests.map((request, idx) => (
            <div
              key={request.id}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <RequestCard request={request} />
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
          <p className="text-muted-foreground text-sm">
            ابدأ بتصفح المصممين وأرسل طلبك الأول
          </p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
