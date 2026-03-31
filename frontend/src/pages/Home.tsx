import { Link } from "react-router-dom";
import { ArrowRight, Code2, Shield, Zap } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const benefits = [
    {
        icon: Zap,
        title: "Instant setup",
        body: "No login. Define JSON and get a live endpoint in seconds.",
    },
    {
        icon: Code2,
        title: "Full control",
        body: "Methods, status codes, and headers that match your integration.",
    },
    {
        icon: Shield,
        title: "Isolated mocks",
        body: "Unique IDs keep test data separate from everything else.",
    },
] as const;

export default function Home() {
    const reduceMotion = useReducedMotion();
    const fadeInitial = reduceMotion ? false : { opacity: 0, y: 12 };
    const fadeTransition = { duration: 0.2, ease: "easeOut" as const };

    return (
        <main className="min-h-[calc(100vh-5.5rem)] bg-background text-foreground md:min-h-[calc(100vh-6rem)]">
            <div className="mx-auto flex max-w-3xl flex-col px-4 pb-20 pt-10 md:px-6 md:pt-16">
                <motion.div
                    initial={fadeInitial}
                    animate={{ opacity: 1, y: 0 }}
                    transition={fadeTransition}
                    className="text-center"
                >
                    <p className="text-sm font-medium text-muted-foreground">Developer tool</p>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                        Mock APIs in seconds
                    </h1>
                    <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                        Create, test, and share mock HTTP endpoints without signing up. Built for
                        front-end work, prototypes, and QA.
                    </p>
                </motion.div>

                <motion.div
                    initial={fadeInitial}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...fadeTransition, delay: reduceMotion ? 0 : 0.05 }}
                    className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center"
                >
                    <Link
                        to="/create"
                        className="inline-flex h-12 cursor-pointer items-center justify-center rounded-md bg-cta px-8 text-sm font-semibold text-cta-foreground transition-colors duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                        Create new API
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                    </Link>
                    <a
                        href="https://github.com/tuan1kdt/mock-api"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-12 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-8 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                        View on GitHub
                    </a>
                </motion.div>

                <motion.ul
                    initial={fadeInitial}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...fadeTransition, delay: reduceMotion ? 0 : 0.1 }}
                    className="mt-20 space-y-0 divide-y divide-border border-t border-border"
                    aria-label="Benefits"
                >
                    {benefits.map(({ icon: Icon, title, body }) => (
                        <li key={title} className="flex gap-4 py-8 first:pt-8">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50">
                                <Icon className="h-6 w-6 text-foreground" strokeWidth={1.75} aria-hidden />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                            </div>
                        </li>
                    ))}
                </motion.ul>

                <footer className="mt-16 border-t border-border pt-8 text-center text-xs text-muted-foreground">
                    <p>Mock API — minimal, fast, and ready when you are.</p>
                </footer>
            </div>
        </main>
    );
}
