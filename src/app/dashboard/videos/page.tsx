import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import VideoClient from './VideoClient';

export default async function VideosPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const videos = await prisma.video.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return <VideoClient videos={videos} role={session.role} />;
}
