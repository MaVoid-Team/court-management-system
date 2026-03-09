"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCourtsAPI } from "@/hooks/api/use-courts";
import { useAvailabilityAPI } from "@/hooks/api/use-availability";
import { useBookingsAPI } from "@/hooks/api/use-bookings";
import { useSettingsAPI } from "@/hooks/api/use-settings";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { bookingFormSchema, BookingFormData, Booking } from "@/schemas/booking.schema";
import { Court } from "@/schemas/court.schema";
import { Branch } from "@/schemas/branch.schema";
import { AvailabilityGrid } from "@/components/book/availability-grid";
import { BookingConfirmation } from "@/components/book/booking-confirmation";
import { CourtPerksDisplay } from "@/components/courts/court-perks-display";
import { PromoCodeInput } from "@/components/book/promo-code-input";
import { BookingTermsDialog } from "@/components/book/booking-terms-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, MapPin, Clock, User, Phone, Tag, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/format-currency";
import { toast } from "sonner";

export function BookingView() {
    const t = useTranslations("publicBook");

    // API hooks
    const { branches, fetchPublicBranches, loading: branchesLoading } = useBranchesAPI();
    const { courts, fetchPublicCourts, loading: courtsLoading } = useCourtsAPI();
    const { availability, fetchAvailability, loading: availabilityLoading } = useAvailabilityAPI();
    const { createBooking, loading: bookingLoading, error: bookingError } = useBookingsAPI();
    const { setting, fetchPublicSettings } = useSettingsAPI();

    // Local state
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedSlot, setSelectedSlot] = useState<{ start_time: string; end_time: string } | null>(null);
    const [bookingResult, setBookingResult] = useState<Booking | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const bookingTerms = (setting as any)?.booking_terms as string | undefined;
    const hasTerms = !!bookingTerms;

    // Form setup
    const form = useForm<BookingFormData>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: {
            branch_id: 0,
            court_id: 0,
            date: "",
            start_time: "",
            end_time: "",
            user_name: "",
            user_phone: "",
            notes: "",
            promo_code: "",
        },
    });

    // ── Data fetching ──

    // Load branches on mount
    useEffect(() => {
        fetchPublicBranches();
    }, [fetchPublicBranches]);

    // When branch changes → load courts + settings for that branch
    useEffect(() => {
        if (selectedBranch) {
            fetchPublicCourts({ branch_id: Number(selectedBranch.id) });
            fetchPublicSettings({ branch_id: Number(selectedBranch.id) });
        }
    }, [selectedBranch, fetchPublicCourts, fetchPublicSettings]);

    // When court + date are selected → load availability
    useEffect(() => {
        if (selectedCourt && selectedDate && selectedBranch) {
            fetchAvailability({
                branch_id: Number(selectedBranch.id),
                court_id: Number(selectedCourt.id),
                date: format(selectedDate, "yyyy-MM-dd"),
            });
            // Reset slot selection when court/date changes
            setSelectedSlot(null);
            form.setValue("start_time", "");
            form.setValue("end_time", "");
        }
    }, [selectedCourt, selectedDate, selectedBranch, fetchAvailability, form]);

    // ── Handlers ──

    const handleBranchSelect = (branchId: string) => {
        const branch = branches.find((b) => String(b.id) === branchId) || null;
        setSelectedBranch(branch);
        // Reset downstream selections
        setSelectedCourt(null);
        setSelectedDate(undefined);
        setSelectedSlot(null);
        setAcceptedTerms(false);
        setSubmitError(null);
        form.setValue("branch_id", branch ? Number(branch.id) : 0);
        form.setValue("court_id", 0);
        form.setValue("date", "");
        form.setValue("start_time", "");
        form.setValue("end_time", "");
    };

    const handleCourtSelect = (courtId: string) => {
        const court = courts.find((c) => String(c.id) === courtId) || null;
        setSelectedCourt(court);
        // Reset time selections when court changes
        setSelectedSlot(null);
        setSubmitError(null);
        form.setValue("court_id", court ? Number(court.id) : 0);
        form.setValue("start_time", "");
        form.setValue("end_time", "");
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        setSelectedDate(date);
        setSelectedSlot(null);
        setSubmitError(null);
        form.setValue("date", format(date, "yyyy-MM-dd"));
        form.setValue("start_time", "");
        form.setValue("end_time", "");
    };

    const handleSlotSelect = (slot: { start_time: string; end_time: string }) => {
        setSelectedSlot(slot);
        setSubmitError(null);
        form.setValue("start_time", slot.start_time);
        form.setValue("end_time", slot.end_time);
        form.clearErrors("start_time");
        form.clearErrors("end_time");
    };

    const onSubmit = async (data: BookingFormData) => {
        setSubmitError(null);
        const bookingData: BookingFormData = {
            ...data,
            branch_id: Number(selectedBranch!.id),
            court_id: Number(selectedCourt!.id),
        };

        const res = await createBooking(bookingData);

        if (res.success) {
            const resData: any = res.data;
            if (resData?.data) {
                setBookingResult({
                    id: resData.data.id,
                    ...resData.data.attributes,
                });
                toast.success(t("bookingSuccess"));
            }
        } else {
            const errMsg = (res as any).error?.response?.data?.errors?.[0]
                || (res as any).error?.response?.data?.error
                || t("bookingFailed");
            setSubmitError(errMsg);
            toast.error(errMsg);
        }
    };

    // ── Derived values ──
    const activeBranches = branches.filter((b) => b.active);
    const activeCourts = courts.filter((c) => c.active);
    const activePerks = selectedCourt?.perks?.filter((p) => p.active) || [];
    const slots = availability?.available_slots || [];

    const canSubmit =
        !!selectedBranch &&
        !!selectedCourt &&
        !!selectedDate &&
        !!selectedSlot &&
        (!hasTerms || acceptedTerms) &&
        !bookingLoading;

    // ── Confirmation screen ──
    if (bookingResult) {
        return <BookingConfirmation booking={bookingResult} court={selectedCourt} />;
    }

    // ── Step numbering helper ──
    let stepNum = 0;
    const nextStep = () => ++stepNum;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
            </div>

            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>

                    {/* Step: Branch Selection */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <StepBadge n={nextStep()} />
                                {t("steps.chooseBranch")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <FormField
                                control={form.control}
                                name="branch_id"
                                render={() => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {t("selectBranchPlaceholder")}
                                        </FormLabel>
                                        <Select
                                            onValueChange={handleBranchSelect}
                                            value={selectedBranch ? String(selectedBranch.id) : ""}
                                            disabled={branchesLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-12">
                                                    <SelectValue placeholder={branchesLoading ? "Loading..." : t("selectBranchPlaceholder")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {activeBranches.map((branch) => (
                                                    <SelectItem key={branch.id} value={String(branch.id)}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{branch.name}</span>
                                                            {branch.address && (
                                                                <span className="text-sm text-muted-foreground">{branch.address}</span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Step: Court Selection */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <StepBadge n={nextStep()} />
                                {t("steps.chooseCourt")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {!selectedBranch ? (
                                <EmptyState icon={<MapPin className="w-8 h-8" />} message={t("selectBranchFirst")} />
                            ) : courtsLoading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : activeCourts.length === 0 ? (
                                <EmptyState icon={<AlertCircle className="w-8 h-8" />} message={t("noCourts")} />
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="court_id"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>{t("courtLabel")}</FormLabel>
                                            <Select
                                                onValueChange={handleCourtSelect}
                                                value={selectedCourt ? String(selectedCourt.id) : ""}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder={t("selectCourtPlaceholder")} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {activeCourts.map((court) => {
                                                        const courtPerks = court.perks?.filter((p) => p.active) || [];
                                                        return (
                                                            <SelectItem key={court.id} value={String(court.id)}>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">
                                                                        {court.name} ({formatCurrency(court.price_per_hour)} {t("perHour")})
                                                                    </span>
                                                                    {courtPerks.length > 0 && (
                                                                        <div className="flex gap-1 mt-1">
                                                                            {courtPerks.slice(0, 2).map((perk) => (
                                                                                <span key={perk.id} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                                                    {perk.name}
                                                                                </span>
                                                                            ))}
                                                                            {courtPerks.length > 2 && (
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    +{courtPerks.length - 2} {t("morePerks", { count: courtPerks.length - 2 })}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Court Perks Display (shown when court selected with active perks) */}
                    {selectedCourt && activePerks.length > 0 && (
                        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Tag className="w-4 h-4 mr-2" />
                                    {t("courtPerks")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <CourtPerksDisplay perks={activePerks} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Step: Date Selection */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <StepBadge n={nextStep()} />
                                {t("steps.selectDate")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {!selectedCourt ? (
                                <EmptyState icon={<Clock className="w-8 h-8" />} message={t("selectCourtFirst")} />
                            ) : (
                                <>
                                    <div className="flex justify-center border rounded-xl overflow-hidden py-2 bg-background/50">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={handleDateSelect}
                                            disabled={{ before: new Date() }}
                                            className="rounded-md"
                                        />
                                    </div>
                                    <input type="hidden" {...form.register("date")} />
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Step: Time Slot Selection */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <StepBadge n={nextStep()} />
                                {t("steps.availableSlots")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {!selectedCourt || !selectedDate ? (
                                <EmptyState icon={<Clock className="w-8 h-8" />} message={t("selectCourtAndDate")} />
                            ) : (
                                <div>
                                    <AvailabilityGrid
                                        slots={slots}
                                        selectedSlot={selectedSlot}
                                        onSelect={handleSlotSelect}
                                        isLoading={availabilityLoading}
                                    />
                                    {(form.formState.errors.start_time || form.formState.errors.end_time) && (
                                        <p className="text-[0.8rem] font-medium text-destructive mt-3">
                                            {t("selectAvailableSlot")}
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Step: User Information */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <StepBadge n={nextStep()} />
                                {t("steps.yourInfo")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="user_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                {t("fullNameLabel")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("fullNamePlaceholder")} className="h-12" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="user_phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                {t("phoneLabel")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("phonePlaceholder")} className="h-12" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem className="mt-6">
                                        <FormLabel>{t("notesLabel")}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t("notesPlaceholder")}
                                                className="min-h-[100px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Step: Promo Code */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <StepBadge n={nextStep()} />
                                {t("promoCode")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <PromoCodeInput
                                branchId={selectedBranch ? String(selectedBranch.id) : undefined}
                                selectedCourt={selectedCourt ?? undefined}
                                startTime={selectedSlot?.start_time}
                                endTime={selectedSlot?.end_time}
                            />
                        </CardContent>
                    </Card>

                    {/* Terms and Conditions */}
                    {hasTerms && (
                        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="w-4 h-4 mr-2" />
                                    {t("termsAndConditions")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="terms"
                                        checked={acceptedTerms}
                                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                                    />
                                    <div className="flex flex-col gap-1">
                                        <label
                                            htmlFor="terms"
                                            className="text-sm font-medium leading-none cursor-pointer"
                                        >
                                            {t("termsPrefix")}{" "}
                                            <BookingTermsDialog
                                                terms={bookingTerms!}
                                                trigger={
                                                    <button type="button" className="text-primary underline underline-offset-2 hover:text-primary/80">
                                                        {t("termsLink")}
                                                    </button>
                                                }
                                            />
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Submit Error */}
                    {submitError && (
                        <Card className="border-destructive/50 bg-destructive/5">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 text-destructive">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p className="text-sm font-medium">{submitError}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Submit Button */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <Button
                                type="submit"
                                className="w-full h-14 text-lg font-semibold"
                                disabled={!canSubmit}
                            >
                                {bookingLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        {t("processingBooking")}
                                    </>
                                ) : (
                                    t("confirmBooking")
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            </FormProvider>
        </div>
    );
}

// ── Sub-components ──

function StepBadge({ n }: { n: number }) {
    return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold mr-3 shrink-0">
            {n}
        </div>
    );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
    return (
        <div className="py-12 bg-muted/30 border border-dashed border-border/60 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="text-muted-foreground mb-4">{icon}</div>
            <p className="text-muted-foreground">{message}</p>
        </div>
    );
}
