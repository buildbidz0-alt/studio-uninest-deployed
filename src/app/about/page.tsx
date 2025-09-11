
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Store, Library, Rocket, Globe, UserCheck, Sparkles, Users } from 'lucide-react';
import AnimatedCounter from '@/components/animated-counter';

export const metadata: Metadata = {
  title: 'About UniNest | Our Mission, Story, and Impact',
  description: 'Join the movement of over 10,000 students. Learn about UniNest\'s mission to empower learners and our incredible journey so far.',
};

const timelineEvents = [
  { year: "2024", title: "The Spark", description: "Founded with a vision to simplify campus life for every student.", icon: Sparkles },
  { year: "2024 Q2", title: "First 1,000 Students", description: "Early adopters join, validating our mission and kickstarting the community.", icon: Users },
  { year: "2025 Q1", title: "Growth Explosion", description: "Surpassed 10,000+ students and onboarded 200+ campus vendors.", icon: Rocket },
  { year: "Future", title: "Global Campus", description: "Expanding to connect over 100,000 learners and institutions worldwide.", icon: Globe },
];

const impactStats = [
  { value: 10000, label: "Students Connected", icon: GraduationCap, isPlus: true },
  { value: 200, label: "Vendors Empowering", icon: Store, isPlus: true },
  { value: 50, label: "Libraries Managed", icon: Library, isPlus: true },
];

const coreValues = [
    { title: "Innovation First", description: "We constantly build and iterate to solve real student problems.", icon: Rocket },
    { title: "Community Matters", description: "Our platform is built for, and by, the student community.", icon: Users },
    { title: "Education for All", description: "We believe in breaking down barriers to knowledge and opportunity.", icon: GraduationCap },
    { title: "Student-Centered", description: "Every decision is driven by what's best for our students.", icon: UserCheck },
];

export default function AboutPage() {
  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="text-center pt-8">
        <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight">
            10,000+ Students. <span className="primary-gradient bg-clip-text text-transparent">One UniNest.</span>
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
            UniNest is more than a platform — it’s a movement to connect, empower, and inspire students everywhere.
        </p>
         <div className="mt-8 relative h-60 w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg border">
            <Image
                src="https://picsum.photos/seed/about-hero/1200/400"
                alt="Digital campus illustration"
                fill
                className="object-cover"
                data-ai-hint="digital campus illustration vibrant gradient"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/30 to-purple-500/30"></div>
        </div>
      </section>
      
      {/* Mission Statement */}
      <section className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-headline font-bold mb-4">Our Mission</h2>
        <p className="text-xl text-muted-foreground">
           At UniNest, we believe every student deserves equal access to knowledge, opportunity, and community. We exist to break barriers, simplify campus life, and unlock potential for learners worldwide.
        </p>
      </section>

      {/* Impact Counters */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {impactStats.map((stat, index) => (
            <div key={index} className="bg-card border rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <stat.icon className="size-8 text-primary mx-auto mb-3" />
              <p className="text-3xl lg:text-4xl font-bold tracking-tighter">
                <AnimatedCounter to={stat.value} />
                {stat.isPlus && '+'}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Growth Timeline Section */}
      <section>
        <h2 className="text-3xl font-headline font-bold text-center mb-12">Our Story of Growth</h2>
        <div className="relative max-w-2xl mx-auto">
            {/* The vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
            
            <div className="space-y-12">
                {timelineEvents.map((event, index) => (
                <div key={index} className="flex md:items-center gap-6 md:gap-12 flex-col md:flex-row">
                    {/* Dot */}
                    <div className="absolute left-6 md:left-1/2 top-auto w-5 h-5 rounded-full bg-primary border-4 border-background ring-4 ring-primary/20 -translate-x-1/2"></div>

                    {/* Content Card */}
                    <div className="bg-card border rounded-2xl p-6 shadow-md hover:scale-105 transition-transform w-full">
                        <p className="text-sm font-bold text-primary mb-1">{event.year}</p>
                        <h3 className="font-headline font-semibold text-xl mb-2 flex items-center gap-2">
                          <event.icon className="size-5" />
                          {event.title}
                        </h3>
                        <p className="text-muted-foreground">{event.description}</p>
                    </div>
                </div>
                ))}
            </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-muted py-16 rounded-2xl">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-headline font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value) => (
                <div key={value.title} className="text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="bg-card text-primary rounded-full p-4 border shadow-sm">
                            <value.icon className="size-8" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold font-headline">{value.title}</h3>
                    <p className="text-muted-foreground mt-1">{value.description}</p>
                </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Join the Movement CTA */}
      <section className="text-center bg-card p-8 md:p-12 rounded-2xl shadow-xl max-w-4xl mx-auto border">
          <h2 className="text-3xl font-bold font-headline primary-gradient bg-clip-text text-transparent">UniNest is just getting started.</h2>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
            Be part of the journey with 10,000+ students shaping the future of education. Your next chapter starts here.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="text-lg" asChild>
                <Link href="/signup">Join 10,000+ Students 🚀</Link>
            </Button>
             <Button size="lg" variant="outline" className="text-lg" asChild>
                <Link href="/donate">Support with a Donation 💙</Link>
            </Button>
          </div>
        </section>
    </div>
  );
}
