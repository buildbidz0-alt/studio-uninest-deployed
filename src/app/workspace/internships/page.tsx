
import type { Metadata } from 'next';
import InternshipsClient from '@/components/workspace/internships-client';

export const metadata: Metadata = {
  title: 'Find Internships & Apply Easily',
  description: 'Browse and apply for internships from top companies. Gain real-world experience and kickstart your career with UniNest.',
};

export default function InternshipsPage() {
    return <InternshipsClient />
}
