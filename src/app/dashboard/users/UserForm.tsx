'use client';

import { createUserAction } from '@/app/actions/admin';
import { useState } from 'react';

interface UserFormProps {
    onCancel: () => void;
    onSuccess: () => void;
}

export default function UserForm({ onCancel, onSuccess }: UserFormProps) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const result = await createUserAction(formData);
        setLoading(false);

        if (result.success) {
            alert(result.message);
            onSuccess();
        } else {
            alert('Hata: ' + result.message);
        }
    }

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Yeni Kullanıcı Ekle</h2>
            <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>İsim Soyisim</label>
                    <input type="text" name="name" required className="input" placeholder="Ali Veli" />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
                    <input type="email" name="email" required className="input" placeholder="ali@example.com" />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Şifre</label>
                    <input type="password" name="password" required className="input" minLength={6} placeholder="******" />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Rol</label>
                    <select name="role" required className="input" style={{ width: '100%' }}>
                        <option value="CUSTOMER">Öğrenci (Customer)</option>
                        <option value="TRAINER">Eğitmen (Trainer)</option>
                        <option value="ADMIN">Yönetici (Admin)</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={onCancel} className="btn btn-outline" style={{ flex: 1 }}>İptal</button>
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                        {loading ? 'Ekleniyor...' : 'Ekle'}
                    </button>
                </div>
            </form>
        </div>
    );
}
