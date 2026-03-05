"use client";

import { Booking } from "@/schemas/booking.schema";
import { Branch } from "@/schemas/branch.schema";
import { Court } from "@/schemas/court.schema";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Banknote, Ban } from "lucide-react";
import { formatDate } from "@/lib/format-date";
import { formatTime } from "@/lib/format-time";
import { formatCurrency } from "@/lib/format-currency";

interface BookingTableProps {
    bookings: Booking[];
    branches: Branch[];
    courts: Court[];
    isLoading: boolean;
    onUpdatePayment: (id: string, status: "pending" | "paid" | "refunded") => Promise<{ success: boolean; error?: any }>;
    onCancel: (id: string) => Promise<void>;
}

export function BookingTable({ bookings, branches, courts, isLoading, onUpdatePayment, onCancel }: BookingTableProps) {
    const getBranchName = (branchId: number) => {
        const branch = branches.find(b => Number(b.id) === branchId);
        return branch ? branch.name : "Unknown";
    };

    const getCourtName = (courtId: number) => {
        const court = courts.find(c => Number(c.id) === courtId);
        return court ? court.name : "Unknown";
    };

    const paymentStatusMap = {
        pending: { label: "Pending", variant: "secondary" as const },
        paid: { label: "Paid", variant: "default" as const },
        refunded: { label: "Refunded", variant: "destructive" as const },
    };

    const columns = [
        {
            header: "User",
            cell: (b: Booking) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{b.user_name}</span>
                    <span className="text-xs text-muted-foreground">{b.user_phone}</span>
                </div>
            ),
        },
        {
            header: "Location",
            cell: (b: Booking) => (
                <div className="flex flex-col">
                    <span className="text-sm">{getCourtName(b.court_id)}</span>
                    <span className="text-xs text-muted-foreground">{getBranchName(b.branch_id)}</span>
                </div>
            ),
        },
        {
            header: "Schedule",
            cell: (b: Booking) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{formatDate(b.date, "PP")}</span>
                    <span className="text-xs text-muted-foreground">
                        {formatTime(b.start_time)} - {formatTime(b.end_time)} ({b.hours}h)
                    </span>
                </div>
            ),
        },
        {
            header: "Price",
            cell: (b: Booking) => <span className="font-semibold">{formatCurrency(b.total_price)}</span>,
        },
        {
            header: "Status",
            cell: (b: Booking) => (
                <div className="flex flex-col gap-1 items-start">
                    <Badge variant={b.status === "confirmed" ? "outline" : "destructive"}>
                        {b.status.toUpperCase()}
                    </Badge>
                    <Badge variant={b.payment_status ? paymentStatusMap[b.payment_status].variant : "secondary"} className="text-[10px]">
                        {b.payment_status ? paymentStatusMap[b.payment_status].label : "PENDING"}
                    </Badge>
                </div>
            ),
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (b: Booking) => (
                <div className="flex justify-end pr-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" data-testid={`booking-actions-${b.id}`}>
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onUpdatePayment(b.id, "paid")} disabled={b.payment_status === "paid"}>
                                <Banknote className="mr-2 h-4 w-4" /> Mark as Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdatePayment(b.id, "refunded")} disabled={b.payment_status === "refunded"}>
                                <Banknote className="mr-2 h-4 w-4 text-destructive" /> Mark as Refunded
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <ConfirmDialog
                        title="Cancel Booking"
                        description={`Cancel booking for ${b.user_name}? This cannot be undone.`}
                        onConfirm={() => onCancel(b.id)}
                        disabled={b.status === "cancelled"}
                        triggerButton={
                            <Button variant="ghost" size="icon" className="text-destructive" disabled={b.status === "cancelled"}>
                                <Ban className="h-4 w-4" />
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
            data={bookings}
            isLoading={isLoading}
            emptyStateTitle="No bookings found"
            emptyStateDescription="No reservations have been made yet."
        />
    );
}
