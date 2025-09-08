
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, IndianRupee } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Competitions | UniNest Workspace',
  description: 'Browse and apply for exclusive competitions.',
};

// Mock data - replace with API call
const competitions = [
  {
    id: 1,
    title: 'UniNest National Hackathon 2024',
    prize: 50000,
    deadline: '2024-08-31',
    entryFee: 0,
    description: 'Build an innovative solution to solve a real-world problem in 48 hours. Open to all students.'
  },
  {
    id: 2,
    title: 'Campus Photography Contest',
    prize: 10000,
    deadline: '2024-09-15',
    entryFee: 100,
    description: 'Capture the spirit of your campus. The best photo wins.'
  },
  {
    id: 3,
    title: 'AI Startup Pitch Challenge',
    prize: 100000,
    deadline: '2024-10-01',
    entryFee: 500,
    description: 'Pitch your AI-powered startup idea to a panel of venture capitalists.'
  },
];

export default function CompetitionsPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Competitions</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Challenge yourself, showcase your skills, and win exciting prizes.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map((comp) => (
          <Card key={comp.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{comp.title}</CardTitle>
              <CardDescription className="pt-2">{comp.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="size-4 text-amber-500" />
                  <span>Prize Pool: <span className="font-semibold text-foreground">₹{comp.prize.toLocaleString()}</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>Deadline: <span className="font-semibold text-foreground">{new Date(comp.deadline).toLocaleDateString()}</span></span>
              </div>
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IndianRupee className="size-4" />
                  <span>Entry Fee: {comp.entryFee > 0 ? <span className="font-semibold text-foreground">₹{comp.entryFee}</span> : <Badge variant="secondary">Free</Badge>}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Apply Now</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
