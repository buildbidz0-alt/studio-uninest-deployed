import LoginForm from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login | Student Hub',
    description: 'Login to your Student Hub account.',
};

export default function LoginPage() {
    return (
        <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-background">
            <LoginForm />
        </div>
    );
}
