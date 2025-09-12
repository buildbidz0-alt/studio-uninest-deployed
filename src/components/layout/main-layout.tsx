
'use client';

import React, { type ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarNav, MobileBottomNav } from './sidebar-nav';
import { Logo } from '@/components/icons';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Heart, Loader2 } from 'lucide-react';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (role === 'admin' && !pathname.startsWith('/admin')) {
        router.push('/admin/dashboard');
      } else if (role === 'vendor' && !pathname.startsWith('/vendor')) {
        router.push('/vendor/dashboard');
      }
    }
  }, [loading, role, pathname, router]);

  const isAdminPage = pathname.startsWith('/admin');
  const isVendorPage = pathname.startsWith('/vendor');
  const isHomePage = pathname === '/';

  if (isAdminPage || isVendorPage) {
    return <>{children}</>;
  }

  if (loading) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="size-8 animate-spin" />
          </div>
      )
  }


  return (
    <SidebarProvider>
      <Sidebar className="hidden md:flex flex-col">
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg">
                <Logo className="size-6 text-white" />
            </div>
            <h1 className="text-xl font-headline font-bold">UniNest</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
          {user ? (
            <div className="flex items-center justify-between">
                <Link href="/profile" className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={user.user_metadata?.avatar_url || ''} alt="User avatar" />
                      <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-sm overflow-hidden">
                      <span className="font-semibold truncate">{user.user_metadata?.full_name || 'User'}</span>
                      <span className="text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </div>
                </Link>
            </div>
          ) : (
             <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback>G</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm">
                  <span className="font-semibold">Guest</span>
                  <Link href="/login" className="text-sm primary-gradient bg-clip-text text-transparent font-semibold">
                    Login
                  </Link>
                </div>
              </div>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex md:hidden h-14 items-center justify-between border-b bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-1">
              <SidebarTrigger />
               <Link href="/" className="flex items-center gap-2">
                 <Logo className="size-7 text-primary" />
                 <h1 className="text-lg font-semibold">UniNest</h1>
              </Link>
            </div>
             <div className="flex items-center gap-1">
               <Button asChild size="sm" variant="secondary" className="rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900">
                  <Link href="/donate">
                    <Heart className="size-4" />
                    <span className="ml-1 font-bold">Donate</span>
                  </Link>
               </Button>
            </div>
        </header>
        <main className={cn(
            "flex-1 overflow-y-auto p-8", 
            isMobile && isHomePage && "p-0 py-4",
            isMobile && !isHomePage && "p-4",
            isMobile && "pb-24"
        )}>
          {children}
        </main>
      </SidebarInset>
      
      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}
    </SidebarProvider>
  );
}
