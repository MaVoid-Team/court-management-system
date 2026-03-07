"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Admin, adminFormSchema, AdminFormData, AdminUpdateData, adminUpdateSchema } from "@/schemas/admin.schema";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";

interface AdminFormDialogProps {
    admin?: Admin;
    branches?: Branch[];
    onSubmit: (data: any) => Promise<{ success: boolean; error?: any }>;
}

export function AdminFormDialog({ admin, branches = [], onSubmit }: AdminFormDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const isEdit = !!admin;

    const form = useForm<AdminFormData | AdminUpdateData>({
        resolver: zodResolver(isEdit ? adminUpdateSchema : adminFormSchema),
        defaultValues: isEdit
            ? {
                branch_id: admin.branch_id,
                role: admin.role,
            }
            : {
                email: "",
                password: "",
                branch_id: null,
                role: "branch_admin",
            },
    });

    useEffect(() => {
        if (open) {
            if (admin) {
                form.reset({
                    branch_id: admin.branch_id,
                    role: admin.role,
                });
            } else {
                form.reset({
                    email: "",
                    password: "",
                    branch_id: null,
                    role: "branch_admin",
                });
            }
        }
    }, [open, admin, form]);

    const handleSubmit = async (data: any) => {
        setLoading(true);
        const res = await onSubmit(data);
        setLoading(false);
        if (res.success) {
            setOpen(false);
        }
    };

    const roleWatch = form.watch("role");

    // Force branch_id to null if role becomes super_admin
    useEffect(() => {
        if (roleWatch === "super_admin") {
            form.setValue("branch_id", null);
        }
    }, [roleWatch, form]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button variant="ghost" size="icon" data-testid={`edit-admin-${admin.id}`}>
                        <Edit className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button data-testid="create-admin-btn">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Admin
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Admin Role" : "Add Administrator"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update administrator permissions."
                            : "Invite a new admin to manage the system or a specific branch."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" data-testid="admin-form" noValidate>

                    {!isEdit && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...form.register("email")}
                                    disabled={loading}
                                    data-testid="admin-email-input"
                                />
                                {(form.formState.errors as any).email && (
                                    <p className="text-xs text-destructive">{(form.formState.errors as any).email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Initial Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...form.register("password")}
                                    disabled={loading}
                                    data-testid="admin-password-input"
                                />
                                {(form.formState.errors as any).password && (
                                    <p className="text-xs text-destructive">{(form.formState.errors as any).password.message}</p>
                                )}
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            disabled={loading}
                            value={form.watch("role")}
                            onValueChange={(val) => form.setValue("role", val as "super_admin" | "branch_admin")}
                        >
                            <SelectTrigger id="role" data-testid="admin-role-select">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="branch_admin">Branch Admin</SelectItem>
                                <SelectItem value="super_admin" className="font-semibold text-primary">Super Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.formState.errors.role && (
                            <p className="text-xs text-destructive">{form.formState.errors.role.message}</p>
                        )}
                    </div>

                    {roleWatch === "branch_admin" && (
                        <div className="space-y-2 pb-2">
                            <Label htmlFor="branch_id">Assigned Branch</Label>
                            <Select
                                disabled={loading}
                                value={form.watch("branch_id") ? String(form.watch("branch_id")) : ""}
                                onValueChange={(val) => form.setValue("branch_id", Number(val))}
                            >
                                <SelectTrigger id="branch_id" data-testid="admin-branch-select">
                                    <SelectValue placeholder="Assign a branch" />
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
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} data-testid="admin-submit-btn">
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
