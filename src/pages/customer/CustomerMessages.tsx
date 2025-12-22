import { ConversationsList } from '@/components/ConversationsList';

export default function CustomerMessages() {
  return <ConversationsList basePath="/customer" userRole="customer" />;
}
