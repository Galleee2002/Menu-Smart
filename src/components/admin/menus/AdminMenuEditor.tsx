import type { Category, Menu, MenuItem } from '../../../lib/admin-api';
import { AdminMenuEditorContent } from './AdminMenuEditorSections';
import { useAdminMenuEditor } from './useAdminMenuEditor';

interface AdminMenuEditorProps {
  menu: Menu;
  restaurantSlug: string;
  categories: Category[];
  items: MenuItem[];
  canEdit: boolean;
  isOwner: boolean;
  onMenuUpdated: (menu: Menu) => void;
  onMenuDeleted: () => void;
  onCategoriesChange: (categories: Category[]) => void;
  onItemsChange: (items: MenuItem[]) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onRefreshPreview: () => Promise<void>;
  onReloadMenuData: () => Promise<void>;
}

export function AdminMenuEditor(props: AdminMenuEditorProps) {
  const viewModel = useAdminMenuEditor(props);

  return <AdminMenuEditorContent menu={props.menu} viewModel={viewModel} />;
}
