import { Link, useLocation } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

export function Header() {
    const location = useLocation();

    return (
        <header className="pointer-events-none fixed top-4 left-4 right-4 z-50 flex justify-center px-0">
            <div
                className={cn(
                    "pointer-events-auto flex h-14 w-full max-w-6xl items-center justify-between rounded-xl border border-border bg-card/95 px-4 shadow-none backdrop-blur-md supports-[backdrop-filter]:bg-card/90",
                )}
            >
                <Link
                    to="/"
                    className="cursor-pointer text-base font-semibold tracking-tight text-foreground transition-colors duration-200 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
                >
                    Mock API
                </Link>
                <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
                    <Link
                        to="/create"
                        className={cn(
                            "cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                            location.pathname === "/create"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                        )}
                    >
                        Your APIs
                    </Link>
                    <ModeToggle />
                </nav>
            </div>
        </header>
    );
}
