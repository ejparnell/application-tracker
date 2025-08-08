'use client';

import { useActionState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { registerAction } from '@/actions/auth';
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

export default function SignUpForm() {
    const [state, formAction, isPending] = useActionState(
        registerAction,
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
                    console.error('Sign in failed after registration');
                }
            });
        }
    }, [state.success, state.email, state.password, router]);

    return (
            <Form action={formAction}>
                <Text as="h2" variant="h2">
                    Create Account
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

                <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    required
                    disabled={isPending}
                    error={state?.fieldErrors?.confirmPassword}
                />

                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Creating Account...' : 'Create Account'}
                </Button>

                <Text as="p" variant="body-small">
                    Already have an account? <Link href="/login">Sign in</Link>
                </Text>
            </Form>
    );
}
