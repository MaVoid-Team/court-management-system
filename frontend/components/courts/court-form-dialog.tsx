"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Court, courtFormSchema, CourtFormData } from "@/schemas/court.schema";
import { Branch } from "@/schemas/branch.schema";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import { useBranchesAPI } from "@/hooks/api/use-branches";

interface CourtFormDialogProps {
    court?: Court;
    branches?: Branch[];
    onSubmit: (data: CourtFormData) => Promise<{ success: boolean; error?: any }>;
}

export function CourtFormDialog({ court, branches = [], onSubmit }: CourtFormDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const isEdit = !!court;

    const form = useForm<CourtFormData>({
        resolver: zodResolver(courtFormSchema),
        defaultValues: {
            branch_id: 0,
            name: "",
            price_per_hour: 0,
            active: true,
        },
    });

    useEffect(() => {
        if (open) {
            if (court) {
                form.reset({
                    branch_id: court.branch_id,
                    name: court.name,
                    price_per_hour: Number(court.price_per_hour),
                    active: court.active,
                });
            } else {
                form.reset({
                    branch_id: branches.length > 0 ? Number(branches[0].id) : 0,
                    name: "",
                    price_per_hour: 0,
                    active: true,
                });
            }
        }
    }, [open, court, form, branches]);

    const handleSubmit = async (data: CourtFormData) => {
        setLoading(true);
        const res = await onSubmit(data);
        setLoading(false);
        if (res.success) {
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button variant="ghost" size="icon" data-testid={`edit-court-${court.id}`}>
                        <Edit className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button data-testid="create-court-btn">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Court
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Court" : "Add Court"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update court details and pricing. Click save when you're done."
                            : "Add a new court to a branch."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" data-testid="court-form">
                    <div className="space-y-2">
                        <Label htmlFor="branch_id">Branch</Label>
                        <Select
                            disabled={loading}
                            value={form.watch("branch_id") ? String(form.watch("branch_id")) : ""}
                            onValueChange={(val) => form.setValue("branch_id", Number(val))}
                        >
                            <SelectTrigger id="branch_id" data-testid="court-branch-select">
                                <SelectValue placeholder="Select a branch" />
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map((b) => (
                                    <SelectItem key={b.id} value={b.id.toString()}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.branch_id && (
                            <p className="text-xs text-destructive">{form.formState.errors.branch_id.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Court Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Court 1"
                            {...form.register("name")}
                            disabled={loading}
                            data-testid="court-name-input"
                        />
                        {form.formState.errors.name && (
                            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price_per_hour">Price per Hour (EGP)</Label>
                        <Input
                            id="price_per_hour"
                            type="number"
                            min="0"
                            step="0.01"
                            {...form.register("price_per_hour", { valueAsNumber: true })}
                            disabled={loading}
                            data-testid="court-price-input"
                        />
                        {form.formState.errors.price_per_hour && (
                            <p className="text-xs text-destructive">{form.formState.errors.price_per_hour.message}</p>
                        )}
                    </div>

                    <div className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label htmlFor="active">Active Status</Label>
                            <p className="text-xs text-muted-foreground">Is this court available for booking?</p>
                        </div>
                        <Switch
                            id="active"
                            checked={form.watch("active")}
                            onCheckedChange={(val) => form.setValue("active", val)}
                            disabled={loading}
                            data-testid="court-active-switch"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} data-testid="court-submit-btn">
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
