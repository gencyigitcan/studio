import Link from 'next/link';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, var(--color-bg), var(--color-surface))',
      color: 'var(--color-text)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: '2rem 5%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Pilates Studio</div>
        <Link href="/login" className="btn btn-primary">Giriş Yap</Link>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1 }}>
        <section style={{
          textAlign: 'center',
          padding: '6rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 className="animate-fade-in" style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--color-primary)', lineHeight: 1.1 }}>
            Daha Sağlıklı Bir Sen İçin <br />
            <span style={{ color: 'var(--color-accent)' }}>Modern Pilates Deneyimi</span>
          </h1>
          <p className="animate-fade-in" style={{ fontSize: '1.25rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto 3rem', animationDelay: '0.1s' }}>
            Kişiye özel programlar, uzman eğitmenler ve gelişmiş takip sistemi ile hedeflerine ulaş.
          </p>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/login" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Şimdi Başla
            </Link>
            <a href="#features" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Keşfet
            </a>
          </div>
        </section>

        {/* Features Preview */}
        <section id="features" style={{ padding: '4rem 2rem', background: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem', color: 'var(--color-primary)' }}>
              Seni Neler Bekliyor?
            </h2>

            <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {/* Feature 1 */}
              <div className="card" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>📅</div>
                <h3 style={{ marginBottom: '1rem' }}>Kolay Rezervasyon</h3>
                <p style={{ opacity: 0.7 }}>
                  İstediğin dersi saniyeler içinde seç, yerini ayırt. Bekleme listesi özelliği ile dolu derslerde sıranı kap.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>✨</div>
                <h3 style={{ marginBottom: '1rem' }}>Sana Özel Profil</h3>
                <p style={{ opacity: 0.7 }}>
                  Sağlık geçmişin ve gelişim takibin tek bir yerde. Eğitmenlerin senin ihtiyaçlarını önceden bilsin.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>🔔</div>
                <h3 style={{ marginBottom: '1rem' }}>Anlık Bildirimler</h3>
                <p style={{ opacity: 0.7 }}>
                  Ders hatırlatmaları ve sıra sana geldiğinde anında bildirim al. Hiçbir dersi kaçırma.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Accounts */}
        <section style={{ padding: '4rem 2rem', background: 'var(--color-surface)', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '2rem', opacity: 0.8 }}>Hemen Test Et (Demo Hesaplar)</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
            <div style={{ padding: '1rem', background: 'white', borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontWeight: 'bold' }}>Admin</div>
              <div style={{ fontFamily: 'monospace', marginTop: '0.5rem' }}>admin@pilates.com</div>
              <div style={{ fontFamily: 'monospace' }}>admin123</div>
            </div>
            <div style={{ padding: '1rem', background: 'white', borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontWeight: 'bold' }}>Eğitmen</div>
              <div style={{ fontFamily: 'monospace', marginTop: '0.5rem' }}>trainer@pilates.com</div>
              <div style={{ fontFamily: 'monospace' }}>trainer123</div>
            </div>
            <div style={{ padding: '1rem', background: 'white', borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontWeight: 'bold' }}>Öğrenci</div>
              <div style={{ fontFamily: 'monospace', marginTop: '0.5rem' }}>user@example.com</div>
              <div style={{ fontFamily: 'monospace' }}>user123</div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>
        © 2025 Pilates Studio. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
