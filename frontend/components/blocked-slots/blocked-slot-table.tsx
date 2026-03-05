"use client";

import { BlockedSlot } from "@/schemas/blocked-slot.schema";
import { Branch } from "@/schemas/branch.schema";
import { Court } from "@/schemas/court.schema";
import { DataTable } from "@/components/shared/data-table";
import { BlockedSlotFormDialog } from "./blocked-slot-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate } from "@/lib/format-date";
import { formatTime } from "@/lib/format-time";

interface BlockedSlotTableProps {
    blockedSlots: BlockedSlot[];
    branches: Branch[];
    courts: Court[];
    isLoading: boolean;
    onUpdate: (id: string, data: any) => Promise<{ success: boolean; error?: any }>;
    onDelete: (id: string) => Promise<void>;
}

export function BlockedSlotTable({ blockedSlots, branches, courts, isLoading, onUpdate, onDelete }: BlockedSlotTableProps) {
    const getBranchName = (branchId: number) => {
        const branch = branches.find(b => Number(b.id) === branchId);
        return branch ? branch.name : "Unknown";
    };

    const getCourtName = (courtId: number) => {
        const court = courts.find(c => Number(c.id) === courtId);
        return court ? court.name : "Unknown";
    };

    const columns = [
        {
            header: "Date",
            cell: (bs: BlockedSlot) => formatDate(bs.date, "PP"),
            className: "font-medium",
        },
        {
            header: "Location",
            cell: (bs: BlockedSlot) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{getCourtName(bs.court_id)}</span>
                    <span className="text-xs text-muted-foreground">{getBranchName(bs.branch_id)}</span>
                </div>
            ),
        },
        {
            header: "From",
            cell: (bs: BlockedSlot) => formatTime(bs.start_time),
        },
        {
            header: "To",
            cell: (bs: BlockedSlot) => formatTime(bs.end_time),
        },
        {
            header: "Reason",
            accessorKey: "reason" as keyof BlockedSlot,
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (bs: BlockedSlot) => (
                <div className="flex justify-end gap-2">
                    <BlockedSlotFormDialog
                        blockedSlot={bs}
                        branches={branches}
                        courts={courts}
                        onSubmit={(data) => onUpdate(bs.id, data)}
                    />
                    <ConfirmDialog
                        title="Unblock Time Slot"
                        description={`Are you sure you want to remove this blocked time segment? It will instantly become bookable.`}
                        onConfirm={() => onDelete(bs.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={blockedSlots}
            isLoading={isLoading}
            emptyStateTitle="No blocked slots"
            emptyStateDescription="Use blocked slots to mark courts as unavailable for maintenance or private events."
        />
    );
}
