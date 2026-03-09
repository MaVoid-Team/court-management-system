"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
    Building2,
    CalendarDays,
    CalendarRange,
    Home,
    LayoutDashboard,
    Lock,
    MapPin,
    PackageSearch,
    Settings,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Branches", href: "/branches", icon: MapPin },
    { name: "Courts", href: "/courts", icon: Building2 },
    { name: "Bookings", href: "/bookings", icon: CalendarDays },
    { name: "Packages", href: "/packages", icon: PackageSearch },
    { name: "Events", href: "/events", icon: CalendarRange },
    { name: "Blocked Slots", href: "/blocked-slots", icon: Lock },
    { name: "Admins", href: "/admins", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div
            className="hidden border-r border-border bg-sidebar md:block w-64 shrink-0"
            data-testid="sidebar"
        >
            <div className="flex h-full flex-col gap-2">
                <div className="flex h-16 items-center border-b border-border px-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-sidebar-foreground">
                        <Building2 className="h-6 w-6 text-primary" />
                        <span className="">CourtManager</span>
                    </Link>
                </div>

                <div className="flex-1 overflow-auto py-4">
                    <nav className="grid items-start px-4 text-sm font-medium gap-1">
                        {navigation.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2.5 transition-all",
                                        isActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                    )}
                                    data-testid={`sidebar-link-${item.name.toLowerCase().replace(" ", "-")}`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Back to Home — pinned at the bottom */}
                <div className="mt-auto border-t border-border px-4 py-4">
                    <Link
                        href="/"
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        data-testid="sidebar-link-home"
                    >
                        <Home className="h-5 w-5" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
