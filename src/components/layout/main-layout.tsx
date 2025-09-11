'use client';

import React, { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
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
import NotificationsDropdown from './notifications-dropdown';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar className="hidden md:block">
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
                <NotificationsDropdown />
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
        <main className={cn("flex-1 overflow-y-auto p-4 md:p-8", isMobile && "pb-24")}>
          {children}
        </main>
      </SidebarInset>
      
      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}
    </SidebarProvider>
  );
}
