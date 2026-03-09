"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Perk, perkFormSchema, PerkFormData } from "@/schemas/perk.schema";
import { usePerksAPI } from "@/hooks/api/use-perks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Plus, Edit, Trash2, Star } from "lucide-react";

interface CourtPerksProps {
    courtId: string;
    courtName: string;
}

export function CourtPerks({ courtId, courtName }: CourtPerksProps) {
    const { fetchPerks, createPerk, updatePerk, deletePerk, loading } = usePerksAPI();
    const [perks, setPerks] = useState<Perk[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPerk, setEditingPerk] = useState<Perk | null>(null);

    const form = useForm<PerkFormData>({
        resolver: zodResolver(perkFormSchema),
        defaultValues: {
            name: "",
            description: "",
            active: true,
        },
    });

    useEffect(() => {
        loadPerks();
    }, [courtId]);

    const loadPerks = async () => {
        try {
            const response = await fetchPerks(courtId);
            if (response?.data) {
                setPerks(response.data.map((item: any) => ({
                    id: item.id,
                    ...item.attributes,
                })));
            }
        } catch (error) {
            console.error("Failed to load perks:", error);
        }
    };

    const handleSubmit = async (data: PerkFormData) => {
        try {
            if (editingPerk) {
                await updatePerk(courtId, editingPerk.id, data);
            } else {
                await createPerk(courtId, data);
            }
            await loadPerks();
            setIsDialogOpen(false);
            setEditingPerk(null);
            form.reset();
        } catch (error) {
            console.error("Failed to save perk:", error);
        }
    };

    const handleEdit = (perk: Perk) => {
        setEditingPerk(perk);
        form.reset({
            name: perk.name,
            description: perk.description || "",
            active: perk.active,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (perkId: string) => {
        try {
            await deletePerk(courtId, perkId);
            await loadPerks();
        } catch (error) {
            console.error("Failed to delete perk:", error);
        }
    };

    const openDialog = () => {
        setEditingPerk(null);
        form.reset({
            name: "",
            description: "",
            active: true,
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Court Perks</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage special amenities and features for {courtName}
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Perk
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingPerk ? "Edit Perk" : "Add New Perk"}
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Perk Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Free Water, WiFi, Parking" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Additional details about this perk..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="active"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Active</FormLabel>
                                                <p className="text-sm text-muted-foreground">
                                                    Show this perk to customers
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
                                        {loading ? "Saving..." : editingPerk ? "Update" : "Create"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {perks.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Star className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No perks yet</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            Add perks to highlight special amenities and features of this court.
                        </p>
                        <Button onClick={openDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add First Perk
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {perks.map((perk) => (
                        <Card
                            key={perk.id}
                            className={`transition-shadow ${!perk.active ? "opacity-60" : ""}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium">{perk.name}</h4>
                                            <Badge variant={perk.active ? "default" : "secondary"}>
                                                {perk.active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                        {perk.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {perk.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(perk)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <ConfirmDialog
                                            title="Delete Perk"
                                            description={`Are you sure you want to delete "${perk.name}"?`}
                                            onConfirm={() => handleDelete(perk.id)}
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
        </div>
    );
}
