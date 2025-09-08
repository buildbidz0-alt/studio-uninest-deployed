import PasswordResetForm from '@/components/auth/password-reset-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Password Reset | Student Hub',
    description: 'Reset your Student Hub account password.',
};

export default function PasswordResetPage() {
    return (
        <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-background">
            <PasswordResetForm />
        </div>
    );
}
