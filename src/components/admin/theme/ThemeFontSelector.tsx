import formStyles from '../admin-form.module.scss';
import { THEME_FONT_OPTIONS } from '../../../lib/theme-presets';
import type { FieldErrors, ThemeFormState } from '../admin-theme-page.state';

interface ThemeFontSelectorProps {
  form: ThemeFormState;
  fieldErrors: FieldErrors;
  readOnly?: boolean;
  onUpdateField: (value: string) => void;
}

export function ThemeFontSelector({
  form,
  fieldErrors,
  readOnly = false,
  onUpdateField,
}: ThemeFontSelectorProps) {
  const hasCustomFont = !THEME_FONT_OPTIONS.some((option) => option.value === form.fontFamily);

  return (
    <div className={formStyles.field}>
      <label className={formStyles.label} htmlFor="theme-font-family">
        Tipografía
      </label>
      <select
        id="theme-font-family"
        className={formStyles.input}
        value={hasCustomFont ? '' : form.fontFamily}
        disabled={readOnly}
        onChange={(event) => {
          if (event.target.value) {
            onUpdateField(event.target.value);
          }
        }}
      >
        {hasCustomFont ? (
          <option value="" disabled>
            Personalizada: {form.fontFamily}
          </option>
        ) : null}
        {THEME_FONT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {fieldErrors.fontFamily ? (
        <p className={formStyles.error} role="alert">
          {fieldErrors.fontFamily}
        </p>
      ) : (
        <p className={formStyles.hint}>Se aplica a títulos y texto del menú público.</p>
      )}
    </div>
  );
}
