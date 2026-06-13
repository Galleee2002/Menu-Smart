import formStyles from '../admin-form.module.scss';
import type { FieldErrors, ThemeFieldKey, ThemeFormState } from '../admin-theme-page.state';
import styles from './ThemeColorEditor.module.scss';

const COLOR_FIELDS: Array<{ key: ThemeFieldKey; label: string }> = [
  { key: 'primaryColor', label: 'Color principal' },
  { key: 'secondaryColor', label: 'Color secundario' },
  { key: 'backgroundColor', label: 'Fondo' },
  { key: 'textColor', label: 'Texto' },
  { key: 'accentColor', label: 'Acento (precios)' },
];

interface ThemeColorEditorProps {
  form: ThemeFormState;
  fieldErrors: FieldErrors;
  readOnly?: boolean;
  onUpdateField: (key: ThemeFieldKey, value: string) => void;
}

function normalizeColorInput(value: string): string {
  const trimmed = value.trim();

  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed) || /^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed;
  }

  return value;
}

function toColorPickerValue(hex: string): string {
  const trimmed = hex.trim();

  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed;
  }

  const shortMatch = /^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/.exec(trimmed);

  if (shortMatch) {
    const [, r, g, b] = shortMatch;
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return '#000000';
}

export function ThemeColorEditor({
  form,
  fieldErrors,
  readOnly = false,
  onUpdateField,
}: ThemeColorEditorProps) {
  return (
    <div className={styles.grid}>
      {COLOR_FIELDS.map(({ key, label }) => (
        <div key={key} className={formStyles.field}>
          <label className={formStyles.label} htmlFor={`theme-${key}`}>
            {label}
          </label>
          <div className={styles.colorRow}>
            <input
              id={`theme-${key}`}
              className={styles.colorInput}
              type="color"
              value={toColorPickerValue(form[key])}
              disabled={readOnly}
              aria-label={`Selector de ${label.toLowerCase()}`}
              onChange={(event) => onUpdateField(key, event.target.value)}
            />
            <input
              className={formStyles.input}
              type="text"
              value={form[key]}
              readOnly={readOnly}
              spellCheck={false}
              aria-describedby={fieldErrors[key] ? `theme-${key}-error` : undefined}
              onChange={(event) => onUpdateField(key, normalizeColorInput(event.target.value))}
            />
          </div>
          {fieldErrors[key] ? (
            <p id={`theme-${key}-error`} className={formStyles.error} role="alert">
              {fieldErrors[key]}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
