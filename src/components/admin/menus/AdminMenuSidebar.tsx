import { BookOpen, ExternalLink, Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { createMenu, type Menu } from '../../../lib/admin-api';
import formStyles from '../admin-form.module.scss';
import sharedStyles from './admin-menus-shared.module.scss';
import styles from './AdminMenuSidebar.module.scss';

interface AdminMenuSidebarProps {
  menus: Menu[];
  selectedMenuId: string | null;
  restaurantSlug: string;
  canEdit: boolean;
  onSelect: (menuId: string) => void;
  onCreated: (menu: Menu) => void;
  onError: (message: string) => void;
}

export function AdminMenuSidebar({
  menus,
  selectedMenuId,
  restaurantSlug,
  canEdit,
  onSelect,
  onCreated,
  onError,
}: AdminMenuSidebarProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = newName.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      onError('El nombre debe tener entre 2 y 100 caracteres.');
      return;
    }

    setCreating(true);

    const result = await createMenu({ name: trimmedName });

    if (!result.ok) {
      onError(result.message);
      setCreating(false);
      return;
    }

    setNewName('');
    setShowCreate(false);
    setCreating(false);
    onCreated(result.data);
  };

  return (
    <aside className={styles.sidebar} aria-label="Lista de menús">
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Cartas</h2>
        {canEdit ? (
          <button
            type="button"
            className={formStyles.secondaryButton}
            onClick={() => setShowCreate((current) => !current)}
            aria-expanded={showCreate}
          >
            <Plus size={14} strokeWidth={2.25} aria-hidden />
            Nuevo
          </button>
        ) : null}
      </div>

      <div className={styles.sidebarBody}>
        {showCreate && canEdit ? (
          <form className={styles.createForm} onSubmit={handleCreate} noValidate>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="new-menu-name">
                Nombre del menú
              </label>
              <input
                id="new-menu-name"
                className={formStyles.input}
                type="text"
                value={newName}
                placeholder="Ej. Carta principal"
                disabled={creating}
                onChange={(event) => setNewName(event.target.value)}
              />
            </div>
            <button className={formStyles.submit} type="submit" disabled={creating}>
              {creating ? 'Creando…' : 'Crear menú'}
            </button>
          </form>
        ) : null}

        {menus.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden>
              <BookOpen size={20} strokeWidth={2} />
            </span>
            <p className={styles.emptyTitle}>Sin cartas todavía</p>
            <p className={styles.emptyDescription}>
              Pulsa <strong>Nuevo</strong> para crear la primera carta de tu restaurante.
            </p>
          </div>
        ) : (
          <ul className={styles.menuList}>
            {menus.map((menu) => {
              const isSelected = menu.id === selectedMenuId;
              const previewHref = `/menu/${restaurantSlug}/${menu.slug}`;

              return (
                <li key={menu.id}>
                  <button
                    type="button"
                    className={isSelected ? styles.menuItemActive : styles.menuItem}
                    aria-current={isSelected ? 'true' : undefined}
                    onClick={() => onSelect(menu.id)}
                  >
                    <span className={styles.menuItemName}>{menu.name}</span>
                    <span
                      className={
                        menu.isPublished ? sharedStyles.badgePublished : sharedStyles.badgeDraft
                      }
                    >
                      {menu.isPublished ? 'Publicado' : 'Borrador'}
                    </span>
                  </button>
                  {isSelected && menu.isPublished ? (
                    <a
                      className={styles.previewLink}
                      href={previewHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={12} strokeWidth={2.25} aria-hidden />
                      Ver carta
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
