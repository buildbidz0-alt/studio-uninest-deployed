
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Building, Calendar, IndianRupee, FileText, Share2, MapPin } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

type Internship = {
    id: number;
    role: string;
    company: string;
    stipend: number;
    stipend_period: string;
    deadline: string;
    location: string;
    image_url: string | null;
    details_pdf_url: string | null;
    description?: string | null; // Assuming description can be part of it
};

type InternshipDetailClientProps = {
    internship: Internship;
}

export default function InternshipDetailClient({ internship }: InternshipDetailClientProps) {

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            <div className="space-y-4">
                {internship.image_url && (
                    <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-lg">
                        <Image src={internship.image_url} alt={internship.company} fill className="object-cover" data-ai-hint="company banner office building" />
                    </div>
                )}
                 <div className="space-y-2">
                    <Badge variant="outline">{internship.company}</Badge>
                    <h1 className="text-4xl font-bold font-headline">{internship.role}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <IndianRupee className="size-5" />
                        <span>{internship.stipend > 0 ? <span className="font-bold text-foreground">₹{internship.stipend.toLocaleString()}/{internship.stipend_period}</span> : <Badge variant="secondary">Unpaid</Badge>}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="size-5" />
                        <span>Apply by <span className="font-bold text-foreground">{format(new Date(internship.deadline), 'PPP')}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="size-5" />
                        <span className="font-bold text-foreground">{internship.location}</span>
                    </div>
                </div>
            </div>

            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                <p>{internship.description || 'No detailed description provided. Please refer to the official job description if available.'}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                <Button size="lg" className="flex-1">
                    <Briefcase className="mr-2"/>
                    Apply Now
                </Button>
                {internship.details_pdf_url && (
                    <Button size="lg" variant="outline" className="flex-1" asChild>
                        <a href={internship.details_pdf_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-2"/>
                            Job Description (PDF)
                        </a>
                    </Button>
                )}
                <Button size="lg" variant="ghost" className="flex-1">
                    <Share2 className="mr-2"/>
                    Share
                </Button>
            </div>
        </div>
    );
}
