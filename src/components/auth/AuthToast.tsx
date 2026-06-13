import { Check, Info } from 'lucide-react';
import { useEffect, useEffectEvent, useReducer, useRef } from 'react';
import styles from './AuthToast.module.scss';

const VISIBLE_MS = 4000;
const EXIT_MS = 320;

export type AuthToastVariant = 'error' | 'success';

interface AuthToastProps {
  message: string;
  variant: AuthToastVariant;
  onDismiss?: () => void;
}

type ToastState = {
  mounted: boolean;
  active: boolean;
};

type ToastAction =
  | { type: 'sync_message'; message: string }
  | { type: 'activate' }
  | { type: 'deactivate' }
  | { type: 'dismiss' };

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'sync_message':
      if (!action.message) {
        return { mounted: false, active: false };
      }

      return { mounted: true, active: false };
    case 'activate':
      return state.mounted ? { ...state, active: true } : state;
    case 'deactivate':
      return { ...state, active: false };
    case 'dismiss':
      return { mounted: false, active: false };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

export function AuthToast({ message, variant, onDismiss }: AuthToastProps) {
  const [state, dispatch] = useReducer(toastReducer, { mounted: false, active: false });
  const prevMessageRef = useRef(message);

  if (message !== prevMessageRef.current) {
    prevMessageRef.current = message;
    dispatch({ type: 'sync_message', message });
  }

  const onDismissEvent = useEffectEvent(() => {
    onDismiss?.();
  });

  useEffect(() => {
    if (!message) {
      return;
    }

    let enterFrame = 0;
    enterFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => dispatch({ type: 'activate' }));
    });

    const exitTimer = window.setTimeout(() => dispatch({ type: 'deactivate' }), VISIBLE_MS);
    const hiddenTimer = window.setTimeout(() => {
      dispatch({ type: 'dismiss' });
      onDismissEvent();
    }, VISIBLE_MS + EXIT_MS);

    return () => {
      cancelAnimationFrame(enterFrame);
      window.clearTimeout(exitTimer);
      window.clearTimeout(hiddenTimer);
    };
  }, [message]);

  if (!state.mounted) {
    return null;
  }

  const Icon = variant === 'success' ? Check : Info;
  const iconClass = variant === 'success' ? styles.iconSuccess : styles.iconError;
  const variantClass = variant === 'success' ? styles.success : styles.error;

  return (
    <div
      className={[styles.toast, variantClass, state.active ? styles.enter : ''].join(' ')}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <Icon className={iconClass} size={18} strokeWidth={2.25} aria-hidden />
      <span className={styles.message}>{message}</span>
    </div>
  );
}
