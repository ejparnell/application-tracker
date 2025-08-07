import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Welcome to Application Tracker</h1>
      <p>Track your job applications with Pokemon-style gamification!</p>
      
      <div>
        <Link href="/register">
          Get Started - Register
        </Link>
        
        <Link href="/login">
          Sign In
        </Link>
      </div>
    </div>
  );
}
