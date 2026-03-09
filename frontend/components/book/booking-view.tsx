"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { getDefaultBranchId } from "@/lib/branch";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/format-currency";

export function BookingView() {
    const t = useTranslations("publicBook");
    const BRANCH_ID = getDefaultBranchId();

    const { branches, fetchPublicBranches, loading: branchesLoading } = useBranchesAPI();
    const { courts, fetchPublicCourts, loading: courtsLoading } = useCourtsAPI();
    const { availability, fetchAvailability, loading: availabilityLoading } = useAvailabilityAPI();
    const { createBooking, loading: bookingLoading } = useBookingsAPI();
    const { setting, fetchPublicSettings } = useSettingsAPI();

    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<{ start_time: string, end_time: string } | null>(null);
    const [bookingResult, setBookingResult] = useState<Booking | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const hasTerms = !!((setting as any)?.booking_terms);

    const form = useForm<BookingFormData>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: {
            branch_id: BRANCH_ID,
            court_id: undefined,
            date: format(new Date(), "yyyy-MM-dd"),
            start_time: "",
            end_time: "",
            user_name: "",
            user_phone: "",
            notes: "",
            promo_code: "",
        },
    });

    useEffect(() => {
        fetchPublicBranches();
    }, [fetchPublicBranches]);

    useEffect(() => {
        if (selectedBranch) {
            console.log('Selected branch:', selectedBranch);
            fetchPublicCourts({ branch_id: Number(selectedBranch.id) }).then(result => {
                console.log('Courts fetch result:', result);
                console.log('Courts data:', courts);
            });
            fetchPublicSettings({ branch_id: Number(selectedBranch.id) });
        }
    }, [selectedBranch, fetchPublicCourts, fetchPublicSettings]);

    // Fetch availability when court or date changes
    useEffect(() => {
        if (selectedCourt && selectedDate && selectedBranch) {
            fetchAvailability({
                branch_id: Number(selectedBranch.id),
                court_id: Number(selectedCourt.id),
                date: format(selectedDate, "yyyy-MM-dd")
            });
            setSelectedSlot(null);
            form.setValue("start_time", "");
            form.setValue("end_time", "");
        }
    }, [selectedCourt, selectedDate, selectedBranch, fetchAvailability, form]);

    const handleSlotSelect = (slot: { start_time: string, end_time: string }) => {
        setSelectedSlot(slot);
        form.setValue("start_time", slot.start_time);
        form.setValue("end_time", slot.end_time);
        form.clearErrors("start_time");
        form.clearErrors("end_time");
    };

    const onSubmit = async (data: BookingFormData) => {
        const bookingData = {
            ...data,
            branch_id: selectedBranch ? Number(selectedBranch.id) : BRANCH_ID,
        };
        const res = await createBooking(bookingData);
        const resData: any = res.data;
        if (res.success && resData?.data) {
            setBookingResult({
                id: resData.data.id,
                ...resData.data.attributes
            });
        }
    };

    if (bookingResult) {
        return <BookingConfirmation booking={bookingResult} court={selectedCourt} />;
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground text-lg">
                    {t("subtitle")}
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>

                    {/* Step 1: Branch Selection */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-bold mb-6 flex items-center">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs mr-3">1</span>
                                {t("steps.chooseBranch")}
                            </h3>
                            <Select
                                onValueChange={(val) => {
                                    const branch = branches.find((b: any) => b.id === val);
                                    setSelectedBranch(branch || null);
                                    setSelectedCourt(null); // Reset court when branch changes
                                    form.setValue("court_id", undefined as any); // Reset court in form
                                }}
                                value={selectedBranch?.id || ""}
                                disabled={branchesLoading}
                            >
                                <FormControl>
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder={branchesLoading ? "Loading..." : t("selectBranchPlaceholder")} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {branches.filter((b: any) => b.active).map((branch: any) => (
                                        <SelectItem key={branch.id} value={branch.id}>
                                            <div className="flex flex-col">
                                                <span>{branch.name}</span>
                                                <span className="text-sm text-muted-foreground">{branch.address}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Step 2: Court Selection */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-bold mb-6 flex items-center">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs mr-3">2</span>
                                {t("steps.chooseCourt")}
                            </h3>
                            {!selectedBranch ? (
                                <div className="py-12 bg-muted/30 border border-dashed border-border/60 rounded-2xl flex flex-col items-center justify-center text-center">
                                    <p className="text-muted-foreground">{t("selectBranchFirst")}</p>
                                </div>
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="court_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("courtLabel")}</FormLabel>
                                            <Select
                                                onValueChange={(val) => {
                                                    const courtId = Number(val);
                                                    field.onChange(courtId);
                                                    const court = courts.find(c => Number(c.id) === courtId);
                                                    setSelectedCourt(court || null);
                                                }}
                                                value={field.value ? String(field.value) : ""}
                                                disabled={courtsLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder={t("selectCourtPlaceholder")} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {courts.filter((c: any) => c.active).map((court: any) => (
                                                        <SelectItem key={court.id} value={court.id}>
                                                            <div className="flex flex-col">
                                                                <span>{court.name} ({formatCurrency(court.price_per_hour)} {t("perHour")})</span>
                                                                {(court as any).perks && (court as any).perks.length > 0 && (
                                                                    <div className="flex gap-1 mt-1">
                                                                        {(court as any).perks.filter((p: any) => p.active).slice(0, 2).map((perk: any) => (
                                                                            <span key={perk.id} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                                                {perk.name}
                                                                            </span>
                                                                        ))}
                                                                        {(court as any).perks.filter((p: any) => p.active).length > 2 && (
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {t("morePerks", { count: (court as any).perks.filter((p: any) => p.active).length - 2 })}
                                                                            </span>
                                                                        )}
                                                                    </div>
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
                            )}
                        </CardContent>
                    </Card>

                    {/* Court Perks Display */}
                    {selectedCourt && (selectedCourt as any).perks && (selectedCourt as any).perks.length > 0 && (
                        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <CourtPerksDisplay perks={(selectedCourt as any).perks} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Date Selection */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-bold mb-6 flex items-center">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs mr-3">3</span>
                                {t("steps.selectDate")}
                            </h3>

                                <div className="flex justify-center border rounded-xl overflow-hidden py-2 bg-background/50">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => {
                                            if (date) {
                                                setSelectedDate(date);
                                                form.setValue("date", format(date, "yyyy-MM-dd"));
                                            }
                                        }}
                                        disabled={{ before: new Date() }}
                                        className="rounded-md"
                                        classNames={{
                                            head_cell: "text-muted-foreground w-9 font-normal text-[0.8rem]",
                                            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                            day_today: "bg-accent text-accent-foreground",
                                            day_outside: "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                                            day_disabled: "text-muted-foreground opacity-50",
                                            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                            day_hidden: "invisible",
                                        }}
                                    />
                                </div>
                                {/* Hidden input to track form validation */}
                                <input type="hidden" {...form.register("date")} />
                            </CardContent>
                        </Card>

                    {/* Step 4: Select Time */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-bold mb-6 flex items-center">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs mr-3">4</span>
                                {t("steps.availableSlots")}
                            </h3>

                            {!selectedCourt ? (
                                <div className="py-12 bg-muted/30 border border-dashed border-border/60 rounded-2xl flex flex-col items-center justify-center text-center">
                                    <p className="text-muted-foreground">{t("selectCourtAndDate")}</p>
                                </div>
                            ) : (
                                <AvailabilityGrid
                                    slots={availability?.available_slots || []}
                                    selectedSlot={selectedSlot}
                                    onSelect={handleSlotSelect}
                                    isLoading={availabilityLoading}
                                />
                            )}
                            {(form.formState.errors.start_time || form.formState.errors.end_time) && (
                                <p className="text-[0.8rem] font-medium text-destructive mt-3">
                                    {t("selectAvailableSlot")}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Step 5: User Info */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-bold mb-6 flex items-center">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs mr-3">5</span>
                                {t("steps.yourInfo")}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="user_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("fullNameLabel")}</FormLabel>
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
                                            <FormLabel>{t("phoneLabel")}</FormLabel>
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

                    {/* Step 6: Promo Code */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <PromoCodeInput
                                selectedCourt={selectedCourt}
                                startTime={selectedSlot?.start_time}
                                endTime={selectedSlot?.end_time}
                            />
                        </CardContent>
                    </Card>

                    {/* Terms & Conditions */}
                    {hasTerms && (
                        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="terms"
                                        checked={acceptedTerms}
                                        onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                                    />
                                    <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                                        {t("termsPrefix")}{" "}
                                        <BookingTermsDialog
                                            terms={(setting as any)?.booking_terms ?? null}
                                            trigger={
                                                <button type="button" className="inline-flex items-center gap-1 text-primary underline underline-offset-2 hover:text-primary/80">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    {t("termsLink")}
                                                </button>
                                            }
                                        />
                                    </label>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <Button
                                type="submit"
                                disabled={bookingLoading || !selectedSlot || !selectedBranch || (hasTerms && !acceptedTerms)}
                                className="w-full h-16 text-lg font-bold transition-all hover:-translate-y-0.5 active:translate-y-0"
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
            </Form>
        </div>
    );
}
