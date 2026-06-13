import {
  AdminThemePageError,
  AdminThemePageLoading,
  AdminThemePageReady,
} from './AdminThemePageSections';
import { useAdminThemePage } from './useAdminThemePage';

export function AdminThemePage() {
  const viewModel = useAdminThemePage();
  const { status, loadError, loadTheme } = viewModel;

  if (status === 'loading') {
    return <AdminThemePageLoading />;
  }

  if (status === 'error') {
    return (
      <AdminThemePageError loadError={loadError} onRetry={() => void loadTheme()} />
    );
  }

  return <AdminThemePageReady viewModel={viewModel} />;
}
