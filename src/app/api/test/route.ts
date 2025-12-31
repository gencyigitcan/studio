import { NextResponse } from 'next/server';
import { runTests } from '@/lib/test_suite';

export async function GET() {
    const results = await runTests();
    return NextResponse.json(results);
}
