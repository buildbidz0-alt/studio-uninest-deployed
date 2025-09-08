
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Building, Calendar, IndianRupee } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Internships | UniNest Workspace',
  description: 'Find and apply for internships from top companies.',
};

// Mock data - replace with API call
const internships = [
  {
    id: 1,
    company: 'Tech Innovators Inc.',
    role: 'Software Engineer Intern',
    stipend: 30000,
    stipendPeriod: 'month',
    deadline: '2024-08-20',
    location: 'Remote',
  },
  {
    id: 2,
    company: 'Marketing Gurus',
    role: 'Digital Marketing Intern',
    stipend: 15000,
    stipendPeriod: 'month',
    deadline: '2024-09-01',
    location: 'Bangalore',
  },
  {
    id: 3,
    company: 'Design Studio X',
    role: 'UI/UX Design Intern',
    stipend: 0,
    stipendPeriod: 'month',
    deadline: '2024-08-25',
    location: 'Part-time, Remote',
  },
];

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
        {internships.map((internship) => (
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
        ))}
      </div>
    </div>
  );
}
