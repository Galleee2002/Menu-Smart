import styles from './AdminSection.module.scss';

interface AdminSectionProps {
  title: string;
  description?: string;
}

export function AdminSection({ title, description }: AdminSectionProps) {
  return (
    <section className={styles.section} aria-labelledby="admin-section-title">
      <header className={styles.header}>
        <h1 id="admin-section-title" className={styles.title}>
          {title}
        </h1>
        {description ? <p className={styles.description}>{description}</p> : null}
      </header>
      <div className={styles.placeholder}>
        <p>Contenido en desarrollo.</p>
      </div>
    </section>
  );
}
