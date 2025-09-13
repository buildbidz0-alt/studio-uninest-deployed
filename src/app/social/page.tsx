
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, MessageSquare, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Social Hub | UniNest',
  description: 'Connect with the UniNest community through the social feed and direct messages.',
};

export default function SocialPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-primary">UniNest Social</h1>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
             <p className="text-xs text-center text-muted-foreground mt-2">Login to access your chats.</p>
          </CardContent>
        </Card>

         <Card className="shadow-lg transition-shadow hover:shadow-xl md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="text-purple-500" />
              AI Assistant
            </CardTitle>
            <CardDescription className="mt-2">
              Ask questions, get summaries, and explore campus knowledge with your AI pal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/ai/chat">Chat with AI</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
