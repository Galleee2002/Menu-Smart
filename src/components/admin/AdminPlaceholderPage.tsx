import { AdminSection } from './AdminSection';

interface AdminPlaceholderPageProps {
  title: string;
  description?: string;
}

export function AdminPlaceholderPage({ title, description }: AdminPlaceholderPageProps) {
  return <AdminSection title={title} description={description} />;
}
