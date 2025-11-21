import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;

        const headers: HeadersInit = {};
        if (userId) {
            headers['Cookie'] = `user_id=${userId}`;
        }

        const res = await fetch(`${BACKEND_URL}/api/mocks`, {
            headers,
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Backend responded with ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching mocks:', error);
        return NextResponse.json({ error: 'Failed to fetch mocks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (userId) {
            headers['Cookie'] = `user_id=${userId}`;
        }

        const res = await fetch(`${BACKEND_URL}/api/mocks`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        const data = await res.json();

        // If the backend set a cookie (new user), we need to forward it to the client
        const setCookieHeader = res.headers.get('set-cookie');
        const response = NextResponse.json(data, { status: res.status });

        if (setCookieHeader) {
            response.headers.set('Set-Cookie', setCookieHeader);
        }

        return response;
    } catch (error) {
        console.error('Error creating mock:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
