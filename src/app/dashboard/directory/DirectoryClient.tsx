'use client';

import { useState } from 'react';
import { sendNotificationAction } from '@/app/actions/notification';

interface DirectoryClientProps {
    users: any[];
    currentUserRole: string;
}

export default function DirectoryClient({ users, currentUserRole }: DirectoryClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [messageTitle, setMessageTitle] = useState('');
    const [messageBody, setMessageBody] = useState('');

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelect = (id: string) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter(uid => uid !== id));
        } else {
            setSelectedUsers([...selectedUsers, id]);
        }
    };

    const handleSendNotification = async () => {
        if (!messageTitle || !messageBody) {
            alert('Lütfen başlık ve mesaj giriniz.');
            return;
        }

        const res = await sendNotificationAction(selectedUsers, messageTitle, messageBody);
        if (res.success) {
            alert(res.message);
            setShowNotifyModal(false);
            setSelectedUsers([]);
            setMessageTitle('');
            setMessageBody('');
        } else {
            alert('Hata: ' + res.message);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Rehber</h1>
                {currentUserRole !== 'CUSTOMER' && selectedUsers.length > 0 && (
                    <button onClick={() => setShowNotifyModal(true)} className="btn btn-primary">
                        Seçilenlere Bildirim Gönder ({selectedUsers.length})
                    </button>
                )}
            </div>

            {/* Search */}
            <div style={{ marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    placeholder="İsim veya email ara..."
                    className="input"
                    style={{ width: '100%', maxWidth: '400px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid-responsive">
                {filteredUsers.length === 0 ? (
                    <p style={{ opacity: 0.6 }}>Kullanıcı bulunamadı.</p>
                ) : filteredUsers.map(user => (
                    <div
                        key={user.id}
                        className={`card ${selectedUsers.includes(user.id) ? 'selected' : ''}`}
                        style={{
                            border: selectedUsers.includes(user.id) ? '2px solid var(--color-primary)' : '1px solid transparent',
                            cursor: currentUserRole !== 'CUSTOMER' ? 'pointer' : 'default',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => currentUserRole !== 'CUSTOMER' && toggleSelect(user.id)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                background: 'var(--color-bg)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem', fontWeight: 'bold'
                            }}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem' }}>{user.name}</h3>
                                <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                                    {currentUserRole === 'ADMIN' ? user.email : 'İletişim Gizli'}
                                </div>
                                <span style={{
                                    fontSize: '0.8rem',
                                    padding: '2px 6px',
                                    background: 'var(--color-secondary)',
                                    borderRadius: '4px',
                                    display: 'inline-block',
                                    marginTop: '4px'
                                }}>
                                    {user.role}
                                </span>
                                {user.trainerProfile && (
                                    <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px', color: '#f59e0b' }}>
                                        ★ {user.trainerProfile.rating?.toFixed(1) || '0.0'} ({user.trainerProfile.ratingCount || 0})
                                        {user.trainerProfile.specialization && <span style={{ color: '#666', marginLeft: '0.5rem' }}>• {user.trainerProfile.specialization}</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Notification Modal */}
            {showNotifyModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Bildirim Gönder</h2>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Başlık</label>
                            <input
                                type="text"
                                className="input"
                                style={{ width: '100%' }}
                                value={messageTitle}
                                onChange={(e) => setMessageTitle(e.target.value)}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Mesaj</label>
                            <textarea
                                className="input"
                                rows={4}
                                style={{ width: '100%' }}
                                value={messageBody}
                                onChange={(e) => setMessageBody(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowNotifyModal(false)} className="btn btn-outline">İptal</button>
                            <button onClick={handleSendNotification} className="btn btn-primary">Gönder</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
