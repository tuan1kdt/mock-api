import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SERVING_URL = process.env.SERVING_URL || 'http://localhost:8000';

async function handleRequest(request: Request, { params }: { params: Promise<{ mockPath: string[] }> }) {
    const { mockPath } = await params;
    const pathStr = '/' + mockPath.join('/');
    const method = request.method;

    // Skip if it's the mocks management endpoint (though file system routing should handle this)
    if (pathStr === '/mocks') {
        return NextResponse.next();
    }

    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;

        // If no user ID, we can't route to the correct user's mock if we rely on subdomain.
        // However, for the proxy, we assume it's for the current user.
        // If userId is missing, we'll just forward as is (which might fail on backend if it expects subdomain).

        const headers: HeadersInit = {};

        // Forward all headers from original request, except Host
        request.headers.forEach((value, key) => {
            if (key.toLowerCase() !== 'host') {
                headers[key] = value;
            }
        });

        // Construct the target URL
        // We try to use the actual domain with subdomain to let fetch handle the Host header
        const servingUrlObj = new URL(SERVING_URL);
        if (userId) {
            servingUrlObj.hostname = `${userId}.${servingUrlObj.hostname}`;
        }

        const targetUrl = new URL(pathStr, servingUrlObj.toString());

        // Remove Host header if we set it manually before, just in case
        if (headers['Host']) {
            delete headers['Host'];
        }

        // Forward the body if method is not GET/HEAD
        const body = (method === 'GET' || method === 'HEAD') ? undefined : await request.text();

        const res = await fetch(targetUrl.toString(), {
            method,
            headers,
            body,
            cache: 'no-store',
        });

        const responseBody = await res.text();

        // Create response with same status and headers
        const response = new NextResponse(responseBody, {
            status: res.status,
            statusText: res.statusText,
        });

        res.headers.forEach((value, key) => {
            response.headers.set(key, value);
        });

        return response;

    } catch (error) {
        console.error('Error serving mock:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request, context: any) { return handleRequest(request, context); }
export async function POST(request: Request, context: any) { return handleRequest(request, context); }
export async function PUT(request: Request, context: any) { return handleRequest(request, context); }
export async function DELETE(request: Request, context: any) { return handleRequest(request, context); }
export async function PATCH(request: Request, context: any) { return handleRequest(request, context); }
export async function OPTIONS(request: Request, context: any) { return handleRequest(request, context); }
