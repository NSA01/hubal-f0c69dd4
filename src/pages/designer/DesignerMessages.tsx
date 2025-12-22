import { ConversationsList } from '@/components/ConversationsList';

export default function DesignerMessages() {
  return <ConversationsList basePath="/designer" userRole="designer" />;
}
