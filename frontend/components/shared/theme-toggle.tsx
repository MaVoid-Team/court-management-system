"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeContext } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { theme, setTheme } = useThemeContext();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            id="theme-toggle"
            data-testid="theme-toggle"
            className="text-foreground"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
