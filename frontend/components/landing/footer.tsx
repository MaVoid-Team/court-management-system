"use client";

import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";

const links = {
    Explore: [
        { label: "Packages", href: "/package" },
        { label: "Events", href: "/event" },
        { label: "Book a Court", href: "/book" },
    ],
    Platform: [
        { label: "Admin Dashboard", href: "/auth/login" },
    ],
    Company: [
        { label: "About", href: "#" },
        { label: "Contact", href: "#" },
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
    ],
};

export function LandingFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-border/50 bg-background">
            {/* Large brand name */}
            <div className="w-full px-8 md:px-16 lg:px-24 pt-20 pb-12">
                <div className="mb-16">
                    <p className="text-[clamp(4rem,12vw,14rem)] font-black tracking-[-0.05em] leading-[0.85] text-foreground/8 select-none pointer-events-none">
                        CourtManager
                    </p>
                </div>

                {/* Footer content */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 border-t border-border/40 pt-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-4 group w-fit">
                            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-foreground text-background font-black text-[13px] select-none">
                                CM
                            </span>
                            <span className="font-bold text-foreground tracking-tight text-base">
                                CourtManager
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
                            A multi-branch court management system built with Rails 8 & Next.js.
                        </p>

                        <div className="mt-6 flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            <span className="ml-1">All systems operational</span>
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(links).map(([category, items]) => (
                        <div key={category}>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-5">
                                {category}
                            </p>
                            <ul className="space-y-3">
                                {items.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1 group w-fit"
                                        >
                                            {item.label}
                                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -translate-y-0.5 translate-x-0.5" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-border/30">
                    <p className="text-xs text-muted-foreground/50">
                        © {currentYear} CourtManager. All rights reserved.
                    </p>
                    <p className="text-xs text-muted-foreground/50">
                        Built on Rails 8 · Next.js · JWT Auth · JSON:API
                    </p>
                </div>
            </div>
        </footer>
    );
}
