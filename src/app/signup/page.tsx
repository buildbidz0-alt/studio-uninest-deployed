import SignupForm from '@/components/auth/signup-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up | Student Hub',
    description: 'Create a new account on Student Hub.',
};

export default function SignupPage() {
    return (
        <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-background">
            <SignupForm />
        </div>
    );
}
