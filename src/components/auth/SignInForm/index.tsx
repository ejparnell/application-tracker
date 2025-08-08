'use client';

import { useActionState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signinAction } from '@/actions/auth';
import { ActionState } from '@/types/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import Link from 'next/link';
import Form from '@/components/ui/Form';

const initialState: ActionState = {
    success: false,
    error: undefined,
    fieldErrors: {},
};

export default function SignInForm() {
    const [state, formAction, isPending] = useActionState(
        signinAction,
        initialState
    );
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
            <Form action={formAction}>
                <Text as="h2" variant="h2">
                    Sign In
                </Text>

                {state?.error && !state.success && (
                    <div role="alert">{state.error}</div>
                )}

                <Input
                    type="email"
                    id="email"
                    name="email"
                    label="Email"
                    required
                    disabled={isPending}
                    error={state?.fieldErrors?.email}
                />

                <Input
                    type="password"
                    id="password"
                    name="password"
                    label="Password"
                    required
                    disabled={isPending}
                    error={state?.fieldErrors?.password}
                />

                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Signing In...' : 'Sign In'}
                </Button>

                <Text as="p" variant="body-small">
                    Don&apos;t have an account?{' '}
                    <Link href="/register">Create account</Link>
                </Text>
            </Form>
    );
}
