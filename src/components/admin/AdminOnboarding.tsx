import { Utensils } from 'lucide-react';
import { useCallback, useState, type FormEvent } from 'react';
import { createRestaurant } from '../../lib/admin-api';
import styles from './AdminOnboarding.module.scss';

interface AdminOnboardingProps {
  onComplete: () => Promise<void>;
}

export function AdminOnboarding({ onComplete }: AdminOnboardingProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const clearError = useCallback(() => setError(''), []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    setLoading(true);

    const result = await createRestaurant({ name: trimmedName });

    if (!result.ok) {
      setError(result.message);
      setLoading(false);
      return;
    }

    await onComplete();
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden>
            <Utensils size={20} strokeWidth={2.25} />
          </span>
          <h1 className={styles.title}>Configura tu restaurante</h1>
          <p className={styles.subtitle}>
            Crea tu espacio de trabajo para empezar a gestionar tu menú digital.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="onboarding-restaurant-name">
              Nombre del restaurante
            </label>
            <input
              id="onboarding-restaurant-name"
              className={styles.input}
              type="text"
              name="name"
              autoComplete="organization"
              placeholder="Ej. Bella Napoli"
              value={name}
              onChange={(event) => {
                clearError();
                setName(event.target.value);
              }}
              required
            />
          </div>

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? 'Creando…' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}
