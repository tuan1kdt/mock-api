"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Check, AlertCircle, Loader2, Copy, RefreshCw, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [mocks, setMocks] = useState<MockEndpoint[]>([]);
    const [isLoadingMocks, setIsLoadingMocks] = useState(true);

    const [formData, setFormData] = useState({
        path: "/my-endpoint",
        method: "GET",
        status: 200,
        response_body: JSON.stringify({ message: "Hello World" }, null, 2),
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            // Validate JSON
            try {
                JSON.parse(formData.response_body);
            } catch (err) {
                throw new Error("Invalid JSON in response body");
            }

            const res = await fetch("/api/mocks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create mock");
            }

            setSuccess("Mock API created successfully!");
            fetchMocks(); // Refresh list
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const copyCurl = (mock: MockEndpoint) => {
        // Construct the direct backend URL for cURL
        // Assuming backend is on port 8000 and supports subdomain
        // If we are in dev environment, we might need to handle localhost differently
        // But for now, let's assume user1.localhost:8000 works

        // We need to know the serving port. Hardcoded for now as per config.
        const servingPort = "8000";
        const host = `${mock.user_id}.localhost:${servingPort}`;
        const url = `http://${host}${mock.path}`;

        const curlCommand = `curl -X ${mock.method} "${url}"`;
        navigator.clipboard.writeText(curlCommand);
    };

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="mx-auto max-w-6xl space-y-12">
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                    <h1 className="text-2xl font-bold">Mock API Manager</h1>
                </div>

                <div className="grid gap-12 lg:grid-cols-2">
                    {/* Creation Form */}
                    <div className="space-y-6">
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="p-6 space-y-1">
                                <h2 className="text-lg font-semibold">Create New Mock</h2>
                                <p className="text-sm text-muted-foreground">Define your endpoint response</p>
                            </div>
                            <div className="p-6 pt-0">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none">HTTP Method</label>
                                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                                                {METHODS.map((m) => (
                                                    <button
                                                        key={m}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, method: m })}
                                                        className={cn(
                                                            "inline-flex items-center justify-center rounded-md border px-3 py-2 text-xs font-medium transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                            formData.method === m
                                                                ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                                                                : "border-input bg-transparent shadow-sm"
                                                        )}
                                                    >
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none">Response Status</label>
                                            <input
                                                type="number"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="200"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none">Endpoint Path</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">/api/</span>
                                                <input
                                                    type="text"
                                                    value={formData.path.replace(/^\//, "")}
                                                    onChange={(e) => setFormData({ ...formData, path: "/" + e.target.value.replace(/^\//, "") })}
                                                    className="flex h-9 w-full rounded-md border border-input bg-background pl-12 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                    placeholder="users"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none">Response Body (JSON)</label>
                                            <textarea
                                                value={formData.response_body}
                                                onChange={(e) => setFormData({ ...formData, response_body: e.target.value })}
                                                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                spellCheck={false}
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center">
                                            <AlertCircle className="mr-2 h-4 w-4" />
                                            {error}
                                        </div>
                                    )}

                                    {success && (
                                        <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-500 flex items-center">
                                            <Check className="mr-2 h-4 w-4" />
                                            {success}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 w-full"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Create Mock API
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Management List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Your APIs</h2>
                            <button
                                onClick={fetchMocks}
                                className="inline-flex items-center justify-center rounded-md border border-input bg-background h-8 w-8 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                                title="Refresh List"
                            >
                                <RefreshCw className={cn("h-4 w-4", isLoadingMocks && "animate-spin")} />
                            </button>
                        </div>

                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                            {mocks.length === 0 ? (
                                <div className="p-12 text-center text-muted-foreground">
                                    {isLoadingMocks ? "Loading APIs..." : "No APIs created yet."}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {mocks.map((mock) => (
                                        <div key={mock.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                                        mock.method === "GET" && "bg-blue-500/10 text-blue-500",
                                                        mock.method === "POST" && "bg-green-500/10 text-green-500",
                                                        mock.method === "PUT" && "bg-orange-500/10 text-orange-500",
                                                        mock.method === "DELETE" && "bg-red-500/10 text-red-500",
                                                        mock.method === "PATCH" && "bg-yellow-500/10 text-yellow-500",
                                                    )}>
                                                        {mock.method}
                                                    </span>
                                                    <span className="font-mono text-sm truncate" title={mock.path}>
                                                        {mock.path}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>Status: {mock.status}</span>
                                                    <span>•</span>
                                                    <span>Hits: {mock.hit_count || 0}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <CountdownTimer targetDate={mock.expires_at} />
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 pl-4">
                                                <button
                                                    onClick={() => copyCurl(mock)}
                                                    className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                                                    title="Copy cURL"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
