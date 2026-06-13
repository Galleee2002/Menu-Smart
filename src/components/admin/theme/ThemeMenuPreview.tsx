import type { CSSProperties } from 'react';
import type { ThemeFormState } from '../admin-theme-page.state';
import styles from './ThemeMenuPreview.module.scss';

const PREVIEW_PRODUCTS = [
  {
    id: 'preview-1',
    name: 'Bruschetta al pomodoro',
    description: 'Pan tostado con tomate fresco, albahaca y aceite de oliva.',
    price: '$8.500',
    available: true,
  },
  {
    id: 'preview-2',
    name: 'Risotto ai funghi',
    description: 'Arroz cremoso con hongos de estación y parmesano.',
    price: '$14.200',
    available: true,
  },
  {
    id: 'preview-3',
    name: 'Tiramisú',
    description: 'Postre clásico con mascarpone y café espresso.',
    price: '$6.800',
    available: false,
  },
] as const;

interface ThemeMenuPreviewProps {
  theme: ThemeFormState;
  restaurantName: string;
}

function buildPreviewStyle(theme: ThemeFormState): CSSProperties {
  return {
    '--preview-bg': theme.backgroundColor,
    '--preview-surface': theme.backgroundColor,
    '--preview-muted': theme.secondaryColor,
    '--preview-text': theme.textColor,
    '--preview-text-muted': theme.secondaryColor,
    '--preview-border': theme.secondaryColor,
    '--preview-primary': theme.primaryColor,
    '--preview-price': theme.accentColor,
    '--preview-font-body': theme.fontFamily,
    '--preview-font-heading': theme.fontFamily,
  } as CSSProperties;
}

export function ThemeMenuPreview({ theme, restaurantName }: ThemeMenuPreviewProps) {
  return (
    <div className={styles.frame} style={buildPreviewStyle(theme)}>
      <div className={styles.menu}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Vista previa</p>
          <h2 className={styles.restaurantName}>{restaurantName}</h2>
          <p className={styles.subtitle}>Así verán tu carta los clientes</p>
        </header>

        <div className={styles.categoryBar}>
          <span className={styles.categoryTitle}>Entradas</span>
        </div>

        <div className={styles.productList}>
          {PREVIEW_PRODUCTS.map((product, index) => (
            <article
              key={product.id}
              className={[
                styles.productRow,
                !product.available ? styles.unavailable : '',
                index === PREVIEW_PRODUCTS.length - 1 ? styles.last : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles.productContent}>
                <div className={styles.nameRow}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  {!product.available ? (
                    <span className={styles.unavailableTag}>no disponible</span>
                  ) : null}
                </div>
                <p className={styles.productDescription}>{product.description}</p>
              </div>
              <span className={styles.productPrice}>{product.price}</span>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
