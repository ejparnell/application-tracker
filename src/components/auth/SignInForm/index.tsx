'use client';

import { useActionState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signinAction } from '@/actions/auth';
import { ActionState } from '@/types/auth';

const initialState: ActionState = {
    success: false,
    fieldErrors: {}
};

export default function SignInForm() {
    const [state, formAction, isPending] = useActionState(signinAction, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.success && state.email && state.password) {
            signIn('credentials', {
                email: state.email,
                password: state.password,
                redirect: false,
            }).then((result) => {
                if (result?.ok) {
                    router.push('/dashboard');
                } else {
                    console.error('Sign in failed:', result?.error);
                }
            });
        }
    }, [state.success, state.email, state.password, router]);

    return (
        <div>
            <form action={formAction}>
                <h2>Sign In</h2>
                
                {state?.error && !state.success && (
                    <div role="alert">
                        {state.error}
                    </div>
                )}

                <div>
                    <label htmlFor="email">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        disabled={isPending}
                    />
                    {state?.fieldErrors?.email && (
                        <span role="alert">
                            {state.fieldErrors.email}
                        </span>
                    )}
                </div>

                <div>
                    <label htmlFor="password">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        disabled={isPending}
                    />
                    {state?.fieldErrors?.password && (
                        <span role="alert">
                            {state.fieldErrors.password}
                        </span>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? 'Signing In...' : 'Sign In'}
                </button>

                <p>
                    Don&apos;t have an account?{' '}
                    <a href="/signup">
                        Create account
                    </a>
                </p>
            </form>
        </div>
    );
}