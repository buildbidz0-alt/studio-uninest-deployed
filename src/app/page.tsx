import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Briefcase, BookOpen, Users, GraduationCap, PenTool, LayoutDashboard } from 'lucide-react';
import { Logo } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-6">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  UniNest: The All-in-One Platform for Students & Libraries
                </h1>
                <p className="max-w-[600px] text-primary-foreground/80 md:text-xl">
                  Unlock your full potential with our suite of academic tools, a vibrant marketplace, and powerful collaboration features designed for the modern student.
                </p>
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Link
                    href="/signup"
                    className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-8 text-lg font-medium text-accent-foreground shadow transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-transparent px-8 text-lg font-medium shadow-sm transition-colors hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                 <Image
                    src="https://picsum.photos/seed/home-hero/600/400"
                    width="600"
                    height="400"
                    alt="Hero"
                    data-ai-hint="diverse students collaborating"
                    className="mx-auto overflow-hidden rounded-xl object-cover"
                  />
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything You Need to Succeed
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From social learning to resource management, UniNest integrates every aspect of student life into one seamless, enterprise-grade platform.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard icon={Users} title="Social Feed" description="Connect with peers, join study groups, and share your academic journey." />
              <FeatureCard icon={Briefcase} title="Marketplace" description="Buy and sell textbooks, notes, and other essentials in a secure, student-focused marketplace." />
              <FeatureCard icon={BookOpen} title="Study Hub" description="Upload, share, and discover notes. Get organized with our powerful resource management tools." />
              <FeatureCard icon={PenTool} title="AI Tools" description="Leverage AI for automatic note tagging, content summarization, and enhanced search capabilities." />
              <FeatureCard icon={LayoutDashboard} title="Vendor Dashboard" description="A dedicated space for campus vendors to manage listings, track sales, and connect with students." />
              <FeatureCard icon={GraduationCap} title="Community Growth" description="Join a global network of learners and educators dedicated to academic excellence and collaboration." />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-muted">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                        Trusted by Students Worldwide
                    </h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        See how UniNest is transforming the student experience on campuses across the globe.
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <TestimonialCard
                        name="Priya Sharma"
                        role="Computer Science Student"
                        avatar="https://picsum.photos/seed/priya/100"
                        testimonial="UniNest's marketplace helped me save hundreds on textbooks. The social feed is also great for finding study partners for tough courses."
                    />
                    <TestimonialCard
                        name="David Chen"
                        role="Business Administration Student"
                        avatar="https://picsum.photos/seed/david/100"
                        testimonial="The AI note tagging is a game-changer. It makes finding specific topics from past lectures incredibly fast. I feel so much more organized."
                    />
                     <TestimonialCard
                        name="Aisha Mohammed"
                        role="Medical Student"
                        avatar="https://picsum.photos/seed/aisha/100"
                        testimonial="As a vendor for student housing, the dashboard is incredibly intuitive. It’s never been easier to manage my listings and communicate with students."
                    />
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
          <div className="container px-4 md:px-6 grid gap-8 md:grid-cols-3">
              <div className="space-y-4">
                  <div className="flex items-center gap-2">
                      <Logo className="size-8" />
                      <h3 className="text-2xl font-semibold">UniNest</h3>
                  </div>
                  <p className="text-primary-foreground/80">Empowering the next generation of leaders and innovators.</p>
              </div>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:col-span-2">
                    <div className="space-y-2">
                        <h4 className="font-semibold text-lg">Quick Links</h4>
                        <ul className="space-y-1">
                            <li><Link href="/about" className="text-primary-foreground/80 hover:text-accent">About Us</Link></li>
                            <li><Link href="/feed" className="text-primary-foreground/80 hover:text-accent">Social Feed</Link></li>
                            <li><Link href="/marketplace" className="text-primary-foreground/80 hover:text-accent">Marketplace</Link></li>
                            <li><Link href="/notes" className="text-primary-foreground/80 hover:text-accent">Notes Hub</Link></li>
                        </ul>
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-semibold text-lg">Support</h4>
                        <ul className="space-y-1">
                            <li><Link href="#" className="text-primary-foreground/80 hover:text-accent">Contact Us</Link></li>
                            <li><Link href="#" className="text-primary-foreground/80 hover:text-accent">FAQ</Link></li>
                             <li><Link href="/terms" className="text-primary-foreground/80 hover:text-accent">Terms & Conditions</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold text-lg">Follow Us</h4>
                        <ul className="space-y-1">
                            <li><Link href="#" className="text-primary-foreground/80 hover:text-accent">Twitter</Link></li>
                            <li><Link href="#" className="text-primary-foreground/80 hover:text-accent">LinkedIn</Link></li>
                            <li><Link href="#" className="text-primary-foreground/80 hover:text-accent">Facebook</Link></li>
                        </ul>
                    </div>
               </div>
          </div>
          <div className="container px-4 md:px-6 mt-8 text-center text-primary-foreground/60 text-sm">
             © {new Date().getFullYear()} UniNest Inc. All Rights Reserved.
          </div>
      </footer>
    </div>
  );
}

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <Card className="p-6 text-center shadow-md hover:shadow-xl transition-shadow duration-300">
        <div className="mb-4 flex justify-center">
            <div className="bg-accent text-accent-foreground rounded-full p-3">
                <Icon className="size-8" />
            </div>
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </Card>
);

const TestimonialCard = ({ name, role, avatar, testimonial }: { name: string, role: string, avatar: string, testimonial: string }) => (
    <Card className="p-6 bg-background shadow-lg">
        <CardContent className="p-0">
            <p className="text-muted-foreground mb-4">"{testimonial}"</p>
            <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={avatar} alt={name} data-ai-hint="person face" />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-muted-foreground">{role}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);
