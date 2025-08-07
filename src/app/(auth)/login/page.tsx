import { Metadata } from 'next';
import SignInForm from '@/components/auth/SignInForm';

export const metadata: Metadata = {
  title: 'Login - Application Tracker',
  description: 'Log in to your account to manage your job applications',
};

export default function LoginPage() {
  return <SignInForm />;
}
