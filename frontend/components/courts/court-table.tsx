"use client";

import { Court } from "@/schemas/court.schema";
import { Branch } from "@/schemas/branch.schema";
import { DataTable } from "@/components/shared/data-table";
import { CourtFormDialog } from "./court-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format-currency";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface CourtTableProps {
    courts: Court[];
    branches: Branch[];
    isLoading: boolean;
    onUpdate: (id: string, data: any) => Promise<{ success: boolean; error?: any }>;
    onDelete: (id: string) => Promise<void>;
}

export function CourtTable({ courts, branches, isLoading, onUpdate, onDelete }: CourtTableProps) {
    const getBranchName = (branchId: number) => {
        const branch = branches.find(b => Number(b.id) === branchId);
        return branch ? branch.name : "Unknown Branch";
    };

    const columns = [
        {
            header: "Branch",
            cell: (c: Court) => getBranchName(c.branch_id),
            className: "font-medium text-muted-foreground",
        },
        {
            header: "Name",
            cell: (c: Court) => (
                <Link 
                    href={`/courts/${c.id}`}
                    className="font-medium hover:text-primary transition-colors"
                >
                    {c.name}
                </Link>
            ),
            className: "font-medium",
        },
        {
            header: "Price/Hour",
            cell: (c: Court) => formatCurrency(c.price_per_hour),
        },
        {
            header: "Status",
            cell: (c: Court) => (
                <Badge variant={c.active ? "default" : "secondary"}>
                    {c.active ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            header: "Perks",
            cell: (c: Court) => {
                const activePerks = c.perks?.filter(p => p.active) || [];
                return (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {activePerks.length} perks
                        </Badge>
                        {activePerks.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {activePerks.slice(0, 2).map(p => p.name).join(", ")}
                                {activePerks.length > 2 && ` +${activePerks.length - 2} more`}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (c: Court) => (
                <div className="flex justify-end gap-2">
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                    >
                        <Link href={`/courts/${c.id}`}>
                            <Star className="mr-2 h-4 w-4" />
                            Manage Perks
                        </Link>
                    </Button>
                    <CourtFormDialog
                        court={c}
                        branches={branches}
                        onSubmit={(data) => onUpdate(c.id, data)}
                    />
                    <ConfirmDialog
                        title="Delete Court"
                        description={`Are you sure you want to delete "${c.name}"? This action cannot be undone.`}
                        onConfirm={() => onDelete(c.id)}
                        triggerButton={
                            <Button variant="destructive" size="sm">
                                Delete
                            </Button>
                        }
                    />
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={courts}
            isLoading={isLoading}
            emptyStateTitle="No courts found"
            emptyStateDescription="Add a court to an existing branch to get started."
        />
    );
}
