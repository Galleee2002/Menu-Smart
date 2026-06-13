import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_EXAMPLE_THEME_ID,
  EXAMPLE_THEME_STORAGE_KEY,
  isExampleMenuThemeId,
  type ExampleMenuThemeId,
} from '../../lib/example-menu-themes';
import { ExamplePublicMenu } from './ExamplePublicMenu';
import { ExampleThemeToggle } from './ExampleThemeToggle';
import styles from './ExampleMenuDemo.module.scss';

function readStoredTheme(): ExampleMenuThemeId {
  if (typeof window === 'undefined') {
    return DEFAULT_EXAMPLE_THEME_ID;
  }

  const stored = localStorage.getItem(EXAMPLE_THEME_STORAGE_KEY);
  if (isExampleMenuThemeId(stored)) {
    return stored;
  }

  return DEFAULT_EXAMPLE_THEME_ID;
}

export function ExampleMenuDemo() {
  const observerRef = useRef<ResizeObserver | null>(null);
  const [themeId, setThemeId] = useState<ExampleMenuThemeId>(() => readStoredTheme());
  const [toolbarHeight, setToolbarHeight] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-example-theme', themeId);
  }, [themeId]);

  const setToolbarRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!node) {
      setToolbarHeight(0);
      return;
    }

    const measure = () => setToolbarHeight(node.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  const handleThemeChange = useCallback((nextThemeId: ExampleMenuThemeId) => {
    setThemeId(nextThemeId);
    localStorage.setItem(EXAMPLE_THEME_STORAGE_KEY, nextThemeId);
    document.documentElement.setAttribute('data-example-theme', nextThemeId);
  }, []);

  return (
    <div className={styles.page}>
      <div ref={setToolbarRef} className={styles.toolbar}>
        <span className={styles.label}>Vista de ejemplo</span>
        <ExampleThemeToggle themeId={themeId} onThemeChange={handleThemeChange} />
      </div>

      <ExamplePublicMenu stickyOffset={toolbarHeight} />
    </div>
  );
}
