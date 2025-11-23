import { useState, useEffect } from "react";
import { Save, Check, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { BackendError, requestJson } from "@/lib/api";

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

interface CreateApiModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingMock?: any; // Using any for now to avoid circular deps, but ideally should be MockEndpoint
}

export function CreateApiModal({ isOpen, onClose, onSuccess, editingMock }: CreateApiModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        path: "/my-endpoint",
        method: "GET",
        status: 200,
        response_body: JSON.stringify({ message: "Hello World" }, null, 2),
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
            // Reset to default when opening for create
            setFormData({
                path: "/my-endpoint",
                method: "GET",
                status: 200,
                response_body: JSON.stringify({ message: "Hello World" }, null, 2),
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
            // Validate JSON
            try {
                JSON.parse(formData.response_body);
            } catch (err) {
                throw new Error("Invalid JSON in response body");
            }

            const url = editingMock ? `/api/mocks/${editingMock.id}` : "/api/mocks";
            const method = editingMock ? "PUT" : "POST";

            await requestJson(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            setSuccess(editingMock ? "Mock API updated successfully!" : "Mock API created successfully!");

            // Wait a bit before closing so user sees success message
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);

        } catch (err: any) {
            const message = err instanceof BackendError ? err.message : err?.message || "Failed to save mock";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingMock ? "Edit Mock API" : "Create Mock API"}
            className="max-w-2xl"
        >
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
                                        "inline-flex items-center justify-center rounded-md border px-3 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        formData.method === m
                                            ? cn(
                                                "shadow-sm border-transparent",
                                                m === "GET" && "bg-blue-500 text-white hover:bg-blue-600",
                                                m === "POST" && "bg-green-500 text-white hover:bg-green-600",
                                                m === "PUT" && "bg-orange-500 text-white hover:bg-orange-600",
                                                m === "DELETE" && "bg-red-500 text-white hover:bg-red-600",
                                                m === "PATCH" && "bg-yellow-500 text-black hover:bg-yellow-600"
                                            )
                                            : "border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground"
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

                <div className="flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {editingMock ? "Updating..." : "Creating..."}
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {editingMock ? "Update Mock API" : "Create Mock API"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
