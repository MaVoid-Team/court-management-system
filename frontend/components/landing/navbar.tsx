"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, createScope } from "animejs";
import { cn } from "@/lib/utils";
import { UserActions } from "@/components/shared/user-actions";

export function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const root = useRef<HTMLElement>(null);
    const scope = useRef<ReturnType<typeof createScope> | null>(null);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    // Entrance animation
    useEffect(() => {
        scope.current = createScope({ root }).add(() => {
            animate(".nav-logo", {
                opacity: [0, 1],
                translateX: [-20, 0],
                duration: 800,
                delay: 200,
                easing: "easeOutExpo",
            });
            animate(".nav-link", {
                opacity: [0, 1],
                translateY: [-12, 0],
                delay: (_, i) => 300 + i * 80,
                duration: 700,
                easing: "easeOutExpo",
            });
            animate(".nav-cta", {
                opacity: [0, 1],
                translateX: [20, 0],
                duration: 800,
                delay: 600,
                easing: "easeOutExpo",
            });
        });
        return () => scope.current?.revert();
    }, []);

    // Hide/reveal on scroll direction + background morphing
    useEffect(() => {
        const onScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(() => {
                    const currentY = window.scrollY;
                    const delta = currentY - lastScrollY.current;

                    setScrolled(currentY > 80);
                    // Hide when scrolling down past threshold, reveal on scroll up
                    if (currentY > 300 && delta > 8) {
                        setHidden(true);
                    } else if (delta < -4) {
                        setHidden(false);
                    }

                    lastScrollY.current = currentY;
                    ticking.current = false;
                });
                ticking.current = true;
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            ref={root}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-in-out",
                hidden ? "-translate-y-full" : "translate-y-0",
                scrolled
                    ? "bg-background/90 backdrop-blur-2xl border-b border-border/60 shadow-sm"
                    : "bg-transparent"
            )}
        >
            <div className="w-full px-8 md:px-16 lg:px-24 py-5 flex items-center justify-between">
                {/* Brand */}
                <Link href="/" className="nav-logo opacity-0 flex items-center gap-3 group">
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-foreground text-background font-black text-[13px] select-none">
                        CM
                    </span>
                    <span className="font-bold text-foreground tracking-tight text-base hidden sm:block">
                        CourtManager
                    </span>
                </Link>

                {/* Nav Links */}
                <nav className="hidden md:flex items-center gap-10">
                    {[
                        { label: "Packages", href: "/packages" },
                        { label: "Events", href: "/events" },
                        { label: "Book a Court", href: "/book" },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="nav-link opacity-0 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 tracking-wide"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* CTA — delegates all auth state logic to UserActions */}
                <div className="nav-cta opacity-0">
                    <UserActions showDashboardLink />
                </div>
            </div>
        </header>
    );
}
