"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCourtsAPI } from "@/hooks/api/use-courts";
import { useAvailabilityAPI } from "@/hooks/api/use-availability";
import { useBookingsAPI } from "@/hooks/api/use-bookings";
import { bookingFormSchema, BookingFormData, Booking } from "@/schemas/booking.schema";
import { Court } from "@/schemas/court.schema";
import { AvailabilityGrid } from "@/components/book/availability-grid";
import { BookingConfirmation } from "@/components/book/booking-confirmation";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

export function BookingView() {
    const BRANCH_ID = 1; // Hardcoded branch_id for public usage

    const { courts, fetchPublicCourts, loading: courtsLoading } = useCourtsAPI();
    const { availability, fetchAvailability, loading: availabilityLoading } = useAvailabilityAPI();
    const { createBooking, loading: bookingLoading } = useBookingsAPI();

    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<{ start_time: string, end_time: string } | null>(null);
    const [bookingResult, setBookingResult] = useState<Booking | null>(null);

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
        },
    });

    useEffect(() => {
        fetchPublicCourts({ branch_id: BRANCH_ID });
    }, [fetchPublicCourts]);

    // Fetch availability when court or date changes
    useEffect(() => {
        if (selectedCourt && selectedDate) {
            fetchAvailability({
                branch_id: BRANCH_ID,
                court_id: Number(selectedCourt.id),
                date: format(selectedDate, "yyyy-MM-dd")
            });
            setSelectedSlot(null);
            form.setValue("start_time", "");
            form.setValue("end_time", "");
        }
    }, [selectedCourt, selectedDate, fetchAvailability, form]);

    const handleSlotSelect = (slot: { start_time: string, end_time: string }) => {
        setSelectedSlot(slot);
        form.setValue("start_time", slot.start_time);
        form.setValue("end_time", slot.end_time);
        form.clearErrors("start_time");
        form.clearErrors("end_time");
    };

    const onSubmit = async (data: BookingFormData) => {
        const res = await createBooking(data);
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
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Book a Court</h1>
                <p className="text-muted-foreground text-lg">
                    Select your preferred court, date, and time slot to play.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>

                    {/* Step 1 & 2: Court & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-bold mb-6 flex items-center">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs mr-3">1</span>
                                    Choose Court
                                </h3>
                                <FormField
                                    control={form.control}
                                    name="court_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Court</FormLabel>
                                            <Select
                                                onValueChange={(val) => {
                                                    const courtId = Number(val);
                                                    field.onChange(courtId);
                                                    const court = courts.find(c => Number(c.id) === courtId);
                                                    setSelectedCourt(court || null);
                                                }}
                                                value={field.value ? String(field.value) : undefined}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder="Select a court" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {courts.filter(c => c.active).map((court) => (
                                                        <SelectItem key={court.id} value={court.id}>
                                                            {court.name} (${court.price_per_hour}/hr)
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

                        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-bold mb-6 flex items-center">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs mr-3">2</span>
                                    Select Date
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
                    </div>

                    {/* Step 3: Select Time */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-bold mb-6 flex items-center">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs mr-3">3</span>
                                Available Time Slots
                            </h3>

                            {!selectedCourt ? (
                                <div className="py-12 bg-muted/30 border border-dashed border-border/60 rounded-2xl flex flex-col items-center justify-center text-center">
                                    <p className="text-muted-foreground">Please select a court and date to view availability.</p>
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
                                    Please select an available time slot.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Step 4: User Info */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-bold mb-6 flex items-center">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs mr-3">4</span>
                                Your Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="user_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" className="h-12" {...field} />
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
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1234567890" className="h-12" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        type="submit"
                        disabled={bookingLoading || !selectedSlot}
                        className="w-full h-16 text-lg font-bold transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {bookingLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing Booking...
                            </>
                        ) : (
                            "Confirm Booking"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
