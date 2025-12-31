'use client';

import { useState } from 'react';
import ReactPlayer from 'react-player';
import { createVideoAction, deleteVideoAction } from '@/app/actions/video';

import { X } from 'lucide-react';

interface VideoClientProps {
    videos: any[];
    role: string;
}

export default function VideoClient({ videos, role }: VideoClientProps) {
    const [isAdding, setIsAdding] = useState(false);

    async function handleCreate(formData: FormData) {
        const res = await createVideoAction(formData);
        if (res.success) {
            alert(res.message);
            setIsAdding(false);
        } else {
            alert('Hata: ' + res.message);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Videoyu silmek istediğinize emin misiniz?')) return;
        const res = await deleteVideoAction(id);
        if (!res.success) alert(res.message);
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Video Kütüphanesi</h1>
                {role === 'ADMIN' && (
                    <button onClick={() => setIsAdding(!isAdding)} className="btn btn-primary">
                        {isAdding ? 'İptal' : 'Yeni Video Ekle'}
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="card" style={{ marginBottom: '2rem', maxWidth: '600px' }}>
                    <h3>Yeni Video Ekle</h3>
                    <form action={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <input name="title" placeholder="Video Başlığı" required className="input" />
                        <input name="url" placeholder="YouTube Linki" required className="input" />
                        <input name="category" placeholder="Kategori (Örn: Pilates, Yoga)" className="input" />
                        <textarea name="description" placeholder="Açıklama" className="input" />
                        <button type="submit" className="btn btn-primary">Kaydet</button>
                    </form>
                </div>
            )}

            <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {videos.map(video => {
                    const Player = ReactPlayer as any;
                    return (
                        <div key={video.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ position: 'relative', paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
                                <Player
                                    url={video.url}
                                    width="100%"
                                    height="100%"
                                    style={{ position: 'absolute', top: 0, left: 0 }}
                                    light={true} // Show thumbnail first
                                    controls
                                />
                            </div>
                            <div style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{video.title}</h3>
                                    {role === 'ADMIN' && (
                                        <button onClick={() => handleDelete(video.id)} style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                                <span style={{ fontSize: '0.8rem', background: 'var(--color-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                                    {video.category || 'Genel'}
                                </span>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
                                    {video.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {videos.length === 0 && (
                <p style={{ textAlign: 'center', opacity: 0.6, marginTop: '2rem' }}>Henüz video eklenmemiş.</p>
            )}
        </div>
    );
}
