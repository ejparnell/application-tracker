import { forwardRef, createElement } from 'react';
import styles from './Text.module.css';

interface TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'subtext' | 'body-large' | 'body-small' | 'caption';
  children: React.ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  color?: 'primary' | 'secondary' | 'error' | 'success';
}

const Text = forwardRef<HTMLElement, TextProps>(
  ({ variant = 'body-large', children, className = '', as, color = 'primary', ...props }, ref) => {
    // Determine the HTML element to render
    const getElement = (): keyof React.JSX.IntrinsicElements => {
      if (as) return as;
      
      switch (variant) {
        case 'h1':
          return 'h1';
        case 'h2':
          return 'h2';
        case 'h3':
          return 'h3';
        case 'caption':
          return 'span';
        case 'subtext':
          return 'p';
        default:
          return 'p';
      }
    };

    const element = getElement();
    const textClasses = `${styles.text} ${styles[variant]} ${styles[color]} ${className}`;

    return createElement(
      element,
      {
        ref,
        className: textClasses,
        ...props
      },
      children
    );
  }
);

Text.displayName = 'Text';

export default Text;
