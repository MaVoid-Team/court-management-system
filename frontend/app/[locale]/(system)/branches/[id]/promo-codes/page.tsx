"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePromoCodesAPI } from "@/hooks/api/use-promo-codes";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Plus, Edit, Trash2, ArrowLeft, Percent, DollarSign, Calendar, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PromoCode, promoCodeFormSchema, PromoCodeFormData } from "@/schemas/promo-code.schema";
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";

export default function PromoCodesPage() {
    const params = useParams();
    const router = useRouter();
    const branchId = params.id as string;

    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);

    const { fetchPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } = usePromoCodesAPI();
    const { fetchBranches } = useBranchesAPI();

    const form = useForm<PromoCodeFormData>({
        resolver: zodResolver(promoCodeFormSchema),
        defaultValues: {
            code: "",
            description: "",
            discount_type: "percentage",
            discount_percentage: undefined,
            discount_amount: undefined,
            minimum_amount: undefined,
            usage_limit: undefined,
            starts_at: "",
            expires_at: "",
            active: true,
        },
    });

    useEffect(() => {
        loadPromoCodes();
        loadBranches();
    }, [branchId]);

    const loadPromoCodes = async () => {
        try {
            const response = await fetchPromoCodes(branchId);
            if (response?.data) {
                setPromoCodes(response.data.map((item: any) => ({
                    id: item.id,
                    ...item.attributes,
                })));
            }
        } catch (error) {
            console.error("Failed to load promo codes:", error);
            toast.error("Failed to load promo codes");
        } finally {
            setLoading(false);
        }
    };

    const loadBranches = async () => {
        try {
            const response = await fetchBranches();
            if (response?.data) {
                setBranches(response.data.map((item: any) => ({
                    id: item.id,
                    ...item.attributes,
                })));
            }
        } catch (error) {
            console.error("Failed to load branches:", error);
        }
    };

    const handleSubmit = async (data: PromoCodeFormData) => {
        try {
            if (editingPromoCode) {
                await updatePromoCode(branchId, editingPromoCode.id, data);
                toast.success("Promo code updated successfully");
            } else {
                await createPromoCode(branchId, data);
                toast.success("Promo code created successfully");
            }
            await loadPromoCodes();
            setIsDialogOpen(false);
            setEditingPromoCode(null);
            form.reset();
        } catch (error) {
            console.error("Failed to save promo code:", error);
            toast.error("Failed to save promo code");
        }
    };

    const handleEdit = (promoCode: PromoCode) => {
        setEditingPromoCode(promoCode);
        form.reset({
            code: promoCode.code,
            description: promoCode.description,
            discount_type: promoCode.discount_percentage ? "percentage" : "amount",
            discount_percentage: promoCode.discount_percentage || undefined,
            discount_amount: promoCode.discount_amount || undefined,
            minimum_amount: promoCode.minimum_amount || undefined,
            usage_limit: promoCode.usage_limit || undefined,
            starts_at: promoCode.starts_at,
            expires_at: promoCode.expires_at || "",
            active: promoCode.active,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (promoCodeId: string) => {
        try {
            await deletePromoCode(branchId, promoCodeId);
            toast.success("Promo code deleted successfully");
            await loadPromoCodes();
        } catch (error) {
            console.error("Failed to delete promo code:", error);
            toast.error("Failed to delete promo code");
        }
    };

    const getBranchName = (branchId: number) => {
        const branch = branches.find(b => Number(b.id) === branchId);
        return branch ? branch.name : "Unknown Branch";
    };

    const openDialog = () => {
        setEditingPromoCode(null);
        form.reset({
            code: "",
            description: "",
            discount_type: "percentage",
            discount_percentage: undefined,
            discount_amount: undefined,
            minimum_amount: undefined,
            usage_limit: undefined,
            starts_at: "",
            expires_at: "",
            active: true,
        });
        setIsDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-muted animate-pulse rounded" />
                <div className="h-32 bg-muted animate-pulse rounded" />
            </div>
        );
    }

    const branch = branches.find(b => b.id === branchId);

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/branches")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Promo Codes
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {branch?.name || "Branch"} - Manage discount codes
                        </p>
                    </div>
                </div>
                <Button onClick={openDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Promo Code
                </Button>
            </div>

            {/* Promo Codes List */}
            {promoCodes.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Percent className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No promo codes yet</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            Create promo codes to offer discounts to your customers.
                        </p>
                        <Button onClick={openDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add First Promo Code
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {promoCodes.map((promoCode) => (
                        <Card key={promoCode.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{promoCode.code}</h3>
                                            <Badge variant={promoCode.active ? "default" : "secondary"}>
                                                {promoCode.active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground mb-4">{promoCode.description}</p>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                {promoCode.discount_percentage ? (
                                                    <>
                                                        <Percent className="h-4 w-4 text-primary" />
                                                        <span>{promoCode.discount_percentage}% off</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <DollarSign className="h-4 w-4 text-primary" />
                                                        <span>{formatCurrency(promoCode.discount_amount || 0)} off</span>
                                                    </>
                                                )}
                                            </div>
                                            
                                            {promoCode.minimum_amount && (
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                    <span>Min {formatCurrency(promoCode.minimum_amount)}</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{promoCode.used_count}/{promoCode.usage_limit || "∞"} used</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    {formatDate(promoCode.starts_at)}
                                                    {promoCode.expires_at && ` - ${formatDate(promoCode.expires_at)}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(promoCode)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <ConfirmDialog
                                            title="Delete Promo Code"
                                            description={`Are you sure you want to delete "${promoCode.code}"?`}
                                            onConfirm={() => handleDelete(promoCode.id)}
                                            triggerButton={
                                                <Button variant="ghost" size="icon" className="text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPromoCode ? "Edit Promo Code" : "Add New Promo Code"}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Promo Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="SUMMER2024" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="discount_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Discount Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select discount type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="percentage">Percentage</SelectItem>
                                                    <SelectItem value="amount">Fixed Amount</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe the promo code..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="discount_percentage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Discount Percentage (%)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="10"
                                                    disabled={form.watch("discount_type") === "amount"}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="discount_amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Discount Amount</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="10.00"
                                                    disabled={form.watch("discount_type") === "percentage"}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="minimum_amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Minimum Amount (Optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="50.00"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="usage_limit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Usage Limit (Optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="100"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="starts_at"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="expires_at"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Expiration Date (Optional)</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Active</FormLabel>
                                            <p className="text-sm text-muted-foreground">
                                                Make this promo code available to customers
                                            </p>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Saving..." : editingPromoCode ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
