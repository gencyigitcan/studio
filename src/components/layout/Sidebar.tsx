'use client';

import styles from './sidebar.module.css';
import { NAV_LINKS } from './NavLinks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

interface SidebarProps {
    user: { name: string; email: string; role: string };
}

export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const links = NAV_LINKS[user.role as keyof typeof NAV_LINKS] || [];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <span>🌿</span> Pilates Studio
            </div>

            <nav className={styles.nav}>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(styles.link, isActive && styles.active)}
                        >
                            <Icon size={20} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.footer}>
                <div className={styles.user}>
                    <div className={styles.avatar}>
                        {user.name.charAt(0)}
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: '600' }}>{user.name}</div>
                        <div style={{ opacity: 0.6, fontSize: '0.75rem' }}>{user.role}</div>
                    </div>
                </div>

                <form action={logoutAction}>
                    <button type="submit" className={styles.link} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                        <LogOut size={20} />
                        Çıkış Yap
                    </button>
                </form>
            </div>
        </aside>
    );
}
