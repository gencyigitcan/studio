'use client';

import { createClassAction, deleteClassAction } from '@/app/actions/admin';
import { useState } from 'react';

// Simplified Form for Class
// Note: Update is tricky because of Date objects and many fields. 
// For this MVP, we might only support Create and Delete to keep it robust.
// Or we implement Update if time permits. Let's do Create and Delete first.

interface ClassFormProps {
    trainers: any[];
    onCancel: () => void;
    onSuccess: () => void;
}

export default function ClassForm({ trainers, onCancel, onSuccess }: ClassFormProps) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const result = await createClassAction(formData);
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
            <h2>Yeni Ders Programla</h2>
            <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Ders Adı</label>
                    <input type="text" name="name" required className="input" placeholder="Örn: Sabah Reformer" />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Eğitmen</label>
                    <select name="trainerId" required className="input" style={{ width: '100%' }}>
                        <option value="">Seçiniz</option>
                        {trainers.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Başlangıç Zamanı</label>
                        <input type="datetime-local" name="startTime" required className="input" style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Süre (Dakika)</label>
                        <input type="number" name="duration" defaultValue="60" required min="30" step="15" className="input" />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Kapasite</label>
                    <input type="number" name="capacity" defaultValue="8" required min="1" className="input" />
                    <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.25rem' }}>1 kişilik dersler 'ÖZEL', 2+ kişilik dersler 'GRUP' olarak işaretlenir.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={onCancel} className="btn btn-outline" style={{ flex: 1 }}>İptal</button>
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                        {loading ? 'Oluşturuluyor...' : 'Oluştur'}
                    </button>
                </div>
            </form>
        </div>
    );
}
