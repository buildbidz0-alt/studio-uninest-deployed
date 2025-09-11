
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, BookOpen, GraduationCap, Rocket, Users, Building, Sparkles, Library, Search, Package, LayoutGrid } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import StatCard from '@/components/home/stat-card';

const stats = [
  { value: 10000, label: 'Students Connected', icon: GraduationCap, isPlus: true },
  { value: 200, label: 'Vendors Onboarded', icon: Building, isPlus: true },
  { value: 50, label: 'Libraries Managed', icon: Library, isPlus: true },
];

const testimonials = [
  {
    quote: "UniNest completely changed how I find study materials. The note sharing is a lifesaver, and I've connected with so many peers!",
    name: "Fatima Khan",
    school: "Jamia Millia Islamia",
    avatar: "https://picsum.photos/seed/testimonial1/100"
  },
  {
    quote: "The marketplace is brilliant. I sold all my old textbooks in a week and found a great deal on a used bike. It's so much better than other platforms.",
    name: "John Mathew",
    school: "St. Stephen's College",
    avatar: "https://picsum.photos/seed/testimonial2/100"
  },
  {
    quote: "As a fresher, UniNest helped me feel connected to the campus community instantly. The social feed is always buzzing with useful info.",
    name: "Jaspreet Kaur",
    school: "Guru Nanak Dev University",
    avatar: "https://picsum.photos/seed/testimonial3/100"
  },
];

const timeline = [
  { year: "2024", title: "The Vision", description: "Founded with a mission to simplify student life.", icon: Sparkles },
  { year: "2024 Q2", title: "First 1,000 Users", description: "Our community begins to take shape.", icon: Users },
  { year: "2025 Q1", title: "10,000 Strong", description: "Crossed 10k students & 200 vendors.", icon: Rocket },
  { year: "Future", title: "Global Expansion", description: "Connecting 100,000+ learners worldwide.", icon: GraduationCap },
];

const features = [
  {
    title: 'Social',
    description: 'See what\'s trending',
    icon: Users,
    href: '/social',
    color: 'bg-blue-500',
  },
  {
    title: 'Marketplace',
    description: 'Featured items',
    icon: Package,
    href: '/marketplace',
    color: 'bg-green-500',
  },
  {
    title: 'Study Hub',
    description: 'Upload & Share',
    icon: BookOpen,
    href: '/notes',
    color: 'bg-purple-500',
  },
  {
    title: 'Workspace',
    description: 'Compete & Grow',
    icon: LayoutGrid,
    href: '/workspace',
    color: 'bg-orange-500',
  },
];


export default function HomeClient() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-16 md:space-y-24">
      
      {/* Welcome and Search Section */}
      <section className="text-left">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Welcome to <span className="primary-gradient bg-clip-text text-transparent">UniNest!</span>
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">Your all-in-one digital campus hub ✨</p>
          <div className="mt-6 relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                  placeholder="Search for notes, products, or people..."
                  className="w-full rounded-full bg-card py-6 pl-12 text-base border-2"
              />
          </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href}>
              <Card className={`overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-48 flex flex-col justify-between text-white ${feature.color}`}>
                <CardHeader>
                    <div className="bg-white/20 rounded-lg p-3 w-min">
                        <feature.icon className="size-6" />
                    </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-white/80">{feature.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Hero Banner (Top) */}
      <section className="text-center bg-card p-8 md:p-12 rounded-2xl shadow-xl">
        <h1 className="text-3xl md:text-5xl font-bold font-headline tracking-tight">
          Join <span className="primary-gradient bg-clip-text text-transparent">10,000+ Students</span> Already on UniNest 🎓
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
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

      {/* Impact Numbers */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section>
          <h2 className="text-3xl font-headline font-bold text-center mb-12">Loved by Students Everywhere</h2>
           <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 5000 })]}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="h-full">
                      <CardContent className="flex flex-col items-center text-center justify-center p-6">
                         <Avatar className="w-20 h-20 mb-4 border-4 border-primary/20">
                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="person face" />
                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                        <p className="font-bold mt-4">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.school}</p>
                      </CardContent>
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
        <div className="grid md:grid-cols-4 gap-x-6 gap-y-10 max-w-5xl mx-auto">
            {timeline.map((item, index) => (
                <div key={item.title} className="text-center">
                     <div className="mb-4 flex justify-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 border-2 border-primary/20 shadow-sm">
                            <item.icon className="size-8" />
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{item.year}</p>
                    <h3 className="font-headline font-semibold text-xl">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                </div>
            ))}
        </div>
      </section>

       {/* Closing CTA */}
        <section className="text-center bg-card p-8 md:p-12 rounded-2xl shadow-xl max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold font-headline primary-gradient bg-clip-text text-transparent">Don’t Miss Out.</h2>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
            Be part of the fastest-growing student movement and supercharge your campus life.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" className="text-lg" asChild>
                <Link href="/signup">Get Started Now 🚀</Link>
            </Button>
          </div>
        </section>
      
    </div>
  );
}

    