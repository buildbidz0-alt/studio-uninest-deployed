

'use client';

import { usePathname } from 'next/navigation';
import { Home, Newspaper, ShoppingBag, BookOpen, UserCog, LogOut, Settings, Heart, LayoutGrid, Info, MessageSquare, Users, Trophy, Briefcase, User as UserIcon } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
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
  const { setOpen } = useSidebar();
  const role = getRole(user);

  const handleLinkClick = () => {
    // This is for the desktop sidebar, which doesn't need to close.
    // The mobile sidebar logic is in MobileBottomNav.
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
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  }

  const getNavItems = () => {
    if (pathname.startsWith('/social') || pathname.startsWith('/feed') || pathname.startsWith('/chat')) {
      return [
        { href: '/feed', label: 'Feed', icon: Newspaper },
        { href: '/chat', label: 'Messages', icon: MessageSquare },
        { href: '/profile', label: 'Profile', icon: 'avatar' },
      ];
    }
    if (pathname.startsWith('/workspace')) {
        return [
            { href: '/workspace/competitions', label: 'Competitions', icon: Trophy },
            { href: '/workspace/internships', label: 'Internships', icon: Briefcase },
            { href: '/profile', label: 'Profile', icon: 'avatar' },
        ];
    }
    // Default main navigation
    return [
      { href: '/', label: 'Home', icon: Home },
      { href: '/marketplace', label: 'Market', icon: ShoppingBag },
      { href: '/social', label: 'Social', icon: Users },
      { href: '/workspace', label: 'Work', icon: LayoutGrid },
      { href: '/profile', label: 'Profile', icon: 'avatar' },
    ];
  };

  const navItems = getNavItems();
  const gridColsClass = `grid-cols-${navItems.length}`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t shadow-t-lg z-50">
        <div className={cn("h-full w-full grid", `grid-cols-${navItems.length}`)}>
            {navItems.map(item => {
                let isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);

                 // Special case for profile to avoid being active on other users' profiles unless it's the dedicated nav item
                if (item.href === '/profile') {
                    isActive = pathname === '/profile' || pathname === '/settings';
                }

                return (
                    <Link 
                        key={item.href} 
                        href={item.href} 
                        onClick={handleLinkClick}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                    >
                        {item.icon === 'avatar' ? (
                            <div className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center",
                                isActive && "bg-muted"
                            )}>
                                <Avatar className="w-6 h-6">
                                    {user && <AvatarImage src={user.user_metadata?.avatar_url} />}
                                    <AvatarFallback className="text-xs">
                                        {user ? user.email?.[0].toUpperCase() : <UserIcon className="size-4" />}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        ) : (
                            <item.icon className="size-5" />
                        )}
                        <span className="text-xs font-label">{item.label}</span>
                    </Link>
                )
            })}
        </div>
    </nav>
  )
}
