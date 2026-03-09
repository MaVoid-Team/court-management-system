"use client";

import { Booking } from "@/schemas/booking.schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { CheckCircle2, CalendarIcon, ClockIcon, MapPinIcon, ReceiptIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Court } from "@/schemas/court.schema";
import { Badge } from "@/components/ui/badge";

interface BookingConfirmationProps {
    booking: Booking;
    court: Court | null;
}

export function BookingConfirmation({ booking, court }: BookingConfirmationProps) {
    if (!booking) return null;

    return (
        <div className="w-full max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center text-center space-y-4 mb-8">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-2 shadow-sm ring-8 ring-emerald-50 dark:ring-emerald-950/30">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Booking Confirmed!</h1>
                <p className="text-muted-foreground text-lg">
                    Thank you, {booking.user_name}. Your court is reserved.
                </p>
            </div>

            <Card className="border-border/60 bg-card/80 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-muted/40 border-b border-border/40 pb-6 pt-6 px-8">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Order #{booking.id.padStart(5, '0')}
                        </span>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-0">
                            {booking.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                            <MapPinIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Court</p>
                            <p className="text-lg font-semibold">{court?.name || `Court ID: ${booking.court_id}`}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-2">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 shrink-0">
                                <CalendarIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Date</p>
                                <p className="font-semibold">{formatDate(booking.date)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shrink-0">
                                <ClockIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Time</p>
                                <p className="font-semibold">{booking.start_time} - {booking.end_time}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border/50">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground/5 text-foreground shrink-0">
                                <ReceiptIcon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Total Amount</p>
                                <p className="text-3xl font-black tracking-tight">{booking.total_price ? formatCurrency(Number(booking.total_price)) : "Free"}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-8 bg-muted/20 border-t border-border/40 gap-4 flex-col sm:flex-row">
                    <Button asChild variant="outline" size="lg" className="w-full font-medium">
                        <Link href="/">Return Home</Link>
                    </Button>
                    <Button onClick={() => window.location.reload()} size="lg" className="w-full font-medium">
                        Book Another Court
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

