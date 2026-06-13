import { useRef, useState } from 'react';
import { DEFAULT_CURRENCY, getCurrencySymbol } from '../../../lib/currency';
import formStyles from '../admin-form.module.scss';
import styles from './AdminBulkPricingDialog.module.scss';

const currencySymbol = getCurrencySymbol(DEFAULT_CURRENCY);

type PricingMode = 'percentage' | 'fixed';

interface AdminBulkPricingDialogProps {
  open: boolean;
  menuName: string;
  loading?: boolean;
  onConfirm: (mode: PricingMode, value: number) => void;
  onCancel: () => void;
}

export function AdminBulkPricingDialog({
  open,
  menuName,
  loading = false,
  onConfirm,
  onCancel,
}: AdminBulkPricingDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [mode, setMode] = useState<PricingMode>('percentage');
  const [value, setValue] = useState('');
  const prevOpenRef = useRef(open);

  if (open !== prevOpenRef.current) {
    prevOpenRef.current = open;

    if (!open) {
      setMode('percentage');
      setValue('');
    }
  }

  const parsedValue = Number.parseFloat(value);
  const canConfirm = Number.isFinite(parsedValue);

  const handleSubmit = () => {
    if (!canConfirm) {
      return;
    }

    onConfirm(mode, parsedValue);
  };

  if (!open) {
    return null;
  }

  return (
    <dialog
      className={styles.dialog}
      aria-labelledby="bulk-pricing-title"
      aria-describedby="bulk-pricing-description"
      onClose={onCancel}
      ref={(node) => {
        if (node && !node.open) {
          node.showModal();
          cancelRef.current?.focus();
        }
      }}
    >
      <div className={styles.panel}>
        <h2 id="bulk-pricing-title" className={styles.title}>
          Ajuste masivo de precios
        </h2>
        <p id="bulk-pricing-description" className={styles.description}>
          Aplica un cambio a todos los productos de <strong>{menuName}</strong>. Los precios se
          redondean a 2 decimales y no bajan de 0.
        </p>

        <div className={styles.fields}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="bulk-pricing-mode">
              Modo
            </label>
            <select
              id="bulk-pricing-mode"
              className={formStyles.input}
              value={mode}
              disabled={loading}
              onChange={(event) => setMode(event.target.value as PricingMode)}
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Cantidad fija ({currencySymbol})</option>
            </select>
            <p className={formStyles.hint}>
              {mode === 'percentage'
                ? 'Ej. 10 aumenta un 10 %. -5 reduce un 5 %.'
                : `Ej. 150 suma ${currencySymbol}150. -50 resta ${currencySymbol}50.`}
            </p>
          </div>

          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="bulk-pricing-value">
              Valor
            </label>
            <input
              id="bulk-pricing-value"
              className={formStyles.input}
              type="number"
              step="0.01"
              value={value}
              disabled={loading}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
        </div>

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
            onClick={handleSubmit}
            disabled={loading || !canConfirm}
          >
            {loading ? 'Aplicando…' : 'Aplicar cambios'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
