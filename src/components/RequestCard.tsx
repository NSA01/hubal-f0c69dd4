import { MapPin, Home, Building2, Store, Calendar } from 'lucide-react';
import { ServiceRequest, PROPERTY_TYPES } from '@/types';

interface RequestCardProps {
  request: ServiceRequest;
  showActions?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

const propertyIcons: Record<string, typeof Home> = {
  apartment: Home,
  villa: Building2,
  commercial: Store,
  شقة: Home,
  فيلا: Building2,
  تجاري: Store,
};

const statusStyles: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  accepted: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  completed: 'bg-primary/10 text-primary',
  cancelled: 'bg-muted text-muted-foreground',
};

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  accepted: 'مقبول',
  rejected: 'مرفوض',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export function RequestCard({ request, showActions = false, onAccept, onReject }: RequestCardProps) {
  const PropertyIcon = propertyIcons[request.propertyType] || Home;
  
  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('ar-SA').format(budget) + ' ر.س';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="card-premium p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-foreground">{request.customerName}</h4>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(request.createdAt)}</span>
          </div>
        </div>
        <span className={`badge-status ${statusStyles[request.status] || statusStyles.pending}`}>
          {statusLabels[request.status] || request.status}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <PropertyIcon className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">نوع العقار:</span>
          <span className="font-medium text-foreground">
            {PROPERTY_TYPES[request.propertyType] || request.propertyType}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">المدينة:</span>
          <span className="font-medium text-foreground">{request.city}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="chip chip-primary">{formatBudget(request.budget)}</span>
        </div>
      </div>

      {/* Description */}
      {request.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {request.description}
        </p>
      )}

      {/* Actions */}
      {showActions && request.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={() => onAccept?.(request.id)}
            className="flex-1 btn-primary py-2 text-sm"
          >
            قبول
          </button>
          <button
            onClick={() => onReject?.(request.id)}
            className="flex-1 btn-secondary py-2 text-sm"
          >
            رفض
          </button>
        </div>
      )}
    </div>
  );
}
