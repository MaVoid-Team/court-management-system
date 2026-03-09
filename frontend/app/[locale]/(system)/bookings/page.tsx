"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useBookingsAPI } from "@/hooks/api/use-bookings";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { useCourtsAPI } from "@/hooks/api/use-courts";
import { usePagination } from "@/hooks/code/use-pagination";
import { BookingTable } from "@/components/bookings/booking-table";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { exportBookingsToExcel, exportBookingsToCSV } from "@/lib/export-bookings";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BookingsPage() {
    const [filterBranchId, setFilterBranchId] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const {
        bookings,
        pagination: meta,
        loading: bookingsLoading,
        fetchBookings,
        updatePaymentStatus,
        cancelBooking
    } = useBookingsAPI();

    const { branches, fetchBranches } = useBranchesAPI();
    const { courts, fetchCourts } = useCourtsAPI();
    const { page, perPage, goToPage, changePerPage } = usePagination(1, 25);

    const loadData = () => {
        const params: any = { page, per_page: perPage };
        if (filterBranchId !== "all") params.branch_id = Number(filterBranchId);
        if (filterStatus !== "all") params.status = filterStatus;
        fetchBookings(params);
    };

    useEffect(() => {
        fetchBranches();
        fetchCourts({ per_page: 500 });
    }, [fetchBranches, fetchCourts]);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, perPage, filterBranchId, filterStatus]);

    const handleUpdatePayment = async (id: string, status: "pending" | "paid" | "refunded") => {
        const res = await updatePaymentStatus(id, status);
        if (res.success) {
            toast.success(`Payment status updated to ${status}`);
            loadData();
        }
        return res;
    };

    const handleCancel = async (id: string) => {
        const res = await cancelBooking(id);
        if (res.success) {
            toast.success("Booking cancelled successfully");
            loadData();
        }
    };

    const handleExportExcel = () => {
        try {
            exportBookingsToExcel({ bookings, branches, courts });
            toast.success("Excel file exported successfully");
        } catch (error) {
            toast.error("Failed to export Excel file");
            console.error("Export error:", error);
        }
    };

    const handleExportCSV = () => {
        try {
            exportBookingsToCSV({ bookings, branches, courts });
            toast.success("CSV file exported successfully");
        } catch (error) {
            toast.error("Failed to export CSV file");
            console.error("Export error:", error);
        }
    };

    const handleExportAll = async () => {
        try {
            // Fetch all bookings without pagination
            const params: any = { per_page: 10000 };
            if (filterBranchId !== "all") params.branch_id = Number(filterBranchId);
            if (filterStatus !== "all") params.status = filterStatus;
            
            const response = await fetchBookings(params, { skipStateUpdate: true });
            if (response?.success && response?.data) {
                exportBookingsToExcel({ bookings: response.data, branches, courts });
                toast.success("All bookings exported successfully");
            }
        } catch (error) {
            toast.error("Failed to export all bookings");
            console.error("Export error:", error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Bookings</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Monitor and manage your court reservations.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleExportExcel}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Export Current Page (Excel)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportCSV}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Export Current Page (CSV)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportAll}>
                                <Download className="mr-2 h-4 w-4" />
                                Export All Filtered (Excel)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground whitespace-nowrap">Status:</Label>
                        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); goToPage(1); }}>
                            <SelectTrigger className="w-[140px]" data-testid="status-filter">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground whitespace-nowrap">Branch:</Label>
                        <Select value={filterBranchId} onValueChange={(v) => { setFilterBranchId(v); goToPage(1); }}>
                            <SelectTrigger className="w-[160px]" data-testid="branch-filter">
                                <SelectValue placeholder="All Branches" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Branches</SelectItem>
                                {branches.map(b => (
                                    <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                <BookingTable
                    bookings={bookings}
                    branches={branches}
                    courts={courts}
                    isLoading={bookingsLoading}
                    onUpdatePayment={handleUpdatePayment}
                    onCancel={handleCancel}
                />

                {meta && (
                    <PaginationControls
                        pagination={meta}
                        onPageChange={goToPage}
                        onPerPageChange={changePerPage}
                    />
                )}
            </div>
        </div>
    );
}
