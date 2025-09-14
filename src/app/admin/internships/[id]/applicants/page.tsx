
import PageHeader from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Link from 'next/link';
import { getApplicants } from "./actions";

export default async function InternshipApplicantsPage({ params }: { params: { id: string } }) {
    const supabase = createClient();

    const { data: internship, error: internshipError } = await supabase
        .from('internships')
        .select('role, company')
        .eq('id', params.id)
        .single();
    
    if (internshipError || !internship) {
        notFound();
    }

    const { applications, error } = await getApplicants(params.id);

    if (error) {
        return <p>Error loading applications: {error}</p>
    }

    return (
        <div className="space-y-8">
            <PageHeader title={`Applicants for ${internship.role}`} description={`Review all applications for the position at ${internship.company}.`} />

            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Cover Letter</TableHead>
                                <TableHead className="text-right">Resume</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        No applications received yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                applications.map(app => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">{app.name}</TableCell>
                                        <TableCell>{app.email}</TableCell>
                                        <TableCell className="max-w-sm truncate text-muted-foreground">{app.cover_letter || 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={app.resume_url} target="_blank">
                                                    <Download className="mr-2 size-4" />
                                                    Download
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
