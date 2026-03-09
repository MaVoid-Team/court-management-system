"use client";

import { useTranslations } from "next-intl";
import { Branch } from "@/schemas/branch.schema";
import { DataTable } from "@/components/shared/data-table";
import { BranchFormDialog } from "./branch-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format-date";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Percent } from "lucide-react";

interface BranchTableProps {
    branches: Branch[];
    isLoading: boolean;
    onUpdate: (id: string, data: any) => Promise<{ success: boolean; error?: any }>;
    onDelete: (id: string) => Promise<void>;
}

export function BranchTable({ branches, isLoading, onUpdate, onDelete }: BranchTableProps) {
    const t = useTranslations("branches.table");
    const columns = [
        {
            header: t("nameHeader"),
            accessorKey: "name" as keyof Branch,
            className: "font-medium",
        },
        {
            header: t("addressHeader"),
            accessorKey: "address" as keyof Branch,
        },
        {
            header: t("timezoneHeader"),
            accessorKey: "timezone" as keyof Branch,
        },
        {
            header: t("statusHeader"),
            cell: (b: Branch) => (
                <Badge variant={b.active ? "default" : "secondary"}>
                    {b.active ? t("active") : t("inactive")}
                </Badge>
            ),
        },
        {
            header: t("createdAtHeader"),
            cell: (b: Branch) => formatDate(b.created_at),
        },
        {
            header: t("actionsHeader"),
            className: "text-right",
            cell: (b: Branch) => (
                <div className="flex justify-end gap-2">
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                    >
                        <Link href={`/promo-codes?branch_id=${b.id}`}>
                            <Percent className="mr-2 h-4 w-4" />
                            {t("promoCodes")}
                        </Link>
                    </Button>
                    <BranchFormDialog branch={b} onSubmit={(data) => onUpdate(b.id, data)} />
                    <ConfirmDialog
                        title={t("deleteTitle")}
                        description={t("deleteDescription", { name: b.name })}
                        onConfirm={() => onDelete(b.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={branches}
            isLoading={isLoading}
            emptyStateTitle={t("emptyTitle")}
            emptyStateDescription={t("emptyDescription")}
        />
    );
}
