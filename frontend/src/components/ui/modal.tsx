import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    className?: string;
    /** Used for aria-labelledby; defaults to "modal-title" when title is set */
    titleId?: string;
}

export function Modal({ isOpen, onClose, children, title, className, titleId = "modal-title" }: ModalProps) {
    const panelRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!isOpen) return;

        const previousActive = document.activeElement as HTMLElement | null;

        const focusPanel = () => {
            const root = panelRef.current;
            if (!root) return;
            const field = root.querySelector<HTMLElement>(
                "input:not([type=\"hidden\"]):not([disabled]), textarea:not([disabled]), select:not([disabled])",
            );
            if (field) {
                field.focus();
                return;
            }
            root.focus();
        };

        const id = window.requestAnimationFrame(focusPanel);

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => {
            window.cancelAnimationFrame(id);
            document.removeEventListener("keydown", onKeyDown);
            previousActive?.focus?.();
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
            <div
                className="fixed inset-0 bg-black/50 transition-opacity duration-200"
                aria-hidden="true"
                onClick={onClose}
            />

            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={cn(
                    "relative z-50 w-full max-w-lg rounded-xl border border-border bg-card p-6 text-card-foreground outline-none",
                    className,
                )}
            >
                <div className="mb-4 flex items-start justify-between gap-4">
                    {title ? (
                        <h2 id={titleId} className="text-lg font-semibold leading-tight">
                            {title}
                        </h2>
                    ) : (
                        <span id={titleId} className="sr-only">
                            Dialog
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <X className="h-4 w-4" aria-hidden />
                        <span className="sr-only">Close</span>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
