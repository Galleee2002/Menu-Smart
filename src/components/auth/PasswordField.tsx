import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes } from 'react';
import styles from './PasswordField.module.scss';

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function PasswordField({ label, id, ...inputProps }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        <input
          {...inputProps}
          id={id}
          className={styles.input}
          type={visible ? 'text' : 'password'}
        />
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
        </button>
      </div>
    </div>
  );
}
