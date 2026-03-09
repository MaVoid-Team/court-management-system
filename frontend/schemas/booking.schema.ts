import { z } from "zod";

export const bookingSchema = z.object({
    id: z.string(),
    branch_id: z.number(),
    court_id: z.number(),
    user_name: z.string(),
    user_phone: z.string(),
    date: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    total_price: z.string().nullable().optional(),
    original_price: z.string().nullable().optional(),
    discount_amount: z.string().nullable().optional(),
    hours: z.number().nullable().optional(),
    status: z.enum(["confirmed", "cancelled"]),
    payment_status: z.enum(["pending", "paid", "refunded"]).nullable().optional(),
    notes: z.string().nullable().optional(),
    promo_code_id: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type Booking = z.infer<typeof bookingSchema>;

export const bookingFormSchema = z.object({
    branch_id: z.number(),
    court_id: z.number(),
    court_price: z.number().optional(),
    user_name: z.string().min(1, "Name is required"),
    user_phone: z.string().min(10, "Phone number is required"),
    date: z.string(),
    start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    notes: z.string().optional(),
    promo_code: z.string().optional(),
}).refine(
    (data) => {
        return data.end_time > data.start_time;
    },
    {
        message: "End time must be after start time",
        path: ["end_time"],
    }
);

export type BookingFormData = z.infer<typeof bookingFormSchema>;

export const bookingUpdateSchema = z.object({
    payment_status: z.enum(["pending", "paid", "refunded"]),
});

export type BookingUpdateData = z.infer<typeof bookingUpdateSchema>;
