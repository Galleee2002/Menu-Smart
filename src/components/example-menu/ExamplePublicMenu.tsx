import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Clock, MapPin } from 'lucide-react';
import {
  EXAMPLE_CATEGORIES,
  EXAMPLE_PRODUCTS,
  EXAMPLE_RESTAURANT,
  type ExampleCategory,
} from '../../lib/example-menu-data';
import { ExampleProductCard } from './ExampleProductCard';
import styles from './ExamplePublicMenu.module.scss';

const CATEGORY_BAR_HEIGHT = 40;

interface ExamplePublicMenuProps {
  stickyOffset?: number;
}

export function ExamplePublicMenu({ stickyOffset = 0 }: ExamplePublicMenuProps) {
  const headerRef = useRef<HTMLElement>(null);
  const sectionRefs = useRef<Map<ExampleCategory, HTMLElement>>(new Map());

  const [headerHeight, setHeaderHeight] = useState(0);
  const [activeCategory, setActiveCategory] = useState<ExampleCategory>(EXAMPLE_CATEGORIES[0]);

  const productsByCategory = useMemo(() => {
    const grouped = new Map<ExampleCategory, typeof EXAMPLE_PRODUCTS>();

    for (const category of EXAMPLE_CATEGORIES) {
      grouped.set(
        category,
        EXAMPLE_PRODUCTS.filter((product) => product.category === category),
      );
    }

    return grouped;
  }, []);

  const activeCategories = EXAMPLE_CATEGORIES.filter(
    (category) => (productsByCategory.get(category)?.length ?? 0) > 0,
  );

  const updateActiveCategory = useCallback(() => {
    if (headerHeight === 0 || activeCategories.length === 0) {
      return;
    }

    const anchor = stickyOffset + headerHeight + CATEGORY_BAR_HEIGHT;
    let nextCategory = activeCategories[0];
    let matched = false;

    for (let index = activeCategories.length - 1; index >= 0; index -= 1) {
      const category = activeCategories[index];
      const section = sectionRefs.current.get(category);
      if (!section) {
        continue;
      }

      const { top, bottom } = section.getBoundingClientRect();
      if (top <= anchor + 4 && bottom > anchor + 4) {
        nextCategory = category;
        matched = true;
        break;
      }
    }

    if (!matched) {
      activeCategories.forEach((category) => {
        const section = sectionRefs.current.get(category);
        if (!section) {
          return;
        }

        if (section.getBoundingClientRect().top <= anchor + 4) {
          nextCategory = category;
        }
      });
    }

    setActiveCategory((prev) => (prev === nextCategory ? prev : nextCategory));
  }, [activeCategories, headerHeight, stickyOffset]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return;
    }

    const measure = () => setHeaderHeight(header.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(header);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    updateActiveCategory();
    window.addEventListener('scroll', updateActiveCategory, { passive: true });
    window.addEventListener('resize', updateActiveCategory);

    return () => {
      window.removeEventListener('scroll', updateActiveCategory);
      window.removeEventListener('resize', updateActiveCategory);
    };
  }, [updateActiveCategory]);

  const setSectionRef = useCallback((category: ExampleCategory, node: HTMLElement | null) => {
    if (node) {
      sectionRefs.current.set(category, node);
    } else {
      sectionRefs.current.delete(category);
    }
  }, []);

  const cssVars = {
    '--sticky-offset': `${stickyOffset}px`,
    '--restaurant-header-height': `${headerHeight}px`,
    '--category-bar-height': `${CATEGORY_BAR_HEIGHT}px`,
  } as CSSProperties;

  return (
    <div className={styles.menu} style={cssVars}>
      <header ref={headerRef} className={styles.header}>
        <h1 className={styles.name}>{EXAMPLE_RESTAURANT.name}</h1>
        <p className={styles.subtitle}>{EXAMPLE_RESTAURANT.subtitle}</p>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <Clock size={13} aria-hidden />
            {EXAMPLE_RESTAURANT.hours}
          </span>
          <span className={styles.metaItem}>
            <MapPin size={13} aria-hidden />
            {EXAMPLE_RESTAURANT.location}
          </span>
        </div>
      </header>

      <div className={styles.categoryBar}>
        <h2 key={activeCategory} className={styles.categoryTitle}>
          {activeCategory}
        </h2>
      </div>

      <div className={styles.catalog}>
        {activeCategories.map((category) => {
          const products = productsByCategory.get(category) ?? [];

          return (
            <section
              key={category}
              ref={(node) => setSectionRef(category, node)}
              className={styles.categorySection}
              aria-label={category}
            >
              <div className={styles.productList}>
                {products.map((product, productIndex) => (
                  <ExampleProductCard
                    key={product.id}
                    product={product}
                    isLast={productIndex === products.length - 1}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
