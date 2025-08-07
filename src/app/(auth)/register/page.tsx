import { Metadata } from 'next';
import SignUpForm from '@/components/auth/SignUpForm';

export const metadata: Metadata = {
  title: 'Register - Application Tracker',
  description: 'Create a new account to start tracking your job applications',
};

export default function RegisterPage() {
  return <SignUpForm />;
}