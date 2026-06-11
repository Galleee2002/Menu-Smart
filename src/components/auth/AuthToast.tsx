import { Check, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './AuthToast.module.scss';

const VISIBLE_MS = 4000;
const EXIT_MS = 320;

export type AuthToastVariant = 'error' | 'success';

interface AuthToastProps {
  message: string;
  variant: AuthToastVariant;
  onDismiss?: () => void;
}

export function AuthToast({ message, variant, onDismiss }: AuthToastProps) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!message) {
      setMounted(false);
      setActive(false);
      return;
    }

    setMounted(true);
    setActive(false);

    let enterFrame = 0;
    enterFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setActive(true));
    });

    const exitTimer = window.setTimeout(() => setActive(false), VISIBLE_MS);
    const hiddenTimer = window.setTimeout(() => {
      setMounted(false);
      onDismiss?.();
    }, VISIBLE_MS + EXIT_MS);

    return () => {
      cancelAnimationFrame(enterFrame);
      window.clearTimeout(exitTimer);
      window.clearTimeout(hiddenTimer);
    };
  }, [message, onDismiss]);

  if (!mounted) {
    return null;
  }

  const Icon = variant === 'success' ? Check : Info;
  const iconClass = variant === 'success' ? styles.iconSuccess : styles.iconError;
  const variantClass = variant === 'success' ? styles.success : styles.error;

  return (
    <div
      className={[styles.toast, variantClass, active ? styles.enter : ''].join(' ')}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <Icon className={iconClass} size={18} strokeWidth={2.25} aria-hidden />
      <span className={styles.message}>{message}</span>
    </div>
  );
}

interface AuthErrorToastProps {
  message: string;
  onDismiss?: () => void;
}

export function AuthErrorToast({ message, onDismiss }: AuthErrorToastProps) {
  return <AuthToast message={message} variant="error" onDismiss={onDismiss} />;
}

interface AuthSuccessToastProps {
  message: string;
  onDismiss?: () => void;
}

export function AuthSuccessToast({ message, onDismiss }: AuthSuccessToastProps) {
  return <AuthToast message={message} variant="success" onDismiss={onDismiss} />;
}
