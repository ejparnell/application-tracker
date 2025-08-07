'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'Default':
        return 'An error occurred during authentication.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div>
      <div>
        <h1>
          Authentication Error
        </h1>
        
        <p>
          {getErrorMessage(error)}
        </p>

        {error && (
          <p>
            Error code: {error}
          </p>
        )}

        <div>
          <Link href="/signin">
            Try Again
          </Link>
          
          <Link href="/">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
