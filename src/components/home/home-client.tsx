
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  BookOpen, 
  Store, 
  GraduationCap,
  ArrowRight,
  Sparkles,
  Search,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const features = [
  {
    icon: MessageSquare,
    title: 'Student Social Feed',
    description: 'Connect with peers, share updates, and stay in the loop with campus life. Your community is just a post away.',
    id: 'feed',
    imageUrl: 'https://picsum.photos/seed/feed-feature/800/600',
    dataAiHint: 'student social feed mobile app'
  },
  {
    icon: Store,
    title: 'Textbook Marketplace',
    description: 'Buy and sell textbooks, notes, and other essentials directly with fellow students. Save money and declutter.',
    id: 'marketplace',
    imageUrl: 'https://picsum.photos/seed/market-feature/800/600',
    dataAiHint: 'marketplace mobile app'
  },
  {
    icon: BookOpen,
    title: 'AI-Powered Study Hub',
    description: 'Upload your notes and let our AI automatically tag and organize them for you. Find the exact material you need, instantly.',
    id: 'study-hub',
    imageUrl: 'https://picsum.photos/seed/study-feature/800/600',
    dataAiHint: 'ai education mobile app'
  },
];

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export default function HomeClient() {
  return (
    <div className="space-y-24 md:space-y-32">
      {/* Hero Section */}
      <section className="text-center pt-8">
        <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight">
          Your All-In-One <span className="primary-gradient bg-clip-text text-transparent">Campus Hub</span>
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
          UniNest brings your entire campus to your fingertips. From buying textbooks to connecting with friends and acing your exams—it all happens here.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" className="text-lg" asChild>
            <Link href="/signup">Get Started for Free</Link>
          </Button>
          <Button size="lg" variant="outline" className="text-lg" onClick={() => scrollTo('features')}>
            Explore Features <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.id} className="cursor-pointer" onClick={() => scrollTo(feature.id)}>
              <Card className="h-full text-center hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 text-primary size-16 rounded-full flex items-center justify-center mb-4">
                        <feature.icon className="size-8" />
                    </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Feature Spotlights */}
      {features.map((feature, index) => (
        <section key={feature.id} id={feature.id} className="max-w-5xl mx-auto">
          <div className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${index % 2 !== 0 ? 'md:grid-flow-col-dense' : ''}`}>
            <div className={`relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg ${index % 2 !== 0 ? 'md:col-start-2' : ''}`}>
              <Image 
                src={feature.imageUrl}
                alt={feature.title}
                fill
                className="object-cover"
                data-ai-hint={feature.dataAiHint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <feature.icon className="size-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold font-headline">{feature.title}</h2>
              </div>
              <p className="text-lg text-muted-foreground">
                {feature.description}
              </p>
              <Button asChild variant="link" className="p-0 text-lg">
                <Link href={feature.id === 'study-hub' ? '/notes' : `/${feature.id}`}>
                  Learn More <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ))}

      {/* Final CTA */}
      <section className="text-center bg-card rounded-2xl p-8 md:p-12 shadow-xl border max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold font-headline">Ready to Supercharge Your Campus Life?</h2>
        <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
          Create your free account in seconds and unlock a smarter way to navigate your studies and social life.
        </p>
        <div className="mt-8">
          <Button size="lg" className="text-lg" asChild>
            <Link href="/signup">Join UniNest Today 🚀</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
