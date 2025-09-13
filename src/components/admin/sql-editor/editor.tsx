
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { runQuery } from '@/app/admin/sql/actions';
import { Loader2, Play, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const createSupportTicketsTableQuery = `
CREATE TABLE support_tickets (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'Open' NOT NULL, -- Open, In Progress, Closed, Archived
    priority TEXT DEFAULT 'Medium' NOT NULL, -- Low, Medium, High
    screenshot_url TEXT
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own tickets
CREATE POLICY "Allow individual user to insert their own tickets"
ON support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own tickets
CREATE POLICY "Allow individual user to view their own tickets"
ON support_tickets
FOR SELECT
USING (auth.uid() = user_id);

-- Allow admin to perform all operations
CREATE POLICY "Allow admin full access"
ON support_tickets
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-tickets', 'support-tickets', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for users to upload to their own folder
CREATE POLICY "Allow users to upload screenshots to their own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'support-tickets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy for users to view their own screenshots
CREATE POLICY "Allow users to view their own screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'support-tickets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Give admin full access to the bucket
CREATE POLICY "Give admin full access to support-tickets bucket"
ON storage.objects FOR ALL
USING ( bucket_id = 'support-tickets' AND public.is_admin(auth.uid()) );

`;

export default function SQLEditor() {
  const [query, setQuery] = useState(createSupportTicketsTableQuery.trim());
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunQuery = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    const { data, error: queryError } = await runQuery(query);

    if (queryError) {
      setError(queryError);
    } else {
      setResults(data);
    }
    setIsLoading(false);
  };
  
  const headers = results && results.length > 0 ? Object.keys(results[0]) : [];

  return (
    <div className="flex flex-col h-full gap-4">
      <Card className="flex-shrink-0">
        <CardContent className="p-4">
          <div className="grid gap-2">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="-- Your one-time setup query is pre-filled. Click 'Run Query' to create the support_tickets table."
              className="min-h-[150px] font-mono text-sm"
            />
            <Button onClick={handleRunQuery} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Play className="mr-2" />}
              Run Query
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex-grow overflow-auto">
        <Card className="h-full">
            <CardContent className="p-4 h-full">
                {isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                )}
                {error && (
                    <div className="flex flex-col items-center justify-center h-full text-destructive">
                        <AlertTriangle className="size-8 mb-2" />
                        <p className="font-bold">Query Error</p>
                        <pre className="mt-2 text-xs bg-destructive/10 p-2 rounded-md font-mono">{error}</pre>
                    </div>
                )}
                {results && (
                    <>
                        {results.length > 0 ? (
                            <div className="overflow-auto h-full">
                                <p className="text-sm text-muted-foreground mb-2">Returned {results.length} row{results.length === 1 ? '' : 's'}.</p>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.map((row, rowIndex) => (
                                            <TableRow key={rowIndex}>
                                                {headers.map(header => (
                                                    <TableCell key={`${rowIndex}-${header}`} className="font-mono text-xs max-w-[200px] truncate">
                                                        {JSON.stringify(row[header])}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p>Query executed successfully. If you ran the `CREATE TABLE` script, the 'support_tickets' table should now exist.</p>
                            </div>
                        )}
                    </>
                )}
                {!isLoading && !error && !results && (
                     <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Results will be displayed here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
