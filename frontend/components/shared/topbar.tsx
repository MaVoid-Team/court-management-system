"use client";

import { useAuthContext } from "@/contexts/auth-context";
import { useAuthAPI } from "@/hooks/api/use-auth";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, UserCircle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Topbar() {
    const { admin } = useAuthContext();
    const { logout } = useAuthAPI();

    const getInitials = (email?: string) => {
        if (!email) return "A";
        return email.substring(0, 2).toUpperCase();
    };

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
            <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
            >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
            </Button>

            <div className="w-full flex-1">
                {/* Branch Selector would go here if needed in topbar */}
            </div>

            {admin?.role === "super_admin" && (
                <Badge variant="secondary" className="hidden md:flex text-xs bg-primary/10 text-primary border-0 font-bold uppercase tracking-wider">
                    Super Admin
                </Badge>
            )}

            <ThemeToggle />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" data-testid="user-menu-trigger">
                        <Avatar className="h-8 w-8 border border-border">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                {getInitials(admin?.email)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{admin?.email || "Admin User"}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                Role: {admin?.role.replace("_", " ")}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 cursor-pointer" data-testid="logout-button">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
