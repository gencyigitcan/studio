import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const currentUser = request.cookies.get('session')?.value;
    const path = request.nextUrl.pathname;

    // Paths that don't require auth
    if (path.startsWith('/login') || path.startsWith('/api/auth') || path.startsWith('/_next') || path.startsWith('/favicon.ico')) {
        if (currentUser && path.startsWith('/login')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    if (!currentUser) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check role based access
    try {
        const session = await decrypt(currentUser);
        const role = session?.role;

        if (path.startsWith('/dashboard/admin') && role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        if (path.startsWith('/dashboard/trainer') && role !== 'TRAINER') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

    } catch (err) {
        // If token invalid, redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
