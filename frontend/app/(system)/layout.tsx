"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function SystemLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, loading } = useAuthContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !isAuthenticated && !pathname.includes("/auth/login")) {
            router.push("/auth/login");
        }
    }, [isAuthenticated, loading, pathname, router]);

    // Optionally set up Lenis smooth scroll down the line

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <LoadingSpinner size={48} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6 lg:p-8 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
