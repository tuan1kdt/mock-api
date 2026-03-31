import { useState, useEffect } from "react";
import { Save, Check, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { BackendError, requestJson } from "@/lib/api";
import type { MockEndpoint } from "@/types/mock";

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

interface CreateApiModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingMock?: MockEndpoint;
}

export function CreateApiModal({ isOpen, onClose, onSuccess, editingMock }: CreateApiModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        path: "/my-endpoint",
        method: "GET",
        status: 200,
        response_body: "Hello World",
    });

    useEffect(() => {
        if (editingMock) {
            setFormData({
                path: editingMock.path,
                method: editingMock.method,
                status: editingMock.status,
                response_body: editingMock.response_body,
            });
        } else {
            setFormData({
                path: "/my-endpoint",
                method: "GET",
                status: 200,
                response_body: "Hello World",
            });
        }
        setError("");
        setSuccess("");
    }, [editingMock, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const url = editingMock ? `/api/mocks/${editingMock.id}` : "/api/mocks";
            const method = editingMock ? "PUT" : "POST";

            await requestJson(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            setSuccess(editingMock ? "Mock API updated successfully." : "Mock API created successfully.");

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);
        } catch (err: unknown) {
            const message =
                err instanceof BackendError
                    ? err.message
                    : err instanceof Error
                      ? err.message
                      : "Failed to save mock";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const methodGroupId = "mock-http-method";
    const statusId = "mock-response-status";
    const pathId = "mock-endpoint-path";
    const bodyId = "mock-response-body";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingMock ? "Edit mock API" : "Create mock API"}
            className="max-w-2xl"
            titleId="create-mock-dialog-title"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <p id={methodGroupId} className="text-sm font-medium text-foreground">
                            HTTP method
                        </p>
                        <div
                            className="grid grid-cols-3 gap-2 sm:grid-cols-5"
                            role="group"
                            aria-labelledby={methodGroupId}
                        >
                            {METHODS.map((m) => {
                                const selected = formData.method === m;
                                return (
                                    <button
                                        key={m}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => setFormData({ ...formData, method: m })}
                                        className={cn(
                                            "inline-flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-xs font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                            selected
                                                ? cn(
                                                      "border-transparent",
                                                      m === "GET" && "bg-blue-600 text-white hover:bg-blue-700",
                                                      m === "POST" && "bg-emerald-600 text-white hover:bg-emerald-700",
                                                      m === "PUT" && "bg-orange-600 text-white hover:bg-orange-700",
                                                      m === "DELETE" && "bg-red-600 text-white hover:bg-red-700",
                                                      m === "PATCH" && "bg-amber-500 text-amber-950 hover:bg-amber-600",
                                                  )
                                                : "border-border bg-background hover:bg-muted",
                                        )}
                                    >
                                        {m}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor={statusId} className="text-sm font-medium text-foreground">
                            Response status
                        </label>
                        <input
                            id={statusId}
                            type="number"
                            value={formData.status}
                            onChange={(e) =>
                                setFormData({ ...formData, status: parseInt(e.target.value, 10) || 0 })
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm transition-colors duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="200"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor={pathId} className="text-sm font-medium text-foreground">
                            Endpoint path
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-2.5 text-sm text-muted-foreground">
                                /api/
                            </span>
                            <input
                                id={pathId}
                                type="text"
                                value={formData.path.replace(/^\//, "")}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        path: "/" + e.target.value.replace(/^\//, ""),
                                    })
                                }
                                className="flex h-9 w-full rounded-md border border-input bg-background py-1 pl-[3.25rem] pr-3 text-sm transition-colors duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="users"
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor={bodyId} className="text-sm font-medium text-foreground">
                            Response body
                        </label>
                        <textarea
                            id={bodyId}
                            value={formData.response_body}
                            onChange={(e) => setFormData({ ...formData, response_body: e.target.value })}
                            className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono transition-colors duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            spellCheck={false}
                        />
                    </div>
                </div>

                {error && (
                    <div
                        className="flex rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
                        role="alert"
                    >
                        <AlertCircle className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="flex rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
                        <Check className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                        {success}
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-cta px-6 text-sm font-semibold text-cta-foreground transition-colors duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                                {editingMock ? "Updating…" : "Creating…"}
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" aria-hidden />
                                {editingMock ? "Update mock API" : "Create mock API"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
