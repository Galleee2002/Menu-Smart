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
      <div className={styles.rowMain}>
        <h3 className={styles.name}>{product.name}</h3>
        <span className={styles.price}>{formatExamplePrice(product.price)}</span>
      </div>
      <p className={styles.description}>
        {product.description}
        {!product.available ? <span className={styles.status}>No disponible</span> : null}
      </p>
    </article>
  );
}
