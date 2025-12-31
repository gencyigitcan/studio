import { prisma } from '@/lib/db';
import { headers } from 'next/headers';

/**
 * Log a user action to the database.
 * @param action The action name (e.g. LOGIN, LOGOUT, BOOK_CLASS)
 * @param userId The ID of the user performing the action (optional)
 * @param details Additional details about the action (optional)
 */
export async function logAction(action: string, userId?: string, details?: string | object) {
    try {
        const headersList = await headers();
        // X-Forwarded-For is usually the best bet for IP in Vercel/proxies
        const ip = headersList.get('x-forwarded-for') || 'unknown';

        let detailsString = details ? (typeof details === 'object' ? JSON.stringify(details) : details) : undefined;

        await prisma.actionLog.create({
            data: {
                action,
                userId,
                details: detailsString,
                ipAddress: ip
            }
        });
    } catch (error) {
        // Fail silently so we don't block the main application flow
        console.error('Failed to log action:', error);
    }
}
