
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Trophy } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Donate | UniNest',
  description: 'Support UniNest and help keep the platform running for students everywhere.',
};

// Placeholder data - replace with API calls
const raisedAmount = 3500;
const goalAmount = 10000;
const progressPercentage = (raisedAmount / goalAmount) * 100;

const topDonors = [
  { name: 'Priya Sharma', amount: 500, avatar: 'https://picsum.photos/seed/priya/100' },
  { name: 'David Chen', amount: 300, avatar: 'https://picsum.photos/seed/david/100' },
  { name: 'Anonymous', amount: 250, avatar: '' },
];


export default function DonatePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Support UniNest</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          UniNest runs on community support. Your contribution helps us cover our monthly server costs and continue building a better platform for students.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Help Us Reach Our Goal</CardTitle>
            <CardDescription>
              Our monthly server cost is ₹10,000. Every rupee helps keep the platform running and ad-free for everyone. Even ₹50 makes a difference ❤️.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-sm font-medium">
                <span className="text-primary">Raised: ₹{raisedAmount.toLocaleString()}</span>
                <span className="text-muted-foreground">Goal: ₹{goalAmount.toLocaleString()}</span>
              </div>
            </div>
             {/* This button is a placeholder for Razorpay integration */}
            <Button size="lg" className="w-full text-lg">
                <Heart className="mr-2 size-5" />
                Donate Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="text-amber-500" />
              Top Donors This Month
            </CardTitle>
            <CardDescription>Thank you for your incredible support!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topDonors.map((donor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {donor.avatar && <AvatarImage src={donor.avatar} alt={donor.name} data-ai-hint="person face" />}
                    <AvatarFallback>{donor.name === 'Anonymous' ? 'A' : donor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{donor.name}</p>
                    <p className="text-sm text-muted-foreground">Donated ₹{donor.amount}</p>
                  </div>
                </div>
                <div className="font-bold text-lg text-primary">#{index + 1}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

       <section className="text-center bg-muted p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-primary">Your Impact</h2>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
            Your donation directly supports our mission to provide a free, high-quality, and unified digital ecosystem for students. It allows us to maintain our servers, develop new features, and expand our reach to help more learners worldwide.
          </p>
        </section>
    </div>
  );
}
