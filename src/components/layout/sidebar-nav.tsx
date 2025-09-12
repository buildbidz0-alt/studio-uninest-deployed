

'use client';

import { usePathname } from 'next/navigation';
import { Home, Newspaper, ShoppingBag, BookOpen, Armchair, UserCog, LogOut, Settings, Heart, LayoutGrid, Info, MessageSquare, Users } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

const mainNavItems = [
  { href: '/', label: 'Home', icon: Home, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/social', label: 'Social', icon: Users, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag, roles: ['student', 'guest', 'vendor', 'admin'] },
  { href: '/workspace', label: 'Workspace', icon: LayoutGrid, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/notes', label: 'Study Hub', icon: BookOpen, roles: ['student', 'vendor', 'guest', 'admin'] },
];

const secondaryNavItems = [
  { href: '/about', label: 'About Us', icon: Info, roles: ['student', 'vendor', 'guest', 'admin'] },
];

type UserRole = 'student' | 'vendor' | 'admin' | 'guest';

function getRole(user: any): UserRole {
    if (!user) return 'guest';
    return user.user_metadata?.role || 'student';
}

export function SidebarNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();
  const role = getRole(user);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }

  const renderNavItems = (items: typeof mainNavItems) => {
    return items
      .filter(item => item.roles.includes(role))
      .map(item => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href) && item.href !== '/'}
            className="font-headline"
            onClick={handleLinkClick}
          >
            <Link href={item.href}>
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ));
  };
  
  return (
    <SidebarMenu>
       <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname === '/'}
            className="font-headline"
            onClick={handleLinkClick}
          >
            <Link href={'/'}>
              <Home className="size-5" />
              <span>Home</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

      <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith('/social') || pathname.startsWith('/feed') || pathname.startsWith('/chat')}
            className="font-headline"
            onClick={handleLinkClick}
          >
            <Link href={'/social'}>
              <Users className="size-5" />
              <span>Social</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      
      <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith('/marketplace')}
            className="font-headline"
            onClick={handleLinkClick}
          >
            <Link href={'/marketplace'}>
              <ShoppingBag className="size-5" />
              <span>Marketplace</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

      <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith('/workspace')}
            className="font-headline"
            onClick={handleLinkClick}
          >
            <Link href={'/workspace'}>
              <LayoutGrid className="size-5" />
              <span>Workspace</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      
      <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith('/notes')}
            className="font-headline"
            onClick={handleLinkClick}
          >
            <Link href={'/notes'}>
              <BookOpen className="size-5" />
              <span>Study Hub</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      

      <SidebarMenuItem>
        <Separator className="my-2" />
      </SidebarMenuItem>

      {renderNavItems(secondaryNavItems)}


        <div className='flex-grow' />

         <SidebarMenuItem>
            <SidebarMenuButton asChild variant="secondary" className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900 font-bold border-amber-200 dark:border-amber-800 border-2" onClick={handleLinkClick}>
                <Link href="/donate">
                    <Heart className="size-5" />
                    <span>Donate</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>

        {role === 'admin' && (
             <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/admin')}
                    className="font-headline"
                    onClick={handleLinkClick}
                >
                    <Link href="/admin/dashboard">
                    <UserCog className="size-5" />
                    <span>Admin Panel</span>
                    </Link>
                </SidebarMenuButton>
             </SidebarMenuItem>
        )}
        
        {user && (
            <>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/settings'} className="font-headline" onClick={handleLinkClick}>
                         <Link href="/settings">
                            <Settings className="size-5" />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => { handleLinkClick(); signOut(); }} className="font-headline text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400">
                        <LogOut className="size-5" />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </>
        )}
    </SidebarMenu>
  );
}


export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = getRole(user);

  const mobileNavItems = [
      { href: '/', label: 'Home', icon: Home },
      { href: '/marketplace', label: 'Market', icon: ShoppingBag },
      { href: '/social', label: 'Social', icon: Users },
      { href: '/workspace', label: 'Work', icon: LayoutGrid },
      { href: '/profile', label: 'Profile', icon: 'avatar' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t shadow-t-lg z-50">
        <div className="h-full w-full grid grid-cols-5">
            {mobileNavItems.map(item => {
                 // Special handling for social pages to highlight the feed icon
                let isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);
                
                if (item.href === '/social' && (pathname.startsWith('/feed') || pathname.startsWith('/chat'))) {
                    isActive = true;
                }

                // Adjust profile link activation
                if (item.href === '/profile' && (pathname.startsWith('/profile') || pathname.startsWith('/settings'))) {
                    isActive = true;
                }

                // Adjust workspace link activation
                if (item.href === '/workspace' && (pathname.startsWith('/workspace'))) {
                    isActive = true;
                }


                return (
                    <Link 
                        key={item.href} 
                        href={item.href} 
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 transition-colors",
                            isActive ? "primary-gradient bg-clip-text text-transparent font-bold" : "text-muted-foreground hover:text-primary"
                        )}
                    >
                        {item.icon === 'avatar' ? (
                            <div className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center",
                                isActive && "primary-gradient p-0.5"
                            )}>
                                <Avatar className="w-full h-full">
                                    {user && <AvatarImage src={user.user_metadata?.avatar_url} />}
                                    <AvatarFallback className="text-xs">
                                        {user ? user.email?.[0].toUpperCase() : 'G'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        ) : (
                            <item.icon className="size-6" />
                        )}
                        <span className="text-xs font-label">{item.label}</span>
                    </Link>
                )
            })}
        </div>
    </nav>
  )
}
