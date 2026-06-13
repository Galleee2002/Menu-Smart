import { useRef, useState } from 'react';
import formStyles from './admin-form.module.scss';
import styles from './AdminConfirmDialog.module.scss';

interface AdminConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmValue?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmValue,
  loading = false,
  onConfirm,
  onCancel,
}: AdminConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [typedValue, setTypedValue] = useState('');
  const prevOpenRef = useRef(open);

  if (open !== prevOpenRef.current) {
    prevOpenRef.current = open;

    if (!open) {
      setTypedValue('');
    }
  }

  const requiresTypedConfirm = Boolean(confirmValue);
  const canConfirm = !requiresTypedConfirm || typedValue === confirmValue;

  if (!open) {
    return null;
  }

  return (
    <dialog
      className={styles.dialog}
      aria-labelledby="admin-confirm-title"
      aria-describedby="admin-confirm-description"
      onClose={onCancel}
      ref={(node) => {
        if (node && !node.open) {
          node.showModal();
          cancelRef.current?.focus();
        }
      }}
    >
      <div className={styles.panel}>
        <h2 id="admin-confirm-title" className={styles.title}>
          {title}
        </h2>
        <p id="admin-confirm-description" className={styles.description}>
          {description}
        </p>

        {confirmValue ? (
          <div className={styles.confirmField}>
            <label className={formStyles.label} htmlFor="admin-confirm-input">
              Escribe <strong>{confirmValue}</strong> para confirmar
            </label>
            <input
              id="admin-confirm-input"
              className={formStyles.input}
              type="text"
              value={typedValue}
              onChange={(event) => setTypedValue(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        ) : null}

        <div className={styles.actions}>
          <button
            ref={cancelRef}
            type="button"
            className={styles.cancel}
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.confirm}
            onClick={onConfirm}
            disabled={loading || !canConfirm}
          >
            {loading ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
