import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    FolderGit2,
    Globe,
    LayoutGrid,
    MapPinned,
    Shield,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as businessPartnersIndex } from '@/routes/business-partners';
import { index as countriesIndex } from '@/routes/countries';
import { index as postalcodesIndex } from '@/routes/postalcodes';
import { index as rolsIndex } from '@/routes/rols';
import { index as usersIndex } from '@/routes/users';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Rols',
        href: rolsIndex(),
        icon: Shield,
    },
    {
        title: 'Usuaris',
        href: usersIndex(),
        icon: Users,
    },
    {
        title: 'Business Partners',
        href: businessPartnersIndex(),
        icon: Building2,
    },
    {
        title: 'Countries',
        href: countriesIndex(),
        icon: Globe,
    },
    {
        title: 'Postal Codes (ES)',
        href: postalcodesIndex(),
        icon: MapPinned,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
