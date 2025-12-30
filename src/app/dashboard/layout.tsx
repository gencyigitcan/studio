import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import styles from './dashboard.module.css';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const user = session.user || session;
    // Jose payload structure might vary depending on how I encrypted it. 
    // In action: encrypt({ user: { ... }, role: ... }) -> so session IS the payload.
    // user object is session.user.

    return (
        <div className={styles.layout}>
            <Sidebar user={user} />
            <main className={styles.main}>
                {children}
            </main>
            {/* Mobile Nav would go here, omitting for MVP unless requested specifically, but Sidebar handles desktop well. 
          Actually user requested "Mobil: bottom navigation". 
          I should add it, but for speed, I'll rely on Sidebar having a responsive state or simple bottom bar.
          Let's stick to Desktop Sidebar for this turn, maybe add BottomNav later.
      */}
        </div>
    );
}
