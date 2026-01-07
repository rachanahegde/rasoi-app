'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home,
    BookOpen,
    Sparkles,
    Settings,
    Bell,
    Heart,
    Calendar as CalendarIcon,
    PenTool,
    Moon,
    ChefHat,
    Utensils,
    Flame,
    Coffee,
    Beef,
    Soup,
    Globe,
    Zap,
    Pizza,
    Donut,
    Fish,
    Croissant,
    Grape,
    Drumstick,
    Leaf,
    User
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import NavItem from './NavItem';

export default function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const { darkMode, toggleDarkMode } = useTheme();
    const { chefAvatar, chefImage } = useUser();

    const AVATAR_ICONS = {
        Hat: ChefHat,
        Flame: Flame,
        Leaf: Leaf,
        Donut: Donut,
        Fish: Fish,
        Globe: Globe,
        Croissant: Croissant,
        Grape: Grape,
        Coffee: Coffee,
        Drumstick: Drumstick,
        Pizza: Pizza,
        Zap: Zap
    };

    const CurrentIcon = AVATAR_ICONS[chefAvatar] || User;

    const isActive = (path) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    const navigateTo = (path) => {
        router.push(path);
    };

    return (
        <>
            {/* SIDEBAR - Leather Binding Look */}
            <aside className="hidden md:flex w-24 flex-col items-center py-8 bg-sidebar border-r border-sidebar-border fixed h-full z-50 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)]">
                <nav className="flex-1 flex flex-col gap-6 w-full px-4 mt-10">
                    <NavItem icon={Home} label="Home" active={isActive('/')} onClick={() => navigateTo('/')} />
                    <NavItem icon={BookOpen} label="Recipes" active={isActive('/recipes')} onClick={() => navigateTo('/recipes')} />
                    <NavItem icon={PenTool} label="Draft" active={isActive('/generate')} onClick={() => navigateTo('/generate')} />
                    <div className="h-px bg-sidebar-border w-12 mx-auto my-2" />
                    <NavItem icon={CalendarIcon} label="Plan" active={isActive('/calendar')} onClick={() => navigateTo('/calendar')} />
                </nav>

                <div className="flex flex-col gap-6 mt-auto">
                    <Bell
                        className={`w-6 h-6 cursor-pointer hover:text-foreground transition-colors ${isActive('/activity') ? 'text-foreground' : 'text-muted-foreground'}`}
                        onClick={() => navigateTo('/activity')}
                    />
                    <Settings
                        className={`w-6 h-6 cursor-pointer hover:text-foreground transition-colors ${isActive('/settings') ? 'text-foreground' : 'text-muted-foreground'}`}
                        onClick={() => navigateTo('/settings')}
                    />
                    <Moon
                        className={`w-6 h-6 cursor-pointer hover:text-foreground transition-colors ${darkMode ? 'text-foreground fill-current' : 'text-muted-foreground'}`}
                        onClick={toggleDarkMode}
                    />
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-inner cursor-pointer hover:scale-110 transition-all overflow-hidden bg-background ${isActive('/profile') ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
                        onClick={() => navigateTo('/profile')}
                    >
                        {chefImage ? (
                            <img src={chefImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <CurrentIcon className={`w-6 h-6 ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`} />
                        )}
                    </div>
                </div>
            </aside>

            {/* MOBILE NAV */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex justify-around z-50 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <Home className={`w-6 h-6 cursor-pointer ${isActive('/') ? 'text-foreground' : 'text-muted-foreground'}`} onClick={() => navigateTo('/')} />
                <BookOpen className={`w-6 h-6 cursor-pointer ${isActive('/recipes') ? 'text-foreground' : 'text-muted-foreground'}`} onClick={() => navigateTo('/recipes')} />
                <div className="bg-primary text-primary-foreground p-3 rounded-full -mt-8 shadow-lg border-4 border-background cursor-pointer" onClick={() => navigateTo('/generate')}>
                    <Sparkles className="w-6 h-6" />
                </div>
                <Heart className="w-6 h-6 text-muted-foreground cursor-pointer" onClick={() => navigateTo('/recipes')} />
                <Settings className="w-6 h-6 text-muted-foreground cursor-pointer" onClick={() => navigateTo('/settings')} />
            </div>
        </>
    );
}
