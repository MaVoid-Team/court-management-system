"use client";

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { Court, CourtFormData } from "@/schemas/court.schema";
import { PaginationMeta } from "@/schemas/api.schema";
import { buildQueryString } from "@/lib/build-query-string";

export function useCourtsAPI() {
    const [courts, setCourts] = useState<Court[]>([]);
    const [court, setCourt] = useState<Court | null>(null);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const flattenResource = (resource: any): Court => ({
        id: resource.id,
        ...resource.attributes,
    });

    const fetchCourts = useCallback(async (params?: { branch_id?: number; page?: number; per_page?: number }) => {
        setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/admin/courts${query}`);

            if (response.data?.data) {
                setCourts(response.data.data.map(flattenResource));
            }

            const totalCount = Number(response.headers["x-total-count"] || 0);
            const page = Number(response.headers["x-page"] || 1);
            const perPage = Number(response.headers["x-per-page"] || 25);
            const totalPages = Number(response.headers["x-total-pages"] || 1);

            setPagination({ totalCount, page, perPage, totalPages });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch courts");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCourt = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/admin/courts/${id}`);
            if (response.data?.data) {
                const flatCourt = flattenResource(response.data.data);
                setCourt(flatCourt);
                return { success: true, data: flatCourt };
            }
            return { success: false };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch court");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPublicCourts = useCallback(async (params?: { branch_id?: number; page?: number; per_page?: number }) => {
        setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/courts${query}`);

            if (response.data?.data) {
                setCourts(response.data.data.map(flattenResource));
            }

            setPagination(null);
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch courts");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const createCourt = async (data: CourtFormData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post("/api/admin/courts", { court: data });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to create court");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const updateCourt = async (id: string, data: Partial<CourtFormData>) => {
        setLoading(true);
        setError(null);
        try {
            await api.patch(`/api/admin/courts/${id}`, { court: data });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to update court");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const deleteCourt = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/api/admin/courts/${id}`);
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to delete court");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    return {
        courts,
        court,
        pagination,
        loading,
        error,
        fetchCourts,
        fetchPublicCourts,
        fetchCourt,
        createCourt,
        updateCourt,
        deleteCourt,
    };
}
