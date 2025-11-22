"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, RefreshCw, Clock, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CreateApiModal } from "@/app/components/CreateApiModal";

type MockEndpoint = {
    id: string;
    user_id: string;
    path: string;
    method: string;
    status: number;
    response_body: string;
    created_at: string; // RFC3339 string
    expires_at: string; // RFC3339 string
    hit_count?: number;
};

function CountdownTimer({ targetDate }: { targetDate: string }) {
    const [timeLeft, setTimeLeft] = useState("");
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (difference <= 0) {
                setIsExpired(true);
                setTimeLeft("Expired");
                return;
            }

            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft(`${minutes}m ${seconds}s`);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <span className={cn("font-mono", isExpired ? "text-destructive" : "text-muted-foreground")}>
            {timeLeft}
        </span>
    );
}

export default function CreatePage() {
    const router = useRouter();
    const [mocks, setMocks] = useState<MockEndpoint[]>([]);
    const [isLoadingMocks, setIsLoadingMocks] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMock, setEditingMock] = useState<MockEndpoint | undefined>(undefined);

    const fetchMocks = async () => {
        setIsLoadingMocks(true);
        try {
            const res = await fetch("/api/mocks");
            if (res.ok) {
                const data = await res.json();
                // Sort by newest first
                const sorted = data.sort((a: MockEndpoint, b: MockEndpoint) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setMocks(sorted);
            }
        } catch (error) {
            console.error("Failed to fetch mocks", error);
        } finally {
            setIsLoadingMocks(false);
        }
    };

    useEffect(() => {
        fetchMocks();
    }, []);

    const handleCreateClick = () => {
        setEditingMock(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (mock: MockEndpoint) => {
        setEditingMock(mock);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        fetchMocks();
    };

    const copyCurl = (mock: MockEndpoint) => {
        const servingPort = "8000";
        const host = `${mock.user_id}.localhost:${servingPort}`;
        const url = `http://${host}${mock.path}`;

        const curlCommand = `curl -X ${mock.method} "${url}"`;
        navigator.clipboard.writeText(curlCommand);
    };

    const handleDelete = async (mock: MockEndpoint) => {
        if (!confirm(`Are you sure you want to delete this mock API?\n\n${mock.method} ${mock.path}`)) {
            return;
        }

        // Optimistically remove from UI immediately
        setMocks(prevMocks => prevMocks.filter(m => m.id !== mock.id));

        try {
            const res = await fetch(`/api/mocks/${mock.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                // If deletion failed, restore the item and show error
                fetchMocks(); // Refresh to restore correct state
                const error = await res.json().catch(() => ({}));
                alert(error.error || 'Failed to delete mock');
            }
            // If successful, the optimistic update already removed it from UI
        } catch (error) {
            // If error occurred, restore the item
            fetchMocks(); // Refresh to restore correct state
            console.error('Failed to delete mock', error);
            alert('Failed to delete mock');
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Colorful Background Accents */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

            <div className="relative z-10 p-6 md:p-12">
                <div className="mx-auto max-w-5xl space-y-12">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleCreateClick}
                                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-sm font-medium text-white shadow-lg transition-all hover:shadow-blue-500/25 hover:scale-105 active:scale-95"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create API
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                    Your Mock APIs
                                </h1>
                                <p className="text-muted-foreground mt-2">
                                    Manage and monitor your temporary API endpoints
                                </p>
                            </div>
                            <button
                                onClick={fetchMocks}
                                className="inline-flex items-center justify-center rounded-full bg-secondary/50 p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                title="Refresh List"
                            >
                                <RefreshCw className={cn("h-4 w-4", isLoadingMocks && "animate-spin")} />
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {mocks.length === 0 && !isLoadingMocks ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-24 text-center border rounded-2xl border-dashed border-white/10 bg-white/5">
                                    <div className="rounded-full bg-white/5 p-4 mb-4">
                                        <Plus className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold">No APIs yet</h3>
                                    <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                                        Create your first mock API to get started. It only takes a few seconds.
                                    </p>
                                    <button
                                        onClick={handleCreateClick}
                                        className="inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-2 text-sm font-medium hover:bg-white/20 transition-colors"
                                    >
                                        Create First API
                                    </button>
                                </div>
                            ) : (
                                mocks.map((mock) => (
                                    <div
                                        key={mock.id}
                                        className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider",
                                                mock.method === "GET" && "bg-blue-500/20 text-blue-400",
                                                mock.method === "POST" && "bg-green-500/20 text-green-400",
                                                mock.method === "PUT" && "bg-orange-500/20 text-orange-400",
                                                mock.method === "DELETE" && "bg-red-500/20 text-red-400",
                                                mock.method === "PATCH" && "bg-yellow-500/20 text-yellow-400",
                                            )}>
                                                {mock.method}
                                            </span>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditClick(mock)}
                                                    className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => copyCurl(mock)}
                                                    className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                                                    title="Copy cURL"
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(mock)}
                                                    className="p-1.5 rounded-md hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <div className="font-mono text-sm text-foreground/90 truncate mb-1" title={mock.path}>
                                                {mock.path}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Status: <span className="text-foreground">{mock.status}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                <span>{mock.hit_count || 0} hits</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3 w-3" />
                                                <CountdownTimer targetDate={mock.expires_at} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CreateApiModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
                editingMock={editingMock}
            />
        </div>
    );
}
