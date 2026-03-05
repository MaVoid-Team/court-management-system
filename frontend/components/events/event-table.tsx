"use client";

import { Event } from "@/schemas/event.schema";
import { Branch } from "@/schemas/branch.schema";
import { DataTable } from "@/components/shared/data-table";
import { EventFormDialog } from "./event-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";

interface EventTableProps {
    events: Event[];
    branches: Branch[];
    isLoading: boolean;
    onUpdate: (id: string, data: any) => Promise<{ success: boolean; error?: any }>;
    onDelete: (id: string) => Promise<void>;
}

export function EventTable({ events, branches, isLoading, onUpdate, onDelete }: EventTableProps) {
    const getBranchName = (branchId: number) => {
        const branch = branches.find(b => Number(b.id) === branchId);
        return branch ? branch.name : "Unknown Branch";
    };

    const columns = [
        {
            header: "Title",
            accessorKey: "title" as keyof Event,
            className: "font-medium",
        },
        {
            header: "Branch",
            cell: (e: Event) => getBranchName(e.branch_id),
            className: "text-muted-foreground",
        },
        {
            header: "Date",
            cell: (e: Event) => formatDate(e.start_date, "PPP"),
        },
        {
            header: "Price",
            cell: (e: Event) => formatCurrency(e.participation_price),
        },
        {
            header: "Limit",
            cell: (e: Event) => e.max_participants ? `${e.max_participants} qty` : "Unlim.",
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (e: Event) => (
                <div className="flex justify-end gap-2">
                    <EventFormDialog event={e} branches={branches} onSubmit={(data) => onUpdate(e.id, data)} />
                    <ConfirmDialog
                        title="Delete Event"
                        description={`Are you sure you want to delete "${e.title}"?`}
                        onConfirm={() => onDelete(e.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={events}
            isLoading={isLoading}
            emptyStateTitle="No events found"
            emptyStateDescription="Host tournaments or public events by creating one."
        />
    );
}
