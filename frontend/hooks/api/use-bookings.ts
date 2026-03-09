"use client";

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { Booking, BookingFormData } from "@/schemas/booking.schema";
import { PaginationMeta } from "@/schemas/api.schema";
import { buildQueryString } from "@/lib/build-query-string";

export function useBookingsAPI() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [booking, setBooking] = useState<Booking | null>(null);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const flattenResource = (resource: any): Booking => ({
        id: resource.id,
        ...resource.attributes,
    });

    const fetchBookings = useCallback(async (params?: {
        branch_id?: number;
        court_id?: number;
        date?: string;
        status?: string;
        page?: number;
        per_page?: number
    }, options?: { skipStateUpdate?: boolean }) => {
        if (!options?.skipStateUpdate) {
            setLoading(true);
        }
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/admin/bookings${query}`);

            const fetchedBookings = response.data?.data ? response.data.data.map(flattenResource) : [];
            
            if (!options?.skipStateUpdate) {
                setBookings(fetchedBookings);

                const totalCount = Number(response.headers["x-total-count"] || 0);
                const page = Number(response.headers["x-page"] || 1);
                const perPage = Number(response.headers["x-per-page"] || 25);
                const totalPages = Number(response.headers["x-total-pages"] || 1);

                setPagination({ totalCount, page, perPage, totalPages });
            }
            
            return { success: true, data: fetchedBookings };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch bookings");
            return { success: false, error: err };
        } finally {
            if (!options?.skipStateUpdate) {
                setLoading(false);
            }
        }
    }, []);

    const fetchBooking = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/admin/bookings/${id}`);
            if (response.data?.data) {
                const flatBooking = flattenResource(response.data.data);
                setBooking(flatBooking);
                return { success: true, data: flatBooking };
            }
            return { success: false };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch booking");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    // Public endpoint
    const createBooking = async (data: BookingFormData) => {
        setLoading(true);
        setError(null);
        try {
            const { branch_id, ...bookingData } = data;
            const response = await api.post("/api/bookings", {
                branch_id,
                booking: bookingData
            });
            return { success: true, data: response.data };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to create booking");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const updatePaymentStatus = async (id: string, payment_status: "pending" | "paid" | "refunded") => {
        setLoading(true);
        setError(null);
        try {
            await api.patch(`/api/admin/bookings/${id}`, { booking: { payment_status } });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to update payment status");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.patch(`/api/admin/bookings/${id}`, { cancel: true });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to cancel booking");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    return {
        bookings,
        booking,
        pagination,
        loading,
        error,
        fetchBookings,
        fetchBooking,
        createBooking,
        updatePaymentStatus,
        cancelBooking,
    };
}
