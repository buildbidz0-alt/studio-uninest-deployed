'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, BookOpen, Briefcase, Heart, Newspaper, Package, Search, Sparkles, Users, User, Trophy, LayoutGrid, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const features = [
  {
    title: 'Social Feed',
    description: 'See what\'s trending',
    icon: Users,
    href: '/feed',
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
  
  const handleScroll = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16 md:space-y-24">
      
      {/* New Welcome and Search Section */}
      <section className="text-left">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Welcome to <span className="primary-gradient bg-clip-text text-transparent">UniNest!</span>
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">Your digital campus hub ✨</p>
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

      {/* Existing Sections can go here... for now we keep it clean */}
      
    </div>
  );
}
