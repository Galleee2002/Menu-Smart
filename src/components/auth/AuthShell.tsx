import { Utensils } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './AuthShell.module.scss';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden>
            <Utensils size={20} strokeWidth={2.25} />
          </span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
