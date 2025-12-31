import { Calendar, User, Users, Package, LayoutDashboard, Settings, BookOpen, CreditCard, Home, Video } from 'lucide-react';

export const NAV_LINKS = {
    CUSTOMER: [
        { label: 'Ana Sayfa', href: '/dashboard', icon: Home },
        { label: 'Ders Programı', href: '/dashboard/book', icon: BookOpen },
        { label: 'Paketlerim', href: '/dashboard/packages', icon: CreditCard },
        { label: 'Videolar', href: '/dashboard/videos', icon: Video },
        { label: 'Eğitmenler', href: '/dashboard/directory', icon: Users },
        { label: 'Profil', href: '/dashboard/profile', icon: User },
    ],
    TRAINER: [
        { label: 'Ana Sayfa', href: '/dashboard', icon: Home },
        { label: 'Ders Programı', href: '/dashboard/schedule', icon: Calendar },
        { label: 'Videolar', href: '/dashboard/videos', icon: Video },
        { label: 'Rehber', href: '/dashboard/directory', icon: Users },
        { label: 'Profil', href: '/dashboard/profile', icon: User },
    ],
    ADMIN: [
        { label: 'Panel', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Ders Programı', href: '/dashboard/schedule', icon: Calendar },
        { label: 'Paketler', href: '/dashboard/packages', icon: Package },
        { label: 'Videolar', href: '/dashboard/videos', icon: Video },
        { label: 'Üyeler', href: '/dashboard/users', icon: Users }, // Keep Users for strict management
        { label: 'Rehber', href: '/dashboard/directory', icon: BookOpen }, // Directory aka "Rehber"
        { label: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
    ],
};
