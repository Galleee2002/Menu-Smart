import {
  AdminRestaurantPageError,
  AdminRestaurantPageLoading,
  AdminRestaurantPageReady,
} from './AdminRestaurantPageSections';
import { useAdminRestaurantPage } from './useAdminRestaurantPage';

export function AdminRestaurantPage() {
  const viewModel = useAdminRestaurantPage();
  const { status, loadError, restaurant, form, original, loadRestaurant } = viewModel;

  if (status === 'loading') {
    return <AdminRestaurantPageLoading />;
  }

  if (status === 'error' || !form || !original || !restaurant) {
    return (
      <AdminRestaurantPageError
        loadError={loadError}
        onRetry={() => void loadRestaurant()}
      />
    );
  }

  return (
    <AdminRestaurantPageReady viewModel={viewModel} restaurant={restaurant} form={form} />
  );
}
