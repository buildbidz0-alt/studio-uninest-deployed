
'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Search, ShoppingBag, Users, Armchair, Bell, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DonationModal from '@/components/home/donation-modal';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


const quickAccessItems = [
    { title: "Social Feed", description: "See what's trending", icon: Users, href: "/feed", color: "from-blue-400 to-blue-500" },
    { title: "Marketplace", description: "Featured items", icon: ShoppingBag, href: "/marketplace", color: "from-green-400 to-green-500" },
    { title: "Study Hub", description: "Upload & Share", icon: BookOpen, href: "/notes", color: "from-purple-400 to-purple-500" },
    { title: "Library Booking", description: "Book a Seat", icon: Armchair, href: "/booking", color: "from-orange-400 to-orange-500" },
];

const featuredVendors = [
    { name: "Campus Prints", avatar: "https://picsum.photos/seed/vendor1/100", category: "Printing" },
    { name: "The Study Cafe", avatar: "https://picsum.photos/seed/vendor2/100", category: "Cafe" },
    { name: "Bookworm's Corner", avatar: "https://picsum.photos/seed/vendor3/100", category: "Bookstore" },
    { name: "Quick Bites", avatar: "https://picsum.photos/seed/vendor4/100", category: "Food" },
    { name: "Tech Repairs", avatar: "https://picsum.photos/seed/vendor5/100", category: "Services" },
]

export default function HomeClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const hasSeenModal = localStorage.getItem('donationModalSeen');
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsModalOpen(true);
        localStorage.setItem('donationModalSeen', 'true');
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <DonationModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      <div className="space-y-8 md:space-y-12">
        {/* Top Header / Hero */}
        <section className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div className="order-2 sm:order-1">
                    <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Welcome to UniNest!</h1>
                    <p className="text-muted-foreground text-lg">Your digital campus hub ✨</p>
                 </div>
                 <div className="order-1 sm:order-2 flex items-center gap-2 self-end sm:self-center">
                     <Button variant="ghost" size="icon" className="rounded-full">
                         <Bell className="size-5" />
                     </Button>
                      <Link href="/profile">
                        <Avatar className="size-10 cursor-pointer">
                          {user && <AvatarImage src={user.user_metadata?.avatar_url} alt="User avatar" />}
                          <AvatarFallback>
                            {user ? user.email?.[0].toUpperCase() : <Users className="size-5" />}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                 </div>
            </div>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input placeholder="Search for notes, products, or people..." className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-full shadow-sm focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
        </section>

        {/* Quick Access Section */}
        <section>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {quickAccessItems.map(item => (
                    <Link href={item.href} key={item.title}>
                        <Card className={`text-white overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-transform duration-300 bg-gradient-to-br ${item.color}`}>
                            <CardContent className="p-4 md:p-6 flex flex-col items-start justify-between aspect-square">
                                <div className="bg-white/20 rounded-full p-3">
                                    <item.icon className="size-6 md:size-8" />
                                </div>
                                <div className="mt-auto">
                                    <h3 className="font-headline font-bold text-lg md:text-xl">{item.title}</h3>
                                    <p className="text-white/80 text-sm">{item.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
        
        {/* Bottom Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                <h2 className="text-2xl font-headline font-bold">Featured Vendors</h2>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {featuredVendors.map((vendor, index) => (
                        <CarouselItem key={index} className="sm:basis-1/2 lg:basis-1/3">
                            <Card className="text-center transition-all hover:shadow-xl">
                                <CardContent className="p-6 flex flex-col items-center gap-2">
                                    <Avatar className="size-20 border-4 border-background">
                                        <AvatarImage src={vendor.avatar} data-ai-hint="person company logo" />
                                        <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="font-bold font-headline">{vendor.name}</p>
                                    <p className="text-sm text-muted-foreground">{vendor.category}</p>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>
            </div>
            <div className="space-y-4">
                <h2 className="text-2xl font-headline font-bold">Trending Hashtags</h2>
                <div className="p-6 bg-card rounded-2xl shadow-sm space-y-3">
                    {["#examtips", "#cs50", "#campuslife", "#internships2024"].map(tag => (
                        <p key={tag} className="text-muted-foreground font-medium hover:text-primary cursor-pointer transition-colors">{tag}</p>
                    ))}
                </div>
            </div>
        </section>
      </div>
    </>
  );
}
