import { Calendar, User, Users, Package, LayoutDashboard, Settings, BookOpen } from 'lucide-react';

export const NAV_LINKS = {
    CUSTOMER: [
        { name: 'Derslerim', href: '/dashboard', icon: Calendar },
        { name: 'Rezervasyon', href: '/dashboard/book', icon: BookOpen },
        { name: 'Paketlerim', href: '/dashboard/packages', icon: Package },
        { name: 'Profil', href: '/dashboard/profile', icon: User },
    ],
    TRAINER: [
        { name: 'Programım', href: '/dashboard', icon: Calendar },
        { name: 'Dersler', href: '/dashboard/classes', icon: Users },
        { name: 'Profil', href: '/dashboard/profile', icon: User },
    ],
    ADMIN: [
        { name: 'Panel', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Ders Programı', href: '/dashboard/schedule', icon: Calendar },
        { name: 'Eğitmenler', href: '/dashboard/trainers', icon: Users },
        { name: 'Paketler', href: '/dashboard/packages', icon: Package },
        { name: 'Üyeler', href: '/dashboard/users', icon: User },
        { name: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
    ],
};
