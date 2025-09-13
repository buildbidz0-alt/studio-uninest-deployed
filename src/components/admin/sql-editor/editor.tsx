
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { runQuery } from '@/app/admin/sql/actions';
import { Loader2, Play, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const createIsAdminFunctionQuery = `
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

export default function SQLEditor() {
  const [query, setQuery] = useState(createIsAdminFunctionQuery.trim());
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
              placeholder="-- Your one-time setup query is pre-filled. Click 'Run Query' to create the 'is_admin' function."
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
                                <p>Query executed successfully. If you ran the `CREATE FUNCTION` script, the 'is_admin' function should now exist.</p>
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
