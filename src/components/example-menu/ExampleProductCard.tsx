import { formatExamplePrice, type ExampleProduct } from '../../lib/example-menu-data';
import styles from './ExampleProductCard.module.scss';

interface ExampleProductCardProps {
  product: ExampleProduct;
  isLast?: boolean;
}

export function ExampleProductCard({ product, isLast = false }: ExampleProductCardProps) {
  return (
    <article
      className={[styles.row, !product.available ? styles.unavailable : '', isLast ? styles.last : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.content}>
        <div className={styles.nameRow}>
          <h3 className={styles.name}>{product.name}</h3>
          {!product.available ? (
            <span className={styles.unavailableTag}>no disponible</span>
          ) : null}
        </div>
        <p className={styles.description}>{product.description}</p>
      </div>
      <span className={styles.price}>{formatExamplePrice(product.price)}</span>
    </article>
  );
}
