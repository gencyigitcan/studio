'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { getUnreadNotificationsAction, markAsReadAction } from '@/app/actions/notification';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Poll for notifications every 30s
        const fetchNotes = async () => {
            const res = await getUnreadNotificationsAction();
            setNotifications(res);
        };
        fetchNotes();
        const interval = setInterval(fetchNotes, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await markAsReadAction(id);
        setNotifications(notifications.filter(n => n.id !== id));
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
            >
                <Bell size={24} color="var(--color-primary)" />
                {notifications.length > 0 && (
                    <span style={{
                        position: 'absolute', top: -5, right: -5,
                        background: 'red', color: 'white',
                        borderRadius: '50%', width: '18px', height: '18px',
                        fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {notifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="card" style={{
                    position: 'absolute', top: '100%', right: 0,
                    width: '300px', padding: '1rem', zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Bildirimler</h4>
                    {notifications.length === 0 ? (
                        <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Yeni bildirim yok.</p>
                    ) : (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {notifications.map(n => (
                                <div key={n.id} style={{
                                    padding: '0.5rem', marginBottom: '0.5rem',
                                    background: 'var(--color-bg)', borderRadius: '4px',
                                    cursor: 'pointer'
                                }} onClick={(e) => handleMarkRead(n.id, e)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <strong style={{ fontSize: '0.9rem' }}>{n.title}</strong>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                            {new Date(n.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: 0 }}>{n.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
