"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCourtsAPI } from "@/hooks/api/use-courts";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { CourtPerks } from "@/components/courts/court-perks";
import { CourtHourlyRates } from "@/components/courts/court-hourly-rates";
import { CourtFormDialog } from "@/components/courts/court-form-dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { CourtFormData } from "@/schemas/court.schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format-currency";

export default function CourtDetailPage() {
    const params = useParams();
    const router = useRouter();
    const courtId = params.id as string;

    const [court, setCourt] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const { fetchCourt, updateCourt } = useCourtsAPI();
    const { branches, fetchBranches } = useBranchesAPI();

    useEffect(() => {
        loadCourt();
        fetchBranches();
    }, [courtId]);

    const loadCourt = async () => {
        try {
            const response = await fetchCourt(courtId);
            if (response?.success && response?.data) {
                setCourt(response.data);
            }
        } catch (error) {
            console.error("Failed to load court:", error);
            toast.error("Failed to load court");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id: string, data: Partial<CourtFormData>) => {
        const res = await updateCourt(id, data);
        if (res.success) {
            toast.success("Court updated successfully");
            await loadCourt();
        }
        return res;
    };

    const getBranchName = (branchId: number) => {
        const branch = branches.find(b => Number(b.id) === branchId);
        return branch ? branch.name : "Unknown Branch";
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-muted animate-pulse rounded" />
                <div className="h-32 bg-muted animate-pulse rounded" />
            </div>
        );
    }

    if (!court) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold mb-2">Court not found</h2>
                    <p className="text-muted-foreground mb-4">The court you're looking for doesn't exist.</p>
                    <Button onClick={() => router.push("/courts")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Courts
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/courts")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {court.name}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {getBranchName(court.branch_id)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant={court.active ? "default" : "secondary"}>
                        {court.active ? "Active" : "Inactive"}
                    </Badge>
                    <CourtFormDialog
                        court={court}
                        branches={branches}
                        onSubmit={(data) => handleUpdate(courtId, data)}
                    />
                </div>
            </div>

            {/* Court Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Court Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Price per Hour</h4>
                            <p className="text-2xl font-bold">{formatCurrency(court.price_per_hour)}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                            <Badge variant={court.active ? "default" : "secondary"}>
                                {court.active ? "Available for Booking" : "Unavailable"}
                            </Badge>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Branch</h4>
                            <p className="text-lg">{getBranchName(court.branch_id)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <CourtHourlyRates courtId={courtId} basePricePerHour={court.price_per_hour} />

            {/* Perks Section */}
            <CourtPerks courtId={courtId} courtName={court.name} />
        </div>
    );
}
