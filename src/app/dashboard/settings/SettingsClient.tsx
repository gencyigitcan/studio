'use client';

export default function SettingsClient({ user }: { user: any }) {
    return (
        <div className="card">
            <h3>Genel Ayarlar</h3>
            <p style={{ opacity: 0.6 }}>Şu anlık sadece kupon yönetimi aktiftir.</p>
        </div>
    );
}
