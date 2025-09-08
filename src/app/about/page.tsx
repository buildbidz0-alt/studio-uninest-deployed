import type { Metadata } from 'next';
import Image from 'next/image';
import { Target, Globe, ShieldCheck, TrendingUp, Handshake, Users, Info, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'About Us | UniNest',
  description: 'Learn more about UniNest and our mission to empower students, libraries, and vendors with a unified digital ecosystem.',
};

export default function AboutPage() {
  return (
    <div className="space-y-16">
      {/* Page Header */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-primary">
          Our Mission at UniNest
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
          To empower students, libraries, and vendors by creating a unified digital ecosystem that fosters knowledge sharing, simplifies resource management, and builds a global community dedicated to academic and professional growth.
        </p>
      </section>
      
      {/* Company Vision Section */}
      <section>
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                <Image
                    src="https://picsum.photos/seed/vision/800/600"
                    alt="Our Vision"
                    fill
                    objectFit="cover"
                    data-ai-hint="futuristic abstract"
                />
            </div>
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-primary">Our Vision</h2>
                <p className="mt-4 text-muted-foreground">
                    We envision a world where education is accessible, transparent, and collaborative. UniNest aims to be the digital backbone of the academic world, breaking down barriers and connecting every member of the educational community—from individual students to global institutions—on a single, intelligent platform.
                </p>
            </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-muted py-16 rounded-lg">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12 text-primary">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ValueCard icon={ShieldCheck} title="Trust & Security" description="We prioritize the security of your data and transactions, building a platform you can rely on." />
            <ValueCard icon={Handshake} title="Knowledge Sharing" description="We believe in the power of shared knowledge to elevate learning and drive innovation." />
            <ValueCard icon={Users} title="Inclusivity" description="Creating a welcoming and accessible environment for students and partners from all backgrounds." />
            <ValueCard icon={TrendingUp} title="Continuous Growth" description="We are committed to constant improvement, evolving with the needs of our users." />
          </div>
        </div>
      </section>
      
      {/* Why UniNest Section */}
      <section>
         <div className="text-center mb-12">
             <h2 className="text-3xl font-bold tracking-tight text-primary">Why UniNest?</h2>
             <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                Differentiating from traditional platforms, UniNest is built on an enterprise-grade foundation, offering an integrated, secure, and scalable solution that traditional, fragmented tools cannot match.
             </p>
         </div>
         <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 border rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2 text-primary">Unified Ecosystem</h3>
                <p className="text-muted-foreground">One platform for social, academic, and commercial needs, eliminating the need for multiple, disjointed apps.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2 text-primary">AI-Powered Efficiency</h3>
                <p className="text-muted-foreground">Smart tools for tagging, search, and resource management save you time and improve your workflow.</p>
            </div>
             <div className="p-6 border rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2 text-primary">Global & Scalable</h3>
                <p className="text-muted-foreground">Built for institutions of all sizes, connecting students and vendors across a secure, global network.</p>
            </div>
         </div>
      </section>
    </div>
  );
}

const ValueCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="text-center p-6">
        <div className="mb-4 flex justify-center">
             <div className="bg-primary text-primary-foreground rounded-full p-4">
                <Icon className="size-8" />
            </div>
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);
