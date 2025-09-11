'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import PageHeader from '@/components/admin/page-header';

export default function AdminSetupPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleMakeAdmin = async () => {
    if (!email) {
      toast({ variant: 'destructive', title: 'Email is required.' });
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.');
      }

      toast({
        title: 'Success!',
        description: `User ${email} has been promoted to admin.`,
      });
      setEmail('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to promote user.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
        <PageHeader title="Admin Setup Utility" description="Use this page to create your first admin user." />
        <Card className="max-w-lg">
            <CardHeader>
                <CardTitle>Promote a User to Admin</CardTitle>
                <CardDescription>
                    First, sign up as a regular user. Then, enter that user's email here to grant them admin privileges. For security, please delete this file after use.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="email">User Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <Button onClick={handleMakeAdmin} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Make Admin
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
