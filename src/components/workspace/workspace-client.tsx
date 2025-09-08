
'use client';
  
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Trophy, PlusCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function WorkspaceClient() {
  const { role } = useAuth();
  const isAdmin = role === 'admin' || role === 'vendor'; // Assuming vendors can also be admins for now

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Workspace</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Compete. Learn. Grow. – Unlock your potential with UniNest.
        </p>
         <div className="mt-8 flex justify-center">
          <Button asChild>
            <Link href="/workspace/suggest">
              Have a listing to suggest?
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="shadow-lg transition-shadow hover:shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                    <Trophy className="text-amber-500" />
                    Competitions
                    </CardTitle>
                    <CardDescription className="mt-2">
                    Test your skills and win amazing prizes in exclusive competitions.
                    </CardDescription>
                </div>
                 {isAdmin && (
                    <Button size="sm" variant="outline">
                        <PlusCircle className="mr-2 size-4"/>
                        Add New
                    </Button>
                 )}
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/workspace/competitions">View Competitions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg transition-shadow hover:shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                    <Briefcase className="text-sky-500" />
                    Internships
                    </CardTitle>
                    <CardDescription className="mt-2">
                    Gain real-world experience with internships from top companies.
                    </CardDescription>
                </div>
                {isAdmin && (
                    <Button size="sm" variant="outline">
                        <PlusCircle className="mr-2 size-4"/>
                        Add New
                    </Button>
                 )}
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/workspace/internships">View Internships</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
