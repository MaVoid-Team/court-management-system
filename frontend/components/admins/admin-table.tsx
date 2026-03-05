"use client";

import { Admin } from "@/schemas/admin.schema";
import { DataTable } from "@/components/shared/data-table";
import { AdminFormDialog } from "./admin-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format-date";
import { Branch } from "@/schemas/branch.schema";

interface AdminTableProps {
    admins: Admin[];
    branches: Branch[];
    isLoading: boolean;
    onUpdate: (id: string, data: any) => Promise<{ success: boolean; error?: any }>;
    onDelete: (id: string) => Promise<void>;
    currentAdminEmail?: string;
}

export function AdminTable({ admins, branches, isLoading, onUpdate, onDelete, currentAdminEmail }: AdminTableProps) {
    const getBranchName = (branchId: number | null) => {
        if (!branchId) return "All (Super Admin)";
        const branch = branches.find(b => Number(b.id) === branchId);
        return branch ? branch.name : "Unknown";
    };

    const columns = [
        {
            header: "Email",
            accessorKey: "email" as keyof Admin,
            className: "font-medium",
            cell: (a: Admin) => (
                <div className="flex items-center gap-2">
                    {a.email}
                    {a.email === currentAdminEmail && (
                        <Badge variant="outline" className="text-[10px] ml-2">YOU</Badge>
                    )}
                </div>
            )
        },
        {
            header: "Role",
            cell: (a: Admin) => (
                <Badge variant={a.role === "super_admin" ? "default" : "secondary"}>
                    {a.role.replace("_", " ").toUpperCase()}
                </Badge>
            ),
        },
        {
            header: "Assigned Branch",
            cell: (a: Admin) => <span className="text-sm">{getBranchName(a.branch_id)}</span>,
        },
        {
            header: "Created",
            cell: (a: Admin) => formatDate(a.created_at, "PP"),
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (a: Admin) => (
                <div className="flex justify-end gap-2">
                    <AdminFormDialog admin={a} branches={branches} onSubmit={(data) => onUpdate(a.id, data)} />
                    {a.email !== currentAdminEmail && (
                        <ConfirmDialog
                            title="Delete Admin"
                            description={`Revoke access for ${a.email}?`}
                            onConfirm={() => onDelete(a.id)}
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={admins}
            isLoading={isLoading}
            emptyStateTitle="No administrators found"
            emptyStateDescription="Add another administrator to share responsibilities."
        />
    );
}
