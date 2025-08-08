import { forwardRef } from 'react';
import styles from './Form.module.css';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ children, className = '', onSubmit, ...props }, ref) => {
    const formClasses = `${styles.form} ${className}`;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      if (onSubmit) {
        event.preventDefault();
        onSubmit(event);
      }
    };

    return (
      <form
        ref={ref}
        className={formClasses}
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = 'Form';

export default Form;