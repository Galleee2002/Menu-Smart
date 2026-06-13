import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Utensils } from 'lucide-react';
import {
  EXAMPLE_CATEGORIES,
  EXAMPLE_PRODUCTS,
  EXAMPLE_RESTAURANT,
  type ExampleCategory,
} from '../../lib/example-menu-data';
import { ExampleProductCard } from './ExampleProductCard';
import styles from './ExamplePublicMenu.module.scss';

const CATEGORY_BAR_HEIGHT = 40;

function useLazyMapRef<K, V>() {
  const ref = useRef<Map<K, V> | null>(null);

  if (ref.current === null) {
    ref.current = new Map();
  }

  return ref;
}

interface ExamplePublicMenuProps {
  stickyOffset?: number;
}

export function ExamplePublicMenu({ stickyOffset = 0 }: ExamplePublicMenuProps) {
  const stickyShellRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useLazyMapRef<ExampleCategory, HTMLElement>();
  const sectionTitleRefs = useLazyMapRef<ExampleCategory, HTMLElement>();

  const stickyShellHeightRef = useRef(0);
  const [activeCategory, setActiveCategory] = useState<ExampleCategory>(EXAMPLE_CATEGORIES[0]);
  const [concealedSectionTitles, setConcealedSectionTitles] = useState<ReadonlySet<ExampleCategory>>(
    () => new Set(),
  );

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
    const stickyShellHeight = stickyShellHeightRef.current;

    if (stickyShellHeight === 0 || activeCategories.length === 0) {
      return;
    }

    const anchor = stickyOffset + stickyShellHeight;
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

    const concealed = new Set<ExampleCategory>();
    for (const category of activeCategories) {
      const title = sectionTitleRefs.current.get(category);
      if (title && title.getBoundingClientRect().top <= anchor + 1) {
        concealed.add(category);
      }
    }

    setConcealedSectionTitles((prev) => {
      if (prev.size === concealed.size && activeCategories.every((category) => prev.has(category) === concealed.has(category))) {
        return prev;
      }

      return concealed;
    });
  }, [activeCategories, stickyOffset, sectionRefs, sectionTitleRefs]);

  const updateActiveCategoryRef = useRef(updateActiveCategory);
  updateActiveCategoryRef.current = updateActiveCategory;

  useEffect(() => {
    const stickyShell = stickyShellRef.current;
    if (!stickyShell) {
      return;
    }

    const measure = () => {
      stickyShellHeightRef.current = stickyShell.offsetHeight;
      updateActiveCategoryRef.current();
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(stickyShell);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleUpdate = () => updateActiveCategoryRef.current();

    handleUpdate();
    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, []);

  const setSectionRef = useCallback((category: ExampleCategory, node: HTMLElement | null) => {
    if (node) {
      sectionRefs.current.set(category, node);
    } else {
      sectionRefs.current.delete(category);
    }
  }, [sectionRefs]);

  const setSectionTitleRef = useCallback((category: ExampleCategory, node: HTMLElement | null) => {
    if (node) {
      sectionTitleRefs.current.set(category, node);
    } else {
      sectionTitleRefs.current.delete(category);
    }
  }, [sectionTitleRefs]);

  const showCategoryInBar = concealedSectionTitles.has(activeCategory);

  const cssVars = {
    '--sticky-offset': `${stickyOffset}px`,
    '--category-bar-height': `${CATEGORY_BAR_HEIGHT}px`,
  } as CSSProperties;

  return (
    <div className={styles.menu} style={cssVars}>
      <div ref={stickyShellRef} className={styles.stickyShell}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.logo} aria-hidden>
              <Utensils size={20} strokeWidth={2.25} />
            </span>
            <h1 className={styles.name}>{EXAMPLE_RESTAURANT.name}</h1>
          </div>
        </header>

        <div className={styles.categoryBar}>
          <h2
            key={activeCategory}
            className={[styles.categoryTitle, !showCategoryInBar ? styles.categoryTitleHidden : '']
              .filter(Boolean)
              .join(' ')}
            aria-hidden={!showCategoryInBar}
          >
            {activeCategory}
          </h2>
        </div>
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
              <h2
                ref={(node) => setSectionTitleRef(category, node)}
                className={[
                  styles.sectionTitle,
                  concealedSectionTitles.has(category) ? styles.sectionTitleConcealed : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden={concealedSectionTitles.has(category)}
              >
                {category}
              </h2>
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
