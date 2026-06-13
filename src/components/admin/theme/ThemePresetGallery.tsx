import { THEME_PRESET_OPTIONS, THEME_PRESETS, type ThemePresetId } from '../../../lib/theme-presets';
import styles from './ThemePresetGallery.module.scss';

interface ThemePresetGalleryProps {
  activePreset: ThemePresetId | null;
  disabled?: boolean;
  onSelect: (presetId: ThemePresetId) => void;
}

export function ThemePresetGallery({
  activePreset,
  disabled = false,
  onSelect,
}: ThemePresetGalleryProps) {
  return (
    <div className={styles.gallery} role="list" aria-label="Presets de apariencia">
      {THEME_PRESET_OPTIONS.map((preset) => {
        const isActive = activePreset === preset.id;
        const colors = THEME_PRESETS[preset.id];

        return (
          <button
            key={preset.id}
            type="button"
            role="listitem"
            className={[styles.card, isActive ? styles.active : ''].filter(Boolean).join(' ')}
            disabled={disabled}
            aria-pressed={isActive}
            onClick={() => onSelect(preset.id)}
          >
            <span className={styles.swatches} aria-hidden>
              <span className={styles.swatch} style={{ backgroundColor: colors.backgroundColor }} />
              <span className={styles.swatch} style={{ backgroundColor: colors.primaryColor }} />
              <span className={styles.swatch} style={{ backgroundColor: colors.accentColor }} />
              <span className={styles.swatch} style={{ backgroundColor: colors.textColor }} />
              <span className={styles.swatch} style={{ backgroundColor: colors.secondaryColor }} />
            </span>
            <span className={styles.cardBody}>
              <span className={styles.cardTitle}>{preset.name}</span>
              <span className={styles.cardDescription}>{preset.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
