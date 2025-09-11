
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Social Hub | UniNest',
  description: 'Connect with the UniNest community through the social feed and direct messages.',
};

export default function SocialPage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Social Hub</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Connect with the UniNest community. Share updates on the feed or chat directly with peers and vendors.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="shadow-lg transition-shadow hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Newspaper className="text-blue-500" />
              Social Feed
            </CardTitle>
            <CardDescription className="mt-2">
              Catch up on the latest posts, news, and events from the campus community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/feed">Go to Feed</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg transition-shadow hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MessageSquare className="text-green-500" />
              Direct Messages
            </CardTitle>
            <CardDescription className="mt-2">
              Chat directly with other students, vendors, and connections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/chat">Open Chats</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
