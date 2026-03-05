"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSettingsAPI } from "@/hooks/api/use-settings";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { SettingsForm } from "@/components/settings/settings-form";
import { SettingFormData } from "@/schemas/setting.schema";
import { useAuthContext } from "@/contexts/auth-context";

export default function SettingsPage() {
    const { admin } = useAuthContext();
    const [selectedBranchId, setSelectedBranchId] = useState<string>("all");

    const {
        setting,
        loading: settingLoading,
        fetchSettings,
        updateSettings,
        createSettings
    } = useSettingsAPI();

    const { branches, fetchBranches } = useBranchesAPI();

    useEffect(() => {
        if (admin?.role === "super_admin") {
            fetchBranches();
        } else {
            // Regular admin only sees their branch settings
            fetchSettings();
        }
    }, [admin, fetchBranches, fetchSettings]);

    useEffect(() => {
        if (selectedBranchId !== "all") {
            fetchSettings({ branch_id: Number(selectedBranchId) });
        }
    }, [selectedBranchId, fetchSettings]);

    const handleSubmit = async (data: SettingFormData) => {
        let res;
        if (setting) {
            res = await updateSettings({ id: setting.id, ...data } as any);
        } else {
            res = await createSettings(data);
        }

        if (res.success) {
            toast.success("Settings saved successfully.");
            if (selectedBranchId !== "all") {
                fetchSettings({ branch_id: Number(selectedBranchId) });
            } else {
                fetchSettings();
            }
        } else {
            toast.error(res.error?.message || "Failed to save settings.");
        }
        return res;
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">General Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Configure operating hours and communication channels.
                </p>
            </div>

            <SettingsForm
                setting={setting}
                loading={settingLoading}
                branches={branches}
                selectedBranchId={selectedBranchId}
                onBranchChange={setSelectedBranchId}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
