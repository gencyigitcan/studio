import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { updateProfileAction, updateHealthProfileAction } from '@/app/actions/profile';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { healthProfile: true }
    });

    if (!user) redirect('/login');

    return (
        <div className="grid-responsive">
            {/* General Profile Form */}
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Profil Bilgileri</h2>
                {/* @ts-expect-error: Action type mismatch in Next.js 15+ */}
                <form action={updateProfileAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Ad Soyad</label>
                        <input type="text" name="name" defaultValue={user.name} className="input" required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email (Değiştirilemez)</label>
                        <input type="email" defaultValue={user.email} className="input" disabled style={{ opacity: 0.6 }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Telefon</label>
                        <input type="tel" name="phone" defaultValue={user.phone || ''} className="input" placeholder="0555 555 55 55" />
                    </div>
                    <div style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Yeni Şifre (İsteğe Bağlı)</label>
                        <input type="password" name="password" className="input" placeholder="Değiştirmek için giriniz" />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Güncelle</button>
                </form>
            </div>

            {/* Health Profile Form */}
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Sağlık Bilgileri</h2>
                <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1rem' }}>
                    Eğitmenlerinizin ders programını size göre ayarlayabilmesi için lütfen eksiksiz doldurunuz.
                </p>
                {/* @ts-expect-error: Action type mismatch in Next.js 15+ */}
                <form action={updateHealthProfileAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Kan Grubu</label>
                        <select name="bloodType" defaultValue={user.healthProfile?.bloodType || ''} className="input" style={{ width: '100%' }}>
                            <option value="">Seçiniz</option>
                            <option value="A+">A RH+</option>
                            <option value="A-">A RH-</option>
                            <option value="B+">B RH+</option>
                            <option value="B-">B RH-</option>
                            <option value="AB+">AB RH+</option>
                            <option value="AB-">AB RH-</option>
                            <option value="0+">0 RH+</option>
                            <option value="0-">0 RH-</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Acil Durum Kişisi</label>
                        <input type="text" name="emergencyContact" defaultValue={user.healthProfile?.emergencyContact || ''} className="input" placeholder="İsim - Telefon" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Sakatlık / Rahatsızlık Geçmişi</label>
                        <textarea name="injuries" defaultValue={user.healthProfile?.injuries || ''} className="input" rows={4} placeholder="Bel fıtığı, boyun ağrısı, diz ameliyatı vb." />
                    </div>
                    <button type="submit" className="btn btn-secondary" style={{ marginTop: '1rem' }}>Sağlık Bilgilerini Kaydet</button>
                </form>
            </div>
        </div>
    );
}
