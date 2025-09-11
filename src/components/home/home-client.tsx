
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import StatCard from './stat-card';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, BookOpen, GraduationCap, Rocket, Users, Building, Sparkles } from 'lucide-react';

const stats = [
  { value: 10000, label: 'Students', icon: GraduationCap, isPlus: true },
  { value: 12000, label: 'Notes Shared', icon: BookOpen, isPlus: true },
  { value: 200, label: 'Vendors', icon: Building, isPlus: true },
];

const testimonials = [
  {
    quote: "UniNest completely changed how I find study materials. The note sharing is a lifesaver, and I've connected with so many peers!",
    name: 'Ananya Sharma',
    college: 'IIT Delhi',
    avatar: 'https://picsum.photos/seed/testimonial1/100',
  },
  {
    quote: "The marketplace is brilliant. I sold all my old textbooks in a week and found a great deal on a used bike. It's so much better than other platforms.",
    name: 'Rohan Verma',
    college: 'St. Stephen\'s College',
    avatar: 'https://picsum.photos/seed/testimonial2/100',
  },
  {
    quote: "As a fresher, UniNest helped me feel connected to the campus community instantly. The social feed is always buzzing with useful info.",
    name: 'Priya Singh',
    college: 'Christ University',
    avatar: 'https://picsum.photos/seed/testimonial3/100',
  },
];

const timelineEvents = [
  { year: "2024", title: "The Vision", description: "Founded with a mission to simplify student life.", icon: Sparkles },
  { year: "2024 Q2", title: "First 1,000 Users", description: "Our community begins to take shape.", icon: Users },
  { year: "2025 Q1", title: "10,000 Strong", description: "Crossed 10k students & 200 vendors.", icon: GraduationCap },
  { year: "Future", title: "Global Expansion", description: "Connecting 100,000+ learners worldwide.", icon: Rocket },
];

export default function HomeClient() {
  return (
    <div className="space-y-24 md:space-y-32">
      {/* Hero Section */}
      <section className="text-center pt-8">
         <div className="inline-block bg-primary/10 text-primary font-semibold text-sm py-1 px-3 rounded-full mb-4">
           The fastest-growing student platform
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight">
          Join 10,000+ Students <br/> Already on <span className="primary-gradient bg-clip-text text-transparent">UniNest 🎓</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          The ultimate platform to connect, study, and thrive with your peers. Stop missing out.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" className="text-lg" asChild>
            <Link href="/signup">Sign Up Free</Link>
          </Button>
          <Button size="lg" variant="outline" className="text-lg" asChild>
            <Link href="/feed">Explore the Community</Link>
          </Button>
        </div>
      </section>

      {/* Impact Numbers Section */}
      <section className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
       <section className="w-full">
         <h2 className="text-3xl font-headline font-bold text-center mb-10">Loved by Students Everywhere</h2>
          <Carousel
            plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1 h-full">
                    <Card className="h-full flex flex-col justify-between shadow-lg">
                      <CardContent className="p-6 text-lg font-medium italic text-center">
                        "{testimonial.quote}"
                      </CardContent>
                      <div className="flex items-center justify-center gap-3 p-6 pt-0">
                         <Avatar>
                           <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="person face" />
                           <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                         </Avatar>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.college}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
             <CarouselPrevious className="hidden md:flex" />
             <CarouselNext className="hidden md:flex" />
          </Carousel>
      </section>

      {/* Growth Timeline Section */}
      <section>
        <h2 className="text-3xl font-headline font-bold text-center mb-12">Our Journey So Far</h2>
        <div className="max-w-5xl mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {timelineEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="mt-1 bg-primary/10 text-primary rounded-full p-2">
                    <event.icon className="size-6" />
                  </div>
                  <div>
                     <p className="font-bold text-lg">{event.year}</p>
                     <h3 className="font-headline text-xl font-semibold">{event.title}</h3>
                     <p className="text-muted-foreground">{event.description}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center bg-card rounded-2xl p-8 md:p-12 shadow-xl border max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold font-headline">Don’t Miss Out.</h2>
        <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
          Be part of the fastest-growing student movement and supercharge your campus life.
        </p>
        <div className="mt-8">
          <Button size="lg" className="text-lg" asChild>
            <Link href="/signup">Get Started Now 🚀</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
