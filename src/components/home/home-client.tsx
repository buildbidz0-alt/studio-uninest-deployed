
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { GraduationCap, BookOpen, Users, Store, Rocket, ChevronRight, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedCounter from '@/components/animated-counter';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from '../ui/badge';

const testimonials = [
  {
    name: "Ananya Sharma",
    college: "IIT Delhi",
    text: "UniNest completely changed how I find study materials. The note sharing is a lifesaver, and I've connected with so many peers!",
    avatar: "https://picsum.photos/seed/testimonial1/100"
  },
  {
    name: "Rohan Verma",
    college: "St. Stephen's College",
    text: "The marketplace is brilliant. I sold all my old textbooks in a week and found a great deal on a used bike. It's so much better than other platforms.",
    avatar: "https://picsum.photos/seed/testimonial2/100"
  },
  {
    name: "Priya Singh",
    college: "Christ University",
    text: "As a fresher, UniNest helped me feel connected to the campus community instantly. The social feed is always buzzing with useful info.",
    avatar: "https://picsum.photos/seed/testimonial3/100"
  },
];

const timelineMilestones = [
  { year: "2024", title: "The Vision", description: "Founded with a mission to simplify student life.", icon: Rocket },
  { year: "2024 Q2", title: "First 1,000 Users", description: "Our community begins to take shape.", icon: Users },
  { year: "2025 Q1", title: "10,000 Strong", description: "Crossed 10k students & 200 vendors.", icon: GraduationCap },
  { year: "Future", title: "Global Expansion", description: "Connecting 100,000+ learners worldwide.", icon: BookOpen },
];

export default function HomeClient() {
  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="text-center pt-8">
        <Badge variant="outline" className="mb-4 text-sm border-purple-300 bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          The fastest-growing student platform
        </Badge>
        <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight">
          Join <span className="primary-gradient bg-clip-text text-transparent">10,000+ Students</span> Already on UniNest 🎓
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          The ultimate platform to connect, study, and thrive with your peers. Stop missing out.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" className="text-lg" asChild>
            <Link href="/signup">Sign Up Free</Link>
          </Button>
          <Button size="lg" variant="outline" className="text-lg" asChild>
            <Link href="/feed">Explore the Community <ChevronRight className="ml-1" /></Link>
          </Button>
        </div>
      </section>

      {/* Impact Numbers Section */}
      <section className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden shadow-lg">
          <StatCard value="10000" label="Students Connected" icon={GraduationCap} isPlus={true} />
          <StatCard value="12000" label="Notes Shared" icon={BookOpen} isPlus={true} />
          <StatCard value="200" label="Vendors Onboarded" icon={Store} isPlus={true} />
          <StatCard value="50" label="Libraries Managed" icon={Users} isPlus={true} />
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="text-center">
        <h2 className="text-3xl font-headline font-bold mb-8">Loved by Students Everywhere</h2>
        <Carousel
            opts={{ align: "start", loop: true, }}
            className="w-full max-w-4xl mx-auto"
        >
            <CarouselContent>
            {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full flex flex-col text-left">
                        <CardContent className="p-6 flex-grow">
                             <div className="flex text-yellow-400 mb-2">
                                {[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-current" />)}
                             </div>
                            <p className="text-muted-foreground">"{testimonial.text}"</p>
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="person face" />
                                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.college}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </CarouselItem>
            ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
        </Carousel>
      </section>

      {/* Growth Timeline Section */}
      <section>
        <h2 className="text-3xl font-headline font-bold text-center mb-8">Our Journey So Far</h2>
        <div className="relative max-w-5xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2"></div>
            <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {timelineMilestones.map((milestone, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background ring-4 ring-primary/20"></div>
                        <div className="bg-card p-6 rounded-2xl border shadow-lg">
                             <div className="bg-primary/10 text-primary p-3 rounded-full inline-block mb-3">
                                <milestone.icon className="size-6" />
                            </div>
                            <p className="text-sm font-bold text-primary">{milestone.year}</p>
                            <h3 className="font-headline font-semibold text-lg">{milestone.title}</h3>
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="text-center bg-card rounded-2xl p-8 md:p-12 shadow-inner border max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold font-headline">Don’t Miss Out.</h2>
        <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
          Be part of the fastest-growing student movement and supercharge your campus life.
        </p>
        <div className="mt-6">
          <Button size="lg" className="text-lg" asChild>
            <Link href="/signup">Get Started Now 🚀</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function StatCard({ value, label, icon: Icon, isPlus }: { value: string, label: string, icon: any, isPlus?: boolean }) {
  return (
    <div className="bg-card p-4 sm:p-6 text-center">
      <Icon className="size-7 text-primary mx-auto mb-2" />
      <p className="text-2xl sm:text-3xl font-bold tracking-tighter">
        <AnimatedCounter to={Number(value)} />
        {isPlus && '+'}
      </p>
      <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
