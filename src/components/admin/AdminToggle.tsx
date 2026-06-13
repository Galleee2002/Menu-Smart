import styles from './AdminToggle.module.scss';

interface AdminToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
  description?: string;
}

export function AdminToggle({
  id,
  checked,
  onChange,
  disabled = false,
  label,
  description,
}: AdminToggleProps) {
  return (
    <div className={styles.root}>
      <div className={styles.copy}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        className={styles.switch}
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.thumb} aria-hidden />
      </button>
    </div>
  );
}
