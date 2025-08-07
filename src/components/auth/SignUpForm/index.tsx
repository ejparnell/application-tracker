'use client';

import { useActionState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { registerAction } from '@/actions/auth';
import { ActionState } from '@/types/auth';

const initialState: ActionState = {
    success: false,
    error: undefined,
    fieldErrors: {}
};

export default function SignUpForm() {
    const [state, formAction, isPending] = useActionState(registerAction, initialState);
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
                    console.error('Sign in failed after registration');
                }
            });
        }
    }, [state.success, state.email, state.password, router]);

    return (
        <div>
            <form action={formAction}>
                <h2>Create Account</h2>
                
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

                <div>
                    <label htmlFor="confirmPassword">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        required
                        disabled={isPending}
                    />
                    {state?.fieldErrors?.confirmPassword && (
                        <span role="alert">
                            {state.fieldErrors.confirmPassword}
                        </span>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? 'Creating Account...' : 'Create Account'}
                </button>

                <p>
                    Already have an account?{' '}
                    <a href="/signin">
                        Sign in
                    </a>
                </p>
            </form>
        </div>
    );
}
