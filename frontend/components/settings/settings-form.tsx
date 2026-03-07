"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Setting, settingFormSchema, SettingFormData } from "@/schemas/setting.schema";
import { Branch } from "@/schemas/branch.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuthContext } from "@/contexts/auth-context";

interface SettingsFormProps {
    setting: Setting | null;
    loading: boolean;
    branches: Branch[];
    selectedBranchId: string;
    onBranchChange: (branchId: string) => void;
    onSubmit: (data: SettingFormData) => Promise<any>;
}

export function SettingsForm({ setting, loading, branches, selectedBranchId, onBranchChange, onSubmit }: SettingsFormProps) {
    const { admin } = useAuthContext();
    const isSuperAdmin = admin?.role === "super_admin";

    const form = useForm<SettingFormData>({
        resolver: zodResolver(settingFormSchema),
        defaultValues: {
            branch_id: selectedBranchId !== "all" ? Number(selectedBranchId) : undefined,
            whatsapp_number: "",
            contact_email: "",
            contact_phone: "",
            opening_hour: 8,
            closing_hour: 22,
        },
    });

    useEffect(() => {
        if (setting) {
            form.reset({
                branch_id: setting.branch_id,
                whatsapp_number: setting.whatsapp_number || "",
                contact_email: setting.contact_email || "",
                contact_phone: setting.contact_phone || "",
                opening_hour: setting.opening_hour,
                closing_hour: setting.closing_hour,
            });
        } else {
            form.reset({
                branch_id: selectedBranchId !== "all" ? Number(selectedBranchId) : undefined,
                whatsapp_number: "",
                contact_email: "",
                contact_phone: "",
                opening_hour: 8,
                closing_hour: 22,
            });
        }
    }, [setting, selectedBranchId, form]);

    return (
        <Card className="max-w-2xl p-6">

            {isSuperAdmin && (
                <div className="mb-8 p-4 bg-muted/50 rounded-lg border border-border">
                    <Label htmlFor="branchSelector" className="mb-2 block text-sm font-semibold">
                        Select Configuration Scope
                    </Label>
                    <Select value={selectedBranchId} onValueChange={onBranchChange}>
                        <SelectTrigger id="branchSelector" className="bg-background">
                            <SelectValue placeholder="Select branch to configure" />
                        </SelectTrigger>
                        <SelectContent>
                            {branches.map(b => (
                                <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Settings are tied directly to branches. Super admins must pick a specific branch.
                    </p>
                </div>
            )}

            {(!isSuperAdmin || selectedBranchId !== "all") ? (
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="settings-form" noValidate>
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium leading-none">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                                <Input id="whatsapp_number" {...form.register("whatsapp_number")} disabled={loading} placeholder="+201234567890" />
                                {form.formState.errors.whatsapp_number && <p className="text-xs text-destructive">{form.formState.errors.whatsapp_number.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact_phone">Contact Phone</Label>
                                <Input id="contact_phone" {...form.register("contact_phone")} disabled={loading} placeholder="+201234567890" />
                                {form.formState.errors.contact_phone && <p className="text-xs text-destructive">{form.formState.errors.contact_phone.message}</p>}
                            </div>
                            <div className="space-y-2 col-span-1 md:col-span-2">
                                <Label htmlFor="contact_email">Contact Email</Label>
                                <Input id="contact_email" type="email" {...form.register("contact_email")} disabled={loading} placeholder="info@courts.com" />
                                {form.formState.errors.contact_email && <p className="text-xs text-destructive">{form.formState.errors.contact_email.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="text-lg font-medium leading-none">Operating Hours (24h Format)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="opening_hour">Opening Hour</Label>
                                <Input id="opening_hour" type="number" min="0" max="23" {...form.register("opening_hour", { valueAsNumber: true })} disabled={loading} />
                                {form.formState.errors.opening_hour && <p className="text-xs text-destructive">{form.formState.errors.opening_hour.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="closing_hour">Closing Hour</Label>
                                <Input id="closing_hour" type="number" min="1" max="24" {...form.register("closing_hour", { valueAsNumber: true })} disabled={loading} />
                                {form.formState.errors.closing_hour && <p className="text-xs text-destructive">{form.formState.errors.closing_hour.message}</p>}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Courts will only be available to book between these hours. E.g. Opening 8, Closing 22 (10 PM).
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={loading} data-testid="save-settings-btn">
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? "Saving..." : setting ? "Update Settings" : "Save Settings"}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="py-12 text-center text-muted-foreground">
                    Please select a branch to view and edit its settings.
                </div>
            )}
        </Card>
    );
}
