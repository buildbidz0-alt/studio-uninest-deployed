
import type { Metadata } from 'next';
import Image from 'next/image';
import { Users, Target, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Uninest',
  description: 'Learn more about Uninest and our mission to empower students.',
};

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About Uninest</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Uninest is dedicated to enhancing the student experience by providing a centralized platform for academic, social, and commercial needs.
        </p>
      </section>

      <section>
        <div className="relative h-64 md:h-96 rounded-xl overflow-hidden">
          <Image
            src="https://picsum.photos/seed/about-team/1200/400"
            alt="Our Team"
            layout="fill"
            objectFit="cover"
            data-ai-hint="diverse group students"
          />
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Our Mission</h2>
          <p className="mt-4 text-muted-foreground">
            Our mission is to simplify student life. We believe that by connecting students and providing easy access to resources, we can foster a more collaborative and supportive educational environment. We aim to be the go-to digital campus for students worldwide, where they can thrive academically and socially.
          </p>
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Our Vision</h2>
          <p className="mt-4 text-muted-foreground">
            We envision a world where every student has the tools they need to succeed at their fingertips. Uninest strives to break down barriers, whether it's finding an affordable textbook, getting help on a difficult subject, or simply making new friends on campus.
          </p>
        </div>
      </section>

       <section className="bg-muted rounded-lg p-8">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Why We Started</h2>
          <div className="max-w-4xl mx-auto text-center text-muted-foreground">
            <p>
              Uninest was born from our own experiences as students. We juggled multiple apps and websites for everything: one for class notes, another for buying books, and several for social connections. It was disjointed and inefficient. We knew there had to be a better way. We created Uninest to be the single, integrated solution we wish we had—a place to build community, share knowledge, and make student life easier.
            </p>
          </div>
        </section>

    </div>
  );
}
