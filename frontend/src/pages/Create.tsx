import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, RefreshCw, Clock, Plus, Trash2, Pencil } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CreateApiModal } from "@/components/CreateApiModal";
import { BackendError, requestJson } from "@/lib/api";
import type { MockEndpoint } from "@/types/mock";

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
        <span className={cn("font-mono tabular-nums", isExpired ? "text-destructive" : "text-muted-foreground")}>
            {timeLeft}
        </span>
    );
}

function methodBadgeClass(method: string) {
    switch (method) {
        case "GET":
            return "bg-blue-500/15 text-blue-700 dark:text-blue-400";
        case "POST":
            return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
        case "PUT":
            return "bg-orange-500/15 text-orange-700 dark:text-orange-400";
        case "DELETE":
            return "bg-red-500/15 text-red-700 dark:text-red-400";
        case "PATCH":
            return "bg-amber-500/15 text-amber-800 dark:text-amber-400";
        default:
            return "bg-muted text-muted-foreground";
    }
}

export default function CreatePage() {
    const [mocks, setMocks] = useState<MockEndpoint[]>([]);
    const [isLoadingMocks, setIsLoadingMocks] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMock, setEditingMock] = useState<MockEndpoint | undefined>(undefined);
    const [showToast, setShowToast] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const reduceMotion = useReducedMotion();

    const fetchMocks = useCallback(async () => {
        setIsLoadingMocks(true);
        setErrorMessage(null);
        try {
            const data = await requestJson<MockEndpoint[]>("/api/mocks", { cache: "no-store" });
            const sorted = [...data].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            );
            setMocks(sorted);
        } catch (error) {
            console.error("Failed to fetch mocks", error);
            const message = error instanceof BackendError ? error.message : "Failed to fetch mocks";
            setErrorMessage(message);
        } finally {
            setIsLoadingMocks(false);
        }
    }, []);

    useEffect(() => {
        fetchMocks();
    }, [fetchMocks]);

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

    const copyCurl = async (mock: MockEndpoint) => {
        if (!mock.curl_command) {
            console.error("curl_command not available");
            return;
        }

        try {
            await navigator.clipboard.writeText(mock.curl_command);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        } catch (error) {
            console.error("Failed to copy to clipboard", error);
        }
    };

    const handleDelete = async (mock: MockEndpoint) => {
        if (!confirm(`Delete this mock API?\n\n${mock.method} ${mock.path}`)) {
            return;
        }

        setMocks((prev) => prev.filter((m) => m.id !== mock.id));

        try {
            await requestJson(`/api/mocks/${mock.id}`, { method: "DELETE" });
        } catch (error) {
            fetchMocks();
            console.error("Failed to delete mock", error);
            const message = error instanceof BackendError ? error.message : "Failed to delete mock";
            alert(message);
        }
    };

    const toastInitial = reduceMotion ? false : { opacity: 0, y: 12 };

    return (
        <div className="min-h-[calc(100vh-5.5rem)] bg-background md:min-h-[calc(100vh-6rem)]">
            <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        to="/"
                        className="inline-flex w-fit cursor-pointer items-center text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                        Back to home
                    </Link>
                    <button
                        type="button"
                        onClick={handleCreateClick}
                        className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-cta px-6 text-sm font-semibold text-cta-foreground transition-colors duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                        <Plus className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                        Create API
                    </button>
                </div>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Your mock APIs</h1>
                        <p className="mt-2 text-muted-foreground">Manage and monitor your temporary endpoints.</p>
                    </div>
                    <button
                        type="button"
                        onClick={fetchMocks}
                        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        title="Refresh list"
                        aria-label="Refresh list"
                    >
                        <RefreshCw className={cn("h-4 w-4", isLoadingMocks && "animate-spin")} aria-hidden />
                    </button>
                </div>

                {errorMessage && (
                    <div
                        className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                        role="alert"
                    >
                        {errorMessage}
                    </div>
                )}

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {mocks.length === 0 && !isLoadingMocks ? (
                        <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-20 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background">
                                <Plus className="h-6 w-6 text-muted-foreground" aria-hidden />
                            </div>
                            <h2 className="mt-4 text-lg font-semibold text-foreground">No APIs yet</h2>
                            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                Create your first mock API to get a live URL in seconds.
                            </p>
                            <button
                                type="button"
                                onClick={handleCreateClick}
                                className="mt-6 inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-medium transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                Create first API
                            </button>
                        </div>
                    ) : (
                        mocks.map((mock) => (
                            <article
                                key={mock.id}
                                className="flex flex-col rounded-xl border border-border bg-card p-5 transition-colors duration-200 hover:border-muted-foreground/25"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <span
                                        className={cn(
                                            "rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wide",
                                            methodBadgeClass(mock.method),
                                        )}
                                    >
                                        {mock.method}
                                    </span>
                                    <div className="flex shrink-0 gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleEditClick(mock)}
                                            className="cursor-pointer rounded-md p-2 text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            title="Edit"
                                            aria-label={`Edit ${mock.method} ${mock.path}`}
                                        >
                                            <Pencil className="h-4 w-4" aria-hidden />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => copyCurl(mock)}
                                            className="cursor-pointer rounded-md p-2 text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            title="Copy cURL"
                                            aria-label={`Copy cURL for ${mock.path}`}
                                        >
                                            <Copy className="h-4 w-4" aria-hidden />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(mock)}
                                            className="cursor-pointer rounded-md p-2 text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            title="Delete"
                                            aria-label={`Delete ${mock.method} ${mock.path}`}
                                        >
                                            <Trash2 className="h-4 w-4" aria-hidden />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 min-h-0 flex-1">
                                    <p className="truncate font-mono text-sm text-foreground" title={mock.path}>
                                        {mock.path}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Status{" "}
                                        <span className="font-medium text-foreground">{mock.status}</span>
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                                        <span>{mock.hit_count ?? 0} hits</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                        <CountdownTimer targetDate={mock.expires_at} />
                                    </span>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>

            <CreateApiModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
                editingMock={editingMock}
            />

            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={toastInitial}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 z-[60]"
                        role="status"
                        aria-live="polite"
                    >
                        <div className="rounded-lg border border-border bg-card px-4 py-3 text-card-foreground shadow-none">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Copy className="h-4 w-4 shrink-0" aria-hidden />
                                cURL copied
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
