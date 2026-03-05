"use client";

import { Court } from "@/schemas/court.schema";
import { Branch } from "@/schemas/branch.schema";
import { DataTable } from "@/components/shared/data-table";
import { CourtFormDialog } from "./court-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format-currency";

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
            accessorKey: "name" as keyof Court,
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
            header: "Actions",
            className: "text-right",
            cell: (c: Court) => (
                <div className="flex justify-end gap-2">
                    <CourtFormDialog court={c} branches={branches} onSubmit={(data) => onUpdate(c.id, data)} />
                    <ConfirmDialog
                        title="Delete Court"
                        description={`Are you sure you want to delete ${c.name}? This cannot be undone.`}
                        onConfirm={() => onDelete(c.id)}
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
