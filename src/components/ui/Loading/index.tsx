import { forwardRef } from 'react';
import styles from './Loading.module.css';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  layout?: 'left' | 'center' | 'right';
  className?: string;
}

const Loading = forwardRef<HTMLDivElement, LoadingProps>(
  ({ size = 'medium', layout = 'center', className = '' }, ref) => {
    const loadingClasses = `${styles.loading} ${styles[size]} ${styles[layout]} ${className}`;

    return (
      <div ref={ref} className={loadingClasses}>
        <span className={styles.text}>Loading</span>
        <span className={styles.dots}>
          <span className={styles.dot}>.</span>
          <span className={styles.dot}>.</span>
          <span className={styles.dot}>.</span>
        </span>
      </div>
    );
  }
);

Loading.displayName = 'Loading';

export default Loading;