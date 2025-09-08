
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Briefcase, BookOpen, Users, GraduationCap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Welcome to Uninest
                  </h1>
                  <p className="max-w-[600px] text-primary-foreground/80 md:text-xl">
                    Your all-in-one platform for student life. Connect with peers, find study materials, and buy or sell goods in our marketplace.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/signup"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-8 text-sm font-medium text-accent-foreground shadow transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Join Now
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-transparent px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent/90 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <Image
                src="https://picsum.photos/seed/home-hero/600/400"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="happy students studying"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything a Student Needs
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Uninest provides a seamless experience, integrating social networking, academic resources, and a marketplace into a single, easy-to-use platform.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <Users className="mx-auto h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Social Feed</h3>
                <p className="text-muted-foreground">
                  Connect with classmates, join study groups, and stay updated on campus events.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Notes Hub</h3>
                <p className="text-muted-foreground">
                  Share and discover study notes, summaries, and lecture materials.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Marketplace</h3>
                <p className="text-muted-foreground">
                  Buy and sell textbooks, furniture, and other essentials with fellow students.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
