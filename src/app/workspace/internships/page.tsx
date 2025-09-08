
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Building, Calendar, IndianRupee } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Find Internships & Apply Easily',
  description: 'Browse and apply for internships from top companies. Gain real-world experience and kickstart your career with UniNest.',
};

// TODO: Fetch internships from your API
const internships: any[] = [];

export default function InternshipsPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Internships</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Kickstart your career with valuable industry experience.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {internships.length > 0 ? (
            internships.map((internship) => (
            <Card key={internship.id} className="flex flex-col">
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Briefcase className="size-5 text-sky-500"/>
                    {internship.role}
                </CardTitle>
                <CardDescription className="pt-2 flex items-center gap-2">
                    <Building className="size-4"/>{internship.company}
                </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IndianRupee className="size-4" />
                    <span>Stipend: {internship.stipend > 0 ? <span className="font-semibold text-foreground">₹{internship.stipend.toLocaleString()}/{internship.stipendPeriod}</span> : <Badge variant="secondary">Unpaid</Badge>}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>Apply by: <span className="font-semibold text-foreground">{new Date(internship.deadline).toLocaleDateString()}</span></span>
                </div>
                <Badge>{internship.location}</Badge>
                </CardContent>
                <CardFooter>
                <Button className="w-full">Apply Now</Button>
                </CardFooter>
            </Card>
            ))
        ) : (
            <div className="text-center text-muted-foreground py-16 md:col-span-3">
              <h2 className="text-xl font-semibold">No Internships Found</h2>
              <p>There are no internship listings at the moment. Please check back later.</p>
            </div>
        )}
      </div>
    </div>
  );
}
