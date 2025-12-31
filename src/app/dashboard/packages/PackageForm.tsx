'use client';

import { createPackageAction, updatePackageAction } from '@/app/actions/admin';
import { useState } from 'react';

interface PackageFormProps {
    pkg?: any; // If provided, update mode
    onCancel: () => void;
    onSuccess: () => void;
}

export default function PackageForm({ pkg, onCancel, onSuccess }: PackageFormProps) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        let result;
        if (pkg) {
            result = await updatePackageAction(pkg.id, formData);
        } else {
            result = await createPackageAction(formData);
        }
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
            <h2>{pkg ? 'Paketi Düzenle' : 'Yeni Paket Oluştur'}</h2>
            <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Paket Adı</label>
                    <input type="text" name="name" defaultValue={pkg?.name} required className="input" placeholder="Örn: 10'lu Grup Dersi" />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Açıklama</label>
                    <textarea name="description" defaultValue={pkg?.description} required rows={3} className="input" placeholder="Paket detayları..." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Fiyat (₺)</label>
                        <input type="number" name="price" defaultValue={pkg?.price} required min="0" step="0.01" className="input" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Ders Adedi (Kredi)</label>
                        <input type="number" name="credits" defaultValue={pkg?.credits} required min="1" className="input" />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Geçerlilik (Gün)</label>
                        <input type="number" name="validityDays" defaultValue={pkg?.validityDays} required min="1" className="input" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tip</label>
                        <select name="type" defaultValue={pkg?.type || 'GROUP'} className="input" style={{ width: '100%' }}>
                            <option value="GROUP">Grup Dersi</option>
                            <option value="PRIVATE">Özel Ders</option>
                        </select>
                    </div>
                </div>

                {pkg && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" name="active" defaultChecked={pkg.active} id="activeCheck" />
                        <label htmlFor="activeCheck">Aktif (Satışta)</label>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={onCancel} className="btn btn-outline" style={{ flex: 1 }}>İptal</button>
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                        {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    );
}
