import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';



export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (userId) {
            headers['Cookie'] = `user_id=${userId}`;
        }

        const res = await fetch(`${BACKEND_URL}/api/mocks/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || 'Failed to update mock' },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error updating mock:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;

        const headers: HeadersInit = {};
        if (userId) {
            headers['Cookie'] = `user_id=${userId}`;
        }

        const res = await fetch(`${BACKEND_URL}/api/mocks/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || 'Failed to delete mock' },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error deleting mock:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

