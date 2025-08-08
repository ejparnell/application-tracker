'use client';

import { useState, forwardRef } from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type = 'text', className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [inputType, setInputType] = useState(type);

    const isPassword = type === 'password';

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
      setInputType(showPassword ? 'password' : 'text');
    };

    const inputClasses = `${styles.input} ${isPassword ? styles.inputPassword : ''} ${className}`;

    return (
      <div className={styles.container}>
        {label && (
          <label htmlFor={props.id} className={styles.label}>
            {label}
          </label>
        )}
        
        <div className={styles.inputWrapper}>
          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={styles.toggleButton}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <img
                src={showPassword ? '/visibility_off.png' : '/visibility.png'}
                alt={showPassword ? 'Hide password' : 'Show password'}
                className={styles.toggleIcon}
              />
            </button>
          )}
        </div>
        
        {error && (
          <span role="alert" className={styles.error}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
