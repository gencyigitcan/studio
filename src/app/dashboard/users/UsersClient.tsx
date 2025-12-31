'use client';

import { useState } from 'react';
import UserForm from './UserForm';
import { deleteUserAction, updateUserRoleAction } from '@/app/actions/admin';

interface UsersClientProps {
    users: any[];
}

export default function UsersClient({ users }: UsersClientProps) {
    const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');

    const handleDelete = async (id: string) => {
        if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
        const res = await deleteUserAction(id);
        if (res.success) {
            alert(res.message);
        } else {
            alert('Hata: ' + res.message);
        }
    };

    // Quick role toggle (Simplistic "Promote/Demote" could be better, but we stick to basics)
    const handleRoleChange = async (id: string, newRole: string) => {
        const formData = new FormData();
        formData.append('role', newRole);
        if (!confirm(`Kullanıcı rolünü ${newRole} olarak değiştirmek istiyor musunuz?`)) return;

        const res = await updateUserRoleAction(id, formData);
        if (res.success) alert(res.message);
        else alert(res.message);
    }

    if (view === 'CREATE') {
        return <UserForm onCancel={() => setView('LIST')} onSuccess={() => setView('LIST')} />;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Üyeler</h1>
                <button onClick={() => setView('CREATE')} className="btn btn-primary">Yeni Üye Ekle</button>
            </div>

            <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-bg)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>İsim</th>
                            <th style={{ padding: '1rem' }}>Email</th>
                            <th style={{ padding: '1rem' }}>Rol</th>
                            <th style={{ padding: '1rem' }}>Paketler</th>
                            <th style={{ padding: '1rem' }}>Rezervasyonlar</th>
                            <th style={{ padding: '1rem' }}>Kayıt Tarihi</th>
                            <th style={{ padding: '1rem' }}>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>{user.name}</td>
                                <td style={{ padding: '1rem' }}>{user.email}</td>
                                <td style={{ padding: '1rem' }}>
                                    <select
                                        defaultValue={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        style={{
                                            padding: '4px',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc',
                                            background: user.role === 'ADMIN' ? '#fecaca' : user.role === 'TRAINER' ? '#bbf7d0' : '#fff'
                                        }}
                                    >
                                        <option value="CUSTOMER">Öğrenci</option>
                                        <option value="TRAINER">Eğitmen</option>
                                        <option value="ADMIN">Yönetici</option>
                                    </select>
                                </td>
                                <td style={{ padding: '1rem' }}>{user._count.userPackages}</td>
                                <td style={{ padding: '1rem' }}>{user._count.bookings}</td>
                                <td style={{ padding: '1rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '1rem' }}>
                                    <button onClick={() => handleDelete(user.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'var(--color-error)' }}>Sil</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
