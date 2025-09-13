
'use client';

import React, { type ReactNode, useEffect, useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VendorSidebarNav } from '@/components/vendor/vendor-sidebar-nav';
import { Logo } from '@/components/icons';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function VendorLayout({ children }: { children: ReactNode }) {
  const { user, signOut, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (role === 'vendor') {
        setIsAuthorized(true);
      } else if (pathname.startsWith('/vendor/')) {
        // If the user is NOT a vendor but is trying to access a vendor route, redirect them.
        router.push('/');
      } else {
        // If not a vendor and not on a vendor route, they are authorized to be on whatever page they are on (e.g. /settings)
        // This case is handled by other layouts, but we can set authorized here too.
        setIsAuthorized(true);
      }
    }
  }, [role, loading, router, pathname]);
  
  if (loading || (role === 'vendor' && !isAuthorized)) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="size-8 animate-spin" />
            <p className="ml-2">Verifying vendor access...</p>
        </div>
    )
  }

  // If the user is not a vendor and is on a non-vendor page,
  // we just render the children without the vendor layout.
  // The main layout will handle these pages.
  if (role !== 'vendor' && !pathname.startsWith('/vendor/')) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <h1 className="text-xl font-semibold">Vendor Hub</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <VendorSidebarNav />
        </SidebarContent>
        <SidebarFooter>
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt="Vendor avatar" />
                <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm">
                <span className="font-semibold">{user?.user_metadata?.full_name || 'Vendor'}</span>
                <span className="text-muted-foreground">{user?.email}</span>
              </div>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
            <div className="flex items-center gap-2 md:hidden">
              <SidebarTrigger className="-ml-2" />
               <Logo className="size-7 text-primary" />
               <h1 className="text-lg font-semibold">Vendor Hub</h1>
            </div>
          <div className="flex flex-1 items-center justify-end gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="size-8">
                       {user && <AvatarImage src={user.user_metadata?.avatar_url || ''} alt="Admin avatar" />}
                      <AvatarFallback>
                        {user ? user.email?.[0].toUpperCase() : <UserIcon className="size-5" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                         <Link href="/settings">
                            <Settings className="mr-2 size-4" />
                            Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={signOut}>
                        <LogOut className="mr-2 size-4" />
                        Logout
                      </DropdownMenuItem>
                    </>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/40">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
