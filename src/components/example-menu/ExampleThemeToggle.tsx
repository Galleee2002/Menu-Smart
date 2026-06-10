import { EXAMPLE_MENU_THEMES, type ExampleMenuThemeId } from '../../lib/example-menu-themes';
import styles from './ExampleThemeToggle.module.scss';

interface ExampleThemeToggleProps {
  themeId: ExampleMenuThemeId;
  onThemeChange: (themeId: ExampleMenuThemeId) => void;
}

export function ExampleThemeToggle({ themeId, onThemeChange }: ExampleThemeToggleProps) {
  return (
    <div className={styles.toggle} role="group" aria-label="Selector de estilo visual">
      {EXAMPLE_MENU_THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          className={[styles.option, themeId === theme.id ? styles.active : ''].filter(Boolean).join(' ')}
          onClick={() => onThemeChange(theme.id)}
          aria-pressed={themeId === theme.id}
          title={theme.description}
        >
          {theme.name}
        </button>
      ))}
    </div>
  );
}
