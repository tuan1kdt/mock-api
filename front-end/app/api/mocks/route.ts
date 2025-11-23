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

        // Check content type before parsing
        const contentType = res.headers.get('content-type');
        const responseText = await res.text();

        if (!contentType?.includes('application/json')) {
            console.error('Backend returned non-JSON response:', {
                status: res.status,
                statusText: res.statusText,
                contentType,
                url: `${BACKEND_URL}/api/mocks`,
                responsePreview: responseText.substring(0, 500),
            });
            return NextResponse.json(
                { error: `Backend returned ${res.status}: ${res.statusText}. Expected JSON but got ${contentType || 'unknown'}` },
                { status: 502 }
            );
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse JSON response:', {
                status: res.status,
                responsePreview: responseText.substring(0, 500),
            });
            return NextResponse.json(
                { error: 'Backend returned invalid JSON' },
                { status: 502 }
            );
        }

        if (!res.ok) {
            return NextResponse.json(data, { status: res.status });
        }

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

        console.log('Making request to backend:', {
            url: `${BACKEND_URL}/api/mocks`,
            method: 'POST',
            hasBody: !!body,
        });

        const res = await fetch(`${BACKEND_URL}/api/mocks`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        // Check content type before parsing
        const contentType = res.headers.get('content-type');
        const responseText = await res.text();

        console.log('Backend response:', {
            status: res.status,
            statusText: res.statusText,
            contentType,
            responseLength: responseText.length,
            responsePreview: responseText.substring(0, 200),
        });

        if (!contentType?.includes('application/json')) {
            console.error('Backend returned non-JSON response:', {
                status: res.status,
                statusText: res.statusText,
                contentType,
                url: `${BACKEND_URL}/api/mocks`,
                responsePreview: responseText.substring(0, 500),
            });
            return NextResponse.json(
                { error: `Backend returned ${res.status}: ${res.statusText}. Expected JSON but got ${contentType || 'unknown'}` },
                { status: 502 }
            );
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse JSON response:', {
                status: res.status,
                responsePreview: responseText.substring(0, 500),
            });
            return NextResponse.json(
                { error: 'Backend returned invalid JSON' },
                { status: 502 }
            );
        }

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
