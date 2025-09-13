

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { runQuery } from '@/app/admin/sql/actions';
import { Loader2, Play, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const setupQueries = `
-- Run this query FIRST to enable the SQL Editor.
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    result_json json;
BEGIN
    EXECUTE 'SELECT json_agg(t) FROM (' || query || ') t' INTO result_json;
    RETURN result_json;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Then, run this query to create the support tickets table.
CREATE TABLE support_tickets (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    priority TEXT NOT NULL DEFAULT 'Medium',
    screenshot_url TEXT
);

-- Enable Row-Level Security for tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can insert their own tickets"
ON support_tickets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tickets"
ON support_tickets FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can do anything
CREATE POLICY "Admins can manage all tickets"
ON support_tickets FOR ALL
TO service_role;


-- The queries below have already been run. You can delete them.

-- **REVISED AND FIXED** Creates a function to get all chat rooms for a specific user
CREATE OR REPLACE FUNCTION get_user_chat_rooms(p_user_id uuid)
RETURNS TABLE(
    id uuid,
    created_at timestamptz,
    name text,
    avatar text,
    last_message text,
    last_message_timestamp timestamptz,
    unread_count bigint
) AS $$
BEGIN
    RETURN QUERY
    WITH room_participants AS (
        SELECT
            cp.room_id,
            p.full_name,
            p.avatar_url
        FROM chat_participants cp
        JOIN profiles p ON p.id = cp.user_id
        WHERE cp.room_id IN (SELECT room_id FROM chat_participants WHERE user_id = p_user_id)
          AND cp.user_id != p_user_id
    ),
    last_messages AS (
      SELECT DISTINCT ON (room_id)
        room_id,
        content,
        created_at
      FROM chat_messages
      ORDER BY room_id, created_at DESC
    ),
    unread_counts AS (
      SELECT
        room_id,
        count(*) as unread
      FROM chat_messages
      WHERE user_id != p_user_id AND is_read = false
      GROUP BY room_id
    )
    SELECT
      cr.id,
      cr.created_at,
      rp.full_name,
      rp.avatar_url,
      lm.content,
      lm.created_at,
      COALESCE(uc.unread, 0)
    FROM chat_rooms cr
    JOIN room_participants rp ON cr.id = rp.room_id
    LEFT JOIN last_messages lm ON cr.id = lm.room_id
    LEFT JOIN unread_counts uc ON cr.id = uc.room_id
    WHERE cr.id IN (SELECT room_id FROM chat_participants WHERE user_id = p_user_id)
    ORDER BY lm.created_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;


-- Creates a function to get or create a chat room between two users
CREATE OR REPLACE FUNCTION get_or_create_chat_room(p_user_id1 uuid, p_user_id2 uuid)
RETURNS TABLE(id uuid) AS $$
DECLARE
    v_room_id uuid;
BEGIN
    -- Try to find an existing room
    SELECT cr.id INTO v_room_id
    FROM chat_rooms cr
    JOIN chat_participants cp1 ON cr.id = cp1.room_id
    JOIN chat_participants cp2 ON cr.id = cp2.room_id
    WHERE cp1.user_id = p_user_id1 AND cp2.user_id = p_user_id2
    LIMIT 1;

    -- If no room is found, create a new one
    IF v_room_id IS NULL THEN
        INSERT INTO chat_rooms DEFAULT VALUES RETURNING chat_rooms.id INTO v_room_id;
        INSERT INTO chat_participants (room_id, user_id) VALUES (v_room_id, p_user_id1);
        INSERT INTO chat_participants (room_id, user_id) VALUES (v_room_id, p_user_id2);
    END IF;

    -- Return the room ID
    RETURN QUERY SELECT v_room_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to authenticated users to call the functions
GRANT EXECUTE ON FUNCTION get_or_create_chat_room TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_chat_rooms TO authenticated;
`;

export default function SQLEditor() {
  const [query, setQuery] = useState(setupQueries.trim());
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
      // Check if the returned data contains a database error
      if (Array.isArray(data) && data.length > 0 && data[0].error) {
        setError(data[0].error);
      } else {
        setResults(data);
      }
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
              placeholder="-- Your one-time setup query is pre-filled. Click 'Run Query' to create the necessary database functions."
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
                                <p>Query executed successfully. The database functions should now be available.</p>
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
